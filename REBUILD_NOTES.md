# SignBridge — recognition rebuild notes (2026-06-23)

## What changed and why
The old recognition engine was **legacy MediaPipe Hands 0.4.x → 21 landmarks → hand-crafted
threshold RULES** per letter. That approach is brittle by construction (no rotation/scale
normalization, hardcoded confidences, breaks with hand rotation/lighting/distance/signer
variation). The recognition *method* was the problem, not a bug.

It was replaced with a **trained classifier on the current MediaPipe API**, kept single-file and
client-side (no build system, GitHub-Pages deployable):

1. **Hand detection:** MediaPipe **Tasks-Vision `HandLandmarker`** (`@mediapipe/tasks-vision@0.10.21`,
   ES module from jsDelivr). WASM + hosted `hand_landmarker.task` (float16), VIDEO mode, 2 hands.
   A `<script type="module">` bridges the module exports onto `window.SB_TasksVision` for the
   classic-script app code.
2. **Classifier:** a **TensorFlow.js MLP** over the **normalized 21-landmark vector** (kinivi
   Apache-2.0 recipe: wrist-relative → flatten to 42 (x,y) → divide by max-abs → MediaPipe
   handedness "Left" hands flipped to a canonical right hand). Verified at runtime: the feature
   vector is length 42, wrist maps to (0,0), max-abs = 1.
3. **Frame loop:** legacy `Camera({onFrame})` replaced by a `requestAnimationFrame` loop calling
   `detectForVideo(...)`; self-stops when the camera is off.
4. Deleted all dead rule code (`getFingerCurl/Dir`, `analyzeHand`, `ASL_LETTERS`,
   `MEDICAL_GESTURES`, `detectSimpleGestures`). Kept `matchSpellingToCommand`, `levenshtein`,
   `showDetection`, the fingerspelling buffer, and all orthogonal features (Send mode, voice,
   pain map, TTS, dark mode, etc.).

