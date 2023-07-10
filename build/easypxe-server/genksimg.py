# -*- coding: utf-8 -*-


import os
import shutil
import string, re
import subprocess
import json
import tempfile
import uuid
# import bma_config as config
import logging
import requests
#import ospackages
import bma_config as config

defaultConfig = config.DefaultConfig()
ksBaseImg = defaultConfig.ksBaseImg

###################################################################
#This function to modify KS file to update hostname, ipaddress..etc
###################################################################
def modifyKSFile(ksPath, targetKSFile, OSConfigJSON, taskId=0, subTaskId=0):
    
    def flat_json(nestedJson):
        out = {}
        
        def flatten(entry, parent=''): 
            if type(entry) is dict: 
                for key,value in entry.items(): 
                    flatten(value, parent + key + '.') 
            # If the Nested key-value 
            # pair is of list type 
            elif type(entry) is list: 
                i = 0
                for item in entry:                 
                    flatten(item, parent + str(i) + '.') 
                    i += 1
            else: 
                out[parent[:-1]] = entry
        
        flatten(nestedJson) 
        return out 
    
    def readOScfg(json, parameter):
        try:
            return str(json[parameter])
        except:
            return ''

    try:
        if "kickstartFile" in OSConfigJSON and OSConfigJSON['kickstartFile'] != "":
            # If user defined kickstart is present then append the filename to baseKS path
            ksfile_name = os.path.dirname(ksPath) + os.sep + "kickstart" + os.sep + OSConfigJSON['kickstartFile']
            logging.debug(f"ks file: {ksfile_name}")
        else:
            # ksfile_name = ksPath
            logging.debug("Kickstart file not specified in the input JSON")
            raise Exception("Kickstart file not specified in the input JSON")


        flat_OSConfigJSON = flat_json(OSConfigJSON)

        requiredKsVars = {
            "%HOSTNAME%": readOScfg(flat_OSConfigJSON, 'hostName'),
            "%SSH_KEY%": readOScfg(flat_OSConfigJSON, "sshKey"),
            "%HTTP_PROXY%": readOScfg(flat_OSConfigJSON, "httpProxy"),
            "%HTTPS_PROXY%": readOScfg(flat_OSConfigJSON, "httpsProxy"),
            "%NO_PROXY%": readOScfg(flat_OSConfigJSON, "noProxy"),
            "%IPADDR1%": readOScfg(flat_OSConfigJSON, 'networks.0.ipAddr'),
            "%NETMASK1%": readOScfg(flat_OSConfigJSON, 'networks.0.subnetmask'),
            "%CIDR1%": str(netmaskToCIDR(readOScfg(flat_OSConfigJSON, 'networks.0.subnetmask'))),
            "%GATEWAY1%": readOScfg(flat_OSConfigJSON,'networks.0.gateway'),
            "%DNS11%": readOScfg(flat_OSConfigJSON, 'networks.0.dns1'),
            "%MAC11%": readOScfg(flat_OSConfigJSON, 'networks.0.nic1.macAddress'),
            "%MAC12%": readOScfg(flat_OSConfigJSON, 'networks.0.nic2.macAddress'),
            "%VLANS1%": readOScfg(flat_OSConfigJSON, 'networks.0.vlans'),
            "%IPADDR2%": readOScfg(flat_OSConfigJSON, 'networks.1.ipAddr'),
            "%NETMASK2%": readOScfg(flat_OSConfigJSON, 'networks.1.subnetmask'),
            "%CIDR2%": str(netmaskToCIDR(readOScfg(flat_OSConfigJSON, 'networks.1.subnetmask'))),
            "%GATEWAY2%": readOScfg(flat_OSConfigJSON, 'networks.1.gateway'),
            "%DNS21%": readOScfg(flat_OSConfigJSON, 'networks.1.dns1'),
            "%MAC21%": readOScfg(flat_OSConfigJSON, 'networks.1.nic1.macAddress'),
            "%MAC22%": readOScfg(flat_OSConfigJSON,'networks.1.nic2.macAddress'),
            "%VLANS2%": readOScfg(flat_OSConfigJSON, 'networks.1.vlans'),
            "%DRIVEID%": readOScfg(flat_OSConfigJSON, 'osDrive.driveID'),
            "%DRIVENUMBER%": readOScfg(flat_OSConfigJSON, 'osDrive.driveNumber'),
            "%DRIVE_FILTER%": readOScfg(flat_OSConfigJSON, 'osDrive.capacityBytes'),
            "%BMA_REST_URL%": f"https://{config.BMASettings().get('hostname')}/rest/confirm/{taskId}/{subTaskId}"
        }

        logging.debug(f"requiredKsVars: {requiredKsVars}")

        if requiredKsVars["%HTTP_PROXY%"] or requiredKsVars["%HTTPS_PROXY%"]:
            requiredKsVars['%ENABLE_PROXY%'] = 'true'

        # Brute force replace all kickstart variables
        ks_fopen = open(ksfile_name).read()
        for ksVar, OSconfig in requiredKsVars.items():
            ks_fopen = ks_fopen.replace(ksVar, OSconfig)
        
        # Brute force removing unused kickstart variables
        pattern = re.compile('%[a-zA-Z]+[a-zA-f0-9]*%')
        matches = re.findall(pattern, ks_fopen)
        if len(matches) > 0:
            logging.error('Missing expected input parameters for kickstart variables. Deployment may fail.')
        for ksVar in matches:
            logging.error(f'Missing input parameter for {ksVar}')
            ks_fopen = ks_fopen.replace(ksVar, '')

        ks_fopenW = open(targetKSFile, 'w')
        ks_fopenW.write(ks_fopen)
        ks_fopenW.close()
    except KeyError as kerr:
        raise Exception(f"Error accessing OSconfig parameter: " + str(kerr))
    except Exception as err:
        logging.debug(f"Exception@@@@@@: {err}")
        raise Exception(str(err))

