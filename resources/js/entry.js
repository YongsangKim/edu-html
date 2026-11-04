const Entry = (() => {
  const mainEl = () => document.getElementById('enMain');

  function toMain(e) {
    const r = mainEl().getBoundingClientRect();
    const s = r.width / 1920;
    return [(e.clientX - r.left) / s, (e.clientY - r.top) / s];
  }

  function rectMain(el) {
    const r = mainEl().getBoundingClientRect();
    const s = r.width / 1920;
    const b = el.getBoundingClientRect();
    return { l: (b.left - r.left) / s, t: (b.top - r.top) / s, w: b.width / s, h: b.height / s };
  }

  function inside(el, x, y) {
    const b = rectMain(el);
    return x >= b.l && x <= b.l + b.w && y >= b.t && y <= b.t + b.h;
  }

  function trackDrag(onMove, onEnd, onCancel) {
    const stop = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', cancel);
    };
    const move = (ev) => { if (onMove) onMove(ev); };
    const up = (ev) => { stop(); if (onEnd) onEnd(ev); };
    const cancel = (ev) => { stop(); if (onCancel) onCancel(ev); };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', cancel);
    return stop;
  }

  function trashZone(pal, trash, el) {
    const over = () => {
      const a = el.getBoundingClientRect(), b = trash.getBoundingClientRect();
      return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
    };
    return {
      begin() { pal.classList.add('is-glow'); },
      move() { trash.classList.toggle('is-over', over()); },
      hit(x, y) { return over() || inside(pal, x, y); },
      end() { pal.classList.remove('is-glow'); trash.classList.remove('is-over'); }
    };
  }

  function trashHint(pal, trash, on) {
    pal.classList.toggle('is-hint', on);
    trash.classList.toggle('is-hint', on);
  }

  function hinter(pick) {
    let t;
    return function () {
      clearTimeout(t);
      t = setTimeout(() => {
        const r = pick();
        if (r && r[0]) pointFingerAt(r[0], { onMain: true, x: r[1] }); else clearFingers();
      }, 300);
    };
  }

  return { toMain, rectMain, inside, trackDrag, trashZone, trashHint, hinter };
})();
