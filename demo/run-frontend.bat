@echo off

pushd %cd%
cd ..\frontend

set VITE_BIRDHOUSE_API_URL=http://localhost:3000/api

call npm install
call npm run dev

popd
