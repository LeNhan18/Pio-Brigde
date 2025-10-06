@echo off
REM PIO Bridge - Build Script for Windows
echo 🚀 Building PIO Bridge Flutter App...

REM Check if Flutter is installed
where flutter >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Flutter is not installed. Please install Flutter first.
    pause
    exit /b 1
)

REM Get dependencies
echo 📦 Getting dependencies...
flutter pub get

REM Check for issues
echo 🔍 Checking for issues...
flutter analyze

REM Run tests
echo 🧪 Running tests...
flutter test

REM Build APK
echo 📱 Building APK...
flutter build apk --release

REM Build Web
echo 🌐 Building Web...
flutter build web --release

echo ✅ Build completed successfully!
echo 📁 APK location: build\app\outputs\flutter-apk\app-release.apk
echo 📁 Web files: build\web\
pause
