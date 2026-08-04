(function () {
  const initialCount = 10;
  const batchSize = 8;
  const preloadOffset = 240;

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

  function createStatus(afterElement) {
    const status = document.createElement('div');
    status.className = 'archive-infinite-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.setAttribute('aria-atomic', 'true');
    afterElement.insertAdjacentElement('afterend', status);
    return status;
  }

  function hasArchiveHashTarget() {
    if (!window.location.hash) return false;

    try {
      const targetId = decodeURIComponent(window.location.hash.slice(1));
      const target = document.getElementById(targetId);
      return Boolean(target && target.closest('.archive-year, .archive-month'));
    } catch (_) {
      return false;
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (document.body.classList.contains('archive-infinite-ready')) return;

    const entries = Array.from(document.querySelectorAll('.archive-entry'));
    if (entries.length <= initialCount) return;
    if (hasArchiveHashTarget()) return;

    const months = Array.from(new Set(entries.map(getEntryMonth).filter(Boolean)));
    const years = Array.from(new Set(entries.map(getEntryYear).filter(Boolean)));
    const statusAnchor = years[years.length - 1] || entries[entries.length - 1];
    const status = createStatus(statusAnchor);
    let visibleCount = Math.min(initialCount, entries.length);
    let observer = null;
    let scrollFrame = 0;

    document.body.classList.add('archive-infinite-ready');
    revealEntries(entries, months, years, visibleCount);

    function updateStatus() {
      const remainingCount = entries.length - visibleCount;

      if (remainingCount === 0) {
        status.textContent = `已加载全部 ${entries.length} 篇`;
        status.classList.add('is-complete');
        return;
      }

      status.textContent = `已显示 ${visibleCount}/${entries.length} 篇，向下滚动继续加载`;
    }

    function loadNextBatch() {
      if (visibleCount >= entries.length) {
        return false;
      }

      visibleCount = Math.min(visibleCount + batchSize, entries.length);
      revealEntries(entries, months, years, visibleCount);
      updateStatus();
      return visibleCount < entries.length;
    }

    function isStatusNearViewport() {
      return status.getBoundingClientRect().top <= window.innerHeight + preloadOffset;
    }

    function stopFallbackListeners() {
      window.removeEventListener('scroll', scheduleFallbackCheck);
      window.removeEventListener('resize', scheduleFallbackCheck);
    }

    function scheduleFallbackCheck() {
      if (scrollFrame) return;

      scrollFrame = window.requestAnimationFrame(function () {
        scrollFrame = 0;
        if (!isStatusNearViewport()) return;

        if (!loadNextBatch()) {
          stopFallbackListeners();
          return;
        }

        if (isStatusNearViewport()) {
          scheduleFallbackCheck();
        }
      });
    }

    updateStatus();

    if (typeof window.IntersectionObserver === 'function') {
      observer = new IntersectionObserver(
        function (observedEntries) {
          if (!observedEntries.some((entry) => entry.isIntersecting)) return;

          observer.unobserve(status);
          if (!loadNextBatch()) {
            observer.disconnect();
            return;
          }

          window.requestAnimationFrame(function () {
            observer.observe(status);
          });
        },
        {
          rootMargin: `0px 0px ${preloadOffset}px 0px`,
        }
      );

      observer.observe(status);
      return;
    }

    window.addEventListener('scroll', scheduleFallbackCheck, { passive: true });
    window.addEventListener('resize', scheduleFallbackCheck);
    scheduleFallbackCheck();
  });
})();
