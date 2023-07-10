#!/bin/bash

#### PREREQUISITES ##########

# Linux pre-requisites
pre_requisites=("gcc" "openssl" "python3" "python3-devel" "genisoimage" "kpartx" "nginx" "ipxe-bootimgs" "dnsmasq" "unzip")

yumcmd="sudo yum install -y"

# shellcheck disable=SC2068
for var in ${pre_requisites[@]}
do
    if ! rpm --quiet --query $var; then
        yumcmd="$yumcmd $var"
    fi
done

echo "ABOUT TO EXECUTE: $yumcmd"

#eval $yumcmd

#sudo python3 -m pip install --upgrade pip
#sudo python3 -m pip install -r requirements.txt
#### END PREREQUISITES ##########


# Create a system user for this app
# And add easypxe to nginx user group
# Make /var/lib as root dir
sudo useradd -r -m -b /var/lib easypxe -G root,nginx
sudo chown -R easypxe:nginx /var/lib/easypxe

# Below lines can be deleted!
#sudo usermod -a easypxe -G nginx
#sudo usermod -a easypxe -G root

sudo cp service/easypxe-server.service /etc/systemd/system/
sudo cp service/easypxe-utils.service /etc/systemd/system/

# configure firewall to allow https and http for NGINX
sudo firewall-cmd --add-service=http
sudo firewall-cmd --add-service=https
sudo firewall-cmd --runtime-to-permanent

sudo mkdir -p /usr/share/nginx/html/images
sudo mkdir -p /usr/share/nginx/html/apidocs
# Give full ownership to BMA and read-only access to NGINX
sudo chown -R easypxe:nginx /usr/share/nginx/html/images
sudo chmod -R 755 /usr/share/nginx/html/images

# TODO Review the following SSL params
sudo cp nginx/ssl.conf /etc/nginx/conf.d/ssl.conf
sudo cp nginx/ssl-redirect.conf /etc/nginx/default.d/

sudo mkdir -p /usr/local/easypxe/bin
sudo mkdir -p /usr/local/easypxe/utils
sudo mkdir -p /usr/local/easypxe/conf
sudo mkdir -p /usr/local/easypxe/logs
# For PXE support
sudo mkdir -p /usr/share/nginx/html/pxe
sudo mkdir -p /usr/local/easypxe/tftpboot
sudo chcon -t tftpdir_t /usr/local/easypxe/tftpboot
sudo cp /usr/share/ipxe/{undionly.kpxe,ipxe.efi,ipxe*.efi} /usr/local/easypxe/tftpboot
sudo mkdir -p /usr/local/easypxe/tftpboot/menu
#sudo curl -o /usr/local/easypxe/tftpboot/menu/wimboot -L https://github.com/ipxe/wimboot/releases/download/v2.7.4/wimboot
sudo firewall-cmd --add-service=dhcp --permanent
sudo firewall-cmd --add-service=tftp --permanent
sudo firewall-cmd --add-service=dns --permanent
sudo firewall-cmd --reload
#sudo mkdir -p /var/www/images
#sudo chmod -R 666 /var/www/images
#sudo chcon -R system_u:object_r:httpd_sys_content_t:s0 /var/www/images

mkdir -p build/easypxe-utils/
cp -f src/easypxe-utils/*.py build/easypxe-utils/
#/usr/local/bin/sourcedefender encrypt build/easypxe-utils/*.py
sudo cp -f build/easypxe-utils/*.py /usr/local/easypxe/utils/
sudo cp -f build/easypxe-utils/service.py /usr/local/easypxe/utils/

mkdir -p build/easypxe-server/
cp -f src/easypxe-server/*.py build/easypxe-server/
#/usr/local/bin/sourcedefender encrypt build/easypxe-server/*.py
sudo cp -f build/easypxe-server/*.py /usr/local/easypxe/bin/
sudo cp -f build/easypxe-server/wsgi.py /usr/local/easypxe/bin/
sudo cp -rf etc/easypxe.ini /usr/local/easypxe/bin/

#sudo cp -R kickstarts /usr/local/easypxe/
sudo cp -R scripts /usr/local/easypxe/
sudo cp -R etc /usr/local/easypxe/
sudo chown -R easypxe:nginx /usr/local/easypxe
sudo chown -R root:root /usr/local/easypxe/utils

# Allow NGINX to access uwsgi socket file by setting httpd_t permissive
# Note that this command permanently sets httpd_t type SELinux context to permissive.
# Be aware of potential security holes.

# When semanage command fails, run this command to fix: # sudo dnf reinstall platform-python-setuptools
#sudo semanage permissive -a httpd_t
sudo setsebool -P httpd_can_network_relay 1

#sudo cp certs/dhparam.pem /etc/ssl/certs/
#sudo cp certs/nginx-selfsigned.crt /etc/ssl/private/
#sudo cp certs/nginx-selfsigned.key /etc/ssl/private/

sudo systemctl daemon-reload
#sudo systemctl restart easypxe-es
sleep 20
sudo systemctl restart easypxe-utils
sudo systemctl restart easypxe-server
sudo systemctl restart nginx
