(() => {
  const root = document.querySelector("[data-tags-page]");
  if (!root) return;

  const searchInput = root.querySelector("#tag-search-input");
  const clearButton = root.querySelector(".tags-search__clear");
  const shortcut = root.querySelector(".tags-search__shortcut");
  const status = root.querySelector(".tags-search__status");
  const popular = root.querySelector("[data-tags-popular]");
  const directory = root.querySelector(".tags-directory");
  const emptyState = root.querySelector("[data-tags-empty]");
  const longTail = root.querySelector("[data-tags-long-tail]");
  const longTailDetails = root.querySelector("[data-tags-long-tail-details]");
  const groups = [...root.querySelectorAll("[data-tags-group]")];
  const routeButtons = [...root.querySelectorAll("[data-tags-target]")];
  const total = Number(root.dataset.tagTotal || 0);
  let detailsWasOpen = longTailDetails?.open || false;

  root.querySelectorAll("[data-tag-label]").forEach((label) => {
    label.dataset.originalLabel = label.textContent.trim();
  });

  const normalize = (value) => value.trim().toLocaleLowerCase("zh-CN");

  const escapeHtml = (value) => value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  })[character]);

  const highlight = (name, query) => {
    if (!query) return escapeHtml(name);

    const index = name.toLocaleLowerCase("zh-CN").indexOf(query);
    if (index < 0) return escapeHtml(name);

    return `${escapeHtml(name.slice(0, index))}<mark>${escapeHtml(name.slice(index, index + query.length))}</mark>${escapeHtml(name.slice(index + query.length))}`;
  };

  const filterTags = () => {
    const query = normalize(searchInput.value);
    const visibleNames = new Set();

    root.querySelectorAll("[data-tag-item]").forEach((item) => {
      const matches = !query || item.dataset.tagName.includes(query);
      item.hidden = !matches;
      if (matches) visibleNames.add(item.dataset.tagName);

      const label = item.querySelector("[data-tag-label]");
      if (label) {
        label.innerHTML = highlight(label.dataset.originalLabel, query);
      }
    });

    let visibleGroupCount = 0;
    groups.forEach((group) => {
      const hasMatch = [...group.querySelectorAll("[data-tag-item]")].some((item) => !item.hidden);
      group.hidden = query ? !hasMatch : false;
      if (!group.hidden) visibleGroupCount += 1;

      const id = group.id.replace("tags-group-", "");
      const routeButton = routeButtons.find((button) => button.dataset.tagsTarget === id);
      if (routeButton) routeButton.closest("li").hidden = query ? !hasMatch : false;
    });

    const popularHasMatch = popular
      ? [...popular.querySelectorAll("[data-tag-item]")].some((item) => !item.hidden)
      : false;
    if (popular) popular.hidden = query ? !popularHasMatch : false;

    const longTailHasMatch = longTail
      ? [...longTail.querySelectorAll("[data-tag-item]")].some((item) => !item.hidden)
      : false;
    if (longTail) longTail.hidden = query ? !longTailHasMatch : false;

    if (longTailDetails) {
      if (query && longTailHasMatch) {
        longTailDetails.open = true;
      } else if (!query && !detailsWasOpen) {
        longTailDetails.open = false;
      }
    }

    directory.hidden = query ? visibleGroupCount === 0 : false;
    emptyState.hidden = visibleNames.size > 0;
    clearButton.hidden = !query;
    shortcut.hidden = Boolean(query);
    status.innerHTML = query
      ? `找到 <strong>${visibleNames.size}</strong> 个匹配标签`
      : `共 <strong>${total}</strong> 个标签`;
  };

  searchInput.addEventListener("input", filterTags);
  searchInput.addEventListener("search", filterTags);

  clearButton.addEventListener("click", () => {
    searchInput.value = "";
    filterTags();
    searchInput.focus();
  });

  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      searchInput.focus();
    }

    if (event.key === "Escape" && document.activeElement === searchInput) {
      searchInput.value = "";
      filterTags();
    }
  });

  routeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = root.querySelector(`#tags-group-${button.dataset.tagsTarget}`);
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    });
  });

  if (longTailDetails) {
    longTailDetails.addEventListener("toggle", () => {
      if (!normalize(searchInput.value)) detailsWasOpen = longTailDetails.open;

      const action = longTailDetails.querySelector(".tags-long-tail__action");
      if (action) {
        action.childNodes[0].textContent = longTailDetails.open ? "收起标签 " : "展开查看 ";
      }
    });
  }

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      if (normalize(searchInput.value)) return;

      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((left, right) => left.boundingClientRect.top - right.boundingClientRect.top)[0];

      if (!visible) return;
      const id = visible.target.id.replace("tags-group-", "");
      routeButtons.forEach((button) => {
        button.setAttribute("aria-current", String(button.dataset.tagsTarget === id));
      });
    }, { rootMargin: "-20% 0px -68% 0px", threshold: 0 });

    groups.forEach((group) => observer.observe(group));
  }

  filterTags();
})();
