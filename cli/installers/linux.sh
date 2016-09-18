#!/usr/bin/env bash

RED='\033[0;31m'
GREY='\033[0;37m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

force="$1"
targetFolder="$2"
nodePort="$3"
createMachine="0"
DOCKER_MACHINE="scanhub"
machine=$(docker-machine ls -q | grep '^scanhub')

if [[ ${machine} == ${DOCKER_MACHINE} ]]
then
    if [[ ${force} == "--force" ]]
    then
        docker-machine rm scanhub --force
        createMachine="1"
    fi
else
    createMachine="1"
fi

if [[ ${createMachine} == "1" ]]
then
    docker-machine create --driver virtualbox scanhub
else
    echo "The host scanhub is already exists. Please remove it first using command: docker-machine rm scanhub"
    exit 1;
fi

docker-machine env scanhub
eval $(docker-machine env scanhub)
VBoxManage controlvm scanhub natpf1 "api,tcp,127.0.0.1,${nodePort},,${nodePort}"
VBoxManage controlvm scanhub natpf1 "elastic,tcp,127.0.0.1,9200,,9200"
VBoxManage controlvm scanhub natpf1 "mysql,tcp,127.0.0.1,3306,,3306"
VBoxManage controlvm scanhub natpf1 "redis,tcp,127.0.0.1,6379,,6379"
VBoxManage controlvm scanhub natpf1 "rabbitmq,tcp,127.0.0.1,5672,,5672"

cd ${targetFolder}
docker-compose up -d

#
#[ $? != 0 ] && \
#    echo -e "${RED}*** Could not pull images. Please double check your Docker Hub credentials!${NC}" && \
#    echo -e "${RED} (*)Please login to Docker Hub using command: ${GREEN}docker login${NC}" && \
#    echo -e "${RED} (*)If you think this is a mistake, please email to our supporter at: ${GREEN}support@shodan.io${NC}" && \
#    exit 100
#
#echo -e " ${GREEN}(*) You have successfully installed new Scanhub API servers.${NC}"
#echo -e " ${RED}(*) It is up to you to share the API across your networks${NC}"
#echo -e " - The set up folder is located at ${GREEN}${targetFolder}/scanhub${NC}"
#echo -e " - The API server is located at ${BLUE}http://localhost:${NODE_PORT}/api/1.0${NC}"
#echo -e " - To list all running servers, please open terminal and enter: ${GREEN}docker ps${NC}"
#echo -e " - To ssh to running server, please open terminal and enter: ${GREEN}docker exec -it ${GREY}<server_name>${GREEN} bash${NC}"
#echo -e " - To initialize API server, please ssh to the server and type: ${GREEN}scanhub api:init${NC}"
#echo -e " - To upgrade API server, please ssh to the server and type: ${GREEN}scanhub api:upgrade${NC}"
#echo -e " - For more information, please take a look to our document at ${BLUE}http://scanhub.io/documents/scanhub_api_1.0_manual.pdf${NC}"
