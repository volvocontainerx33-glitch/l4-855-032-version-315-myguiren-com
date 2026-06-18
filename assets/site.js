(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function setupNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var menu = document.querySelector("[data-nav-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function setupSearch() {
        var inputs = document.querySelectorAll("[data-search-input]");
        inputs.forEach(function (input) {
            var scope = input.closest("[data-search-scope]") || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".searchable-card"));
            input.addEventListener("input", function () {
                var value = input.value.trim().toLowerCase();
                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute("data-title") || "",
                        card.getAttribute("data-genre") || "",
                        card.getAttribute("data-year") || "",
                        card.getAttribute("data-region") || "",
                        card.getAttribute("data-tags") || ""
                    ].join(" ").toLowerCase();
                    card.classList.toggle("is-hidden", value.length > 0 && text.indexOf(value) === -1);
                });
            });
        });

        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");
        if (query) {
            var allInput = document.querySelector("[data-search-input]");
            if (allInput) {
                allInput.value = query;
                allInput.dispatchEvent(new Event("input"));
            }
        }
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function start() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        start();
    }

    ready(function () {
        setupNavigation();
        setupSearch();
        setupHero();
    });
})();

function initializePlayer(source) {
    var wrap = document.querySelector("[data-player-wrap]");
    if (!wrap) {
        return;
    }
    var video = wrap.querySelector("video");
    var overlay = wrap.querySelector("[data-player-overlay]");
    var started = false;
    var hlsInstance = null;

    function attach() {
        if (started) {
            return;
        }
        started = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
        } else {
            video.src = source;
        }
    }

    function play() {
        attach();
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
        video.controls = true;
        var result = video.play();
        if (result && typeof result.catch === "function") {
            result.catch(function () {});
        }
    }

    if (overlay) {
        overlay.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
        if (!started) {
            play();
        }
    });
    video.addEventListener("play", function () {
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
    });
    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
