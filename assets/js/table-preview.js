(function () {
  function initTablePreview() {
    const selector =
      ".post-content table:not(.highlighttable, .highlight table, .gist .highlight table), .md-content table:not(.highlighttable, .highlight table, .gist .highlight table)";
    const tableItems = [];

    document.querySelectorAll(selector).forEach(function (table, index) {
      let shell = table.parentElement;
      let block = shell && shell.parentElement;

      if (!shell || !shell.classList.contains("table-scroll")) {
        shell = document.createElement("div");
        shell.className = "table-scroll";
        table.parentNode.insertBefore(shell, table);
        shell.appendChild(table);
      }

      if (!block || !block.classList.contains("table-block")) {
        block = document.createElement("div");
        block.className = "table-block";
        shell.parentNode.insertBefore(block, shell);
        block.appendChild(shell);
      }

      const actions = document.createElement("div");
      actions.className = "table-actions";

      const hint = document.createElement("span");
      hint.className = "table-scroll-hint";
      hint.id = `table-scroll-hint-${index + 1}`;
      hint.textContent = "左右滑动查看更多";

      const expand = document.createElement("button");
      expand.className = "table-expand-button";
      expand.type = "button";
      expand.textContent = "展开表格";
      expand.setAttribute("aria-describedby", hint.id);

      actions.appendChild(hint);
      actions.appendChild(expand);
      block.insertBefore(actions, shell);
      tableItems.push({ table: table, shell: shell, block: block, hint: hint, expand: expand });
    });

    if (!tableItems.length) return;

    let activeOverlay = null;
    let activeTrigger = null;
    let previousBodyOverflow = "";

    function closePreview() {
      if (!activeOverlay) return;
      activeOverlay.remove();
      document.body.style.overflow = previousBodyOverflow;
      const trigger = activeTrigger;
      activeOverlay = null;
      activeTrigger = null;
      if (trigger) trigger.focus();
    }

    function removeDuplicateIds(root) {
      root.querySelectorAll("[id]").forEach(function (element) {
        element.removeAttribute("id");
      });
    }

    function buildPreview(item) {
      closePreview();

      const overlay = document.createElement("div");
      overlay.className = "table-preview-overlay";

      const dialog = document.createElement("div");
      dialog.className = "table-preview-dialog";
      dialog.setAttribute("role", "dialog");
      dialog.setAttribute("aria-modal", "true");
      dialog.setAttribute("aria-label", "展开的表格");
      dialog.tabIndex = -1;

      const scroll = document.createElement("div");
      scroll.className = "table-preview-scroll";
      scroll.tabIndex = 0;

      const clone = item.table.cloneNode(true);
      clone.classList.add("table-preview-table");
      removeDuplicateIds(clone);

      scroll.appendChild(clone);
      dialog.appendChild(scroll);
      overlay.appendChild(dialog);
      document.body.appendChild(overlay);

      previousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      activeOverlay = overlay;
      activeTrigger = item.expand;

      overlay.addEventListener("click", function (event) {
        if (event.target === overlay) closePreview();
      });
      dialog.addEventListener("keydown", function (event) {
        if (event.key !== "Tab") return;
        const focusable = Array.from(dialog.querySelectorAll("button, a[href], [tabindex]:not([tabindex='-1'])"));
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      });

      scroll.focus();
    }

    function updateOverflowState(item) {
      const isOverflowing = item.table.scrollWidth > item.shell.clientWidth + 2;
      item.block.classList.toggle("is-overflow-table", isOverflowing);
      item.expand.hidden = !isOverflowing;
      item.hint.hidden = !isOverflowing;
    }

    tableItems.forEach(function (item) {
      item.expand.addEventListener("click", function () {
        buildPreview(item);
      });
      item.shell.addEventListener("scroll", function () {
        if (item.shell.scrollLeft > 8) item.block.classList.add("has-scrolled");
      }, { passive: true });
      updateOverflowState(item);
    });

    window.addEventListener("resize", function () {
      tableItems.forEach(updateOverflowState);
    }, { passive: true });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closePreview();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTablePreview);
  } else {
    initTablePreview();
  }
})();
