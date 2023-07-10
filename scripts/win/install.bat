wpeinit
ping %GATEWAY%
net use k: \\%SAMBA_PATH% /user:bma bma
k:
setup.exe
echo "Press any key to reboot!"
pause