# -*- coding: utf-8 -*-
# import random
import shutil
import subprocess
# import copy
import os
import tempfile
import uuid
import logging
import utils1

# ksBaseImage = "/usr/local/easypxe/kickstarts/ks_base.img"


###################################################################
# 
###################################################################
def getKernelOption(osType, ksLocation):

    if osType == "RHEL":
        if ksLocation == "USB":
            return "ks=hd:UUID=3A12-D3C6" + ":/ks.cfg"
        elif ksLocation == "EMBEDDED":
            return "ks=cdrom" + ":/ks.cfg"
    if osType == "UBUNTU":
        if ksLocation == "USB":
            return " autoinstall ds=nocloud\;s=/cdrom/nocloud/ fsck.mode=skip "
        elif ksLocation == "EMBEDDED":
            return " autoinstall ds=nocloud\;s=/cdrom/nocloud/ fsck.mode=skip "
    elif osType == "ESXI":
        if ksLocation == "USB":
            return "ks=usb"
        elif ksLocation ==\
                "EMBEDDED":
            return "ks=cdrom:/KS.CFG"
    else:
        return ""


def getEFIBootConfigPath(osType):

    if osType == "RHEL":
        return '/EFI/BOOT/grub.cfg'
    if osType == "UBUNTU":
        return '/boot/grub/grub.cfg'
    elif osType == "ESXI":
        return '/efi/boot/boot.cfg'
    else:
        return ""


def createKickstartISO(uri, osType, ISOPath, targetPath, hostOSdistro):

    mount_path = None
    try:
        mount_path = tempfile.TemporaryDirectory()
    except Exception as err:
        logging.exception(err)
        raise Exception from err

    try:
        logging.info("createKickstartISO: ISOPath: " + str(ISOPath) + " TargetISOBasePath: " + str(targetPath))

        # Create a temp directory and mount the input ISO to that path
        # mount_path = tempfile.TemporaryDirectory()
        copy_path = "/tmp/" + uuid.uuid4().hex
        os.makedirs(copy_path)


        loop_dev = '/dev/loop' + uuid.uuid4().hex
        cmd = ['mount', '-o', 'loop', ISOPath, mount_path.name]
        # cmd = ['mount', '-o', loop_dev, ISOPath, mount_path.name]
        ret = subprocess.run(cmd, stderr=subprocess.PIPE, check=False)
        logging.debug(ret.stderr)
        logging.debug(ret.returncode)
        if ret.returncode:
            # Unmount the ISO
            cmd = ['umount', mount_path.name]
            ret = subprocess.run(cmd, stderr=subprocess.PIPE, check=False)
            logging.debug(ret.stderr)
            logging.debug(ret.returncode)
            raise Exception(ret.stderr)

        utils1.copy_tree(mount_path.name + os.sep, copy_path + os.sep)
        # TODO What happens if cp fails due to lack of disk space? Need to handle this scenario

        # Unmount the ISO
        cmd = ['umount', mount_path.name]
        ret = subprocess.run(cmd, stderr=subprocess.PIPE, check=False)
        logging.debug(ret.stderr)
        logging.debug(ret.returncode)

        # Modify boot.cfg files for both Legacy and EFI with kernel opts specifying
        # Kickstart file 'ks.cfg' is expected under root directory of mounted virtual floppy
        # TODO USB Image label hardcoded.
        #  Be aware that if the ks_base.img image is recreated then this label may change.
        # kernel_option = "ks=hd:UUID=3A12-D3C6" + ":/ks.cfg"
        # kernel_option = getKernelOption(osType=osType, ksLocation="USB")
        modifyISO(osType, copy_path, ksFile=None, ksLocation="USB")
        # new_iso_filename = os.path.join(targetPath, uuid.uuid4().hex + ".ISO")
        new_iso_filename = os.path.join(targetPath, uri + ".ISO")
        genISO(osType, copy_path, new_iso_filename, hostOSdistro)

        # Remove the temp directory before exiting
        shutil.rmtree(copy_path)

        return new_iso_filename
    except Exception as err:
        logging.exception(err)

        # Unmount the ISO
        cmd = ['umount', mount_path.name]
        ret = subprocess.run(cmd, stderr=subprocess.PIPE, check=False)
        logging.debug(ret.stderr)
        logging.debug(ret.returncode)
        raise Exception from err


