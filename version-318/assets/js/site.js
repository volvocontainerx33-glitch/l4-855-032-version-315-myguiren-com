(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
            });
        });
        setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function initFilters() {
        var input = document.querySelector("[data-filter-input]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
        var empty = document.querySelector("[data-filter-empty]");
        if (!input || !cards.length) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        if (initial) {
            input.value = initial;
        }
        function applyFilter() {
            var query = normalize(input.value);
            var shown = 0;
            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute("data-search") || card.textContent);
                var matched = !query || haystack.indexOf(query) !== -1;
                card.hidden = !matched;
                if (matched) {
                    shown += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", shown === 0);
            }
        }
        input.addEventListener("input", applyFilter);
        applyFilter();
    }

    function startPlayer(wrapper) {
        var video = wrapper.querySelector("video");
        var overlay = wrapper.querySelector("[data-player-overlay]");
        var stream = wrapper.getAttribute("data-stream");
        if (!video || !stream) {
            return;
        }
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
        video.controls = true;
        if (wrapper.getAttribute("data-ready") === "1") {
            video.play().catch(function () {});
            return;
        }
        wrapper.setAttribute("data-ready", "1");
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
            video.play().catch(function () {});
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
            });
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    video.src = stream;
                    video.play().catch(function () {});
                }
            });
            wrapper._hls = hls;
            return;
        }
        video.src = stream;
        video.play().catch(function () {});
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        players.forEach(function (wrapper) {
            var overlay = wrapper.querySelector("[data-player-overlay]");
            var video = wrapper.querySelector("video");
            if (overlay) {
                overlay.addEventListener("click", function () {
                    startPlayer(wrapper);
                });
            }
            if (video) {
                video.addEventListener("click", function () {
                    if (video.paused) {
                        startPlayer(wrapper);
                    }
                });
            }
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initPlayers();
    });
}());
