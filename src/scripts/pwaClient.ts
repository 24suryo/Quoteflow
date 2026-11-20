export function initPwaClient(locale: 'en' | 'id' = 'en'): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  const isSecureContext =
    window.location.protocol === 'https:' ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

  if (!isSecureContext) return;

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });

      const showUpdateBanner = (worker: ServiceWorker) => {
        if (document.getElementById('qf-pwa-update-banner')) return;

        const banner = document.createElement('div');
        banner.id = 'qf-pwa-update-banner';
        banner.setAttribute('role', 'status');
        banner.style.cssText = [
          'position:fixed',
          'bottom:1rem',
          'right:1rem',
          'z-index:80',
          'display:flex',
          'align-items:center',
          'gap:0.75rem',
          'background:#292820',
          'color:#F3EFE6',
          'border:1px solid #B69A75',
          'border-radius:12px',
          'padding:0.75rem 1rem',
          'box-shadow:0 10px 28px rgba(41,40,32,0.22)',
          'font-size:0.88rem',
        ].join(';');

        const msg = document.createElement('span');
        msg.textContent =
          locale === 'id'
            ? 'Pembaruan QuoteFlow tersedia.'
            : 'A new version of QuoteFlow is ready.';

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = locale === 'id' ? 'Muat Ulang' : 'Update';
        btn.style.cssText = [
          'background:#B69A75',
          'color:#292820',
          'font-weight:600',
          'padding:0.35rem 0.75rem',
          'border-radius:8px',
          'cursor:pointer',
          'border:none',
        ].join(';');

        btn.addEventListener('click', () => {
          worker.postMessage({ type: 'SKIP_WAITING' });
        });

        banner.appendChild(msg);
        banner.appendChild(btn);
        document.body.appendChild(banner);
      };

      if (registration.waiting) {
        showUpdateBanner(registration.waiting);
      }

      registration.addEventListener('updatefound', () => {
        const installing = registration.installing;
        if (!installing) return;
        installing.addEventListener('statechange', () => {
          if (installing.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdateBanner(installing);
          }
        });
      });

      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });
    } catch {
      // Service worker registration failed silently in restricted environments
    }
  });
}