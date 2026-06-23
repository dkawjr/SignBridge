# SignBridge — running TODO

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
