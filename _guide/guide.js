/* UI 가이드 공통: 맨 위 카테고리 메뉴 + 페이지 안 섹션 바로가기.
   카테고리를 추가하려면 CATEGORIES에 한 줄 넣고 같은 이름의 html을 만들면 됨(todo:true면 메뉴에 회색 글자로만 표시) */
(function () {
  const CATEGORIES = [
    { file: 'buttons.html', label: '버튼' },
    { file: 'screens.html', label: '화면 틀' },
    { file: 'modals.html', label: '팝업·모달' },
    { file: 'progress.html', label: '진행도(게이지·별·배지)' },
    { file: 'characters.html', label: '안내 캐릭터·말풍선' },
    { file: 'drag.html', label: '끌어 놓기' }
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
