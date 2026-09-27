@echo off
setlocal enabledelayedexpansion
title Push MN Groups to GitHub
color 0B

set "GIT=C:\Program Files\Git\cmd\git.exe"
if not exist "%GIT%" set "GIT=git"
cd /d "%~dp0"

cls
echo ================================================================
echo             PUSH MN GROUPS TO GITHUB REPOSITORY
echo             https://github.com/mohammedowais-cyber/mngroups
echo ================================================================
echo.
echo Current commit ready to upload:
"%GIT%" log -1 --oneline
echo.
echo ----------------------------------------------------------------
echo Choose how you want to authenticate with GitHub:
echo.
echo  [1] Browser Login (Sign in via popup / default Git Manager)
echo  [2] GitHub Personal Access Token (Recommended if password error)
echo ----------------------------------------------------------------
echo.
set /p METHOD="Select method [1 or 2] (Default is 1): "

if "!METHOD!"=="2" goto use_token

:use_browser
echo.
echo Pushing via Git Credential Manager...
echo (If a browser window or login box appears, approve the sign-in)
echo.
"%GIT%" push -u origin main
if %errorlevel% equ 0 goto success

echo.
echo ----------------------------------------------------------------
echo Browser sign-in encountered an issue or was rejected.
echo Let us use a Personal Access Token (100%% reliable).
echo ----------------------------------------------------------------
echo.

:use_token
echo.
echo 1. Generate a token at: https://github.com/settings/tokens/new?scopes=repo
echo    (You can right-click / copy or open that URL in your browser)
echo 2. Click "Generate token" at the bottom of the page and copy the token (starts with ghp_).
echo.
set /p GH_TOKEN="Paste your GitHub Token here and press Enter: "

if "%GH_TOKEN%"=="" (
    echo [ERROR] No token entered.
    pause
    exit /b 1
)

echo.
echo Pushing to GitHub using provided token...
"%GIT%" push -u "https://mohammedowais-cyber:%GH_TOKEN%@github.com/mohammedowais-cyber/mngroups.git" main
if %errorlevel% neq 0 (
    echo.
    echo Trying with force overwrite in case remote has existing files...
    "%GIT%" push -u "https://mohammedowais-cyber:%GH_TOKEN%@github.com/mohammedowais-cyber/mngroups.git" main --force
)

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Push failed. Please check that the token has "repo" scope.
    pause
    exit /b %errorlevel%
)

:success
echo.
echo ================================================================
echo  SUCCESS! Your project is now live on GitHub:
echo  https://github.com/mohammedowais-cyber/mngroups
echo ================================================================
pause

