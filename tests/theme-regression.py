"""Browser regression checks after `hugo -d <public>`.

Requires Python Playwright and Chromium (or --browser /path/to/chrome).
Serve <public> locally, then run:
  python3 tests/theme-regression.py --public <public> --url http://127.0.0.1:8765
"""
import argparse
import base64
import hashlib
from html.parser import HTMLParser
from pathlib import Path
import re
from urllib.parse import unquote, urlparse
from playwright.sync_api import sync_playwright, expect

parser = argparse.ArgumentParser()
parser.add_argument('--public', type=Path, required=True)
parser.add_argument('--url', default='http://127.0.0.1:8765')
parser.add_argument('--browser')
parser.add_argument('--screenshots', type=Path)
args = parser.parse_args()

class Assets(HTMLParser):
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'integrity' not in attrs:
            return
        url = attrs.get('src') or attrs.get('href')
        path = args.public / unquote(urlparse(url).path).lstrip('/')
        assert path.is_file(), f'Missing asset: {url}'
        algorithm, digest = attrs['integrity'].split('-', 1)
        actual = base64.b64encode(hashlib.new(algorithm, path.read_bytes()).digest()).decode()
        assert actual == digest, f'Invalid integrity: {url}'

pages = {str(p.relative_to(args.public)): p.read_text() for p in args.public.rglob('*.html')}
for html in pages.values():
    Assets().feed(html)
article = next(path for path, html in pages.items()
               if 'class=highlight' in html and re.search(r'class=["\']?mermaid', html))
article_url = '/' + article.removesuffix('index.html')
page_styles = {
    '/': [],
    '/tags/': ['02-tags-page'],
    '/leisure/': ['18-leisure-shelf', '19-leisure-filter'],
    '/about/': ['30-about'],
    '/404.html': ['22-404'],
    '/go/': ['26-external-link-gate'],
    '/search/': [],
    '/archives/': [],
    article_url: [],
}

# A controllable Mermaid implementation tests overlapping work and recovery.
mermaid_stub = '''
window.mermaidTest = {active: 0, maximum: 0, themes: [], fail: false};
let theme;
export default {
 initialize(config) { theme = config.theme; },
 async run({nodes}) {
  const state = window.mermaidTest;
  const currentTheme = theme;
  state.maximum = Math.max(state.maximum, ++state.active);
  state.themes.push(currentTheme);
  try {
   await new Promise(resolve => setTimeout(resolve, 120));
   if (state.fail) throw new Error('simulated parse error');
   nodes.forEach(node => {
    node.dataset.processed = 'true';
    node.innerHTML = `<svg data-theme="${currentTheme}"></svg>`;
   });
  } finally { state.active--; }
 }
};
'''

