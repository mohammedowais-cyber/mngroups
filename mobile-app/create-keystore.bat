@echo off
REM Generate release keystore for MN GROUPS Property Maintenance Android App
echo ======================================================
echo Generating release keystore for MN GROUPS Android App
echo ======================================================

keytool -genkey -v -keystore mngroups-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias mngroups -storepass mngroups2026 -keypass mngroups2026 -dname "CN=MN Groups, OU=Maintenance, O=MN Groups, L=Bengaluru, S=Karnataka, C=IN"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Keystore generated: mngroups-release-key.jks
    copy android\key.properties.example android\key.properties
    echo Created android\key.properties
    echo.
    echo Now you can generate your signed release APK by running:
    echo flutter build apk --release
) else (
    echo.
    echo Keytool failed. Please ensure Java/JDK is installed and keytool is in your PATH.
)
