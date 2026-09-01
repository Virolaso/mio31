// ============================================================
// 00-bootstrap.js — helpers globales mínimos que antes vivían
// como <script> inline en index.html.
//
// BUGFIX (CSP): el servidor sirve con
// "Content-Security-Policy: script-src 'self' https://cdnjs.cloudflare.com",
// que bloquea cualquier <script> inline sin nonce/hash. Los dos bloques
// inline que tenía index.html (el helper API() y el fix de zoom táctil en
// mobile) se movieron acá — 'self' sí permite archivos .js servidos por el
// mismo origen.
// ============================================================

// API URL — delega siempre en el cliente API canónico.
const API = () => {
  if (typeof window.LGMDM?.api?.apiBase === 'function') {
    return window.LGMDM.api.apiBase();
  }
  return 'https://masteringstudio-api.duckdns.org';
};

// Touch helpers.
// S14 (audit): el handler anterior hacía `e.preventDefault()` en CUALQUIER
// `touchend` que ocurriera a menos de 300ms del anterior. Eso bloqueaba
// el pinch-zoom (WCAG 1.4.4 Resize text) para usuarios con baja visión.
// Ahora la lógica es inversa: el doble-tap para zoom sigue funcionando
// siempre; solo se ignora el segundo click sintético que algunos
// navegadores disparan en `<button>` (lo que producía doble-activación).
(function () {
  // Evita que un toque rápido sobre un botón se registre dos veces
  // (algunos browsers emiten 'click' además de 'touchend' + 'click').
  // 350ms cubre la ventana del iOS WebKit para double-tap-to-zoom.
  let lastClickAt = 0;
  const DEDUP_MS = 350;
  document.addEventListener(
    'click',
    (e) => {
      const now = Date.now();
      if (now - lastClickAt < DEDUP_MS) {
        e.stopPropagation();
        return;
      }
      lastClickAt = now;
    },
    true, // capture: filtramos antes que los listeners de los módulos.
  );

  // Reajustar el viewport al rotar el dispositivo.
  window.addEventListener('orientationchange', () => {
    setTimeout(() => { window.scrollTo(0, 0); }, 100);
  });
})();
