import ipaddress
import logging
import os
import shutil
import tempfile
import uuid

import ospackages
import netifaces
import requests
import json

def pxeServicesStatus():
    logging.debug("pxeServicesStatus")

    url = f"http://localhost:5002/rest/pxe_status"
    headers = {'Accept': 'application/json', 'Content-Type': 'application/json'}
    response = requests.get(url, headers=headers)
    logging.debug(response)

    return response.json()

def applyConf(conf, pxeHTTPPath, imagesHTTPPath, baseHTTPPath):
    logging.debug(f"applyConf: {conf}")

    try:
        conf = deleteMarkedItems(conf)
        configureServices(conf)
        # Generate boot.ipxe
        conf = copyImage(conf, pxeHTTPPath, imagesHTTPPath)
        genIPXEBOOTFile(conf, baseHTTPPath)
        savePXEConf(conf)
        control({'request': 'statusChange', 'status': "RESTART"})
    except Exception as ex:
        logging.exception(ex)
        return {'result': {}, 'error': {'msg': str(ex)}}

    return {'result': conf, 'error': {}}


def control(data):
    logging.debug(f"control: {data}")

    if data['request'] == 'statusChange':
        if data['status'] == 'START':
            body = {'action': 'START_SERVICES'}
        elif data['status'] == 'STOP':
            body = {'action': 'STOP_SERVICES'}
        elif data['status'] == 'RESTART':
            body = {'action': 'RESTART_SERVICES'}

    logging.debug(f"control: body: {body}")

    # REST call to bma_utils
    url = f"http://localhost:5002/rest/pxe"
    headers = {'Accept': 'application/json', 'Content-Type': 'application/json'}
    response = requests.post(url, headers=headers, data=json.dumps(body))
    logging.debug(response)

    task = response.json()
    logging.debug(f"task: {task}")

    if task['result'] == 'Success':
        # On successful change save the new status of pxe service to conf file
        pxe_conf = getPXEConf()
        # Set the status to True if status = "START" or "RESTART", else False
        pxe_conf['pxeServiceStatus'] = False if data['status'] == 'STOP' else True
        savePXEConf(pxe_conf)

# TODO - implement this function completely. Delete the actual image files
def deleteMarkedItems(conf):

    logging.debug(f"deleteMarkedItems: {conf}")

    updated_boot_items = []
    for item in conf['bootItems']:
        if 'delete' in item:
            logging.debug("Boot item marked for deletion found!")
            #     Delete the image files using REST call to bma_utils
            data = {
                'action': 'DELETE_BOOT_ITEM',
                'bootItem': item
            }
            url = f"http://localhost:5002/rest/pxe"
            headers = {'Accept': 'application/json', 'Content-Type': 'application/json'}
            response = requests.post(url, headers=headers, data=json.dumps(data))
            logging.debug(response)
        else:
            updated_boot_items.append(item)

    conf['bootItems'] = updated_boot_items
    return conf


# Get system network settings for IP address, netmask, gateway etc.
# Refer to documentation for https://pypi.org/project/netifaces/
def configureServices(conf):

    if conf['enableDHCP'] == True:
        dnsmasq_conf_template_path = "/usr/local/easypxe/etc/dnsmasq.conf"
    else:
        # configure DNSMASQ for DHCP Proxy
        dnsmasq_conf_template_path = "/usr/local/easypxe/etc/dnsmasq_dhcpproxy.conf"

    samba_conf_template_path = "/usr/local/easypxe/etc/smb.conf"
    shutil.copy(samba_conf_template_path, "/usr/local/easypxe/conf")

    network_address = str((ipaddress.ip_network(conf['network']['addr'] + '/' + conf['network']['netmask'], strict=False)).network_address)

    fp_in = open(dnsmasq_conf_template_path, 'r').read()
    # fp_out = tempfile.TemporaryFile()
    fp_out = open("/usr/local/easypxe/conf/dnsmasq.conf", "w")

    fp_in = fp_in.replace("%SUBNET_ADDR%", network_address)
    fp_in = fp_in.replace("%IP_ADDR%", conf['network']['addr'])
    fp_in = fp_in.replace("%ETH_INTERFACE_NAME%", conf['network']['iface'])
    fp_in = fp_in.replace("%DHCP_START_IP%", conf['network']['dhcpIPRange']['startIPRange'])
    fp_in = fp_in.replace("%DHCP_END_IP%", conf['network']['dhcpIPRange']['endIPRange'])
    fp_in = fp_in.replace("%NETMASK%", conf['network']['netmask'])
    fp_in = fp_in.replace("%GATEWAY%", conf['network']['gateway'])
    fp_in = fp_in.replace("%BROADCAST%", conf['network']['broadcast'])

    logging.debug(f"generated dnsmasq.conf {fp_in}")
    fp_out.write(fp_in)
    fp_out.close()


