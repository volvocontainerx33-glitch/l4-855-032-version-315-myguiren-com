(function () {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var mainNav = document.querySelector('[data-main-nav]');

    if (navToggle && mainNav) {
        navToggle.addEventListener('click', function () {
            mainNav.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var currentSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        currentSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === currentSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === currentSlide);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(currentSlide + 1);
        }, 5200);
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]')).forEach(function (input) {
        var scope = input.closest('[data-filter-scope]') || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-card]'));

        input.addEventListener('input', function () {
            var keyword = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search-text') || '').toLowerCase();
                card.style.display = !keyword || text.indexOf(keyword) !== -1 ? '' : 'none';
            });
        });
    });

    var searchForm = document.querySelector('[data-search-form]');
    var searchInput = document.querySelector('[data-search-input]');
    var searchResults = document.querySelector('[data-search-results]');

    function renderSearchResults(keyword) {
        if (!searchResults || !window.SEARCH_ITEMS) {
            return;
        }

        var query = (keyword || '').trim().toLowerCase();
        var matched = window.SEARCH_ITEMS.filter(function (item) {
            return !query || item.text.toLowerCase().indexOf(query) !== -1;
        }).slice(0, 80);

        if (!matched.length) {
            searchResults.innerHTML = '<div class="empty-state">没有找到匹配内容</div>';
            return;
        }

        searchResults.innerHTML = '<div class="movie-grid">' + matched.map(function (item) {
            return [
                '<article class="movie-card">',
                '<a class="poster-link" href="' + item.url + '">',
                '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '" loading="lazy">',
                '<span class="poster-play">▶</span>',
                '</a>',
                '<div class="movie-card-body">',
                '<div class="movie-meta">' + item.meta + '</div>',
                '<h3><a href="' + item.url + '">' + item.title + '</a></h3>',
                '<p>' + item.desc + '</p>',
                '<div class="tag-row"><span>' + item.category + '</span></div>',
                '</div>',
                '</article>'
            ].join('');
        }).join('') + '</div>';
    }

    if (searchForm && searchInput) {
        searchForm.addEventListener('submit', function (event) {
            event.preventDefault();
            renderSearchResults(searchInput.value);
        });
        searchInput.addEventListener('input', function () {
            renderSearchResults(searchInput.value);
        });
        renderSearchResults('');
    }
}());
