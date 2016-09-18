@setlocal enableextensions enabledelayedexpansion
@echo off

set force=0
set hostExists=0
if "%1"=="--force" (
	set force=1
)

set "pattern=scanhub"
for /f %%i in ('docker-machine ls') do (
	set "line=%%i"
	If NOT "!line:%pattern%=!"=="!line!" (
		set hostExists=1
		break
	)
)

if "%hostExists%"=="1" (
	if not "%force%"=="1" (
		echo The host scanhub is already exists. Please remove it first using command: docker-machine rm scanhub
		exit /b 1
	) else (
		docker-machine rm scanhub --force
	)
)

docker-machine create --driver virtualbox scanhub
docker-machine env scanhub
@FOR /f "tokens=*" %%i IN ('docker-machine env scanhub') DO @%%i

VBoxManage controlvm scanhub natpf1 "api,tcp,127.0.0.1,%3,,%3"
VBoxManage controlvm scanhub natpf1 "es,tcp,127.0.0.1,9200,,9200"
VBoxManage controlvm scanhub natpf1 "mysql,tcp,127.0.0.1,3306,,3306"
VBoxManage controlvm scanhub natpf1 "redis,tcp,127.0.0.1,6379,,6379"
VBoxManage controlvm scanhub natpf1 "rabbitmq,tcp,127.0.0.1,5672,,5672"

docker pull scanhub/es
docker pull scanhub/mysql
docker pull scanhub/api
cd %2 && docker-compose up -d
