
Production Server Configuration
-------------------------------

Install node and supporting services on the production server:

```
sudo su -
apt-get update && apt-get upgrade
apt-get install -y build-essential nginx git
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.29.0/install.sh | bash
source ~/.profile
nvm ls-remote
nvm install 0.12.4
nvm use 0.12.4
n=$(which node);n=${n%/bin/node}; chmod -R 755 $n/bin/*; sudo cp -r $n/{bin,lib,share} /usr/local
n=$(which npm);n=${n%/bin/npm}; chmod -R 755 $n/bin/*; sudo cp -r $n/{bin,lib,share} /usr/local
exit
sudo su -
which node
which npm
npm install -g strongloop
cd /app
```

Clone the repo on the target server, and run the custom pm-install

```
ssh [__SERVER_NAME__]
git clone git@github.com:Ylopo/thousand-stars.git
cd thousand-stars
npm install @ylopo/sys-installer
node installers/thousand-stars.js -e production pm-install
```


and start the service

`sudo start strong-pm-thousand-stars`


Build and Deploy
----------------

Build the node application via:

`npm run build`

Connect to the appropriate VPN and ship the bundle with the following command.

production:


`./deploy-prod.sh ../path-to-build.tgz`

staging:

`./deploy-staging.sh ../path-to-build.tgz`


Additional Configuration
------------------------

Install and configure nginx as needed via proxy.  If your load balancer is going directly to the app-url.com:port this is not necessary.
The below nginx configuration enables nginx to work as an internal load balancer.

```
# node application
server {
        server_name some-node-application.com
        location / {
                proxy_set_header X-Forwarded-Host $host;
                proxy_set_header X-Forwarded-Server $host;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_pass http://127.0.0.1:7811/;
        }
}
```
