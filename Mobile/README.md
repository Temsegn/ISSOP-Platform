# 📱 ISSOP Mobile App

> Smart City Operations Platform - Mobile Application for Citizens, Agents, and Admins

## Quick Start

### Build Release APK

**Windows:**
```bash
build-apk.bat
```

**Mac/Linux:**
```bash
chmod +x build-apk.sh
./build-apk.sh
```

**Manual:**
```bash
flutter clean
flutter pub get
flutter build apk --release
```

**Output:** `build/app/outputs/flutter-apk/app-release.apk`

---

## Features

### For Citizens
- 📸 Report issues with photos and location
- 📍 Track request status in real-time
- 🔔 Receive notifications when resolved
- ⏰ Hourly reminders for pending requests
- 🗺️ View nearby agents on map

### For Agents
- 📋 Receive task assignments instantly
- ✅ Update task status (In Progress, Completed)
- 📷 Upload completion proof
- 🧭 Navigate to task locations
- ⏰ Reminders for assigned tasks

### For Admins
- 📊 Monitor all requests and agents
- 👥 Assign tasks to available agents
- 📈 View analytics and reports
- 🗺️ Live map with agent locations
- 🔔 Real-time notifications

---

## Installation

### Prerequisites
- Flutter SDK 3.8.1 or higher
- Android SDK (API 23+)
- Android Studio or VS Code

### Setup

1. **Install dependencies:**
   ```bash
   flutter pub get
   ```

2. **Run on device:**
   ```bash
   flutter run
   ```

3. **Build release:**
   ```bash
   flutter build apk --release
   ```

---

## Configuration

### API Endpoint

Edit `lib/config/api_config.dart`:
```dart
static const String baseUrl = 'https://issop-platform.onrender.com/api/v1';
```

### Firebase (Optional)

1. Add `google-services.json` to `android/app/`
2. Configure Firebase in console
3. Enable Cloud Messaging for notifications

---

## Project Structure

```
lib/
├── config/              # Configuration files
├── core/
│   ├── constants/       # App constants
│   ├── models/          # Data models
│   ├── services/        # API & services
│   │   ├── socket_service.dart
│   │   ├── auth_service.dart
│   │   └── request_service.dart
│   └── utils/           # Utilities
├── modules/             # Feature modules
│   ├── auth/            # Login & registration
│   ├── user/            # Citizen features
│   ├── agent/           # Agent features
│   └── admin/           # Admin features
├── viewmodels/          # State management
└── main.dart            # App entry point
```

---

## Building for Release

### Universal APK (Easiest)
```bash
flutter build apk --release
```
**Size:** ~50-80 MB  
**Works on:** All devices

### Split APKs (Smaller)
```bash
flutter build apk --split-per-abi --release
```
**Size:** ~25-40 MB each  
**Files:**
- `app-arm64-v8a-release.apk` (Modern phones)
- `app-armeabi-v7a-release.apk` (Older phones)

### App Bundle (Play Store)
```bash
flutter build appbundle --release
```
**Output:** `build/app/outputs/bundle/release/app-release.aab`

---

## Sharing the APK

### Method 1: Direct Transfer
- Copy APK to phone via USB
- Open file and install

### Method 2: Cloud Storage
- Upload to Google Drive
- Share link with users
- Download and install

### Method 3: QR Code
- Upload APK to cloud
- Generate QR code from link
- Users scan to download

---

## Testing

```bash
# Run tests
flutter test

# Run on device
flutter run

# Check for issues
flutter analyze

# Format code
flutter format lib/
```

---

## Troubleshooting

### Build Fails
```bash
flutter clean
flutter pub get
flutter build apk --release
```

### "App not installed" Error
- Uninstall existing app
- Install new APK

### Large APK Size
```bash
# Use split APKs
flutter build apk --split-per-abi --release
```

---

## Dependencies

- **flutter_bloc** - State management
- **dio** - HTTP client
- **socket_io_client** - Real-time communication
- **geolocator** - Location services
- **flutter_map** - Map display
- **firebase_messaging** - Push notifications
- **image_picker** - Camera & gallery
- **shared_preferences** - Local storage

---

## Version

**Current Version:** 1.0.0+1  
**Min SDK:** 23 (Android 6.0+)  
**Target SDK:** 35 (Android 15)

---

## Support

For issues or questions:
- Check `BUILD-RELEASE.md` for detailed build instructions
- Review error messages in console
- Ensure all dependencies are installed

---

## License

MIT License - See LICENSE file for details

---

**Built with ❤️ for Smart Cities**
