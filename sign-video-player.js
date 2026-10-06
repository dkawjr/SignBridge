/* Lazy official YouTube player, created only after a user chooses a known clip. */
(function (root) {
  'use strict';
  let apiPromise = null, player = null, generation = 0, loadTimer = null, observer = null;
  const el = id => document.getElementById(id);
  function youtubeAPI() {
    if (root.YT && root.YT.Player) return Promise.resolve(root.YT);
    if (apiPromise) return apiPromise;
    apiPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      const previous = root.onYouTubeIframeAPIReady;
      let finished = false;
      const finish = error => {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        if (root.onYouTubeIframeAPIReady === ready) root.onYouTubeIframeAPIReady = previous;
        if (error) { script.remove(); apiPromise = null; reject(error); }
        else resolve(root.YT);
      };
      const ready = () => { if (typeof previous === 'function') previous(); finish(); };
      root.onYouTubeIframeAPIReady = ready;
      const timer = setTimeout(() => finish(new Error('Video service did not respond.')), 12000);
      script.src = 'https://www.youtube.com/iframe_api';
      script.referrerPolicy = 'strict-origin-when-cross-origin';
      script.onerror = () => finish(new Error('Video service could not load.'));
      document.head.appendChild(script);
    });
    return apiPromise;
  }
  function reset() {
    generation++;
    clearTimeout(loadTimer);
    if (observer) { observer.disconnect(); observer = null; }
    if (player) { try { player.destroy(); } catch (_) {} player = null; }
    el('aslOnlineHost').replaceChildren();
    el('aslOnlineHost').style.display = '';
    el('aslOnlinePanel').hidden = true;
    el('aslVideoStatus').textContent = '';
    el('aslVideoRetry').hidden = true;
  }
  async function play(clip) {
    reset();
    const token = generation;
    const valid = () => token === generation && el('aslOverlay').classList.contains('active');
    const fail = message => {
      if (!valid()) return;
      reset();
      el('aslOnlinePanel').hidden = false;
      el('aslOnlineHost').style.display = 'none';
      el('aslVideoStatus').textContent = message + ' The English message remains above. Use Fingerspell or retry.';
      el('aslVideoRetry').hidden = false;
    };
    el('aslOnlinePanel').hidden = false;
    el('aslVideoStatus').textContent = 'Loading sign video…';
    if (navigator.onLine === false) { fail('This video needs an internet connection.'); return; }
    try {
      const YT = await youtubeAPI();
      if (!valid()) return;
      const mount = document.createElement('div');
      mount.id = 'aslYoutubeMount';
      el('aslOnlineHost').appendChild(mount);
      loadTimer = setTimeout(() => fail('The video has not loaded.'), 15000);
      const vars = { playsinline: 1, controls: 1, autoplay: 0, rel: 0 };
      if (/^https?:$/.test(location.protocol)) vars.origin = location.origin;
      player = new YT.Player(mount.id, {
        host: 'https://www.youtube-nocookie.com', width: '100%', height: '100%',
        videoId: clip.videoId, playerVars: vars,
        events: {
          onReady(event) {
            if (!valid()) { event.target.destroy(); return; }
            clearTimeout(loadTimer);
            const frame = event.target.getIframe();
            frame.title = clip.label + ' — ASL word demonstration';
            frame.referrerPolicy = 'strict-origin-when-cross-origin';
            el('aslVideoStatus').textContent = 'Tap play if the video does not start.';
            event.target.mute();
            // Begin only when the player is actually visible, including on small screens.
            if (root.IntersectionObserver) {
              observer = new IntersectionObserver(entries => {
                if (valid() && entries.some(entry => entry.intersectionRatio > 0.5)) {
                  observer.disconnect(); observer = null; event.target.playVideo();
                }
              }, { threshold: [0.51] });
              observer.observe(frame);
            } else event.target.playVideo();
          },
          onStateChange(event) {
            if (!valid()) return;
            if (event.data === YT.PlayerState.PLAYING) el('aslVideoStatus').textContent = '';
            if (event.data === YT.PlayerState.ENDED) el('aslVideoStatus').textContent = 'Video finished. Replay to watch again.';
          },
          onAutoplayBlocked() { if (valid()) el('aslVideoStatus').textContent = 'Tap play in the video to begin.'; },
          onError() { fail('This video is unavailable in the embedded player.'); }
        }
      });
    } catch (_) { fail('The online video service could not load.'); }
  }
  root.SignBridgeVideoPlayer = Object.freeze({ play, reset });
})(window);
