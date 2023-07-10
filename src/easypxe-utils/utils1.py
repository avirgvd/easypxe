
import os
import stat
import shutil
import logging
import subprocess
import tempfile
# import zipfile
import pathlib
import requests
import json


# This utility function copies all files and directories under 'source_dir' to 'target_dir'
def copy_tree(source_dir, target_dir):
    logging.info("copy_tree: source_dir: " + str(source_dir) + " target_dir: " + str(target_dir))
    if not os.path.exists(target_dir):
        logging.debug("The target directory {} is missing or not accessible".format(target_dir))
        raise Exception("The target directory {} is missing or not accessible".format(target_dir))
    for item in os.listdir(source_dir):
        s = os.path.join(source_dir, item)
        d = os.path.join(target_dir, item)
        logging.debug(s)
        logging.debug(d)
        if os.path.islink(s):
            # Ubuntu ISO image has a symbolic link 'ubuntu' that points to root.
            # This check is to prevent looping of copying in nested paths
            logging.debug("its a symbolic link")
            copy3(s, d)
            logging.debug(os.path.exists(d))
        elif os.path.isdir(s):
            logging.debug("its a dir")
            shutil.copytree(s, d, copy_function=copy3)
            logging.debug(os.path.exists(d))
        else:
            logging.debug("its a file")
            copy3(s, d)
            # os.chmod(d, stat.S_IREAD | stat.S_IWRITE)
            logging.debug(os.path.exists(d))


def copy3(source, destination):
    shutil.copy2(source, destination, follow_symlinks=False)
    # Set read and write permissions at group level?
    # stat.S_IRGRP, stat.S_IWGRP
    # stat.S_IREAD stat.S_IWRITE
    #os.chmod(destination, stat.S_IREAD | stat.S_IWRITE)
    os.chmod(destination, stat.S_IREAD | stat.S_IWRITE | stat.S_IWOTH | stat.S_IWGRP | stat.S_IRGRP | stat.S_IROTH)

def getFileType(ISOPath):

    cmd = ['file', '-i', ISOPath]
    ret = subprocess.run(cmd, stderr=subprocess.PIPE, stdout=subprocess.PIPE, check=False)
    logging.debug(f"ret: {ret}")
    logging.debug(f"ret code: {ret.returncode}")
    stdout = ret.stdout.decode('utf-8')
    logging.debug(f"stdout: {stdout}")

    if "application/x-iso9660-image" in stdout:
        logging.debug("YES it is ISO")
        return "ISO"
    elif "application/x-tar" in stdout:
        logging.debug("Yes its tar")
        return "TAR"
    elif "application/x-gzip" in stdout:
        logging.debug("Yes its tar-gzip")
        return "TAR-GZIP"
    elif "application/zip" in stdout:
        logging.debug("YES its a ZIP file")
        return "ZIP"
    elif "application/octet-stream" in stdout:
        logging.debug("Unknown archive type")
        return "Unknown"


def extractISO(imagePath, targetDir):

    mount_path = tempfile.TemporaryDirectory()
    cmd = ['mount', '-o', 'loop', imagePath, mount_path.name]
    ret = subprocess.run(cmd, stderr=subprocess.PIPE, check=False)
    logging.debug(ret.stderr)
    logging.debug(ret.returncode)
    if ret.returncode:
        raise Exception(ret.stderr)

    # create target directory
    # os.mkdir(targetDir)

    try:
        # copy_tree(mount_path.name + os.sep, targetDir + os.sep)
        # Should copy the files retaining the permissions
        # copytree creates the dest dir, so it should not exist already
        # TODO What happens if cp fails due to lack of disk space? Need to handle this scenario
        shutil.copytree(mount_path.name + os.sep, targetDir + os.sep, copy_function=shutil.copy)

        # Change the files ownership to bma:nginx, else cannot be accessed through Samba share.
        cmd = ['chown', '-R', 'bma:nginx', targetDir]
        subprocess.run(cmd, stderr=subprocess.PIPE, check=False)
        logging.debug(ret.stderr)
        logging.debug(ret.returncode)
        if ret.returncode:
            raise Exception(ret.stderr)
    finally:
        # Unmount the ISO
        cmd = ['umount', mount_path.name]
        ret = subprocess.run(cmd, stderr=subprocess.PIPE, check=False)
        logging.debug(ret.stderr)
        logging.debug(ret.returncode)


