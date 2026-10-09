import { loadDotLottie, prewarmDotLottie } from './lottie-runtime.js';

const cards = Array.from(document.querySelectorAll('.post-entry'));
const hoverQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

if (cards.length && hoverQuery.matches && !reduceMotionQuery.matches) {
  const firstSource = cards[0].querySelector('[data-card-lottie-mount]')?.dataset.src;

  const prewarm = () => {
    if (document.hidden || navigator.connection?.saveData) return;

    prewarmDotLottie().catch(() => {});

    if (firstSource) {
      fetch(firstSource, { cache: 'force-cache' })
        .then((response) => response.ok ? response.arrayBuffer() : undefined)
        .catch(() => {});
    }
  };

  const schedulePrewarm = () => {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(prewarm, { timeout: 2500 });
    } else {
      window.setTimeout(prewarm, 1200);
    }
  };

  if (document.readyState === 'complete') {
    schedulePrewarm();
  } else {
    window.addEventListener('load', schedulePrewarm, { once: true });
  }

  const stopCallbacks = cards.map((card) => {
    const visual = card.querySelector('[data-card-lottie]');
    const mount = visual?.querySelector('[data-card-lottie-mount]');
    let player;
    let animation;
    let isHovered = false;
    let isListeningForLoad = false;

    if (!visual || !mount?.dataset.src) return () => {};

    const stop = () => {
      isHovered = false;
      card.classList.remove('is-lottie-active');
      animation?.stop();
    };

    const resetPlayer = () => {
      player?.remove();
      player = undefined;
      animation = undefined;
      isListeningForLoad = false;
      visual.classList.remove('is-lottie-ready');
    };

    const handleLoadError = () => {
      stop();
      resetPlayer();
    };

    const playWhenReady = () => {
      isListeningForLoad = false;
      visual.classList.add('is-lottie-ready');

      if (isHovered) {
        animation.play();
      } else {
        animation.stop();
      }
    };

    const ensurePlayer = async () => {
      await loadDotLottie();
      if (player) return;

      player = document.createElement('dotlottie-wc');
      player.className = 'card-lottie__player';
      player.toggleAttribute('loop', true);
      player.setAttribute('src', mount.dataset.src);
      mount.append(player);
      animation = player.dotLottie;

      if (!animation) {
        resetPlayer();
        throw new Error('dotLottie card player was not initialized');
      }

      animation.addEventListener('loadError', handleLoadError, { once: true });
    };

    const start = async () => {
      if (!hoverQuery.matches || reduceMotionQuery.matches) return;

      isHovered = true;
      card.classList.add('is-lottie-active');

      try {
        await ensurePlayer();

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
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAll();
  });
}
