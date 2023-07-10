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
5000 – Incoming traffic on this port for BMA server side component
80 – Web-UI and HTTP File server

#### Enable the HTTP/HTTPS service in the VM that is running BMA
sudo firewall-cmd --zone=public --permanent --add-service=http
sudo firewall-cmd --zone=public --permanent --add-service=https


### Setup
The installation can be performed using the following steps:

1. Download/Extract the BMA.tar or git clone the BMA repository to the local directory in the CentOS/RHEL host. This will be install directory for the tool.

2. Initialize and install the python code by running the following command.

``` python setup.py install ```

Note: This module depends on Python3. If the default interpreter is not python3, perform the setup tasks using python3. If bma should be installed only for currently running user, use --user option.

``` python3 setup.py install ```

This command installs all the required pre-requisites from requirements.txt, creates the directory hierarchy and enables BMA as a systemd service.

### Configuration

1. If the setup is successful, the following directories are created.

| Directory | Description |
| ---------:|:-----------:|
| /usr/local/bma      |  Default path for all EasyPXE related files
| /usr/local/easypxe/etc  |  Configuration files of EasyPXE
| /usr/local/easypxe/lib  |  All dependent python libraries
| /usr/local/easypxe/bin  |  Binaries of EasyPXE
| /usr/local/easypxe/data |  All data files
| /usr/local/easypxe/logs  |  Log files

2. Edit the configuration in the following path `/usr/local/easypxe/etc/config.ini`

| Parameter | Default    |   Description  |
| ---------:|:----------:|:----------:|
| server    | **Mandatory**  | **IP address of the BMA server (Mandatory)**
| port      |   5000     | Port to run the REST API server on the BMA server
| log_path  | /usr/local/easypxe/logs | Path for the BMA log directory
| log_level | INFO       | Log level

### Service

**IMP: Ensure BMA server IP address is updated in the configuration file `/usr/local/easypxe/etc/config.ini`. **
**This IP address setting is essential for BMA functionality.**

1. Load the BMA service by reloading the systemd

`systemctl daemon-reload`

2. Start the bma server using systemd service

`systemctl start easypxe-service.service`
`systemctl start easypxe-utils.service`

The BMA server backend will be started on server address and host specified in the config file

### Install BMA Web Client

Run the below command to install and configure web server:

Now the tool should be ready. To access the Web-UI from browser, use the url http://<host-IP-address>/ where “host-IP address in the IP address of the host that is running the BMA tool.



## Limitations and known issues
