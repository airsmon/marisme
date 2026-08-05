(() => {
  const gate = document.querySelector('[data-external-link-gate]');
  if (!gate) return;

  const title = gate.querySelector('[data-external-link-title]');
  const intro = gate.querySelector('[data-external-link-intro]');
  const protocol = gate.querySelector('[data-external-link-protocol]');
  const host = gate.querySelector('[data-external-link-host]');
  const url = gate.querySelector('[data-external-link-url]');
  const status = gate.querySelector('[data-external-link-status]');
  const backLink = gate.querySelector('[data-external-link-back]');
  const backLabel = gate.querySelector('[data-external-link-back-label]');
  const continueLink = gate.querySelector('[data-external-link-continue]');
  const searchParams = new URLSearchParams(window.location.search);

  gate.dataset.gateVersion = searchParams.get('variant') === 'v1' ? 'v1' : 'v2';

  const setInvalid = (message) => {
    gate.dataset.state = 'invalid';
    gate.dataset.gateVersion = 'v1';
    title.textContent = '无法打开此链接';
    intro.textContent = '目标地址缺失、格式不正确，或不是允许访问的外部网页。';
    protocol.textContent = '无效';
    host.textContent = '链接不可用';
    url.textContent = '仅支持安全校验后的 HTTP(S) 地址';
    status.textContent = message;
    continueLink.hidden = true;
    continueLink.removeAttribute('href');
  };

  try {
    const referrer = new URL(document.referrer);
    if (referrer.origin === window.location.origin && referrer.pathname !== window.location.pathname) {
      backLink.href = referrer.href;
      backLabel.textContent = '返回原文';

      if (window.history.length > 1) {
        backLink.addEventListener('click', (event) => {
          if (
            event.defaultPrevented ||
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey
          ) {
            return;
          }

          event.preventDefault();
          window.history.back();
        });
      }
    }
  } catch {
    backLink.href = gate.dataset.homeUrl || '/';
  }

  const rawTarget = searchParams.get('url');
  if (!rawTarget || rawTarget.length > 4096) {
    setInvalid('未找到可供确认的目标地址。');
    return;
  }

  let target;
  try {
    target = new URL(rawTarget, window.location.href);
  } catch {
    setInvalid('目标地址无法解析，请返回原文后重试。');
    return;
  }

  const isWebProtocol = target.protocol === 'https:' || target.protocol === 'http:';
  const hasCredentials = Boolean(target.username || target.password);
  const siteHost = (gate.dataset.siteHost || window.location.hostname).toLowerCase();
  const isExternal = target.hostname.toLowerCase() !== siteHost;

  if (!isWebProtocol || hasCredentials || !isExternal || !target.hostname) {
    setInvalid('该地址未通过外部链接安全检查。');
    return;
  }

  const isHTTPS = target.protocol === 'https:';
  gate.dataset.state = 'ready';
  gate.dataset.protocol = isHTTPS ? 'https' : 'http';
  protocol.textContent = isHTTPS ? 'HTTPS' : 'HTTP';
  host.textContent = target.host;
  url.textContent = target.href;
  status.textContent = isHTTPS
    ? '目标使用加密连接；仍请确认域名与你预期一致。'
    : '目标未使用 HTTPS，传输内容可能不会被加密。';
  continueLink.href = target.href;
  continueLink.hidden = false;
  gate.dispatchEvent(new CustomEvent('external-link-gate:ready'));
})();
