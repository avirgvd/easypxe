# EASYPXE


## Key Features
* 


## Ecosystem Projects
*

## Supported Hardware Products


## Supported Operating Systems and Hypervisors
* 

## Installation 

The software for EasyPXE is available as installable package. 
After the installation it runs as Systemd serverice with service name **easypxe**.

### Pre-requisites

CentOS 7.x, RHEL 7.x, or SLES15 VM with 8 VCPUs and 8GB or more.

#### Pre-requisites packages for SLES15 host
- mkisofs
- xorriso
- kpartx 
- python3-setuptools
- apache2
- python3

**Software packages:**
* Python v3.6
* Pip 19.0.3
* Apache Webserver (httpd service) v2.4.6
* kpartx v0.4.9
* genisoimage v1.1.11
* openssl v1.0.2k-fips

#### Storage
50 GB or more. Storage requirement for OS image ISO files.

#### Ports to be allowed by Firewall
5000 – Incoming traffic on this port for EasyPXE server side component
80 – Web-UI and HTTP File server

#### Enable the HTTP/HTTPS service in the VM that is running EasyPXE
sudo firewall-cmd --zone=public --permanent --add-service=http
sudo firewall-cmd --zone=public --permanent --add-service=https


### Setup
The installation can be performed using the following steps:

1. Download/Extract the EasyPXE.tar or git clone the EasyPXE repository to the local directory in the CentOS/RHEL host. This will be install directory for the tool.

2. Initialize and install the python code by running the following command.

``` python setup.py install ```

Note: This module depends on Python3. If the default interpreter is not python3, perform the setup tasks using python3. Use --user option to install only for the current user.

``` python3 setup.py install ```

This command installs all the required pre-requisites from requirements.txt, creates the directory hierarchy and enables EasyPXE as a systemd service.

### Configuration

1. If the setup is successful, the following directories are created.

| Directory | Description |
| ---------:|:-----------:|
| /usr/local/easypxe      |  Default path for all EasyPXE related files
| /usr/local/easypxe/etc  |  Configuration files of EasyPXE
| /usr/local/easypxe/lib  |  All dependent python libraries
| /usr/local/easypxe/bin  |  Binaries of EasyPXE
| /usr/local/easypxe/data |  All data files – This would include all the config giul, osimages, etc.,
| /usr/local/easypxe/logs  |  Log files

2. Edit the configuration in the following path `/usr/local/easypxe/etc/config.ini`

| Parameter | Default    |   Description  |
| ---------:|:----------:|:----------:|
| server    | **Mandatory**  | **IP address of the EasyPXE server (Mandatory)**
| port      |   5000     | Port to run the REST API server on the EasyPXE server
| log_path  | /usr/local/easypxe/logs | Path for the EasyPXE log directory
| log_level | INFO       | Log level

### Service

**IMP: Ensure EasyPXE server IP address is updated in the configuration file `/usr/local/easypxe/etc/config.ini`. **
**This IP address setting is essential for EasyPXE functionality.**

1. Load the EasyPXE service by reloading the systemd

`systemctl daemon-reload`

2. Start the easypxe server using systemd service

`systemctl start easypxe-service.service`
`systemctl start easypxe-utils.service`

The EasyPXE server backend will be started on server address and host specified in the config file

### Install EasyPXE Web Client

Run the below command to install and configure web server:

``` ./configureWeb.sh ```

**IMP: The above script can install the Web Client only on Apache HTTPD server running local to machine where EasyPXE service is running**

Now the tool should be ready. To access the Web-UI from browser, use the url http://<host-IP-address>/ where “host-IP address in the IP address of the host that is running the EasyPXE tool.



## Limitations and known issues

| S.No| Limitation/Known issue                         | Remarks                             |
|--------|------------------------------------------------|-------------------------------------|
| 1   | Gen9 support is not available for Synergy blades	|  |
| 2   | With “secure boot” enabled in BIOS, SSH service will not be enabled by default for hosted deployed with ESXi| This is limitation by VMWare ESXi kickstart. Investigating a work-around.|
| 3   | Bulk deployment using JSON is disabled in the UI         | This feature is not enabled as enough testing not done|
| 4   | Legacy BIOS is not supported         | This support can be added on request |
| 5   | DHCP option not selectable | This feature will be enabled in next version|
| 6 | Web-UI doesn’t show error messages when any operation is failed on the server side. | Work in progress |
| 7 | Setup script shows error message “Could not find a version that satisfies the requirement Click==7.0” | Ignore this error.| 


