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

  const tab = (x, y, dir) => dir > 0 ? ` L${x + 12},${y + 14} H${x - 12} L${x - 16},${y}` : ` L${x - 12},${y + 14} H${x + 12} L${x + 16},${y}`;
  const top = (W) => { const cx = W / 2; return `M0,0 H${cx - 16} L${cx - 12},14 H${cx + 12} L${cx + 16},0 H${W}`; };
  const path = {
    cpath(W, H) {
      const hh = 74, aw = 30, fh = 30, cx = W / 2, ci = aw + (W - aw) / 2, yF = hh + H, yB = yF + fh;
      return top(W) + ` V${hh} H${ci + 16}` + tab(ci, hh, 1) + ` H${aw} V${yF} H${ci - 16}` + tab(ci, yF, -1) + ` H${W} V${yB} H${cx + 16}` + tab(cx, yB, 1) + ' H0 Z';
    },
    ipath(W, H1, H2) {
      const hh = 74, mh = 56, aw = 30, fh = 30, cx = W / 2, ci = aw + (W - aw) / 2, yA = hh + H1, yM = yA + mh, yB = yM + H2, yE = yB + fh;
      return top(W) + ` V${hh} H${ci + 16}` + tab(ci, hh, 1) + ` H${aw} V${yA} H${ci - 16}` + tab(ci, yA, -1) + ` H${W} V${yM} H${ci + 16}` + tab(ci, yM, 1)
        + ` H${aw} V${yB} H${ci - 16}` + tab(ci, yB, -1) + ` H${W} V${yE} H${cx + 16}` + tab(cx, yE, 1) + ' H0 Z';
    },
    spath(W, start) {
      const cx = W / 2;
      return 'M0,0 ' + (start ? `H${W}` : `H${cx - 16} L${cx - 12},14 H${cx + 12} L${cx + 16},0 H${W}`) + ` V74 H${cx + 16} L${cx + 12},88 H${cx - 12} L${cx - 16},74 H0 Z`;
    },
    hexPts: (w, h) => `0,${h / 2} 14,0 ${w - 14},0 ${w},${h / 2} ${w - 14},${h} 14,${h}`
  };

  const STROKE = 'stroke="rgba(20,10,60,.38)" stroke-width="2.5" stroke-linejoin="round"';
  const cbox = (x, y, w, h, svg, lb) => '<div class="cb" style="left:' + x + 'px;top:' + y + 'px;width:' + w + 'px;height:' + h + 'px"><svg width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">' + svg + '</svg>' + (lb || '') + '</div>';
  const actBlock = (t, x, y, w) => cbox(x, y, w, 88, '<path d="' + path.spath(w) + '" fill="' + enColor('move') + '" ' + STROKE + '/>', t ? '<div class="lb" style="font-size:24px">' + t + '</div>' : '');
  const textW = (t, px) => { const g = document.createElement('canvas').getContext('2d'); g.font = '700 ' + px + 'px Pretendard, sans-serif'; return Math.max(...t.split('|').map((s) => g.measureText(s).width)); };
  const EMPTY_HEX = 'rgba(255,255,255,.55)';

  function ifBlock(r, o, x, y, w) {
    o = o || {};
    x = x || 0; y = y || 0; w = w || o.w || 560;
    const end = o.end || '이라면';
    const H1 = 74;
    const sub = (r.e === null || typeof r.e === 'string') ? null : ifBlock(r.e, o, x + 30, y + 74 + H1 + 56, w - 30);
    const H2 = sub ? sub.h - 14 : 74;
    const h = 74 + H1 + 56 + H2 + 30;
    const conds = Array.isArray(r.c) ? r.c : [r.c];
    let cx = 76, hexes = '';
    conds.forEach((c, i) => {
      if (i) {
        const ow = Math.ceil(textW('또는', 24)) + 8;
        hexes += cbox(x + cx, y, ow, 74, '', '<div class="lb" style="font-size:24px;left:8px">또는</div>');
        cx += ow + 8;
      }
      const hw = c ? Math.ceil(textW(c, 21)) + 46 : 130;
      hexes += cbox(x + cx, y + 15, hw, 44, '<polygon points="' + path.hexPts(hw, 44) + '" fill="' + (c ? enColor('judge') : EMPTY_HEX) + '" ' + STROKE + '/>', c ? '<div class="lb is-c" style="font-size:21px">' + c.replace('|', ' ') + '</div>' : '');
      cx += hw;
    });
    const lbs = '<div class="lb" style="font-size:24px">만약</div><div class="lb" style="font-size:24px;left:' + (cx + 8) + 'px">' + end + '</div><div class="lb" style="font-size:24px;top:' + (74 + H1) + 'px;height:56px">아니면</div>';
    let html = cbox(x, y, w, h + 14, '<path d="' + path.ipath(w, H1, H2) + '" fill="' + enColor('flow') + '" ' + STROKE + '/>', lbs);
    html += hexes;
    if (r.a !== null) html += actBlock(r.a, x + 30, y + 74, w - 30);
    html += sub ? sub.html : (r.e === null ? '' : actBlock(r.e, x + 30, y + 74 + H1 + 56, w - 30));
    return { html, h: h + 14 };
  }

  return { toMain, rectMain, inside, trackDrag, trashZone, trashHint, hinter, path, ifBlock };
})();
