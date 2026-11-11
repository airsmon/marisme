// Site override of PaperMod's fastsearch.js: adds result snippets, term highlighting,
// a status line, and keeps the query in the URL (?q=).
import * as params from '@params';

const resList = document.getElementById('searchResults');
const sInput = document.getElementById('searchInput');
const searchBox = document.getElementById('searchbox');

let fuse;
let firstResult = null;
let lastResult = null;
let status = null;

const SNIPPET_LENGTH = 72;

const defaultFuseOptions = {
    threshold: 0.3,
    ignoreLocation: true,
    keys: ['title', 'tags', 'categories', 'summary', 'content']
};

const buildFuseOptions = () => {
    const opts = params.fuseOpts;
    if (!opts) return defaultFuseOptions;

    return {
        isCaseSensitive: opts.iscasesensitive ?? false,
        minMatchCharLength: opts.minmatchcharlength ?? 1,
        shouldSort: opts.shouldsort ?? true,
        findAllMatches: opts.findallmatches ?? false,
        keys: opts.keys ?? defaultFuseOptions.keys,
        location: opts.location ?? 0,
        threshold: opts.threshold ?? defaultFuseOptions.threshold,
        distance: opts.distance ?? 100,
        ignoreLocation: opts.ignorelocation ?? defaultFuseOptions.ignoreLocation
    };
};

const debounce = (fn, delay) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = window.setTimeout(() => fn(...args), delay);
    };
};

const setStatus = (message) => {
    if (status) status.textContent = message;
};

const syncUrl = (query) => {
    const url = new URL(window.location.href);
    if (query) url.searchParams.set('q', query);
    else url.searchParams.delete('q');
    history.replaceState(null, '', url.pathname + url.search + url.hash);
};

const getTerms = (query) => query.toLocaleLowerCase().split(/\s+/).filter(Boolean);

// Returns the earliest literal occurrence of any term in text, or null.
const findTerm = (text, terms, from = 0) => {
    const lower = text.toLocaleLowerCase();
    let best = null;
    for (const term of terms) {
        const index = lower.indexOf(term, from);
        if (index >= 0 && (!best || index < best.index)) best = { index, length: term.length };
    }
    return best;
};

const appendHighlighted = (parent, text, terms) => {
    let cursor = 0;
    let match = findTerm(text, terms, cursor);
    while (match) {
        parent.append(text.slice(cursor, match.index));
        const mark = document.createElement('mark');
        mark.textContent = text.slice(match.index, match.index + match.length);
        parent.append(mark);
        cursor = match.index + match.length;
        match = findTerm(text, terms, cursor);
    }
    parent.append(text.slice(cursor));
};

const buildSnippet = (item, terms) => {
    const summary = (item.summary || '').trim();
    if (findTerm(summary, terms)) return summary;

    const content = (item.content || '').replace(/\s+/g, ' ');
    const match = findTerm(content, terms);
    if (!match) return summary;

    const start = Math.max(0, match.index - 18);
    const end = Math.min(content.length, start + SNIPPET_LENGTH);
    return (start > 0 ? '…' : '') + content.slice(start, end).trim() + (end < content.length ? '…' : '');
};

const createChevron = () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '24');
    svg.setAttribute('height', '24');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    for (const points of ['13 17 18 12 13 7', '6 17 11 12 6 7']) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        line.setAttribute('points', points);
        svg.append(line);
    }
    return svg;
};

