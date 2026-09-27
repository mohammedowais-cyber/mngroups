@echo off
setlocal enabledelayedexpansion
title Push MN Groups to GitHub
color 0A

echo ================================================================
echo        PUSH MN GROUPS TO GITHUB REPOSITORY
echo        https://github.com/mohammedowais-cyber/mngroups
echo ================================================================
echo.

set "GIT=C:\Program Files\Git\cmd\git.exe"
if not exist "%GIT%" set "GIT=git"

cd /d "%~dp0"

echo [1/2] Current commit ready to push:
"%GIT%" log -1 --oneline
echo.

echo [2/2] Pushing code to GitHub...
echo (If prompted, click "Sign in with your browser" to authorize Git)
echo.
"%GIT%" push -u origin main

if %errorlevel% neq 0 (
    echo.
    echo ----------------------------------------------------------------
    echo If GitHub rejected because the remote repo has existing files
    echo (like an existing README or license), you can force push.
    echo ----------------------------------------------------------------
    set /p FORCE="Push with force overwrite? (y/n): "
    if /i "!FORCE!"=="y" (
        echo.
        echo Force pushing to origin main...
        "%GIT%" push -u origin main --force
    )
)

echo.
echo ================================================================
echo   Done! View your repository at:
echo   https://github.com/mohammedowais-cyber/mngroups
echo ================================================================
pause

