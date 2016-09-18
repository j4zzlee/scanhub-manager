# scanhub-manager

1. Scanhub Installer:
 - Install Docker: https://docs.docker.com/engine/installation/
 - Install VirtualBox: https://www.virtualbox.org/wiki/Downloads
 - Install Nodejs: https://nodejs.org/en/download/current/
 - Install scanhub-manager-cli: npm install scanhub-manager-cli
 - To know more information about scanhub-manager-cli, type: scanhub-manager-cli --help
 - To install Scanhub API: scanhub-manager-cli api:install [--force] [--port 3000]

2. Other projects
 - We have scanhub-cli command for uploading/querying/searching hosts from: https://github.com/st2forget/scanhub-cli

3. Notes:
 - You must login to DockerHub first. Or else, the command will failed to pull scanhub's private repositories from DockerHub
 - Please make sure that you have the right to access private repositories from DockerHub including: scanhub/es, scanhub/api, scanhub/mysql

4. Road Maps:
 - Upgrade Scanhub API command