###################################################################
#This function to create IMG file for USB media
###################################################################

#def createKickstartImage(KSPath):
def createKickstartImage(targetksfile, targetksimagefile, osType):

    # There is an empty Image file that should be modified by adding 
    # new ks.cfg to create image file with ks.cfg

    # KSFile, ext=os.path.splitext(imgFileName)
    temp_dir = "/tmp/" + uuid.uuid4().hex
    # tempDir = "/tmp/kickstart"
    # subprocess.run(['mkdir', '-m', '775', tempDir], check=True)
    os.makedirs(temp_dir)
    # os.chmod(tempDir, stat.S_IREAD | stat.S_IWRITE)
    logging.info("Temp directory: " + temp_dir)

    ksfile_path = ""
    # Copy the kickstart file to root of the image mount location
    # The filename of kickstart inside the image should only be ks.cfg
    if "SLES15" == osType.upper():
        logging.debug("generateKickStart: OS is SLES15")
        ksfile_path = temp_dir + "/autoinst.xml"
        # cmd = 'cp ' + targetksfile + ' ' + temp_dir + "/autoinst.xml"
        shutil.copy2(targetksfile, temp_dir + "/autoinst.xml")
    else:
        logging.debug("generateKickStart: OS is either Linux or ESXi")
        ksfile_path = temp_dir + "/ks.cfg"
        # cmd = 'cp ' + targetksfile + ' ' + temp_dir + "/ks.cfg"
        shutil.copy(targetksfile, temp_dir + "/ks.cfg")

    # subprocess.run(cmd.split(' '), check=True)

    request_json = {
        "base_image_path": ksBaseImg,
        "kickstart_file": ksfile_path,
        "target_image_path": targetksimagefile
    }

    # REST call to bma_utils
    url = "http://localhost:5002/rest/genusbimage"
    headers = {'Accept': 'application/json', 'Content-Type': 'application/json'}
    response = requests.post(url, headers=headers, data=json.dumps(request_json))

    logging.debug(response)
    res = response.json()
    if res['status'] != "success":
        raise Exception("Failed to generate Kickstart image {}".format(res))

    # Remove the temp directory before exiting
    shutil.rmtree(temp_dir)

    if response.status_code != 200:
        return False

    result = response.json()
    logging.debug("REST call for gen_usb_image returned result: {}".format(result))
    # TODO error handling based on result of REST call

    return True