# Creates ISO file with kickstart file injected into it.
# This function is used for servers that doesnt support mounting kickstart image file simultaneously with
# ISO file mounting. Dell, Huawei are two examples. In this case, only DHCP can be supported.
def createEmbeddedKickstartISO(osType, ISOPath, targetPath, ksFile, hostOSdistro, targetFileName):
    try:
        logging.info("createKickstartISO: ISOPath: " + str(ISOPath) + " TargetISOBasePath: " + str(targetPath))

        # Create a temp directory and mount the input ISO to that path
        # mount_path = tempfile.TemporaryDirectory()
        copy_path = "/tmp/" + uuid.uuid4().hex
        os.makedirs(copy_path)

        # utils1.extractISO(ISOPath, copy_path)

        mount_path = tempfile.TemporaryDirectory()
        loop_dev = '/dev/loop' + uuid.uuid4().hex
        logging.debug(f"loop_dev: {loop_dev}")
        cmd = ['mount', '-o', 'loop', ISOPath, mount_path.name]
        # cmd = ['mount', '-o', loop_dev, ISOPath, mount_path.name]
        ret = subprocess.run(cmd, stderr=subprocess.PIPE, check=False)
        logging.debug(ret.stderr)
        logging.debug(ret.returncode)
        if ret.returncode:
            # Unmount the ISO
            cmd = ['umount', mount_path.name]
            ret = subprocess.run(cmd, stderr=subprocess.PIPE, check=False)
            logging.debug(ret.stderr)
            logging.debug(ret.returncode)
            logging.debug(ret.returncode)
            raise Exception(ret.stderr)

        utils1.copy_tree(mount_path.name + os.sep, copy_path + os.sep)
        # # TODO (22-Feb-2022) Workaround for subiquity crash during autoinstall due to missing Packages file
        # # Err: 4 file: / cdrom focal/main amd64 Packages
        # # File not found - / cdrom / dists / focal / main / binary - amd64 / Packages(2: No such file or directory)
        # # Workaround for this above error is "extract Packages.gz file"
        # cmd = ['gzip', '-dk', copy_path + os.sep + "dists/focal/main/binary-amd64/Packages.gz"]
        # ret = subprocess.run(cmd, stderr=subprocess.PIPE, check=False)
        # logging.debug(ret.stderr)
        # logging.debug(ret.returncode)
        # if ret.returncode:
        #     raise Exception(ret.stderr)
        # TODO What happens if cp fails due to lack of disk space? Need to handle this scenario

        # Unmount the ISO
        cmd = ['umount', mount_path.name]
        ret = subprocess.run(cmd, stderr=subprocess.PIPE, check=False)
        logging.debug(ret.stderr)
        logging.debug(ret.returncode)

        # # Copy the kickstart file to root of ISO contents
        # nocloud_path = copy_path + "/nocloud"
        # if not os.path.exists(nocloud_path):
        #     os.mkdir(nocloud_path)
        # shutil.copy(ksFile, nocloud_path + "/user-data")
        # # TODO: Create empty metadata file for now
        # if not os.path.exists(nocloud_path + '/meta-data'):
        #     open(nocloud_path + '/meta-data', "x").close()

        # Modify boot.cfg files for EFI with kernel opts specifying
        # Kickstart file 'ks.cfg' is expected under root directory of ISO contents
        # kernel_option = "ks=cdrom" + ":/ks.cfg"
        # kernel_option = getKernelOption(osType=osType, ksLocation="EMBEDDED")
        modifyISO(osType, copy_path, ksFile, ksLocation="EMBEDDED")
        # new_iso_filename = os.path.join(targetPath, uuid.uuid4().hex + ".ISO")
        new_iso_filename = os.path.join(targetPath, targetFileName)
        genISO(osType, copy_path, new_iso_filename, hostOSdistro)

        # Remove the temp directory before exiting
        shutil.rmtree(copy_path)

        return new_iso_filename
    except Exception as err:
        logging.exception(err)
        raise Exception from err


