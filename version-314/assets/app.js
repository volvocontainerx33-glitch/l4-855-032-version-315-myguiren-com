(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function initMobileMenu() {
    var button = qs('[data-menu-toggle]');
    var menu = qs('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      var opened = menu.classList.toggle('open');
      button.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  function initImageFallbacks() {
    qsa('img.poster-img, img.hero-img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('is-hidden');
      }, { once: true });
    });
  }

  function initHeroCarousel() {
    qsa('[data-hero-carousel]').forEach(function (carousel) {
      var slides = qsa('[data-hero-slide]', carousel);
      var dots = qsa('[data-hero-dot]', carousel);
      var prev = qs('[data-hero-prev]', carousel);
      var next = qs('[data-hero-next]', carousel);
      var index = 0;
      var timer = null;

      if (!slides.length) {
        return;
      }

      function show(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('active', slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('active', dotIndex === index);
        });
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5000);
      }

      if (prev) {
        prev.addEventListener('click', function () {
          show(index - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          show(index + 1);
          restart();
        });
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
          show(dotIndex);
          restart();
        });
      });

      show(0);
      restart();
    });
  }

  function initFilters() {
    qsa('[data-filter-scope]').forEach(function (panel) {
      var page = panel.closest('.filter-page') || document;
      var cards = qsa('.movie-card', page);
      var searchInput = qs('[data-filter-search]', panel);
      var typeSelect = qs('[data-filter-type]', panel);
      var categorySelect = qs('[data-filter-category]', panel);
      var regionInput = qs('[data-filter-region]', panel);
      var yearInput = qs('[data-filter-year]', panel);
      var countOutput = qs('[data-filter-count]', panel);
      var resetButton = qs('[data-filter-reset]', panel);
      var params = new URLSearchParams(window.location.search);

      if (searchInput && params.get('q')) {
        searchInput.value = params.get('q');
      }
      if (yearInput && params.get('year')) {
        yearInput.value = params.get('year');
      }
      if (typeSelect && params.get('type')) {
        typeSelect.value = params.get('type');
      }
      if (categorySelect && params.get('category')) {
        categorySelect.value = params.get('category');
      }

      function cardText(card) {
        return normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.category,
          card.dataset.genre,
          card.dataset.tags
        ].join(' '));
      }

      function apply() {
        var query = normalize(searchInput && searchInput.value);
        var typeValue = normalize(typeSelect && typeSelect.value);
        var categoryValue = normalize(categorySelect && categorySelect.value);
        var regionValue = normalize(regionInput && regionInput.value);
        var yearValue = normalize(yearInput && yearInput.value);
        var shown = 0;

        cards.forEach(function (card) {
          var text = cardText(card);
          var match = true;
          if (query && text.indexOf(query) === -1) {
            match = false;
          }
          if (typeValue && normalize(card.dataset.type).indexOf(typeValue) === -1) {
            match = false;
          }
          if (categoryValue && normalize(card.dataset.category).indexOf(categoryValue) === -1) {
            match = false;
          }
          if (regionValue && normalize(card.dataset.region).indexOf(regionValue) === -1) {
            match = false;
          }
          if (yearValue && normalize(card.dataset.year).indexOf(yearValue) === -1) {
            match = false;
          }
          card.classList.toggle('is-hidden', !match);
          if (match) {
            shown += 1;
          }
        });

        if (countOutput) {
          countOutput.textContent = String(shown);
        }
      }

      [searchInput, typeSelect, categorySelect, regionInput, yearInput].forEach(function (control) {
        if (!control) {
          return;
        }
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      });

      if (resetButton) {
        resetButton.addEventListener('click', function () {
          [searchInput, regionInput, yearInput].forEach(function (control) {
            if (control) {
              control.value = '';
            }
          });
          [typeSelect, categorySelect].forEach(function (control) {
            if (control) {
              control.value = '';
            }
          });
          apply();
        });
      }

      apply();
    });
  }

  function initPlayers() {
    qsa('[data-player]').forEach(function (shell) {
      var video = qs('video[data-src]', shell);
      var startButton = qs('[data-player-start]', shell);
      var status = qs('[data-player-status]', shell);
      var hlsInstance = null;

      if (!video) {
        return;
      }

      function setStatus(message) {
        if (status) {
          status.textContent = message;
        }
      }

      function playVideo() {
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            setStatus('浏览器阻止了自动播放，请再次点击视频播放。');
          });
        }
      }

      function start() {
        var source = video.dataset.src;
        if (!source) {
          setStatus('未找到播放源。');
          return;
        }

        if (startButton) {
          startButton.classList.add('is-hidden');
        }

        video.controls = true;
        setStatus('正在加载播放源...');

        if (shell.dataset.ready === 'true') {
          playVideo();
          return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          shell.dataset.ready = 'true';
          video.addEventListener('loadedmetadata', function () {
            setStatus('播放源加载完成。');
            playVideo();
          }, { once: true });
          video.load();
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            maxBufferLength: 30,
            enableWorker: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            shell.dataset.ready = 'true';
            setStatus('播放源加载完成。');
            playVideo();
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
            if (data && data.fatal) {
              setStatus('播放源加载遇到问题，可刷新后重试。');
            }
          });
          return;
        }

        video.src = source;
        shell.dataset.ready = 'true';
        video.load();
        setStatus('已尝试使用浏览器原生播放器加载。');
        playVideo();
      }

      if (startButton) {
        startButton.addEventListener('click', start);
      }

      video.addEventListener('play', function () {
        if (shell.dataset.ready !== 'true') {
          start();
        }
      });

      window.addEventListener('pagehide', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initImageFallbacks();
    initHeroCarousel();
    initFilters();
    initPlayers();
  });
})();