## Two ways the model is obtained
### A) Built-in pretrained fingerspelling model (works out of the box — NO training)
`model/model.json` + `model/weights.bin` + `model/labels.json` ship in the repo and **auto-load
on boot**. It classifies the **24 fingerspelling letters A–Y** (J and Z excluded — they are motion
letters a static-frame model can't do).

- **Trained from:** `AkramOM606/American-Sign-Language-Detection` keypoint dataset (**MIT**,
  36,401 rows of MediaPipe 21-landmark vectors, already in the kinivi normalized space). J/Z dropped.
- **How:** trained in headless Chrome with the **same TF.js 4.22.0** the app runs (perfect parity),
  MLP `42 → Dense256 + BatchNorm + Dropout.3 → Dense128 + Dropout.3 → Dense64 → softmax(24)`,
  adam, class-weighted for imbalance, 120 epochs. Reproduce with `_train/train.html` +
  `scratchpad/train_driver.js` (re-download `keypoint.csv` per the URL in `model/meta.json`).
- **Verified accuracy:** **95.1% held-out internal validation** (true train 97.0%; per-class
  0.90–1.00). Top confusions are the expected static-pose ones: A↔M, R↔U/V, K↔G, L↔A. End-to-end
  re-verified by loading the saved model through the app's own path on the held-out split (95.1%).
- **HONEST LIMITATION:** 95.1% is **dataset-internal** accuracy, NOT live-camera accuracy. Real
  accuracy on a specific person/camera/lighting will be somewhat lower (distribution shift). It has
  **no medical-gesture and no `NONE` class** (those come from Teach-mode training below).
- **Orientation note:** single-orientation inference was chosen (dual-orientation tested at 93.6%,
  i.e. it *hurt*, because the app already canonicalizes handedness). If live testing shows
  recognition is *systematically mirrored/wrong for every letter*, the dataset's native orientation
  is opposite the app's canonical frame — fix is a one-line sign flip of `flipX` in
  `normalizeLandmarks`. Confirm during the first live session.

### B) Teach-mode (train/extend from your own webcam — client-side)
The **Teach / Train** panel (Receive-ASL screen) lets a real signer collect samples live, train a
model in-browser, and **persist it to IndexedDB** (`indexeddb://signbridge-asl`) + localStorage.
A user-trained model **overrides** the built-in one and covers the full **33 classes** (24 letters +
8 medical gestures HELP/YES/NO/PAIN/STOP/THANK_YOU/OK/WAIT + `NONE`).
- Buttons: per-class capture + hold-to-auto-capture (~5/sec), Train (live epoch/loss/acc),
  **Download model**, **Download samples (JSON)**, **Import samples (JSON)**, Clear.
- **Sharing workflow:** deploy to a URL → a signer opens it → trains (esp. the medical gestures,
  several of which are motion signs and only approximated as static poses) → **Download samples
  (JSON)** → send the file back → import + retrain, or bake the data in as a new default.

## Run it
ES modules + webcam need http (not `file://`). Locally: `npx serve .` (or any static server) and
open the localhost URL → **Receive ASL** → start camera.

## Verified vs not
- ✅ Both inline scripts pass `node --check`; no dangling refs to removed symbols.
- ✅ Headless-Chrome smoke test: tasks-vision module + WASM + TF.js load, HandLandmarker graph runs,
  base model auto-loads ("Fingerspelling model ready"), 0 page errors / 0 failed requests.
- ✅ `normalizeLandmarks` parity unit-check (42-len, wrist 0,0, max-abs 1).
- ✅ Model accuracy 95.1% held-out (internal), end-to-end through the app's load path.
- ❌ NOT verified: live-camera recognition accuracy (no webcam available to the build) — no live
  accuracy is claimed. The global hand-orientation match (see orientation note) is unconfirmed until
  the first live session.

## Patient UX + features (2026-06-23)

### Intent
Redesigned the **Receive ASL** (patient-facing) screen so a scared PACU patient sees a calm,
big-touch-target layout: a sentence strip, a clean camera, a tap-to-confirm chip, big "common need"
cards, and a Yes/No binary - with free fingerspelling demoted to a "Spell it out" affordance and all
clinician/admin tools tucked behind one drawer. **The recognition pipeline was not changed** beyond
two additive hooks; only the patient screen's markup/CSS and some new self-contained JS were added.

### CSS (additive, end of `<style>`)
- New **patient-scoped token layer** extending `:root` and `[data-theme="dark"]`: a teal `--care`
  accent, warmer `--pt-bg`/`--pt-surface`, a LARGE patient type scale (`--pt-text-hero/xl/lg/md`),
  softer `--pt-radius`, `--pt-touch: 64px` min targets, and motion eases. Dark mode covered.
  `prefers-reduced-motion` honored under `.pt-scope`.
- New component classes: `.pt-cam` (premium camera card + breathing tracking dot), `.confirm-chip`
  / `.alt-chip` (did-you-mean), `.need-grid`/`.need-card` (incl. `.urgent`/`.emergency`/`.sent`),
  `.yesno-row`/`.yesno-btn`, `.phrase-strip`/`.ps-word`/`.ps-speak` (sentence builder),
  `.spell-toggle`/`.spell-panel` + `.autocomplete`/`.ac-list`/`.ac-item`, `.clin-drawer`.
- `.patient-mode-container.pt-scope` only sets background/padding - it does **not** touch `display`,
  so the existing `.patient-mode-container[.active]` visibility logic is unchanged.

### Markup (inner layout of `#patientModeScreen`, now has class `pt-scope`)
Reordered to: sentence strip -> camera -> confirm chip -> need cards -> Yes/No -> "Spell it out"
panel -> transcript -> existing quick-pain + body-map (verbatim) -> **clinician drawer**.
- **All recognition IDs preserved** exactly once: `#patientCamFeed`, `#patientHandCanvas`,
  `#handStatus`, `#landmarkCount`, `#detectedSign`, `#spellingBufferDisplay`,
  `#patientTranscriptFeed`. `#teachCard` (full Teach panel) was **moved verbatim** into the
  clinician drawer; SOAP-note + transcript-download buttons and the Send-mode switch live there too.
- New IDs: `#phraseStrip/#phraseWords/#phraseSpeak/#phraseBackspace/#phraseClear`, `#confirmChip`
  (`#confirmGuess/#confirmConf/#confirmAlts`), `#needGrid`, `#spellToggle/#spellPanel/#acList`,
  `#clinDrawer`.

### Lexicon data (new globals, no collisions)
Added after `GESTURE_MEANING`: `patientNeeds` (21 first-person need cards w/ `priority`
emergency|urgent|normal, some carry a `quick` mapping to `patientQuickReply`), `patientWordList`
(~165-word fingerspell autocomplete dict), `patientPhraseBank` (grouped sentences w/ `tpl` blanks),
`gesturePhraseMap` (8 gesture classes -> first-person phrase + alternates + priority).

### New JS hooks / functions (all additive, self-contained)
- **Phrase strip:** `phraseWords[]`, `renderPhraseStrip()`, `phraseAdd/phraseBackspace/phraseClear`,
  `phraseSpeak()` (mirrors `speakPhrase()` TTS pattern: `SpeechSynthesisUtterance`, rate 0.85,
  en voice, `.speaking` class via onend/onerror; logs + writes transcript).
- **Need cards:** `renderNeedGrid()` + `needTap(i)` -> `.sent` flash, `speakPatient(phrase)`,
  `phraseAdd(label)`, `addPatientTranscript('Patient: '+phrase)`, log, and `escalatePriority()`.
- **Confirm chip:** `showConfirm(word,conf,alts,priority)`, `confirmAccept()`, `confirmPick(word)`,
  `confirmClear()`. `escalatePriority()` fires the existing `#emergencyModal` for emergency items.
- **Autocomplete:** `updateAutocomplete()` (prefix-matches live `spellingBuffer` >=2 chars against
  `patientWordList`, renders <=4 `.ac-item`s) + `acPick(word)` (commits word, resets buffer).
- **Drawers:** `toggleClinDrawer()`, `toggleSpellPanel()`. Helpers `speakPatient()`, `escapeHtml()`,
  `escapeAttr()`.

### Wiring into the recognition pipeline (the only engine-adjacent edits)
- `recognizeHands()`: after computing top class, also builds a `ranked` top-3 (NONE excluded). The
  **gesture** branch attaches `guessPhrase`/`priority`/`alts` (from `gesturePhraseMap` + ranked) to
  the detected object. Letter/spelling logic unchanged.
- `showDetection(item)`: appended a tail block - `isLetter` -> `updateAutocomplete()`; `isGesture`
  -> `showConfirm(...)`; `isSpelling` -> `showConfirm(...)` for the completed word. Existing display
  / buffer / transcript behavior untouched (the now-absent `#patientDetectedSign` write is already
  null-guarded).
- `stopPatientCamera()`: clears the confirm chip + autocomplete on camera stop.
- `init()`: calls `renderNeedGrid()` + `renderPhraseStrip()` once.

### Honest TODOs (not done; downstream)
- Spanish: `spanishTranslations` was **not** extended with the new patient phrases, so patient-side
  TTS is English-only for now (staff `speakPhrase('es')` path unchanged). `patientPhraseBank` and
  the `tpl` blanks (pain-number, allergy/condition fill-ins) are defined but **not yet surfaced** in
  the UI (cards speak the fixed `phrase`). Autocomplete feeds the phrase strip directly; it is not
  yet routed through `matchSpellingToCommand` for fuzzy command resolution.
- Urgent/emergency escalation currently logs + (for emergency) opens the existing modal; no separate
  staff toast channel was added.

### Verification
- ✅ Both inline scripts pass `node --check` (module + classic) after all edits.
- ✅ All 13 required recognition/IDs present exactly once; 18 new functions defined exactly once;
  recognition functions (`onHandResults`/`recognizeHands`/`normalizeLandmarks`/`smoothPrediction`/
  `tryLoadSavedModel`/`initMediaPipeHands`/`handDetectLoop`/`showDetection`) all intact; the
  `onHandResults -> recognizeHands(result)` link preserved.
- ❌ NOT visually/live verified (no browser/webcam in this build step) - downstream.
