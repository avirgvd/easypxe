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
