(function () {
  function initFloatingTocMarquee() {
    const tocLinks = Array.from(document.querySelectorAll(".paper-floating-toc-link"));

    if (!tocLinks.length) return;

    function ensureLabel(link) {
      let label = link.querySelector(".paper-floating-toc-label");
      if (label) return label;

      label = document.createElement("span");
      label.className = "paper-floating-toc-label";

      while (link.firstChild) {
        label.appendChild(link.firstChild);
      }

      link.appendChild(label);
      return label;
    }

    function resetMarquee(link, label) {
      label.style.transition = "";
      label.style.transform = "translate3d(0, 0, 0)";

      if (link._tocMarqueeTimer) {
        window.clearTimeout(link._tocMarqueeTimer);
        link._tocMarqueeTimer = null;
      }
    }

    function measureOverflow(link) {
      const label = ensureLabel(link);
      resetMarquee(link, label);

      const overflow = Math.max(0, Math.ceil(label.scrollWidth - link.clientWidth));
      link.dataset.tocOverflow = overflow > 0 ? "true" : "false";

      const fadeWidthPx = overflow > 0
        ? Math.max(18, Math.min(42, 18 + overflow * 0.11))
        : 0;
      const fadeMidStop = overflow > 0
        ? Math.max(60, Math.min(82, 82 - overflow * 0.08))
        : 65;

      link.style.setProperty("--toc-fade-width", `${fadeWidthPx}px`);
      link.style.setProperty("--toc-fade-mid-stop", `${fadeMidStop}%`);

      return { label, overflow };
    }

    function playMarquee(link) {
      const { label, overflow } = measureOverflow(link);
      if (overflow <= 0) return;

      const duration = Math.max(2.8, overflow / 26);

      link._tocMarqueeTimer = window.setTimeout(function () {
        label.style.transition = `transform ${duration}s linear`;
        label.style.transform = `translate3d(${-overflow}px, 0, 0)`;
      }, 180);
    }

    tocLinks.forEach((link) => {
      const label = ensureLabel(link);
      resetMarquee(link, label);

      link.addEventListener("mouseenter", function () {
        playMarquee(link);
      });

      link.addEventListener("mouseleave", function () {
        resetMarquee(link, label);
      });

      link.addEventListener("focus", function () {
        playMarquee(link);
      });

      link.addEventListener("blur", function () {
        resetMarquee(link, label);
      });
    });

    const remeasureAll = function () {
      tocLinks.forEach((link) => {
        measureOverflow(link);
      });
    };

    window.addEventListener("resize", remeasureAll, { passive: true });
    remeasureAll();
  }

  function initFloatingTocActive() {
    const tocLinks = Array.from(
      document.querySelectorAll(".paper-floating-toc-link[href^='#']")
    );

    if (!tocLinks.length) return;

    const items = tocLinks
      .map((link) => {
        const rawHref = link.getAttribute("href");
        if (!rawHref || rawHref === "#") return null;

        const id = decodeURIComponent(rawHref.slice(1));
        const heading = document.getElementById(id);

        if (!heading) return null;

        return {
          id,
          link,
          heading,
        };
      })
      .filter(Boolean);

    if (!items.length) return;

    function clearActive() {
      tocLinks.forEach((link) => {
        link.dataset.active = "false";
        link.removeAttribute("aria-current");
      });
    }

    function setActive(item) {
      if (!item) return;

      clearActive();

      item.link.dataset.active = "true";
      item.link.setAttribute("aria-current", "true");
    }

    function updateActive() {
      const offset = 128;
      const currentY = window.scrollY + offset;

      let active = items[0];

      for (const item of items) {
        const headingTop =
          item.heading.getBoundingClientRect().top + window.scrollY;

        if (headingTop <= currentY) {
          active = item;
        } else {
          break;
        }
      }

      setActive(active);
    }

    let ticking = false;

    window.addEventListener(
      "scroll",
      function () {
        if (ticking) return;

        window.requestAnimationFrame(function () {
          updateActive();
          ticking = false;
        });

        ticking = true;
      },
      { passive: true }
    );

    window.addEventListener("resize", updateActive);

    tocLinks.forEach((link) => {
      link.addEventListener("click", function () {
        const target = items.find((item) => item.link === link);
        setActive(target);
      });
    });

    updateActive();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      initFloatingTocMarquee();
      initFloatingTocActive();
    });
  } else {
    initFloatingTocMarquee();
    initFloatingTocActive();
  }
})();
