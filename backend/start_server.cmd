@echo off
set "NODE_DIR=C:\Users\Mohammed Owais\AppData\Local\Microsoft\WinGet\Packages\OpenJS.NodeJS.LTS_Microsoft.Winget.Source_8wekyb3d8bbwe\node-v24.19.0-win-x64"
set "PATH=%NODE_DIR%;%PATH%"
cd /d "c:\Users\Mohammed Owais\Downloads\MN Groups\backend"
npx.cmd tsx src/server.ts
