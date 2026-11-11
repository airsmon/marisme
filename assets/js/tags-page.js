(() => {
  const root = document.querySelector("[data-tags-page]");
  if (!root) return;

  const input = root.querySelector("[data-tags-input]");
  if (!input) return;

  const clearButton = root.querySelector("[data-tags-clear]");
  const status = root.querySelector("[data-tags-status]");
  const emptyState = root.querySelector("[data-tags-empty]");
  const resetButton = root.querySelector("[data-tags-reset]");
  const groups = [...root.querySelectorAll("[data-tag-group]")];
  const items = [...root.querySelectorAll("[data-tag-item]")];
  const jumps = [...root.querySelectorAll("[data-jump]")];
  const totalTags = Number(root.dataset.tagTotal || 0);
  const totalArticles = Number(root.dataset.articleTotal || 0);

  const normalize = (value) => value.trim().toLocaleLowerCase("zh-CN");

  const renderLabel = (item, query) => {
    const target = item.querySelector("[data-tag-text]");
    const label = item.dataset.tagLabel || "";
    const start = query ? label.toLocaleLowerCase("zh-CN").indexOf(query) : -1;
    if (start < 0) {
      target.textContent = label;
      return;
    }
    const mark = document.createElement("mark");
    mark.textContent = label.slice(start, start + query.length);
    target.replaceChildren(
      document.createTextNode(label.slice(0, start)),
      mark,
      document.createTextNode(label.slice(start + query.length))
    );
  };

  const applyFilter = () => {
    const query = normalize(input.value);
    let matches = 0;

    items.forEach((item) => {
      const visible = !query || item.dataset.tagName.includes(query);
      item.hidden = !visible;
      renderLabel(item, visible ? query : "");
      if (visible) matches += 1;
    });

    groups.forEach((group) => {
      group.hidden = !group.querySelector("[data-tag-item]:not([hidden])");
    });

    if (clearButton) clearButton.hidden = !input.value;
    if (emptyState) emptyState.hidden = matches > 0;
    if (status) {
      status.textContent = query
        ? `匹配 ${matches} 个标签`
        : `共 ${totalTags} 个标签 · ${totalArticles} 篇文章`;
    }
  };

  const resetSearch = () => {
    input.value = "";
    applyFilter();
    input.focus();
  };

  input.addEventListener("input", applyFilter);
  clearButton?.addEventListener("click", resetSearch);
  resetButton?.addEventListener("click", resetSearch);

  document.addEventListener("keydown", (event) => {
    const isEditable = event.target instanceof HTMLElement
      && (event.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName));
    const shortcut = (event.key === "/" && !isEditable)
      || ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k");

    if (shortcut) {
      event.preventDefault();
      input.focus();
      input.select();
    } else if (event.key === "Escape" && document.activeElement === input) {
      input.value = "";
      applyFilter();
      input.blur();
    }
  });

  // Inline article preview. Buttons start hidden so the page works without JavaScript.
  items.forEach((item) => {
    const toggle = item.querySelector(".tags-item__toggle");
    const preview = item.querySelector(".tags-item__preview");
    if (!toggle || !preview || !preview.querySelector("a")) return;

    toggle.hidden = false;
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", String(open));
      preview.hidden = !open;
    });
  });

  // Highlight the topic currently in view.
  const setCurrent = (id) => {
    jumps.forEach((link) => {
      if (link.dataset.jump === id) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  };

  jumps.forEach((link) => {
    link.addEventListener("click", () => setCurrent(link.dataset.jump));
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setCurrent(entry.target.dataset.tagGroup);
      });
    }, { rootMargin: "-120px 0px -65% 0px" });
    groups.forEach((group) => observer.observe(group));
  }
})();
