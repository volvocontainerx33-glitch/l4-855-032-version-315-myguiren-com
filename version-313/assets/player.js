(function () {
  function setText(button, playing) {
    if (button) {
      button.textContent = playing ? "❚❚" : "▶";
    }
  }

  function showMessage(root) {
    var message = root.querySelector(".player-message");
    if (message) {
      message.hidden = false;
    }
  }

  function init(playerId, url) {
    var root = document.getElementById(playerId);

    if (!root) {
      return;
    }

    var video = root.querySelector("video");
    var overlay = root.querySelector(".player-overlay");
    var playButton = root.querySelector(".player-main-button");
    var muteButton = root.querySelector(".player-mute-button");
    var fullButton = root.querySelector(".player-full-button");
    var attached = false;
    var hls = null;

    function attach() {
      if (attached || !video) {
        return;
      }

      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showMessage(root);
          }
        });
      } else {
        showMessage(root);
      }
    }

    function play() {
      attach();
      root.classList.add("is-started");

      if (overlay) {
        overlay.classList.add("is-hidden");
      }

      var result = video.play();

      if (result && result.catch) {
        result.catch(function () {
          setText(playButton, false);
        });
      }
    }

    function pause() {
      video.pause();
    }

    if (overlay) {
      overlay.addEventListener("click", play);
    }

    if (playButton) {
      playButton.addEventListener("click", function () {
        if (video.paused) {
          play();
        } else {
          pause();
        }
      });
    }

    if (muteButton) {
      muteButton.addEventListener("click", function () {
        video.muted = !video.muted;
        muteButton.textContent = video.muted ? "静音" : "音量";
      });
    }

    if (fullButton) {
      fullButton.addEventListener("click", function () {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (root.requestFullscreen) {
          root.requestFullscreen();
        }
      });
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      } else {
        pause();
      }
    });

    video.addEventListener("play", function () {
      setText(playButton, true);
    });

    video.addEventListener("pause", function () {
      setText(playButton, false);
    });

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  }

  window.MoviePlayer = {
    init: init
  };
})();
