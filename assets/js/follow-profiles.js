document.addEventListener('DOMContentLoaded', function () {
  const items = document.querySelectorAll('.follow-profile');
  const mobileQuery = window.matchMedia('(max-width: 640px)');

  function closeItem(item) {
    item.classList.remove('is-open');
    const trigger = item.querySelector('.follow-profile-trigger');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  }

  function closeAll() {
    items.forEach(closeItem);
  }

  items.forEach((item) => {
    const trigger = item.querySelector('.follow-profile-trigger');
    if (!trigger) return;

    trigger.addEventListener('click', function (event) {
      if (!mobileQuery.matches) return;
      event.preventDefault();
      const isOpen = item.classList.contains('is-open');

      closeAll();

      if (!isOpen) {
        item.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      } else {
        trigger.blur();
      }
    });

    trigger.addEventListener('focus', function () {
      if (!mobileQuery.matches) trigger.setAttribute('aria-expanded', 'true');
    });

    trigger.addEventListener('blur', function () {
      if (!mobileQuery.matches) trigger.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('click', function (event) {
    items.forEach((item) => {
      if (item.contains(event.target)) return;
      closeItem(item);
    });
  });

  mobileQuery.addEventListener('change', function () {
    closeAll();
    const active = document.activeElement;
    if (active && active.classList.contains('follow-profile-trigger')) active.blur();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    closeAll();
    const active = document.activeElement;
    if (active && active.classList.contains('follow-profile-trigger')) active.blur();
  });
});
