# -*- coding: utf-8 -*-

import json

import os
import shutil
import uuid
import logging

import bma_config as config
import ospackages as ospackages
import pxe_service

# You can use username/password or sessionID for authentication.
# Be sure to inform a valid and active sessionID.
import isoimages
from taskmanager import TaskManager

# osActivitiesConfig = config.Activities()
defaultConfig = config.DefaultConfig()


def init(hostname):
    try:
        # Set up cert directory and config directory if not present
        directories = ['/usr/local/easypxe/conf', '/usr/local/easypxe/conf/certs']
        for directory in directories:
            if not os.path.exists(directory):
                os.mkdir(directory)

        # Check for the default config files. Create new config with its default contents if file does not exists.
        defaultConfigs = {
            '/usr/local/easypxe/conf/environments.json': '[]',
            '/usr/local/easypxe/conf/pxe_service.conf': '{}',
            '/usr/local/easypxe/conf/ospackages.json': '[]',
            '/usr/local/easypxe/conf/bma_settings.json': json.dumps({
                "ov_certs_path": "/usr/local/easypxe/conf/certs",
                "temp_dir": "/tmp",
                "ks_basedir": "/usr/local/easypxe/kickstarts",
                "http_server": "local",
                "local_http_root": defaultConfig.htmlPath,
                "http_file_server_url": "http://127.0.0.1/",
                "http_pxe_base_url": "http://127.0.0.1/"
            }),
            '/usr/local/easypxe/conf/settings.json': json.dumps({
                "logFilePath": "/usr/local/easypxe/logs/easypxe11.log",
                "logLevel": "DEBUG",
                "language": "English (US)",
                "httpFileServer": "Local",
                "themeMode": "Dark",
                "deplQueueSize": 50,
                "mode": "Central"
            })
        }
        for configFile, defaultContent in defaultConfigs.items():
            if not os.path.exists(configFile):
                with open(configFile, 'w') as newFile:
                    newFile.write(defaultContent)

        config.BMASettings().set("http_file_server_url", "https://" + hostname + "/images/")
        config.BMASettings().set("http_pxe_base_url", "http://" + hostname + "/pxe/")
        config.BMASettings().set("hostname", hostname)
        # config.BMASettings().set("http_file_server_url", "https://" + hostname + "/images/")

        #    fin = open('../config/ksfiles.json', 'r')
        #    global ksfiles_settings
        #    ksfiles_settings = json.load(fin)
        #    #print(ksfiles_settings)
        #    fin.close()

        #    fin = open('../config/ospackages.json', 'r')
        #    global ospackages_settings
        #    ospackages_settings = json.load(fin)
        #    print(ospackages_settings)
        #    fin.close()

        ospackages.init('/usr/local/easypxe/conf/ospackages.json', '/usr/local/easypxe/scripts/scripts.json')

        # esclient = ESClient.getInstance()
        # esclient.init('http://localhost:9200')

        taskManager = TaskManager.getInstance()
        taskManager.init(createOSPackage, "/usr/local/easypxe/conf/tasksdb.json")
    except Exception as err:
        logging.exception(err)
        raise err


def importImage(taskdata):
    logging.info("addTask: START")
    task_manager = TaskManager.getInstance()
    task_data = task_manager.createTask("IMAGE_IMPORT", taskdata)
    logging.debug(f"importImage: task_data: {task_data}")

    return task_manager.start("IMAGE_IMPORT", createOSPackage)