###################################################################
# This function modifies boot.cfg files with Kickstart file URL in kernel opts
###################################################################
def modifyISO(osType, ISOCopyPath, ksFile, ksLocation):

    try:
        logging.debug("addKSPath2BootCFG: ISOCopyPath: " + ISOCopyPath)

        # # Modify Legacy boot boot.cfg with Kickstart path
        # bootcfgpath = ISOCopyPath + '/isolinux/isolinux.cfg'
        # if os.path.exists(bootcfgpath) == True:
        #     logging.info("Legacy boot config file found in ISO copy....")
        #     # modifyBootCFGFile(bootcfgpath, KSFilePath4KernelOpts, "Legacy")
        # else:
        #     logging.info("Legacy boot config file NOT found in ISO copy....")

        # Modify EFI boot boot.cfg with Kickstart path
        # bootcfgpath = ISOCopyPath + '/EFI/BOOT/grub.cfg'
        # bootcfgpath = ISOCopyPath + getEFIBootConfigPath(osType=osType)
        if os.path.exists(ISOCopyPath) == True:
            logging.info("EFI boot config file found in ISO copy....")
            modifyBootCFGFile(osType, ISOCopyPath, ksFile, ksLocation)
        else:
            logging.info("EFI boot config file NOT found in ISO copy....")
    except Exception as err:
        logging.exception(err)
        raise Exception from err


# TODO: TO BE DELETED
def modifyBootCFGFile_RHEL(bootCFGPath, kernelOption, bootMode):
    try:
        logging.debug(bootCFGPath)

        #fh, abs_path = tempfile.mkstemp()
        #print("abx_path: " + str(abs_path))
        logging.debug("bootCFGPath: " + str(bootCFGPath))
        # newbootfile = bootCFGPath + "1"
        # Create temp file in text mode
        newbootfile = tempfile.NamedTemporaryFile(mode='w+t')
        logging.debug("newbootfile: " + str(newbootfile))
        #with os.fdopen(fh, 'w') as newfile:
        # with open(newbootfile, 'w+') as newfile:
        with open(bootCFGPath, "r") as orgfile:
            for line in orgfile:
                logging.debug(f'LINE: {line}')
                if "hd:LABEL" in line:
                    # global osLabel
                    osLabel = line.strip().split("hd:LABEL")[1].split()[0].replace('=', '')
                    line = line.replace(osLabel, "redhat")
                # if bootMode == "Legacy":
                #     if line.startswith('  append') and line.strip('\n').endswith('quiet'):
                #         logging.info("Adding kickstart option: kernelOption: " + kernelOption )
                #         newbootfile.writelines(line.strip('\n') + ' ' + kernelOption + '\n')
                #     else:
                #         newbootfile.writelines(line)
                if bootMode == "EFI":
                    logging.debug(f'Inside EFI block')
                    # if line.strip('\n').endswith('quiet'):
                    if 'linuxefi' in line:
                        logging.info("Adding kickstart option: kernelOption: " + kernelOption)
                        # Remove any other ks= params
                        modified_line = line.split('ks=')[0]
                        newbootfile.writelines(modified_line.strip('\n') + ' ' + kernelOption + '\n')
                    else:
                        if "Test this media" in line:
                            break
                        else:
                            newbootfile.writelines(line)

        orgfile.close()
        newbootfile.flush()
        fin = open(newbootfile.name, 'r')
        data = fin.readlines()
        fin.close()
        logging.debug(data)
        # fout = open(bootCFGPath, 'w')
        # fout.writelines(data)
        # fout.close()
        logging.debug(newbootfile.name)
        shutil.copy(newbootfile.name, bootCFGPath)
    except Exception as err:
        logging.exception(err)
        raise Exception from err


def modifyRHELBootFile(isoCopyPath, ksFile, ksLocation):
    newbootfile = tempfile.NamedTemporaryFile(mode='w+t')
    logging.debug("newbootfile: " + str(newbootfile))

    if ksLocation == "EMBEDDED":
        logging.debug("Embedded KS for RHEL")
        shutil.copy(ksFile, isoCopyPath + "/ks.cfg")
    elif ksLocation == "USB":
        logging.debug("USB KS for RHEL")

    kernel_option = getKernelOption(osType="RHEL", ksLocation=ksLocation)

    boot_cfg_path = isoCopyPath + '/EFI/BOOT/grub.cfg'

    with open(boot_cfg_path, "r") as orgfile:
        for line in orgfile:
            logging.debug(f'LINE: {line}')
            if "hd:LABEL" in line:
                # global osLabel
                osLabel = line.strip().split("hd:LABEL")[1].split()[0].replace('=', '')
                line = line.replace(osLabel, "redhat")

            logging.debug(f'Inside EFI block')
            # if line.strip('\n').endswith('quiet'):
            if 'linuxefi' in line:
                logging.info("Adding kickstart option: kernelOption: " + kernel_option)
                # Remove any other ks= params
                modified_line = line.split('ks=')[0]
                newbootfile.writelines(modified_line.strip('\n') + ' ' + kernel_option + '\n')
            else:
                if "Test this media" in line:
                    break
                else:
                    newbootfile.writelines(line)

    newbootfile.flush()
    logging.debug(open(newbootfile.name).readlines())
    logging.debug(newbootfile.name)
    shutil.copy(newbootfile.name, boot_cfg_path)
    orgfile.close()
    return newbootfile


