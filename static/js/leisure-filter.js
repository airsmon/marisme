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
  const pageLinks = pageRoot
    ? Array.from(pageRoot.querySelectorAll('[data-leisure-page-link]'))
    : [];

  if (!tabs.length || !items.length) return;

  const allowedFilters = new Set(['all', 'book', 'movie']);
  const pageSize = Number(pageRoot && pageRoot.dataset.leisurePageSize) || 20;
  const showPageNums = pageRoot && pageRoot.dataset.leisureShowPageNums === 'true';
  const prevLabel = (pageRoot && pageRoot.dataset.leisurePrevLabel) || 'Previous';
  const nextLabel = (pageRoot && pageRoot.dataset.leisureNextLabel) || 'Next';
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

  function updateUrl(filter, pageNumber) {
    const nextUrl = new URL(getPageHref(pageNumber), window.location.origin);

    if (filter !== 'all') {
      nextUrl.hash = filter;
    } else {
      nextUrl.hash = '';
    }

    history.replaceState(null, '', nextUrl.pathname + nextUrl.hash);
  }

  function updatePagination(filter, pageNumber, totalPages) {
    if (!paginationRoot || !prevLink || !nextLink) return;

    const hasMultiplePages = totalPages > 1;
    paginationRoot.hidden = !hasMultiplePages;
    paginationRoot.style.display = hasMultiplePages ? '' : 'none';
    if (!hasMultiplePages) {
      prevLink.hidden = true;
      nextLink.hidden = true;
      return;
    }

    const prevPage = Math.max(1, pageNumber - 1);
    const nextPage = Math.min(totalPages, pageNumber + 1);
    const hasPrev = pageNumber > 1;
    const hasNext = pageNumber < totalPages;
    const prevText = showPageNums
      ? '«\u00a0' + prevLabel + '\u00a0' + prevPage + '/' + totalPages
      : '«\u00a0' + prevLabel;
    const nextText = showPageNums
      ? nextLabel + '\u00a0' + nextPage + '/' + totalPages + '\u00a0»'
      : nextLabel + '\u00a0»';

    prevLink.href = getPageHref(prevPage);
    prevLink.textContent = prevText;
    prevLink.hash = filter !== 'all' ? filter : '';
    prevLink.hidden = !hasPrev;
    prevLink.style.display = hasPrev ? '' : 'none';

    nextLink.href = getPageHref(nextPage);
    nextLink.textContent = nextText;
    nextLink.hash = filter !== 'all' ? filter : '';
    nextLink.hidden = !hasNext;
    nextLink.style.display = hasNext ? '' : 'none';
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
    if (!opts.skipUrlSync) {
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
      item.style.display = matches ? '' : 'none';
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

      applyFilter(activeFilter, currentPage + (isPrev ? -1 : 1));
    });
  }

  applyFilter(initialFilter, currentPage, { skipUrlSync: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLeisureFilter);
} else {
  initLeisureFilter();
}
