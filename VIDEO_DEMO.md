# SignBridge inline-video demo

The app now plays selected signs inside SignBridge. Ten online starter word videos are included: pain/hurt, wait, water, cold, doctor, understand, finished, bathroom, yes, and no. The catalog in `sign-videos.js` records their Lifeprint source pages and YouTube IDs. Provider controls and attribution remain visible.

## Quick demonstration

1. Open the app and choose **Phrases & tap-to-speak**.
2. Tap **Cold**, **Water**, or another word under **Tap a word. See the sign.** The video opens inside the app. If autoplay is blocked, tap the player.
3. Choose a supported phrase such as **Are you cold?** The app shows the cold word example and explicitly labels it as a word example, not a translation of the whole sentence.
4. Use **Replay** or **Close** without leaving SignBridge.
5. Choose **Add a phrase video**, enter the complete phrase (for example, **Take a deep breath**), then record or import a video signed by a fluent signer. Selecting that exact phrase now plays the saved recording automatically, including while offline.

Online videos require internet. The toggle disables online playback. Saved videos take priority over online examples and stay in this browser on this device. An unsupported sentence stays visible as text with a fingerspelling fallback; the app does not infer an ASL sentence by joining dictionary words. Negated or qualified phrases such as **No pain** do not match **Pain** accidentally.

## Put the same phrase videos on every demo device

Record or obtain permission to use the complete clinician phrases you want to demonstrate. Use **Save file** in the library to export a recording. Place each approved file under `videos/`, then add its normalized phrase and relative file path to `SignBridgeVideos.bundled` in `sign-videos.js`. A commented example is provided there. Run `npm run build:www` again; the build copies that directory into `www/videos/`.

For a reliable first demonstration, prepare a small set of complete phrases such as “Take a deep breath,” “Are you in pain?”, “Please stay still,” “The surgery is finished,” and “Do you understand?” The current starter catalog supplies individual word examples; it does not include these complete signed sentences.

## Build and publish

- Run `npm test` and `npm run build:www`.
- Serve `www/` with a static web server for a local demonstration.
- Publish `www/` to the existing static HTTPS host for the browser/PWA release. Keep the new `sign-videos.js`, `sign-video-player.js`, privacy policy, and optional `videos/` directory with the build.
- The `inline-video-demo` branch contains this preview. Open `https://raw.githack.com/dkawjr/SignBridge/inline-video-demo/index.html` for a browser demo; the host may show a confirmation screen first. This preview does not update the existing GitHub Pages release. Native iOS and Android playback still needs a device check, including YouTube WebView/referrer requirements.

## Verification completed on October 6, 2026

Chrome on Windows decoded and played all ten real online starter videos inside the packaged app. Checks covered player cleanup, persisted online opt-out, offline and blocked-service messages, imported-video persistence across reload, offline local playback, exact-phrase priority, negation, rapid switching/closing, and a 390 × 844 phone viewport. The import test used a synthetic test clip, not a signed clinical phrase. Eight automated Node checks cover matching, catalog integrity, and inline JavaScript syntax.

This verifies the tested software behavior. It does not establish clinical effectiveness or validate the signing of future phrase recordings.
