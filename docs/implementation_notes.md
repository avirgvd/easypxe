
***DNSMasq is the PXE Service.***

The /etc/dnsmasq.conf is generated by the tool based on the network settings.
TFTP is supported by DNSMasq.
DNSMasq listens on port 67

For enabling built-in DHCP service:
In the dnsmasq.conf add this line:
dhcp-range=%DHCP_START_IP%,%DHCP_END_IP%,%NETMASK%,24h

For using existing DHCP service in the LAN by working as DHCP Proxy:
in the dnsmasq.conf add this line:
dhcp-range=%SUBNET_ADDR%,proxy



***Samba is used for file share.***

Samba listens on port 
