const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const videos = require('../sign-videos.js');

test('supported phrase selects an attributed word example, never a sentence translation', () => {
  const clip = videos.resolve('Are you in pain?');
  assert.equal(clip.key, 'pain');
  assert.equal(clip.kind, 'youtube');
  assert.equal(clip.scope, 'word');
  assert.match(clip.source, /^https:\/\/www.lifeprint.com\//);
});
test('negation, qualifications, dosage and unrelated context never trigger a keyword video', () => {
  for (const phrase of ['No pain', 'No water', 'Do not drink water', 'I am not your doctor',
    'The surgery is not finished', 'Give pain medicine 5 mg', 'Chest pain', 'painful',
    'No, are you in pain?', 'Take a deep breath', 'pain 9/10']) {
    assert.equal(videos.resolve(phrase), null, phrase);
  }
});
test('a saved exact phrase overrides online and saved single-word clips', () => {
  const recorded = { 'are you in pain': 'blob:phrase', pain: 'blob:word' };
  const clip = videos.resolve('Are you in pain?', recorded);
  assert.equal(clip.src, 'blob:phrase');
  assert.equal(clip.scope, 'phrase');
  assert.equal(clip.kind, 'local');
});
test('recorded phrases retain numbers and apostrophes during normalization', () => {
  const key = videos.normalize('Don’t move. Rate pain 0 to 10.');
  assert.equal(key, "don't move rate pain 0 to 10");
  assert.equal(videos.resolve('DON’T move. Rate pain 0 to 10.', { [key]: 'blob:exact' }).src, 'blob:exact');
  assert.equal(videos.resolve('Rate pain 0 to 5', { [key]: 'blob:exact' }), null);
});
test('saved word remains a word example and works with online videos disabled', () => {
  const clip = videos.resolve('Do you need water?', { water: 'blob:water' }, false);
  assert.equal(clip.kind, 'local');
  assert.equal(clip.scope, 'word');
  assert.equal(videos.resolve('Do you need water?', {}, false), null);
});
test('untrusted prototype keys do not become video sources', () => {
  assert.equal(videos.resolve('constructor', {}), null);
  assert.equal(videos.resolve('toString', {}), null);
});
test('each catalog entry has a unique valid video ID and round-trips through aliases', () => {
  assert.equal(new Set(videos.catalog.map(c => c.videoId)).size, videos.catalog.length);
  for (const clip of videos.catalog) {
    assert.match(clip.videoId, /^[A-Za-z0-9_-]{11}$/);
    for (const alias of clip.aliases) assert.equal(videos.resolve(alias).key, clip.key);
  }
});
test('all classic inline app scripts parse', () => {
  const html = fs.readFileSync(require.resolve('../index.html'), 'utf8');
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (!/type="module"/.test(match[1])) new vm.Script(match[2]);
  }
});
