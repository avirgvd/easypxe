#!/bin/bash

if [[ $1 == "" ]]; then
  echo "Parameter missing for build file name with version like EasyPXE-v1.0.00.00"
  exit 0
fi

rm -rf $1
mkdir $1

mkdir -p $1/bin
mkdir -p $1/utils
mkdir -p $1/certs
mkdir -p $1/apidocs

cp ../../SSL_Certs/* $1/certs/

cp ../requirements.txt ./$1/
mkdir -p ./$1/pythonpackages
rm -rf ./$1/pythonpackages/*
pip3 download -d ./$1/pythonpackages pip
pip3 download -d ./$1/pythonpackages -r ./$1/requirements.txt

cp -rf ../service ./$1/
#cp -rf ../bma/kickstarts ./$1/

mkdir -p easypxe-utils

cp -f ../src/easypxe-utils/*.py easypxe-utils/
#/usr/local/bin/sourcedefender encrypt easypxe-utils/*.py

mkdir -p easypxe-server/
cp -f ../src/easypxe-server/*.py easypxe-server/
#/usr/local/bin/sourcedefender encrypt easypxe-server/*.py

#cp -rf easypxe-utils/*.pye ./$1/utils/
cp -rf easypxe-utils/*.py ./$1/utils/
cp -f easypxe-utils/service.py ./$1/utils/

#cp -rf easypxe-server/*.pye ./$1/bin/
cp -rf easypxe-server/*.py ./$1/bin/
cp -f easypxe-server/wsgi.py ./$1/bin/
cp -f ../etc/bma.ini ./$1/bin/

cp -rf ../nginx ./$1/
cp -rf ../etc ./$1/
cp -rf ../scripts ./$1/
cp -rf ../swagger/dist/* ./$1/apidocs/

cp ../install.sh ./$1/

# Download wimboot for iPXE Windows support
curl -o ./$1/wimboot -L https://github.com/ipxe/wimboot/releases/download/v2.7.4/wimboot

# build Web GUI
cd ../ui/
npm run dist
cp -rf dist ../build_package/$1/
cp install_webgui.sh ../build_package/$1/
cd -

# Create release package
tar -cvf $1.tar $1
gzip $1.tar

