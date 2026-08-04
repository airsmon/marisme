(function () {
  const initialCount = 10;
  const batchSize = 8;
  const bottomOffset = 160;
  const loadCooldown = 320;
  const loadDelay = 500;

  function getEntryMonth(entry) {
    return entry.closest('.archive-month');
  }

  function getEntryYear(entry) {
    return entry.closest('.archive-year');
  }

  function updateGroupVisibility(months, years) {
    months.forEach((month) => {
      const hasVisibleEntry = Boolean(month.querySelector('.archive-entry:not([hidden])'));
      month.hidden = !hasVisibleEntry;
    });

    years.forEach((year) => {
      const hasVisibleMonth = Boolean(year.querySelector('.archive-month:not([hidden])'));
      year.hidden = !hasVisibleMonth;
    });
  }

  function revealEntries(entries, months, years, visibleCount) {
    entries.forEach((entry, index) => {
      entry.hidden = index >= visibleCount;
    });

    updateGroupVisibility(months, years);
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (document.body.classList.contains('archive-infinite-ready')) return;

    const entries = Array.from(document.querySelectorAll('.archive-entry'));
    if (entries.length <= initialCount) return;

    const months = Array.from(new Set(entries.map(getEntryMonth).filter(Boolean)));
    const years = Array.from(new Set(entries.map(getEntryYear).filter(Boolean)));
    let visibleCount = Math.min(initialCount, entries.length);

    document.body.classList.add('archive-infinite-ready');
    revealEntries(entries, months, years, visibleCount);

    let userRequestedMore = false;
    let isLoading = false;
    let lastLoadAt = 0;

    function loadNextBatch() {
      if (visibleCount >= entries.length) {
        return;
      }

      visibleCount = Math.min(visibleCount + batchSize, entries.length);
      revealEntries(entries, months, years, visibleCount);
    }

    function isNearPageBottom() {
      return window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - bottomOffset;
    }

    function requestMore() {
      userRequestedMore = true;
    }

    function maybeLoadMore() {
      if (!userRequestedMore || isLoading || !isNearPageBottom()) return;

      const now = Date.now();
      if (now - lastLoadAt < loadCooldown) return;

      userRequestedMore = false;
      isLoading = true;

      window.setTimeout(function () {
        loadNextBatch();
        lastLoadAt = Date.now();
        isLoading = false;
      }, loadDelay);
    }

    window.addEventListener('wheel', requestMore, { passive: true });
    window.addEventListener('touchmove', requestMore, { passive: true });
    window.addEventListener('keydown', function (event) {
      if (['ArrowDown', 'PageDown', 'End', ' '].includes(event.key)) {
        requestMore();
      }
    });

    window.addEventListener('scroll', maybeLoadMore, { passive: true });
  });
})();
