# SignBridge — running TODO

## Done 2026-07-06 (v6.0 clinical-deployment overhaul)
Evidence-based hardening for clinical use + iOS submission prep, all in `index.html` unless noted:
"said aloud" confirmation banner (deaf patient's proof their message was voiced; warns when TTS is
unavailable); granular camera error handling with retry (permission / no camera / busy / insecure-context,
each with its own guidance); recognition-engine failure banner (recognition down ≠ app down — tap cards
keep working); interpreter gate on consent/diagnosis/medication/discharge topics + one-tap timestamped
interpreter-request logging (ADA/§1557); first-session communication-preference chooser (primary
consideration); comfort mode (PACU/groggy: 8 essential needs, extra large); Wong-Baker-style face anchors
on the pain scale; staff tip card (no family interpreters, face the patient, pre-op signal rehearsal);
in-app text size A/A+/A++; full ARIA pass (labels, live regions, keyboard access for tabs/body-map/severity
dots, alertdialog on emergency); zoom re-enabled; WCAG contrast lift light+dark; focus-visible styles;
global reduced-motion; toast replaces alert(); v6.0. iOS: `PrivacyInfo.xcprivacy` added (needs one drag
into the Xcode target — see BUILD_AND_SUBMIT.md), `ITSAppUsesNonExemptEncryption=false`, `arm64`,
removed `limitsNavigationsToAppBoundDomains` (breaks WKWebView getUserMedia), review-notes/accessibility-
labels guidance updated. Verified in-browser (light+dark, all new features).

Live: **https://dkawjr.github.io/SignBridge/** · Repo: `github.com/dkawjr/SignBridge` (single-file `index.html`, deploys via GitHub Pages from `main`).

## Needs a real person + webcam (no agent can do these)
- [ ] **Live-camera accuracy test.** Open on a real device, train/test, confirm letters recognize.
- [ ] **Orientation check (one-line fix if wrong).** If EVERY letter reads mirrored/wrong, flip `HAND_MIRROR` from `1` to `-1` in `normalizeLandmarks` (index.html). If letters are mostly right, leave it.
- [ ] **GF trains the 8 medical gestures** (HELP/YES/NO/PAIN/STOP/THANK_YOU/OK/WAIT + NONE) in the Teach panel → Download samples (JSON) → bake in as a new default, or keep per-device.
- [ ] **GF records the top whole-sign clips** (pain, help, water, nausea, cold, bathroom, etc.). Drop files under `./videos/` and map them in the `signVideos` object in index.html (key = lowercase phrase/keyword). The player auto-plays a clip if present, else fingerspells. Owned recordings = clean license.

## App-ification (the "make it a real app" ladder — packaging is the easy part)
- [ ] **PWA (~half day):** add `manifest.json` + a small service worker → installable "Add to Home Screen", full-screen, offline. Apple web-app meta tags already present.
- [ ] **Bundle MediaPipe WASM + model locally** (currently loaded from jsDelivr CDN) so it works offline in low-wifi settings. ~1 day. Important for real use.
- [ ] **Capacitor wrap (~1–2 wk)** for App Store / Play Store: reuses 100% of the code in a native shell; swap `getUserMedia` for the native camera plugin. Needs Apple/Google dev accounts + store review.
- [ ] Do NOT do a full native (RN/Flutter) rewrite — unnecessary; the web stack runs fine in a webview.

## Recognition quality (the real product risk, not packaging)
- [ ] More/better training data per signer + per confusable class (A↔M, R↔U/V, K↔G are the inherent static-pose confusions).
- [ ] Optional: skin-tone variant of the hand (currently canonical PD silhouettes, themed via currentColor); J/Z motion hint arrows.

## Done this session (2026-06-23) — for reference
Rebuilt recognition (legacy MediaPipe Hands rules → MediaPipe Tasks HandLandmarker + trained TF.js MLP, 95.1% held-out, pretrained A–Y baked in, auto-loads). Receive = default. Patient UX redesign (need-cards, tap-to-confirm "did you mean?" with confusion-aware confidence-gated autocorrect, fingerspelling autocomplete, speak-aloud sentence strip, clinician drawer). Send-ASL: real fingerspelling player using canonical PD Wikimedia ASL alphabet SVGs + "Watch a real signer" Signing-Savvy link-out + owned-clip infra. 0.7s hand-settle (with 500ms grace so it never fires between letters/words). Codex P1/P2 fixed. iOS `muted`/`playsinline` set. Footer credit. PR #1 merged. Full detail: `session_log_2026-06-23_signbridge.md`.
