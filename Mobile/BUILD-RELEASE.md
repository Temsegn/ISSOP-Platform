# 📱 ISSOP Mobile App - Release Build Guide

## Quick Build (APK for Testing)

### Option 1: Build APK (Recommended for Sharing)

```bash
cd mobile

# Build release APK
flutter build apk --release

# Output location:
# mobile/build/app/outputs/flutter-apk/app-release.apk
```

**File size:** ~50-80 MB  
**Can be shared via:** WhatsApp, Email, Google Drive, etc.

### Option 2: Build Split APKs (Smaller Size)

```bash
cd mobile

# Build split APKs per ABI (smaller files)
flutter build apk --split-per-abi --release

# Output location:
# mobile/build/app/outputs/flutter-apk/app-armeabi-v7a-release.apk (32-bit)
# mobile/build/app/outputs/flutter-apk/app-arm64-v8a-release.apk (64-bit)
# mobile/build/app/outputs/flutter-apk/app-x86_64-release.apk (emulator)
```

**File sizes:** ~25-40 MB each  
**Recommended:** Share `app-arm64-v8a-release.apk` (most modern phones)

---

## 🚀 Step-by-Step Build Instructions

### Prerequisites

1. **Flutter SDK** installed
   ```bash
   flutter --version
   # Should show Flutter 3.x or higher
   ```

2. **Android SDK** installed
   ```bash
   flutter doctor
   # Should show ✓ for Android toolchain
   ```

### Step 1: Clean Previous Builds

```bash
cd mobile
flutter clean
flutter pub get
```

### Step 2: Update Version (Optional)

Edit `mobile/pubspec.yaml`:
```yaml
version: 1.0.0+1  # Change to 1.0.1+2, 1.1.0+3, etc.
#        ↑   ↑
#        |   Build number (increment for each build)
#        Version name (shown to users)
```

### Step 3: Build Release APK

```bash
# Build universal APK (works on all devices)
flutter build apk --release

# OR build split APKs (smaller size)
flutter build apk --split-per-abi --release
```

### Step 4: Locate the APK

```bash
# Universal APK
mobile/build/app/outputs/flutter-apk/app-release.apk

# Split APKs
mobile/build/app/outputs/flutter-apk/app-arm64-v8a-release.apk
mobile/build/app/outputs/flutter-apk/app-armeabi-v7a-release.apk
mobile/build/app/outputs/flutter-apk/app-x86_64-release.apk
```

### Step 5: Test the APK

1. **Transfer to Android device:**
   - USB cable: Copy APK to phone
   - Cloud: Upload to Google Drive, download on phone
   - Email: Send to yourself

2. **Install on device:**
   - Open APK file
   - Allow "Install from unknown sources" if prompted
   - Tap "Install"

3. **Test the app:**
   - Login with test credentials
   - Create a request
   - Check notifications
   - Test all features

---

## 📦 Build Options Explained

### Universal APK
```bash
flutter build apk --release
```
**Pros:**
- Works on all Android devices
- Single file to share
- Easy distribution

**Cons:**
- Larger file size (~50-80 MB)
- Contains code for all architectures

### Split APKs
```bash
flutter build apk --split-per-abi --release
```
**Pros:**
- Smaller file sizes (~25-40 MB each)
- Faster download and install
- Optimized for specific devices

**Cons:**
- Multiple files
- Need to know device architecture

**Which APK to share:**
- **arm64-v8a** - Most modern phones (2018+)
- **armeabi-v7a** - Older phones (2015-2018)
- **x86_64** - Emulators only

### App Bundle (For Play Store)
```bash
flutter build appbundle --release
```
**Output:** `mobile/build/app/outputs/bundle/release/app-release.aab`

**Use for:**
- Google Play Store submission
- Automatic APK generation per device
- Smallest download size for users

---

## 🔐 Signing the App (For Production)

### Step 1: Create Keystore

```bash
cd mobile/android

# Generate keystore
keytool -genkey -v -keystore issop-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias issop

# Enter details when prompted:
# - Password: [Choose a strong password]
# - Name: ISSOP Platform
# - Organization: Your Company
# - City, State, Country: Your location
```

**Save the password securely!**

### Step 2: Configure Signing

Create `mobile/android/key.properties`:
```properties
storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=issop
storeFile=issop-release-key.jks
```

**⚠️ Add to .gitignore:**
```bash
echo "key.properties" >> mobile/android/.gitignore
echo "*.jks" >> mobile/android/.gitignore
```

### Step 3: Update build.gradle.kts

Edit `mobile/android/app/build.gradle.kts`:

```kotlin
// Add before android block
val keystoreProperties = Properties()
val keystorePropertiesFile = rootProject.file("key.properties")
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(FileInputStream(keystorePropertiesFile))
}

android {
    // ... existing config ...

    signingConfigs {
        create("release") {
            keyAlias = keystoreProperties["keyAlias"] as String
            keyPassword = keystoreProperties["keyPassword"] as String
            storeFile = file(keystoreProperties["storeFile"] as String)
            storePassword = keystoreProperties["storePassword"] as String
        }
    }

    buildTypes {
        release {
            signingConfig = signingConfigs.getByName("release")
            // Remove debug signing
        }
    }
}
```