# Returns the http URL for accessing generated image file
#def generateKickStart(baseksfile, targetdir, OSConfigJSON):
def generateKickStart(osType, scriptsInfo, targetdir, OSConfigJSON, embedded=False, taskId=0, subTaskId=0):

    logging.debug("generateKickStart: osType: {osType}, targetdir: {target}, "\
                  "osconfigjson: {osCfg}".format(osType=osType, target=targetdir, osCfg=OSConfigJSON));

    # TODO: this function needs implementation
    # baseksfile = getBaseKSFile(osType)
    kickstart_path = scriptsInfo['path'] + "kickstart"
    logging.debug(f"kickstart path: {kickstart_path}")
    if kickstart_path == "":
        logging.exception("Fail to generate kickstart file. Unsupported OS type specified")
        raise Exception("Fail to generate kickstart file. Unsupported OS type specified")

    #outksfile = open(baseksfile, 'r')
    # Generate path for new ks.cfg file

    # Generate temp path for server specific ks.cfg
    #newimagefilename = uuid.uuid4().hex + ".img"
    newfilename = uuid.uuid4().hex 
    targetksfile = os.path.join(targetdir, newfilename + ".cfg")
    targetksimagefile = os.path.join(targetdir, newfilename + ".img")

    # Get OS Type from OSPackage name
    #package = ospackages.getOSPackage(OSConfigJSON['osPackage'])
    #print("generateKickStart: osType: " + package['osType'])

    logging.debug("generateKickStart: targetksFile: {ksFile}, targetksImageFile: {ksImage}, " \
                  .format(ksFile=targetksfile, ksImage=targetksimagefile));

    # Generate customized ks.cfg file based on OSConfigJSON data
    modifyKSFile(kickstart_path, targetksfile, OSConfigJSON, taskId=taskId, subTaskId=subTaskId)

    logging.debug(open(targetksfile, 'r').readlines())

    output_file = ""
    if not embedded:
        # Create FAT32 imagefile with the customized ks.cfg in it
        result = createKickstartImage(targetksfile, targetksimagefile, osType)
        output_file = targetksimagefile
    else:
        # Return the kickstart file for embedded=True
        # This kickstart file will be embedded into the ISO later
        output_file = targetksfile

    #outksfile.close()
    logging.debug(f"generateKickStart: generated the file with path: {output_file}")
    return output_file

def getBaseKSFile(osType):
    try:
        ksfiles = None
        with open(defaultConfig.kickstartFile, 'r') as fin:
            ksfiles = json.load(fin)
        if ksfiles:
            for ksfile in ksfiles:
                logging.debug(ksfile)
                if ksfile["osType"] == osType:
                    return ksfile["basekspath"]
            return ""
        else:
            raise Exception(f'Failed to read kickstart files from {defaultConfig.kickstartFile}. Check BMA installation')
    except Exception as err:
        raise Exception(str(err))

def cleanupKickstartFiles(ksfilepath):

    os.remove(ksfilepath)

    # Remove the file with .cfg extension also
    os.remove(ksfilepath.replace(".img", ".cfg"))


###################################################
# Fucntion to convert netmask to CIDR
#
# Input: Netmask (255.255.255.0)
# Output: CIDR (24)
#
# Note: The output is 24 and is not /24
###################################################
def netmaskToCIDR(netmask):
  if not netmask:
     return "24"

  return(sum([ bin(int(bits)).count("1") for bits in netmask.split(".") ]))


if __name__ == '__main__':
    OSConfigJSON = {}

    baseKSFile = getBaseKSFile("SLES15")
    print("baseKSFile: " + baseKSFile)
    #cleanupKickstartFiles("/var/www/html/4e616a8bdf224eae9f18024c274e7bca.img")
