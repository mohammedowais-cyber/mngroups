@echo off
setlocal
echo ==============================================================
echo    MN GROUPS - INSTALL DEBUG APK TO CONNECTED ANDROID DEVICE
echo ==============================================================
echo.

set ADB="C:\Users\Mohammed Owais\AppData\Local\Android\Sdk\platform-tools\adb.exe"
set APK="%~dp0..\mngroups-debug.apk"

if not exist %ADB% (
    echo [ERROR] ADB not found at %ADB%
    pause
    exit /b 1
)

if not exist %APK% (
    set APK="%~dp0build\outputs\apk\debug\mngroups-debug.apk"
)

if not exist %APK% (
    echo [ERROR] APK not found! Please run build-apk.bat first.
    pause
    exit /b 1
)

echo Checking for connected Android devices/emulators...
%ADB% devices
echo.

echo Installing %APK% ...
%ADB% install -r %APK%

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ==============================================================
    echo [SUCCESS] MN Groups Mobile App installed successfully!
    echo Launching app on device...
    %ADB% shell am start -n com.mngroups.maintenance/.MainActivity
    echo ==============================================================
) else (
    echo.
    echo [INFO] If installation failed, ensure:
    echo   1. USB Debugging is ENABLED on your Android phone under Developer Options.
    echo   2. You approved the 'Allow USB debugging' prompt on your device.
    echo   3. Alternatively, copy 'mngroups-debug.apk' directly to your phone storage and tap to install.
)

echo.
pause
