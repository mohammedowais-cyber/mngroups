@echo off
setlocal enabledelayedexpansion
title MN GROUPS - Vercel Deployment Assistant
color 0B

set "PATH=C:\Users\Mohammed Owais\AppData\Local\Microsoft\WinGet\Packages\OpenJS.NodeJS.LTS_Microsoft.Winget.Source_8wekyb3d8bbwe\node-v24.19.0-win-x64;%PATH%"
cd /d "%~dp0admin-portal"

cls
echo ================================================================
echo             MN GROUPS - VERCEL CLOUD DEPLOYMENT
echo ================================================================
echo.

echo [1/3] Building production web app...
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Build failed. Please inspect the errors above.
    pause
    exit /b %errorlevel%
)

echo.
echo [2/3] Checking Vercel authentication...
call npx vercel whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ----------------------------------------------------------------
    echo  You are not currently logged in to Vercel.
    echo  We will now open the login prompt.
    echo  Follow the prompt to log in via GitHub, Email, or Browser.
    echo ----------------------------------------------------------------
    echo.
    call npx -y vercel login
    if %errorlevel% neq 0 (
        echo.
        echo [ERROR] Login was cancelled or failed.
        pause
        exit /b %errorlevel%
    )
)

echo.
echo [3/3] Deploying to Vercel Production...
call npx -y vercel --prod
echo.
echo ================================================================
echo  Deployment complete! Check the URL above to view your live app.
echo ================================================================
pause

