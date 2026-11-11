// Snake animation over the activity heatmap on the about page.
// Progressive enhancement: the grid stays static without JS or with reduced motion.
(() => {
  const panel = document.querySelector('.about-activity .activity-panel');
  const grid = panel?.querySelector('.activity-panel__grid');
  if (!grid) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const cells = [...grid.querySelectorAll('.activity-panel__cell')];
  const ROWS = 7;
  const COLS = Math.ceil(cells.length / ROWS);
  const STEP_MS = 85;
  const START_LENGTH = 4;
  const MAX_LENGTH = 9;
  const scroller = panel.querySelector('.activity-panel__scroll');

  let snake = [];
  let length = START_LENGTH;
  let food = new Set();
  let timer = 0;
  let running = false;
  let exiting = false;

  const neighbors = (index) => {
    const col = Math.floor(index / ROWS);
    const row = index % ROWS;
    const result = [];
    if (col + 1 < COLS && index + ROWS < cells.length) result.push(index + ROWS);
    if (row + 1 < ROWS && index + 1 < cells.length) result.push(index + 1);
    if (row > 0) result.push(index - 1);
    if (col > 0) result.push(index - ROWS);
    return result;
  };

  // Breadth-first search to the nearest uneaten cell; returns the first step to take.
  const nextStep = (head) => {
    const blocked = new Set(snake);
    const previous = new Map([[head, -1]]);
    const queue = [head];

    for (let i = 0; i < queue.length; i += 1) {
      const current = queue[i];
      if (food.has(current)) {
        let step = current;
        while (previous.get(step) !== head) step = previous.get(step);
        return step;
      }
      for (const next of neighbors(current)) {
        if (previous.has(next) || blocked.has(next)) continue;
        previous.set(next, current);
        queue.push(next);
      }
    }
    return -1;
  };

  const paint = () => {
    cells.forEach((cell) => cell.classList.remove('is-snake', 'is-snake-head'));
    snake.forEach((index, position) => {
      cells[index].classList.add('is-snake');
      if (position === 0) cells[index].classList.add('is-snake-head');
    });
  };

  const followHead = (head) => {
    if (!scroller || scroller.scrollWidth <= scroller.clientWidth) return;
    scroller.scrollLeft = cells[head].offsetLeft - scroller.clientWidth / 2;
  };

  const finish = () => {
    running = false;
    window.clearTimeout(timer);
    snake = [];
    paint();
    cells.forEach((cell) => cell.classList.remove('is-eaten'));
    replay.hidden = false;
  };

  const tick = () => {
    if (!running) return;
    if (document.hidden) {
      timer = window.setTimeout(tick, 400);
      return;
    }

    // Once everything is eaten, head for the last column and leave.
    if (!food.size && !exiting) {
      exiting = true;
      for (let index = (COLS - 1) * ROWS; index < cells.length; index += 1) food.add(index);
    }

    const step = nextStep(snake[0]);
    if (step < 0 || (exiting && food.has(step))) {
      finish();
      return;
    }

    snake.unshift(step);
    if (food.delete(step)) {
      cells[step].classList.add('is-eaten');
      length = Math.min(MAX_LENGTH, length + 1);
    }
    while (snake.length > length) snake.pop();

    paint();
    followHead(step);
    timer = window.setTimeout(tick, STEP_MS);
  };

  const start = () => {
    if (running || reduceMotion.matches) return;

    food = new Set();
    cells.forEach((cell, index) => {
      cell.classList.remove('is-eaten');
      if (cell.dataset.level !== '0' && !cell.classList.contains('is-future')) food.add(index);
    });
    if (!food.size) return;

    running = true;
    exiting = false;
    replay.hidden = true;
    length = START_LENGTH;
    snake = [Math.floor(ROWS / 2)];
    paint();
    timer = window.setTimeout(tick, STEP_MS);
  };

  const replay = document.createElement('button');
  replay.type = 'button';
  replay.className = 'about-activity__replay';
  replay.textContent = '再放一次贪吃蛇';
  replay.hidden = true;
  replay.addEventListener('click', start);
  panel.append(replay);

  reduceMotion.addEventListener('change', () => {
    if (reduceMotion.matches && running) finish();
    replay.hidden = reduceMotion.matches || running;
  });

  if (reduceMotion.matches) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      window.setTimeout(start, 600);
    }, { threshold: 0.6 });
    observer.observe(grid);
  } else {
    start();
  }
})();