def modifyUBUNTUBootFile(isoCopyPath, ksFile, ksLocation):

    logging.debug("modifyUBUNTUBootFile: ")

    kernel_option = getKernelOption(osType="UBUNTU", ksLocation=ksLocation)

    if ksLocation == "EMBEDDED":
        logging.debug("Embedded KS for UBUNTU")
        # Copy the kickstart file to root of ISO contents
        nocloud_path = isoCopyPath + "/nocloud"
        if not os.path.exists(nocloud_path):
            os.mkdir(nocloud_path)
        shutil.copy(ksFile, nocloud_path + "/user-data")
        # TODO: Create empty metadata file for now
        if not os.path.exists(nocloud_path + '/meta-data'):
            open(nocloud_path + '/meta-data', "x").close()
    elif ksLocation == "USB":
        logging.debug("USB KS for UBUNTU")

    # TODO (22-Feb-2022) Workaround for subiquity crash during autoinstall due to missing Packages file
    # Err: 4 file: / cdrom focal/main amd64 Packages
    # File not found - / cdrom / dists / focal / main / binary - amd64 / Packages(2: No such file or directory)
    # Workaround for this above error is "extract Packages.gz file"
    cmd = ['gzip', '-dk', isoCopyPath + os.sep + "dists/focal/main/binary-amd64/Packages.gz"]
    ret = subprocess.run(cmd, stderr=subprocess.PIPE, check=False)

    for file1 in ['/boot/grub/grub.cfg', '/isolinux/txt.cfg', '/boot/grub/loopback.cfg']:

        boot_cfg_path = isoCopyPath + file1
        logging.debug(f"Modifying the file {boot_cfg_path}")
        newbootfile = tempfile.NamedTemporaryFile(mode='w+t')

        with open(boot_cfg_path, "r") as orgfile:
            for line in orgfile:
                logging.debug(f'LINE: {line}')

                logging.debug(f'Inside EFI block')
                if '---' in line:
                    logging.info("Adding kickstart option: kernelOption: " + kernel_option)
                    # Remove any other ks= params if present
                    if 'autoinstall' in line:
                        line1 = line.split('autoinstall')[0]
                        # line1 = line1.replace('---', kernelOption,'  ---')
                        line1 = line1 + kernel_option + '  ---'
                    else:
                        line1 = line.replace('---', kernel_option + '  ---')
                    logging.info("Adding kickstart option: line1: " + line1)
                    newbootfile.writelines(line1 + '\n')
                else:
                    if "Test this media" in line:
                        break
                    else:
                        newbootfile.writelines(line)

        newbootfile.flush()
        logging.debug(open(newbootfile.name).readlines())
        logging.debug(newbootfile.name)
        shutil.copy(newbootfile.name, boot_cfg_path)
        orgfile.close()

    #     Now empty the md5sum.txt file which is in the root of ISO files, to skip checkup check by installer
    open(isoCopyPath + "/md5sum.txt", "w").close()

    return


def modifyESXIBootFile(isoCopyPath, ksFile, ksLocation):
    newbootfile = tempfile.NamedTemporaryFile(mode='w+t')
    logging.debug("newbootfile: " + str(newbootfile))

    if ksLocation == "EMBEDDED":
        logging.debug("Embedded KS for ESXi")
        shutil.copy(ksFile, isoCopyPath + "/ks.cfg")
    elif ksLocation == "USB":
        logging.debug("USB KS for ESXI")

    kernel_option = getKernelOption(osType="ESXI", ksLocation=ksLocation)

    boot_cfg_path = isoCopyPath + '/efi/boot/boot.cfg'

    with open(boot_cfg_path, "r") as orgfile:
        for line in orgfile:
            if line.startswith('kernelopt='):
                logging.info("Adding kickstart option: line: " + line)
                # Remove any other ks= params.
                # IMP: ASSUMES ks= parameter at end of the line
                line1 = line.replace('\n', ' ')
                line1 = line1.split('ks=')[0]
                logging.info("Adding kickstart option: line1: " + line1)
                logging.info("Adding kickstart option: kernelOption: " + kernel_option)
                logging.info("Adding kickstart option: " + line1 + " " + kernel_option)
                newbootfile.writelines(line1 + ' ' + kernel_option + '\n')
            else:
                newbootfile.writelines(line)

    newbootfile.flush()
    logging.debug(open(newbootfile.name).readlines())
    logging.debug(newbootfile.name)
    shutil.copy(newbootfile.name, boot_cfg_path)
    orgfile.close()
    return newbootfile


