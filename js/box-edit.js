/* ==========================================================
   좌표 수정 모드 (개발용) — 주소 뒤에 ?edit 을 붙여 열 때만 동작, 평소엔 아무 일도 안 함
   페이지가 가진 [x, y, 폭, 높이] 배열 좌표를 화면에서 눈으로 보며 옮기고 크기를 맞춘 뒤, 표시줄의 값을 그대로 코드에 붙여 넣는 용도
   (화면에 쓰는 %·변환값을 개발자 도구에서 고쳐도 원래 좌표로 되돌릴 수 없기 때문)
   조작: 박스 클릭 → 방향키 1px(Shift 10px) 이동, Alt+방향키 폭·높이 조절, 화면 왼쪽 위 [◀ 이전][다음 ▶] 버튼 또는 ] [ / PageDown PageUp 으로 단계 이동, ?edit&step=N 으로 N단계에서 시작
   사용법:
     <script src="../../js/box-edit.js"></script>
     1) 박스를 만들 때 BoxEdit.tag(el, box) — box 는 좌표 배열 그 자체(복사본 말고 코드에 있는 배열), el 에 data-box 가 붙어 편집 대상이 됨
     2) BoxEdit.init({
          apply: (el) => { el.style.cssText = ... },   // el._ref(=고친 좌표)로 el 의 위치·크기 스타일을 다시 입힘 (필수). 좌표가 2개뿐인 배열(위치 보정값 등)은 Alt+방향키가 무시됨
          unit: 0.1,                                    // 방향키 한 번에 움직이는 값(기본 1 — 좌표가 %면 0.1 처럼 작게). Shift 는 10배
          name: (el) => '문구',                         // 표시줄에서 좌표 앞에 붙일 이름 (선택)
          setup: () => { ... },                         // 수정 모드일 때만 한 번 — 뒤 단계를 바로 볼 수 있게 상태를 미리 채움 (선택)
          step: { count, get: () => 현재번호, set: (n) => 번호만 바꿈, go: (n) => 그 단계로 다시 그림, label: (n) => '문구' }  // 단계가 있는 페이지만 (선택)
        });
      init 은 단계 데이터가 준비된 뒤, 처음 그리기(render) 전에 부를 것
   표시줄: 고른 박스의 값을 코드에 그대로 붙여 넣을 모양으로 보여 줌 — 손가락(el._base 가 있는 것)은 표의 줄 모양 '이름: [dx, dy],'(이름은 el._fg 의 'FG.' 뒤 — 코드의 FG 표에서 같은 이름 줄과 바꿔 넣음), 클릭 영역(HOT)도 '이름: [dx, dy, dw, dh],', 그 밖의 [left, top, 폭, 높이] 박스는
   '#id { left:..px; top:..px; width:..px; height:..px; }'(선택자는 id → 첫 클래스 순, el._sel 로 직접 지정). 맞춘 값은 단계를 옮겨도(sessionStorage) 모여 있고,
   [복사] 현재 값 · [전체 복사] 모은 값 전부 · [지우기]. 값을 코드에 자동으로 쓰지는 못하므로 복사해서 붙여 넣을 것(o.format(el) 로 출력 모양을 바꿀 수 있음)
   ========================================================== */
