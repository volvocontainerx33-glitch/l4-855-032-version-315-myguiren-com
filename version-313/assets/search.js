(function () {
  function text(value) {
    return String(value || "").trim().toLowerCase();
  }

  function unique(values) {
    var seen = {};
    return values.filter(function (value) {
      var key = String(value || "").trim();
      if (!key || seen[key]) {
        return false;
      }
      seen[key] = true;
      return true;
    }).sort(function (a, b) {
      return String(b).localeCompare(String(a), "zh-Hans-CN");
    });
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }

    unique(values).forEach(function (value) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var input = document.querySelector("[data-search-input]");
    var region = document.querySelector("[data-filter-region]");
    var type = document.querySelector("[data-filter-type]");
    var year = document.querySelector("[data-filter-year]");
    var empty = document.querySelector("[data-empty-state]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-grid .movie-card, .searchable-grid .rank-row"));

    if (!cards.length) {
      return;
    }

    fillSelect(region, cards.map(function (card) {
      return card.getAttribute("data-region");
    }));

    fillSelect(type, cards.map(function (card) {
      return card.getAttribute("data-type");
    }));

    fillSelect(year, cards.map(function (card) {
      return card.getAttribute("data-year");
    }));

    function apply() {
      var q = text(input && input.value);
      var r = region ? region.value : "";
      var t = type ? type.value : "";
      var y = year ? year.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = text([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-tags")
        ].join(" "));

        var ok = (!q || haystack.indexOf(q) !== -1) &&
          (!r || card.getAttribute("data-region") === r) &&
          (!t || card.getAttribute("data-type") === t) &&
          (!y || card.getAttribute("data-year") === y);

        card.hidden = !ok;

        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [input, region, type, year].forEach(function (el) {
      if (el) {
        el.addEventListener("input", apply);
        el.addEventListener("change", apply);
      }
    });

    apply();
  });
})();
