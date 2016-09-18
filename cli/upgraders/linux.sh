#!/usr/bin/env bash

machine="$1"
container="$2"
workingDirectory="$3"

echo ${machine}
echo ${container}
echo ${workingDirectory}

docker-machine env ${machine}
eval $(docker-machine env ${machine})

docker exec ${container} bash -c "cd ${workingDirectory} && git reset --hard"
docker exec ${container} bash -c "cd ${workingDirectory} && git pull"
docker exec ${container} bash -c "cd ${workingDirectory} && npm install"
docker exec ${container} bash -c "cd ${workingDirectory} && npm run build"
docker exec ${container} bash -c "cd ${workingDirectory} && sequelize db:migrate"
docker exec ${container} bash -c "cd ${workingDirectory} && supervisorctl restart scanhubpostbuild:"


