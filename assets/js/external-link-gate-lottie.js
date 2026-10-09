import { loadDotLottie } from './lottie-runtime.js';

const gate = document.querySelector('[data-external-link-gate]');
const visual = gate?.querySelector('[data-external-link-motion]');
const mount = visual?.querySelector('[data-external-link-motion-mount]');
const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const requestedV1 = new URLSearchParams(window.location.search).get('variant') === 'v1';

let player;
let animation;
let observer;
let isVisible = true;
let isLoading = false;

const removePlayer = () => {
  animation?.pause();
  player?.remove();
  player = undefined;
  animation = undefined;
  isLoading = false;
  visual?.classList.remove('is-ready');
};

const useV1 = () => {
  removePlayer();
  if (gate) {
    gate.dataset.gateVersion = 'v1';
    gate.dataset.motionState = 'disabled';
  }
};

const syncPlayback = () => {
  if (!animation || !visual?.classList.contains('is-ready')) return;

  if (document.hidden || !isVisible || reduceMotionQuery.matches) {
    animation.pause();
  } else {
    animation.play();
  }
};

const showAnimation = () => {
  if (!animation || reduceMotionQuery.matches || gate?.dataset.gateVersion !== 'v2') {
    useV1();
    return;
  }

  animation.setLayout?.({ fit: 'contain', align: [0.5, 0.5] });
  visual.classList.add('is-ready');
  gate.dataset.motionState = 'ready';
  syncPlayback();
};

const loadAnimation = async () => {
  if (
    !gate ||
    !visual ||
    !mount?.dataset.src ||
    gate.dataset.state !== 'ready' ||
    gate.dataset.gateVersion !== 'v2' ||
    requestedV1 ||
    reduceMotionQuery.matches ||
    navigator.connection?.saveData ||
    isLoading ||
    player
  ) {
    if (requestedV1 || reduceMotionQuery.matches || navigator.connection?.saveData) useV1();
    return;
  }

  isLoading = true;
  gate.dataset.motionState = 'loading';

  try {
    await loadDotLottie();
    if (reduceMotionQuery.matches || gate.dataset.gateVersion !== 'v2') {
      useV1();
      return;
    }

    player = document.createElement('dotlottie-wc');
    player.className = 'external-link-gate__motion-player';
    player.toggleAttribute('loop', true);
    player.setAttribute('src', mount.dataset.src);
    mount.append(player);
    animation = player.dotLottie;

    if (!animation) throw new Error('dotLottie gate player was not initialized');

    animation.setLoop?.(true);
    animation.addEventListener('loadError', useV1, { once: true });

    if (animation.isLoaded) {
      showAnimation();
    } else {
      animation.addEventListener('load', showAnimation, { once: true });
    }
  } catch {
    useV1();
  }
};

if (gate && visual && mount) {
  observer = new IntersectionObserver(([entry]) => {
    isVisible = entry.isIntersecting;
    syncPlayback();
  }, { threshold: 0.15 });
  observer.observe(visual);

  gate.addEventListener('external-link-gate:ready', loadAnimation, { once: true });
  if (gate.dataset.state === 'ready') loadAnimation();

  reduceMotionQuery.addEventListener('change', (event) => {
    if (event.matches) {
      useV1();
      return;
    }

    if (!requestedV1 && !navigator.connection?.saveData) {
      gate.dataset.gateVersion = 'v2';
      loadAnimation();
    }
  });

  document.addEventListener('visibilitychange', syncPlayback);
}
