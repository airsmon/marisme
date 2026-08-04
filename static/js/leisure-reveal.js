function initLeisureReveal() {
  const grid = document.querySelector('.leisure-shelf-grid');
  if (!grid) return;

  const items = Array.from(grid.querySelectorAll('.leisure-shelf-item'));
  if (!items.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealDelayStep = 90;
  const fadeOutDuration = 220;
  let runId = 0;

  function clearExpandAlignment() {
    items.forEach(function (item) {
      item.classList.remove('is-expand-right');
    });
  }

  function getVisibleItems() {
    return items.filter(function (item) {
      return !item.hidden && item.style.display !== 'none';
    });
  }

  function getActiveColumnCount() {
    const templateColumns = window.getComputedStyle(grid).gridTemplateColumns;
    if (!templateColumns || templateColumns === 'none') return 1;

    return templateColumns
      .split(' ')
      .filter(function (column) {
        return column && column !== '/';
      }).length;
  }

  function updateExpandAlignment(targetItems) {
    clearExpandAlignment();

    const activeColumns = getActiveColumnCount();
    if (activeColumns <= 3) return;

    const orderedItems = getRevealOrder(targetItems);
    let currentTop = null;
    let currentColumn = 0;

    orderedItems.forEach(function (item) {
      if (currentTop === null || Math.abs(item.offsetTop - currentTop) > 4) {
        currentTop = item.offsetTop;
        currentColumn = 1;
      } else {
        currentColumn += 1;
      }

      if (currentColumn >= activeColumns - 1) {
        item.classList.add('is-expand-right');
      }
    });
  }

  function getRevealOrder(nextItems) {
    return nextItems
      .slice()
      .sort(function (leftItem, rightItem) {
        const leftTop = leftItem.offsetTop;
        const rightTop = rightItem.offsetTop;

        if (Math.abs(leftTop - rightTop) > 4) {
          return leftTop - rightTop;
        }

        return leftItem.offsetLeft - rightItem.offsetLeft;
      });
  }

  function resetDelays(targetItems) {
    targetItems.forEach(function (item) {
      item.style.removeProperty('--leisure-reveal-delay');
    });
  }

  function applyRevealDelays(nextItems) {
    const orderedItems = getRevealOrder(nextItems);

    orderedItems.forEach(function (item, index) {
      item.style.setProperty('--leisure-reveal-delay', index * revealDelayStep + 'ms');
    });

    return orderedItems;
  }

  function showItems(nextItems) {
    const orderedItems = applyRevealDelays(nextItems);
    updateExpandAlignment(orderedItems);

    requestAnimationFrame(function () {
      orderedItems.forEach(function (item) {
        if (item.hidden || item.style.display === 'none') return;
        item.classList.add('is-visible');
      });
    });
  }

  function applyImmediateVisibility(visibleItems, hiddenItems, visibleCount, emptyState) {
    hiddenItems.forEach(function (item) {
      item.classList.remove('is-visible');
      item.style.setProperty('--leisure-reveal-delay', '0ms');
      item.hidden = true;
      item.style.display = 'none';
    });

    visibleItems.forEach(function (item) {
      item.hidden = false;
      item.style.display = '';
      item.classList.add('is-visible');
    });

    updateExpandAlignment(visibleItems);

    if (emptyState) {
      emptyState.hidden = visibleCount > 0;
    }
  }

  function applyFilterTransition(detail) {
    const visibleItems = detail.visibleItems || [];
    const hiddenItems = detail.hiddenItems || [];
    const visibleCount = detail.visibleCount || 0;
    const emptyState = detail.emptyState || null;

    if (prefersReducedMotion) {
      applyImmediateVisibility(visibleItems, hiddenItems, visibleCount, emptyState);
      return;
    }

    runId += 1;
    const currentRunId = runId;

    hiddenItems.forEach(function (item) {
      item.classList.remove('is-visible');
      item.style.setProperty('--leisure-reveal-delay', '0ms');
    });

    window.setTimeout(function () {
      if (currentRunId !== runId) return;

      hiddenItems.forEach(function (item) {
        item.hidden = true;
        item.style.display = 'none';
      });

      visibleItems.forEach(function (item) {
        item.hidden = false;
        item.style.display = '';
        item.classList.remove('is-visible');
      });

      resetDelays(visibleItems);

      if (emptyState) {
        emptyState.hidden = visibleCount > 0;
      }

      requestAnimationFrame(function () {
        if (currentRunId !== runId) return;
        showItems(visibleItems);
      });
    }, fadeOutDuration);
  }

  if (prefersReducedMotion) {
    items.forEach(function (item) {
      item.classList.add('is-visible');
      item.style.setProperty('--leisure-reveal-delay', '0ms');
    });
  } else {
    items.forEach(function (item) {
      item.classList.remove('is-visible');
      item.style.setProperty('--leisure-reveal-delay', '0ms');
    });
    requestAnimationFrame(function () {
      showItems(getVisibleItems());
    });
  }

  window.addEventListener('resize', function () {
    updateExpandAlignment(getVisibleItems());
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
