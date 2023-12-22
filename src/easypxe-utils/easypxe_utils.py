# -*- coding: utf-8 -*-
###
# Copyright 2021 RedefinIT Technologies
#

import logging
# import sourcedefender
import os
import requests
import shutil
import subprocess
import tempfile
import threading
import uuid
from flask import Flask, request, jsonify
from logging.handlers import RotatingFileHandler

import geniso
import utils1
from tasks import Tasks

LOGGING_LEVEL = {
    'INFO': logging.INFO,
    'WARNING': logging.WARNING,
    'ERROR': logging.ERROR,
    'DEBUG': logging.DEBUG
}

log_file = "/usr/local/easypxe/logs/bma_utils.log"
loggging_format = '%(asctime)s %(levelname)s [%(filename)s:%(lineno)d] %(message)s'

fh = RotatingFileHandler(log_file, maxBytes=10 * 1024 * 1024, backupCount=2)
logging.basicConfig(
    level='DEBUG',
    format=loggging_format,
    handlers=[fh, logging.StreamHandler()])
logging.info("bma_utils service started!")

ALLOWED_EXTENSIONS = {'txt', 'iso', 'ISO'}

def create_app():

    app = Flask(__name__)
    # app.run(debug=True, host='localhost', port='5001')
    with app.app_context():

        __importThread = None
        tasks = Tasks.getInstance()
        tasks.init()

        @app.route('/rest/version', methods=['GET'])
        def getVersion():
            return jsonify({"version": "1.1"})

        @app.route('/rest/task/<taskId>', methods=['GET'])
        def getTask(taskId):
            logging.debug(f"getTask: for {taskId} ")
            # tasks = Tasks.getInstance()
            task_info = tasks.getTask(taskId)
            return jsonify(task_info)

        @app.route('/rest/cleanup/<taskId>', methods=['DELETE'])
        def cleanup(taskId):
            logging.debug(f"cleanup: taskId: {taskId}")

            # tasks = Tasks.getInstance()
            return tasks.cleanup(taskId)

            # # global thread_lock
            # thread_lock.acquire()
            # task = tasks.get(taskId)
            #
            # if task:
            #     if task['count'] > 1:
            #         task['count'] = task['count'] - 1
            #         tasks[taskId] = task
            #     else:
            #         path1 = task['path']
            #         os.system(f'resmgrs {path1}')
            #
            # thread_lock.release()
            # return jsonify(tasks[taskId])

        @app.route('/rest/importImage', methods=['post'])
        def importImage():
            logging.info(f"importImage: ")
            logging.info(f"importImage: request.json: {request.json}")

            try:
                taskId = uuid.uuid4()
                task, task_exist = tasks.createTask(taskId, request.json['httpPath'])

                if task_exist:
                    return jsonify(task)


                image_url = request.json['imageUrl']
                http_path = "/usr/share/nginx/html/images/" + request.json['httpPath']

                # importHTTPFile(taskId, image_url, http_path)

                __importThread = threading.Thread(
                    target=importHTTPFile,
                    args=(taskId, image_url, http_path)
                )
                __importThread.start()

                logging.debug(f"returning {task}")

                return jsonify(task)
            except Exception as ex:
                logging.debug(ex)
                return jsonify({})


        def importHTTPFile(taskId, url, targetPath):
            logging.debug(f"importHTTPFile: {url} : {targetPath}")

            # https://www.adamsmith.haus/python/answers/how-to-download-large-files-with-requests-in-python
            # set stream to True to allow iter_content on the Response object to
            # iterate the data while maintaining an open connection.
            r = requests.get(url, stream=True, verify=False)
            # Open the target file to write the stream data
            with open(targetPath, 'wb') as f:
                logging.debug("File opened")
                for chunk in r.iter_content(chunk_size=1024):
                    if chunk:  # filter out keep-alive new chunks
                        f.write(chunk)

            logging.debug("Completed importing the file")
            return


        @app.route('/rest/geniso', methods=['post'])
        def gen_iso():
            logging.info("gen_iso: START")
            logging.debug(request.json)

            try:
                uri = request.json['uri']
                os_type = request.json['osType']
                orig_iso_path = request.json['isoPath']
                target_dir = request.json['targetDir']
                hostOSdistro = request.json['hostOSdistro']
                purpose = request.json['purpose']

                if purpose == "redfish":
                    target_iso_path = geniso.createKickstartISO(uri, os_type.upper(), orig_iso_path, target_dir,
                                                                hostOSdistro)
                    logging.info("gen_iso: target_iso_path: " + str(target_iso_path))
                    return jsonify({"result": {"targetISOPath": target_iso_path}, "error": ""})
                elif purpose == 'pxe':
                    logging.debug("Importing PXE image")
                    target_iso_path = geniso_hpefwspp.importFirmwareISO(uri, orig_iso_path, target_dir, hostOSdistro)
                    logging.info("gen_iso: target_iso_path: " + str(target_iso_path))
                    return jsonify({"result": {"targetISOPath": target_iso_path}, "error": ""})
                elif purpose == 'drivers':
                    logging.debug("Importing drivers pack image")
                    target_iso_path = geniso_hpefwspp.importFirmwareISO(uri, orig_iso_path, target_dir, hostOSdistro)
                    logging.info("gen_iso: target_iso_path: " + str(target_iso_path))
                    return jsonify({"result": {"targetISOPath": target_iso_path}, "error": ""})
            except Exception as ex:
                logging.debug(ex)


        @app.route('/rest/extractiso', methods=['post'])
        def extract_iso():
            logging.info("extract_iso: START")
            logging.debug(request.json)

            try:
                image_file_path = request.json['image_path']
                extract_dir = request.json['extract_dir']

                mount_path = tempfile.TemporaryDirectory()
                cmd = ['mount', '-o', 'loop', image_file_path, mount_path.name]
                ret = subprocess.run(cmd, stderr=subprocess.PIPE, check=False)
                logging.debug(ret.stderr)
                logging.debug(ret.returncode)
                if ret.returncode:
                    raise Exception(ret.stderr)

                utils1.copy_tree(mount_path.name + os.sep, extract_dir + os.sep)
                # TODO What happens if cp fails due to lack of disk space? Need to handle this scenario

                # Unmount the ISO
                cmd = ['umount', mount_path.name]
                ret = subprocess.run(cmd, stderr=subprocess.PIPE, check=False)
                logging.debug(ret.stderr)
                logging.debug(ret.returncode)
            except Exception as ex:
                logging.info("extract_iso: END exception: {}".format(str(ex)))
                result = {"status": "fail", "error": {"msg": str(ex)}}
                return jsonify(result)

            result = {"status": "success", "error": {}}
            logging.info("extract_iso: END result: {}".format(result))
            return jsonify(result)


        @app.route('/rest/pxe_status', methods=['get'])
        def getPXEStatus():

            pxe_status = os.system("systemctl is-active --quiet dnsmasq")
            samba_status = os.system("systemctl is-active --quiet smb")
            return {"pxe": 1 if pxe_status == 0 else 0, "samba": 1 if samba_status == 0 else 0}

        @app.route('/rest/pxe', methods=['post'])
        def applyPXEChanges():

            try:
                data = request.json
                logging.debug(f"applyPXEChanges data: {data}")

                if data['action'] == "RESTART_SERVICES":
                    logging.debug("Starting dnsmasq")
                    # Temporarily disable SELINUX
                    os.system("setenforce 0")
                    os.system("systemctl daemon-reload")
                    os.system("systemctl restart dnsmasq")
                    os.system("systemctl restart smb nmb")
                    return jsonify({"result": "Success"})
                elif data['action'] == "START_SERVICES":
                    logging.debug("starting dnsmasq")
                    # Temporarily disable SELINUX
                    os.system("setenforce 0")
                    os.system("systemctl daemon-reload")
                    os.system("systemctl start dnsmasq")
                    os.system("systemctl start smb nmb")
                    return jsonify({"result": "Success"})
                elif data['action'] == "STOP_SERVICES":
                    logging.debug("stopping dnsmasq")
                    # Undo disabling of SELINUX
                    os.system("setenforce 1")
                    os.system("systemctl stop dnsmasq")
                    os.system("systemctl stop smb nmb")
                    return jsonify({"result": "Success"})
                elif data['action'] == "APPLY_PXE_CONF":
                    logging.debug("Applying new PXE configuration")
                    # For each boot item extract the OS image to HTTP location only first time
                    # If already present then skip this step
                    for boot_item in data['bootItems']:
                        utils1.smartExtract(boot_item['sourceFile'], boot_item['extractPath'], force=False)
                        # Copy the additional files to extracted path. For Windows this will be install.bat
                        # Files under extraFilesPath are generated files for the target OS.
                        utils1.copy_tree(boot_item['extraFilesPath'], boot_item['extractPath'])
                        # For Windows MDT custom images, the files with extension EXE, DLL are
                        # expected to have execute permissions on Linux side. Extract from ZIP file is able to
                        # retain Windows ACLs and execute permissions for directories but files missing exec
                        # permissions
                        utils1.ensurePermissions(boot_item['extractPath'])

                    # Copy the configuration files
                    utils1.copy3("/usr/local/easypxe/conf/dnsmasq.conf", "/etc/dnsmasq.conf")
                    # Samba configuration
                    utils1.copy3("/usr/local/easypxe/conf/smb.conf", "/etc/samba/smb.conf")
                    # Restart PXE services
                    os.system("systemctl daemon-reload")
                    os.system("systemctl restart dnsmasq")
                    # Start Samba server
                    os.system("systemctl restart smb nmb")
                    #  Set Samba password for the user 'bma' to 'bma'
                    os.system("(echo bma; echo bma) | /usr/bin/smbpasswd -s -a bma")
                    logging.debug("Successfully completed the apply PXE conf")
                    return jsonify({"result": "Success"})

                elif data['action'] == "REAPPLY_PXE_CONF":
                    logging.debug("Re-Applying new PXE configuration")
                    # Extract the OS image to HTTP location
                    # Check if already present, delete and extract
                    for boot_item in data['bootItems']:
                        utils1.smartExtract(boot_item['sourceFile'], boot_item['extractPath'], force=True)
                        utils1.copy_tree(boot_item['extraFilesPath'], boot_item['extractPath'])

                    # Copy the configuration files
                    utils1.copy3("/usr/local/easypxe/conf/dnsmasq.conf", "/etc/dnsmasq.conf")
                    # Samba configuration
                    utils1.copy3("/usr/local/easypxe/conf/smb.conf", "/etc/samba/smb.conf")
                    # Restart PXE services
                    os.system("systemctl daemon-reload")
                    os.system("systemctl restart dnsmasq")
                    # Start Samba server
                    os.system("systemctl restart smb nmb")
                    #  Set Samba password for the user 'bma' to 'bma'
                    os.system("(echo bma; echo bma) | /usr/bin/smbpasswd -s -a bma")
                    logging.debug("Successfully completed the re-apply PXE conf")
                    return jsonify({"result": "Success"})
                elif data['action'] == "DELETE_BOOT_ITEM":
                    logging.debug(f"Deleting files of bootItem {data}")
                    utils1.deleteDir(data['bootItem']['extractPath'], force=False)
                    return jsonify({"result": "Success"})

            except Exception as ex:
                logging.exception(ex)
                return jsonify({"result": "Failed"})

            return jsonify({"result": "Failed"})


        # @app.route('/rest/systemctl', methods=['post'])
        # def systemctl():
        #     logging.info("systemctl: START")
        #     logging.debug(request.json)
        #
        #     data = request.json
        #
        #     if "request" in data:
        #         if data["request"] == "statusChange":
        #             if data["status"] == True:
        #                 logging.debug("Starting dnsmasq")
        #                 os.system("systemctl daemon-reload")
        #                 os.system("systemctl restart dnsmasq")
        #             else:
        #                 logging.debug("stopping dnsmasq")
        #                 os.system("systemctl stop dnsmasq")
        #
        #     return jsonify({"result": "All good"})


    return app


# if __name__ == '__main__':
#     app.run(debug=True, host='localhost', port='5001')
