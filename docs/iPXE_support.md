

For Windows:
https://ipxe.org/howto/winpe
https://ipxe.org/wimboot

https://quadstor.org/windows-server-network-install.html

Need Samba server for sure??
Will Samba server give files at same speed as http server?


In this example, it will allow your user to use clonezilla live to choose 
(1) A samba server as clonezilla home image where images exist.
(2) Choose an image to restore to disk.
https://github.com/stevenshiau/clonezilla/blob/master/samples/custom-ocs-1

Clonezilla boot params documentation:
https://clonezilla.org/fine-print-live-doc.php?path=clonezilla-live/doc/99_Misc/00_live-boot-parameters.doc


Prerequisites for pre-release version of BMA with Samba integration:

```
setenforce 0;
mkdir -p /smb/images
chown -R bma:nginx /smb
chmod -R 755 /smb/
```