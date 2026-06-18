
(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        panel.classList.toggle('is-open');
      });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var current = 0;

      function showSlide(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('active', dotIndex === current);
        });
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
          showSlide(index);
        });
      });

      if (slides.length > 1) {
        window.setInterval(function () {
          showSlide(current + 1);
        }, 5200);
      }
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
    searchInputs.forEach(function (input) {
      var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
      var empty = document.querySelector('[data-empty-tip]');

      function applySearch() {
        var query = input.value.trim().toLowerCase();
        var visibleCount = 0;

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-tags') || '',
            card.getAttribute('data-region') || '',
            card.getAttribute('data-year') || '',
            card.textContent || ''
          ].join(' ').toLowerCase();
          var matched = !query || haystack.indexOf(query) !== -1;
          card.style.display = matched ? '' : 'none';
          if (matched) {
            visibleCount += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('is-visible', visibleCount === 0);
        }
      }

      var params = new URLSearchParams(window.location.search);
      var urlQuery = params.get('q');
      if (urlQuery) {
        input.value = urlQuery;
      }

      input.addEventListener('input', applySearch);
      applySearch();
    });
  });
})();
