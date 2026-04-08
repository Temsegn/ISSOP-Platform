@echo off
REM ISSOP Mobile App - Quick Build Script (Windows)
REM This script builds a release APK ready for distribution

echo.
echo ========================================
echo ISSOP Mobile App - Release Build
echo ========================================
echo.

REM Check if Flutter is installed
where flutter >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Flutter is not installed or not in PATH
    echo Please install Flutter: https://flutter.dev/docs/get-started/install
    pause
    exit /b 1
)

echo [OK] Flutter found
flutter --version | findstr /C:"Flutter"
echo.

REM Navigate to mobile directory
cd /d "%~dp0"

echo [STEP 1/4] Cleaning previous builds...
call flutter clean

echo.
echo [STEP 2/4] Getting dependencies...
call flutter pub get

echo.
echo [STEP 3/4] Building release APK...
echo This may take a few minutes...
echo.

REM Build APK
call flutter build apk --release

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo [SUCCESS] Build completed!
    echo ========================================
    echo.
    echo APK Location:
    echo %CD%\build\app\outputs\flutter-apk\app-release.apk
    echo.
    echo Next Steps:
    echo   1. Test the APK on your device
    echo   2. Share via WhatsApp, Email, or Google Drive
    echo   3. Users can install by opening the APK file
    echo.
    echo Tip: For smaller APKs, run:
    echo   flutter build apk --split-per-abi --release
    echo.
    pause
) else (
    echo.
    echo [ERROR] Build failed!
    echo Please check the error messages above
    pause
    exit /b 1
)
