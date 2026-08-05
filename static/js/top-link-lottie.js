const topLink = document.getElementById('top-link');
const player = topLink?.querySelector('[data-top-link-lottie]');

if (topLink && player) {
  const touchQuery = window.matchMedia('(hover: none), (pointer: coarse)');
  const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  let animation;
  let isReady = false;
  let isLoading = false;
  let lastVisible = null;
  let playerModule;
  let posterFrame;
  let source;
  let variant;

  const selectVariant = () => {
    variant = touchQuery.matches ? 'swipe' : 'scroll';
    source = variant === 'swipe' ? player.dataset.swipeSrc : player.dataset.scrollSrc;
    posterFrame = variant === 'swipe' ? 36 : 67;
    topLink.dataset.lottieVariant = variant;
  };

  selectVariant();

  const loadPlayer = () => {
    playerModule ??= import('https://cdn.jsdelivr.net/npm/@lottiefiles/dotlottie-wc@0.9.17/dist/dotlottie-wc.js')
      .then(() => customElements.whenDefined('dotlottie-wc'));

    return playerModule;
  };

  const showFallback = () => {
    topLink.classList.remove('is-lottie-ready');
    animation?.pause();
  };

  const play = () => {
    if (
      !isReady
      || !animation
      || document.hidden
      || reduceMotionQuery.matches
      || topLink.classList.contains('hidden')
    ) return;

    animation.setFrame(0);
    animation.play();
  };

  const handleLoad = () => {
    isLoading = false;

    if (reduceMotionQuery.matches) {
      isReady = false;
      animation.setFrame(posterFrame);
      showFallback();
      return;
    }

    isReady = true;
    if (typeof animation.setSpeed === 'function') {
      animation.setSpeed(variant === 'scroll' ? 1.7 : 1.15);
    }
    animation.setFrame(posterFrame);
    topLink.classList.add('is-lottie-ready');
    animation.addEventListener('complete', () => animation.setFrame(posterFrame));

    if (!document.hidden && !topLink.classList.contains('hidden')) {
      window.requestAnimationFrame(play);
    }
  };

  const handleLoadError = () => {
    isLoading = false;
    isReady = false;
    animation?.removeEventListener('load', handleLoad);
    player.removeAttribute('src');
    showFallback();
  };

  const loadAnimation = async () => {
    if (isReady) {
      topLink.classList.add('is-lottie-ready');
      play();
      return;
    }

    if (!isLoading) selectVariant();
    if (isLoading || reduceMotionQuery.matches || !source) return;
    isLoading = true;
    player.setAttribute('src', source);

    try {
      await loadPlayer();

      if (reduceMotionQuery.matches) {
        isLoading = false;
        player.removeAttribute('src');
        showFallback();
        return;
      }

      animation = player.dotLottie;

      if (!animation) {
        isLoading = false;
        showFallback();
        return;
      }

      animation.addEventListener('loadError', handleLoadError, { once: true });

      if (animation.isLoaded) {
        handleLoad();
      } else {
        animation.addEventListener('load', handleLoad, { once: true });
      }
    } catch {
      isLoading = false;
      playerModule = undefined;
      player.removeAttribute('src');
      showFallback();
    }
  };

  const syncVisibility = () => {
    const isVisible = !topLink.classList.contains('hidden');
    if (isVisible === lastVisible) return;

    lastVisible = isVisible;
    if (isVisible) {
      loadAnimation();
    } else {
      animation?.pause();
    }
  };

  new MutationObserver(syncVisibility).observe(topLink, {
    attributes: true,
    attributeFilter: ['class'],
  });

  topLink.addEventListener('pointerenter', play);
  topLink.addEventListener('focus', play);
  topLink.addEventListener('click', play);

  touchQuery.addEventListener('change', () => {
    if (!isReady && !isLoading) selectVariant();
  });

  reduceMotionQuery.addEventListener('change', (event) => {
    if (event.matches) {
      showFallback();
    } else {
      lastVisible = null;
      syncVisibility();
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      animation?.pause();
    } else if (!topLink.classList.contains('hidden')) {
      play();
    }
  });

  syncVisibility();
}
