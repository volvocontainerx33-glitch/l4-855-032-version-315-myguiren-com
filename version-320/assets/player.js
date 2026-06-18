var MoviePlayer = (function () {
    function init(videoId, coverId, streamUrl) {
        var video = document.getElementById(videoId);
        var cover = document.getElementById(coverId);
        var button = cover ? cover.querySelector('button') : null;
        var hlsInstance = null;
        var initialized = false;

        function prepare() {
            if (!video || initialized) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
                initialized = true;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls();
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                initialized = true;
                return;
            }

            video.src = streamUrl;
            initialized = true;
        }

        function play() {
            prepare();
            if (cover) {
                cover.classList.add('is-hidden');
            }
            var result = video.play();
            if (result && typeof result.catch === 'function') {
                result.catch(function () {
                    if (cover) {
                        cover.classList.remove('is-hidden');
                    }
                });
            }
        }

        if (cover) {
            cover.addEventListener('click', play);
        }
        if (button) {
            button.addEventListener('click', function (event) {
                event.stopPropagation();
                play();
            });
        }
        if (video) {
            video.addEventListener('play', function () {
                if (cover) {
                    cover.classList.add('is-hidden');
                }
            });
        }

        return {
            play: play,
            hls: hlsInstance
        };
    }

    return {
        init: init
    };
}());
