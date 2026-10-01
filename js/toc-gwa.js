/* ==========================================================
   목차(TOC) 레이어 공통 삽입 스크립트 (과학 전용)
   - js/toc.js(사회용)와 동일한 구조를 그대로 복사해 과학 15차시 목록만
     담은 버전. 사회/과학 페이지가 서로 다른 목차를 보여줘야 해서 분리함
   - 모든 페이지가 공유하는 목차 마크업을 여기 한 곳에서만 관리
   - fetch()로 불러오는 방식은 file://(로컬)에서 CORS로 막혀서 안 되기
     때문에, <script src="js/toc-gwa.js">로 불러와 문자열을 그대로
     DOM에 삽입하는 방식을 씀 (로컬/서버 어디서든 동일하게 동작)
   - 반드시 js/common.js보다 "먼저" 로드해야 함
     (common.js의 initTocLayer가 이 마크업을 찾아서 동작을 붙이기 때문)
   - 페이지가 프로젝트 루트 기준 몇 단계 깊이에 있든(예: gwa/gwa.html은
     1단계, gwa/03/page01.html은 2단계) 공통 이미지 경로가 깨지지 않도록,
     이 스크립트 자신을 불러온 <script src="…js/toc-gwa.js"> 경로에서
     역산한 BASE를 이미지 경로 앞에 붙임 (하드코딩된 "../../" 대신)
========================================================== */
(function () {
  var scriptEl = document.currentScript;
  var BASE = scriptEl ? scriptEl.src.replace(/js\/toc-gwa\.js(?:\?.*)?$/, '') : '';

  var TOC_HTML = `<div class="toc-layer">
          <div class="toc-header">
            <h2 class="toc-title">목차</h2>
            <button class="toc-close js-nav-effect">
              <img src="${BASE}img/common/btn_close.png" data-src-over="${BASE}img/common/btn_close_on.png" data-sound="sound/click.mp3" class="js-img-swap js-sfx" alt="닫기">
            </button>
          </div>
          <div class="toc-body custom-scrollbar">

            <div class="toc-accordion">
              <button class="toc-accordion-toggle js-sfx" data-sound="sound/click.mp3">1차시</button>
              <div class="toc-accordion-panel">
                <a href="${BASE}gwa/01/page01.html" class="toc-sub-item">1) 알록달록 과일 농장 알바왕</a>
                <a href="${BASE}gwa/01/page04.html" class="toc-sub-item">2) 개념 이해 영상</a>
                <a href="${BASE}gwa/01/page05.html" class="toc-sub-item">3) 다양한 매체에서 날씨 데이터 수집하기</a>
                <a href="${BASE}gwa/01/page08.html" class="toc-sub-item">4) 정보를 깔끔하게 데이터로 정리하기</a>
                <a href="${BASE}gwa/01/page10.html" class="toc-sub-item">5) 내가 모은 데이터로 AI에게 질문하기</a>
                <a href="${BASE}gwa/01/page26.html" class="toc-sub-item">6) 퀴즈 풀기</a>
                <a href="${BASE}gwa/01/page27.html" class="toc-sub-item">7) 정답을 부탁해!</a>
              </div>
            </div>

            <div class="toc-accordion">
              <button class="toc-accordion-toggle js-sfx" data-sound="sound/click.mp3">2차시</button>
              <div class="toc-accordion-panel">
                <a href="javascript:;" class="toc-sub-item">01</a>
                <a href="javascript:;" class="toc-sub-item">02</a>
                <a href="javascript:;" class="toc-sub-item">03</a>
                <a href="javascript:;" class="toc-sub-item">04</a>
                <a href="javascript:;" class="toc-sub-item">05</a>
                <a href="javascript:;" class="toc-sub-item">06</a>
              </div>
            </div>

            <div class="toc-accordion">
              <button class="toc-accordion-toggle js-sfx" data-sound="sound/click.mp3">3차시</button>
              <div class="toc-accordion-panel">
                <a href="${BASE}gwa/03/page01.html" class="toc-sub-item">1) 음식 속에 숨겨진 정보를 찾아라!</a>
                <a href="${BASE}gwa/03/page05.html" class="toc-sub-item">2) 개념 이해 영상</a>
                <a href="${BASE}gwa/03/page06.html" class="toc-sub-item">3) 데이터 모아 빅데이터 만들기</a>
                <a href="${BASE}gwa/03/page08.html" class="toc-sub-item">4) 표와 그래프로 날씨 패턴 찾기</a>
                <a href="${BASE}gwa/03/page10.html" class="toc-sub-item">5) AI 날씨 데이터 분석과 맞춤 추천</a>
                <a href="${BASE}gwa/03/page11.html" class="toc-sub-item">6) 퀴즈 풀기</a>
                <a href="${BASE}gwa/03/page12.html" class="toc-sub-item">7) 오늘은 무슨 옷을 입을까?</a>
              </div>
            </div>

            <div class="toc-accordion">
              <button class="toc-accordion-toggle js-sfx" data-sound="sound/click.mp3">4차시</button>
              <div class="toc-accordion-panel">
                <a href="javascript:;" class="toc-sub-item">01</a>
                <a href="javascript:;" class="toc-sub-item">02</a>
                <a href="javascript:;" class="toc-sub-item">03</a>
                <a href="javascript:;" class="toc-sub-item">04</a>
                <a href="javascript:;" class="toc-sub-item">05</a>
                <a href="javascript:;" class="toc-sub-item">06</a>
              </div>
            </div>

            <div class="toc-accordion">
              <button class="toc-accordion-toggle js-sfx" data-sound="sound/click.mp3">5차시</button>
              <div class="toc-accordion-panel">
                <a href="${BASE}gwa/05/page01.html" class="toc-sub-item">1) SOS! 파도를 분석하라!</a>
                <a href="${BASE}gwa/05/page03.html" class="toc-sub-item">2) 개념 이해 영상</a>
                <a href="${BASE}gwa/05/page04.html" class="toc-sub-item">3) 우리 집 속 숨은 마이크 찾기</a>
                <a href="${BASE}gwa/05/page06.html" class="toc-sub-item">4) 소리 파도(음파) 그래프 조작하기</a>
                <a href="${BASE}gwa/05/page08.html" class="toc-sub-item">5) AI 비서와 똑똑하게 소통하기</a>
                <a href="${BASE}gwa/05/page09.html" class="toc-sub-item">6) 퀴즈 풀기</a>
                <a href="${BASE}gwa/05/page10.html" class="toc-sub-item">7) 마이크가 듣는 소리파도를 해석하라!</a>
              </div>
            </div>

            <div class="toc-accordion">
              <button class="toc-accordion-toggle js-sfx" data-sound="sound/click.mp3">6차시</button>
              <div class="toc-accordion-panel">
                <a href="javascript:;" class="toc-sub-item">01</a>
                <a href="javascript:;" class="toc-sub-item">02</a>
                <a href="javascript:;" class="toc-sub-item">03</a>
                <a href="javascript:;" class="toc-sub-item">04</a>
                <a href="javascript:;" class="toc-sub-item">05</a>
                <a href="javascript:;" class="toc-sub-item">06</a>
              </div>
            </div>

            <div class="toc-accordion">
              <button class="toc-accordion-toggle js-sfx" data-sound="sound/click.mp3">7차시</button>
              <div class="toc-accordion-panel">
                <a href="${BASE}gwa/07/page01.html" class="toc-sub-item">1) 삼촌의 이사를 도와라!</a>
                <a href="${BASE}gwa/07/page04.html" class="toc-sub-item">2) 개념 이해 영상</a>
                <a href="${BASE}gwa/07/page05.html" class="toc-sub-item">3) 스마트 기기 역할 분류하기</a>
                <a href="${BASE}gwa/07/page07.html" class="toc-sub-item">4) AI 허브의 생각상자! 조건문 코딩하기</a>
                <a href="${BASE}gwa/07/page09.html" class="toc-sub-item">5) 상호작용형 실습 콘텐츠</a>
                <a href="${BASE}gwa/07/page11.html" class="toc-sub-item">6) 퀴즈 풀기</a>
                <a href="${BASE}gwa/07/page12.html" class="toc-sub-item">7) 내가 바로 스마트홈 AI!</a>
              </div>
            </div>

            <div class="toc-accordion">
              <button class="toc-accordion-toggle js-sfx" data-sound="sound/click.mp3">8차시</button>
              <div class="toc-accordion-panel">
                <a href="javascript:;" class="toc-sub-item">01</a>
                <a href="javascript:;" class="toc-sub-item">02</a>
                <a href="javascript:;" class="toc-sub-item">03</a>
                <a href="javascript:;" class="toc-sub-item">04</a>
                <a href="javascript:;" class="toc-sub-item">05</a>
                <a href="javascript:;" class="toc-sub-item">06</a>
              </div>
            </div>

            <div class="toc-accordion">
              <button class="toc-accordion-toggle js-sfx" data-sound="sound/click.mp3">9차시</button>
              <div class="toc-accordion-panel">
                <a href="javascript:;" class="toc-sub-item">01</a>
                <a href="javascript:;" class="toc-sub-item">02</a>
                <a href="javascript:;" class="toc-sub-item">03</a>
                <a href="javascript:;" class="toc-sub-item">04</a>
                <a href="javascript:;" class="toc-sub-item">05</a>
                <a href="javascript:;" class="toc-sub-item">06</a>
              </div>
            </div>

            <div class="toc-accordion">
              <button class="toc-accordion-toggle js-sfx" data-sound="sound/click.mp3">10차시</button>
              <div class="toc-accordion-panel">
                <a href="javascript:;" class="toc-sub-item">01</a>
                <a href="javascript:;" class="toc-sub-item">02</a>
                <a href="javascript:;" class="toc-sub-item">03</a>
                <a href="javascript:;" class="toc-sub-item">04</a>
                <a href="javascript:;" class="toc-sub-item">05</a>
                <a href="javascript:;" class="toc-sub-item">06</a>
              </div>
            </div>

            <div class="toc-accordion">
              <button class="toc-accordion-toggle js-sfx" data-sound="sound/click.mp3">11차시</button>
              <div class="toc-accordion-panel">
                <a href="javascript:;" class="toc-sub-item">01</a>
                <a href="javascript:;" class="toc-sub-item">02</a>
                <a href="javascript:;" class="toc-sub-item">03</a>
                <a href="javascript:;" class="toc-sub-item">04</a>
                <a href="javascript:;" class="toc-sub-item">05</a>
                <a href="javascript:;" class="toc-sub-item">06</a>
              </div>
            </div>

            <div class="toc-accordion">
              <button class="toc-accordion-toggle js-sfx" data-sound="sound/click.mp3">12차시</button>
              <div class="toc-accordion-panel">
                <a href="javascript:;" class="toc-sub-item">01</a>
                <a href="javascript:;" class="toc-sub-item">02</a>
                <a href="javascript:;" class="toc-sub-item">03</a>
                <a href="javascript:;" class="toc-sub-item">04</a>
                <a href="javascript:;" class="toc-sub-item">05</a>
                <a href="javascript:;" class="toc-sub-item">06</a>
              </div>
            </div>

            <div class="toc-accordion">
              <button class="toc-accordion-toggle js-sfx" data-sound="sound/click.mp3">13차시</button>
              <div class="toc-accordion-panel">
                <a href="javascript:;" class="toc-sub-item">01</a>
                <a href="javascript:;" class="toc-sub-item">02</a>
                <a href="javascript:;" class="toc-sub-item">03</a>
                <a href="javascript:;" class="toc-sub-item">04</a>
                <a href="javascript:;" class="toc-sub-item">05</a>
                <a href="javascript:;" class="toc-sub-item">06</a>
              </div>
            </div>

            <div class="toc-accordion">
              <button class="toc-accordion-toggle js-sfx" data-sound="sound/click.mp3">14차시</button>
              <div class="toc-accordion-panel">
                <a href="javascript:;" class="toc-sub-item">01</a>
                <a href="javascript:;" class="toc-sub-item">02</a>
                <a href="javascript:;" class="toc-sub-item">03</a>
                <a href="javascript:;" class="toc-sub-item">04</a>
                <a href="javascript:;" class="toc-sub-item">05</a>
                <a href="javascript:;" class="toc-sub-item">06</a>
              </div>
            </div>

            <div class="toc-accordion">
              <button class="toc-accordion-toggle js-sfx" data-sound="sound/click.mp3">15차시</button>
              <div class="toc-accordion-panel">
                <a href="javascript:;" class="toc-sub-item">01</a>
                <a href="javascript:;" class="toc-sub-item">02</a>
                <a href="javascript:;" class="toc-sub-item">03</a>
                <a href="javascript:;" class="toc-sub-item">04</a>
                <a href="javascript:;" class="toc-sub-item">05</a>
                <a href="javascript:;" class="toc-sub-item">06</a>
              </div>
            </div>

          </div>
        </div>
`;

  var stage = document.getElementById('stage');
  if (stage) {
    stage.insertAdjacentHTML('beforeend', TOC_HTML);
  }
})();
