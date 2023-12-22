import logging
import time

import requests
import json


def geniso(uri, osType, isoPath, targetDir, purpose, hostOSdistro):

    request_json = {
        "uri": uri,
        "osType": osType,
        "isoPath": isoPath,
        "targetDir": targetDir,
        "purpose": purpose,
        "hostOSdistro": hostOSdistro
    }

    logging.debug("geniso: {}".format(request_json))

    # REST call to bma_utils
    url = "http://localhost:5002/rest/geniso"
    headers = {'Accept': 'application/json', 'Content-Type': 'application/json'}
    response = requests.post(url, headers=headers, data=json.dumps(request_json))
    logging.debug(response)

    res = response.json()
    if 'error' in res and res['error'] != "":
        raise Exception("Failed to generate ISO image {}".format(res['error']))
    elif 'result' in res:
        return res['result']


def cleanup(taskId, subtaskId):
    logging.debug("Cleanup the generated images")
    url = f"http://localhost:5002/rest/cleanup/{taskId}"
    headers = {'Accept': 'application/json', 'Content-Type': 'application/json'}
    response = requests.delete(url, headers=headers)
    logging.debug(response)

def extractISO(imagePath, targetDir):

    request_json = {
        "image_path": imagePath,
        "extract_dir": targetDir
    }

    logging.debug("extractISO: {}".format(request_json))

    # REST call to bma_utils
    url = "http://localhost:5002/rest/extractiso"
    headers = {'Accept': 'application/json', 'Content-Type': 'application/json'}
    response = requests.post(url, headers=headers, data=json.dumps(request_json))
    logging.debug(response)

    res = response.json()
    if res['status'] != "success":
        raise Exception("Failed to generate ISO image {}".format(res))


if __name__ == '__main__':
    print("")