
Windows 10 deployment using iPXE requires boot.ipxe with this:
```shell
imgfree
#set boot-url http://192.168.3.64/pxe/5a3a40df6de54755b6700315ac78bb58
set boot-url http://192.168.1.68/pxe/931b05efc19c4115b13bef2a63b22548
kernel wimboot
initrd ${boot-url}/bootmgr                  bootmgr
initrd ${boot-url}/install.bat              install.bat
initrd ${boot-url}/winpeshl.ini             winpeshl.ini
initrd -n BCD ${boot-url}/boot/bcd          BCD ||
initrd -n BCD ${boot-url}/Deploy/Operating%20Systems/Windows%20Ent%20x64/boot/bcd          BCD ||
initrd ${boot-url}/boot/boot.sdi     boot.sdi ||
initrd ${boot-url}/Deploy/Operating%20Systems/Windows%20Ent%20x64/boot/boot.sdi     boot.sdi ||
initrd -n boot.wim ${boot-url}/sources/boot.wim  boot.wim ||
initrd -n boot.wim ${boot-url}/Deploy/Operating%20Systems/Windows%20Ent%20x64/sources/boot.wim  boot.wim ||
imgstat
boot
       
```

WinPE which is live media loaded into RAMFS needs additional installation files which cannot be shared using HTTP file server.
The additional files can be shared using Samba. To make this work, place two files under the root of the directory 

winpeshl.ini
```buildoutcfg
[LaunchApps]
"install.bat"
```

install.bat
```commandline
wpeinit
pause
ipconfig
net use k: \\192.168.1.68\bma\931b05efc19c4115b13bef2a63b22548 /user:<user name> <password>
pause
echo "STARTING ANOTHER COMMAND PROMPT FOR TROUBLESHOOTING"
start

k:
dir k:\setup.exe
pause
dir k:
ping 192.168.1.68
pause
setup.exe
pause
cd sources
setup.exe
pause
```

For troubleshooting the installer issues if a command prompt is needed the the command "start" launches a command prompt as in the above example script.

If running setup.exe fails with "Access Denied" error, it may be due to file permission. To resolve this do this:
On Samba server, set execute permission to "setup.exe" and all DLLs under sources. Using the command:

``sudo  chmod +x *.dll``

```-r-xr-xr-x.  1 govind govind   74184 Oct  7  2021 setup.exe```