with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, **({'executable_path': args.browser} if args.browser else {}))
    context = browser.new_context(reduced_motion='reduce')
    context.route('https://cloud.umami.is/**', lambda route: route.fulfill(body=''))
    context.route('https://cdn.jsdelivr.net/npm/mermaid@*/**', lambda route: route.fulfill(body=mermaid_stub, content_type='text/javascript'))
    page = context.new_page()
    errors = []
    missing = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.on('response', lambda response: missing.append(response.url) if response.status >= 400 and response.url.startswith(args.url) else None)
    for width in [1440, 390]:
        page.set_viewport_size({'width': width, 'height': 900})
        for path, names in page_styles.items():
            page.goto(args.url + path)
            page.wait_for_load_state('networkidle')
            urls = page.locator('link[rel="stylesheet"]').evaluate_all('(links) => links.map(link => link.href)')
            actual = [url for url in urls if '/css/pages/' in url]
            assert len(actual) == len(names), (path, actual)
            assert all(any(name in url for url in actual) for name in names), (path, actual)
            assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth + 1'), f'Horizontal overflow: {path} at {width}'
            # Both color schemes must retain their page-specific styles.
            page.locator('#theme-toggle').click()
            assert page.locator('html').get_attribute('data-theme') in ('light', 'dark')
            if args.screenshots and path in ('/tags/', '/leisure/', '/about/', article_url):
                args.screenshots.mkdir(parents=True, exist_ok=True)
                page.screenshot(path=str(args.screenshots / f'{width}-{path.strip("/").replace("/", "-")}.png'))

    print('PASS: desktop/mobile page styles and layouts', flush=True)
    page.goto(args.url + article_url)
    page.wait_for_load_state('networkidle')
    assert page.locator('[data-reading-progress]').count() == 1
    assert page.locator('.post-license').count() == 1
    assert page.locator('.follow-profiles').count() == 1
    button = page.locator('.highlight .copy-code').first
    button.locator('..').hover()
    page.evaluate('''() => Object.defineProperty(navigator, 'clipboard', {configurable: true, value: {
      writeText: text => new Promise(resolve => { window.copiedText = text; window.resolveCopy = resolve; })
    }})''')
    button.click()
    expect(button).to_be_disabled()
    expect(button).not_to_have_text('已复制！')
    page.evaluate('window.resolveCopy()')
    expect(button).to_have_text('已复制！')
    expect(button).to_be_enabled()
    assert page.evaluate('window.copiedText.length > 0')
    page.evaluate("() => { navigator.clipboard.writeText = () => Promise.reject(new Error('denied')); }")
    button.click()
    expect(button).to_have_text('复制失败，请重试')
    expect(button).to_be_enabled()
    for success in [False, True]:
        page.evaluate('''success => {
          Object.defineProperty(navigator, 'clipboard', {configurable: true, value: undefined});
          document.execCommand = () => success;
        }''', success)
        button.click()
        expect(button).to_have_text('已复制！' if success else '复制失败，请重试')
        assert page.evaluate('getSelection().rangeCount') == 0

    print('PASS: clipboard success, rejection and legacy fallback', flush=True)
    page.evaluate("document.documentElement.dataset.theme = 'light'")
    page.wait_for_timeout(300)
    page.evaluate("document.documentElement.dataset.theme = 'dark'")
    page.wait_for_function('window.mermaidTest.active === 1')
    page.evaluate("document.documentElement.dataset.theme = 'light'")
    page.wait_for_timeout(20)
    page.evaluate("document.documentElement.dataset.theme = 'dark'")
    page.wait_for_function("window.mermaidTest.active === 0 && [...document.querySelectorAll('.mermaid svg')].every(svg => svg.dataset.theme === 'dark')")
    assert page.evaluate('window.mermaidTest.maximum') == 1
    page.evaluate("window.mermaidTest.fail = true; document.documentElement.dataset.theme = 'light'")
    page.wait_for_function("window.mermaidTest.active === 0 && !document.querySelector('.mermaid svg')")
    assert page.locator('.mermaid').first.inner_text().strip()
    page.evaluate("window.mermaidTest.fail = false; document.documentElement.dataset.theme = 'dark'")
    page.wait_for_function("window.mermaidTest.active === 0 && !!document.querySelector('.mermaid svg')")

    # Module URLs must share the same fingerprinted runtime, and its vendor paths must resolve.
    page.goto(args.url + '/')
    runtime = next((args.public / 'js').glob('lottie-runtime.min.*.js'))
    result = page.evaluate('''async url => {
      const runtime = await import(url);
      await Promise.race([runtime.loadDotLottie(), new Promise((_, reject) => setTimeout(() => reject(new Error("Lottie load timeout")), 10000))]);
      return !!customElements.get('dotlottie-wc');
    }''', '/js/' + runtime.name)
    assert result
    assert not errors, errors
    assert not missing, missing
    browser.close()
print(f'PASS: integrity across {len(pages)} HTML files; {len(page_styles)} routes at desktop/mobile sizes; copy success/rejection/fallback; Mermaid serialization/recovery; Lottie runtime.')
