import logging
import threading
import os


class Tasks(object):
    __instance = None
    __tasks = None
    __thread_lock = threading.Lock()

    @classmethod
    def getInstance(cls):
        """ Static access method. """
        logging.debug("getInstance")
        if Tasks.__instance is None:
            Tasks()
        return Tasks.__instance

    def __init__(self):
        """ Virtually private constructor. """
        if Tasks.__instance is not None:
            raise Exception("This class is a singleton!")
        else:
            Tasks.__instance = self

    def init(self):
        logging.debug(f"Tasks init: ")
        Tasks.__thread_lock = threading.Lock()
        Tasks.__tasks = dict()

    # TODO: Tasks is not right place for deleting Image file. Do it in bma_utils
    def cleanup(self, taskId):
        # global thread_lock
        Tasks.__thread_lock.acquire()
        task = Tasks.__tasks.get(taskId)

        logging.debug(f"cleanup: Task: {task}")

        if task:
            if task['count'] > 1:
                task['count'] = task['count'] - 1
                Tasks.__tasks[taskId] = task
            else:
                path1 = task['imagePath']
                logging.debug(f"Deleting the file {path1}")
                os.system(f'rm {path1}')

        Tasks.__thread_lock.release()
        return Tasks.__tasks[taskId]

    def getTask(self, taskId):
        Tasks.__thread_lock.acquire()
        task = Tasks.__tasks.get(taskId)
        logging.debug(f"getTask: task: {task}")
        Tasks.__thread_lock.release()

        return task


    def createTask(self, taskId, targetFileName):
        Tasks.__thread_lock.acquire()
        # logging.debug("gen_iso_embedded_ks: lock acquired!")
        task = Tasks.__tasks.get(taskId)
        if not task:
            logging.debug(f"gen_iso_embedded_ks: creating new task for {taskId}")
            task = {"count": 1, "filename": targetFileName, "status": "In-Progress"}
            Tasks.__tasks[taskId] = task
            Tasks.__thread_lock.release()
            return task, False
        else:
            logging.debug(f"gen_iso_embedded_ks: incrementing the count for: {task}")
            task["count"] = 1 + task["count"]
            Tasks.__tasks[taskId] = task
            Tasks.__thread_lock.release()
            logging.debug(f"gen_iso_embedded_ks: Returning as the request already initiate by previous call")
            return task, True

    def updateTaskStatus(self, taskId, task):

        # global thread_lock

        Tasks.__thread_lock.acquire()

        # global tasks
        # task = Tasks.__tasks.get(taskId)
        Tasks.__tasks[taskId] = task

        Tasks.__thread_lock.release()
