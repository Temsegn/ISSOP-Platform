#!/bin/bash

# ISSOP Mobile App - Quick Build Script
# This script builds a release APK ready for distribution

echo "🚀 ISSOP Mobile App - Release Build"
echo "===================================="
echo ""

# Check if Flutter is installed
if ! command -v flutter &> /dev/null; then
    echo "❌ Flutter is not installed or not in PATH"
    echo "Please install Flutter: https://flutter.dev/docs/get-started/install"
    exit 1
fi

echo "✓ Flutter found: $(flutter --version | head -n 1)"
echo ""

# Navigate to mobile directory
cd "$(dirname "$0")"

echo "📦 Cleaning previous builds..."
flutter clean

echo "📥 Getting dependencies..."
flutter pub get

echo ""
echo "🔨 Building release APK..."
echo "This may take a few minutes..."
echo ""

# Build APK
flutter build apk --release

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "📱 APK Location:"
    echo "   $(pwd)/build/app/outputs/flutter-apk/app-release.apk"
    echo ""
    
    # Show file size
    APK_SIZE=$(du -h build/app/outputs/flutter-apk/app-release.apk | cut -f1)
    echo "📊 APK Size: $APK_SIZE"
    echo ""
    
    echo "📤 Next Steps:"
    echo "   1. Test the APK on your device"
    echo "   2. Share via WhatsApp, Email, or Google Drive"
    echo "   3. Users can install by opening the APK file"
    echo ""
    echo "💡 Tip: For smaller APKs, run:"
    echo "   flutter build apk --split-per-abi --release"
    echo ""
else
    echo ""
    echo "❌ Build failed!"
    echo "Please check the error messages above"
    exit 1
fi
