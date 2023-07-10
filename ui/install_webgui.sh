#!/bin/bash

# Why you should do it regularly:
npx browserslist@latest --update-db

sudo mkdir -p /usr/share/nginx/html/ui
sudo rm -rf /usr/share/nginx/html/ui/*
sudo cp -Rf dist/* /usr/share/nginx/html/ui/
sudo chown -R easypxe:nginx /usr/share/nginx/html/ui