// build-www.mjs — package the self-contained web app for Capacitor (offline/native).
// Reads the source index.html, rewrites the 4 runtime CDN URLs to local vendored
// assets under www/vendor, copies the model/, and writes everything into www/.
// Source of truth stays index.html (GitHub Pages web build is unaffected).
//
// Run:  node build-www.mjs   (or: npm run build:www)
import { readFileSync, writeFileSync, cpSync, existsSync, mkdirSync } from 'node:fs';

const REWRITES = [
  // [ remote URL, local path ]
  ['https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js',
   './vendor/tfjs/tf.min.js'],
  ['https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/vision_bundle.mjs',
   './vendor/tasks-vision/vision_bundle.mjs'],
  ['https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm',
   './vendor/tasks-vision/wasm'],
  ['https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
   './vendor/tasks-vision/hand_landmarker.task'],
];

if (!existsSync('www')) mkdirSync('www', { recursive: true });

let html = readFileSync('index.html', 'utf8');
for (const [from, to] of REWRITES) {
  if (!html.includes(from)) {
    console.error(`WARNING: expected URL not found (did index.html change?):\n  ${from}`);
  }
  html = html.split(from).join(to);
}

// Guard: no CDN runtime deps should remain (github/signingsavvy hyperlinks are fine).
const leftover = [...html.matchAll(/https?:\/\/[^\s"')]+/g)]
  .map(m => m[0])
  .filter(u => /jsdelivr|googleapis|unpkg|cdnjs/.test(u));
if (leftover.length) {
  console.error('ERROR: unvendored runtime CDN references remain:', leftover);
  process.exit(1);
}

writeFileSync('www/index.html', html);
cpSync('model', 'www/model', { recursive: true });
cpSync('vendor', 'www/vendor', { recursive: true });

// PWA files (installable + offline). Harmless in the native build — the SW is guarded
// off by !window.Capacitor — but keeps www/ a complete PWA and avoids 404s on the tags.
for (const f of ['manifest.webmanifest', 'sw.js']) {
  if (existsSync(f)) cpSync(f, 'www/' + f);
}
if (!existsSync('www/icons')) mkdirSync('www/icons', { recursive: true });
for (const f of ['icon-192.webp', 'icon-512.png', 'apple-touch-icon.png']) {
  if (existsSync('icons/' + f)) cpSync('icons/' + f, 'www/icons/' + f);
}

console.log('Built www/ (self-contained). Rewrote', REWRITES.length, 'runtime deps to local vendor.');
