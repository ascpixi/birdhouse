@echo off

pushd %cd%
cd ..\backend

set BIRDHOUSE_CFG=..\demo\backend-cfg.json
set DB_HOST=localhost
set DB_USER=root
set DB_DATABASE=birdhouse

call npm install
call npm run serve
if %errorlevel% neq 0 pause

popd
