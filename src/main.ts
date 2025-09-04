import { bootstrapApplication } from "@angular/platform-browser";
import { appConfig } from "./app/app.config";
import { App } from "./app/app";

// Capture fatal errors early and prevent Vite's overlay from crashing when
// it tries to render malformed error payloads (reading 'frame' of undefined).
// This handler only suppresses the specific overlay-causing error message so
// other errors still surface to dev tooling.
if (typeof window !== "undefined" && window.addEventListener) {
  const isViteOverlayError = (ev: ErrorEvent | null, reason?: any) => {
    try {
      const filename = (ev as any)?.filename || "";
      const msg =
        ev?.error?.message || ev?.message || (reason && reason.message) || "";
      const stack = ev?.error?.stack || (reason && reason.stack) || "";

      const fromViteClient =
        filename.includes("@vite/client") ||
        stack.includes("@vite/client") ||
        stack.includes("/vite/client");
      const overlayMention =
        String(msg).toLowerCase().includes("overlay") ||
        String(msg).toLowerCase().includes("erroroverlay");
      const frameRead =
        String(msg).toLowerCase().includes("reading 'frame'") ||
        String(msg).toLowerCase().includes("frame");

      return (
        (fromViteClient && frameRead) ||
        (fromViteClient && overlayMention) ||
        (frameRead && stack.includes("ErrorOverlay"))
      );
    } catch (e) {
      return false;
    }
  };

  window.addEventListener(
    "error",
    (ev: ErrorEvent) => {
      try {
        if (isViteOverlayError(ev)) {
          ev.stopImmediatePropagation?.();
          ev.preventDefault?.();
          // eslint-disable-next-line no-console
          console.warn(
            "Suppressed dev-overlay related error:",
            ev?.message || ev?.error?.message,
          );
        }
      } catch (e) {
        // swallow
      }
    },
    true,
  );

  window.addEventListener(
    "unhandledrejection",
    (ev: PromiseRejectionEvent) => {
      try {
        if (isViteOverlayError(null, ev?.reason)) {
          ev.stopImmediatePropagation?.();
          ev.preventDefault?.();
          // eslint-disable-next-line no-console
          console.warn(
            "Suppressed dev-overlay related unhandled rejection:",
            ev?.reason,
          );
        }
      } catch (e) {
        // swallow
      }
    },
    true,
  );
}

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
