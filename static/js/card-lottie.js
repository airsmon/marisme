const cards = Array.from(document.querySelectorAll('.post-entry'));
const hoverQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

if (cards.length && hoverQuery.matches && !reduceMotionQuery.matches) {
  let playerModule;

  const loadPlayer = () => {
    playerModule ??= import('https://cdn.jsdelivr.net/npm/@lottiefiles/dotlottie-wc@0.9.17/dist/dotlottie-wc.js')
      .then(() => customElements.whenDefined('dotlottie-wc'));

    return playerModule;
  };

  const stopCallbacks = cards.map((card) => {
    const visual = card.querySelector('[data-card-lottie]');
    const player = visual?.querySelector('dotlottie-wc');
    let animation;
    let isHovered = false;
    let isListeningForLoad = false;

    if (!visual || !player) return () => {};

    const stop = () => {
      isHovered = false;
      card.classList.remove('is-lottie-active');
      animation?.stop();
    };

    const playWhenReady = () => {
      visual.classList.add('is-lottie-ready');

      if (isHovered) {
        animation.play();
      } else {
        animation.stop();
      }
    };

    const start = async () => {
      if (!hoverQuery.matches || reduceMotionQuery.matches) return;

      isHovered = true;
      card.classList.add('is-lottie-active');

      try {
        if (!player.hasAttribute('src')) {
          player.setAttribute('src', player.dataset.src);
        }

        await loadPlayer();
        animation = player.dotLottie;

        if (!animation) {
          stop();
          return;
        }

        if (animation.isLoaded) {
          playWhenReady();
        } else if (!isListeningForLoad) {
          isListeningForLoad = true;
          animation.addEventListener('load', playWhenReady, { once: true });
        }
      } catch {
        stop();
      }
    };

    card.addEventListener('pointerenter', start);
    card.addEventListener('pointerleave', stop);

    return stop;
  });

  const stopAll = () => stopCallbacks.forEach((stop) => stop());

  hoverQuery.addEventListener('change', (event) => {
    if (!event.matches) stopAll();
  });
  reduceMotionQuery.addEventListener('change', (event) => {
    if (event.matches) stopAll();
  });
}
