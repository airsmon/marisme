function initLeisureReveal() {
  const grid = document.querySelector('.leisure-shelf-grid');
  if (!grid) return;

  const items = Array.from(grid.querySelectorAll('.leisure-shelf-item'));
  if (!items.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealDelayStep = 90;
  const fadeOutDuration = 220;
  let runId = 0;
  let transitionTimeoutId = 0;
  let prepareFrameId = 0;
  let revealFrameId = 0;
  let resizeFrameId = 0;
  let activeColumnCount = 1;
  let expandRightItems = new Set();

  function getVisibleItems() {
    return items.filter(function (item) {
      return !item.hidden;
    });
  }

  function getActiveColumnCount() {
    const value = window.getComputedStyle(grid).getPropertyValue('--leisure-column-count');
    const columnCount = Number.parseInt(value, 10);
    return Number.isNaN(columnCount) || columnCount < 1 ? 1 : columnCount;
  }

  function updateExpandAlignment(targetItems, columnCount) {
    const nextExpandRightItems = new Set();

    if (columnCount > 3) {
      targetItems.forEach(function (item, index) {
        const columnIndex = index % columnCount;
        if (columnIndex >= columnCount - 2) {
          nextExpandRightItems.add(item);
        }
      });
    }

    expandRightItems.forEach(function (item) {
      if (!nextExpandRightItems.has(item)) {
        item.classList.remove('is-expand-right');
      }
    });

    nextExpandRightItems.forEach(function (item) {
      if (!expandRightItems.has(item)) {
        item.classList.add('is-expand-right');
      }
    });

    expandRightItems = nextExpandRightItems;
  }

  function cancelPendingTransition() {
    if (transitionTimeoutId) {
      window.clearTimeout(transitionTimeoutId);
      transitionTimeoutId = 0;
    }

    if (prepareFrameId) {
      window.cancelAnimationFrame(prepareFrameId);
      prepareFrameId = 0;
    }

    if (revealFrameId) {
      window.cancelAnimationFrame(revealFrameId);
      revealFrameId = 0;
    }
  }

  function resetDelays(targetItems) {
    targetItems.forEach(function (item) {
      item.style.removeProperty('--leisure-reveal-delay');
    });
  }

  function applyRevealDelays(nextItems) {
    nextItems.forEach(function (item, index) {
      item.style.setProperty('--leisure-reveal-delay', index * revealDelayStep + 'ms');
    });
  }

  function showItems(nextItems, currentRunId) {
    applyRevealDelays(nextItems);
    updateExpandAlignment(nextItems, activeColumnCount);

    revealFrameId = window.requestAnimationFrame(function () {
      revealFrameId = 0;
      if (currentRunId !== runId) return;

      nextItems.forEach(function (item) {
        if (item.hidden) return;
        item.classList.add('is-visible');
      });
    });
  }

  function applyImmediateVisibility(visibleItems, hiddenItems, visibleCount, emptyState) {
    hiddenItems.forEach(function (item) {
      item.classList.remove('is-visible');
      item.style.setProperty('--leisure-reveal-delay', '0ms');
      item.hidden = true;
    });

    visibleItems.forEach(function (item) {
      item.hidden = false;
      item.classList.add('is-visible');
    });

    updateExpandAlignment(visibleItems, activeColumnCount);

    if (emptyState) {
      emptyState.hidden = visibleCount > 0;
    }
  }

  function applyFilterTransition(detail) {
    const visibleItems = detail.visibleItems || [];
    const hiddenItems = detail.hiddenItems || [];
    const visibleCount = detail.visibleCount || 0;
    const emptyState = detail.emptyState || null;

    runId += 1;
    const currentRunId = runId;
    cancelPendingTransition();

    if (prefersReducedMotion) {
      applyImmediateVisibility(visibleItems, hiddenItems, visibleCount, emptyState);
      return;
    }

    hiddenItems.forEach(function (item) {
      item.classList.remove('is-visible');
      item.style.setProperty('--leisure-reveal-delay', '0ms');
    });

    transitionTimeoutId = window.setTimeout(function () {
      transitionTimeoutId = 0;
      if (currentRunId !== runId) return;

      hiddenItems.forEach(function (item) {
        item.hidden = true;
      });

      visibleItems.forEach(function (item) {
        item.hidden = false;
        item.classList.remove('is-visible');
      });

      resetDelays(visibleItems);

      if (emptyState) {
        emptyState.hidden = visibleCount > 0;
      }

      prepareFrameId = window.requestAnimationFrame(function () {
        prepareFrameId = 0;
        if (currentRunId !== runId) return;
        showItems(visibleItems, currentRunId);
      });
    }, fadeOutDuration);
  }

  activeColumnCount = getActiveColumnCount();

  if (prefersReducedMotion) {
    items.forEach(function (item) {
      item.classList.add('is-visible');
      item.style.setProperty('--leisure-reveal-delay', '0ms');
    });
    updateExpandAlignment(getVisibleItems(), activeColumnCount);
  } else {
    items.forEach(function (item) {
      item.classList.remove('is-visible');
      item.style.setProperty('--leisure-reveal-delay', '0ms');
    });
    prepareFrameId = window.requestAnimationFrame(function () {
      prepareFrameId = 0;
      showItems(getVisibleItems(), runId);
    });
  }

  window.addEventListener('resize', function () {
    if (resizeFrameId) return;

    resizeFrameId = window.requestAnimationFrame(function () {
      resizeFrameId = 0;
      const nextColumnCount = getActiveColumnCount();
      if (nextColumnCount === activeColumnCount) return;

      activeColumnCount = nextColumnCount;
      updateExpandAlignment(getVisibleItems(), activeColumnCount);
    });
  });

  window.__leisureReveal = {
    applyFilter: applyFilterTransition,
  };
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLeisureReveal);
} else {
  initLeisureReveal();
}
