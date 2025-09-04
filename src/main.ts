import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Capture fatal errors early and prevent Vite's overlay from crashing when
// it tries to render malformed error payloads (reading 'frame' of undefined).
// This handler only suppresses the specific overlay-causing error message so
// other errors still surface to dev tooling.
if (typeof window !== 'undefined' && window.addEventListener) {
  window.addEventListener(
    'error',
    (ev: ErrorEvent) => {
      try {
        const msg = ev?.error?.message || ev?.message || '';
        if (typeof msg === 'string' && msg.includes("reading 'frame'")) {
          // Prevent other handlers (Vite overlay) from processing this error
          ev.stopImmediatePropagation?.();
          ev.preventDefault?.();
          // Log simplified error for developer visibility
          // eslint-disable-next-line no-console
          console.warn('Suppressed dev-overlay frame-read error:', msg);
        }
      } catch (e) {
        // swallow
      }
    },
    true,
  );

  window.addEventListener(
    'unhandledrejection',
    (ev: PromiseRejectionEvent) => {
      try {
        const reason = ev?.reason as any;
        const msg = reason?.message || String(reason || '');
        if (typeof msg === 'string' && msg.includes("reading 'frame'")) {
          ev.stopImmediatePropagation?.();
          ev.preventDefault?.();
          // eslint-disable-next-line no-console
          console.warn('Suppressed dev-overlay frame-read unhandled rejection:', msg);
        }
      } catch (e) {
        // swallow
      }
    },
    true,
  );
}

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
