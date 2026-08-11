(() => {
  const root = document.querySelector("[data-tags-page]");
  if (!root) return;

  const searchInput = root.querySelector("#tag-search-input");
  const clearButton = root.querySelector(".tags-search__clear");
  const shortcut = root.querySelector(".tags-search__shortcut");
  const status = root.querySelector(".tags-search__status");
  const popular = root.querySelector("[data-tags-popular]");
  const index = root.querySelector("[data-tags-index]");
  const emptyState = root.querySelector("[data-tags-empty]");
  const resetButton = root.querySelector("[data-tags-reset]");
  const filterButtons = [...root.querySelectorAll("[data-tag-filter]")];
  const sortButtons = [...root.querySelectorAll("[data-tag-sort]")];
  const items = [...root.querySelectorAll("[data-tag-item]")];
  const total = Number(root.dataset.tagTotal || 0);
  let activeFilter = "all";
  let activeSort = "count";

  if (!searchInput || !index) return;

  const normalize = (value) => value.trim().toLocaleLowerCase("zh-CN");

  const escapeHtml = (value) => value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  })[character]);

  const highlight = (label, query) => {
    if (!query) return escapeHtml(label);
    const normalizedLabel = label.toLocaleLowerCase("zh-CN");
    const matchIndex = normalizedLabel.indexOf(query);
    if (matchIndex < 0) return escapeHtml(label);

    return `${escapeHtml(label.slice(0, matchIndex))}<mark>${escapeHtml(label.slice(matchIndex, matchIndex + query.length))}</mark>${escapeHtml(label.slice(matchIndex + query.length))}`;
  };

  const sortItems = () => {
    const collator = new Intl.Collator("zh-CN", { numeric: true, sensitivity: "base" });
    const sorted = [...items].sort((left, right) => {
      if (activeSort === "name") {
        return collator.compare(left.dataset.tagLabel, right.dataset.tagLabel);
      }

      const countDifference = Number(right.dataset.tagCount) - Number(left.dataset.tagCount);
      return countDifference || collator.compare(left.dataset.tagLabel, right.dataset.tagLabel);
    });

    const fragment = document.createDocumentFragment();
    sorted.forEach((item) => fragment.appendChild(item));
    index.appendChild(fragment);
    index.dataset.activeSort = activeSort;
  };

  const update = () => {
    const query = normalize(searchInput.value);
    let visibleCount = 0;

    items.forEach((item) => {
      const matchesQuery = !query || item.dataset.tagName.includes(query);
      const matchesFilter = activeFilter === "all" || item.dataset.tagGroup === activeFilter;
      const visible = matchesQuery && matchesFilter;
      item.hidden = !visible;
      if (visible) visibleCount += 1;

      const label = item.querySelector("[data-tag-text]");
      if (label) label.innerHTML = highlight(item.dataset.tagLabel, query);
    });

    popular.hidden = Boolean(query) || activeFilter !== "all";
    emptyState.hidden = visibleCount > 0;
    index.hidden = visibleCount === 0;
    clearButton.hidden = !query;
    shortcut.hidden = Boolean(query);
    const resultText = query || activeFilter !== "all"
      ? `找到 <strong>${visibleCount}</strong> 个标签`
      : `共 <strong>${total}</strong> 个标签`;
    const sortText = activeSort === "name" ? "按名称排列" : "按热度排列";
    status.innerHTML = `${resultText}<span class="tags-search__sort-status"> · ${sortText}</span>`;
  };

  const reset = () => {
    searchInput.value = "";
    activeFilter = "all";
    filterButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.tagFilter === "all"));
    });
    update();
    searchInput.focus();
  };

  searchInput.addEventListener("input", update);
  searchInput.addEventListener("search", update);
  clearButton.addEventListener("click", reset);
  resetButton?.addEventListener("click", reset);

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.tagFilter;
      filterButtons.forEach((candidate) => {
        candidate.setAttribute("aria-pressed", String(candidate === button));
      });
      update();
    });
  });

  sortButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeSort = button.dataset.tagSort;
      sortButtons.forEach((candidate) => {
        candidate.setAttribute("aria-pressed", String(candidate === button));
      });
      sortItems();
      update();
    });
  });

  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      searchInput.focus();
    }

    if (event.key === "Escape" && document.activeElement === searchInput) reset();
  });

  sortItems();
  update();
})();
