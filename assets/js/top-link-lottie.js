import { loadDotLottie } from './lottie-runtime.js';

const topLink = document.getElementById('top-link');
const mount = topLink?.querySelector('[data-top-link-lottie]');

if (topLink && mount) {
  const touchQuery = window.matchMedia('(hover: none), (pointer: coarse)');
  const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  let player;
  let animation;
  let isReady = false;
  let isLoading = false;
  let lastVisible = null;
  let posterFrame;
  let source;
  let variant;

  const selectVariant = () => {
    variant = touchQuery.matches ? 'swipe' : 'scroll';
    source = variant === 'swipe' ? mount.dataset.swipeSrc : mount.dataset.scrollSrc;
    posterFrame = variant === 'swipe' ? 36 : 67;
    topLink.dataset.lottieVariant = variant;
  };

  selectVariant();

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

    if (!document.hidden && !topLink.classList.contains('hidden')) {
      window.requestAnimationFrame(play);
    }
  };

  const handleLoadError = () => {
    isLoading = false;
    isReady = false;
    player?.remove();
    player = undefined;
    animation = undefined;
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

    try {
      await loadDotLottie();

      if (reduceMotionQuery.matches) {
        isLoading = false;
        showFallback();
        return;
      }

      if (!player) {
        player = document.createElement('dotlottie-wc');
        player.className = 'top-link-lottie__player';
        player.toggleAttribute('loop', true);
        player.setAttribute('src', source);
        mount.append(player);
        animation = player.dotLottie;

        if (!animation) {
          handleLoadError();
          return;
        }

        animation.addEventListener('loadError', handleLoadError, { once: true });
        if (animation.isLoaded) {
          handleLoad();
        } else {
          animation.addEventListener('load', handleLoad, { once: true });
        }
      } else if (animation?.isLoaded) {
        handleLoad();
      }
    } catch {
      isLoading = false;
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
