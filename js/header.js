/* ==========================================================
   헤더 공통 삽입 스크립트
   - index.html을 뺀 모든 페이지가 거의 똑같이 반복하는 헤더(뒤로/목차/다음
     + 확대/축소/처음 버튼) 마크업을 여기 한 곳에서만 관리 (js/toc.js와 같은 방식)
   - fetch()로 불러오는 방식은 file://(로컬)에서 CORS로 막혀서 안 되기
     때문에, <script src="js/header.js">로 불러와 문자열을 그대로
     DOM에 삽입하는 방식을 씀 (로컬/서버 어디서든 동일하게 동작)
   - 반드시 js/common.js보다 "먼저" 로드해야 함
     (common.js의 initLinkEffect/initImageSwap/initTocLayer 등이 이
      마크업을 찾아서 동작을 붙이기 때문)
   - 페이지마다 다른 부분(제목, "다음" 버튼이 가는 곳)은 이 스크립트를
     불러오는 <script> 태그의 data-title / data-next 속성으로 넘김
     (data-next를 안 주면 "다음" 버튼은 javascript:next(), 즉 같은 폴더의 다음 번호 페이지로 감.
      "이전" 버튼은 항상 javascript:prev() — 둘 다 js/common.js의 initLinkEffect가 해석)
   예시:
     <script src="../../js/header.js" data-title="직업 퀴즈 게임" data-next="page02.html"></script>
   - 이 스크립트 자신을 불러온 <script src="…js/header.js"> 경로에서 역산한
     BASE를 공용 이미지 경로 앞에 붙여서, 페이지가 몇 단계 깊이에 있든
     (sa/sa.html은 1단계, sa/01/page02.html은 2단계) 항상 같은 공용
     img/common, index.html을 정확히 찾음 — "다음" 같은 페이지별 상대경로는
     이 BASE를 붙이지 않고 data-next 값 그대로 씀
========================================================== */
(function () {
  var scriptEl = document.currentScript;
  var BASE = scriptEl ? scriptEl.src.replace(/js\/header\.js(?:\?.*)?$/, '') : '';
  var title = (scriptEl && scriptEl.dataset.title) || '';
  var next = (scriptEl && scriptEl.dataset.next) || 'javascript:next();';

  var HEADER_HTML = `<header>
          <div class="header-left">
            <a href="javascript:prev();" class="js-nav-effect has-tooltip">
              <img src="${BASE}img/common/btn_back.png" class="js-img-swap js-sfx" data-src-alt="${BASE}img/common/btn_back_on.png" data-src-over="${BASE}img/common/btn_back_over.png" data-sound="sound/click.mp3" alt="이전">
              <img src="${BASE}img/common/btn_back_tooltip.png" class="btn-tooltip tooltip-left" alt="이전화면으로 가기">
            </a>
            <a href="javascript:;" class="js-nav-effect js-toc-open has-tooltip">
              <img src="${BASE}img/common/btn_list.png" class="js-img-swap js-sfx" data-src-over="${BASE}img/common/btn_list_over.png" data-sound="sound/click.mp3" alt="목차">
              <img src="${BASE}img/common/btn_list_tooltip.png" class="btn-tooltip tooltip-left" alt="목록으로 가기">
            </a>
            <a href="${next}" class="js-nav-effect has-tooltip">
              <img src="${BASE}img/common/btn_next.png" class="js-img-swap js-sfx" data-src-alt="${BASE}img/common/btn_next_on.png" data-src-over="${BASE}img/common/btn_next_over.png" data-sound="sound/click.mp3" alt="다음">
              <img src="${BASE}img/common/btn_next_tooltip.png" class="btn-tooltip tooltip-left" alt="다음화면으로 가기">
            </a>
          </div>
          <h1 class="page-title">${title}</h1>
          <div class="header-right">
            <a href="javascript:;" id="zoomOutBtn" class="has-tooltip">
              <img src="${BASE}img/common/btn_minus.png" class="js-img-swap" data-src-over="${BASE}img/common/btn_minus_over.png" alt="">
              <img src="${BASE}img/common/btn_minus_tooltip.png" class="btn-tooltip tooltip-right" alt="작게 보기">
            </a>
            <a href="javascript:;" id="zoomInBtn" class="has-tooltip">
              <img src="${BASE}img/common/btn_plus.png" class="js-img-swap" data-src-over="${BASE}img/common/btn_plus_over.png" alt="">
              <img src="${BASE}img/common/btn_plus_tooltip.png" class="btn-tooltip tooltip-right" alt="크게 보기">
            </a>
            <a href="${BASE}index.html" class="js-nav-effect has-tooltip">
              <img src="${BASE}img/common/btn_home.png" class="js-img-swap js-sfx" data-src-alt="${BASE}img/common/btn_home_on.png" data-src-over="${BASE}img/common/btn_home_over.png" data-sound="sound/click.mp3" alt="">
              <img src="${BASE}img/common/btn_home_tooltip.png" class="btn-tooltip tooltip-right" alt="맨앞으로 가기">
            </a>
          </div>
        </header>
`;

  var stage = document.getElementById('stage');
  if (stage) {
    stage.insertAdjacentHTML('afterbegin', HEADER_HTML);

    // 제목이 길어 두 줄로 넘어갈 때만 is-long(자간 좁힘). 웹폰트가 늦게 들어오면 폭이 달라져서 글꼴 로드 뒤 다시 잼
    var h1 = stage.querySelector('header .page-title');
    var fit = function () {
      h1.classList.remove('is-long');
      var lineHeight = parseFloat(getComputedStyle(h1).lineHeight) || parseFloat(getComputedStyle(h1).fontSize) * 1.3;
      h1.classList.toggle('is-long', h1.offsetHeight > lineHeight * 1.5);
    };
    fit();
    window.addEventListener('load', fit);
    if (document.fonts) document.fonts.addEventListener('loadingdone', fit);
  }
})();
