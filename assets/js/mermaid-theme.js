import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11.15.0/dist/mermaid.esm.min.mjs';

const root = document.documentElement;
const elements = Array.from(document.querySelectorAll('.mermaid'));
const sources = elements.map((element) => element.textContent.trim());
let rendering = false;
let pending = false;

async function render() {
  pending = true;
  if (rendering) return;
  rendering = true;

  try {
    while (pending) {
      pending = false;
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'loose',
        theme: root.dataset.theme === 'dark' ? 'dark' : 'default',
      });
      elements.forEach((element, index) => {
        element.textContent = sources[index];
        element.removeAttribute('data-processed');
      });
      try {
        await mermaid.run({ nodes: elements });
      } catch (error) {
        // Keep the original diagram readable and allow the next theme change to retry.
        elements.forEach((element, index) => {
          element.textContent = sources[index];
          element.removeAttribute('data-processed');
        });
        console.error('Mermaid rendering failed:', error);
      }
    }
  } finally {
    rendering = false;
  }
}

if (elements.length) {
  new MutationObserver(render).observe(root, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });
  render();
}
