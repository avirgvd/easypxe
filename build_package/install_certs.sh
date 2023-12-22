sudo mkdir -p /etc/ssl/private
sudo chmod 700 /etc/ssl/private

sudo cp dhparam.pem /etc/ssl/certs/
sudo cp nginx-selfsigned.crt /etc/ssl/private/
sudo cp nginx-selfsigned.key /etc/ssl/private/