def extractZIP(imagePath, targetDir):
    # The option -X is for retaining the Windows file ACLs and UID/GID during extraction
    cmd = ['unzip', '-X', imagePath, '-d', targetDir]
    ret = subprocess.run(cmd, stderr=subprocess.PIPE, stdout=subprocess.PIPE, check=False)
    # logging.debug(f"ret: {ret}")
    logging.debug(f"ret code: {ret.returncode}")

    # Change the files ownership to bma:nginx, else cannot be accessed through Samba share.
    cmd = ['chown', '-R', 'bma:nginx', targetDir]
    subprocess.run(cmd, stderr=subprocess.PIPE, check=False)
    logging.debug(ret.stderr)
    logging.debug(ret.returncode)
    if ret.returncode:
        raise Exception(ret.stderr)


def extractTAR(imagePath, targetDir):
    cmd = ['tar', '-xvf', imagePath, '-C', targetDir]
    ret = subprocess.run(cmd, stderr=subprocess.PIPE, stdout=subprocess.PIPE, check=False)
    # logging.debug(f"ret: {ret}")
    logging.debug(f"ret code: {ret.returncode}")

    # Change the files ownership to bma:nginx, else cannot be accessed through Samba share.
    cmd = ['chown', '-R', 'bma:nginx', targetDir]
    subprocess.run(cmd, stderr=subprocess.PIPE, check=False)
    logging.debug(ret.stderr)
    logging.debug(ret.returncode)
    if ret.returncode:
        raise Exception(ret.stderr)

def deleteDir(path, force=True):
    logging.debug(f"deleteDir: deleting directory {path}")
    shutil.rmtree(path)


def smartExtract(imagePath, targetDir, force=False):
    logging.debug(f"smartExtract: {imagePath}, {targetDir}, {force}")

    # If same PXE configuration is applied again, extraction can be skipped.
    # Skip  extraction if path already exists.
    # if force=False and target directory already exists with files
    if force == False and os.path.exists(targetDir):
        return

    # If force=True then delete the target directory and its contents first
    if force:
        shutil.rmtree(targetDir)

    cmd = ['file', '-i', imagePath]
    ret = subprocess.run(cmd, stderr=subprocess.PIPE, stdout=subprocess.PIPE, check=False)
    logging.debug(f"ret: {ret}")
    logging.debug(f"ret code: {ret.returncode}")
    stdout = ret.stdout.decode('utf-8')
    logging.debug(f"stdout: {stdout}")

    if "application/x-iso9660-image" in stdout:
        logging.debug("YES it is ISO")
        extractISO(imagePath, targetDir)
        return "ISO"
    elif "application/x-tar" in stdout:
        logging.debug("Yes its tar")
        extractTAR(imagePath, targetDir)
        return "TAR"
    elif "application/x-gzip" in stdout:
        logging.debug("Yes its tar-gzip")
        extractTAR(imagePath, targetDir)
        return "TAR-GZIP"
    elif "application/zip" in stdout:
        logging.debug("YES its a ZIP file")
        extractZIP(imagePath, targetDir)
        return "ZIP"
    elif "application/octet-stream" in stdout:
        logging.debug("Unknown archive type")
        return "Unknown"

    return None


# For Windows MDT custom images, the files with extension EXE, DLL are
# expected to have execute permissions on Linux side. Extract from ZIP file is able to
# retain Windows ACLs and execute permissions for directories but files missing exec
# permissions
#  This function finds all files with "dll" and "exe" extensions and sets execute permissions
def ensurePermissions(path):
    logging.debug(f"ensurePermissions: path {path}")

    if os.path.isdir(path):
        for root, dirs, files in os.walk(path):
            # Set Read and execute permissions to all *.exe
            for file in files:
                # Get file extension if any
                file_extn = pathlib.Path(file).suffix
                if file_extn in ['.exe', '.EXE', '.dll', '.DLL']:
                    os.chmod(root + os.sep + file,
                         stat.S_IRUSR | stat.S_IRGRP | stat.S_IROTH |
                         stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH)
    else:
        # bad
        raise Exception("The input path is not directory")



if __name__ == '__main__':
    import sys
    logging.basicConfig(stream=sys.stdout, level=logging.DEBUG)

    print("main")
    # getFileType("/DATA/WindowsServer2012.ISO")
    # getFileType("/DATA/WebStorm-2021.1.3.tar.gz")
    # getFileType("/DATA/win2k19.qcow2")
    # getFileType("/home/govind/RedefinIT/SOURCES/build/release.tar")
    getFileType("/home/govind/RedefinIT/SOURCES/build/BMA-v0.2.tar.gz")
    getFileType("/home/govind/Downloads/clonezilla-live-2.8.1-12-amd64.zip")