def createOSPackage(taskId, ospackagedata, orig_iso_path):
    try:
        logging.info("createOSPackage: Generating OS package for: ")
        logging.info(ospackagedata)

        ospackitem = json.loads('{ "uri": "", "package": "", "osType":  "", "ISO_http_path": "" }')

        ospackitem['uri'] = uuid.uuid4().hex
        ospackitem['package'] = ospackagedata['name']
        ospackitem['osType'] = ospackagedata['osType']
        ospackitem['source'] = ospackagedata['file']
        ospackitem['purpose'] = ospackagedata['imagePurpose']
        ospackitem['syncStatus'] = 'Local'

        # target_dir = config.BMASettings().get("local_http_root")
        images_root = "/usr/share/nginx/html/images"
        target_dir = images_root

        host_os_distro = defaultConfig.hostDistroName

        logging.debug("###### Before calling geniso")

        if ospackitem['purpose'] in ['redfish', 'pxe', 'drivers']:
            result = isoimages.geniso(ospackitem['uri'], ospackagedata['osType'], orig_iso_path, target_dir, ospackitem['purpose'], host_os_distro)
        # elif ospackitem['purpose'] == 'pxe':
        #     result = isoimages.geniso(ospackitem['uri'], ospackagedata['osType'], orig_iso_path, target_dir, ospackitem['purpose'], host_os_distro)
        # elif ospackitem['purpose'] == 'drivers':
        #     result = isoimages.geniso(ospackitem['uri'], ospackagedata['osType'], orig_iso_path, target_dir, ospackitem['purpose'], host_os_distro)
        else:
            # Purpose is missing
            raise Exception("Image purpose not specified")


        logging.debug("###### After calling geniso")
        if 'targetISOPath' in result:
            target_iso_path = result['targetISOPath']
            task_manager = TaskManager.getInstance()
            # Update the task info with generated ISO file name
            task_manager.updateTaskData(taskId, -1, {'filepath': os.path.basename(target_iso_path)})
            ospackitem['ISO_http_path'] = os.path.basename(target_iso_path)
            ospackages.setOSPackage(ospackitem)
            return {"result": ospackitem, "error": ""}

        return {"result": {}, "error": "Unsupported OS type"}
    except Exception as err:
        logging.exception(err)
        raise Exception from err


