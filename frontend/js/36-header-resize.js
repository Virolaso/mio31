/* LGMDM — Header Resize
 * Deja que el usuario arrastre el borde inferior del header para
 * cambiar su alto a gusto. Mismo patrón que setupHandle() de
 * 35-console-shell.js (--cns-left-w/--cns-right-w), pero acá se
 * ajusta --lg-shell-header-h en :root, que es la misma variable
 * que ya usan .lg-app (fila del grid) y .lg-header (min/max-height)
 * — así ambas quedan siempre sincronizadas.
 */
(function () {
  'use strict';

  function byId(id) { return document.getElementById(id); }
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  const MIN_H = 40;
  const MAX_H = 140;

  function install() {
    const handle = byId('headerResizeHandle');
    const header = document.querySelector('.lg-header');
    if (!handle || !header) return;

    const root = document.documentElement;
    let dragging = false;
    let startY = 0;
    let startH = 0;

    function currentHeight() {
      const val = getComputedStyle(root).getPropertyValue('--lg-shell-header-h').trim();
      const px = parseFloat(val);
      if (!isNaN(px)) return px;
      return header.getBoundingClientRect().height;
    }

    function onMove(e) {
      if (!dragging) return;
      const y = e.touches ? e.touches[0].clientY : e.clientY;
      const dy = y - startY;
      const next = clamp(startH + dy, MIN_H, MAX_H);
      root.style.setProperty('--lg-shell-header-h', next + 'px');
    }
    function onUp() {
      dragging = false;
      handle.classList.remove('dragging');
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onUp);
      try { LGMDM.storage.set('lgmdm.headerHeight', getComputedStyle(root).getPropertyValue('--lg-shell-header-h').trim()); } catch (_) {}
    }
    function onDown(e) {
      dragging = true;
      handle.classList.add('dragging');
      startY = e.touches ? e.touches[0].clientY : e.clientY;
      startH = currentHeight();
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend', onUp);
      e.preventDefault();
    }

    handle.addEventListener('mousedown', onDown);
    handle.addEventListener('touchstart', onDown, { passive: false });

    // Restaurar el último alto elegido por el usuario, si hay uno guardado.
    try {
      const saved = LGMDM.storage.get('lgmdm.headerHeight');
      if (saved) root.style.setProperty('--lg-shell-header-h', saved);
    } catch (_) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();
