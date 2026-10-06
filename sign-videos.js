/* Curated sign examples. These are word demonstrations, not sentence translations.
   Sources and YouTube titles checked 2026-10-06. Stream using the official player;
   no third-party video is downloaded, repackaged, or cached by SignBridge. */
(function (root) {
  'use strict';
  const catalog = [
    { key: 'pain', label: 'Pain / hurt', videoId: 'xs4k_Qf3BSc', title: 'HURT', page: 'h/hurt.htm', aliases: ['pain', 'hurt', 'Are you in pain?', 'Does this hurt?'] },
    { key: 'wait', label: 'Wait', videoId: 'YfwgS9ZsBVw', title: 'WAIT', page: 'w/wait.htm', aliases: ['wait', 'Please wait'] },
    { key: 'water', label: 'Water', videoId: '-SdOfxGhb0A', title: 'WATER', page: 'w/water.htm', aliases: ['water', 'Do you need water?'] },
    { key: 'cold', label: 'Cold', videoId: 'vHgjYI-ig2s', title: 'cold temperature', page: 'c/cold.htm', aliases: ['cold', 'Are you cold?', 'You will feel cold'] },
    { key: 'doctor', label: 'Doctor', videoId: 'IEVgcJA3JWk', title: 'doctor', page: 'd/doctor.htm', aliases: ['doctor', 'I am your doctor'] },
    { key: 'understand', label: 'Understand', videoId: '5N10dIavSYc', title: 'UNDERSTAND / got it / I get it / comprehend / grasp / fathom', page: 'u/understand.htm', aliases: ['understand', 'Do you understand?'] },
    { key: 'finished', label: 'Finished', videoId: '7xQE2N0z7gM', title: "FINISH / all done / already completed / and then / it's over / after which", page: 'f/finish.htm', aliases: ['finished', 'finish', 'The surgery is finished', 'Surgery is over'] },
    { key: 'bathroom', label: 'Bathroom', videoId: '2xdhyJEgXdI', title: 'BATHROOM / toilet / restroom', page: 'b/bathroom.htm', aliases: ['bathroom', 'restroom', 'Do you need the bathroom?'] },
    { key: 'yes', label: 'Yes', videoId: '0usayvOXzHo', title: 'YES', page: 'y/yes.htm', aliases: ['yes'] },
    { key: 'no', label: 'No', videoId: 'QJXKaOSyl4o', title: 'NO', page: 'n/no.htm', aliases: ['no'] }
  ].map(entry => Object.freeze({ ...entry, scope: 'word', author: 'Signs / ASL University', source: 'https://www.lifeprint.com/asl101/pages-signs/' + entry.page }));

  // Add owned/permission-cleared files here for distribution with the web/native app.
  // Example: 'take a deep breath': './videos/take-a-deep-breath.mp4'
  // Exact phrases take priority over word examples. No automatic word concatenation.
  const bundled = Object.freeze({});
  function normalize(text) {
    return String(text || '').normalize('NFKC').toLowerCase().replace(/[’‘]/g, "'")
      .replace(/[^a-z0-9'\s]/g, ' ').replace(/\s+/g, ' ').trim();
  }
  const aliases = new Map();
  for (const entry of catalog) for (const alias of entry.aliases) aliases.set(normalize(alias), entry);
  const own = (obj, key) => Object.prototype.hasOwnProperty.call(obj || {}, key);
  function localSource(recorded, key) {
    if (own(recorded, key)) return recorded[key];
    if (own(bundled, key)) return bundled[key];
    return null;
  }
  function resolve(phrase, recorded = {}, allowOnline = true) {
    const key = normalize(phrase);
    if (!key) return null;
    const exact = localSource(recorded, key);
    if (exact) return { kind: 'local', src: exact, key, label: phrase, scope: key.includes(' ') ? 'phrase' : 'word' };
    const entry = aliases.get(key);
    // Only explicit aliases can choose a word clip. "No pain", "no water", medication,
    // urgency, negation, numbers and unknown sentences never lose their meaning via a
    // longest-word or substring match.
    if (!entry) return null;
    const savedWord = localSource(recorded, entry.key);
    if (savedWord) return { ...entry, kind: 'local', src: savedWord };
    return allowOnline ? { ...entry, kind: 'youtube' } : null;
  }
  const api = Object.freeze({ catalog: Object.freeze(catalog), bundled, normalize, resolve });
  root.SignBridgeVideos = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
