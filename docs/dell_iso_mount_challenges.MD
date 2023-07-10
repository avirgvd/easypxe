

##Problem
Dell iDRAC9 supports virtual media mount as CD as well as Floppy/USB. However both cannot be mounted simultaneously.

BMA relies on ability to mount an ISO and Floppy image simultaneously to carry on the deployment.
To support Dell, BMA needs to work differently as compared to HPE which allows simultaneous mounts.

##Solution
Create deployment specific modified ISO with embedded kickstart file. However the embedded kickstart should be common to all the servers in a batch.

The key inputs to a kickstart that are unique to a host are:
MAC address
IP address (for static assignment)
storage device ID.

The approach should work for all supported OS's.

Approach 1:
Use DHCP first to get an IP.
Make a rest call to BMA to pull host specific information. The call should send server serial number with it.

Pros:
Simple approach. Works best if IP assignment mode is DHCP.

Cons:
Has DHCP dependency.
If the IP assignment method is Static, then additional DHCP IP pool is required to provide IPs for short period but enough IPs for all hosts in a given deployment.
If DHCP IP allocation fails, then entire deployment fails.


Approach 2:
Generate Kickstart coded with all mac-addresses for hosts in a batch. Same with storage device IDs.

Pros:

Cons:
Implementation is complex.

ESXI
Command to get server serial number:
esxcli hardware platform get | grep "  Serial Number:" | awk -F" " '{print $3}'

Trying HTTPS commands from ESXi shell requires firewall rule to allow outgoing 443 port. Otherwise the following command will fail: 
`# wget https://192.168.3.51/rest/kickstart/machinedata/1/2 --no-check-certificate -S`

TODO: Need to check if ESXi install allows https calls from kickstart.
