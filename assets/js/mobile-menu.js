document.addEventListener('DOMContentLoaded', function () {
  const toggle = document.getElementById('mobile-menu-toggle');
  const menu = document.getElementById('menu');
  const mobileMenuQuery = window.matchMedia('(max-width: 800px)');

  if (!toggle || !menu) return;

  function closeMenu() {
    menu.classList.remove('show');
    document.body.classList.remove('menu-open');
    document.body.style.overflow = '';
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', function (event) {
    event.stopPropagation();
    const isOpen = menu.classList.toggle('show');
    document.body.classList.toggle('menu-open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  document.addEventListener('click', function (event) {
    if (!menu.contains(event.target) && event.target !== toggle) closeMenu();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeMenu();
  });

  mobileMenuQuery.addEventListener('change', function (event) {
    if (!event.matches) closeMenu();
  });
});
