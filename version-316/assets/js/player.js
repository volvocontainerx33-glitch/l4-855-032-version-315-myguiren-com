(function () {
  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    return new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.6.15/dist/hls.min.js';
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function bindPlayer(box) {
    var video = box.querySelector('video');
    var overlay = box.querySelector('.player-overlay');
    var url = box.getAttribute('data-video-url');
    var started = false;
    var hls = null;

    if (!video || !overlay || !url) {
      return;
    }

    function showError() {
      overlay.classList.remove('is-hidden');
      overlay.innerHTML = '<span class="player-icon">!</span><span>视频加载失败，请稍后重试</span>';
    }

    function playVideo() {
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(showError);
      }
    }

    function start() {
      overlay.classList.add('is-hidden');
      video.controls = true;

      if (started) {
        playVideo();
        return;
      }

      started = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        playVideo();
        return;
      }

      loadHls().then(function (Hls) {
        if (Hls && Hls.isSupported()) {
          hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(url);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, playVideo);
          hls.on(Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              showError();
            }
          });
        } else {
          video.src = url;
          playVideo();
        }
      }).catch(showError);
    }

    overlay.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      } else {
        video.pause();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  if (document.readyState !== 'loading') {
    document.querySelectorAll('.js-player').forEach(bindPlayer);
  } else {
    document.addEventListener('DOMContentLoaded', function () {
      document.querySelectorAll('.js-player').forEach(bindPlayer);
    });
  }
})();
