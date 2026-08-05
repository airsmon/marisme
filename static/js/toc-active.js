(function () {
  const desktopQuery = window.matchMedia("(min-width: 1360px)");
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  function initFloatingToc() {
    const toc = document.querySelector(".paper-floating-toc");
    if (!toc) return;

    const panel = toc.querySelector(".paper-floating-toc-panel");
    const nav = toc.querySelector("#TableOfContents");
    const toggle = toc.querySelector(".paper-floating-toc-toggle");
    const preview = toc.querySelector(".paper-floating-toc-preview");
    const previewTitle = toc.querySelector(".paper-floating-toc-preview-title");

    if (!panel || !nav || !toggle || !preview || !previewTitle) return;

    const links = Array.from(nav.querySelectorAll('a[href^="#"]'));
    const items = links
      .map(function (link) {
        const href = link.getAttribute("href");
        if (!href || href === "#") return null;

        let id;
        try {
          id = decodeURIComponent(href.slice(1));
        } catch (_error) {
          return null;
        }

        const heading = document.getElementById(id);
        if (!heading) return null;

        const label = link.textContent.replace(/\s+/g, " ").trim();
        link.removeAttribute("title");

        return { heading: heading, label: label, link: link };
      })
      .filter(Boolean);

    if (!items.length) return;

    let activeItem = null;
    let previewItem = null;
    let previewFrame = 0;
    let syncFrame = 0;
    let positionFrame = 0;
    let lensFrame = 0;
    let lensY = null;
    let positions = [];
    let mobileOpen = toc.dataset.tocOpen === "true";

    function positionPreview(item) {
      if (!desktopQuery.matches || !item) return;

      const panelRect = panel.getBoundingClientRect();
      const linkRect = item.link.getBoundingClientRect();
      const previewHeight = preview.offsetHeight;
      const viewportEdge = 8;
      const idealTop =
        linkRect.top - panelRect.top + (linkRect.height - previewHeight) / 2;
      const minTop = viewportEdge - panelRect.top;
      const maxTop = Math.max(
        minTop,
        window.innerHeight - viewportEdge - panelRect.top - previewHeight,
      );
      const top = Math.min(Math.max(idealTop, minTop), maxTop);

      panel.style.setProperty("--toc-preview-y", `${Math.round(top)}px`);
    }

    function renderPreview() {
      const item = previewItem || activeItem;
      if (!item || !desktopQuery.matches) {
        toc.classList.remove("has-preview");
        return;
      }

      previewTitle.textContent = item.label;
      positionPreview(item);
      toc.classList.add("has-preview");
    }

    function schedulePreview() {
      if (previewFrame) return;
      previewFrame = window.requestAnimationFrame(function () {
        previewFrame = 0;
        renderPreview();
      });
    }

    function renderLens() {
      lensFrame = 0;
      if (lensY === null || !desktopQuery.matches || reducedMotionQuery.matches) return;

      items.forEach(function (item) {
        const linkRect = item.link.getBoundingClientRect();
        const distance = Math.abs(linkRect.top + linkRect.height / 2 - lensY);
        const influence = Math.max(0, 1 - distance / 45);
        const eased = influence * influence * (3 - 2 * influence);
        const minimum = item === activeItem ? 2 : 1;
        const scale = Math.max(minimum, 1 + 3 * eased);
        item.link.style.setProperty("--toc-marker-scale", scale.toFixed(2));
      });
    }

    function scheduleLens() {
      if (lensFrame) return;
      lensFrame = window.requestAnimationFrame(renderLens);
    }

    function clearLens() {
      lensY = null;
      items.forEach(function (item) {
        item.link.style.removeProperty("--toc-marker-scale");
      });
    }

    function keepMarkerVisible(item) {
      if (!desktopQuery.matches || !item) return;

      const navRect = nav.getBoundingClientRect();
      const linkRect = item.link.getBoundingClientRect();
      const edge = 12;

      if (linkRect.top < navRect.top + edge) {
        nav.scrollTop -= navRect.top + edge - linkRect.top;
      } else if (linkRect.bottom > navRect.bottom - edge) {
        nav.scrollTop += linkRect.bottom - navRect.bottom + edge;
      }
    }

    function setActive(item) {
      if (!item || activeItem === item) {
        schedulePreview();
        return;
      }

      if (activeItem) activeItem.link.removeAttribute("aria-current");
      activeItem = item;
      activeItem.link.setAttribute("aria-current", "location");
      keepMarkerVisible(activeItem);
      scheduleLens();
      schedulePreview();
    }

    function syncActive() {
      syncFrame = 0;
      if (!positions.length) return;

      const currentY = window.scrollY + 128;
      let current = items[0];
      let low = 0;
      let high = positions.length - 1;

      while (low <= high) {
        const middle = Math.floor((low + high) / 2);
        if (positions[middle].top <= currentY) {
          current = positions[middle].item;
          low = middle + 1;
        } else {
          high = middle - 1;
        }
      }

      const pageBottom = window.scrollY + window.innerHeight;
      const documentBottom = document.documentElement.scrollHeight;
      if (pageBottom >= documentBottom - 2) current = items[items.length - 1];

      setActive(current);
    }

    function refreshPositions() {
      positionFrame = 0;
      positions = items.map(function (item) {
        return {
          item: item,
          top: item.heading.getBoundingClientRect().top + window.scrollY,
        };
      });
      syncActive();
    }

    function schedulePositionRefresh() {
      if (positionFrame) return;
      positionFrame = window.requestAnimationFrame(refreshPositions);
    }

    function scheduleActiveSync() {
      if (syncFrame) return;
      syncFrame = window.requestAnimationFrame(syncActive);
    }

    function syncResponsiveState() {
      const isDesktop = desktopQuery.matches;
      panel.hidden = isDesktop ? false : !mobileOpen;
      toggle.setAttribute("aria-expanded", String(isDesktop || mobileOpen));
      toggle.textContent = mobileOpen ? "收起文章目录" : "展开文章目录";
      if (!isDesktop) clearLens();
      schedulePositionRefresh();
      scheduleLens();
      schedulePreview();
    }

    toggle.hidden = false;
    toc.classList.add("is-enhanced");
    toggle.addEventListener("click", function () {
      mobileOpen = !mobileOpen;
      syncResponsiveState();
    });

    items.forEach(function (item) {
      item.link.addEventListener("mouseenter", function () {
        previewItem = item;
        schedulePreview();
      });

      item.link.addEventListener("focus", function () {
        previewItem = item;
        schedulePreview();
      });

      item.link.addEventListener("click", function () {
        setActive(item);
      });
    });

    nav.addEventListener("mouseleave", function () {
      clearLens();
      if (!nav.contains(document.activeElement)) {
        previewItem = null;
        schedulePreview();
      }
    });

    nav.addEventListener("pointerleave", clearLens);

    nav.addEventListener("focusout", function (event) {
      if (!nav.contains(event.relatedTarget)) {
        previewItem = null;
        schedulePreview();
      }
    });

    nav.addEventListener(
      "pointermove",
      function (event) {
        lensY = event.clientY;
        scheduleLens();
      },
      { passive: true }
    );

    nav.addEventListener("scroll", function () {
      scheduleLens();
      schedulePreview();
    }, { passive: true });
    window.addEventListener("scroll", scheduleActiveSync, { passive: true });
    window.addEventListener("resize", schedulePositionRefresh, { passive: true });
    window.addEventListener("load", schedulePositionRefresh, { once: true });
    window.addEventListener("hashchange", scheduleActiveSync);
    desktopQuery.addEventListener("change", syncResponsiveState);

    if ("ResizeObserver" in window) {
      const content = document.querySelector(".post-content");
      if (content) new ResizeObserver(schedulePositionRefresh).observe(content);
    }

    syncResponsiveState();
    refreshPositions();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFloatingToc, { once: true });
  } else {
    initFloatingToc();
  }
})();
