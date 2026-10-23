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
                <a href="${BASE}sa/01/page14.html" class="toc-sub-item">6) 퀴즈 풀기</a>
                <a href="${BASE}sa/01/page15.html" class="toc-sub-item">7) 프롬프트를 고쳐라</a>
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
                <a href="${BASE}sa/03/page11.html" class="toc-sub-item">6) 퀴즈 풀기</a>
                <a href="${BASE}sa/03/page12.html" class="toc-sub-item">7) 마음 배달 작전</a>
              </div>
            </div>

            <div class="toc-accordion">
              <button class="toc-accordion-toggle js-sfx" data-sound="sound/click.mp3">4차시</button>
              <div class="toc-accordion-panel">
                <a href="${BASE}sa/04/page01.html" class="toc-sub-item">1) 마음 톡톡! 감정 찾기 게임</a>
                <a href="${BASE}sa/04/page04.html" class="toc-sub-item">2) 개념 이해 영상</a>
                <a href="${BASE}sa/04/page05.html" class="toc-sub-item">3) 감정과 표현 선택하기</a>
                <a href="${BASE}sa/04/page07.html" class="toc-sub-item">4) AI 이모티콘 문장 만들기</a>
                <a href="${BASE}sa/04/page11.html" class="toc-sub-item">5) 나의 마음 이모티콘 제작소</a>
                <a href="${BASE}sa/04/page14.html" class="toc-sub-item">6) 퀴즈 풀기</a>
                <a href="${BASE}sa/04/page15.html" class="toc-sub-item">7) 마음 배달 이모티콘 게임</a>
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
                <a href="${BASE}sa/09/page01.html" class="toc-sub-item">1) 우리 동네 숨은 영웅을 찾아라!</a>
                <a href="${BASE}sa/09/page03.html" class="toc-sub-item">2) 개념 이해 영상</a>
                <a href="${BASE}sa/09/page04.html" class="toc-sub-item">3) 지켜라! 우리 동네 안전망</a>
                <a href="${BASE}sa/09/page06.html" class="toc-sub-item">4) 안전 지킴이 변신 프롬프트</a>
                <a href="${BASE}sa/09/page08.html" class="toc-sub-item">5) 우리 동네 안전 지킴이 인터뷰</a>
                <a href="${BASE}sa/09/page11.html" class="toc-sub-item">6) 퀴즈 풀기</a>
                <a href="${BASE}sa/09/page12.html" class="toc-sub-item">7) 팩트체크! AI의 거짓말을 잡아라</a>
              </div>
            </div>

            <div class="toc-accordion">
              <button class="toc-accordion-toggle js-sfx" data-sound="sound/click.mp3">10차시</button>
              <div class="toc-accordion-panel">
                <a href="${BASE}sa/10/page01.html" class="toc-sub-item">1) 퍼즐로 완성하는 우리 동네</a>
                <a href="${BASE}sa/10/page03.html" class="toc-sub-item">2) 개념 이해 영상</a>
                <a href="${BASE}sa/10/page04.html" class="toc-sub-item">3) 장소와 역할 알아보기</a>
                <a href="${BASE}sa/10/page06.html" class="toc-sub-item">4) 초상권을 지켜라!</a>
                <a href="${BASE}sa/10/page08.html" class="toc-sub-item">5) 뚝딱! 우리 동네 브이로그 제작소</a>
                <a href="${BASE}sa/10/page10.html" class="toc-sub-item">6) 퀴즈 풀기</a>
                <a href="${BASE}sa/10/page11.html" class="toc-sub-item">7) 브이로그 완성 대작전</a>
              </div>
            </div>

            <div class="toc-accordion">
              <button class="toc-accordion-toggle js-sfx" data-sound="sound/click.mp3">11차시</button>
              <div class="toc-accordion-panel">
                <a href="${BASE}sa/11/page01.html" class="toc-sub-item">1) 우리가 만드는 행복한 동네</a>
                <a href="${BASE}sa/11/page03.html" class="toc-sub-item">2) 개념 이해 영상</a>
                <a href="${BASE}sa/11/page04.html" class="toc-sub-item">3) 존중을 전하는 문장 만들기</a>
                <a href="${BASE}sa/11/page06.html" class="toc-sub-item">4) 인권 존중 포스터 프롬프트</a>
                <a href="${BASE}sa/11/page08.html" class="toc-sub-item">5) 인권 존중 포스터 제작소</a>
                <a href="${BASE}sa/11/page10.html" class="toc-sub-item">6) 퀴즈 풀기</a>
                <a href="${BASE}sa/11/page11.html" class="toc-sub-item">7) 배려와 존중의 갈림길</a>
              </div>
            </div>

            <div class="toc-accordion">
              <button class="toc-accordion-toggle js-sfx" data-sound="sound/click.mp3">12차시</button>
              <div class="toc-accordion-panel">
                <a href="${BASE}sa/12/page01.html" class="toc-sub-item">1) 도전! 표지판과 규칙 찾기</a>
                <a href="${BASE}sa/12/page04.html" class="toc-sub-item">2) 개념 이해 영상</a>
                <a href="${BASE}sa/12/page05.html" class="toc-sub-item">3) 한국에서 지켜야 할 규칙</a>
                <a href="${BASE}sa/12/page08.html" class="toc-sub-item">4) 짧고 분명한 안내 문장 만들기</a>
                <a href="${BASE}sa/12/page10.html" class="toc-sub-item">5) Papago로 한국 문화 안내하기</a>
                <a href="${BASE}sa/12/page14.html" class="toc-sub-item">6) 퀴즈 풀기</a>
                <a href="${BASE}sa/12/page15.html" class="toc-sub-item">7) 관광객 안내 표지판 완성 게임</a>
              </div>
            </div>

            <div class="toc-accordion">
              <button class="toc-accordion-toggle js-sfx" data-sound="sound/click.mp3">13차시</button>
              <div class="toc-accordion-panel">
                <a href="${BASE}sa/13/page01.html" class="toc-sub-item">1) 숨은 개인정보 찾기</a>
                <a href="${BASE}sa/13/page03.html" class="toc-sub-item">2) 개념 이해 영상</a>
                <a href="${BASE}sa/13/page04.html" class="toc-sub-item">3) 이 사진, 올려도 될까?</a>
                <a href="${BASE}sa/13/page06.html" class="toc-sub-item">4) 쓱싹! 개인정보 지키기</a>
                <a href="${BASE}sa/13/page08.html" class="toc-sub-item">5) AI 지우개로 개인정보 지우기</a>
                <a href="${BASE}sa/13/page10.html" class="toc-sub-item">6) 퀴즈 풀기</a>
                <a href="${BASE}sa/13/page11.html" class="toc-sub-item">7) 안전한 SNS 업로드 챌린지</a>
              </div>
            </div>

            <div class="toc-accordion">
              <button class="toc-accordion-toggle js-sfx" data-sound="sound/click.mp3">14차시</button>
              <div class="toc-accordion-panel">
                <a href="${BASE}sa/14/page01.html" class="toc-sub-item">1) AI 방패! 수상한 연락을 막아라</a>
                <a href="${BASE}sa/14/page03.html" class="toc-sub-item">2) 개념 이해 영상</a>
                <a href="${BASE}sa/14/page04.html" class="toc-sub-item">3) 안전한 메시지와 수상한 메시지 나누기</a>
                <a href="${BASE}sa/14/page06.html" class="toc-sub-item">4) 보이스피싱, 이렇게 대처해요!</a>
                <a href="${BASE}sa/14/page08.html" class="toc-sub-item">5) 우리 가족 AI 안심 통화 설정</a>
                <a href="${BASE}sa/14/page10.html" class="toc-sub-item">6) 퀴즈 풀기</a>
                <a href="${BASE}sa/14/page11.html" class="toc-sub-item">7) 위기 탈출! 보이스피싱 탈출 게임</a>
              </div>
            </div>

            <div class="toc-accordion">
              <button class="toc-accordion-toggle js-sfx" data-sound="sound/click.mp3">15차시</button>
              <div class="toc-accordion-panel">
                <a href="${BASE}sa/15/page01.html" class="toc-sub-item">1) 진짜? 가짜? 뉴스 판별기!</a>
                <a href="${BASE}sa/15/page03.html" class="toc-sub-item">2) 디지털 윤리 수칙 분류하기</a>
                <a href="${BASE}sa/15/page05.html" class="toc-sub-item">3) 믿을 수 있는 정보로 만드는 노트북</a>
                <a href="${BASE}sa/15/page07.html" class="toc-sub-item">4) 제미나이 Notebook으로 PPT 만들기</a>
                <a href="${BASE}sa/15/page08.html" class="toc-sub-item">5) 퀴즈 풀기</a>
                <a href="${BASE}sa/15/page09.html" class="toc-sub-item">6) 완벽한 슬라이드 퍼즐 맞추기</a>
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