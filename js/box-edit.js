/* ==========================================================
   좌표 수정 모드 (개발용) — 주소 뒤에 ?edit 을 붙여 열 때만 동작, 평소엔 아무 일도 안 함
   페이지가 가진 [x, y, 폭, 높이] 배열 좌표를 화면에서 눈으로 보며 옮기고 크기를 맞춘 뒤, 표시줄의 값을 그대로 코드에 붙여 넣는 용도
   (화면에 쓰는 %·변환값을 개발자 도구에서 고쳐도 원래 좌표로 되돌릴 수 없기 때문)
   조작: 박스 클릭 → 방향키 1px(Shift 10px) 이동, Alt+방향키 폭·높이 조절, 화면 왼쪽 아래 [◀ 이전][다음 ▶] 버튼 또는 ] [ / PageDown PageUp 으로 단계 이동, ?edit&step=N 으로 N단계에서 시작
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
   ========================================================== */
(function () {
  const ON = /[?&]edit(=|&|$)/.test(location.search);
  const BoxEdit = { on: ON };

  BoxEdit.tag = function (el, box) {
    el._ref = box;
    el.dataset.box = box.join(',');
    return el;
  };

  BoxEdit.init = function (o) {
    if (!ON) return;
    const UNIT = o.unit || 1;
    if (o.setup) o.setup();
    const style = document.createElement('style');
    style.textContent = '.is-box-edit [data-box]{outline:2px dashed #e5342f;animation:none !important}.is-box-edit [data-box].is-box-sel{outline:3px solid #2fbf71}';
    document.head.appendChild(style);
    document.body.classList.add('is-box-edit');

    const bar = document.createElement('div');
    bar.style.cssText = 'position:fixed;left:10px;bottom:10px;z-index:9999;display:flex;align-items:center;gap:10px;padding:8px 14px;border-radius:8px;background:#111;color:#ff0;font:600 18px Pretendard,sans-serif';
    const txt = document.createElement('span');
    const btn = (label, d) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      b.style.cssText = 'padding:4px 12px;border:0;border-radius:6px;background:#ff0;color:#111;font:700 18px Pretendard,sans-serif;cursor:pointer';
      b.addEventListener('click', () => move(d));
      return b;
    };
    if (o.step) bar.appendChild(btn('◀ 이전', -1));
    bar.appendChild(txt);
    if (o.step) bar.appendChild(btn('다음 ▶', 1));
    document.body.appendChild(bar);

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
      say((o.name ? o.name(sel) : '') + '[' + sel._ref.join(', ') + ']');
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
      const d = e.shiftKey ? 10 * UNIT : UNIT;
      const k = e.altKey
        ? { ArrowLeft: [2, -d], ArrowRight: [2, d], ArrowUp: [3, -d], ArrowDown: [3, d] }
        : { ArrowLeft: [0, -d], ArrowRight: [0, d], ArrowUp: [1, -d], ArrowDown: [1, d] };
      if (k[e.key][0] >= sel._ref.length) return;
      sel._ref[k[e.key][0]] = Math.round((sel._ref[k[e.key][0]] + k[e.key][1]) * 1000) / 1000;
      refresh();
    });
  };

  window.BoxEdit = BoxEdit;
})();