def modifyBootCFGFile(osType, isoCopyPath, ksFile, ksLocation):
    try:
        logging.debug(isoCopyPath)

        logging.debug("isoCopyPath: " + str(isoCopyPath))
        if osType == "RHEL":
            modifyRHELBootFile(isoCopyPath, ksFile, ksLocation)
        elif osType == "UBUNTU":
            modifyUBUNTUBootFile(isoCopyPath, ksFile, ksLocation)
        elif osType == "ESXI":
            modifyESXIBootFile(isoCopyPath, ksFile, ksLocation)

    except Exception as err:
        logging.exception(err)
        raise Exception from err

###################################################################
# Generates ISO 9660 image with contents from 'sourcePath'
###################################################################
def genISO(osType, sourcePath, targetISOPath, hostOSdistro):

    if osType == "RHEL":
        genRHELISO(sourcePath, targetISOPath, hostOSdistro)
    elif osType == "UBUNTU":
        genUBUNTUISO(sourcePath, targetISOPath, hostOSdistro)
    elif osType == "ESXI":
        genESXIISO(sourcePath, targetISOPath, hostOSdistro)
    else:
        raise Exception("Failed to generate unsupported OS.")


def genRHELISO(sourcePath, targetISOPath, hostOSdistro):
    try:
        from shutil import which as which
        cmd = ''
        if hostOSdistro in ['centos','rhel']:
            if which('genisoimage'):
                cmd = 'genisoimage -U -r -v -T -J -joliet-long -V "redhat" -volset "redhat"  -A "redhat"  -b isolinux/isolinux.bin -c isolinux/boot.cat -no-emul-boot -boot-load-size 4 -boot-info-table -eltorito-alt-boot -e images/efiboot.img -no-emul-boot -o %ISOPATH%   %CONTENTS_DIR%'
            else:
                raise Exception('genisoimage tool not found. Need to be installed')
        elif hostOSdistro in ['sles']:
            if which('xorriso') and which('mkisofs'):
                cmd = 'xorriso -as mkisofs -U -r -v -T -J -joliet-long -V "redhat" -volset "redhat"  -A "redhat"  -b isolinux/isolinux.bin -c isolinux/boot.cat -no-emul-boot -boot-load-size 4 -boot-info-table -eltorito-alt-boot -e images/efiboot.img -no-emul-boot -o %ISOPATH%   %CONTENTS_DIR%'
            else:
                raise Exception('xorriso or mkisofs not found. Need to be installed')
        else:
            raise Exception('Host OS distro may not be supported')

        cmd1 = cmd.replace('%ISOPATH%', targetISOPath)
        # cmd1 = cmd.replace('%ISOPATH%', '/tmp/centos.iso')
        cmd2 = cmd1.replace('%CONTENTS_DIR%', sourcePath)
        logging.info(cmd2)

        # TODO review if the below 2 lines are required. Why sleep?
        import time
        time.sleep(10)
        logging.info("genISO: cmd2: " + str(cmd2))

        logging.debug(os.listdir(sourcePath))

        os.system(cmd2)
        # ret = subprocess.run(cmd2.split(' '), stderr=subprocess.PIPE, stdout=subprocess.PIPE, check=False)
        # logging.debug(ret.stdout)
        # logging.debug(ret.stderr)
        # logging.debug(ret.returncode)

    except Exception as err:
        logging.exception(err)
        raise Exception from err

