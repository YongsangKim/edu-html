/* ==========================================================
   목차(TOC) 레이어 공통 삽입 스크립트
   - 모든 페이지가 공유하는 목차 마크업을 여기 한 곳에서만 관리
   - fetch()로 불러오는 방식은 file://(로컬)에서 CORS로 막혀서 안 되기
     때문에, <script src="js/toc.js">로 불러와 문자열을 그대로
     DOM에 삽입하는 방식을 씀 (로컬/서버 어디서든 동일하게 동작)
   - 반드시 js/common.js보다 "먼저" 로드해야 함
     (common.js의 initTocLayer가 이 마크업을 찾아서 동작을 붙이기 때문)
   - 페이지가 프로젝트 루트 기준 몇 단계 깊이에 있든(예: sa/sa.html은
     1단계, sa/07/page02.html은 2단계) 공통 이미지 경로가 깨지지 않도록,
     이 스크립트 자신을 불러온 <script src="…js/toc.js"> 경로에서 역산한
     BASE를 이미지 경로 앞에 붙임 (하드코딩된 "../../" 대신)
========================================================== */
(function () {
  var scriptEl = document.currentScript;
  var BASE = scriptEl ? scriptEl.src.replace(/js\/toc\.js(?:\?.*)?$/, '') : '';

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
                <a href="${BASE}sa/01/page01.html" class="toc-sub-item">1) 직업 퀴즈 게임</a>
                <a href="${BASE}sa/01/page03.html" class="toc-sub-item">2) 개념 이해 영상</a>
                <a href="${BASE}sa/01/page04.html" class="toc-sub-item">3) 미래 진로 선택을 위한 가치 보물찾기</a>
                <a href="${BASE}sa/01/page07.html" class="toc-sub-item">4) 나의 미래 모습 프롬프트</a>
                <a href="${BASE}sa/01/page09.html" class="toc-sub-item">5) 나의 미래 모습 만들기</a>
                <a href="${BASE}sa/01/page16.html" class="toc-sub-item">6) 퀴즈 풀기</a>
                <a href="${BASE}sa/01/page17.html" class="toc-sub-item">7) 프롬프트를 고쳐라</a>
              </div>
            </div>

            <div class="toc-accordion">
              <button class="toc-accordion-toggle js-sfx" data-sound="sound/click.mp3">2차시</button>
              <div class="toc-accordion-panel">
                <a href="${BASE}sa/02/page01.html" class="toc-sub-item">1) 나만의 자랑거리 찾기</a>
                <a href="${BASE}sa/02/page04.html" class="toc-sub-item">2) 개념 이해 영상</a>
                <a href="${BASE}sa/02/page05.html" class="toc-sub-item">3) 나의 자랑거리 기사문 작성하기</a>
                <a href="${BASE}sa/02/page07.html" class="toc-sub-item">4) 나만의 뉴스데스크 꾸미기</a>
                <a href="${BASE}sa/02/page09.html" class="toc-sub-item">5) 나의 자랑거리를 소개하는 뉴스</a>
                <a href="${BASE}sa/02/page12.html" class="toc-sub-item">6) 퀴즈 풀기</a>
                <a href="${BASE}sa/02/page13.html" class="toc-sub-item">7) 안전한 뉴스 판별하기</a>
              </div>
            </div>

            <div class="toc-accordion">
              <button class="toc-accordion-toggle js-sfx" data-sound="sound/click.mp3">3차시</button>
              <div class="toc-accordion-panel">
                <a href="${BASE}sa/03/page01.html" class="toc-sub-item">1) 마음을 전하는 빙고 게임</a>
                <a href="${BASE}sa/03/page03.html" class="toc-sub-item">2) 개념 이해 영상</a>
                <a href="${BASE}sa/03/page04.html" class="toc-sub-item">3) 어떤 말을 전할까?</a>
                <a href="${BASE}sa/03/page06.html" class="toc-sub-item">4) 마음 카드 디자이너 미션</a>
                <a href="${BASE}sa/03/page08.html" class="toc-sub-item">5) 마음을 전하는 카드 만들기</a>
                <a href="${BASE}sa/03/page10.html" class="toc-sub-item">6) 퀴즈 풀기</a>
                <a href="${BASE}sa/03/page11.html" class="toc-sub-item">7) 마음 배달 작전</a>
              </div>
            </div>

            <div class="toc-accordion">
              <button class="toc-accordion-toggle js-sfx" data-sound="sound/click.mp3">4차시</button>
              <div class="toc-accordion-panel">
                <a href="${BASE}sa/04/page01.html" class="toc-sub-item">1) 마음 톡톡! 감정 찾기 게임</a>
                <a href="${BASE}sa/04/page04.html" class="toc-sub-item">2) 개념 이해 영상</a>
                <a href="${BASE}sa/04/page05.html" class="toc-sub-item">3) 감정과 표현 선택하기</a>
                <a href="${BASE}sa/04/page09.html" class="toc-sub-item">4) AI 이모티콘 문장 만들기</a>
                <a href="${BASE}sa/04/page13.html" class="toc-sub-item">5) 나의 마음 이모티콘 제작소</a>
                <a href="${BASE}sa/04/page20.html" class="toc-sub-item">6) 퀴즈 풀기</a>
                <a href="${BASE}sa/04/page21.html" class="toc-sub-item">7) 마음 배달 이모티콘 게임</a>
              </div>
            </div>

            <div class="toc-accordion">
              <button class="toc-accordion-toggle js-sfx" data-sound="sound/click.mp3">5차시</button>
              <div class="toc-accordion-panel">
                <a href="${BASE}sa/05/page01.html" class="toc-sub-item">1) 오늘의 선택 미션</a>
                <a href="${BASE}sa/05/page03.html" class="toc-sub-item">2) 개념 이해 영상</a>
                <a href="${BASE}sa/05/page04.html" class="toc-sub-item">3) 조건 퍼즐 완성하기</a>
                <a href="${BASE}sa/05/page06.html" class="toc-sub-item">4) 물어보고, 살펴보고, 결정하기</a>
                <a href="${BASE}sa/05/page09.html" class="toc-sub-item">5) 1박 2일 수학여행 준비물 토너먼트</a>
                <a href="${BASE}sa/05/page11.html" class="toc-sub-item">6) 퀴즈 풀기</a>
                <a href="${BASE}sa/05/page12.html" class="toc-sub-item">7) 최선의 결정 보드게임</a>
              </div>
            </div>

            <div class="toc-accordion">
              <button class="toc-accordion-toggle js-sfx" data-sound="sound/click.mp3">6차시</button>
              <div class="toc-accordion-panel">
                <a href="${BASE}sa/06/page01.html" class="toc-sub-item">1) 출동! 우리 동네 심부름 탐험대</a>
                <a href="${BASE}sa/06/page03.html" class="toc-sub-item">2) 개념 이해 영상</a>
                <a href="${BASE}sa/06/page04.html" class="toc-sub-item">3) 재화와 서비스 보물 상자 분류하기</a>
                <a href="${BASE}sa/06/page06.html" class="toc-sub-item">4) 경제Song! 가사 블록 조립하기</a>
                <a href="${BASE}sa/06/page08.html" class="toc-sub-item">5) Suno와 함께 뚝딱! 나도 경제 뮤지션</a>
                <a href="${BASE}sa/06/page10.html" class="toc-sub-item">6) 퀴즈 풀기</a>
                <a href="${BASE}sa/06/page11.html" class="toc-sub-item">7) 우리 동네 가게를 운영하라!</a>
              </div>
            </div>

            <div class="toc-accordion">
              <button class="toc-accordion-toggle js-sfx" data-sound="sound/click.mp3">7차시</button>
              <div class="toc-accordion-panel">
                <a href="${BASE}sa/07/page01.html" class="toc-sub-item">1) 하루 속 이웃 찾기 미션!</a>
                <a href="${BASE}sa/07/page03.html" class="toc-sub-item">2) 개념 이해 영상</a>
                <a href="${BASE}sa/07/page04.html" class="toc-sub-item">3) 이웃 탐정 미션! 누가 도와줄까요?</a>
                <a href="${BASE}sa/07/page06.html" class="toc-sub-item">4) 찰칵! 우리 동네 정보를 찾아라</a>
                <a href="${BASE}sa/07/page08.html" class="toc-sub-item">5) 우리 동네 이웃 지도 탐험하기</a>
                <a href="${BASE}sa/07/page10.html" class="toc-sub-item">6) 퀴즈 풀기</a>
                <a href="${BASE}sa/07/page11.html" class="toc-sub-item">7) 우리 동네 이웃 앨범 만들기</a>
              </div>
            </div>

            <div class="toc-accordion">
              <button class="toc-accordion-toggle js-sfx" data-sound="sound/click.mp3">8차시</button>
              <div class="toc-accordion-panel">
                <a href="${BASE}sa/08/page01.html" class="toc-sub-item">1) 인기 여행지 카드 짝 맞추기</a>
                <a href="${BASE}sa/08/page04.html" class="toc-sub-item">2) 개념 이해 영상</a>
                <a href="${BASE}sa/08/page05.html" class="toc-sub-item">3) 조건 퍼즐 완성하기</a>
                <a href="${BASE}sa/08/page07.html" class="toc-sub-item">4) 여행 계획 순서 맞추기</a>
                <a href="${BASE}sa/08/page09.html" class="toc-sub-item">5) 오늘은 내가 여행 플래너!</a>
                <a href="${BASE}sa/08/page11.html" class="toc-sub-item">6) 퀴즈 풀기</a>
                <a href="${BASE}sa/08/page12.html" class="toc-sub-item">7) 여행 정보를 찾아라!</a>
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