### Step 4: Build Signed APK

```bash
flutter build apk --release
# Now uses your release keystore
```

---

## 📤 Sharing the APK

### Method 1: Direct Transfer

```bash
# Connect phone via USB
adb install mobile/build/app/outputs/flutter-apk/app-release.apk
```

### Method 2: Cloud Storage

1. **Google Drive:**
   - Upload APK to Drive
   - Share link with "Anyone with link can view"
   - Recipients download and install

2. **Dropbox:**
   - Upload APK
   - Share public link

3. **Firebase App Distribution:**
   ```bash
   # Install Firebase CLI
   npm install -g firebase-tools

   # Login
   firebase login

   # Upload APK
   firebase appdistribution:distribute \
     mobile/build/app/outputs/flutter-apk/app-release.apk \
     --app YOUR_FIREBASE_APP_ID \
     --groups testers
   ```

### Method 3: QR Code

1. Upload APK to cloud storage
2. Get download link
3. Generate QR code: https://www.qr-code-generator.com/
4. Share QR code - users scan to download

---

## 🧪 Testing Checklist

Before sharing the APK, test:

- [ ] App installs successfully
- [ ] Login works
- [ ] Registration works
- [ ] Create request with photo
- [ ] View requests on map
- [ ] Receive notifications
- [ ] Agent can accept tasks
- [ ] Admin can assign tasks
- [ ] Real-time updates work
- [ ] App doesn't crash
- [ ] All screens load correctly

---

## 📊 Build Sizes

| Build Type | Size | Best For |
|------------|------|----------|
| Universal APK | ~50-80 MB | Easy sharing |
| arm64-v8a APK | ~25-40 MB | Modern phones |
| armeabi-v7a APK | ~25-40 MB | Older phones |
| App Bundle | ~30-50 MB | Play Store |

---

## 🐛 Troubleshooting

### Build Fails

```bash
# Clean and rebuild
flutter clean
flutter pub get
flutter build apk --release
```

### "App not installed" Error

**Cause:** Conflicting package name or signature

**Solution:**
1. Uninstall existing app
2. Install new APK

### "Parse Error" on Install

**Cause:** Corrupted APK or incompatible architecture

**Solution:**
1. Rebuild APK
2. Use correct architecture APK
3. Check minimum SDK version (API 23+)

### Large APK Size

**Solution:**
```bash
# Use split APKs
flutter build apk --split-per-abi --release

# Or enable ProGuard (shrinks code)
# Add to android/app/build.gradle.kts:
buildTypes {
    release {
        minifyEnabled = true
        shrinkResources = true
    }
}
```

---

## 🚀 Quick Commands Reference

```bash
# Clean build
flutter clean && flutter pub get

# Build universal APK
flutter build apk --release

# Build split APKs
flutter build apk --split-per-abi --release

# Build app bundle
flutter build appbundle --release

# Install on connected device
flutter install

# Check APK size
ls -lh mobile/build/app/outputs/flutter-apk/

# Test on device
adb install mobile/build/app/outputs/flutter-apk/app-release.apk
```

---

## 📝 Version Management

### Semantic Versioning

```
1.0.0+1
│ │ │  │
│ │ │  └─ Build number (increment for each build)
│ │ └──── Patch (bug fixes)
│ └────── Minor (new features)
└──────── Major (breaking changes)
```

### Examples

- `1.0.0+1` - Initial release
- `1.0.1+2` - Bug fix
- `1.1.0+3` - New feature
- `2.0.0+4` - Major update

---

## 🎯 Production Checklist

Before releasing to users:

- [ ] Update version in pubspec.yaml
- [ ] Test on multiple devices
- [ ] Check all features work
- [ ] Verify API endpoints (production URLs)
- [ ] Test notifications
- [ ] Check app icon and splash screen
- [ ] Review app permissions
- [ ] Test offline functionality
- [ ] Sign APK with release keystore
- [ ] Test signed APK on device
- [ ] Prepare release notes
- [ ] Create backup of keystore

---

## 📱 Distribution Options

### 1. Direct APK Sharing (Easiest)
- Build APK
- Share via WhatsApp/Email/Drive
- Users install manually

### 2. Firebase App Distribution (Recommended)
- Automated distribution
- Track installs
- Push updates
- Manage testers

### 3. Google Play Store (Official)
- Build app bundle
- Create Play Console account ($25 one-time)
- Submit for review
- Automatic updates

### 4. Internal Testing
- TestFlight (iOS)
- Play Console Internal Testing
- Firebase App Distribution

---

## 🎉 Success!

Your APK is ready to share!

**Location:**
```
mobile/build/app/outputs/flutter-apk/app-release.apk
```

**Next Steps:**
1. Test the APK on your device
2. Share with testers
3. Collect feedback
4. Iterate and improve

---

**Version:** 1.0.0  
**Build Date:** April 8, 2026  
**Platform:** Android  
**Min SDK:** 23 (Android 6.0+)
