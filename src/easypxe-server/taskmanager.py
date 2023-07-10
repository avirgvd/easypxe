from tinydb import TinyDB, Query
import threading
import queue
import logging
import time
import json
import random
import concurrent.futures
import datetime

# TODO the max deployment count should be configurable by user
MAX_DEPL_COUNT = 50


def updateSubTaskProgress(item):
    # Get current task progress
    task_query = Query()
    task_id = item['taskId']
    sub_task_id = item['subTaskId']
    tasks = TaskManager.__tasksDB.search((task_query.taskId == task_id) &
                                         (task_query.subTaskId == sub_task_id))

    if len(tasks) == 1:
        sub_task = tasks[0]
    elif len(tasks) > 1:
        logging.error(
            f"Duplicate sub task found with task:{task_id} and subtask:{sub_task_id}. Proceeding with first item")
        sub_task = tasks[0]
    else:
        # If no matching tasks found then assume this is new task creation
        sub_task = None
        logging.error(f"No task found with taskId: {task_id} and subTaskId: {sub_task_id}")

    if sub_task:
        updated_progress = 0
        if item['progress'] == 1:
            # ensure that progress is not greater than 9 when input arg progress == 1
            if sub_task["progress"] != 9:
                updated_progress = item['progress'] + sub_task["progress"]
        elif item['progress'] == 10:
            updated_progress = 10
        else:
            # Do nothing. This must be due to error
            logging.error(f"Invalid or Error progress value: {item['progress']}")
            updated_progress = sub_task["progress"]

        # Update the subtask calculated progress
        item['progress'] = updated_progress

    return item