# Extract image contents from ISO or ZIP or TAR or TAR.GZ to HTTP server location for
# PXE images like https://192.168.1.51/pxe/.
# The files to be extracted under new directory with name generated using UUID.
# Subsequent calls to apply PXE conf should skip this copy/extract operation by just looking
# if "extractPath' exists
# Along with image file, copy other files such as kickstarts etc. as needed.
def copyImage(conf, pxeHTTPPath, imagesHTTPPath):

    logging.debug(f"copyImage: {conf}, {pxeHTTPPath}, {imagesHTTPPath} ")
    updated_boot_items = []
    for boot_item in conf['bootItems']:
        logging.debug(f'boot item: {boot_item}')
        os_package = ospackages.getOSPackage(boot_item['osPackage'])
        boot_item['sourceFile'] = os.path.join(imagesHTTPPath, os_package["ISO_http_path"])

        if 'extractPath' in boot_item:
            # If the item already exists then extractItem parameter should exist with image files path
            boot_item['extractPath'] = os.path.join(pxeHTTPPath, boot_item['extractPath'])
        else:
            boot_item['extractPath'] = os.path.join(pxeHTTPPath, uuid.uuid4().hex)

        # These extra files are OS specific kickstart or other scripts that need to be copied to the extractPath
        boot_item['extraFilesPath'] = os.path.join("/usr/local/easypxe/etc", os.path.basename(boot_item['extractPath']))
        if not os.path.exists(boot_item['extraFilesPath']):
            os.mkdir(boot_item['extraFilesPath'])

        # Get OS package details to determine what should go into extraFilesPath
        os_package_info = ospackages.getOSPackage(boot_item['osPackage'])
        os_type = os_package_info['osType']
        os_scripts_path = ospackages.getScripts(os_type)[0]
        logging.debug(f"os_scripts_paths: {os_scripts_path}")
        # If OS type is Windows, then copy additional files 'install.bat' and generated 'winpeshl.ini'
        if os_type == "WINDOWS":
            logging.debug("WINDOWS")
            winpeshl_ini_path = os.path.join(os_scripts_path['basePath'], 'winpeshl.ini')
            shutil.copy(winpeshl_ini_path, boot_item['extraFilesPath'])
            input_install_bat_path = os.path.join(os_scripts_path['basePath'], 'install.bat')
            out_install_bat_path = os.path.join(boot_item['extraFilesPath'], 'install.bat')
            if os.path.exists(input_install_bat_path):
                script = open(input_install_bat_path).read()
                samba_path = conf['network']['addr'] + "\\bma\\" + os.path.basename(boot_item['extractPath'])
                script = script.replace("%GATEWAY%", conf['network']['gateway'])
                script = script.replace("%SAMBA_PATH%", samba_path)
                fout = open(out_install_bat_path, 'w')
                fout.write(script)
                fout.close()
            else:
                raise Exception(f"OS type {os_type} not supported for PXE")
        elif os_type == "WINDOWS_MDT":
            logging.debug("WINDOWS_MDT")
            input_install_bat_path = os.path.join(os_scripts_path['basePath'], 'Bootstrap.ini')
            out_install_bat_path = os.path.join(boot_item['extraFilesPath'], 'Bootstrap.ini')
            if os.path.exists(input_install_bat_path):
                script = open(input_install_bat_path).read()
                samba_path = conf['network']['addr'] + "\\bma\\" + os.path.basename(boot_item['extractPath'])
                script = script.replace("%GATEWAY%", conf['network']['gateway'])
                script = script.replace("%SAMBA_PATH%", samba_path)
                fout = open(out_install_bat_path, 'w')
                fout.write(script)
                fout.close()
            else:
                raise Exception(f"OS type {os_type} not supported for PXE")

        # boot_item['httpPath'] = bma_config
        updated_boot_items.append(boot_item)

    if conf['reapply']:
        data = {
            'action': 'REAPPLY_PXE_CONF',
            'bootItems': updated_boot_items
        }
    else:
        data = {
            'action': 'APPLY_PXE_CONF',
            'bootItems': updated_boot_items
        }

    url = f"http://localhost:5002/rest/pxe"
    headers = {'Accept': 'application/json', 'Content-Type': 'application/json'}
    response = requests.post(url, headers=headers, data=json.dumps(data))
    logging.debug(response)

    conf['bootItems'] = updated_boot_items
    # Return the updated configuration which includes image files location
    return conf


