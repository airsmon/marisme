document.addEventListener('DOMContentLoaded', function () {
  const cards = document.querySelectorAll('.media-card .media-card__body');
  if (!cards.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isSmallScreen = window.matchMedia('(max-width: 640px)').matches;

  cards.forEach((body) => {
    const card = body.closest('.media-card');
    if (!card) return;

    if (prefersReducedMotion) {
      card.classList.add('is-visible');
      return;
    }

    card.classList.add('media-card--reveal-ready');
  });

  if (prefersReducedMotion) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        const rect = entry.boundingClientRect;
        const fullyVisible = rect.top >= 0 && rect.bottom <= viewportHeight * 0.98;
        const mostlyVisible = entry.intersectionRatio >= (isSmallScreen ? 0.58 : 0.72);

        if (!fullyVisible && !mostlyVisible) return;

        requestAnimationFrame(() => {
          entry.target.classList.add('is-visible');
        });
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: [0.32, 0.5, 0.72, 0.9],
      rootMargin: '0px 0px -4% 0px',
    }
  );

  document.querySelectorAll('.media-card.media-card--reveal-ready').forEach((card) => {
    observer.observe(card);
  });
});
