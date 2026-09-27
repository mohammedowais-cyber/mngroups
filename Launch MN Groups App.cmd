@echo off
setlocal enabledelayedexpansion
title MN GROUPS - Property Maintenance Management System
color 0B

echo ==============================================================
echo        MN GROUPS - PROPERTY MAINTENANCE MANAGEMENT
echo ==============================================================
echo.
echo Launching MN Groups Application...
echo.

set "EDGE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if not exist "%EDGE%" set "EDGE=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"

set "CHROME=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME%" set "CHROME=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME%" set "CHROME=%LocalAppData%\Google\Chrome\Application\chrome.exe"

set "APP_URL=http://localhost:3000/"

echo [1/2] Connecting to local server...
if exist "%EDGE%" (
    echo [2/2] Opening native desktop window via Microsoft Edge...
    start "" "%EDGE%" --app="%APP_URL%" --window-size=1280,820
    goto done
)

if exist "%CHROME%" (
    echo [2/2] Opening native desktop window via Google Chrome...
    start "" "%CHROME%" --app="%APP_URL%" --window-size=1280,820
    goto done
)

echo [2/2] Opening in default web browser...
start "" "%APP_URL%"

:done
echo.
echo ==============================================================
echo [SUCCESS] MN Groups is now running in dedicated application window!
echo.
echo  * To view Tenant App: Click 'Tenant' at the top bar
echo  * To view Vendor App: Click 'Vendor' at the top bar
echo  * To view Admin Portal: Click 'Admin' at the top bar
echo  * To download Android APK: Click 'Download APK' in top right
echo ==============================================================
timeout /t 5 >nul
exit /b 0
