
function ready(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}

ready(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-video-player]'));

  players.forEach(function (box) {
    var video = box.querySelector('video');
    var cover = box.querySelector('[data-player-cover]');
    var source = box.getAttribute('data-video');
    var started = false;
    var instance = null;

    function startPlayer() {
      if (!video || !source || started) {
        return;
      }

      started = true;

      if (cover) {
        cover.classList.add('is-hidden');
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        instance = new window.Hls({ enableWorker: true });
        instance.loadSource(source);
        instance.attachMedia(video);
      } else {
        video.src = source;
      }

      var playResult = video.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', startPlayer);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!started) {
          startPlayer();
        }
      });
    }
  });
});
