#!/bin/bash

# PIO Bridge - Build Script
echo "🚀 Building PIO Bridge Flutter App..."

# Check if Flutter is installed
if ! command -v flutter &> /dev/null; then
    echo "❌ Flutter is not installed. Please install Flutter first."
    exit 1
fi

# Get dependencies
echo "📦 Getting dependencies..."
flutter pub get

# Check for issues
echo "🔍 Checking for issues..."
flutter analyze

# Run tests
echo "🧪 Running tests..."
flutter test

# Build APK
echo "📱 Building APK..."
flutter build apk --release

# Build iOS (if on macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 Building iOS..."
    flutter build ios --release
fi

# Build Web
echo "🌐 Building Web..."
flutter build web --release

echo "✅ Build completed successfully!"
echo "📁 APK location: build/app/outputs/flutter-apk/app-release.apk"
echo "📁 Web files: build/web/"
