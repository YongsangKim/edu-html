/* UI 가이드 공통: 맨 위 카테고리 메뉴 + 페이지 안 섹션 바로가기.
   카테고리를 추가하려면 CATEGORIES에 한 줄 넣고 같은 이름의 html을 만들면 됨(todo:true면 메뉴에 회색 글자로만 표시) */
(function () {
  const CATEGORIES = [
    { file: 'buttons.html', label: '버튼' },
    { file: 'screens.html', label: '화면 틀' },
    { file: 'modals.html', label: '팝업·모달' },
    { file: 'progress.html', label: '진행도(게이지·별·배지)' },
    { file: 'characters.html', label: '안내 캐릭터·말풍선' },
    { file: 'drag.html', label: '끌어 놓기' },
    { file: 'intro.html', label: '도입·마무리 화면' },
    { file: 'quiz.html', label: '퀴즈 풀기' },
    { file: 'wide-intro.html', label: '넓은 활동 방법 안내' }
  ];

  const here = location.pathname.split('/').pop() || 'index.html';
  const nav = document.createElement('nav');
  nav.className = 'g-nav';
  nav.innerHTML = '<a class="g-nav-home" href="index.html">UI 가이드</a>' + CATEGORIES.map((c) =>
    c.todo
      ? '<span class="g-nav-todo">' + c.label + '</span>'
      : '<a class="g-nav-cat' + (c.file === here ? ' is-on' : '') + '" href="' + c.file + '">' + c.label + '</a>'
  ).join('');
  document.body.insertBefore(nav, document.body.firstChild);

  // 섹션(h2)마다 id를 달고 h1 아래에 바로가기 목록을 만듦
  const toc = document.querySelector('.g-toc');
  if (!toc) return;
  document.querySelectorAll('.g-wrap h2').forEach((h, i) => {
    h.id = h.id || 'sec' + (i + 1);
    const li = document.createElement('li');
    li.innerHTML = '<a href="#' + h.id + '">' + h.textContent.replace(/\s+—.*$/, '') + '</a>';
    toc.appendChild(li);
  });
})();

/* 탭으로 나누기: iframe 미리보기가 많은 페이지에서 처음엔 첫 탭만 불러와 로딩을 줄임.
   h2 하나가 탭 하나. 탭을 처음 열 때만 그 안의 iframe(data-src)을 불러옴. 주소 끝 #t=번호로 탭 지정(1부터).
   쓰는 법: 페이지 맨 아래 스크립트에서 initGuideTabs(섹션들) 호출. 정적 페이지는 wrapH2Sections(.g-wrap)로 h2 단위 묶음을 만들어 넘김 */
window.wrapH2Sections = function (wrap) {
  const out = [];
  let cur = null;
  Array.from(wrap.children).forEach((el) => {
    if (el.tagName === 'H2') {
      cur = document.createElement('section');
      wrap.insertBefore(cur, el);
      cur.appendChild(el);
      out.push(cur);
    } else if (cur && el.tagName !== 'SCRIPT') {
      cur.appendChild(el);
    }
  });
  return out;
};

window.initGuideTabs = function (secs) {
  const frameSecs = secs.filter((s) => s.querySelector('iframe'));
  const load = (s) => s.querySelectorAll('iframe[data-src]').forEach((f) => { f.src = f.dataset.src; f.removeAttribute('data-src'); });
  if (frameSecs.length < 2) { frameSecs.forEach(load); return; }
  frameSecs.forEach((s) => s.querySelectorAll('iframe').forEach((f) => { f.dataset.src = f.getAttribute('src'); f.removeAttribute('src'); }));
  const toc = document.querySelector('.g-toc');
  if (toc) toc.style.display = 'none';
  const bar = document.createElement('div');
  bar.className = 'g-tabs';
  const btns = frameSecs.map((s, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = s.querySelector('h2').textContent.replace(/\s+—.*$/, '');
    b.addEventListener('click', () => show(i));
    bar.appendChild(b);
    return b;
  });
  frameSecs[0].parentNode.insertBefore(bar, frameSecs[0]);
  function show(i) {
    frameSecs.forEach((s, j) => { s.classList.toggle('is-tab-off', j !== i); btns[j].classList.toggle('is-on', j === i); });
    load(frameSecs[i]);
    history.replaceState(null, '', '#t=' + (i + 1));
  }
  const m = /#t=(\d+)/.exec(location.hash);
  const start = m && frameSecs[Number(m[1]) - 1] ? Number(m[1]) - 1 : 0;
  show(start);
};
