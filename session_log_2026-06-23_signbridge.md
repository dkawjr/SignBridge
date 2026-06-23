# SignBridge — session log 2026-06-23

## Goal
Finish the SignBridge prototype (real-time ASL recognition web app, Adrian's own project — MADE Lab / Dr. Boyer hold NO IP) and make it genuinely usable + beautiful, then hand off.

## Outcome: DONE + LIVE + ready to share
- **Live:** https://dkawjr.github.io/SignBridge/ (GitHub Pages from `main`).
- **Repo:** `github.com/dkawjr/SignBridge` — single-file `index.html` (~205 KB, inline CSS+JS, no build), plus `model/` (trained classifier + assets). PR #1 merged.
- Send the live URL to GF; tell her to open in Safari/Chrome (not an in-app browser).

## What was built (chronological)
1. **Diagnosed** the original failure: legacy MediaPipe Hands 0.4.x → 21 landmarks → hand-crafted threshold RULES per letter. Brittle by construction (the *method* was the problem).
2. **Rebuilt recognition:** MediaPipe **Tasks-Vision HandLandmarker** (`@mediapipe/tasks-vision@0.10.21`, ES module) + **TF.js MLP** over the normalized 21-landmark vector (kinivi recipe: wrist-relative → flatten 42 → /max-abs). Replaced the rAF camera loop; deleted all rule code.
3. **Pretrained model, baked in:** trained a TF.js MLP on the MIT `AkramOM606/American-Sign-Language-Detection` keypoint dataset (36,401 rows; J/Z dropped → 24 letters A–Y). Trained in headless Chrome with the app's own tfjs 4.22.0 (parity). `42→Dense256+BN+Drop.3→128+Drop.3→64→softmax(24)`, class-weighted, 120 ep. **95.1% held-out internal val** (true train 97.0%; per-class 0.90–1.00; confusions A↔M, R↔U/V, K↔G as expected). Files in `model/` (model.json/weights.bin 219KB/labels.json/meta.json); **auto-loads on boot** → fingerspelling works with zero training. A 33-class in-browser Teach panel (letters + 8 gestures + NONE) can override it via IndexedDB.
4. **Patient UX redesign** (calm health-app feel, big touch targets, dark mode): big tappable "I need…" cards (emergencies → comfort), tap-to-confirm "did you mean?" chips, fingerspelling **autocomplete**, **confidence-gated autocorrect** (confusion-weighted edit distance; suggests only when close, NEVER for nonsense), speak-aloud **sentence strip**, clinician/admin tucked behind a drawer. Removed demo clutter.
5. **Send-ASL** ("provider shows the patient a sign"): replaced the fake "ghost hands" with a real **fingerspelling player** that renders the **canonical public-domain Wikimedia ASL alphabet SVGs** (`model/alphabet_svgs.json`, themed via currentColor) one letter at a time + a **"Watch a real signer ↗"** link-out (Signing Savvy) + **owned-clip infrastructure** (`signVideos` map → `./videos/`; plays a clip if present, else fingerspells). NOTE: no cleanly-licensed whole-sign video set exists to bundle (verified 0/20 target words) — owned recordings are the path.
6. **Hand-settle delay:** 0.7s after a hand first enters frame before decoding (fixes wrong first letter), with a **500ms grace** so brief MediaPipe dropouts between letters/words don't re-trigger it.
7. **Codex review fixes:** P1 (restart rAF loop if camera started before model finished loading); P2 (removed the per-hand handedness flip — training had none and MediaPipe handedness assumes a mirrored frame; replaced with one global `HAND_MIRROR` knob).
8. **Mobile:** camera `<video>` has `playsinline muted autoplay`; viewport + Apple web-app meta set; HTTPS + tap-to-start. Works on modern phones in Safari/Chrome.
9. **Footer credit:** "created by D. K. Adrian Williams" → github.com/dkawjr.

## Verification (all green)
Both inline scripts pass `node --check`; headless-Chrome smoke on localhost AND the live URL (modules + WASM + TF.js load, HandLandmarker graph runs, base model auto-loads "Fingerspelling model ready", 0 page errors / 0 failed requests); `normalizeLandmarks` parity unit-check (42-len, wrist 0,0, max-abs 1); 95.1% held-out accuracy end-to-end through the app's load path; visual screenshots reviewed (light + dark, mobile). **NOT verifiable without a webcam:** live-camera accuracy + the `HAND_MIRROR` orientation.

## Verification harness note (for the next terminal)
Test scripts used puppeteer-core driving the local Chrome at `C:/Program Files/Google/Chrome/Application/chrome.exe`, serving `C:/SignBridge` over http with fake media flags (`--use-fake-device-for-media-stream --use-fake-ui-for-media-stream`) and software WebGL (`--enable-unsafe-swiftshader --use-gl=angle --use-angle=swiftshader`). GOTCHA: in the static-file server, use a **forward-slash** ROOT (`'C:/SignBridge'`) — `path.join('C:\\SignBridge', '/x')` resolved wrong on this node and 404'd everything. Deploy check: `gh api -X POST repos/dkawjr/SignBridge/pages/builds` then poll `pages/builds/latest` for `status:built` + matching commit.

## Open items
See `TODO.md`. Headline: live test + orientation knob; GF trains gestures + records whole-sign clips; PWA/offline-bundle/Capacitor for app-ification.