def genUBUNTUISO(sourcePath, targetISOPath, hostOSdistro):
    logging.debug(f"getUBUNTUISO: {sourcePath}, {targetISOPath}")
    try:
        from shutil import which as which
        cmd = ''
        if hostOSdistro in ['centos','rhel']:
            if which('genisoimage'):
                cmd = 'genisoimage -U -r -v -T -J -joliet-long -V "ubuntu" -volset "ubuntu"  -A "ubuntu"  -b isolinux/isolinux.bin -c isolinux/boot.cat -no-emul-boot -boot-load-size 4 -boot-info-table -eltorito-alt-boot -e boot/grub/efi.img -no-emul-boot -o %ISOPATH%  %CONTENTS_DIR%'
            else:
                raise Exception('genisoimage tool not found. Need to be installed')
        elif hostOSdistro in ['sles']:
            if which('xorriso') and which('mkisofs'):
                cmd = 'xorriso -as mkisofs -U -r -v -T -J -joliet-long -V "ubuntu" -volset "ubuntu"  -A "ubuntu"  -b isolinux/isolinux.bin -c isolinux/boot.cat -no-emul-boot -boot-load-size 4 -boot-info-table -eltorito-alt-boot -e images/efiboot.img -no-emul-boot -o %ISOPATH%   %CONTENTS_DIR%'
            else:
                raise Exception('xorriso or mkisofs not found. Need to be installed')
        else:
            raise Exception('Host OS distro may not be supported')

        cmd1 = cmd.replace('%ISOPATH%', targetISOPath)
        # cmd1 = cmd.replace('%ISOPATH%', '/tmp/centos.iso')
        cmd2 = cmd1.replace('%CONTENTS_DIR%', sourcePath)
        logging.info(cmd2)

        # TODO review if the below 2 lines are required. Why sleep?
        import time
        time.sleep(10)
        logging.info("genISO: cmd2: " + str(cmd2))

        logging.debug(os.listdir(sourcePath))

        ret = os.system(cmd2)
        logging.debug(f"Executed the command {cmd2} and the command returned {ret}")
        # ret = subprocess.run(cmd2.split(' '), stderr=subprocess.PIPE, stdout=subprocess.PIPE, check=False)
        # logging.debug(ret.stdout)
        # logging.debug(ret.stderr)
        # logging.debug(ret.returncode)

    except Exception as err:
        logging.exception(err)
        raise Exception from err

###################################################################
# Generates ISO 9660 image with contents from 'sourcePath'
###################################################################
def genESXIISO(sourcePath, targetISOPath, hostOSdistro):
    try:
        from shutil import which
        cmd = ''
        if hostOSdistro in ['centos','rhel']:
            genisoimage = which('genisoimage')
            logging.debug("genisoimage path: {}".format(genisoimage))
            if genisoimage or True:
                cmd = '/usr/bin/genisoimage -relaxed-filenames -J -R -o %ISOPATH% -b isolinux.bin -c boot.cat -no-emul-boot -boot-load-size 4 -boot-info-table -eltorito-alt-boot -e efiboot.img -no-emul-boot %CONTENTS_DIR%'
                # cmd = '/usr/bin/genisoimage -relaxed-filenames -J -R -o %ISOPATH% -b isolinux.bin -c boot.cat -no-emul-boot -boot-load-size 4 -eltorito-alt-boot -e efiboot.img -no-emul-boot %CONTENTS_DIR%'
            else:
                raise Exception('genisoimage tool not found. Need to be installed')
        elif hostOSdistro in ['sles']:
            if which('xorriso') and which('mkisofs'):
                cmd = 'xorriso -as mkisofs -relaxed-filenames -J -R -o %ISOPATH% -b isolinux.bin -c boot.cat -no-emul-boot -boot-load-size 4 -boot-info-table -eltorito-alt-boot -e efiboot.img -no-emul-boot %CONTENTS_DIR%'
            else:
                raise Exception('xorriso or mkisofs not found. Need to be installed')
        else:
            raise Exception('Host OS distro may not be supported')

        cmd1 = cmd.replace('%ISOPATH%', targetISOPath)
        cmd2 = cmd1.replace('%CONTENTS_DIR%', sourcePath)

        logging.debug("genISO: cmd2: " + str(cmd2))

        os.system(cmd2)
        # ret = subprocess.run(cmd2.split(' '), stderr=subprocess.PIPE, stdout=subprocess.PIPE, check=False)
        # logging.debug(ret.stdout)
        # logging.debug(ret.stderr)
        # logging.debug(ret.returncode)

    except Exception as err:
        logging.exception(err)
        raise Exception from err



if __name__ == '__main__':
    #
    #
    print('Main 0')

    modifyESXIBootFile(ksFile="", ksLocation="USB", isoCopyPath="/home/govind/temp/ISO")