# Generate iPXE boot.ipxe file (under the path /usr/local/easypxe/tftpboot/menu/boot.ipxe)
# with boot menu entries for all user configured PXE boot items.
# boot.ipxe is immutable file. Each call to apply PXE conf should freshly generate this file.
# If a boot entry is removed or added or modified, this file should be re-created from scratch.
def genIPXEBOOTFile(conf, baseHTTPPath):
    boot_items = conf['bootItems']

    boot_entries = []
    boot_sections = []
    count = 1
    for item in boot_items:
        logging.debug(f"item: {item}")
        boot_entries.append("item " + str(count) + " " + item['displayText'] + '\n')
        os_package_info = ospackages.getOSPackage(item['osPackage'])
        logging.debug(f"os package info {os_package_info}")
        os_type = os_package_info['osType']
        os_scripts_path = ospackages.getScripts(os_type)[0]
        logging.debug("OS Type {os_type}")
        # path1 = "/usr/local/easypxe/etc/" + os_type
        path1 = os.path.join(os_scripts_path['basePath'], "bootsection.ipxe")
        if os.path.exists(path1):
            boot_section = open(path1).read()
        else:
            raise Exception(f"OS type {os_type} not supported for PXE")

        # boot_path = baseHTTPPath + os_package_info['uri']
        boot_path = baseHTTPPath + os.path.basename(item['extractPath'])
        # Samba path, used for Clonezilla saving/restoring image. used for Windows for sharing Windows installation files to WinPE
        samba_path = "smb://bma:bma@" + conf['network']['addr'] + "/bma/" + os.path.basename(item['extractPath']) + "/"
        logging.debug(f"boot_path: {boot_path}")
        boot_section = boot_section.replace("%ENTRY_NAME%", str(count))
        boot_section = boot_section.replace("%HTTP_URL%", boot_path)

        boot_section = boot_section.replace("%SAMBA_URL%", samba_path)
        boot_sections.append(boot_section)
        count += 1

    # Now Generate boot.ipxe
    # fp_out = open("/usr/local/easypxe/conf/boot.ipxe", 'w')
    fp_out = open("/usr/local/easypxe/tftpboot/menu/boot.ipxe", 'w')
    with open("/usr/local/easypxe/etc/boot.ipxe", 'r') as fp_in:
        for line in fp_in:
            logging.debug("line")
            if "#PLACE_MARKER1" in line:
                for boot_entry in boot_entries:
                    fp_out.write(boot_entry)
            elif "#PLACE_MARKER2" in line:
                for boot_section in boot_sections:
                    fp_out.writelines(boot_section)
                    fp_out.write('\n')
            fp_out.write(line)

    fp_out.close()
    fp_in.close()


def savePXEConf(conf):

    updated_boot_items = []
    index = 0
    for item in conf['bootItems']:
        item['bootOrderId'] = index
        updated_boot_items.append(item)
        index += 1

    conf['bootItems'] = updated_boot_items

    fout = open("/usr/local/easypxe/conf/pxe_service.conf", 'w')
    json.dump(conf, fout, indent=2)
    fout.close()



def getPXEConf():
    fin = open("/usr/local/easypxe/conf/pxe_service.conf", 'r')
    return json.load(fin)




def getEthInterfaces():
    return netifaces.interfaces()

def getEthIfaceData(name):
    logging.debug(f"getIfaceData: name: {name}")

    if name == "":
        return netifaces.interfaces()

    link_layer = netifaces.AF_INET
    inet_conf = {}

    addresses = netifaces.ifaddresses(name)
    logging.debug(f"addresses: {addresses}")

    if link_layer not in addresses:
        return {}

    inet_conf = addresses[link_layer][0]
    logging.debug(f"inet_conf: {inet_conf}")

    gws = netifaces.gateways()

    gateway = ""

    logging.debug(f"Gateways: {gws[link_layer]}")
    for item in gws[link_layer]:
        if name in item:
            logging.debug(f"item: {item}")
            for subitem in item:
                # Check if its IPV4 address by looking for 3 dots '.'
                if type(subitem) == str and subitem.count('.') == 3:
                    logging.debug(f"subitem: {type(subitem)}, {subitem}")
                    gateway = subitem

    inet_conf['gateway'] = gateway

    logging.debug(f"inet_conf: {inet_conf}")

    return inet_conf


if __name__ == '__main__':
    import sys
    logging.basicConfig(stream=sys.stdout, level=logging.DEBUG)

    conf = {
        'reApply': False, 'pxeServiceStatus': False,
        'bootItems': [
        {'bootOrderId': 0, 'show': False, 'displayText': 'CentOS7', 'driversPack': '', 'kickstart': '', 'osPackage': 'CentOS-7-x86_64-Minimal-2009.iso'},
        {'displayText': 'clonezilla', 'osPackage': 'clonezilla-live-2.8.1-12-amd64.zip', 'kickstart': '', 'driversPack': '', 'show': True, 'bootOrderId': 1}
        ],
        'network': {
            'addr': '192.168.3.51',
            'broadcast': '192.168.3.255',
            'gateway': '192.168.3.1',
            'netmask': '255.255.255.0',
            'dhcpIPRange': {'startIPRange': '192.168.3.200', 'endIPRange': '192.168.3.210'}, 'iface': 'bridge0'}
    }

    # ret = configureDNSMasq(conf)
    ret = genIPXEBOOTFile(conf)
    logging.debug(f"ret: {ret}")


