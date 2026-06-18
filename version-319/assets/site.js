(function () {
    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $all(selector, root) {
        return Array.from((root || document).querySelectorAll(selector));
    }

    function setupMobileMenu() {
        var toggle = $('.mobile-toggle');
        var panel = $('.mobile-panel');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            var open = panel.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function setupHero() {
        var hero = $('.hero');
        if (!hero) {
            return;
        }
        var slides = $all('.hero-slide', hero);
        var dots = $all('.hero-dot', hero);
        if (!slides.length || !dots.length) {
            return;
        }
        var active = 0;
        var timer = null;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === active);
            });
        }

        function play() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(active + 1);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                play();
            });
        });

        show(0);
        play();
    }

    function fillSelect(select, values) {
        if (!select) {
            return;
        }
        values.sort(function (a, b) {
            return String(b).localeCompare(String(a), 'zh-Hans-CN');
        });
        values.forEach(function (value) {
            if (!value) {
                return;
            }
            var option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }

    function setupFilters() {
        $all('.filter-panel').forEach(function (panel) {
            var targetSelector = panel.getAttribute('data-filter-target');
            var grid = targetSelector ? $(targetSelector) : null;
            if (!grid) {
                return;
            }
            var cards = $all('.movie-card', grid);
            var keyword = $('.js-filter-keyword', panel);
            var region = $('.js-filter-region', panel);
            var type = $('.js-filter-type', panel);
            var year = $('.js-filter-year', panel);
            var empty = $(grid.getAttribute('data-empty') || '');
            var params = new URLSearchParams(window.location.search);
            var q = params.get('q');

            fillSelect(region, Array.from(new Set(cards.map(function (card) {
                return card.getAttribute('data-region') || '';
            }))));
            fillSelect(type, Array.from(new Set(cards.map(function (card) {
                return card.getAttribute('data-type') || '';
            }))));
            fillSelect(year, Array.from(new Set(cards.map(function (card) {
                return card.getAttribute('data-year') || '';
            }))));

            if (q && keyword) {
                keyword.value = q;
            }

            function apply() {
                var text = keyword ? keyword.value.trim().toLowerCase() : '';
                var regionValue = region ? region.value : '';
                var typeValue = type ? type.value : '';
                var yearValue = year ? year.value : '';
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = card.getAttribute('data-search') || '';
                    var ok = true;
                    if (text && haystack.indexOf(text) === -1) {
                        ok = false;
                    }
                    if (regionValue && card.getAttribute('data-region') !== regionValue) {
                        ok = false;
                    }
                    if (typeValue && card.getAttribute('data-type') !== typeValue) {
                        ok = false;
                    }
                    if (yearValue && card.getAttribute('data-year') !== yearValue) {
                        ok = false;
                    }
                    card.classList.toggle('is-hidden-card', !ok);
                    if (ok) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0);
                }
            }

            [keyword, region, type, year].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });

            apply();
        });
    }

    window.initMoviePlayer = function (options) {
        var video = document.getElementById(options.videoId);
        var overlay = document.getElementById(options.overlayId);
        var url = options.url;
        if (!video || !overlay || !url) {
            return;
        }

        function start() {
            overlay.classList.add('is-hidden');
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                if (!video.src) {
                    video.src = url;
                }
                video.play().catch(function () {});
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                if (!video.__hls) {
                    var hls = new window.Hls({
                        enableWorker: false,
                        lowLatencyMode: true
                    });
                    hls.loadSource(url);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                    video.__hls = hls;
                }
                video.play().catch(function () {});
                return;
            }
            if (!video.src) {
                video.src = url;
            }
            video.play().catch(function () {});
        }

        overlay.addEventListener('click', start);
        video.addEventListener('click', function () {
            if (!video.src) {
                start();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileMenu();
        setupHero();
        setupFilters();
    });
})();