class TaskManager(object):
    __instance = None
    __imageImportQueue = None
    __deploymentQueue = None
    __taskUpdateQueue = None
    __importThread = None
    __taskUpdateThread = None
    __threadPool = None
    __tasksDB = None
    __tasksDBPath = None

    @classmethod
    def getInstance(cls):
        """ Static access method. """
        logging.debug("getInstance")
        if TaskManager.__instance is None:
            TaskManager()
        return TaskManager.__instance

    def __init__(self):
        """ Virtually private constructor. """
        if TaskManager.__instance is not None:
            raise Exception("This class is a singleton!")
        else:
            TaskManager.__instance = self

    def init(self, imageImportHandler, tasksDBPath):
        logging.debug(f"TaskManager init: tasksDBPath: {tasksDBPath}")
        TaskManager.__tasksDB = TinyDB(tasksDBPath)
        TaskManager.__tasksDBPath = tasksDBPath
        TaskManager.__imageImportQueue = queue.Queue(maxsize=10)
        TaskManager.__deploymentQueue = queue.Queue(maxsize=MAX_DEPL_COUNT)
        TaskManager.__taskUpdateQueue = queue.Queue(maxsize=10)

        # For image import, have only 1 thread serving the queue
        # turn-on the worker thread
        TaskManager.__importThread = threading.Thread(target=TaskManager.__imageImportWorker, args={imageImportHandler})
        TaskManager.__importThread.start()

        # Thread for safely updating tasks db using queue
        TaskManager.__taskUpdateThread = threading.Thread(target=TaskManager.__taskUpdateWorker)
        TaskManager.__taskUpdateThread.start()

        TaskManager.__threadPool = concurrent.futures.ThreadPoolExecutor(max_workers=MAX_DEPL_COUNT)

    def exit(self):
        logging.info("exit: shutting down the threads!")
        TaskManager.__threadPool.shutdown()
        TaskManager.__importThread.join()

    # TODO Need relook at task ID generation
    # Creates the new task and push it to the job queue
    def createTask(self, taskType, data):
        logging.debug("createTask: START")
        task_id = random.randint(1001, 999999)

        # Convert timestamp to milliseconds
        date_now = datetime.datetime.timestamp(datetime.datetime.now())

        task_data = {}

        if taskType == "IMAGE_IMPORT":
            logging.debug("createTask: IMAGE_IMPORT type")
            # TODO add code here
            task_data = {
                "type": "IMAGE_IMPORT",
                "name": "Image upload",
                "taskId": task_id,
                "subTaskId": -1,
                "progress": 0,
                "status": "Initiated",
                "message": "",
                "startTime": date_now,
                "endTime": date_now,
                "data": data["data"]
            }

            # Add subtask item to the tasksDB
            TaskManager.__taskUpdateQueue.put(task_data, block=True)

            # Now add the subtask to the job queue
            TaskManager.__imageImportQueue.put(task_data)
        elif taskType == "DEPLOYMENT":
            logging.debug("createTask: DEPLOYMENT type")
            # subTaskId = -1 for parent task item
            task_data = {
                "type": "DEPLOYMENT",
                "name": data["name"],
                "taskId": task_id,
                "subTaskId": -1,
                "progress": 0,
                "status": "Initiated",
                "message": "Initiated",
                "startTime": date_now,
                "endTime": date_now,
                "data": {
                    "deployData": data
                }
            }

            # Add parent deployment task record in queue for TaskDB
            TaskManager.__taskUpdateQueue.put(task_data, block=True)

            # Now add sub-tasks into queue for TasksDB
            subtask_id = 0
            for host in data["hosts"]:
                logging.debug("bmc:deploy: host: " + json.dumps(host))
                # update_task_status(task_id, subtask_id, "Initiated", "", 1)

                sub_task_data = {
                    "type": "DEPLOYMENT",
                    "taskId": task_id,
                    "subTaskId": subtask_id,
                    "progress": 0,
                    "status": "Queued",
                    "message": "Queued",
                    "startTime": date_now,
                    "endTime": date_now,
                    "data": {
                        "host": host,
                        "deploymentMode": data["deploymentMode"]
                    }
                }

                if 'rmDetails' in data:
                    sub_task_data['data']['rmDetails'] = data['rmDetails']

                # Add subtask item to the tasksDB
                TaskManager.__taskUpdateQueue.put(sub_task_data, block=True)

                # Now add the subtask to the job queue
                TaskManager.__deploymentQueue.put(sub_task_data, block=True)

                subtask_id = subtask_id + 1

        # Return parent task data
        return task_data

    def add(self, taskdata):
        logging.info(f"add: taskdata: {taskdata}")

        # self.db.insert(taskdata)

        if taskdata['type'] == "IMAGE_IMPORT":
            logging.info(f"add: to image import queue")
            TaskManager.__imageImportQueue.put(taskdata)
            logging.info(f"add: taskdata: 3")
        elif taskdata['type'] == "DEPLOYMENT":
            logging.info(f"add: to deployment queue")
            TaskManager.__deploymentQueue.put(taskdata)
            logging.info(f"add: to deployment queue - AFTER")

        return True

    def start(self, taskType, worker):
        logging.info(f"start: {taskType}")

        if taskType == "DEPLOYMENT":
            # For deployment, have MAX_DEPL_SIZE threads to support MAX_DEPL_SIZE parallel deployments
            try:
                while True:
                    logging.debug("Before queue get")
                    task_data = TaskManager.__deploymentQueue.get(block=False)
                    logging.debug(f"After queue get: task_data: {task_data}")
                    # let queue know that the task item processing is done.
                    # However the actual deployment will be carried out by the threads
                    TaskManager.__threadPool.submit(worker, task_data)
                    TaskManager.__deploymentQueue.task_done()
                    logging.debug("After queue get")
            except queue.Empty as empty_ex:
                #     the queue is empty so exit
                logging.debug("The deployment queue is empty so exit")

        elif taskType == "IMAGE_IMPORT":
            logging.debug("start: Image Import task")
            if TaskManager.__importThread.is_alive():
                # Do nothing as there is already a thread to pick the task from queue
                logging.debug("Do nothing as there is already a thread to pick the task from queue")
                logging.debug(TaskManager.__importThread)
            else:
                logging.debug("Starting the thread!")
                TaskManager.__importThread.start()
                logging.debug("Started the thread!")

        else:
            logging.debug("Nothing to start for this type")

    def queueStatus(self, taskType):

        if taskType == "DEPLOYMENT":
            return TaskManager.__deploymentQueue.qsize()
        elif taskType == "IMAGE_IMPORT":
            return TaskManager.__imageImportQueue.qsize()

    def getAllTasksData(self):
        logging.debug("getAllTasksData")
        # return only parent task data
        task_query = Query()

        tasks = TaskManager.__tasksDB.search((task_query.subTaskId == -1))
        reversed_tasks = list()
        for task in tasks:
            reversed_tasks.insert(0, task)

        # logging.debug(f"Reversed tasks: {reversed_tasks}")

        return reversed_tasks

    def getTaskData(self, taskId):
        # This query returns task items along with subtask items if any that are matching with input taskId
        task_query = Query()
        # Get parent tasks first which has subTaskId = -1
        tasks = TaskManager.__tasksDB.search((task_query.taskId == taskId) &
                                             (task_query.subTaskId == -1))

        # logging.debug(f"getTaskData: tasks: {tasks}")

        parent_task = {}
        # The query should result only one item. Duplicate task entries should not exist
        if len(tasks) == 1:
            parent_task = tasks[0]
        elif len(tasks) > 1:
            logging.error("Duplicate task entries found. Proceeding with first item...")
            parent_task = tasks[0]
        else:
            # No matching task found
            logging.debug(f"No matching task found with taskId: {taskId}")
            return {}

        task_query = Query()
        sub_tasks = TaskManager.__tasksDB.search((task_query.taskId == taskId) &
                                                 (task_query.subTaskId != -1))

        parent_task['subTasks'] = sub_tasks
        # logging.debug(f"Returning task data: {parent_task}")
        return parent_task

    def getSubTask(self, taskId, subTaskId):

        task_query = Query()
        tasks = TaskManager.__tasksDB.search((task_query.taskId == taskId) &
                                             (task_query.subTaskId == subTaskId))

        if len(tasks) == 1:
            return tasks[0]
        elif len(tasks) > 1:
            logging.error(
                f"Duplicate sub task found with task:{taskId} and subtask:{subTaskId}. Proceeding with first item")
            return tasks[0]
        else:
            return {}

    def updateTaskData(self, taskId, subTaskId, data):
        logging.debug(f"taskId: {taskId} subTaskId: {subTaskId} data: {data}")

        try:
            # # Get current task progress
            # task_query = Query()
            # tasks = TaskManager.__tasksDB.search((task_query.taskId == taskId) &
            #                                      (task_query.subTaskId == subTaskId))
            #
            # logging.debug(tasks)
            #
            # sub_task = {}
            # if len(tasks) == 1:
            #     sub_task = tasks[0]
            # elif len(tasks) > 1:
            #     logging.error(
            #         f"Duplicate sub task found with task:{taskId} and subtask:{subTaskId}. Proceeding with first item")
            #     sub_task = tasks[0]
            # else:
            #     sub_task = {}
            #     logging.error(f"No task found with taskId: {taskId} and subTaskId: {subTaskId}")
            #     return

            task_update = data
            task_update['taskId'] = taskId
            task_update['subTaskId'] = subTaskId
            TaskManager.__taskUpdateQueue.put(task_update, block=True)
        except Exception as ex:
            logging.error(f"Failed to update the tasks data: {ex}")

    # progress = 10 indicates end of the task
    # progress = -1 indicates error in task
    # progress = 1 for incrementing the task progress
    def updateTaskStatus(self, taskId, subTaskId, status, message, progress, start=False):

        logging.debug(
            f"taskId: {taskId} subTaskId: {subTaskId} status: {status} message: {message} progress: {progress}")

        try:


            # updated_progress = 0
            end_time_stamp = datetime.datetime.timestamp(datetime.datetime.now())
            # start_time_stamp = datetime.datetime.timestamp(datetime.datetime.now())

            # if start:
            #     # convert timestamp to milliseconds
            #     start_time_stamp = datetime.datetime.timestamp(datetime.datetime.now())
            # else:
            #     start_time_stamp = sub_task['startTime']

            # if end:
            #     # This means the task completed/ convert to milliseconds
            #     end_time_stamp = datetime.datetime.timestamp() * 1000



            task_update = {
                "taskId": taskId,
                "subTaskId": subTaskId,
                "status": status,
                "message": message,
                "endTime": end_time_stamp,
                "progress": progress
            }

            # logging.debug(f"task: {sub_task}")
            # logging.debug(f"task_update: {task_update}")

            TaskManager.__taskUpdateQueue.put(task_update, block=True)
        except Exception as ex:
            logging.error(f"Failed to update the tasks status: {ex}")
            logging.exception(ex)

    # def updateTask(self, task):
    #
    #     # Add task update to the queue
    #     TaskManager.__taskUpdateQueue.put(task, block=True)

    @classmethod
    def __taskUpdateWorker(cls):
        logging.debug("__taskUpdateWorker")

        # Fetches task updates from the queue and safely update the tasks table

        try:
            while True:
                logging.debug(f"__taskUpdateWorker waiting in queue")
                item = TaskManager.__taskUpdateQueue.get(block=True, timeout=None)
                logging.debug(f"__taskUpdateWorker item: {item}")
                # the item can be parent task when task is first created or subtask when
                # subtask progress is updated from deployment threads

                # es_client = ESClient.getInstance()
                # es_client.upsert("tasks", item['taskId'], item)

                # If this is a subitem then update subtask progress
                if item['subTaskId'] != -1:
                    item = updateSubTaskProgress(item)

                task_query = Query()
                TaskManager.__tasksDB.upsert(item, (task_query.taskId == item['taskId']) &
                                             (task_query.subTaskId == item['subTaskId']))
                # logging.debug(f"all tasks after upsert: {TaskManager.__tasksDB.all()}")

                # Update overall task progress with item level progress info
                # Skip of this update is not for progress
                # Calculate overall progress for task only when the update item is a subtask and not parent task
                # donot calculate overall progress if item progress == 0
                if item['subTaskId'] != -1 and "progress" in item and item['progress'] > 0:

                    # Now update the master task with progress
                    task_query = Query()
                    # Get parent tasks first which has subTaskId = -1
                    tasks = TaskManager.__tasksDB.search((task_query.taskId == item['taskId']) &
                                                         (task_query.subTaskId != -1))

                    logging.debug(f"getTaskData: All tasks for {item['taskId']}: {tasks}")
                    sum_progress = 0
                    subtasks_count = len(tasks)
                    errors = False
                    for task in tasks:
                        sum_progress += task["progress"]
                        if task['status'] == "Error":
                            errors = True

                    overall_progress = int(sum_progress / subtasks_count)
                    logging.debug(f"Overall progress for task: {item['taskId']} is: {overall_progress}")

                    overall_status = "Initiated"
                    if overall_progress == 10:
                        overall_status = "Completed"
                    elif overall_progress > 0:
                        if(errors):
                            overall_status = "Errors"
                        else:
                            overall_status = "In-Progress"

                    task_query = Query()
                    TaskManager.__tasksDB.upsert(
                        {
                            'taskId': item['taskId'],
                            'subTaskId': -1,
                            'progress': overall_progress,
                            "status": overall_status,
                            "endTime": datetime.datetime.timestamp(datetime.datetime.now())
                        },
                        (task_query.taskId == item['taskId']) & (task_query.subTaskId == -1))

                TaskManager.__taskUpdateQueue.task_done()
        except Exception as ex:
            logging.debug(f"Failed to update task data: {ex}")

    @staticmethod
    def __imageImportWorker(imageImportHandler):

        logging.info(f'imageImportQueue worker START')

        # abc = {'type': 'IMAGE_IMPORT', 'taskName': 'Image upload', 'taskId': 929448, 'subTaskId': -1, 'progress': 0,
        #        'status': 'Initiated', 'message': '', 'startTime': 1628082674137.657, 'endTime': None,
        #        'data': {
        #         'data': {'osType': 'ESXi', 'file': 'VMware_ESXi_7.0.0_15843807_HPE_700.0.0.10.5.0.108_April2020.iso',
        #                  'name': 'VMware_ESXi_7.0.09999'},
        #         'filepath': '/tmp/VMware_ESXi_7.0.0_15843807_HPE_700.0.0.10.5.0.108_April2020.iso'}}

        try:
            while True:
                try:
                    item = TaskManager.__imageImportQueue.get(block=True, timeout=45)
                    logging.debug(f'imageImportQueue working on {item}')
                    logging.debug(f'imageImportQueue working on ... {item["data"]}')
                    logging.debug(f'imageImportQueue working on {item["data"]["filepath"]}')
                    TaskManager.getInstance().updateTaskStatus(item['taskId'], item['subTaskId'],
                                                               "Initiated", "Processing the uploaded image.", 1,
                                                               start=True)
                    ret = imageImportHandler(item['taskId'], item["data"]["data"], item["data"]["filepath"])
                    TaskManager.getInstance().updateTaskStatus(item['taskId'], item['subTaskId'],
                                                               "Completed", "The uploaded image is now available.", 10)

                    logging.debug(f'imageImportQueue finished {item}')
                    TaskManager.__imageImportQueue.task_done()
                except queue.Empty as ex:
                    logging.debug(f"Queue timed out. Getting into queue again! : {ex}")
                except Exception as ex:
                    logging.debug(f"Failed to process uploaded image due to exception: {ex}")

        except Exception as ex:
            logging.info(f"Exception during image import {ex}")

        logging.info("__imageImportWorker: Exiting the thread")
        return

    @staticmethod
    def __deploymentWorker(worker):

        while True:
            try:
                # Wait for 5 minutes on queue, then exit
                item = TaskManager.__deploymentQueue.get(block=True, timeout=300)
                logging.debug(f'deploymentWorker working on {item}')
                logging.debug(f'deploymentWorker finished {item}')
                TaskManager.getInstance().updateTaskStatus(item['taskId'], item['subTaskId'],
                                                           "Initiated", "Deployment initiated.", 1, start=True)
                worker(item)
                TaskManager.getInstance().updateTaskStatus(item['taskId'], item['subTaskId'],
                                                           "Completed", "Deployment completed successfully.", 10)
                TaskManager.__deploymentQueue.task_done()
            except queue.Empty as ex:
                logging.debug(f"Queue timed out. Getting into queue again! : {ex}")
            except Exception as ex:
                logging.info("Exiting the worker thread for deployment due to exception")
                TaskManager.getInstance().updateTaskStatus(item['taskId'], item['subTaskId'],
                                                           "Failed", f"Failed with error: {ex}.", -1)

        logging.info("__deploymentWorker: Exiting the thread")
        return

    @staticmethod
    def test(data, path):
        logging.debug("Inside test worker")
        time.sleep(10)
        logging.debug("End test worker")


if __name__ == '__main__':
    print("TaskManager main: ")
    import sys

    logging.basicConfig(stream=sys.stdout, level=logging.DEBUG)

    taskManager = TaskManager.getInstance()
    taskManager.init(TaskManager.test)

    task_data = {"type": "IMAGE_IMPORT", "data": {"data": {"data": "isdata"}, "filepath": "filepath11"}}
    logging.debug(taskManager.queueStatus("IMAGE_IMPORT"))
    logging.debug("size")
    logging.debug(taskManager.queueStatus("IMAGE_IMPORT"))
    taskManager.add(task_data)
    logging.debug(taskManager.queueStatus("IMAGE_IMPORT"))

    taskManager.start("IMAGE_IMPORT", TaskManager.test)
