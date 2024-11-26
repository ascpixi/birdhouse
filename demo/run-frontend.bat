@echo off

pushd %cd%
cd ..\frontend

set VITE_BIRDHOUSE_API_URL=http://localhost:3000/api

call npm install
call npm run dev
if %errorlevel% neq 0 pause

popd