def getDashboardData():
    try:
        # ovcount = len(ov_appliances)

        total_storage, used_storage, free_storage = shutil.disk_usage('/')
        storage_stats = {
            "total": (total_storage // (2**30)),
            "free": (free_storage // (2**30)),
            "used": (total_storage // (2**30)) - (free_storage // (2**30))
        }

        pxe_status = pxe_service.pxeServicesStatus()
        os_packages_stats = ospackages.getOSPackagesStats()

        tasks = getAllTasks()
        return {"tasks": tasks, "storageStats": storage_stats, "osPackages": os_packages_stats, 'pxeStatus': pxe_status}
    except Exception as err:
        logging.exception(err)
        raise Exception from err


def getOSPackageById(packageId):
    try:
        return ospackages.getOSPackageById(packageId)
    except Exception as err:
        logging.exception(err)
        raise Exception from err


def deleteOSPackageById(packageId):
    try:
        hostOSdistro = defaultConfig.hostDistroName
        return ospackages.deleteOSPackageById(packageId, hostOSdistro)
    except Exception as err:
        logging.exception(err)
        raise Exception(str(err))




# TASK is any long running operation that runs asynchrously as a thread/process
# Each long running task shall be assigned with TASKID so that the caller can
# poll for the task status using this identifier

# Tasks lookup table for storing task progress
# Lookup this table using TASKID for querying task progress information

# VALID STATES
# Main Task Status: What are the expected values (Running/Success/Fail)
# Sub Task status: What are the expected values (Complete/Running/Error/)

# TODO Testing pending - 10-Aug-2021
def getTaskStatus(taskId):
    '''
    The overall task status should be either Running, Success, or Fail
    The subtask status should be either Error, Complete, or In-Progress
    '''
    try:

        task_manager = TaskManager.getInstance()
        task_data = task_manager.getTaskData(taskId)

        # return of task data not found
        if len(task_data) == 0:
            return {}

        # taskStatus = osActivitiesConfig.getTaskStatus(taskid)
        logging.debug(f"Task[{taskId}]: status: {task_data['status']}")
        overallProgress = 0
        if not task_data.get("subTasks"):
            logging.debug(f"No sub tasks found so returning task_data")
            return task_data

        totalTasks = subTasksToComplete = len(task_data["subTasks"])
        subTasksError = 0
        # failedHosts = []
        running = 0
        completed = 0
        error = 0
        for subTask in task_data["subTasks"]:
            logging.debug(f"subTask: ID {subTask['subTaskId']} status: {subTask['status']}")
            # logging.debug(f"{subTask['data']['hostName']} progress: {subTask['progress']}, status: {subTask['status']}")
            if subTask["status"].lower() == "complete":
                completed += 1
            elif subTask["status"].lower() == "in-progress":
                running += 1
            elif subTask["status"].lower() == "error":
                error += 1

            overallProgress += subTask["progress"]
            if subTask["status"].lower() == "complete" or subTask["status"].lower() == "error":
                subTasksToComplete -= 1
                if subTask["status"].lower() == "error":
                    subTasksError += 1
                    # failedHosts.append(subTask["hostName"])
        task_data['progress'] = round(overallProgress / totalTasks)
        if running > 0:
            task_data["status"] = "Running"
        elif error > 0:
            task_data["status"] = "Failed"
            # failedHosts = ", ".join(failedHosts)
            errorMsg = f"Task {taskId} failed. Total {subTasksError} hosts failed to deploy."
            task_data["errorMsg"] = errorMsg
        elif completed > 0:
            task_data["status"] = "Completed"

        # if subTasksToComplete == 0 and subTasksError == 0:
        #    taskStatus["status"] = "Success"
        # elif subTasksToComplete == 0 and subTasksError > 0:
        #    taskStatus["status"] = "Fail"
        return task_data
        logging.exception(err)
    except Exception as err:
        raise Exception from err


def getScripts(osType):
    return ospackages.getScripts(osType)


def getSupportedOSList():
    try:
        # return config.OSPackage().getSupportedOSList()
        return ospackages.getSupportedOSList()
    except Exception as err:
        logging.exception(err)
        raise Exception from err


def getAllTasks():
    try:
        # return osActivitiesConfig.getAllTasks()
        return TaskManager.getInstance().getAllTasksData()
    except Exception as err:
        logging.exception(err)
        raise Exception from err


def getURLforOSPackage(OSPackage):
    try:
        basehttpurl = config.BMASettings().get("http_file_server_url")

        ospackagedata = ospackages.getOSPackage(OSPackage)

        if ospackagedata != {}:
            return basehttpurl + ospackagedata['ISO_http_path']
        else:
            return ""
    except Exception as err:
        logging.exception(err)
        raise Exception from err


def getSettings():
    fin = open('/usr/local/easypxe/conf/settings.json', 'r')

    settings = json.load(fin)
    fin.close()

    logging.debug("getSettings: settings: {}".format(settings))
    return settings

    # return ({
    #     "logFilePath": "/usr/log/bma/log/easypxe.log",
    #     "logLevel": "DEBUG",
    #     "language": "English (US)",
    #     "httpFileServer": "Local",
    #     "themeMode": "Dark"
    # })


def setSettings(settings):
    logging.debug("setSettings: settings: {}".format(settings))

    fout = open('/usr/local/easypxe/conf/settings.json', 'w')

    json.dump(settings, fout)

    return {"result": settings, "status": "success", "error": {}}


def downloadKickstartFile(osType, scriptType, kickstartFile):
    return ospackages.downloadKickStartFile(osType, scriptType, kickstartFile)


def addLCEnv(data):
    logging.debug(f"addLCEnv: {data}")
    return {"result": "good"}


def updateTaskData(taskId, subtaskId, body):
    logging.debug(f"updateTaskData: {taskId} # {subtaskId} # {body}")
    taskmanager = TaskManager.getInstance()
    taskmanager.updateTaskData(taskId, subtaskId, body)
    return None


def getImageSyncStatus():
    try:
        settings = getSettings()
        logging.debug(f"settings: {settings}")
        central = settings['central']

        images = ospackages.getImageSyncStatus(
            central['bmaCentralIP'],
            {"username": central["bmaCentralUsr"], "password": central["bmaCentralPwd"]}
        )

        logging.debug(f"Images with Sync status: {images}")
        return images

    except Exception as err:
        logging.exception(err)
        raise Exception from err


def getOSPackages(filter=None):
    try:
        return ospackages.getOSPackages(filter)
    except Exception as err:
        logging.exception(err)
        raise Exception from err


def getList(category):

    logging.debug(f"getList: category {category}")

    if category == 'images':
        return getOSPackages()
    elif category == 'images-sync':
        return getImageSyncStatus()
    else:
        logging.debug(f"Invalid category [{category}]")

    return None


def controlPXEService(json):
    pxe_service.control(json)
    return None


def applyPXEConf(conf):
    logging.debug(f"applyPXEConf: conf: {conf}")

    pxe_http_path = defaultConfig.pxeHTMLPath
    images_http_path = defaultConfig.htmlPath
    basehttpurl = config.BMASettings().get("http_pxe_base_url")

    logging.debug(f"defaultConfig: {defaultConfig.pxeHTMLPath}, {defaultConfig.htmlPath}")
    try:
        ret = pxe_service.applyConf(conf, pxe_http_path, images_http_path, basehttpurl)
    except Exception as ex:
        logging.exception(ex)
        ret = {'result': {}, 'error': {'msg': str(ex)}}

    return ret


def getEthInterfaces():
    return pxe_service.getEthInterfaces()


def getEthIfaceData(name):

    return pxe_service.getEthIfaceData(name)


if __name__ == '__main__':

    print("main")
    init("10.188.210.14")

    '''
    osInfo = {'name': 'SLES-test', 'osType': 'SLES15'}
    isoPath = "/tmp/SLE-15-Installer-DVD-x86_64-GM-DVD1.iso"
    print(f'create OS package for {osInfo} with {isoPath}')
    createOSPackage(osInfo, isoPath)

    osInfo = {'name': 'RHEL7-test', 'osType': 'RHEL7'}
    isoPath =  "/tmp/RHEL-7.8-20200225.1-Server-x86_64-dvd1.iso"
    isoPath =  "/tmp/RHEL-7.7-20190723.1-Server-x86_64-dvd1.iso"
    print(f'create OS package for {osInfo} with {isoPath}')
    createOSPackage(osInfo, isoPath)

    osInfo = {'name': 'esxi12', 'osType': 'ESXi6'}
    isoPath =  "/tmp/VMware-ESXi-6.7.0-9484548-HPE-Gen9plus-670.10.3.5.6-Sep2018.iso"
    print(f'create OS package for {osInfo} with {isoPath}')
    createOSPackage(osInfo, isoPath)

    createOSPackage({'name': 'esxi12', 'osType': 'SLES15'}, "/tmp/VMware-ESXi-6.7.0-9484548-HPE-Gen9plus-670.10.3.5.6-Sep2018.iso")
    createOSPackage({'name': 'RHEL_7.8', 'osType': 'RHEL7'}, "/tmp/RHEL-7.8-20200225.1-Server-x86_64-dvd1.iso")
    '''
    task_data = {"type": "IMAGE_IMPORT", "data": {"data": {'name': 'rhel-8.3-x86_64-dvd', 'osType': 'RHEL'}, "filepath": "/tmp/rhel-8.3-x86_64-dvd.iso"}}

    print(defaultConfig.htmlPath)


def getPXEConf():

    try:
        conf = pxe_service.getPXEConf()
        ret = {'result': conf, 'error': {}}
    except Exception as ex:
        ret = {'result': {}, 'error': {'msg': str(ex)}}

    return ret


def syncImage(json):
    settings = getSettings()
    logging.debug(f"settings: {settings}")
    central = settings['central']

    return ospackages.syncImage(
        central['bmaCentralIP'],
        {"username": central["bmaCentralUsr"], "password": central["bmaCentralPwd"]},
        json['uri']
    )
