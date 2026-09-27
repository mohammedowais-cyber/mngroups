@echo off
setlocal
echo ==============================================================
echo             MN GROUPS - BUILD ANDROID DEBUG APK
echo ==============================================================
echo.

set NODE="C:\Users\Mohammed Owais\AppData\Local\Microsoft\WinGet\Packages\OpenJS.NodeJS.LTS_Microsoft.Winget.Source_8wekyb3d8bbwe\node-v24.19.0-win-x64\node.exe"

if not exist %NODE% (
    set NODE=node
)

%NODE% "%~dp0build_debug_apk.js"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ==============================================================
    echo [SUCCESS] APK built successfully!
    echo Located at: "%~dp0..\mngroups-debug.apk"
    echo ==============================================================
) else (
    echo.
    echo [ERROR] Build failed with exit code %ERRORLEVEL%.
)

echo.
pause
