(function () {
  const progress = document.querySelector('[data-reading-progress]');
  const content = document.querySelector('.post-single .post-content');

  if (!progress || !content) return;

  let frameId = 0;

  function render() {
    frameId = 0;

    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const contentRect = content.getBoundingClientRect();
    const contentTop = contentRect.top + scrollTop;
    const contentBottom = contentTop + contentRect.height;
    const readingEnd = Math.max(contentTop + 1, contentBottom - window.innerHeight);
    const value = Math.min(1, Math.max(0, (scrollTop - contentTop) / (readingEnd - contentTop)));
    const isVisible = contentRect.height > window.innerHeight && scrollTop > contentTop && scrollTop < readingEnd;

    progress.style.setProperty('--reading-progress', value.toFixed(4));
    progress.classList.toggle('is-visible', isVisible);
    progress.setAttribute('aria-hidden', String(!isVisible));
  }

  function requestRender() {
    if (frameId) return;
    frameId = window.requestAnimationFrame(render);
  }

  window.addEventListener('scroll', requestRender, { passive: true });
  window.addEventListener('resize', requestRender);
  window.addEventListener('load', requestRender, { once: true });
  requestRender();
})();
