

Kickstart examples
https://github.com/vrillusions/ubuntu-kickstart


Script for generating auto installing Ubuntu ISO

https://github.com/covertsh/ubuntu-autoinstall-generator

Read this interesting post:

https://discourse.ubuntu.com/t/automated-server-install-quickstart/16614/31

STATUS: 
The kickstart approach not working for Ubuntu. Need fresh look whether kickstart is right or Ubuntu specific approach.

## Switching to Ubuntu autoinstall method
Ref: https://ubuntu.com/server/docs/install/autoinstall

Creating an autoinstall config

When any system is installed using the server installer, an autoinstall file for repeating the install is created at /var/log/installer/autoinstall-user-data.

Contact the author of below article to demo BMA:
https://www.pugetsystems.com/labs/hpc/How-To-Make-Ubuntu-Autoinstall-ISO-with-Cloud-init-2213/


Prior to Ubuntu 20.04 the Ubuntu server installer used the Debian installer with 
pre-seed files for configuration. (Preseed installs are still possible with the 
Desktop installer.) With the 20.04 release a new install mechanism was introduced 
using "cloud-init" and "curtin" with the Ubuntu subiquity install program.

## Requirements:
### Query NICs using the adapterId and portId or mac-address, and use the matching NIC 
to configure IP address.

### Query local RAID drives by drive index number and use the matching drive for OS drive.

### Include/Exclude packages from the ISO image while installing.

### Enable/disable/configure system services

#### Enable or disable system services

## Implementation

### Autoinstall cloud-init user-data

Command for validation of user-data:

`cloud-init devel schema --config-file user-data`

#### Configure Firewall rules



## Challenges

1. Making autoinstall work
2. Storage drive selecting using Early-commands
3. Network port selection using Early-commnands
4. Package selection - how much control it gives on including and excluding packages.
5. Accessing user-data from USB drive



## About cloud-init

early-commands: a list of shell commands to invoke before probing for block and network devices. The autoinstall config is at /autoinstall.yaml and it will be re-read after early-commands have run.

Read this -> 
https://cloudinit.readthedocs.io