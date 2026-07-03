# SignBridge — Build & Submit Runbook (iOS + Android)

This turns the SignBridge web app into installable App Store / Google Play apps. The hard part (offline
bundling, native scaffolding, permissions, icons) is **already done and committed on the `native-app`
branch**. This doc is the remaining, mostly-mechanical path to the stores. **The iOS half must run on a Mac;**
Android can run on Mac or Windows.

---

## 0. What's already set up (don't redo)
- **Capacitor** project wrapping the web app for iOS + Android. App ID: `com.dkawjr.signbridge`.
- **Fully offline**: TensorFlow.js, MediaPipe (JS + WASM), and the hand-landmark model are vendored under
  `vendor/` and loaded locally — the app makes **zero network calls** at runtime. (Verified in a browser:
  TF.js 4.22, MediaPipe HandLandmarker, and the fingerspelling model all load from local files.)
- **Camera permission** wired: Android `CAMERA` in the manifest; iOS `NSCameraUsageDescription` in Info.plist.
- **App icon + splash** generated for every size on both platforms (ASL "I love you" 🤟 mark). Replace later
  with a professionally designed icon by dropping a new 1024×1024 `assets/icon.png` and re-running
  `npx capacitor-assets generate`.
- **Reproducible build**: `index.html` stays the single source of truth; `npm run build:www` regenerates the
  packaged `www/` (rewriting the 4 CDN URLs to local paths and copying `vendor/` + `model/`).

## 1. One-time prerequisites
**Accounts**
- Apple Developer Program — **$99/year**, enroll at developer.apple.com (identity verification takes 1–2 days).
- Google Play Developer — **$25 once**, play.google.com/console.
- A **privacy policy URL** (both stores require one). Use `PRIVACY.md` in this repo — publish it to your
  GitHub Pages site so it has a public URL (e.g. `https://dkawjr.github.io/SignBridge/PRIVACY`).

**Tools (on your Mac)**
- **Xcode** (Mac App Store) — for iOS. Open it once to install components; sign in with your Apple ID under
  Settings → Accounts.
- **Android Studio** (developer.android.com/studio) — for Android. On first run it installs the Android SDK.
- **Node 20+** (you have 22) and **CocoaPods is NOT needed** — Capacitor 8 uses Swift Package Manager.

## 2. Get the project onto your Mac
```bash
git clone https://github.com/dkawjr/SignBridge.git
cd SignBridge
git checkout native-app
npm install
npm run build:www      # regenerate the packaged www/ (it's gitignored)
npx cap sync           # copy web assets into ios/ and android/, resolve native deps
```

## 3. iOS → App Store
```bash
npx cap open ios       # opens the project in Xcode
```
In Xcode:
1. Select the **App** target → **Signing & Capabilities** → check **Automatically manage signing**, pick your
   **Team** (your Apple Developer account). Confirm **Bundle Identifier** = `com.dkawjr.signbridge`.
2. Set **Deployment target** to iOS 14.0+ (needed for in-WebView camera). Set version (1.0.0) and build (1).
3. Pick a real device or "Any iOS Device (arm64)". **Product → Archive**.
4. When the Organizer opens: **Distribute App → App Store Connect → Upload**.
5. In **App Store Connect** (appstoreconnect.apple.com): create the app record, fill the listing (use
   `STORE_LISTING.md`), attach the build, complete **App Privacy** (answers below), add **Review notes**
   (below), submit for review.

**App Privacy answers (iOS "nutrition label"):** Data collection = **None**. Everything is processed
on-device; nothing is recorded, stored off-device, or transmitted. (The camera feed never leaves the phone.)

**Review notes to paste (heads off rejections):**
> SignBridge is an accessibility/communication tool that recognizes American Sign Language fingerspelling
> entirely on-device using a bundled TensorFlow.js + MediaPipe model. The camera is used only for live hand
> tracking; no video is recorded, stored, or transmitted, and the app makes no network calls. There is no
> account or login. Camera permission is requested with a clear purpose string.

> ⚠️ **Camera on a real device:** the in-WebView camera works on iOS 14.3+. Always test **Archive builds on a
> physical iPhone** (the Simulator has no camera).

## 4. Android → Google Play
```bash
npx cap open android   # opens Android Studio; let it finish Gradle sync
```
1. **Create an upload keystore** (once — keep it safe forever; losing it means you can't update the app):
   ```bash
   keytool -genkey -v -keystore signbridge-upload.keystore -alias signbridge \
     -keyalg RSA -keysize 2048 -validity 10000
   ```
2. In Android Studio: **Build → Generate Signed App Bundle / APK → Android App Bundle (.aab)**, select the
   keystore, finish. Output: `android/app/release/app-release.aab`.
3. In **Play Console**: create the app, upload the `.aab` to **Internal testing** first (fastest path to a real
   download link you can share), fill the listing (`STORE_LISTING.md`), complete the **Data safety** form
   (answers below) and the content-rating questionnaire, add the privacy policy URL, then promote to Production.

**Data safety answers:** No data collected, no data shared. All processing on-device. Camera used for app
functionality only; not collected or transmitted.

## 5. Making updates later
Edit `index.html` (the app) → `npm run build:www` → `npx cap sync` → rebuild in Xcode/Android Studio, bump the
version/build number, re-upload. That's the whole loop.

## 6. Known gotchas
- **Test camera on real hardware**, not simulators/emulators.
- If Android camera doesn't prompt: confirm the OS-level camera permission for the app is enabled; Capacitor
  routes the WebView `getUserMedia` request to the native `CAMERA` permission automatically.
- Apple sometimes asks for a **demo of accessibility value** — the review notes above pre-empt that.
- The 🤟 icon is a solid placeholder; a designed icon strengthens the listing before public launch.