(function () {
  const ON = /[?&]edit(=|&|$)/.test(location.search);
  const BoxEdit = { on: ON };

  BoxEdit.tag = function (el, box) {
    el._ref = box;
    el.dataset.box = box.join(',');
    return el;
  };

  const selOf = (el) => {
    if (el._sel) return el._sel;
    if (el.id) return '#' + el.id;
    const c = Array.from(el.classList).find((x) => !/^(is-|js-)/.test(x));
    return (el.tagName.toLowerCase()) + (c ? '.' + c : '');
  };
  const num = (v) => Math.round(v * 1000) / 1000;
  BoxEdit.line = function (el) {
    const r = el._ref;
    const arr = '[' + r.map(num).join(', ') + ']';
    /* 손가락(FG)·클릭 영역(HOT)은 표의 줄 모양('이름: [값],')으로 나옴 — 표의 같은 이름 줄과 바꿔 넣음 */
    if (el._hot) return el._hot + ': ' + arr + ',';
    if (el._base) return el._fg && /^FG./.test(el._fg) ? el._fg.slice(3) + ': ' + arr + ',' : (el._fg || 'FG.' + selOf(el)) + ' = ' + arr + ';';
    if (r.length === 4) return selOf(el) + ' { left:' + num(r[0]) + 'px; top:' + num(r[1]) + 'px; width:' + num(r[2]) + 'px; height:' + num(r[3]) + 'px; }';
    return selOf(el) + ' = [' + r.map(num).join(', ') + '];';
  };
  BoxEdit.keyOf = function (el) { return el._base ? (el._fg || el._name || selOf(el)) : selOf(el); };

  BoxEdit.init = function (o) {
    if (!ON) return;
    const STORE_KEY = 'boxedit:' + location.pathname;
    let saved = {};
    try { saved = JSON.parse(sessionStorage.getItem(STORE_KEY) || '{}'); } catch (e) { saved = {}; }
    const persist = () => { try { sessionStorage.setItem(STORE_KEY, JSON.stringify(saved)); } catch (e) {} };
    const fmt = (el) => (o.format ? o.format(el) : BoxEdit.line(el));
    const copyText = (s, done) => {
      const fallback = () => {
        const ta = document.createElement('textarea');
        ta.value = s; ta.style.cssText = 'position:fixed;left:-999px;top:0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        ta.remove(); done();
      };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(s).then(done, fallback);
      else fallback();
    };
    const UNIT = o.unit || 1;
    if (o.setup) o.setup();
    const style = document.createElement('style');
    style.textContent = '.is-box-edit [data-box]{outline:2px dashed #e5342f}.is-box-edit .js-point-finger[data-box]{animation:none !important}.is-box-edit [data-box].is-box-sel{outline:3px solid #2fbf71}.is-box-edit :not(.hit-pulse):not(.is-fg-target)>hit-pad{display:none !important}';
    document.head.appendChild(style);
    document.body.classList.add('is-box-edit');

    const bar = document.createElement('div');
    bar.style.cssText = 'position:fixed;left:10px;top:10px;z-index:9999;display:flex;align-items:center;gap:10px;padding:8px 14px;border-radius:8px;background:#111;color:#ff0;font:600 18px Pretendard,sans-serif';
    const txt = document.createElement('span');
    const mkBtn = (label, fn) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      b.style.cssText = 'padding:4px 12px;border:0;border-radius:6px;background:#ff0;color:#111;font:700 18px Pretendard,sans-serif;cursor:pointer';
      b.addEventListener('click', fn);
      return b;
    };
    const btn = (label, d) => mkBtn(label, () => move(d));
    if (o.step) bar.appendChild(btn('◀ 이전', -1));
    bar.appendChild(txt);
    if (o.step) bar.appendChild(btn('다음 ▶', 1));
    const cnt = document.createElement('span');
    cnt.style.cssText = 'color:#9f9;font-size:15px';
    const flash = (b, t) => { const o0 = b.textContent; b.textContent = t; setTimeout(() => { b.textContent = o0; }, 1200); };
    const copyOne = mkBtn('복사', () => { if (sel) copyText(fmt(sel), () => flash(copyOne, '복사됨')); });
    const copyAll = mkBtn('전체 복사', () => {
      const keys = Object.keys(saved);
      if (!keys.length) { flash(copyAll, '모은 값 없음'); return; }
      copyText('/* ' + location.pathname.split('/').slice(-2).join('/') + ' */' + String.fromCharCode(10) + keys.map((k) => saved[k]).join(String.fromCharCode(10)), () => flash(copyAll, '복사됨'));
    });
    const clearAll = mkBtn('지우기', () => { saved = {}; persist(); showCount(); });
    [cnt, copyOne, copyAll, clearAll].forEach((x) => bar.appendChild(x));
    document.body.appendChild(bar);
    const showCount = () => { cnt.textContent = '모은 값 ' + Object.keys(saved).length + '개'; };
    showCount();

    const stepText = (n) => (o.step.label ? o.step.label(n) : '단계 ' + n + ' / ' + (o.step.count - 1));
    if (o.step) {
      const m = location.search.match(/[?&]step=([0-9]+)/);
      if (m) o.step.set(Math.min(+m[1], o.step.count - 1));
    }

    let sel = null;
    const say = (s) => { txt.textContent = (o.step ? stepText(o.step.get()) + '  ' : '') + s; };
    const refresh = () => {
      o.apply(sel);
      sel.dataset.box = sel._ref.join(',');
      saved[BoxEdit.keyOf(sel)] = fmt(sel);
      persist();
      showCount();
      say(fmt(sel));
    };
    function move(d) {
      const n = o.step.get() + d;
      if (n < 0 || n >= o.step.count) return;
      if (sel) sel.classList.remove('is-box-sel');
      sel = null;
      o.step.go(n);
      say('박스를 클릭하세요');
    }
    say('박스를 클릭하세요 (방향키 이동, Shift 10px, Alt+방향키 크기' + (o.step ? ', ] / [ 또는 PageDown / PageUp 단계 이동' : '') + ')');

    document.addEventListener('click', (e) => {
      const t = e.target.closest('[data-box]');
      if (!t) return;
      e.stopPropagation();
      e.preventDefault();
      if (sel) sel.classList.remove('is-box-sel');
      sel = t;
      t.classList.add('is-box-sel');
      refresh();
    }, true);

    document.addEventListener('keydown', (e) => {
      if (o.step) {
        const dir = (e.code === 'BracketRight' || e.key === 'PageDown') ? 1 : (e.code === 'BracketLeft' || e.key === 'PageUp') ? -1 : 0;
        if (dir) { e.preventDefault(); move(dir); return; }
      }
      if (!sel || !sel.isConnected || e.key.indexOf('Arrow') !== 0) return;
      e.preventDefault();
      const U = sel._base ? 1 : UNIT;
      const d = e.shiftKey ? 10 * U : U;
      const k = e.altKey
        ? { ArrowLeft: [2, -d], ArrowRight: [2, d], ArrowUp: [3, -d], ArrowDown: [3, d] }
        : { ArrowLeft: [0, -d], ArrowRight: [0, d], ArrowUp: [1, -d], ArrowDown: [1, d] };
      if (e.ctrlKey && sel._hot) {
        if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
        while (sel._ref.length < 5) sel._ref.push(0);
        sel._ref[4] = Math.max(0, sel._ref[4] + (e.key === 'ArrowUp' ? d : -d));
        refresh();
        return;
      }
      if (k[e.key][0] >= sel._ref.length) return;
      sel._ref[k[e.key][0]] = Math.round((sel._ref[k[e.key][0]] + k[e.key][1]) * 1000) / 1000;
      refresh();
    });
  };

  /* 캐릭터 포즈 고르기 판(?edit 일 때 오른쪽 아래에 뜸). 눌러 보면 그 단계의 캐릭터가 바로 바뀌고, 표시된 '포즈이름' 을 STEPS 의 pose: 뒤 또는 say(문구, 포즈) 에 옮겨 적음(누르면 이름만(따옴표 없이) 클립보드에 복사)
     BoxEdit.posePicker({ say, bubble, img, step: () => 현재 단계 번호 })  — say 는 initGuideSay 가 돌려준 함수, bubble 은 말풍선 요소, img 는 캐릭터 <img>(그림 폴더를 여기서 알아냄)
     BoxEdit.syncStep(n)  — ?edit 일 때 주소의 step 번호를 n 으로 바꿔 둠(새로고침해도 그 단계에서 시작) */
  BoxEdit.syncStep = function (n) {
    if (!ON) return;
    const q = location.search;
    history.replaceState(null, '', /[?&]step=[0-9]+/.test(q) ? q.replace(/([?&])step=[0-9]+/, '$1step=' + n) : q + (q ? '&' : '?') + 'step=' + n);
  };

  /* 눌러야 하는 버튼(data-hit)의 클릭 영역을 버튼 모양은 그대로 두고 늘리거나 줄이거나 옮김. HOT = { 이름: [dx, dy, dw, dh] } — 버튼 기준 왼쪽·위로 dx·dy px 옮기고 폭·높이에 dw·dh px 더함(음수면 줄임).
     [0,0,0,0] 이면 아무것도 안 만듦(그 버튼 그대로). 다섯째 값 [dx, dy, dw, dh, 모서리px] 를 주면 클릭 영역·깜빡임 테두리의 모서리를 둥글게(생략·0 이면 버튼 모서리를 따름, ?edit 에서는 Ctrl+↑↓ 로 조정). 투명한 칸을 버튼 안에 넣어 두고 거기를 눌러도 버튼이 눌린 것으로 처리됨. ?edit 에서는 모든 칸을 만들어 클릭→방향키(Alt=폭·높이)로 맞추고 표시줄의 'HOT.이름 = [...]' 를 코드에 옮겨 적음
     BoxEdit.hitPad(hits, HOT)  — 화면이 그대로인 페이지: 한 번 부름(?edit 아닐 때도 동작). BoxEdit.padEl(요소, 이름, HOT) — 단계마다 화면을 새로 그리는 페이지: 그릴 때마다 */
  BoxEdit.padApply = function (el) {
    const r = el._ref;
    el.classList.toggle('is-hot', r.some((v) => v));
    /* 버튼에 테두리가 있어도 [0,0,0,0] 이면 테두리 바깥(버튼 전체)과 같게 맞춤 */
    const cs = getComputedStyle(el.parentNode);
    const bl = parseFloat(cs.borderLeftWidth) || 0, bt = parseFloat(cs.borderTopWidth) || 0;
    const bw = bl + (parseFloat(cs.borderRightWidth) || 0), bh = bt + (parseFloat(cs.borderBottomWidth) || 0);
    el.style.left = (r[0] - bl) + 'px';
    el.style.top = (r[1] - bt) + 'px';
    el.style.width = 'calc(100% + ' + (r[2] + bw) + 'px)';
    el.style.height = 'calc(100% + ' + (r[3] + bh) + 'px)';
    el.style.borderRadius = r[4] ? r[4] + 'px' : '';
  };
  BoxEdit.padEl = function (el, key, HOT) {
    const r = HOT[key];
    if (!el || !r || (!ON && !r.some((v) => v))) return;
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    Array.from(el.children).forEach((c) => { if (c.tagName === 'HIT-PAD' && c._hot === key) c.remove(); });
    const pad = document.createElement('hit-pad');
    pad.style.cssText = 'position:absolute;display:block;background:transparent;pointer-events:auto;z-index:2';
    pad._hot = key;
    pad._sel = 'HOT.' + key;
    BoxEdit.tag(pad, r);
    el.appendChild(pad);
    BoxEdit.padApply(pad);
  };
  /* 화면 전체를 단계마다 새로 그리는 페이지(innerHTML 로 통째로 바꿈)는 눌러야 할 요소를 그릴 때마다 BoxEdit.padEl(요소, 이름, HOT) 을 부름 */
  BoxEdit.hitPad = function (hits, HOT) {
    hits.forEach((h) => BoxEdit.padEl(h, h.dataset.hit, HOT));
  };

  /* 손가락 옵션 만들기: pointFingerAt(el, BoxEdit.fgo(FG, '이름', { pulse: true })) — FG[이름] 의 [dx, dy] 를 읽고(없으면 [0, 0]) 지금 이름을 기억함(fingerTag 를 인자 없이 부르면 이 이름이 표시줄에 나옴) */
  BoxEdit.fgo = function (FG, key, extra) {
    BoxEdit.fgKey = key;
    const f = FG[key] || [0, 0];
    return Object.assign({ onMain: true, dx: f[0], dy: f[1] }, extra);
  };

  /* 손가락 안내(pointFingerAt)를 ?edit 에서 눌러 방향키로 옮길 수 있게 함. keyFn() 은 지금 단계의 이름(예 'template') — 표시줄에 'FG.이름 = [dx, dy];' 로 나옴.
     페이지는 pointFingerAt 를 부를 때 dx·dy 를 FG[이름] 에서 읽어 넘기고, 표시줄 값을 코드의 FG 에 옮겨 적음. BoxEdit.init 보다 먼저 한 번 부를 것 */
  BoxEdit.fingerTag = function (keyFn) {
    if (!ON) return;
    BoxEdit._keyFn = keyFn || (() => BoxEdit.fgKey);
    if (BoxEdit._tagged) return;
    BoxEdit._tagged = true;
    /* 클릭 영역 박스(hit-pad)는 지금 눌러야 할 곳(깜빡임 .hit-pulse 이거나 손가락이 가리키는 곳 .is-fg-target)만 보임 */
    const origClear = window.clearFingers;
    window.clearFingers = function () {
      origClear();
      document.querySelectorAll('.is-fg-target').forEach((x) => x.classList.remove('is-fg-target'));
    };
    const orig = window.pointFingerAt;
    window.pointFingerAt = function (el, opts) {
      orig(el, opts);
      if (el && el.classList) {
        document.querySelectorAll('.is-fg-target').forEach((x) => x.classList.remove('is-fg-target'));
        el.classList.add('is-fg-target');
      }
      const fs = document.querySelectorAll('.js-point-finger');
      const fg = fs[fs.length - 1];
      if (!fg) return;
      const dx = (opts && opts.dx) || 0, dy = (opts && opts.dy) || 0;
      fg._base = [parseFloat(fg.style.left) - dx, parseFloat(fg.style.top) - dy];
      fg.style.pointerEvents = 'auto';
      fg._fg = 'FG.' + BoxEdit._keyFn();
      BoxEdit.tag(fg, [dx, dy]);
    };
  };

  BoxEdit.posePicker = function (o) {
    if (!ON) return;
    const POSES = o.poses || ['main', 'main_wave', 'wink_open', 'wink_point', 'wink_point2', 'wink_point3', 'wink_point4', 'wink_present', 'smile_present', 'point_front', 'wink_jump', 'happy_jump'];
    const srcAttr = o.img.getAttribute('src') || '';
    const pm = srcAttr.match(/(?:^|\/)(sa|gwa)_[^/]*$/);
    const pre = (pm ? pm[1] : 'sa') + '_';
    const dir = srcAttr.replace(/(sa|gwa)_[^/]*$/, '');
    const pp = document.createElement('div');
    pp.style.cssText = 'position:fixed;right:8px;bottom:8px;z-index:99999;display:flex;flex-direction:column;gap:4px;max-width:calc(100vw - 16px);padding:8px;border-radius:8px;background:rgba(0,0,0,.82);color:#fff;font:13px sans-serif';
    pp.innerHTML = '<div data-info>캐릭터 포즈 — 눌러서 바꾸기 (표시된 이름을 STEPS 의 pose: 뒤 또는 say(…, 포즈) 에 옮겨 적음)</div><div style="display:flex;flex-wrap:nowrap;gap:4px;overflow-x:auto">' +
      POSES.map((n) => '<button type="button" data-pose="' + n + '" style="flex:0 0 auto;width:70px;padding:2px;border:2px solid transparent;border-radius:6px;background:#fff;cursor:pointer;font-size:10px"><img src="' + dir + pre + n + '.png" alt="" style="display:block;width:100%;height:56px;object-fit:contain">' + n + '</button>').join('') + '</div>';
    pp.addEventListener('click', (e) => {
      const b = e.target.closest('[data-pose]');
      if (!b) return;
      o.say(o.bubble.innerHTML, b.dataset.pose);
      pp.querySelectorAll('[data-pose]').forEach((x) => { x.style.borderColor = x === b ? '#e8317f' : 'transparent'; });
      const t = b.dataset.pose;
      pp.querySelector('[data-info]').textContent = '단계 ' + o.step() + ' → ' + t + '  (복사됨)';
      try { navigator.clipboard.writeText(t); } catch (err) { /* 복사 못 해도 표시된 값을 직접 적으면 됨 */ }
    });
    document.body.appendChild(pp);
  };

  /* 단계형 실습 페이지의 ?edit 연결 한 번에 (_guide/steps.html) — 손가락(FG)·클릭 영역(HOT)·단계 이동·포즈판을 모두 묶음
     BoxEdit.stepEdit({
       key: () => 지금 단계의 눌러야 할 곳 이름(FG·HOT 의 키, 생략하면 BoxEdit.fgo 가 기억한 이름),  unit: 방향키 한 번의 값(기본 1, % 좌표면 0.1),
       apply/name: 손가락·클릭 영역 밖의 박스(예: 화면 속 박스)까지 옮겨야 할 때만 직접 줌(주면 기본 동작을 통째로 대신함),
       count: 단계 수 + 1, get: () => 현재 번호(1부터), set: (n) => 번호만 바꿈, go: (n) => 그 단계로 다시 그림, label: (n) => '문구', setup,   // 단계 이동(BoxEdit.init 의 step 과 같음)
       say, bubble, img                                                                                         // 포즈판용(initGuideSay 가 돌려준 함수, 말풍선, 캐릭터 <img>)
     });
     ?edit 가 아니면 아무 일도 안 함. 단계 데이터가 준비된 뒤, 처음 그리기(render) 전에 부를 것 */
  BoxEdit.stepEdit = function (o) {
    if (!ON) return;
    BoxEdit.fingerTag(o.key);
    BoxEdit.init({
      setup: o.setup,
      unit: o.unit,
      apply: o.apply || ((el) => {
        if (el._hot) { BoxEdit.padApply(el); return; }
        const r = el._ref;
        if (el._base) { el.style.left = (el._base[0] + r[0]) + 'px'; el.style.top = (el._base[1] + r[1]) + 'px'; }
      }),
      name: o.name || ((el) => el._hot ? '[클릭 영역 → HOT.' + el._hot + '] ' : '[손가락 → ' + el._fg + '] '),
      step: { count: o.count, get: o.get, set: (n) => o.set(Math.max(1, n)), go: o.go, label: o.label }
    });
    BoxEdit.posePicker({ say: o.say, bubble: o.bubble, img: o.img, step: o.get });
  };

  window.BoxEdit = BoxEdit;
})();
