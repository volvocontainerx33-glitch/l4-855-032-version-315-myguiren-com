(function () {
  var hlsUrl = "https://cdn.jsdelivr.net/npm/hls.js@1.6.15/dist/hls.min.js";
  var hlsLoading = null;

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (hlsLoading) {
      return hlsLoading;
    }
    hlsLoading = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = hlsUrl;
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return hlsLoading;
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function move(step) {
      show(index + step);
      restart();
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 6200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        move(-1);
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        move(1);
      });
    }
    restart();
  }

  function setupCards() {
    document.querySelectorAll("[data-card-search]").forEach(function (input) {
      var target = document.querySelector(input.getAttribute("data-target"));
      if (!target) {
        return;
      }
      var cards = Array.prototype.slice.call(target.querySelectorAll(".movie-card"));
      input.addEventListener("input", function () {
        var query = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-text") || "").toLowerCase();
          card.classList.toggle("is-hidden", query && text.indexOf(query) === -1);
        });
      });
    });

    document.querySelectorAll("[data-card-sort]").forEach(function (select) {
      var target = document.querySelector(select.getAttribute("data-target"));
      if (!target) {
        return;
      }
      var original = Array.prototype.slice.call(target.querySelectorAll(".movie-card"));
      select.addEventListener("change", function () {
        var value = select.value;
        var cards = original.slice();
        if (value === "rating") {
          cards.sort(function (a, b) {
            return Number(b.getAttribute("data-rating")) - Number(a.getAttribute("data-rating"));
          });
        } else if (value === "views") {
          cards.sort(function (a, b) {
            return Number(b.getAttribute("data-views")) - Number(a.getAttribute("data-views"));
          });
        } else if (value === "year") {
          cards.sort(function (a, b) {
            return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
          });
        }
        cards.forEach(function (card) {
          target.appendChild(card);
        });
      });
    });
  }

  function setupPlayers() {
    document.querySelectorAll("[data-player]").forEach(function (root) {
      var video = root.querySelector("video");
      var button = root.querySelector("[data-play-button]");
      var stream = root.getAttribute("data-stream");
      var started = false;
      var hls = null;
      if (!video || !stream) {
        return;
      }

      function markPlaying() {
        root.classList.add("is-playing");
        if (button) {
          button.hidden = true;
        }
      }

      function begin() {
        if (started) {
          video.play();
          markPlaying();
          return;
        }
        started = true;
        markPlaying();
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          video.play().catch(function () {});
          return;
        }
        loadHls().then(function (Hls) {
          if (Hls && Hls.isSupported()) {
            hls = new Hls({ enableWorker: true });
            hls.loadSource(stream);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(function () {});
            });
          } else {
            video.src = stream;
            video.play().catch(function () {});
          }
        }).catch(function () {
          video.src = stream;
          video.play().catch(function () {});
        });
      }

      if (button) {
        button.addEventListener("click", begin);
      }
      video.addEventListener("click", function () {
        if (!started) {
          begin();
        }
      });
      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    });
  }

  function renderSearchCard(movie) {
    var tags = movie.tags.slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "<article class=\"movie-card\" data-title=\"" + escapeHtml(movie.title) + "\" data-year=\"" + escapeHtml(movie.year) + "\" data-rating=\"" + escapeHtml(movie.rating) + "\" data-views=\"" + escapeHtml(movie.views) + "\">" +
      "<a class=\"card-link\" href=\"" + movie.url + "\" aria-label=\"" + escapeHtml(movie.title) + "\">" +
      "<span class=\"poster-wrap\"><img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\"><span class=\"poster-shade\"></span><span class=\"cat-badge\">" + escapeHtml(movie.category) + "</span><span class=\"duration-badge\">" + escapeHtml(movie.duration) + "</span></span>" +
      "<span class=\"card-content\"><strong>" + escapeHtml(movie.title) + "</strong><span class=\"card-desc\">" + escapeHtml(movie.description) + "</span><span class=\"tag-row\">" + tags + "</span><span class=\"card-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.rating) + "</span><span>" + escapeHtml(movie.year) + "</span></span></span>" +
      "</a></article>";
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function setupSearchPage() {
    var root = document.querySelector("[data-search-page]");
    if (!root || !window.MOVIE_INDEX) {
      return;
    }
    var input = root.querySelector("[data-search-input]");
    var category = root.querySelector("[data-search-category]");
    var sort = root.querySelector("[data-search-sort]");
    var results = root.querySelector("[data-search-results]");
    var status = root.querySelector("[data-search-status]");
    var params = new URLSearchParams(window.location.search);
    if (params.get("q") && input) {
      input.value = params.get("q");
    }

    function update() {
      var query = input.value.trim().toLowerCase();
      var cat = category.value;
      var list = window.MOVIE_INDEX.filter(function (movie) {
        var matchedCategory = !cat || movie.category === cat;
        var matchedQuery = !query || movie.search.indexOf(query) !== -1;
        return matchedCategory && matchedQuery;
      });
      if (sort.value === "rating") {
        list.sort(function (a, b) { return Number(b.rating) - Number(a.rating); });
      } else if (sort.value === "views") {
        list.sort(function (a, b) { return Number(b.views) - Number(a.views); });
      } else if (sort.value === "year") {
        list.sort(function (a, b) { return Number(b.year) - Number(a.year); });
      }
      var pageList = list.slice(0, 96);
      results.innerHTML = pageList.map(renderSearchCard).join("");
      status.textContent = pageList.length ? "已筛选出相关内容。" : "暂无匹配内容。";
    }

    [input, category, sort].forEach(function (element) {
      if (element) {
        element.addEventListener("input", update);
        element.addEventListener("change", update);
      }
    });
    update();
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHero();
    setupCards();
    setupPlayers();
    setupSearchPage();
  });
})();
