@setlocal enableextensions enabledelayedexpansion
@echo off
set "machine=%1"
set "container=%2"
set "workingDirectory=%3"

docker-machine env %machine%
@FOR /f "tokens=*" %%i IN ('docker-machine env %machine%') DO @%%i

docker exec %container% bash -c "cd %workingDirectory% && git reset --hard"
docker exec %container% bash -c "cd %workingDirectory% && git pull"
docker exec %container% bash -c "cd %workingDirectory% && npm install"
docker exec %container% bash -c "cd %workingDirectory% && npm run build"
docker exec %container% bash -c "cd %workingDirectory% && sequelize db:migrate"
docker exec %container% bash -c "cd %workingDirectory% && supervisorctl restart scanhubpostbuild:"

@endlocal