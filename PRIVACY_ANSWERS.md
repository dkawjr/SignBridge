# SignBridge — Store privacy/questionnaire answers (copy-paste cheat sheet)

Exact answers for the App Store Connect and Google Play forms. SignBridge collects **nothing**, so almost
everything is "No / None." Answer honestly against this build; if you add analytics or accounts later, revisit.

---
## Apple — App Store Connect

### App Privacy → "Data Collection"
- **Do you or your third-party partners collect data from this app?** → **No.**
  - Result: the label shows **"Data Not Collected."** (Nothing is transmitted off the device; the camera
    feed and any preferences never leave the phone, so none of it counts as "collected.")

### App Review → Export Compliance (encryption)
- **Does your app use encryption?** → effectively **No / Exempt.** The repo's `Info.plist` already sets
  `ITSAppUsesNonExemptEncryption = false`, so App Store Connect won't ask on every build. (The app only uses
  standard OS-provided HTTPS/TLS, and it makes no network calls at runtime anyway.)

### Content Rights
- **Does your app contain, show, or access third-party content?** → **No** (all content is your own or
  open-source libraries you bundle).

### Age Rating questionnaire
- All categories → **None.** Result: **4+.**

### Other prompts
- **Sign-in required?** → No account required (choose "not required").
- **Does the app use IDFA / tracking?** → **No.** (No `NSUserTrackingUsageDescription`, no ad SDKs.)
- **Data types:** none. **Third-party SDKs:** none.

---
## Google — Play Console

### Data safety form
- **Does your app collect or share any of the required user data types?** → **No.**
- **Is all of the user data encrypted in transit?** → N/A (no data collected); if forced, "Yes" (no data
  leaves the device).
- **Do you provide a way for users to request that their data is deleted?** → Data is stored only on-device;
  users can clear it in-app / in system settings. (Select the on-device option / N/A.)
- **Data types collected:** none. **Data shared:** none.

### Content rating (IARC questionnaire)
- Violence / sexual / language / controlled substances → **None.** Result: **Everyone.**

### App content
- **Privacy policy URL:** `https://dkawjr.github.io/SignBridge/PRIVACY`
- **Ads:** No ads. **Target audience:** general (13+); it's an accessibility tool, not directed at children.
- **Permissions:** Camera — declared; used only for on-device hand tracking (state this in the form's
  permission justification).

---
## One-line summary you can reuse anywhere
> SignBridge collects no data. All processing is on-device, it makes no network calls, has no accounts or
> analytics, and the camera feed is never recorded, stored, or transmitted.
