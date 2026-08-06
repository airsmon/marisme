function initLeisureFilter() {
  const filterRoot = document.querySelector('.leisure-filter');
  if (!filterRoot) return;

  const pageRoot = document.querySelector('.leisure-shelf-page');
  const tabs = Array.from(filterRoot.querySelectorAll('[data-leisure-filter]'));
  const items = Array.from(document.querySelectorAll('.leisure-shelf-item[data-media-type]'));
  const emptyState = document.querySelector('[data-leisure-empty]');
  const paginationRoot = document.querySelector('[data-leisure-pagination]');
  const prevLink = paginationRoot ? paginationRoot.querySelector('[data-leisure-prev]') : null;
  const nextLink = paginationRoot ? paginationRoot.querySelector('[data-leisure-next]') : null;
  const pageStatus = paginationRoot
    ? paginationRoot.querySelector('[data-leisure-page-status]')
    : null;
  const pageStatusCurrent = paginationRoot
    ? paginationRoot.querySelector('[data-leisure-page-current]')
    : null;
  const pageStatusTotal = paginationRoot
    ? paginationRoot.querySelector('[data-leisure-page-total]')
    : null;
  const pageStatusShort = paginationRoot
    ? paginationRoot.querySelector('[data-leisure-page-status-short]')
    : null;
  const pageStatusA11y = paginationRoot
    ? paginationRoot.querySelector('[data-leisure-page-status-a11y]')
    : null;
  const pageLinks = pageRoot
    ? Array.from(pageRoot.querySelectorAll('[data-leisure-page-link]'))
    : [];

  if (!tabs.length || !items.length) return;

  const allowedFilters = new Set(['all', 'book', 'movie']);
  const pageSize = Number(pageRoot && pageRoot.dataset.leisurePageSize) || 20;
  const allPageHrefs = new Map();
  const basePathname = pageLinks.length ? new URL(pageLinks[0].href).pathname : window.location.pathname;
  const initialHash = window.location.hash.replace('#', '');
  const initialFilter = allowedFilters.has(initialHash) ? initialHash : 'all';
  let activeFilter = initialFilter;
  let currentPage = Number(pageRoot && pageRoot.dataset.leisureCurrentPage) || 1;

  pageLinks.forEach(function (link) {
    const pageNumber = Number(link.dataset.leisurePageLink);
    if (!Number.isNaN(pageNumber) && pageNumber > 0) {
      allPageHrefs.set(pageNumber, link.href);
    }
  });

  function matchesFilter(itemType, filter) {
    if (filter === 'all') return true;
    if (filter === 'movie') return itemType === 'movie' || itemType === 'tv';
    return itemType === filter;
  }

  function getPageHref(pageNumber) {
    const matchedHref = allPageHrefs.get(pageNumber);
    if (matchedHref) return matchedHref;
    return window.location.origin + basePathname;
  }

  function getFilteredPageUrl(pageNumber, filter) {
    const pageUrl = new URL(getPageHref(pageNumber), window.location.origin);
    pageUrl.hash = filter !== 'all' ? filter : '';
    return pageUrl;
  }

  function updateUrl(filter, pageNumber) {
    const nextUrl = getFilteredPageUrl(pageNumber, filter);

    history.replaceState(null, '', nextUrl.pathname + nextUrl.hash);
  }

  function setPaginationLinkState(link, isEnabled, targetPage, filter) {
    link.classList.toggle('is-disabled', !isEnabled);
    link.setAttribute('aria-disabled', String(!isEnabled));

    if (!isEnabled) {
      if (document.activeElement === link && pageStatus) {
        pageStatus.focus({ preventScroll: true });
      }
      link.removeAttribute('href');
      link.setAttribute('tabindex', '-1');
      return;
    }

    link.href = getFilteredPageUrl(targetPage, filter).toString();
    link.removeAttribute('tabindex');
  }

  function updatePageStatus(pageNumber, totalPages) {
    if (pageStatusCurrent) {
      pageStatusCurrent.textContent = String(pageNumber).padStart(2, '0');
    }

    if (pageStatusTotal) {
      pageStatusTotal.textContent = String(totalPages).padStart(2, '0');
    }

    if (pageStatusShort) {
      pageStatusShort.textContent = pageNumber + ' / ' + totalPages;
    }

    if (pageStatusA11y) {
      pageStatusA11y.textContent = '第 ' + pageNumber + ' 页，共 ' + totalPages + ' 页';
    }
  }

  function updatePagination(filter, pageNumber, totalPages) {
    if (!paginationRoot || !prevLink || !nextLink) return;

    const hasMultiplePages = totalPages > 1;
    paginationRoot.hidden = !hasMultiplePages;
    const prevPage = Math.max(1, pageNumber - 1);
    const nextPage = Math.min(totalPages, pageNumber + 1);

    updatePageStatus(pageNumber, totalPages);
    setPaginationLinkState(prevLink, pageNumber > 1, prevPage, filter);
    setPaginationLinkState(nextLink, pageNumber < totalPages, nextPage, filter);
  }

  function applyFilter(filter, requestedPage, options) {
    const opts = options || {};
    const matchedItems = [];

    tabs.forEach(function (tab) {
      const isActive = tab.dataset.leisureFilter === filter;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-pressed', String(isActive));
    });

    items.forEach(function (item) {
      if (matchesFilter(item.dataset.mediaType, filter)) {
        matchedItems.push(item);
      }
    });

    const totalPages = Math.max(1, Math.ceil(matchedItems.length / pageSize));
    const safePage = Math.min(Math.max(requestedPage, 1), totalPages);
    const startIndex = (safePage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const visibleItems = matchedItems.slice(startIndex, endIndex);
    const visibleSet = new Set(visibleItems);
    const hiddenItems = items.filter(function (item) {
      return !visibleSet.has(item);
    });

    activeFilter = filter;
    currentPage = safePage;

    updatePagination(filter, safePage, totalPages);
    if (!opts.skipUrlSync || safePage !== requestedPage) {
      updateUrl(filter, safePage);
    }

    if (window.__leisureReveal && typeof window.__leisureReveal.applyFilter === 'function') {
      window.__leisureReveal.applyFilter({
        filter: filter,
        visibleItems: visibleItems,
        hiddenItems: hiddenItems,
        visibleCount: visibleItems.length,
        emptyState: emptyState,
      });
      return;
    }

    items.forEach(function (item) {
      const matches = visibleSet.has(item);
      item.hidden = !matches;
    });

    if (emptyState) {
      emptyState.hidden = visibleItems.length > 0;
    }
  }

  filterRoot.addEventListener('click', function (event) {
    const tab = event.target.closest('[data-leisure-filter]');
    if (!tab) return;

    const filter = tab.dataset.leisureFilter;
    if (!allowedFilters.has(filter)) return;

    applyFilter(filter, 1);
  });

  if (paginationRoot) {
    paginationRoot.addEventListener('click', function (event) {
      const link = event.target.closest('a');
      if (!link) return;

      const isPrev = link.matches('[data-leisure-prev]');
      const isNext = link.matches('[data-leisure-next]');
      if (!isPrev && !isNext) return;

      event.preventDefault();

      if (link.getAttribute('aria-disabled') === 'true') return;

      applyFilter(activeFilter, currentPage + (isPrev ? -1 : 1));

      window.requestAnimationFrame(function () {
        filterRoot.scrollIntoView({
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
          block: 'start',
        });
      });
    });
  }

  applyFilter(initialFilter, currentPage, { skipUrlSync: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLeisureFilter);
} else {
  initLeisureFilter();
}
