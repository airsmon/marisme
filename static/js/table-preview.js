(function () {
  function initTablePreview() {
    const selector =
      ".post-content table:not(.highlighttable, .highlight table, .gist .highlight table), .md-content table:not(.highlighttable, .highlight table, .gist .highlight table)";

    const tableItems = Array.from(document.querySelectorAll(selector)).map(function (table) {
      const parent = table.parentElement;
      if (parent && parent.classList.contains("table-scroll")) {
        return { table: table, shell: parent };
      }

      const shell = document.createElement("div");
      shell.className = "table-scroll";
      table.parentNode.insertBefore(shell, table);
      shell.appendChild(table);
      return { table: table, shell: shell };
    });
    if (!tableItems.length) return;

    const canHoverPreview = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    let activeOverlay = null;
    let activeDialog = null;
    let activeShell = null;
    let openTimer = null;
    let closeTimer = null;
    let pointerX = 0;
    let pointerY = 0;

    function closePreview() {
      if (closeTimer) {
        clearTimeout(closeTimer);
        closeTimer = null;
      }
      if (!activeOverlay) return;
      activeOverlay.remove();
      activeOverlay = null;
      activeDialog = null;
      activeShell = null;
    }

    function queueClosePreview(delay) {
      if (closeTimer) clearTimeout(closeTimer);
      closeTimer = window.setTimeout(closePreview, delay || 48);
    }

    function pointerInsideActiveRegion() {
      const hit = document.elementFromPoint(pointerX, pointerY);
      if (!hit) return false;
      if (activeShell && activeShell.contains(hit)) return true;
      if (activeDialog && activeDialog.contains(hit)) return true;
      return false;
    }

    function positionDialog(dialog, table) {
      const gutter = 24;
      const viewportWidth = window.innerWidth;
      const targetWidth = Math.min(table.scrollWidth, viewportWidth - gutter * 2);

      dialog.style.width = `${targetWidth}px`;
    }

    function buildPreview(table) {
      closePreview();

      const overlay = document.createElement("div");
      overlay.className = "table-preview-overlay";

      const dialog = document.createElement("div");
      dialog.className = "table-preview-dialog";

      const scroll = document.createElement("div");
      scroll.className = "table-preview-scroll";

      const clone = table.cloneNode(true);
      clone.classList.add("table-preview-table");
      clone.classList.remove("is-overflow-table");

      scroll.appendChild(clone);
      dialog.appendChild(scroll);
      overlay.appendChild(dialog);
      document.body.appendChild(overlay);
      activeOverlay = overlay;
      activeDialog = dialog;
      activeShell = table.parentElement;
      positionDialog(dialog, table);

      dialog.addEventListener("mouseenter", function () {
        if (closeTimer) {
          clearTimeout(closeTimer);
          closeTimer = null;
        }
      });
      dialog.addEventListener("mouseleave", function () {
        queueClosePreview(42);
      });
      overlay.addEventListener("mouseleave", function () {
        queueClosePreview(42);
      });
    }

    function updateOverflowState(item) {
      const isOverflowing = item.table.scrollWidth > item.shell.clientWidth + 2;
      item.shell.classList.toggle("is-overflow-table", isOverflowing);
    }

    function updateAll() {
      tableItems.forEach(updateOverflowState);
    }

    updateAll();

    if (!canHoverPreview) {
      window.addEventListener("resize", updateAll, { passive: true });
      return;
    }

    tableItems.forEach((item) => {
      const table = item.table;
      const shell = item.shell;

      shell.addEventListener("mouseenter", function () {
        if (!shell.classList.contains("is-overflow-table")) return;
        if (activeOverlay && activeShell === shell) return;
        if (closeTimer) {
          clearTimeout(closeTimer);
          closeTimer = null;
        }

        openTimer = window.setTimeout(function () {
          buildPreview(table);
        }, 120);
      });

      shell.addEventListener("mouseleave", function () {
        if (openTimer) {
          clearTimeout(openTimer);
          openTimer = null;
        }

        if (activeOverlay) {
          queueClosePreview(42);
        }
      });
    });

    window.addEventListener("resize", function () {
      updateAll();
      if (activeDialog && activeShell) {
        const table = activeShell.querySelector("table");
        if (table) positionDialog(activeDialog, table);
      }
    }, { passive: true });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closePreview();
    });
    document.addEventListener("pointermove", function (event) {
      pointerX = event.clientX;
      pointerY = event.clientY;

      if (!activeOverlay || !activeDialog) return;

      if (pointerInsideActiveRegion()) {
        if (closeTimer) {
          clearTimeout(closeTimer);
          closeTimer = null;
        }
      } else {
        queueClosePreview(56);
      }
    }, { passive: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTablePreview);
  } else {
    initTablePreview();
  }
})();