const renderResults = (results, query) => {
    resList.replaceChildren();
    firstResult = lastResult = null;
    if (!results.length) return;

    const terms = getTerms(query);
    const fragment = document.createDocumentFragment();

    for (const { item } of results) {
        const li = document.createElement('li');
        const body = document.createElement('span');
        body.className = 'search-result__body';

        const title = document.createElement('span');
        title.className = 'search-result__title';
        appendHighlighted(title, item.title, terms);
        body.append(title);

        const matchedTags = (item.tags || []).filter((tag) => findTerm(String(tag), terms));
        const snippet = buildSnippet(item, terms);
        if (item.date || matchedTags.length || snippet) {
            const meta = document.createElement('span');
            meta.className = 'search-result__meta';
            const lead = [item.date, ...matchedTags.map((tag) => `#${tag}`)].filter(Boolean).join(' · ');
            if (lead) {
                const leadEl = document.createElement('span');
                leadEl.className = 'search-result__lead';
                appendHighlighted(leadEl, lead, terms);
                meta.append(leadEl);
            }
            if (snippet) {
                const snippetEl = document.createElement('span');
                snippetEl.className = 'search-result__snippet';
                appendHighlighted(snippetEl, snippet, terms);
                meta.append(snippetEl);
            }
            body.append(meta);
        }

        const link = document.createElement('a');
        link.className = 'entry-link';
        link.href = item.permalink;
        link.setAttribute('aria-label', item.title);

        li.append(body, createChevron(), link);
        fragment.append(li);
    }

    resList.append(fragment);
    firstResult = resList.firstElementChild;
    lastResult = resList.lastElementChild;
};

const performSearch = () => {
    const query = sInput.value.trim();
    syncUrl(query);

    if (!query) {
        renderResults([], '');
        setStatus('');
        return;
    }
    if (!fuse) return;

    const limit = params.fuseOpts?.limit;
    const results = limit ? fuse.search(query, { limit }) : fuse.search(query);
    renderResults(results, query);

    if (!results.length) setStatus(`没有找到与「${query}」相关的内容，换个关键词试试。`);
    else if (limit && results.length >= limit) setStatus(`显示最相关的 ${results.length} 条结果`);
    else setStatus(`找到 ${results.length} 条结果`);
};

const reset = () => {
    sInput.value = '';
    performSearch();
    sInput.focus();
};

const setActiveResult = (element) => {
    resList.querySelectorAll('.focus').forEach((item) => item.classList.remove('focus'));
    if (!element) return;

    element.focus();
    if (element !== sInput) element.parentElement?.classList.add('focus');
};

const initSearch = async () => {
    if (!sInput || !resList) return;

    status = document.createElement('p');
    status.className = 'search-status';
    status.setAttribute('role', 'status');
    sInput.after(status);

    sInput.disabled = false;
    sInput.value = new URLSearchParams(window.location.search).get('q') || '';
    sInput.focus();

    try {
        const response = await fetch('../index.json');
        if (!response.ok) throw new Error(`Search index load failed: ${response.status}`);
        fuse = new Fuse(await response.json(), buildFuseOptions());
        performSearch();
    } catch (error) {
        console.error(error);
        setStatus('搜索索引加载失败，请刷新页面重试。');
    }
};

window.addEventListener('load', initSearch);

sInput?.addEventListener('input', debounce(performSearch, 150));

sInput?.addEventListener('search', () => {
    if (!sInput.value) reset();
});

document.addEventListener('keydown', (event) => {
    const { key } = event;
    const active = document.activeElement;
    const isInSearchBox = searchBox?.contains(active);

    if (key === 'Escape') {
        if (isInSearchBox) reset();
        return;
    }

    if (!firstResult || !isInSearchBox) return;

    if (key === 'ArrowDown') {
        event.preventDefault();
        if (active === sInput) {
            setActiveResult(firstResult.querySelector('.entry-link'));
        } else if (active?.parentElement !== lastResult) {
            setActiveResult(active?.parentElement?.nextElementSibling?.querySelector('.entry-link'));
        }
    } else if (key === 'ArrowUp') {
        event.preventDefault();
        if (active?.parentElement === firstResult) {
            setActiveResult(sInput);
        } else if (active !== sInput) {
            setActiveResult(active?.parentElement?.previousElementSibling?.querySelector('.entry-link'));
        }
    } else if (key === 'ArrowRight') {
        if (active?.matches?.('.entry-link')) active.click();
    }
});
