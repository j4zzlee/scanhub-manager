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
