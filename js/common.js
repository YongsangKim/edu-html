/* ==========================================================
   공통 유틸: 뒤로가기(bfcache)로 돌아왔을 때 상태 초기화
   - "javascript:history.back();" 등으로 뒤로 가면 브라우저가 페이지를
     다시 실행하는 대신 떠나기 직전 DOM 상태(클릭 결과, 카드 배치,
     별 표시 등)를 그대로 복원해버림(bfcache)
   - pageshow 이벤트의 event.persisted로 그 복원 상황을 감지해서
     강제로 새로고침 → 항상 처음 상태로 보이게 함
   - 이때는 sessionStorage에 표시를 남겨서, 새로고침 뒤 페이드 인을
     건너뛰게 함(뒤로가기는 화면이 서서히 밝아지지 않고 바로 보임)
========================================================== */
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    // 감지되는 즉시(트랜지션 없이) 화면을 검게 덮어서
    // 옛 상태가 눈에 보이는 시간을 최대한 줄임
    if (pageFade) {
      pageFade.style.transition = 'none';
      pageFade.style.opacity = '1';
    }
    sessionStorage.setItem('skipFadeIn', '1');
    window.location.reload();
  }
});

/* ==========================================================
   핵심 로직: 1920x1080 stage를
   1) 기본적으로는 화면에 꽉 맞게 scale (기존과 동일, 100% 기준)
   2) +/- 버튼으로 그 기준에서 추가로 확대(120%, 140%...) 가능
   3) 화면보다 커지면 #viewport가 스크롤 가능해짐(가로/세로 모두)
========================================================== */
// 이 스크립트를 불러온 <script src="…js/common.js"> 경로에서 역산한 절대경로.
// 페이지가 루트 기준 몇 단계 깊이(sa/sa.html은 1단계, sa/07/page01.html은 2단계)에
// 있든, sound/*.mp3 같은 "페이지 기준 상대경로"가 항상 프로젝트 루트를 가리키게 함
const ASSET_BASE = (function () {
  var scriptEl = document.currentScript;
  return scriptEl ? scriptEl.src.replace(/js\/common\.js(?:\?.*)?$/, '') : '';
})();

const BASE_W = 1920;
const BASE_H = 1080;
const stage = document.getElementById('stage');
const stageSpacer = document.getElementById('stage-spacer');
const viewport = document.getElementById('viewport');
const zoomInfo = document.getElementById('zoomInfo');

let currentScale = 1; // 실제로 적용된 최종 배율(기본fit × 줌) — 드래그 등 다른 기능이 좌표 변환에 사용
let zoomLevel = 1;    // 버튼으로 조절하는 배율. 1 = 100%(화면에 꽉 맞는 기본 상태)

const ZOOM_MIN = 1;    // 기본(화면에 맞춘 상태) = 100%
const ZOOM_MAX = 1.5;  // 확대 상태 = 150%

function applyStageTransform() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // 화면에 꽉 맞는 기본 배율 (레터박스 방식: 더 작은 값 선택)
  const baseScale = Math.min(vw / BASE_W, vh / BASE_H);

  // 최종 배율 = 기본 배율 × 사용자가 조절한 줌
  const finalScale = baseScale * zoomLevel;
  currentScale = finalScale;

  // 최종적으로 실제 화면에 렌더링되는 크기(px)
  const renderW = BASE_W * finalScale;
  const renderH = BASE_H * finalScale;

  stage.style.transform = `scale(${finalScale})`;

  // 스페이서 크기를 실제 렌더링 크기로 맞춰줘야 #viewport가 스크롤
  // 범위를 정확히 계산함 (stage 자체는 transform이라 레이아웃 크기가 안 바뀜)
  stageSpacer.style.width = `${renderW}px`;
  stageSpacer.style.height = `${renderH}px`;
  // 가로 중앙 정렬은 CSS(#stage-spacer의 margin:0 auto)가 처리함
  // → 화면보다 좁으면 자동 중앙정렬, 화면보다 넓으면 0이 되며 스크롤 가능

  // 확대(줌 100% 초과)했을 때만 스크롤 가능하게, 기본 상태에선 기존처럼 스크롤 없음
  viewport.style.overflow = zoomLevel > 1 ? 'auto' : 'hidden';

  zoomInfo.textContent =
    `viewport ${vw}×${vh}  →  fit ${(baseScale * 100).toFixed(0)}%  ×  zoom ${(zoomLevel * 100).toFixed(0)}%`;

  // 더 이상 줄일 수 없는 상태(100%)면 축소 버튼을 숨김
  // (더 키울 수 없는 최대치에서도 마찬가지로 확대 버튼 숨김)
  if (zoomOutBtn) zoomOutBtn.style.display = zoomLevel <= ZOOM_MIN ? 'none' : '';
  if (zoomInBtn) zoomInBtn.style.display = zoomLevel >= ZOOM_MAX ? 'none' : '';
}

function zoomIn() {
  zoomLevel = ZOOM_MAX; // 100% → 150%로 바로 전환
  applyStageTransform();
}

function zoomOut() {
  zoomLevel = ZOOM_MIN; // 150% → 100%로 바로 전환
  applyStageTransform();
}

// 확대/축소 버튼 연결 (applyStageTransform이 이 버튼들을 참조하므로 호출보다 먼저 선언)
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');
if (zoomInBtn) zoomInBtn.addEventListener('click', zoomIn);
if (zoomOutBtn) zoomOutBtn.addEventListener('click', zoomOut);

// resize는 창을 드래그하는 동안 초당 수십 번 발생함. 그때마다 transform과
// 스페이서 크기를 바로 쓰면 매 이벤트가 레이아웃을 강제로 다시 계산시킴
// → 다음 프레임에 딱 한 번만 반영하도록 묶음
let stageTransformQueued = false;
function requestStageTransform() {
  if (stageTransformQueued) return;
  stageTransformQueued = true;
  requestAnimationFrame(() => {
    stageTransformQueued = false;
    applyStageTransform();
  });
}

window.addEventListener('resize', requestStageTransform);
window.addEventListener('orientationchange', requestStageTransform);
applyStageTransform();


/* ==========================================================
   공통 유틸: 페이지 이동을 부드러운 페이드로 처리
   - #page-fade 라는 화면 전체를 덮는 레이어를 이용
     (HTML의 <body> 바로 아래에 미리 넣어둠, 기본 opacity:1)
   - 페이지 로드 시 서서히 사라지면서 시작(페이드 인)
   - navigateTo(href)로 이동하면 서서히 어두워졌다가(페이드 아웃)
     실제 페이지 전환이 일어남 → 다른 페이지로 가도 끊기지 않고 이어짐
   - 다른 기능들은 이 함수 하나만 호출하면 되고, 페이드 구현
     자체는 몰라도 됨 (독립적인 공통 유틸)
========================================================== */
const pageFade = document.getElementById('page-fade');

// 페이지 로드 시 페이드 인 (단, 뒤로가기로 인한 새로고침이면 건너뜀)
if (sessionStorage.getItem('skipFadeIn') === '1') {
  sessionStorage.removeItem('skipFadeIn');
  if (pageFade) {
    pageFade.style.transition = 'none'; // 애니메이션 없이 즉시
    pageFade.style.opacity = '0';
  }
} else {
  requestAnimationFrame(() => {
    if (pageFade) pageFade.style.opacity = '0';
  });
}

/* ==========================================================
   공통 유틸: 요소가 .step-panel(스텝 플로우) 안에 있고 아직 숨겨져
   있으면, 그 스텝이 실제로 보여지는 순간(step:visible 이벤트)까지
   콜백 실행을 미룸. step-panel 밖이거나 이미 보이는 상태면 즉시 실행.
   - finger-guide, swipe-guide처럼 "타이머로 움직이는" 애니메이션이
     숨겨진 스텝 안에서 미리 실행돼버려서, 정작 그 스텝이 보일 땐
     이미 끝나있는 문제를 막기 위함
========================================================== */
function whenVisible(el, callback) {
  const panel = el.closest('.step-panel');
  if (!panel || !panel.classList.contains('is-hidden')) {
    callback();
    return;
  }
  panel.addEventListener('step:visible', callback, { once: true });
}

/* ==========================================================
   공통 유틸: 완료 시 "다음 스텝으로 넘기기 vs 실제 페이지 이동" 판단
   - el이 .step-flow 안의 .step-panel에 속해있고 다음 스텝이 있으면
     → 페이지 이동 없이 다음 스텝만 보여줌 (step:visible 이벤트도 쏨)
   - 그게 아니면(스텝 밖이거나 마지막 스텝) → nextHref로 실제 이동
   - OX/드래그/줄긋기/카드찾기 퀴즈가 전부 이 함수를 통해 "완료 후
     이동"을 처리하므로, 퀴즈를 스텝 안에 넣기만 하면 자동으로
     "다음 스텝 넘기기"로 동작함 (퀴즈 쪽 코드 수정 불필요)
========================================================== */
function advancePanelOrNavigate(el, nextHref) {
  const panel = el.closest('.step-panel');
  if (panel) {
    const flow = panel.closest('.step-flow');
    if (flow) {
      const panels = Array.from(flow.querySelectorAll('.step-panel'));
      const nextPanel = panels[panels.indexOf(panel) + 1];
      if (nextPanel) {
        panel.classList.add('is-hidden');
        nextPanel.classList.remove('is-hidden');
        nextPanel.dispatchEvent(new CustomEvent('step:visible'));
        return;
      }
    }
  }
  if (nextHref) navigateTo(nextHref);
}

function navigateTo(href, opts) {
  if (!href) return;

  // "뒤로가기"로 인한 이동이 아니면, "이 목적지 페이지는 지금 여기서 왔다"를 기록해둠
  // → document.referrer가 안 잡히는 로컬(file://) 환경에서도 정확한 이전
  //   페이지를 알 수 있고, 페이지별로 키를 따로 저장해서(스택 방식과 달리)
  //   브라우저 자체 뒤로가기와 섞어 써도 순서가 꼬이지 않음
  if (!opts || !opts.isBack) {
    try {
      const fromPath = window.location.pathname + window.location.search;
      const destPath = new URL(href, window.location.href).pathname;
      sessionStorage.setItem('cameFrom:' + destPath, fromPath);
    } catch (err) {
      // sessionStorage를 못 쓰는 환경이면 그냥 무시(뒤로가기는 referrer/fallback으로 동작)
    }
  }

  // 페이드 아웃은 하지 않음 — 이동하는 순간 브라우저가 페이지를 언로드해버려서
  // 트랜지션이 끝까지 재생되지 못하고 뚝 끊기는 것처럼 보이는 문제가 있었음.
  // 대신 새 페이지가 열릴 때의 페이드 인만으로 자연스러움을 줌.
  window.location.href = href;
}

// 지금 페이지가 "어디서 왔는지" 기록을 찾음 (뒤로가기 버튼 전용)
function getCameFrom() {
  try {
    const currentPath = window.location.pathname;
    return sessionStorage.getItem('cameFrom:' + currentPath) || null;
  } catch (err) {
    return null;
  }
}

// 페이지 안의 "평범한" <a href> 링크(js-nav-effect처럼 자체 처리하는
// 링크 제외)도 전부 자동으로 이 페이드를 타도록 전역에서 한 번만 감시
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href]');
  if (!link) return;

  // 이미 자체적으로 이동을 처리하는 링크는 건드리지 않음
  if (link.classList.contains('js-nav-effect')) return;

  const href = link.getAttribute('href');
  if (!href) return;

  // 페이지 내 앵커(#), 전화/메일 링크, 새 탭으로 열기, 수정키를 누른 클릭은
  // 원래 브라우저 동작 그대로 두는 게 맞음 (페이드로 가로챌 필요 없음)
  if (
    href.startsWith('#') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:') ||
    link.target === '_blank' ||
    e.metaKey || e.ctrlKey || e.shiftKey || e.altKey
  ) {
    return;
  }

  e.preventDefault();
  navigateTo(href);
});

/* ==========================================================
   기능 B: 클릭 시 mp3를 재생하는 로직
   - .js-sfx 클래스가 붙은 버튼/이미지에만 동작
   - data-sound 속성에 mp3 경로를 지정
   - 상태(클래스) 변경 로직을 전혀 모름 → 완전히 독립적
========================================================== */
function initClickSound() {
  document.querySelectorAll('.js-sfx').forEach((btn) => {
    const src = btn.dataset.sound;
    if (!src) return;

    // 미리 하나 만들어두면 브라우저가 파일을 캐시해둬서 첫 재생도 빠름
    const template = new Audio(ASSET_BASE + src);
    template.preload = 'auto';

    // 터치 기기에서 touchend와 합성 click이 겹쳐 발생하는 "고스트 클릭" 등으로
    // 아주 짧은 간격 안에 클릭이 두 번 잡히면 소리도 두 번 나던 문제 방지
    let lastPlayedAt = 0;

    btn.addEventListener('click', () => {
      const now = Date.now();
      if (now - lastPlayedAt < 300) return;
      lastPlayedAt = now;

      // 클릭마다 새 인스턴스로 재생 → 이전 재생이 끝나기 전에 다시
      // 클릭했을 때 currentTime 리셋/재생 요청이 서로 충돌해서
      // 소리가 씹히거나 아예 안 나는 문제(AbortError)를 방지
      const audio = template.cloneNode();

      // 같은 클릭 이벤트 안에서 initLinkEffect가 "진짜 재생 중인" 이
      // 인스턴스를 그대로 참조할 수 있도록 요소에 저장해둠
      btn.__sfxAudio = audio;

      audio.play().catch((err) => {
        // 브라우저 자동재생 정책 등으로 실패할 수 있음 (클릭 이벤트 안이라 보통은 통과)
        console.warn('사운드 재생 실패:', err);
      });
    });
  });
}

/* ==========================================================
   기능 C: 이미지를 클릭한 "그 순간" 이미지 자체를 교체하는 로직
   - .js-img-swap 클래스가 붙은 <img> 에만 동작
   - data-src-alt 로 바꿔 낄 이미지 경로를 지정 (클릭 시 활성화)
   - 페이지 내 하나만 활성화 상태를 유지 (토글 아님)
   - data-src-over 를 추가로 지정하면, 마우스를 올렸을 때(터치 제외)
     그 이미지로 미리보기처럼 바뀌었다가 벗어나면 원래대로 돌아옴.
     단, 이미 클릭돼서 활성화(is-swapped)된 상태에서는 오버가 안 먹힘
   - 사운드(js-sfx) 로직을 전혀 모름 → 완전히 독립적
========================================================== */
function initImageSwap() {
  const swapImgs = Array.from(document.querySelectorAll('.js-img-swap'));

  swapImgs.forEach((img) => {
    img.dataset.originalSrc = img.getAttribute('src'); // 원본 경로 저장

    // 오버(마우스 올림) 이미지가 있으면 미리 로드해둠 (클릭 이미지도 함께)
    // — 실제 마우스를 올리는 순간 로딩 지연으로 원본이 잠깐 스치는 문제 방지
    // data-src-on은 기능 V/H(정답 고르기, 카드 찾기)가 쓰는 활성 이미지라
    // 여기서 같이 챙겨둬야 첫 클릭 때 원본이 한 프레임 스치지 않음
    [img.dataset.srcOver, img.dataset.srcAlt, img.dataset.srcOn].forEach((src) => {
      if (src) new Image().src = src;
    });

    // 오버 기능: data-src-over가 있을 때만 동작. 이미 클릭돼서 활성화된
    // (is-swapped) 상태에서는 오버가 끼어들지 않게 함
    if (img.dataset.srcOver) {
      img.addEventListener('pointerenter', (e) => {
        if (e.pointerType === 'touch') return; // 터치는 호버 개념이 없음
        if (img.classList.contains('is-swapped')) return;
        img.src = img.dataset.srcOver;
      });
      img.addEventListener('pointerleave', () => {
        if (img.classList.contains('is-swapped')) return;
        img.src = img.dataset.originalSrc;
      });
    }

    if (!img.dataset.srcAlt) return;

    img.addEventListener('click', () => {

      // 나 자신을 제외한, 활성화(스왑)돼 있던 다른 이미지들은 원복
      swapImgs.forEach((other) => {
        if (other !== img && other.classList.contains('is-swapped')) {
          other.classList.remove('is-swapped');
          other.src = other.dataset.originalSrc;
        }
      });

      // 나 자신은 토글이 아니라 "활성화"만 시킴 (이미 활성 상태면 그대로 유지)
      if (!img.classList.contains('is-swapped')) {
        img.classList.add('is-swapped');
        img.src = img.dataset.srcAlt;
      }
    });
  });
}

/* ==========================================================
   기능 D: <a class="js-nav-effect"> 를 클릭했을 때
           안쪽 이미지의 교체/사운드 효과가 끝난 뒤에 페이지 이동
   예시 마크업:
     <a href="page02.html" class="js-nav-effect">
       <img class="js-img-swap js-sfx"
            src="img/a.png" data-src-alt="img/a_on.png"
            data-sound="sound/click.mp3" alt="">
     </a>
   - 이미지 교체(js-img-swap)와 사운드 재생(js-sfx)은 각자의
     독립 모듈(initImageSwap, initClickSound)이 그대로 처리함
     → 여기서는 절대 직접 재생/교체하지 않음 (중복 방지)
   - 이 함수는 initClickSound가 만든 "실제 재생 중인" Audio의
     ended 이벤트를 기다렸다가 이동만 담당 (duration 추정 X)
   - data-sound가 a 태그 자신에게 있어도, 안쪽 요소에 있어도 둘 다 지원
   - href="javascript:history.back();" 인 뒤로가기 버튼은 특별 처리:
     실제 history.back()을 타지 않고 document.referrer로 이동시켜서
     bfcache 복원 때 생기는 화면 깜빡임을 피함.
     data-fallback="다른주소.html" 을 주면 referrer가 없을 때 그리로 이동
     (기본값은 index.html)
   - href="javascript:prev();" / "javascript:next();": 헤더 이전/다음 버튼.
     같은 폴더의 pageNN-1 / pageNN+1로 이동(이전은 page01이면 그 차시의 단원 선택 화면 gateNN으로)
========================================================== */
// prev()/next(): sa|gwa/<차시>/pageNN.html 안에서 같은 폴더의 pageNN∓1로 이동.
// 이전은 page01이면 단원 선택 화면(gateNN.html)으로. 차시 폴더 밖이면 null(호출부가 fallback 처리)
function stepPageHref(delta) {
  const m = window.location.pathname.match(/\/(sa|gwa)\/\d+\/page(\d+)\.html$/);
  if (!m) return null;
  const n = parseInt(m[2], 10) + delta;
  // page01의 이전은 그 차시가 든 단원 선택 화면(gateNN). 단원당 차시 수: 사회 5 · 과학 3
  if (n < 1) {
    const lesson = parseInt(window.location.pathname.match(/\/(\d+)\/page\d+\.html$/)[1], 10);
    const unit = Math.ceil(lesson / (m[1] === 'sa' ? 5 : 3));
    return '../gate' + (unit < 10 ? '0' : '') + unit + '.html';
  }
  return 'page' + (n < 10 ? '0' : '') + n + '.html';
}

function initLinkEffect() {
  document.querySelectorAll('a.js-nav-effect').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault(); // 실제 이동은 아래에서 수동으로

      const rawHref = link.getAttribute('href');
      if (!rawHref) return;

      // "javascript:history.back();" 같은 뒤로가기는 실제 브라우저 히스토리를
      // 타면 bfcache 복원→새로고침 과정에서 화면이 잠깐 깜빡이는 문제가 있어서,
      // 대신 우리가 직접 기록해둔 "어디서 왔는지" 정보(getCameFrom)로 이동시킴.
      // 스택이 비어있으면 document.referrer, 그것도 없으면 data-fallback(기본 index.html).
      // → document.referrer는 로컬(file://)에서 비어있는 경우가 많아 스택을 우선함.
      const isHistoryBack = /^javascript:\s*history\.back\(\)/.test(rawHref);
      // "javascript:prev();" / "javascript:next();"는 헤더 이전/다음 버튼 공통 표시자.
      // 같은 폴더의 앞뒤 번호 페이지로 이동(stepPageHref). 마지막 페이지는 data-next로 랜딩을 지정
      const isPrev = /^javascript:\s*prev\(\)/.test(rawHref);
      const isNext = /^javascript:\s*next\(\)/.test(rawHref);
      const href = isHistoryBack
        ? (getCameFrom() || document.referrer || link.dataset.fallback || 'index.html')
        : isPrev
        ? (stepPageHref(-1) || getCameFrom() || document.referrer || link.dataset.fallback || 'index.html')
        : isNext
        ? (stepPageHref(1) || link.dataset.fallback || 'index.html')
        : rawHref;

      // data-sound는 a 자신 또는 안쪽 요소(img 등) 어디에 있어도 찾음
      const soundEl = link.hasAttribute('data-sound')
        ? link
        : link.querySelector('[data-sound]');

      let navigated = false;
      const goNow = () => {
        if (navigated) return;
        navigated = true;
        navigateTo(href, { isBack: isHistoryBack || isPrev });
      };


      if (!soundEl) {
        // 사운드가 아예 없으면 이미지 전환이 눈에 보일 최소 시간만 주고 이동
        setTimeout(goNow, 300);
        return;
      }

      // initClickSound가 이 클릭에서 방금 만든 "실제 재생 중인" Audio를 그대로 사용.
      // (재생 시간을 별도로 추정하지 않음 — mp3는 duration이 로드 초반에
      //  NaN/Infinity로 잡히는 경우가 흔해서, 추정치로 기다리면 소리가
      //  채 나기도 전에 페이지가 넘어가 버리는 문제가 있었음)
      const audio = soundEl.__sfxAudio;

      if (audio) {
        audio.addEventListener('ended', goNow);
        audio.addEventListener('error', goNow);
        // 안전장치: 어떤 이유로든 ended가 안 오는 경우를 대비한 최대 대기시간
        setTimeout(goNow, 4000);
      } else {
        // js-sfx가 없어서 재생 중인 인스턴스를 못 찾은 경우 → 최소 대기 후 이동
        setTimeout(goNow, 300);
      }
    });
  });
}

/* ==========================================================
   기능 E: OX 퀴즈
   - .ox-quiz 컨테이너 안의 O/X 이미지(.ox-btn) 중 하나를 클릭하면
     정답이면 정답 레이어, 오답이면 오답 레이어가 2초간 떴다가 사라짐
   예시 마크업:
     <div class="ox-quiz" data-answer="o" data-next="page10.html">
       <img class="ox-btn" data-value="o" src="img/o.png" alt="O">
       <img class="ox-btn" data-value="x" src="img/x.png" alt="X">
     </div>
     <div class="ox-result-correct is-off" data-sound="sound/correct.mp3">
       <img src="img/correct.png" alt="정답"></div>
     <div class="ox-result-wrong is-off" data-sound="sound/incorrent.mp3">
       <img src="img/wrong.png" alt="오답"></div>
   - 레이어에 data-sound를 지정하면 뜰 때 해당 mp3가 같이 재생됨 (선택)
   - .ox-quiz 에 data-next="page10.html" 을 지정해두면, 정답을 맞혔을 때
     정답 레이어가 2초간 뜬 뒤 그 페이지로 자동 이동함 (지정 안 하면 이동 없음)
   - 다른 기능(js-sfx, js-img-swap 등)을 전혀 모름 → 완전히 독립적
     (소리도 같이 나게 하고 싶으면 .ox-btn 에 js-sfx 클래스만 추가하면 됨)
========================================================== */
function initOxQuiz() {
  const correctLayer = document.querySelector('.ox-result-correct');
  const wrongLayer = document.querySelector('.ox-result-wrong');

  // 레이어별로 사운드를 미리 하나씩 만들어두고, 재생할 땐 클론해서 사용
  // (initClickSound와 같은 방식 — 연타해도 재생이 서로 끊기지 않게)
  const prepareSound = (layer) => {
    if (!layer || !layer.dataset.sound) return null;
    const audio = new Audio(ASSET_BASE + layer.dataset.sound);
    audio.preload = 'auto';
    return audio;
  };
  const correctSound = prepareSound(correctLayer);
  const wrongSound = prepareSound(wrongLayer);

  const playSound = (template) => {
    if (!template) return;
    const audio = template.cloneNode();
    audio.play().catch((err) => console.warn('사운드 재생 실패:', err));
  };

  const showLayer = (layer, sound) => {
    if (!layer) return;
    layer.classList.remove('is-off');
    playSound(sound);

    clearTimeout(layer.__hideTimer); // 연타 시 타이머 겹치지 않게 초기화
    layer.__hideTimer = setTimeout(() => {
      layer.classList.add('is-off');
    }, 2000);
  };

  document.querySelectorAll('.ox-quiz').forEach((quiz) => {
    const answer = quiz.dataset.answer; // "o" 또는 "x"

    quiz.querySelectorAll('.ox-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const isCorrect = btn.dataset.value === answer;
        showLayer(
          isCorrect ? correctLayer : wrongLayer,
          isCorrect ? correctSound : wrongSound
        );

        // 정답이면 팝업이 떠 있는 2초 뒤, data-next 페이지로 자동 이동
        if (isCorrect && quiz.dataset.next) {
          setTimeout(() => navigateTo(quiz.dataset.next), 2000);
        }
      });
    });
  });
}

/* ==========================================================
   기능 F: 카드를 드래그해서 정답존에 놓는 퀴즈
   - .dnd-card 를 드래그해서 .dnd-zone 위에 놓으면
     · 정답 카드(data-correct="true")면 그 존 자리에 딱 맞춰 고정됨 (레이어 없음)
     · 오답 카드거나 존 밖에 놓으면 원래 위치로 복귀, (존 위였다면) 오답 레이어 2초
   - 정답존은 여러 개 있어도 특정 카드-존 매칭이 없어 "아무 빈 존"에
     들어가면 성공 처리됨 (순서 상관없음)
   - .dnd-zone 에 data-next="page11.html" 을 지정해두면, 모든 존이
     다 채워졌을 때(=카드를 다 맞췄을 때) correct.mp3가 끝난 뒤
     자동으로 해당 페이지로 이동함 (지정 안 하면 이동 없음)
   - 카드가 .step-flow 안의 .step-panel 안에 있으면, data-next 유무와
     상관없이 다음 스텝이 있는 경우 그쪽으로 자동 전환됨(advancePanelOrNavigate)
     → 스텝 안에 넣기만 하면 "정답 맞히면 다음 스텝" 이 자동으로 됨
   - 정답 사운드도 스텝 안이냐 아니냐로 자동 구분됨: 일반 페이지는
     correct.mp3, .step-panel 안이면 click.mp3
   예시 마크업:
     <div class="dnd-card" data-correct="true"><img src="img/a.png" alt=""></div>
     <div class="dnd-card" data-correct="false"><img src="img/b.png" alt=""></div>
     <div class="dnd-zone" data-next="page11.html"></div>
     <div class="dnd-zone" data-next="page11.html"></div>
     <div class="dnd-result-wrong is-off" data-sound="sound/incorrent.mp3"><img ...></div>
   - 다른 기능(js-sfx 등)을 몰라도 되는 완전히 독립적인 모듈
========================================================== */
function initDragQuiz() {
  const cards = Array.from(document.querySelectorAll('.dnd-card'));
  const zones = Array.from(document.querySelectorAll('.dnd-zone'));
  if (!cards.length || !zones.length) return;

  const wrongLayer = document.querySelector('.dnd-result-wrong');

  const soundOf = (layer) => {
    if (!layer || !layer.dataset.sound) return null;
    const audio = new Audio(ASSET_BASE + layer.dataset.sound);
    audio.preload = 'auto';
    return audio;
  };
  const wrongSound = soundOf(wrongLayer);

  // 정답 카드가 존에 맞아 들어갔을 때 재생할 사운드
  // (일반 페이지는 correct.mp3, .step-panel 안의 스텝일 때만 click.mp3)
  const correctSound = new Audio(ASSET_BASE + 'sound/correct.mp3');
  correctSound.preload = 'auto';
  const correctSoundStep = new Audio(ASSET_BASE + 'sound/click.mp3');
  correctSoundStep.preload = 'auto';

  const showLayer = (layer, sound) => {
    if (!layer) return;
    layer.classList.remove('is-off');
    if (sound) {
      sound.cloneNode().play().catch((err) => console.warn('사운드 재생 실패:', err));
    }
    clearTimeout(layer.__hideTimer); // 연속 시도 시 타이머 겹치지 않게 초기화
    layer.__hideTimer = setTimeout(() => layer.classList.add('is-off'), 2000);
  };

  const rectOf = (el) => ({
    left: el.offsetLeft,
    top: el.offsetTop,
    right: el.offsetLeft + el.offsetWidth,
    bottom: el.offsetTop + el.offsetHeight,
  });

  const overlaps = (a, b) =>
    !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);

  const placeInZone = (card, zone) => {
    card.style.left = `${zone.offsetLeft + (zone.offsetWidth - card.offsetWidth) / 2}px`;
    card.style.top = `${zone.offsetTop + (zone.offsetHeight - card.offsetHeight) / 2}px`;
  };

  cards.forEach((card) => {
    // 드래그 시작 전, 카드의 원래 위치를 저장해둠 (오답 시 복귀용)
    // offsetLeft/offsetTop은 카드가 display:none인 부모(숨겨진 스텝 패널) 안에
    // 있으면 0으로 잡혀버리는 문제가 있어서, 마크업에 적어둔 인라인
    // style.left/top 값을 그대로 파싱해서 씀 (숨김 상태와 무관하게 정확함)
    card.dataset.homeLeft = parseFloat(card.style.left) || 0;
    card.dataset.homeTop = parseFloat(card.style.top) || 0;
    card.style.touchAction = 'none'; // 터치로 드래그할 때 화면 스크롤 방지

    // 이미지의 기본 브라우저 드래그(고스트 이미지)를 막아서
    // 우리가 만든 pointer 기반 드래그와 충돌하지 않게 함
    card.querySelectorAll('img').forEach((img) => {
      img.draggable = false;
    });
    card.addEventListener('dragstart', (e) => e.preventDefault());

    let dragging = false;
    let startX = 0, startY = 0, startLeft = 0, startTop = 0;

    // pointermove는 고주사율 화면에서 초당 120번까지 들어옴. 그때마다 left/top을
    // 바로 쓰면 매번 레이아웃이 다시 계산됨 → 좌표만 담아두고 다음 프레임에 한 번만 씀
    let pendingX = 0, pendingY = 0, moveFrame = 0;

    const flushMove = () => {
      moveFrame = 0;
      if (!dragging) return;
      card.style.left = `${pendingX}px`;
      card.style.top = `${pendingY}px`;
    };

    card.addEventListener('pointerdown', (e) => {
      if (card.dataset.placed === 'true') return; // 이미 정답 처리된 카드는 다시 못 움직이게
      dragging = true;
      card.setPointerCapture(e.pointerId);
      startX = e.clientX;
      startY = e.clientY;
      startLeft = card.offsetLeft;
      startTop = card.offsetTop;
      card.style.zIndex = 1000;
    });

    card.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      // 화면 이동량을 현재 스케일로 나눠서 스테이지 좌표계 이동량으로 변환
      const dx = (e.clientX - startX) / currentScale;
      const dy = (e.clientY - startY) / currentScale;
      pendingX = startLeft + dx;
      pendingY = startTop + dy;
      if (!moveFrame) moveFrame = requestAnimationFrame(flushMove);
    });

    const endDrag = () => {
      if (!dragging) return;

      // 아직 반영 안 된 이동분이 남아있으면 지금 바로 써줌 —
      // 아래 rectOf(card)가 손을 뗀 진짜 위치를 읽어야 정답 판정이 맞음
      if (moveFrame) {
        cancelAnimationFrame(moveFrame);
        moveFrame = 0;
        card.style.left = `${pendingX}px`;
        card.style.top = `${pendingY}px`;
      }

      dragging = false;
      card.style.zIndex = '';

      const cardRect = rectOf(card);
      const targetZone = zones.find(
        (zone) => zone.dataset.filled !== 'true' && overlaps(cardRect, rectOf(zone))
      );

      if (targetZone && card.dataset.correct === 'true') {
        card.dataset.placed = 'true';       // 먼저 상태를 바꿔서 CSS 크기 변경을 적용시키고
        placeInZone(card, targetZone);      // 바뀐 크기 기준으로 중앙 정렬
        targetZone.dataset.filled = 'true';

        const soundToPlay = card.closest('.step-panel') ? correctSoundStep : correctSound;
        const soundInstance = soundToPlay.cloneNode();
        soundInstance.play().catch((err) => console.warn('사운드 재생 실패:', err));

        // 모든 정답존이 채워졌는지 확인 → 다 채워졌으면 사운드가 끝난 뒤 이동
        const allFilled = zones.every((z) => z.dataset.filled === 'true');
        if (allFilled) {
          const nextHref = zones.map((z) => z.dataset.next).find(Boolean);
          let navigated = false;
          const goNow = () => {
            if (navigated) return;
            navigated = true;
            advancePanelOrNavigate(card, nextHref);
          };
          soundInstance.addEventListener('ended', goNow);
          soundInstance.addEventListener('error', goNow);
          setTimeout(goNow, 4000); // 안전장치: ended가 안 오는 경우 대비
        }
      } else {
        card.style.left = `${card.dataset.homeLeft}px`;
        card.style.top = `${card.dataset.homeTop}px`;
        if (targetZone) {
          // 정답존 위에 놨는데 오답 카드였던 경우에만 오답 레이어 표시
          showLayer(wrongLayer, wrongSound);
        }
      }
    };

    card.addEventListener('pointerup', endDrag);
    card.addEventListener('pointercancel', endDrag);
  });
}

/* ==========================================================
   기능 G: 좌우 박스의 "점"을 선으로 이어서 짝을 맞추는 퀴즈
   - 각 박스 안의 .line-dot 를 드래그해서 반대쪽 박스의 .line-dot에
     놓으면 같은 data-id 끼리면 선이 고정되고, 다르면 선이 지워지며
     오답 레이어가 2초 표시됨
   예시 마크업:
     <div class="line-quiz" data-next="page11.html">
       <div class="line-item left"  data-id="1" style="left:100px; top:120px;">
         사과<span class="line-dot"></span>
       </div>
       ...
       <div class="line-item right" data-id="1" style="left:1600px; top:440px;">
         <span class="line-dot"></span>Apple
       </div>

       <svg class="line-quiz-svg" width="1920" height="1080"></svg>
     </div>
     <div class="line-result-correct is-off">
       <img src="img/complete.png" alt="정답">
       <button class="line-result-next">다음</button>
     </div>
     <div class="line-result-wrong is-off" data-sound="sound/incorrent.mp3"><img ...></div>
   - .line-quiz 에 data-next="page11.html" 을 지정해두면, 모든 짝이
     다 맞춰졌을 때 .line-result-correct 레이어가 뜨고 계속 유지됨.
     그 안의 .line-result-next 버튼을 누르면 그제서야 그 페이지로 이동
     (data-next가 없으면 버튼을 눌러도 이동하지 않고 팝업만 유지)
   - 다른 기능(js-sfx 등)을 몰라도 되는 완전히 독립적인 모듈
     (스케일 대응도 currentScale에 기대지 않고, svg 자체의 렌더링
      크기를 재서 자체적으로 계산함)
========================================================== */
function initLineMatchQuiz() {
  const container = document.querySelector('.line-quiz');
  if (!container) return;

  const svg = container.querySelector('.line-quiz-svg');
  const svgW = Number(svg.getAttribute('width')) || 1920;
  const svgH = Number(svg.getAttribute('height')) || 1080;
  const leftDots = Array.from(container.querySelectorAll('.line-item.left .line-dot'));

  const correctLayer = document.querySelector('.line-result-correct');
  const wrongLayer = document.querySelector('.line-result-wrong');
  const wrongSound = (() => {
    if (!wrongLayer || !wrongLayer.dataset.sound) return null;
    const audio = new Audio(ASSET_BASE + wrongLayer.dataset.sound);
    audio.preload = 'auto';
    return audio;
  })();

  // 정답으로 연결됐을 때 재생할 사운드
  const correctSound = new Audio(ASSET_BASE + 'sound/correct.mp3');
  correctSound.preload = 'auto';

  const showWrong = () => {
    if (!wrongLayer) return;
    wrongLayer.classList.remove('is-off');
    if (wrongSound) {
      wrongSound.cloneNode().play().catch((err) => console.warn('사운드 재생 실패:', err));
    }
    clearTimeout(wrongLayer.__hideTimer);
    wrongLayer.__hideTimer = setTimeout(() => wrongLayer.classList.add('is-off'), 2000);
  };

  // 퀴즈를 다 맞췄을 때: 정답 레이어를 계속 띄워두고,
  // 그 안의 "다음" 버튼(.line-result-next)을 누르면 그때 이동
  const showComplete = (nextHref) => {
    if (correctLayer) correctLayer.classList.remove('is-off');

    const nextBtn = correctLayer ? correctLayer.querySelector('.line-result-next') : null;
    if (nextBtn && nextHref) {
      // 여러 번 완료될 일은 없지만, 혹시 몰라 리스너 중복 방지
      nextBtn.onclick = () => {
        // 버튼 안쪽에 js-img-swap/js-sfx가 있으면(예: <img>) 그 효과가
        // 먼저 보이도록, initClickSound가 만든 "실제 재생 중인" 오디오의
        // ended 이벤트를 기다렸다가 이동함 (즉시 이동 X)
        const soundEl = nextBtn.hasAttribute('data-sound')
          ? nextBtn
          : nextBtn.querySelector('[data-sound]');
        const audio = soundEl ? soundEl.__sfxAudio : null;

        let navigated = false;
        const goNow = () => {
          if (navigated) return;
          navigated = true;
          navigateTo(nextHref);
        };

        if (audio) {
          audio.addEventListener('ended', goNow);
          audio.addEventListener('error', goNow);
          setTimeout(goNow, 4000); // 안전장치: ended가 안 오는 경우 대비
        } else {
          // 사운드가 없으면 이미지 전환이 눈에 보일 최소 시간만 주고 이동
          setTimeout(goNow, 300);
        }
      };
    }
  };

  // 드래그하는 동안 svg의 화면상 크기는 변하지 않는데, getBoundingClientRect는
  // 부를 때마다 브라우저가 레이아웃을 강제로 다시 계산함. 선을 끄는 내내 매
  // pointermove마다 그게 일어나므로 pointerdown 때 한 번만 재서 재사용함
  let svgRect = null;
  window.addEventListener('resize', () => { svgRect = null; });

  // 화면 좌표 → svg 자체 좌표계(1920x1080)로 변환 (svg 렌더링 크기를 직접 재서 계산)
  const toSvgPoint = (clientX, clientY) => {
    const box = svgRect || svg.getBoundingClientRect();
    return {
      x: ((clientX - box.left) / box.width) * svgW,
      y: ((clientY - box.top) / box.height) * svgH,
    };
  };

  const centerOf = (el) => {
    const box = el.getBoundingClientRect();
    return toSvgPoint(box.left + box.width / 2, box.top + box.height / 2);
  };

  let tempLine = null;
  let startDot = null;

  // 놓았을 때 이 반경(스테이지 좌표 기준 px) 안에 있는 점 중 가장 가까운
  // 것을 정답 후보로 인정 → 정확히 점을 못 맞춰도 근처에만 놓으면 인식됨
  const HIT_RADIUS = 70;
  const rightDots = Array.from(container.querySelectorAll('.line-item.right .line-dot'));

  const removeTempLine = () => {
    if (tempLine) {
      tempLine.remove();
      tempLine = null;
    }
  };

  leftDots.forEach((dot) => {
    const item = dot.closest('.line-item');
    dot.style.touchAction = 'none';

    dot.addEventListener('pointerdown', (e) => {
      if (item.dataset.matched === 'true') return;
      startDot = dot;
      dot.setPointerCapture(e.pointerId);
      svgRect = svg.getBoundingClientRect();

      const start = centerOf(dot);
      tempLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      tempLine.setAttribute('x1', start.x);
      tempLine.setAttribute('y1', start.y);
      tempLine.setAttribute('x2', start.x);
      tempLine.setAttribute('y2', start.y);
      tempLine.setAttribute('class', 'line-quiz-temp');
      svg.appendChild(tempLine);
    });

    dot.addEventListener('pointermove', (e) => {
      if (!tempLine || startDot !== dot) return;
      const p = toSvgPoint(e.clientX, e.clientY);
      tempLine.setAttribute('x2', p.x);
      tempLine.setAttribute('y2', p.y);
    });

    const endDrag = (e) => {
      if (!tempLine || startDot !== dot) return;

      // 놓은 지점 근처에서 가장 가까운 오른쪽 점을 찾음 (정확히 점 위가 아니어도 됨)
      const releasePoint = toSvgPoint(e.clientX, e.clientY);
      let rightDot = null;
      let nearestDist = Infinity;
      rightDots.forEach((rd) => {
        const c = centerOf(rd);
        const dist = Math.hypot(c.x - releasePoint.x, c.y - releasePoint.y);
        if (dist < nearestDist) {
          nearestDist = dist;
          rightDot = rd;
        }
      });
      if (nearestDist > HIT_RADIUS) rightDot = null; // 반경 밖이면 후보 무효

      const rightItem = rightDot ? rightDot.closest('.line-item.right') : null;

      if (
        rightItem &&
        rightItem.dataset.id === item.dataset.id &&
        rightItem.dataset.matched !== 'true'
      ) {
        // 정답: 선을 오른쪽 점 중심에 고정하고 양쪽 다 matched 처리
        const end = centerOf(rightDot);
        tempLine.setAttribute('x2', end.x);
        tempLine.setAttribute('y2', end.y);
        tempLine.setAttribute('class', 'line-quiz-line');
        item.dataset.matched = 'true';
        rightItem.dataset.matched = 'true';
        tempLine = null; // 고정됐으니 더 이상 임시선이 아님

        correctSound.cloneNode().play().catch((err) => console.warn('사운드 재생 실패:', err));

        // 모든 짝이 다 맞춰졌는지 확인 → 다 맞췄으면 0.5초 뒤 정답 팝업(다음 버튼 포함) 표시
        const allMatched = leftDots.every((d) => d.closest('.line-item').dataset.matched === 'true');
        if (allMatched) {
          setTimeout(() => showComplete(container.dataset.next), 500);
        }
      } else {
        // 오답(다른 점이거나 빈 곳에 놓음) → 선 지우고 오답 레이어
        removeTempLine();
        showWrong();
      }

      startDot = null;
    };

    dot.addEventListener('pointerup', endDrag);
    dot.addEventListener('pointercancel', () => {
      removeTempLine();
      startDot = null;
    });
  });
}

/* ==========================================================
   기능 H: 카드 여러 개 중 정답 카드를 찾는 퀴즈
   - .find-card를 클릭하면
     · 정답(data-correct="true")이면 그 카드 위에 O 표시가 뜨고 계속 남음
       (그 카드는 더 이상 반응 안 함), correct.mp3 재생
     · 오답이면 X 표시가 뜨고 2초 뒤 사라짐(다시 클릭 가능), incorrect.mp3 재생
   - 정답 카드를 전부 찾으면 0.5초 뒤 완료 팝업이 3초간 뜨고 사라지면서
     data-next 페이지로 자동 이동
   예시 마크업:
     <div class="find-progress">
       <img class="find-star" src="img/icon_star.png" data-src-on="img/icon_star_on.png" alt="">
       <img class="find-star" src="img/icon_star.png" data-src-on="img/icon_star_on.png" alt="">
       <img class="find-star" src="img/icon_star.png" data-src-on="img/icon_star_on.png" alt="">
     </div>
     <!-- .find-star 개수는 정답 개수(data-correct="true")와 맞춰서 넣으면 됨 -->
     <div class="find-quiz" data-next="page18.html">
       <div class="find-card" data-correct="true"  style="left:60px; top:200px;">
         <img src="img/card1.png" alt="">
       </div>
       <div class="find-card" data-correct="false" style="left:300px; top:200px;">
         <img src="img/card2.png" alt="">
       </div>
       ... 총 6개, 그 중 3개가 data-correct="true"
     </div>
     <div class="find-result-correct is-off"><img src="img/complete.png" alt=""></div>
   - 정답을 찾을 때마다 .find-progress 안의 별이 순서대로 하나씩
     icon_star.png → icon_star_on.png 로 바뀜 (data-src-on 기준)
   - 다른 기능(js-sfx 등)을 몰라도 되는 완전히 독립적인 모듈
     (자체적으로 O/X 표시를 만들고, 사운드도 직접 재생함)
========================================================== */
function initFindQuiz() {
  const container = document.querySelector('.find-quiz');
  if (!container) return;

  const cards = Array.from(container.querySelectorAll('.find-card'));
  const totalCorrect = cards.filter((c) => c.dataset.correct === 'true').length;

  const correctLayer = document.querySelector('.find-result-correct');
  const progressStars = Array.from(document.querySelectorAll('.find-progress .find-star'));

  const correctSound = new Audio(ASSET_BASE + 'sound/correct.mp3');
  correctSound.preload = 'auto';
  const wrongSound = new Audio(ASSET_BASE + 'sound/incorrect.mp3');
  wrongSound.preload = 'auto';

  // 정답을 다 찾았을 때: 완료 팝업을 3초간 띄운 뒤, 사라지면서 다음 페이지로 이동
  const showCompleteAndGo = (nextHref) => {
    if (correctLayer) correctLayer.classList.remove('is-off');
    setTimeout(() => {
      if (correctLayer) correctLayer.classList.add('is-off');
      if (nextHref) navigateTo(nextHref);
    }, 3000);
  };

  let foundCount = 0;

  cards.forEach((card) => {
    card.addEventListener('click', () => {
      if (card.dataset.resolved === 'true') return; // 정답 처리된 카드는 다시 반응 안 함

      // 이전에 떠 있던 표시(주로 X)가 남아있으면 정리
      const old = card.querySelector('.find-mark');
      if (old) old.remove();
      clearTimeout(card.__markTimer);

      const mark = document.createElement('div');
      mark.className = 'find-mark';

      if (card.dataset.correct === 'true') {
        mark.classList.add('find-mark-correct');
        mark.innerHTML = '<span class="hidden">O</span>';
        card.appendChild(mark);
        card.dataset.resolved = 'true'; // 더 이상 클릭 반응 안 하게

        correctSound.cloneNode().play().catch((err) => console.warn('사운드 재생 실패:', err));

        foundCount += 1;

        // 정답을 찾은 순서대로 별 하나씩 켜짐 (icon_star.png → icon_star_on.png)
        const star = progressStars[foundCount - 1];
        if (star && star.dataset.srcOn) star.src = star.dataset.srcOn;

        if (foundCount >= totalCorrect) {
          setTimeout(() => showCompleteAndGo(container.dataset.next), 500);
        }
      } else {
        mark.classList.add('find-mark-wrong');
        mark.innerHTML = '<span class="hidden">X</span>';
        card.appendChild(mark);

        wrongSound.cloneNode().play().catch((err) => console.warn('사운드 재생 실패:', err));

        card.__markTimer = setTimeout(() => mark.remove(), 2000);
      }
    });
  });
}

/* ==========================================================
   기능 I: 영상 위에 재생 버튼을 올려서 클릭하면 재생
   - .video-box 안의 <video>(.video-el) 위에 재생 버튼(.video-play-btn)을
     겹쳐두고, 버튼을 클릭하면 재생 시작 + 버튼은 사라짐
   - 영상을 직접 클릭해도 재생/일시정지 토글되고, 일시정지되거나
     끝나면 버튼이 다시 나타남 (별도의 컨트롤 바 없이도 조작 가능)
   예시 마크업:
     <div class="video-box" style="left:289px; top:24px; width:1310px; height:745px;">
       <video class="video-el" src="video/video.mp4"
              style="width:100%; height:100%; border:solid 14px #1b1738;
                     object-fit:cover; border-radius:16px;"></video>
       <img class="video-play-btn" src="img/btn_play.png" alt="재생">
     </div>
   - 다른 기능(js-sfx 등)을 몰라도 되는 완전히 독립적인 모듈
========================================================== */
function initVideoPlay() {
  document.querySelectorAll('.video-box').forEach((box) => {
    const video = box.querySelector('.video-el');
    const btn = box.querySelector('.video-play-btn');
    if (!video || !btn) return;

    const showBtn = () => btn.classList.remove('is-hidden');
    const hideBtn = () => btn.classList.add('is-hidden');

    btn.addEventListener('click', () => {
      video.play();
    });

    // 영상 자체를 클릭해도 재생/일시정지 토글되게
    video.addEventListener('click', () => {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', hideBtn);
    video.addEventListener('pause', showBtn);
    video.addEventListener('ended', showBtn);
  });
}

/* ==========================================================
   기능 J: 자식 요소들을 하나씩 순서대로 페이드인 시킴
   - .reveal-stagger 컨테이너의 직계 자식들은 처음엔 투명하다가,
     data-interval(ms, 기본 1000)마다 하나씩 opacity가 0→1로 페이드인됨
   - data-delay(ms, 기본 0)만큼 지난 뒤 첫 번째 자식부터 시작함
   - .step-panel 안에 있으면 그 패널이 실제로 보이는 시점부터
     시간을 세기 시작함(whenVisible)
   예시 마크업:
     <div class="answer-pick-quiz reveal-stagger" data-delay="0" data-interval="1000">
       <button class="answer-pick">...</button>
       <button class="answer-pick">...</button>
       <button class="answer-pick">...</button>
     </div>
   - 다른 기능을 몰라도 되는 완전히 독립적인 모듈
========================================================== */
function initRevealStagger() {
  document.querySelectorAll('.reveal-stagger').forEach((container) => {
    const children = Array.from(container.children);
    if (!children.length) return;

    children.forEach((child) => child.classList.add('reveal-stagger-item'));

    const delay = parseInt(container.dataset.delay, 10) || 0;
    const interval = parseInt(container.dataset.interval, 10) || 1000;

    whenVisible(container, () => {
      children.forEach((child, i) => {
        setTimeout(() => child.classList.add('is-revealed'), delay + i * interval);
      });
    });
  });
}

/* ==========================================================
   기능 K: 스크롤 박스를 끝까지 내려야 다음 버튼이 나타남
   - .custom-scrollbar(스크롤 영역)를 바닥까지 내리면
     같은 페이지의 .js-nav-effect 버튼에 is-visible 클래스가 붙음
   - 페이지마다 셀렉터(.page07 등)가 다를 수 있어서, 이 함수는
     "요소가 그 페이지에 있을 때만" 동작하고 없으면 조용히 넘어감
   - is-visible 클래스에 맞는 보이기/숨기기 CSS는 별도로 필요함
     (예: .js-nav-effect { opacity:0; pointer-events:none; }
          .js-nav-effect.is-visible { opacity:1; pointer-events:auto; })
========================================================== */
function initScrollToShowNav() {
  const scrollBox = document.querySelector('.page07 .custom-scrollbar');
  const navBtn = document.querySelector('.page07 .js-nav-effect');
  if (!scrollBox || !navBtn) return; // 이 페이지엔 해당 요소가 없음 → 그냥 종료

  function checkScrollBottom() {
    const { scrollTop, scrollHeight, clientHeight } = scrollBox;
    const isBottom = scrollTop + clientHeight >= scrollHeight - 2; // 오차 보정용 -2px
    // 한 번 바닥에 닿아서 보이면, 다시 위로 스크롤해도 계속 보이게 유지 (toggle 아님)
    if (isBottom) navBtn.classList.add('is-visible');
  }

  scrollBox.addEventListener('scroll', checkScrollBottom);
  checkScrollBottom(); // 스크롤 없이도 이미 내용이 다 보이는 경우 대비
}

/* ==========================================================
   기능 L: 손가락 터치 안내 애니메이션 (1-2-1-2-1-2-1 순서로 보여준 뒤 사라짐)
   - .finger-guide 이미지가 img_finger01.png ↔ img_finger02.png를
     번갈아 보여주면서 손가락으로 톡톡 터치하는 느낌을 냄
   예시 마크업:
     <img class="finger-guide"
          src="img/img_finger01.png"
          data-frame1="img/img_finger01.png"
          data-frame2="img/img_finger02.png"
          data-interval="400"
          style="position:absolute; left:800px; top:500px; width:120px;">
   - data-interval: 프레임 전환 간격(ms), 기본 400ms
   - data-loop="true" 를 주면 한 번 보여준 뒤 잠깐 쉬었다가 계속 반복
   - data-taps: 누르는 횟수(기본 3번)
     (기본은 1-2-1-2-1-2-1 딱 한 번만 보여주고 사라짐)
   - 다른 기능(js-sfx 등)을 몰라도 되는 완전히 독립적인 모듈
========================================================== */
function initFingerGuide() {
  document.querySelectorAll('.finger-guide').forEach((img) => {
    // pointFingerAt이 새 손가락마다 다시 부르므로, 이미 돌고 있는 손가락에 타이머가 겹치지 않게 막음
    if (img.__fingerInit) return;
    img.__fingerInit = true;

    const frame1 = img.dataset.frame1 || img.getAttribute('src');
    const frame2 = img.dataset.frame2;
    if (!frame2) return; // 두 번째 이미지가 없으면 애니메이션할 수 없음

    const stepMs = Number(img.dataset.interval) || 400;
    const loop = img.dataset.loop === 'true';
    // 누르는 횟수(data-taps, 기본 3): 1-2를 그만큼 반복하고 1로 끝남(기본 1-2-1-2-1-2-1)
    const taps = Number(img.dataset.taps) || 3;
    const sequence = [];
    for (let t = 0; t < taps; t++) sequence.push(frame1, frame2);
    sequence.push(frame1);

    // 스텝이 넘어가서 이 안내가 든 패널이 다시 숨겨졌는지 확인.
    // data-loop="true"인 안내는 이 확인이 없으면 안 보이는 이미지를 페이지가
    // 닫힐 때까지 계속 교체하며 타이머를 물고 있음
    // DOM에서 지워진 손가락(pointFingerAt/clearFingers)도 같은 이유로 멈춤
    const panel = img.closest('.step-panel');
    const isPanelHidden = () => !img.isConnected || (!!panel && panel.classList.contains('is-hidden'));

    const playOnce = () => {
      img.classList.remove('is-hidden');
      let i = 0;
      img.src = sequence[0];

      const timer = setInterval(() => {
        if (isPanelHidden()) {
          clearInterval(timer);
          return;
        }
        i += 1;
        if (i >= sequence.length) {
          clearInterval(timer);
          if (loop) {
            if (!isPanelHidden()) setTimeout(playOnce, stepMs * 2); // 한 사이클 끝나면 잠깐 쉬었다가 반복
          } else {
            img.classList.add('is-hidden'); // 다 보여준 뒤 사라짐
            img.style.display = 'none'; // 페이지의 다른 CSS와 충돌해도 확실히 숨겨지도록 이중 처리
          }
          return;
        }
        img.src = sequence[i];
      }, stepMs);
    };

    // 숨겨진 스텝 패널 안에 있으면, 그 스텝이 실제로 보일 때까지 시작을 미룸
    whenVisible(img, playOnce);
  });
}

/* ==========================================================
   기능 M: 같은 페이지 안에서 순서대로 넘어가는 "스텝" 전환
   - .step-flow 안에 .step-panel 여러 개를 넣어두면, 처음엔 첫 번째만
     보이고 나머지는 숨겨짐
   - 각 스텝 안의 a.js-nav-effect 를 클릭하면:
     · 다음 스텝이 있으면 → initLinkEffect의 실제 페이지 이동과 똑같이,
       안쪽 js-sfx 사운드(보통 _on 이미지로 바뀐 버튼의 클릭음)가 끝날
       때까지 기다렸다가 현재 스텝을 숨기고 다음 스텝을 보여줌(사운드가
       없으면 최소 300ms만 대기). 이 대기가 없으면 이미지가 _on으로
       바뀐 바로 그 틱에 패널이 통째로 숨겨져서 _on 프레임이 아예 안
       보이고 바로 다음 스텝으로 넘어가 버림
     · 다음 스텝이 없으면(마지막 스텝) → 평소처럼 그 링크의
       href로 실제 페이지 이동 (initLinkEffect가 그대로 처리)
   예시 마크업:
     <div class="step-flow">
       <div class="step-panel page03-01">
         <a href="page04.html" class="js-nav-effect js-sfx" data-sound="sound/click.mp3">
           <span class="hidden">Google 렌즈</span>
         </a>
       </div>
       <div class="step-panel page03-02">
         <a href="page04.html" class="js-nav-effect js-sfx" data-sound="sound/click.mp3">
           <span class="hidden">Google 렌즈</span>
         </a>
       </div>
       <div class="step-panel page03-03">
         <a href="page04.html" class="js-nav-effect js-sfx" data-sound="sound/click.mp3">
           <span class="hidden">Google 렌즈</span>
         </a>
       </div>
     </div>
   - 반드시 initLinkEffect()보다 먼저 실행돼야 함: 마지막이 아닌 스텝의
     링크에서는 js-nav-effect 클래스를 미리 떼어내서, initLinkEffect가
     그 링크를 "진짜 이동 링크"로 착각해 페이지를 이동시키지 않게 함
     (js-sfx는 그대로 둬서 클릭 사운드는 계속 재생됨)
========================================================== */
function initStepFlow() {
  document.querySelectorAll('.step-flow').forEach((flow) => {
    const panels = Array.from(flow.querySelectorAll('.step-panel'));
    if (panels.length < 2) return; // 스텝이 하나뿐이면 할 일 없음

    panels.forEach((panel, index) => {
      // 첫 번째 스텝만 보이고 나머지는 숨김
      panel.classList.toggle('is-hidden', index !== 0);

      const nextPanel = panels[index + 1];
      if (!nextPanel) return; // 마지막 스텝: 실제 이동이 되게 그대로 둠

      panel.querySelectorAll('a.js-nav-effect').forEach((link) => {
        link.classList.remove('js-nav-effect'); // initLinkEffect가 이 링크는 안 건드리게

        link.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation(); // 전역 링크 가로채기(navigateTo)로 안 새어나가게

          const goNow = () => {
            panel.classList.add('is-hidden');
            nextPanel.classList.remove('is-hidden');
            nextPanel.dispatchEvent(new CustomEvent('step:visible'));
          };

          // initLinkEffect와 같은 방식: js-img-swap(_on 이미지)과 js-sfx 클릭음이
          // 눈/귀에 보일 시간 없이 같은 틱에 패널이 바로 숨겨져 버리는 문제가
          // 있어서, 실제 재생 중인 사운드가 끝날 때까지 전환을 미룸
          const soundEl = link.hasAttribute('data-sound')
            ? link
            : link.querySelector('[data-sound]');
          const audio = soundEl ? soundEl.__sfxAudio : null;

          if (audio) {
            let navigated = false;
            const proceed = () => {
              if (navigated) return;
              navigated = true;
              goNow();
            };
            audio.addEventListener('ended', proceed);
            audio.addEventListener('error', proceed);
            setTimeout(proceed, 4000); // 안전장치: ended가 안 오는 경우 대비
          } else {
            // 사운드가 없으면 이미지 전환이 눈에 보일 최소 시간만 주고 전환
            setTimeout(goNow, 300);
          }
        });
      });
    });
  });
}

/* ==========================================================
   기능 N: 손가락이 A지점 → B지점으로 스윽 이동하는 스와이프 안내
   - .swipe-guide-finger 이미지가 data-start-*에서 data-end-*로
     부드럽게 이동했다가, 순간이동으로 원위치 → 다시 이동을 반복
   - 지정한 횟수(기본 3번)만큼 반복하면 감싸고 있는 .swipe-guide
     컨테이너(배경 이미지 포함) 전체가 사라짐
   예시 마크업:
     <div class="swipe-guide" style="position:absolute;left:910px;top:400px;z-index:10">
       <img src="img/stage_bg_03_04.png" alt="">
       <img class="swipe-guide-finger" src="img/img_finger01.png" alt=""
            style="position:absolute;left:0px;top:85px;"
            data-start-left="0" data-start-top="85"
            data-end-left="400" data-end-top="48">
     </div>
   - data-move-ms(이동 시간, 기본 600), data-pause-ms(멈춰있는 시간, 기본 300),
     data-repeat(반복 횟수, 기본 3) 로 세부 조정 가능
   - 다른 기능(js-sfx 등)을 몰라도 되는 완전히 독립적인 모듈
========================================================== */
function initSwipeGuide() {
  document.querySelectorAll('.swipe-guide-finger').forEach((finger) => {
    const startLeft = Number(finger.dataset.startLeft) || 0;
    const startTop = Number(finger.dataset.startTop) || 0;
    const endLeft = Number(finger.dataset.endLeft) || 0;
    const endTop = Number(finger.dataset.endTop) || 0;
    const moveMs = Number(finger.dataset.moveMs) || 600;
    const pauseMs = Number(finger.dataset.pauseMs) || 300;
    const repeat = Number(finger.dataset.repeat) || 3;

    let cycle = 0;

    const runCycle = () => {
      // A → B로 부드럽게 이동
      finger.style.transition = `left ${moveMs}ms ease, top ${moveMs}ms ease`;
      finger.style.left = `${endLeft}px`;
      finger.style.top = `${endTop}px`;

      setTimeout(() => {
        cycle += 1;

        if (cycle >= repeat) {
          // 반복이 다 끝나면 배경 이미지까지 포함해서 전체를 숨김
          const wrap = finger.closest('.swipe-guide') || finger.parentElement;
          if (wrap) wrap.style.display = 'none';
          return;
        }

        // 트랜지션 없이 순간이동으로 원위치 (실제 손가락이 다시 짚는 느낌)
        finger.style.transition = 'none';
        finger.style.left = `${startLeft}px`;
        finger.style.top = `${startTop}px`;
        void finger.offsetWidth; // 강제 리플로우: 트랜지션 없는 상태를 확실히 적용

        setTimeout(runCycle, pauseMs);
      }, moveMs);
    };

    // 초기 위치를 확실히 잡아준 뒤, 스텝이 실제로 보일 때(또는 스텝 밖이면 바로)
    // 살짝 딜레이 후 애니메이션 시작
    finger.style.left = `${startLeft}px`;
    finger.style.top = `${startTop}px`;
    whenVisible(finger, () => setTimeout(runCycle, 200));
  });
}

/* ==========================================================
   기능 P: 목차 아이콘 클릭 → 하단에서 올라오는 전체화면 레이어
   - .js-toc-open 을 클릭하면 .toc-layer가 아래에서 위로 슬라이드
     되며 전체화면을 채움. 우측 상단 .toc-close로 닫음
   - 목차 내용은 "1차시~15차시" 아코디언, 펼치면 하위 01~06이
     한 줄에 2개씩 그리드로 나옴 (한 번에 하나만 펼쳐짐)
   - 목록이 길어서 .toc-body에 .custom-scrollbar를 그대로 적용
   예시 마크업:
     <img class="js-toc-open" src="img/btn_list.png" alt="목차" style="cursor:pointer;">

     <div class="toc-layer">
       <div class="toc-header">
         <img src="img/tit_toc.png" alt="목차">
         <button class="toc-close"><img src="img/btn_close.png" alt="닫기"></button>
       </div>
       <div class="toc-body custom-scrollbar">
         <div class="toc-accordion">
           <button class="toc-accordion-toggle">1차시</button>
           <div class="toc-accordion-panel">
             <a href="page01.html" class="toc-sub-item">01</a>
             <a href="page02.html" class="toc-sub-item">02</a>
             <a href="page03.html" class="toc-sub-item">03</a>
             <a href="page04.html" class="toc-sub-item">04</a>
             <a href="page05.html" class="toc-sub-item">05</a>
             <a href="page06.html" class="toc-sub-item">06</a>
           </div>
         </div>
         <!-- 2차시~15차시도 같은 구조로 반복 -->
       </div>
     </div>
   - 다른 기능(js-sfx 등)을 몰라도 되는 완전히 독립적인 모듈
     (닫기/열기 자체엔 사운드가 안 걸려있는데, 필요하면 열기/닫기
      버튼에 js-sfx + data-sound만 얹으면 됨)
========================================================== */
function initTocLayer() {
  const openBtn = document.querySelector('.js-toc-open');
  const layer = document.querySelector('.toc-layer');
  if (!openBtn || !layer) return;

  const closeBtn = layer.querySelector('.toc-close');

  openBtn.style.cursor = 'pointer';
  openBtn.addEventListener('click', () => {
    layer.classList.add('is-open');
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      layer.classList.remove('is-open');
    });
  }

  // 아코디언: 차시 제목을 클릭하면 하위 목록이 펼쳐짐/접힘 (한 번에 하나만 열림)
  const items = Array.from(layer.querySelectorAll('.toc-accordion'));
  items.forEach((item) => {
    const toggle = item.querySelector('.toc-accordion-toggle');
    if (!toggle) return;

    toggle.addEventListener('click', () => {
      const wasOpen = item.classList.contains('is-open');
      items.forEach((other) => other.classList.remove('is-open'));
      if (!wasOpen) item.classList.add('is-open');
    });
  });
}

/* ==========================================================
   기능 Q: 힌트 공개형 사진 퀴즈 (예: "이 직업은 무엇일까요?")
   - 배경 통이미지(main) 안에 힌트1~3 사진이 전부 미리 그려져 있고,
     힌트2/3 자리는 "다른 힌트 보기" 버튼 이미지(.p02-hint-btn 같은
     배경 이미지, 슬롯마다 같은 이미지 재사용)가 그 위를 덮고 있다가,
     클릭하면 버튼이 사라지면서 밑에 있던 실제 힌트 사진이 그대로
     드러나는 방식(별도로 "공개된 이미지"를 따로 안 만들어도 됨):
     · .hint-reveal-btn(다른 힌트 보기, 여러 개 있어도 됨)은 누른 것만
       사라짐(다른 슬롯엔 영향 없음, 슬롯별로 독립적)
     · .hint-card(정답 후보, 배경 이미지 위에 위치만 겹쳐둔 투명 버튼) 중
       data-correct="true"인 카드 하나만 정답(기획서 기준 스테이지당
       정답은 1개). 정답을 클릭하면 그 카드에 테두리(is-selected)가
       남고, 아직 안 눌러서 남아있던 .hint-reveal-btn이 있었다면 그것도
       자동으로 치워진 뒤 1초 뒤에 .hint-quiz-correct(정답 통이미지 +
       확인 버튼)가 덮임(이미 다 본 상태였다면 바로 덮임). 확인 버튼은
       보통 이미지 버튼(js-img-swap+js-nav-effect인 <a>)이라 이 함수가
       직접 다루지 않고, 그 안의 실제 링크(href=data-next와 같은 페이지)
       가 클릭을 처리함. data-correct="false" → .hint-quiz-wrong(오답
       통이미지)가 2초간 덮였다가 사라짐(다시 고를 수 있음). 정답을
       맞힌 뒤에는 카드가 더 이상 반응하지 않음
   - .hint-quiz-wrong은 전체 화면을 덮는 통이미지라 pointer-events:none을
     줘서 그 아래 카드가 계속 눌리게 하고, .hint-quiz-correct는 안에
     진짜 확인 버튼이 있으니 pointer-events:auto로 자기 자신만 되돌림
   예시 마크업:
     <div class="hint-quiz">
       <button class="hint-reveal-btn hit-area p02-hint-btn js-sfx" data-sound="sound/click.mp3"
               style="left:685px;top:200px" aria-label="다른 힌트 보기"></button>
       <button class="hint-reveal-btn hit-area p02-hint-btn js-sfx" data-sound="sound/click.mp3"
               style="left:1285px;top:200px" aria-label="다른 힌트 보기"></button>

       <div class="hint-cards">
         <button class="hint-card pick-card" data-correct="true" style="left:100px;top:560px;width:280px;height:300px" aria-label="소방관"></button>
         <button class="hint-card pick-card" data-correct="false" style="left:400px;top:560px;width:280px;height:300px" aria-label="웹툰작가"></button>
       </div>
     </div>
     <img class="hint-quiz-wrong is-off" data-sound="sound/incorrect.mp3" src="img/p02_wrong.png" alt="">
     <div class="hint-quiz-correct is-off" data-sound="sound/correct.mp3">
       <img src="img/p02_correct.png" alt="정답이에요!">
       <a href="page03.html" class="js-nav-effect hint-quiz-confirm">
         <img src="img/btn_confirm.png" class="js-img-swap js-sfx" data-src-alt="img/btn_confirm_on.png" data-src-over="img/btn_confirm_over.png" data-sound="sound/click.mp3" alt="확인">
       </a>
     </div>
   - .p02-hint-btn{background-image:url('img/p02_hint.png');width:545px;height:300px}
     처럼 버튼 이미지는 페이지 CSS에서 지정(두 버튼이 같은 이미지 재사용)
   - data-next는 더 이상 필요 없음(확인 버튼의 실제 href가 이동을 처리)
   - 다른 기능(js-sfx, js-nav-effect 등)을 몰라도 되는 완전히 독립적인 모듈
========================================================== */
function initHintQuiz() {
  const quiz = document.querySelector('.hint-quiz');
  if (!quiz) return;

  const revealBtns = Array.from(quiz.querySelectorAll('.hint-reveal-btn'));
  // 힌트보기 버튼은 누른 것만 사라짐(다른 슬롯엔 영향 없음). 카드로 바로
  // 정답을 맞혔을 때만 아직 안 눌린 나머지 버튼도 한꺼번에 치워줌(버튼을
  // 없애면 그 밑에 이미 그려져 있던 힌트 사진이 그대로 드러남)
  revealBtns.forEach((btn) => {
    btn.addEventListener('click', () => btn.remove());
  });
  const revealRemaining = () => {
    const hadAny = revealBtns.some((b) => b.isConnected);
    revealBtns.forEach((b) => b.remove());
    return hadAny;
  };

  const wrongLayer = document.querySelector('.hint-quiz-wrong');
  const correctLayer = document.querySelector('.hint-quiz-correct');

  const soundOf = (layer) => {
    if (!layer || !layer.dataset.sound) return null;
    const audio = new Audio(ASSET_BASE + layer.dataset.sound);
    audio.preload = 'auto';
    return audio;
  };
  const wrongSound = soundOf(wrongLayer);
  const correctSound = soundOf(correctLayer);

  const hintCards = Array.from(quiz.querySelectorAll('.hint-card'));
  let answered = false;

  hintCards.forEach((card) => {
    card.addEventListener('click', () => {
      if (answered) return; // 정답을 맞힌 뒤에는 카드가 더 이상 반응하지 않음

      if (card.dataset.correct === 'true') {
        answered = true;
        hintCards.forEach((c) => c.classList.toggle('is-selected', c === card));

        // 힌트를 다 안 보고 정답을 맞혔으면, 남아있던 힌트보기 버튼도
        // 마저 치워준 뒤 1초 있다가 정답 팝업을 띄움(이미 다 본
        // 상태였다면 바로 띄움)
        const wasRevealing = revealRemaining();
        setTimeout(() => {
          if (!correctLayer) return;
          correctLayer.classList.remove('is-off');
          if (correctSound) correctSound.cloneNode().play().catch((err) => console.warn('사운드 재생 실패:', err));
        }, wasRevealing ? 1000 : 0);
      } else {
        if (!wrongLayer) return;
        wrongLayer.classList.remove('is-off');
        if (wrongSound) wrongSound.cloneNode().play().catch((err) => console.warn('사운드 재생 실패:', err));
        clearTimeout(wrongLayer.__hideTimer);
        wrongLayer.__hideTimer = setTimeout(() => wrongLayer.classList.add('is-off'), 2000);
      }
    });
  });
}

/* ==========================================================
   기능 R: 선택 게이트 — 하나 이상 골라야 "다음"이 눌림
   - .multi-select 바로 다음 형제 요소 중 .multi-next를 찾아서,
     .multi-select 안의 .multi-option을 하나도 안 고르면 흐리게(비활성,
     클릭도 안 먹힘)해뒀다가, 하나라도 고르면 눌리게(활성) 만듦
   - 기본은 다중 선택(다시 눌러서 선택 해제 가능, 여러 개 동시 선택 허용).
     .multi-select에 data-single="true"를 주면 하나만 고를 수 있는
     라디오버튼 방식으로 바뀜(다른 걸 고르면 이전 선택은 자동 해제)
   - .multi-next에 data-warn-empty="true"를 주면 비활성화 대신, 아무것도
     안 고르고 눌렀을 때 형제 요소 .select-warning이 2초간 떴다 사라짐
     (버튼 자체는 항상 눌리는 상태로 둠 — "고르라"는 안내만 보여줌)
   예시 마크업:
     <div class="multi-select" data-single="true">
       <button class="multi-option"><img src="img/opt1.png" alt="적성"></button>
       <button class="multi-option"><img src="img/opt2.png" alt="친구가 좋아하는 것"></button>
     </div>
     <a href="javascript:;" class="multi-next is-disabled js-nav-effect">다음</a>
     <!-- 또는 data-warn-empty 방식: -->
     <a href="javascript:;" class="multi-next js-nav-effect" data-warn-empty="true">다음</a>
     <div class="select-warning hidden" data-sound="sound/incorrect.mp3">먼저 하나를 선택해주세요!</div>
   - .step-flow 안에 넣으면 initStepFlow가 "다음"의 실제 스텝 전환을
     그대로 처리함(이 함수는 활성/비활성 또는 경고만 담당, 전환 로직은 모름)
========================================================== */
function initMultiSelectGate() {
  document.querySelectorAll('.multi-select').forEach((group) => {
    const parent = group.parentElement;
    const nextBtn = parent ? parent.querySelector('.multi-next') : null;
    if (!nextBtn) return;

    const singleSelect = group.dataset.single === 'true';
    const warnEmpty = nextBtn.dataset.warnEmpty === 'true';
    const options = Array.from(group.querySelectorAll('.multi-option'));
    const hasSelection = () => options.some((o) => o.classList.contains('is-selected'));

    const updateGate = () => {
      if (warnEmpty) return; // 이 모드는 비활성화하지 않고 항상 눌리게 둠
      nextBtn.classList.toggle('is-disabled', !hasSelection());
    };

    options.forEach((opt) => {
      opt.addEventListener('click', () => {
        if (singleSelect) {
          options.forEach((o) => o.classList.toggle('is-selected', o === opt));
        } else {
          opt.classList.toggle('is-selected');
        }
        updateGate();
      });
    });

    if (warnEmpty) {
      const warningLayer = parent.querySelector('.select-warning');
      const warnSound = warningLayer && warningLayer.dataset.sound
        ? new Audio(ASSET_BASE + warningLayer.dataset.sound)
        : null;
      // capture 단계(true)에서 먼저 가로채야, initStepFlow/initLinkEffect가
      // 이미 등록해둔(버블 단계) 이동 처리보다 먼저 막을 수 있음
      nextBtn.addEventListener('click', (e) => {
        if (hasSelection()) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        if (!warningLayer) return;
        warningLayer.classList.remove('hidden');
        if (warnSound) warnSound.cloneNode().play().catch((err) => console.warn('사운드 재생 실패:', err));
        clearTimeout(warningLayer.__hideTimer);
        warningLayer.__hideTimer = setTimeout(() => warningLayer.classList.add('hidden'), 2000);
      }, true);
    }

    updateGate();
  });
}

/* ==========================================================
   기능 X: 고른 선택지의 문구를 다른 곳(예: 폰 화면)에 그대로 표시
   - .multi-option에 data-clause="문구"를 붙이고, 같은 .step-panel(없으면
     문서 전체) 안 어딘가에 .clause-preview를 하나 두면, 그 옵션을 클릭하는
     순간 .clause-preview의 글자가 그 문구로 바뀜(아직 아무것도 안 골랐을
     땐 비어있음). 기능 S(프롬프트 빌더)의 data-clause와 달리 {{}} 처리나
     스텝별 누적은 없고, 그냥 마지막으로 고른 문구 하나만 그대로 보여주는
     단순 버전
   - .step-panel 단위로 옵션↔미리보기를 짝짓기 때문에, 한 페이지 안에
     여러 스텝(각 스텝마다 자기 폰 화면)이 있어도 서로 안 섞임
   예시 마크업:
     <div class="step-panel">
       <button class="multi-option pick-card" data-clause="나는 남자이고" aria-label="나는 남자이고"></button>
       <button class="multi-option pick-card" data-clause="나는 여자이고" aria-label="나는 여자이고"></button>
       <div class="clause-preview"></div>
     </div>
   - 다른 기능(기능 R 등)을 몰라도 되는 완전히 독립적인 모듈
========================================================== */
function initClausePreview() {
  document.querySelectorAll('.multi-option[data-clause]').forEach((opt) => {
    opt.addEventListener('click', () => {
      const scope = opt.closest('.step-panel') || document;
      const preview = scope.querySelector('.clause-preview');
      if (preview) preview.textContent = opt.dataset.clause;
    });
  });
}

/* ==========================================================
   기능 S: 프롬프트 빌더 — 옵션을 고르는 즉시 그 스텝 몫 문구가
           미리보기에 반영되고(아직 안 넘어감), "다음"을 누르면 스텝 전환
   - .prompt-builder 안에 .step-flow(기능 M)로 스텝 패널을 두고, 각 패널
     안의 옵션에 data-clause="나는 여자이고,"를 붙이면 클릭하는 순간
     바로 .prompt-preview에 그 스텝 칸의 문구로 반영됨. 같은 스텝에서
     다른 옵션을 다시 골라도(예: 남자 → 여자) 그 스텝 칸만 교체되고
     쌓이지 않음(각 스텝은 문구를 한 칸씩만 차지)
   - data-clause 안에서 {{이렇게}} 이중 중괄호로 감싼 부분은 실제로
     사용자가 고른 단어라는 뜻으로 <span class="prompt-value">가 자동
     둘러져 다른 색으로 표시됨(예: data-clause="나는 {{여자}}이고,")
   - 옵션을 .multi-select(기능 R) 안의 .multi-option으로 두고 밖에
     .multi-next(다음 버튼)를 두면, 고른 뒤 "다음"을 눌러야 다음
     스텝으로 넘어감(문구 반영은 고르는 즉시 이미 끝나 있고, 다음
     버튼은 스텝 전환만 담당 — initStepFlow가 그대로 처리)
   - .prompt-steps 안의 .step-dot 들은 지금 몇 번째 패널이 보이는지에
     맞춰 자동으로 하나만 is-active로 채워짐(패널의 data-step="4"로
     직접 지정 가능 — 중간 스텝을 건너뛸 때 사용)
   - 패널 안에 .prompt-back(이전) 링크를 두면 한 스텝 뒤로 감(그
     스텝에서 이미 고른 문구는 그대로 남아있어 되돌아가서 다시 바꿀 수
     있음 — 스텝 칸 방식이라 따로 지울 필요가 없음). 기능 M의 "다음"과
     똑같이, 안쪽 js-sfx 클릭음이 끝날 때까지 기다렸다가 전환해서
     _on 이미지가 눈에 보일 시간을 줌
   예시 마크업:
     <div class="prompt-builder">
       <div class="prompt-steps">
         <span class="step-dot">1</span><span class="step-dot">2</span>
       </div>
       <div class="prompt-preview"></div>
       <div class="step-flow">
         <div class="step-panel" data-step="1">
           <div class="multi-select" data-single="true">
             <button class="multi-option pick-card" data-clause="나는 {{여자}}이고," aria-label="여자"></button>
             <button class="multi-option pick-card" data-clause="나는 {{남자}}이고," aria-label="남자"></button>
           </div>
           <a href="javascript:;" class="js-nav-effect multi-next is-disabled">다음</a>
         </div>
         <div class="step-panel" data-step="2">
           <a href="javascript:;" class="prompt-back">이전</a>
           ...
         </div>
       </div>
     </div>
   - initStepFlow가 스텝 전환 자체(패널 숨김/표시)는 그대로 처리하고,
     initMultiSelectGate가 선택 표시/다음버튼 활성화를 처리하며, 이
     함수는 문구 반영 + 스텝 표시 갱신 + 뒤로가기만 담당
========================================================== */
function initPromptBuilder() {
  const builder = document.querySelector('.prompt-builder');
  if (!builder) return;

  const preview = builder.querySelector('.prompt-preview');
  const stepsBox = builder.querySelector('.prompt-steps');
  const dots = Array.from(builder.querySelectorAll('.step-dot'));
  const panels = Array.from(builder.querySelectorAll('.step-panel'));
  // 스텝(패널)별로 문구를 한 칸씩 기억해둠 — 같은 스텝에서 다른 옵션을
  // 다시 골라도 그 칸만 교체되고 쌓이지 않음(예: 남자 눌렀다가 여자를
  // 누르면 "남자" 문구가 "여자"로 바뀜)
  const clauseByPanel = new Array(panels.length).fill('');
  // 옵션에 data-clause-class를 주면 그 스텝 줄만 <span class="...">로 감싸줌
  // (예: 기사 제목 줄만 더 크게/가운데 정렬하고 싶을 때 페이지 CSS에서 잡도록)
  const clauseClassByPanel = new Array(panels.length).fill('');

  const renderPreview = () => {
    if (!preview) return;
    // {{여자}}처럼 이중 중괄호로 감싼 부분만 <span>으로 감싸서 다른
    // 색으로 표시(나머지 뼈대 문구는 그대로 둠), 스텝마다 한 줄씩 띄워서 보임.
    // data-clause 문구 안에 줄바꿈(\n)을 직접 넣으면 그 자리에서도 줄바꿈됨
    // (문구 하나가 박스 너비에 비해 길 때 원하는 자리에서 끊어줄 수 있음)
    preview.innerHTML = clauseByPanel
      .map((clause, i) => ({ clause, cls: clauseClassByPanel[i] }))
      .filter((line) => line.clause)
      .map((line) => {
        const html = line.clause
          .replace(/\{\{(.+?)\}\}/g, '<span class="prompt-value">$1</span>')
          .replace(/\r?\n/g, '<br>');
        return line.cls ? `<span class="${line.cls}">${html}</span>` : html;
      })
      .join('<br>');
  };

  // panels[0]은 아직 스텝이 시작 안 된 인트로 화면이라고 보고, 스텝
  // 표시(1,2,3,4)와 미리보기 패널은 그 다음 패널부터 보여줌. 패널의
  // data-step="4"처럼 몇 번째 점을 켤지 직접 지정할 수도 있음(중간
  // 스텝을 건너뛰어서 패널 순서와 점 번호가 안 맞을 때 사용)
  // .prompt-builder에 data-current-step으로 지금 몇 번째 스텝인지 남겨둬서,
  // 완성 화면처럼 .prompt-preview 위치/크기가 달라져야 할 때 페이지 CSS에서
  // .prompt-builder[data-current-step="4"] .prompt-preview {...} 로 덮어쓸 수 있음
  const updateDots = (panel) => {
    const idx = panel.dataset.step
      ? Number(panel.dataset.step) - 1
      : panels.indexOf(panel) - 1;
    const isIntro = idx < 0;
    if (stepsBox) stepsBox.classList.toggle('hidden', isIntro);
    if (preview) preview.classList.toggle('hidden', isIntro);
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === idx));
    builder.dataset.currentStep = String(idx + 1);
  };
  updateDots(panels[0]);

  // 옵션(.multi-option이든 곧바로 넘어가는 옵션이든)을 클릭하는 즉시
  // 그 스텝 칸의 문구가 미리보기에 반영됨(다음을 눌러야 넘어가는
  // 방식이면 다음 버튼은 그냥 스텝 전환만 담당 — 문구는 이미 반영돼 있음)
  builder.querySelectorAll('[data-clause]').forEach((opt) => {
    opt.addEventListener('click', () => {
      const panel = opt.closest('.step-panel');
      const idx = panel ? panels.indexOf(panel) : -1;
      if (idx < 0) return;
      clauseByPanel[idx] = opt.dataset.clause;
      clauseClassByPanel[idx] = opt.dataset.clauseClass || '';
      renderPreview();
    });
  });

  panels.forEach((panel, i) => {
    panel.addEventListener('step:visible', () => {
      // 이 스텝에 실제로 들어온 순간에만 data-default-clause를 반영함
      // (예: 아직 없는 중간 스텝을 골랐다고 가정하고 완성 화면에서만
      // 임시로 끼워 보여주고, 그 전 스텝에서는 안 보이게)
      if (panel.dataset.defaultClause && !clauseByPanel[i]) {
        clauseByPanel[i] = panel.dataset.defaultClause;
        renderPreview();
      }
      updateDots(panel);
    });
  });

  builder.querySelectorAll('.prompt-back').forEach((btn) => {
    btn.addEventListener('click', () => {
      const panel = btn.closest('.step-panel');
      const idx = panels.indexOf(panel);
      const prevPanel = panels[idx - 1];
      if (!prevPanel) return;

      const goNow = () => {
        panel.classList.add('is-hidden');
        prevPanel.classList.remove('is-hidden');
        prevPanel.dispatchEvent(new CustomEvent('step:visible'));
      };

      // 기능 M의 "다음"과 같은 이유: js-sfx 클릭음(_on 이미지로 바뀐 버튼)이
      // 끝날 때까지 기다렸다가 전환해야 _on 프레임이 눈에 보임
      const soundEl = btn.hasAttribute('data-sound') ? btn : btn.querySelector('[data-sound]');
      const audio = soundEl ? soundEl.__sfxAudio : null;

      if (audio) {
        let navigated = false;
        const proceed = () => {
          if (navigated) return;
          navigated = true;
          goNow();
        };
        audio.addEventListener('ended', proceed);
        audio.addEventListener('error', proceed);
        setTimeout(proceed, 4000); // 안전장치: ended가 안 오는 경우 대비
      } else {
        setTimeout(goNow, 300);
      }
    });
  });
}

/* ==========================================================
   기능 U: 프롬프트를 고쳐라 — 오답 단어는 흔들리고, 정답 단어를
           고르면 다음 문제(또는 마지막이면 성공 화면)로 넘어감
   - .fix-prompt-quiz(=.step-flow) 안에 .step-panel(문제 하나씩)을 두고,
     각 패널 안의 .fix-word-option 중 data-correct="true"를 클릭하면
     advancePanelOrNavigate로 다음 패널(또는 .fix-prompt-quiz의
     data-next 페이지, 마지막 패널일 때)로 넘어감
   - data-correct="false"를 클릭하면 그 버튼만 잠깐 흔들리는 표시(CSS
     is-wrong)만 뜨고 그대로 남아있어 다시 고를 수 있음
   예시 마크업:
     <div class="step-flow fix-prompt-quiz" data-next="page01.html">
       <div class="step-panel">
         <img src="img/photo1.png" alt="">
         <div class="fix-word-options">
           <button class="fix-word-option" data-correct="true">소방관</button>
           <button class="fix-word-option" data-correct="false">요리사</button>
         </div>
       </div>
       <!-- 다음 문제 .step-panel, 그다음 성공 화면 .step-panel 순으로 추가 -->
     </div>
   - 다른 기능(js-sfx 등)을 몰라도 되는 독립적인 모듈. initStepFlow가
     먼저 실행돼 있어야 정답 클릭 시 다음 문제/페이지로 넘어감
========================================================== */
function initFixPromptGame() {
  const quiz = document.querySelector('.fix-prompt-quiz');
  if (!quiz) return;

  quiz.querySelectorAll('.fix-word-option').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.dataset.correct === 'true') {
        advancePanelOrNavigate(btn, quiz.dataset.next);
      } else {
        btn.classList.remove('is-wrong');
        void btn.offsetWidth; // 강제 리플로우: 같은 오답을 연달아 눌러도 흔들림이 다시 재생되게
        btn.classList.add('is-wrong');
      }
    });
  });
}

/* ==========================================================
   기능 V: 정답이 여러 개인 고르기 퀴즈 — "다음" 버튼 없이, 정답
           버튼을 전부(순서 상관없이) 고르면 잠깐 뒤 자동으로 다음
           스텝(또는 페이지)으로 넘어감
   - .answer-pick-quiz 안의 .answer-pick 버튼 중 data-correct="true"를
     클릭하면 그 버튼에 is-selected가 남고 안쪽 <img>가 data-src-on
     이미지로 바뀌어 계속 표시됨(이미 고른 정답은 다시 눌러도 반응
     안 함), 정답을 전부 고르면 advancePanelOrNavigate로 다음
     스텝/페이지로 넘어감(.step-panel 안이면 다음 스텝, 아니면
     data-next 페이지로 이동)
   - data-correct="false"를 클릭하면 그 버튼만 잠깐 흔들리고(is-wrong)
     그대로 남아있어 다시 고를 수 있음(정답 개수에는 포함 안 됨)
   - 정답 이미지는 js-img-swap(data-src-alt)이 아니라 data-src-on을
     직접 써서 바꿈: js-img-swap은 "페이지 내 하나만 활성화" 정책이라
     한 정답을 고른 뒤 다른 정답을 고르면 앞서 고른 게 원래 이미지로
     되돌아가버려 다중 선택과 맞지 않기 때문(선택된 정답이 여러 개
     동시에 _on 상태로 남아있어야 함). 오버(호버) 효과는 여전히
     js-img-swap의 data-src-over를 그대로 씀(호버는 자기 자신만
     바뀌고 되돌아가서 문제 없음)
   - 사운드(js-sfx)는 독립 모듈이 처리하므로 각 버튼 안쪽 <img>에
     그대로 얹으면 됨
   예시 마크업:
     <div class="answer-pick-quiz">
       <button class="answer-pick pick-card" data-correct="true" aria-label="적성">
         <img class="js-img-swap js-sfx" src="img/opt1.png"
              data-src-on="img/opt1_on.png" data-src-over="img/opt1_over.png"
              data-sound="sound/correct.mp3" alt="적성">
       </button>
       <button class="answer-pick pick-card" data-correct="false" aria-label="멋있는 일">
         <img class="js-img-swap js-sfx" src="img/opt2.png"
              data-src-over="img/opt2_over.png" data-sound="sound/incorrect.mp3" alt="멋있는 일">
       </button>
     </div>
   - 페이지에 .ox-result-correct/.ox-result-wrong 레이어(기능 E와 동일한
     마크업)가 있으면 자동으로 같이 씀: 오답을 클릭할 때마다 오답 레이어가
     뜨고, 정답을 전부 다 골랐을 때 딱 한 번 정답 레이어가 뜸(정답을
     하나씩 고를 때마다는 안 뜸 — 다 골라야 완료로 침)
   - 다른 기능(js-sfx 등)을 몰라도 되는 완전히 독립적인 모듈
========================================================== */
function initAnswerPickQuiz() {
  const correctLayer = document.querySelector('.ox-result-correct');
  const wrongLayer = document.querySelector('.ox-result-wrong');
  const prepareSound = (layer) => {
    if (!layer || !layer.dataset.sound) return null;
    const audio = new Audio(ASSET_BASE + layer.dataset.sound);
    audio.preload = 'auto';
    return audio;
  };
  const correctSound = prepareSound(correctLayer);
  const wrongSound = prepareSound(wrongLayer);
  // 문제(.answer-pick-quiz)나 보기에 data-wrong="문구"가 있으면 그 오답만 문구를 바꿔 띄움(긴 문구라 60px .is-medium). 없으면 원래 문구
  const wrongText = wrongLayer ? wrongLayer.querySelector('.avatar-popup-text') : null;
  const wrongDefault = wrongText ? { html: wrongText.innerHTML, cls: wrongText.className } : null;
  const setWrongText = (html) => {
    if (!wrongText) return;
    wrongText.innerHTML = html || wrongDefault.html;
    wrongText.className = html ? 'avatar-popup-text is-medium' : wrongDefault.cls;
  };
  // 정답도 같은 방식: data-right="문구"가 있는 문제는 정답 팝업 문구를 바꿈
  const rightText = correctLayer ? correctLayer.querySelector('.avatar-popup-text') : null;
  const rightDefault = rightText ? { html: rightText.innerHTML, cls: rightText.className } : null;
  const setRightText = (html) => {
    if (!rightText) return;
    rightText.innerHTML = html || rightDefault.html;
    rightText.className = html ? 'avatar-popup-text is-medium' : rightDefault.cls;
  };
  // 정답이 여러 개인 문제에서, 마지막 정답 전까지는 정답 레이어/사운드가 안 뜨다 보니
  // 첫 번째 정답을 골랐을 때 아무 소리도 안 나던 문제 — 클릭음만 짧게 얹어줌
  const clickSound = new Audio(ASSET_BASE + 'sound/click.mp3');
  clickSound.preload = 'auto';
  const showLayer = (layer, sound) => {
    if (!layer) return;
    layer.classList.remove('is-off');
    if (sound) sound.cloneNode().play().catch((err) => console.warn('사운드 재생 실패:', err));
    clearTimeout(layer.__hideTimer);
    layer.__hideTimer = setTimeout(() => layer.classList.add('is-off'), 2000);
  };

  document.querySelectorAll('.answer-pick-quiz').forEach((quiz) => {
    const options = Array.from(quiz.querySelectorAll('.answer-pick'));
    const totalCorrect = options.filter((o) => o.dataset.correct === 'true').length;
    if (!totalCorrect) return;

    let foundCount = 0;

    options.forEach((opt) => {
      opt.addEventListener('click', () => {
        if (opt.dataset.correct === 'true') {
          if (opt.classList.contains('is-selected')) return; // 이미 고른 정답은 다시 반응 안 함
          opt.classList.add('is-selected');

          // js-img-swap(data-src-alt)은 "페이지 내 하나만 활성화"라 다중 선택과
          // 충돌하므로 쓰지 않고, data-src-on을 직접 여기서 바꿔줌(선택한
          // 정답들이 전부 각자 _on 이미지로 남아있게). is-swapped를 같이
          // 켜둬야 initImageSwap의 호버-복귀(pointerleave) 로직이 이
          // _on 이미지를 원본으로 되돌리지 않음
          const img = opt.querySelector('img[data-src-on]');
          if (img) {
            img.src = img.dataset.srcOn;
            img.classList.add('is-swapped');
          }

          foundCount += 1;

          if (foundCount >= totalCorrect) {
            setRightText(quiz.dataset.right);
            showLayer(correctLayer, correctSound);
            setTimeout(() => advancePanelOrNavigate(opt, quiz.dataset.next), 2000);
          } else {
            clickSound.cloneNode().play().catch((err) => console.warn('사운드 재생 실패:', err));
          }
        } else {
          opt.classList.remove('is-wrong');
          void opt.offsetWidth; // 강제 리플로우: 같은 오답을 연달아 눌러도 흔들림이 다시 재생되게
          opt.classList.add('is-wrong');
          setWrongText(opt.dataset.wrong || quiz.dataset.wrong);
          showLayer(wrongLayer, wrongSound);
        }
      });
    });
  });
}

/* ==========================================================
   기능 W: 프롬프트 문장 속 틀린 단어 찾아 고치기("프롬프트를 고쳐라" 실제 규칙)
   - .prompt-fix-quiz(=.step-flow) 안에 .step-panel(스테이지 하나씩)을 두고,
     각 패널 안에 문장을 .prompt-fix-word(단어별 <span>) 여러 개로 쪼개서
     넣어둠. 그중 data-target="true" 하나가 "실제로 틀린 단어":
     · 그 단어를 클릭하면 밑줄+굵게(is-picked) 표시되고 나머지 단어는
       흐려지며(is-dim), 옆에 숨겨둔 .prompt-fix-choices(교체 후보 단어
       버튼들, data-correct="true"가 정답)가 나타남
     · data-target 없는(=false) 단어를 클릭하면 오답 사운드 + .prompt-fix-popup
       (안내 문구)이 2초간 떴다 사라짐(틀린 단어를 다시 고를 수 있음)
   - .prompt-fix-choices 안의 후보 버튼(.prompt-fix-choice) 중 정답을 클릭하면
     골랐던 단어 자리에 그 텍스트가 그대로 들어가 문장이 고쳐지고(is-fixed),
     .prompt-fix-feedback("정답이에요!" 등)이 뜬 뒤 2초 있다가
     advancePanelOrNavigate로 다음 스테이지(또는 성공 화면)로 자동 전환.
     오답 버튼을 클릭하면 오답 사운드 + 팝업만 뜨고 그대로 다시 고를 수 있음
   - .prompt-fix-stars-pill(선택, .step-flow 밖에 둬서 스테이지가 넘어가도 유지됨)
     안에 기능 H와 같은 .find-star(data-src-on)를 스테이지 개수만큼 넣어두면,
     스테이지를 하나 맞힐 때마다 왼쪽부터 순서대로 하나씩 켜짐
   예시 마크업:
     <div class="prompt-fix-stars-pill">
       <img class="find-star" src="img/icon_star.png" data-src-on="img/icon_star_on.png" alt="">
       <img class="find-star" src="img/icon_star.png" data-src-on="img/icon_star_on.png" alt="">
     </div>
     <div class="step-flow prompt-fix-quiz">
       <div class="step-panel">
         <div class="prompt-fix-sentence">
           <span class="prompt-fix-word" data-target="true">농구장</span>에서
           <span class="prompt-fix-word">요리</span>를 하고 있는
           <span class="prompt-fix-word">요리사</span>의 모습을 사진으로 만들어줘.
         </div>
         <div class="prompt-fix-choices hidden">
           <button class="fix-word-option prompt-fix-choice" data-correct="false">진료실</button>
           <button class="fix-word-option prompt-fix-choice" data-correct="false">소방서</button>
           <button class="fix-word-option prompt-fix-choice" data-correct="true">주방</button>
         </div>
         <div class="prompt-fix-feedback hidden">정답이에요!</div>
       </div>
       <!-- 다음 스테이지 .step-panel, 그다음 성공 화면 .step-panel 순으로 추가 -->
     </div>
     <div class="prompt-fix-popup hidden">이미지와 프롬프트를 다시 한 번 비교해보세요.</div>
   - 다른 기능(js-sfx 등)을 몰라도 되는 독립적인 모듈. advancePanelOrNavigate를
     직접 호출하므로 initStepFlow보다 먼저/나중 어느 순서에 실행돼도 무방
========================================================== */
function initPromptFixQuiz() {
  const quiz = document.querySelector('.prompt-fix-quiz');
  if (!quiz) return;

  const popup = document.querySelector('.prompt-fix-popup');
  let popupTimer = null;
  const showPopup = () => {
    if (!popup) return;
    popup.classList.remove('hidden');
    clearTimeout(popupTimer);
    popupTimer = setTimeout(() => popup.classList.add('hidden'), 2000);
  };

  const stars = Array.from(document.querySelectorAll('.prompt-fix-stars-pill .find-star'));
  let starIndex = 0;
  const lightNextStar = () => {
    const star = stars[starIndex];
    if (star && star.dataset.srcOn) star.src = star.dataset.srcOn;
    starIndex += 1;
  };

  const correctSound = new Audio(ASSET_BASE + 'sound/correct.mp3');
  correctSound.preload = 'auto';
  const wrongSound = new Audio(ASSET_BASE + 'sound/incorrect.mp3');
  wrongSound.preload = 'auto';
  const playSound = (template) => template.cloneNode().play().catch((err) => console.warn('사운드 재생 실패:', err));

  quiz.querySelectorAll('.step-panel').forEach((panel) => {
    const sentence = panel.querySelector('.prompt-fix-sentence');
    const words = Array.from(panel.querySelectorAll('.prompt-fix-word'));
    const choicesBox = panel.querySelector('.prompt-fix-choices');
    const feedback = panel.querySelector('.prompt-fix-feedback');
    let picked = null; // 이 스테이지에서 클릭해 고른 "틀린 단어" 요소

    words.forEach((word) => {
      word.addEventListener('click', () => {
        if (picked) return; // 이미 틀린 단어를 찾은 뒤에는 문장 클릭이 반응 안 함
        if (word.dataset.target !== 'true') {
          playSound(wrongSound);
          showPopup();
          return;
        }
        picked = word;
        word.classList.add('is-picked');
        // 고른 단어(is-picked)만 빼고 문장 전체(단어 사이 일반 텍스트 포함)가
        // 흐려지도록 .prompt-fix-word가 아니라 문장 컨테이너에 클래스를 줌
        if (sentence) sentence.classList.add('is-dimmed');
        if (choicesBox) choicesBox.classList.remove('hidden');
      });
    });

    if (!choicesBox) return;

    choicesBox.querySelectorAll('.prompt-fix-choice').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (!picked) return; // 아직 틀린 단어를 못 찾았으면 후보를 눌러도 무시
        if (btn.dataset.correct !== 'true') {
          playSound(wrongSound);
          showPopup();
          return;
        }

        picked.textContent = btn.textContent;
        picked.classList.remove('is-picked');
        picked.classList.add('is-fixed');
        if (sentence) sentence.classList.remove('is-dimmed');
        choicesBox.classList.add('hidden');

        playSound(correctSound);
        lightNextStar();

        if (feedback) feedback.classList.remove('hidden');
        setTimeout(() => {
          if (feedback) feedback.classList.add('hidden');
          advancePanelOrNavigate(panel, quiz.dataset.next);
        }, 2000);
      });
    });
  });
}

/* ==========================================================
   기능 T: 파티클(컨페티) 반짝임 효과 — 통이미지 두 장을 번갈아 보여주다가
           일정 시간 뒤 통째로 사라짐
   - .particle-effect(전체를 덮는 통이미지)에 data-frame1/data-frame2를
     주면 페이지가 열리자마자 그 둘을 번갈아 바꿔 보여주다가(반짝이는
     느낌), data-duration(기본 2000ms)이 지나면 완전히 사라짐
   - data-interval(기본 200ms): 두 프레임이 바뀌는 간격
   예시 마크업:
     <img class="particle-effect" src="../../img/common/img_particle01.png"
          data-frame1="../../img/common/img_particle01.png" data-frame2="../../img/common/img_particle02.png"
          data-interval="200" data-duration="2000" alt="">
   - 다른 기능을 몰라도 되는 완전히 독립적인 모듈
========================================================== */
function initParticleEffect() {
  document.querySelectorAll('.particle-effect').forEach((img) => {
    const frame1 = img.dataset.frame1 || img.getAttribute('src');
    const frame2 = img.dataset.frame2;
    if (!frame2) return; // 두 번째 프레임이 없으면 반짝일 수 없음

    const stepMs = Number(img.dataset.interval) || 200;
    const totalMs = Number(img.dataset.duration) || 2000;

    // 숨겨진 스텝 패널 안에 있으면 그 스텝이 실제로 보일 때까지 시작을 미룸
    // (안 그러면 도달하기 전에 duration이 다 지나가서 반짝임을 못 봄)
    whenVisible(img, () => {
      let showingFrame2 = false;
      const flipTimer = setInterval(() => {
        showingFrame2 = !showingFrame2;
        img.src = showingFrame2 ? frame2 : frame1;
      }, stepMs);

      setTimeout(() => {
        clearInterval(flipTimer);
        img.classList.add('hidden');
      }, totalMs);
    });
  });
}

/* ==========================================================
   기능 Y: 이미지 여러 장을 순서대로 돌려 보여주는 로딩 애니메이션 —
           마지막 프레임에서 멈추고, 자동으로 다음으로 넘어가거나
           숨겨져 있던 버튼을 그제서야 나타나게 함
   - .loading-sequence(<img>)에 data-frames="파일1,파일2,파일3"처럼 쉼표로
     구분한 프레임 목록을 주면, data-interval(기본 500ms) 간격으로 순서대로
     바꿔 보여주다가 마지막 프레임에서 멈춤(끝까지 가면 처음으로 되돌아가지
     않음)
   - data-reveal이 있으면: 마지막 프레임에서 멈춘 뒤 자동 이동 없이,
     그 CSS 선택자에 해당하는 요소의 .hidden 클래스를 없애 보여주기만 함
     (버튼을 그 자리에 hidden 상태로 숨겨뒀다가, 애니메이션이 끝나야
     나타나게 할 때 사용 — 이후 이동은 그 버튼 자신의 링크가 처리)
   - data-reveal이 없으면(기존 동작): advancePanelOrNavigate로 다음
     스텝(.step-panel 안이면) 또는 data-next 페이지로 자동 이동
   예시 마크업(자동 이동):
     <div class="step-panel" data-next="page13.html">
       <img class="loading-sequence" src="img/p12_bg_ani1.png"
            data-frames="img/p12_bg_ani1.png,img/p12_bg_ani2.png,img/p12_bg_ani3.png,img/p12_bg_ani4.png"
            data-interval="500" alt="">
     </div>
   예시 마크업(버튼 나타내기, 자동 이동 없음):
     <img class="loading-sequence" src="img/p14_bg_ani1.png"
          data-frames="img/p14_bg_ani1.png,img/p14_bg_ani2.png,img/p14_bg_ani3.png,img/p14_bg_ani4.png,img/p14_bg_ani5.png"
          data-interval="1000" data-reveal=".p14-next" alt="">
     <a href="page15.html" class="js-nav-effect p14-next hidden">
       <img src="img/p14_btn_next.png" class="js-img-swap js-sfx" data-src-alt="img/p14_btn_next_on.png" data-src-over="img/p14_btn_next_over.png" data-sound="sound/click.mp3" alt="다음">
     </a>
   - 다른 기능(js-sfx 등)을 몰라도 되는 완전히 독립적인 모듈
========================================================== */
function initLoadingSequence() {
  document.querySelectorAll('.loading-sequence').forEach((img) => {
    const frames = (img.dataset.frames || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (frames.length < 2) return;

    // 숨겨진 스텝 패널 안에 있으면(아직 이 스텝 차례가 아니면), 이 스텝이
    // 실제로 보이는 순간까지 타이머 시작을 미룸 — 이게 없으면 페이지를
    // 열자마자(다른 스텝을 보고 있는 중에도) 몰래 타이머가 돌다가 총
    // 재생시간이 지나면 엉뚱하게 마지막 스텝으로 튀어버림
    whenVisible(img, () => startLoadingSequence(img, frames));
  });
}

function startLoadingSequence(img, frames) {
  // data-duration(전체 재생시간)이 있으면 프레임 수로 나눠서 옛 방식과도
  // 호환되게 하고, 없으면 data-interval(기본 500ms)을 그대로 씀
  const stepMs = Number(img.dataset.interval)
    || Math.round((Number(img.dataset.duration) || frames.length * 500) / frames.length);

  // 프레임 전환이 씹히지 않도록 전부 미리 로드해둠
  frames.forEach((src) => { new Image().src = src; });

  let i = 0;
  img.src = frames[0];
  const timer = setInterval(() => {
    i += 1;
    img.src = frames[i];
    if (i >= frames.length - 1) {
      // 마지막 프레임에서 멈추고(되돌아가지 않음), 그 프레임을 한 간격만큼
      // (예: 1초) 더 보여준 뒤에야 다음 동작(버튼 노출/이동)을 함 — 마지막
      // 이미지가 뜨자마자 바로 버튼이 나타나 버리면 너무 급작스러워 보임
      clearInterval(timer);
      setTimeout(() => finishLoadingSequence(img), stepMs);
    }
  }, stepMs);
}

function finishLoadingSequence(img) {
  const revealSelector = img.dataset.reveal;
  if (revealSelector) {
    const target = document.querySelector(revealSelector);
    if (target) target.classList.remove('hidden');
    return; // 자동 이동은 안 하고, 방금 나타난 버튼을 눌러야 다음으로 넘어감
  }
  advancePanelOrNavigate(img, img.dataset.next);
}

/* ==========================================================
   공용 헬퍼 — 페이지마다 복붙돼 있던 세 가지
   - makeSfx('sound/correct.mp3') → 재생 함수. 연타해도 끊기지 않게 매번 클론해서 재생
   - shuffleArray(arr) → 섞인 사본(원본 배열은 그대로)
   - flashLayer(el) → is-off를 떼서 보여주고 2초 뒤 다시 숨김(연달아 불러도 타이머는 하나)
========================================================== */
function makeSfx(path) {
  const audio = new Audio(ASSET_BASE + path);
  audio.preload = 'auto';
  return () => audio.cloneNode().play().catch((err) => console.warn('사운드 재생 실패:', err));
}

/* 공용 효과음 묶음: 페이지에서 makeSfx('sound/...')를 다시 만들지 말고 sfx.click / sfx.correct / sfx.wrong을 쓴다 */
const sfx = {
  click: makeSfx('sound/click.mp3'),
  correct: makeSfx('sound/correct.mp3'),
  wrong: makeSfx('sound/incorrect.mp3'),
};

const playClick = sfx.click;
const playCorrect = sfx.correct;
const playWrong = sfx.wrong;

/* 끌어다 놓아서 맞았을 때 나는 소리(sound/drag.mp3). initMatchDrag는 맞게 놓으면 자동으로 부르고,
   직접 구현한 드래그는 맞게 놓는 순간 playDrag()를 부른다. 볼륨 0.5 */
const playDrag = (() => {
  const audio = new Audio(ASSET_BASE + 'sound/drag.mp3');
  audio.preload = 'auto';
  return () => { const a = audio.cloneNode(); a.volume = 0.5; a.play().catch(() => {}); };
})();

const $ = (id) => document.getElementById(id);

/* 사인파 모양 SVG 문자열(파도·음파 그래프). amp: 높이(0~1, 칸 높이 대비), cycles: 칸 안 물결 수(클수록 촘촘).
   opts: width/height(viewBox, 기본 600×200), color, stroke(선 굵기), axis(true면 가운데 기준선), extra(가로로 더 그릴 물결 수 — 흐르는 애니메이션용),
   fill([위색, 아래색] — 물결 아래를 물처럼 채움, gwa/05 파도 관측 모니터와 같은 모양) */
function waveSvg(amp, cycles, opts) {
  const o = Object.assign({ width: 600, height: 200, color: '#2f6fed', stroke: 6, axis: false, extra: 0, fill: null }, opts);
  const mid = o.height / 2;
  const a = amp * (o.height / 2 - o.stroke);
  const total = o.width + (o.width / cycles) * o.extra;
  let d = 'M0 ' + mid;
  for (let x = 2; x <= total; x += 2) d += ' L' + x + ' ' + (mid - a * Math.sin((x / o.width) * cycles * 2 * Math.PI)).toFixed(1);
  const axis = o.axis ? '<line x1="0" y1="' + mid + '" x2="' + o.width + '" y2="' + mid + '" stroke="#c4c9d4" stroke-width="2" stroke-dasharray="8 8"/>' : '';
  let water = '';
  if (o.fill) {
    const id = 'waveFill' + Math.random().toString(36).slice(2, 8);
    water = '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + o.fill[0] + '"/><stop offset="1" stop-color="' + o.fill[1] + '"/></linearGradient></defs>' +
      '<path d="' + d + ' L' + total + ' ' + o.height + ' L0 ' + o.height + ' Z" fill="url(#' + id + ')"/>';
  }
  return '<svg viewBox="0 0 ' + o.width + ' ' + o.height + '" preserveAspectRatio="none" aria-hidden="true">' + water + axis +
    '<path d="' + d + '" fill="none" stroke="' + o.color + '" stroke-width="' + o.stroke + '" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}

/* 막대·꺾은선 그래프 SVG 문자열(gwa/02 기온 그래프). data: [{ label: '0시', value: 15 }, ...]
   opts: type('bar'|'line'), width/height(viewBox), max/step(세로축), unit(세로축 제목), xTitle, color, title,
   hide(물음표로 가릴 칸 번호), mark(강조 칸 번호), font(글꼴) */
function chartSvg(data, opts) {
  const o = Object.assign({ type: 'bar', width: 900, height: 480, max: 35, step: 5, unit: '기온(℃)', xTitle: '시간', color: '#ff7a1a', title: '', hide: -1, mark: -1, font: 'Pretendard' }, opts);
  const top = o.title ? 70 : 40;
  const pad = { l: 80, r: 30, t: top, b: 70 };
  const w = o.width - pad.l - pad.r;
  const h = o.height - pad.t - pad.b;
  const gap = w / data.length;
  const y = (v) => pad.t + h - (v / o.max) * h;
  const x = (i) => pad.l + gap * i + gap / 2;
  let s = '<svg viewBox="0 0 ' + o.width + ' ' + o.height + '" font-family="' + o.font + '" aria-hidden="true">';
  if (o.title) s += '<text x="' + o.width / 2 + '" y="38" text-anchor="middle" font-size="30" font-weight="700" fill="#1b1738">' + o.title + '</text>';
  for (let v = 0; v <= o.max; v += o.step) {
    s += '<line x1="' + pad.l + '" x2="' + (pad.l + w) + '" y1="' + y(v) + '" y2="' + y(v) + '" stroke="#e1e4ec" stroke-width="2"/>';
    s += '<text x="' + (pad.l - 12) + '" y="' + (y(v) + 8) + '" text-anchor="end" font-size="22" fill="#5b5e6e">' + v + '</text>';
  }
  s += '<text x="' + (pad.l - 12) + '" y="' + (pad.t - 14) + '" text-anchor="end" font-size="20" fill="#5b5e6e">' + o.unit + '</text>';
  s += '<line x1="' + pad.l + '" x2="' + pad.l + '" y1="' + pad.t + '" y2="' + (pad.t + h) + '" stroke="#1b1738" stroke-width="3"/>';
  s += '<line x1="' + pad.l + '" x2="' + (pad.l + w) + '" y1="' + (pad.t + h) + '" y2="' + (pad.t + h) + '" stroke="#1b1738" stroke-width="3"/>';
  data.forEach((d, i) => {
    const hidden = i === o.hide;
    const marked = i === o.mark;
    s += '<text x="' + x(i) + '" y="' + (pad.t + h + 34) + '" text-anchor="middle" font-size="22" fill="#1b1738"' + (marked ? ' font-weight="700"' : '') + '>' + d.label + '</text>';
    if (hidden) {
      s += '<rect x="' + (x(i) - gap * 0.35) + '" y="' + pad.t + '" width="' + gap * 0.7 + '" height="' + h + '" rx="10" fill="#d9dbe4" opacity=".8"/>' +
        '<text x="' + x(i) + '" y="' + (pad.t + h / 2 + 22) + '" text-anchor="middle" font-size="64" font-weight="700" fill="#48159c">?</text>';
      return;
    }
    if (o.type === 'bar') {
      s += '<rect x="' + (x(i) - gap * 0.3) + '" y="' + y(d.value) + '" width="' + gap * 0.6 + '" height="' + (pad.t + h - y(d.value)) + '" fill="' + (marked ? '#ffd83d' : o.color) + '"' + (marked ? ' stroke="#ff9f1a" stroke-width="5"' : '') + '/>';
    }
  });
  if (o.type === 'line') {
    // 가린 칸(hide)에서 선을 끊어 답이 드러나지 않게
    const segs = [[]];
    data.forEach((d, i) => { if (i === o.hide) segs.push([]); else segs[segs.length - 1].push(x(i) + ',' + y(d.value)); });
    segs.forEach((seg) => { if (seg.length > 1) s += '<polyline points="' + seg.join(' ') + '" fill="none" stroke="' + o.color + '" stroke-width="5" stroke-linejoin="round"/>'; });
    data.forEach((d, i) => {
      if (i === o.hide) return;
      s += '<circle cx="' + x(i) + '" cy="' + y(d.value) + '" r="' + (i === o.mark ? 13 : 8) + '" fill="' + (i === o.mark ? '#ffd83d' : o.color) + '"' + (i === o.mark ? ' stroke="#ff9f1a" stroke-width="4"' : '') + '/>';
    });
  }
  if (o.xTitle) s += '<text x="' + (pad.l + w) + '" y="' + (pad.t + h + 62) + '" text-anchor="end" font-size="20" fill="#5b5e6e">' + o.xTitle + '</text>';
  return s + '</svg>';
}

function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

function flashLayer(el, hideClass, ms) {
  const cls = hideClass || 'is-off';
  el.classList.remove(cls);
  clearTimeout(el.__hideTimer);
  el.__hideTimer = setTimeout(() => el.classList.add(cls), ms || 2000);
}

/* 한 페이지 안에서 다시 쓰는 버튼(다음 등)의 눌린(_on) 이미지를 원래대로 되돌림. root 안의 .js-img-swap 전부 */
function resetImageSwap(root) {
  const imgs = root.matches && root.matches('.js-img-swap') ? [root] : Array.from(root.querySelectorAll('.js-img-swap'));
  imgs.forEach((img) => {
    img.classList.remove('is-swapped');
    if (img.dataset.originalSrc) img.src = img.dataset.originalSrc;
  });
}

/* 눌러야 할 버튼 오른쪽 아래에 깜빡이는 손가락(기능 L)을 붙임. 다시 부르면 이전 손가락은 지움.
   opts.onMain: 버튼이 overflow:hidden 상자(휴대폰 화면 등) 안에 있어 손가락이 잘릴 때, 손가락을 main에 붙이고 화면 좌표로 계산
   opts.x: 가로 어디를 가리킬지(0=왼쪽 끝 ~ 1=오른쪽 끝, 기본 1). 긴 입력창처럼 오른쪽 끝에 다른 버튼이 있을 때 */
function pointFingerAt(el, opts) {
  if (opts && opts.onMain) {
    const main = el.closest('main');
    const s = main.getBoundingClientRect().width / main.offsetWidth;
    const r = el.getBoundingClientRect();
    const m = main.getBoundingClientRect();
    pointFingerAt({
      offsetLeft: (r.left - m.left) / s, offsetTop: (r.top - m.top) / s,
      offsetWidth: r.width / s * (opts.x === undefined ? 1 : opts.x), offsetHeight: r.height / s, offsetParent: main
    });
    return;
  }
  clearFingers();
  const finger = document.createElement('img');
  finger.className = 'finger-guide js-point-finger';
  finger.src = ASSET_BASE + 'img/common/img_finger01.png';
  finger.dataset.frame1 = ASSET_BASE + 'img/common/img_finger01.png';
  finger.dataset.frame2 = ASSET_BASE + 'img/common/img_finger02.png';
  finger.dataset.interval = '400';
  finger.dataset.loop = 'true';
  finger.style.cssText = 'position:absolute;width:110px;z-index:30;pointer-events:none';
  finger.style.left = (el.offsetLeft + el.offsetWidth - 20) + 'px';
  finger.style.top = (el.offsetTop + el.offsetHeight - 10) + 'px';
  (el.offsetParent || el.parentElement).appendChild(finger);
  initFingerGuide();
}

function clearFingers() {
  document.querySelectorAll('.js-point-finger').forEach((f) => f.remove());
}

/* 카드를 "짝이 정해진" 칸에 끌어 넣기(기능 F는 아무 빈 칸이나 받음). 페이지에서 직접 호출.
   cards/zones: data-key가 같은 카드-칸이 짝. 맞으면 카드가 칸 안으로 들어가고 onRight(card, zone),
   틀리거나 칸 밖이면 제자리로 돌아가고 onWrong(card, zone|null). 칸이 전부 차면 onDone().
   slop(스테이지 px): 칸 바깥 이만큼까지 놓아도 그 칸으로 침, 여러 칸이 걸리면 중심이 가장 가까운 칸 */
function initMatchDrag(opts) {
  const { cards, zones, onRight, onWrong, onDone } = opts;
  const stage = document.getElementById('stage');
  const scale = () => (stage ? stage.getBoundingClientRect().width / 1920 : 1);
  zones.forEach((z) => z.classList.add('drop-zone'));
  const zoneAt = (x, y) => {
    const pad = (opts.slop || 0) * scale();
    let found = null;
    let best = Infinity;
    zones.forEach((z) => {
      if (z.dataset.filled) return;
      const r = z.getBoundingClientRect();
      if (x < r.left - pad || x > r.right + pad || y < r.top - pad || y > r.bottom + pad) return;
      const d = Math.hypot(x - (r.left + r.right) / 2, y - (r.top + r.bottom) / 2);
      if (d < best) { best = d; found = z; }
    });
    return found;
  };

  cards.forEach((card) => {
    card.style.touchAction = 'none';
    card.addEventListener('pointerdown', (e) => {
      if (card.dataset.placed) return;
      e.preventDefault();
      const s = scale();
      const startX = e.clientX;
      const startY = e.clientY;
      card.setPointerCapture(e.pointerId);
      card.classList.add('is-dragging');

      const move = (ev) => {
        card.style.transform = 'translate(' + (ev.clientX - startX) / s + 'px,' + (ev.clientY - startY) / s + 'px)';
        const over = zoneAt(ev.clientX, ev.clientY);
        zones.forEach((z) => z.classList.toggle('is-over', z === over));
      };
      const up = (ev) => {
        card.removeEventListener('pointermove', move);
        card.removeEventListener('pointerup', up);
        card.removeEventListener('pointercancel', up);
        card.classList.remove('is-dragging');
        card.style.transform = '';
        zones.forEach((z) => z.classList.remove('is-over'));
        const zone = zoneAt(ev.clientX, ev.clientY);
        if (zone && zone.dataset.key === card.dataset.key) {
          card.dataset.placed = '1';
          zone.dataset.filled = '1';
          zone.appendChild(card);
          if (!opts.silent) playDrag();
          if (onRight) onRight(card, zone);
          if (onDone && zones.every((z) => z.dataset.filled)) onDone();
        } else if (onWrong) {
          onWrong(card, zone || null);
        }
      };
      card.addEventListener('pointermove', move);
      card.addEventListener('pointerup', up);
      card.addEventListener('pointercancel', up);
    });
  });
}

/* ==========================================================
   sa/04 감정 -> 표현 고르기 채팅(page06~08이 상황(DATA)만 다른 같은 구조라 공용화)
   - initEmotionChatFlow처럼 자동 실행되지 않고 페이지 <script>에서 명시적으로 호출
   - 마크업 id(talkChat, talkAsk, talkOptions, talkPopup, talkPopupCorrect, talkPopupWarn,
     talkPopupWarnText)는 page06~08에서 전부 동일(talkPopupCorrect는 step.correct가 있는 페이지만)
   - 감정 단계 오답은 딤 모달(talkPopupWarn), 표현 단계 오답은 딤 없는 팝업(talkPopup) — 둘 다 오답 아바타
   - step.correct 문구가 있으면 정답 뒤 정답 아바타 팝업(talkPopupCorrect)을 2.2초 보여주고 넘어감(없으면 0.7초)
   - 마지막 단계 뒤에는 finishModal(선택자)이 있으면 그 모달을 띄우고, 없으면 nextHref로 이동
   예시 호출:
     initEmotionPickFlow({
       chat: [{ who: '지우', me: false, text: '...' }, ...],
       steps: [{ kind: 'emotion', ask: '...', wrong: '...', options: [{ text: '고마움', correct: true }, ...] },
               { kind: 'message', ask: '...', wrong: '...', correct: '...', options: [...] }],
       nextHref: 'page07.html'
     });
========================================================== */
function initEmotionPickFlow(config) {
  const CHAT = config.chat;
  const STEPS = config.steps;
  const NEXT_HREF = config.nextHref;
  const FINISH_MODAL = config.finishModal || null;

  const chatBox = document.getElementById('talkChat');
  const askEl = document.getElementById('talkAsk');
  const optionsBox = document.getElementById('talkOptions');
  const popup = document.getElementById('talkPopup');
  const popupWarn = document.getElementById('talkPopupWarn');
  const popupWarnText = document.getElementById('talkPopupWarnText');

  const playCorrect = makeSfx('sound/correct.mp3');
  const playWrong = makeSfx('sound/incorrect.mp3');

  const popupCorrect = document.getElementById('talkPopupCorrect') || popup;

  // 아바타는 두고 문구 칸만 바꿈. 팝업이 겹치지 않게 다른 팝업은 먼저 닫음
  function show(el, textEl, html) {
    [popup, popupCorrect, popupWarn].forEach((p) => { if (p !== el) p.classList.add('is-off'); });
    textEl.innerHTML = html;
    flashLayer(el);
  }
  // 제목+보조 문구 구조(.avatar-popup-body)면 바뀌는 문구는 보조 칸에 넣음
  const textOf = (el) => el.querySelector('.avatar-popup-sub') || el.querySelector('.avatar-popup-text') || el;
  const showPopup = (html) => show(popup, textOf(popup), html);
  const showCorrectPopup = (html) => show(popupCorrect, textOf(popupCorrect), html);
  const showWarnPopup = (html) => show(popupWarn, popupWarnText, html);

  chatBox.innerHTML = CHAT.map((line) =>
    '<div class="talk-line' + (line.me ? ' is-me' : '') + '">' +
      '<span class="talk-avatar">' + line.who.charAt(0) + '</span>' +
      '<span class="talk-bubble"><span class="talk-who">' + line.who + '</span>' + line.text + '</span>' +
    '</div>').join('');

  let stepIndex = 0;

  function renderStep() {
    const step = STEPS[stepIndex];
    askEl.innerHTML = step.ask;
    optionsBox.innerHTML = '';
    optionsBox.classList.toggle('is-grid', step.kind === 'emotion');

    // 기획서(14~23p)에는 무작위 배치 지시가 없어 적은 순서 그대로 고정 표시
    step.options.forEach((opt) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = step.kind === 'emotion' ? 'card-btn talk-card' : 'emotion-option talk-msg';
      btn.innerHTML = opt.text;
      btn.addEventListener('click', () => {
        if (!opt.correct) {
          playWrong();
          btn.classList.remove('is-wrong');
          void btn.offsetWidth;
          btn.classList.add('is-wrong');
          if (step.kind === 'message') {
            showPopup(step.wrong);
          } else {
            showWarnPopup(step.wrong);
          }
          return;
        }

        btn.classList.add('is-selected');
        playCorrect();
        optionsBox.querySelectorAll('button').forEach((b) => { b.disabled = true; });

        if (step.correct) showCorrectPopup(step.correct);

        setTimeout(() => {
          stepIndex += 1;
          if (stepIndex < STEPS.length) {
            renderStep();
          } else if (FINISH_MODAL) {
            document.querySelector(FINISH_MODAL).classList.remove('is-off');
          } else {
            window.location.href = NEXT_HREF;
          }
        }, step.correct ? 2200 : 700);
      });
      optionsBox.appendChild(btn);
    });
  }

  renderStep();
}

/* ==========================================================
   sa/04 감정 이모티콘 채팅 흐름(page14~17이 상황(DATA)만 다른 같은 구조라 공용화) —
   다른 기능들과 달리 DOM을 스캔해 자동 실행되지 않고, 페이지별 <script>에서
   DATA/NEXT_HREF만 넘겨 명시적으로 호출해야 함(그래서 아래 자동 초기화 목록에는
   없음). 마크업 id(chatappChat, chatappGuide, chatappEmotions, chatappPicker, chatappPickerInput,
   chatappSearchBtn, .chatapp-keyword-btn, chatappCandidates, chatappEmojiBtn, chatappSendBtn,
   chatappNext, chatappPopup, chatappPopupText)는 page14~17에서 전부 동일하게 씀
   예시 호출(페이지 쪽 <script>에 남기는 부분):
     initEmotionChatFlow({
       data: {
         friend: '지우',
         friendMsg: '오늘 발표 진짜 잘했어!<br>열심히 준비한 게 느껴졌어',
         emotions: ['감사', '미안', '축하', '슬픔'],
         correctEmotion: '감사',
         wrongEmotion: '친구의 메시지를 다시 한 번 읽어봐요.',
         myMsg: '고마워!<br>떨렸지만 열심히 노력했어.',
         keyword: '감사',
         pickGuide: '고마운 마음을 담은 이모티콘을 찾았어요!<br>나의 마음에 드는 이모티콘을 선택해요.',
         candidates: ['🙏', '😊']
       },
       nextHref: 'page15.html'
     });
========================================================== */
function initEmotionChatFlow(config) {
  const DATA = config.data;
  const NEXT_HREF = config.nextHref;
  const FINISH_MODAL = config.finishModal || null;

  const chatBox = document.getElementById('chatappChat');
  const guideEl = document.getElementById('chatappGuide');
  const emotionsBox = document.getElementById('chatappEmotions');
  const picker = document.getElementById('chatappPicker');
  const pickerInput = document.getElementById('chatappPickerInput');
  const searchBtn = document.getElementById('chatappSearchBtn');
  const keywordBtn = document.querySelector('.chatapp-keyword-btn');
  const candidatesBox = document.getElementById('chatappCandidates');
  const emojiBtn = document.getElementById('chatappEmojiBtn');
  const sendBtn = document.getElementById('chatappSendBtn');
  const nextBtn = document.getElementById('chatappNext');
  const popup = document.getElementById('chatappPopup');
  const popupText = document.getElementById('chatappPopupText');

  const correctSound = new Audio(ASSET_BASE + 'sound/correct.mp3');
  const wrongSound = new Audio(ASSET_BASE + 'sound/incorrect.mp3');
  const clickSound = new Audio(ASSET_BASE + 'sound/click.mp3');
  const play = (audio) => audio.cloneNode().play().catch((err) => console.warn('사운드 재생 실패:', err));

  let pickedEmoji = null;

  function showPopup(html) {
    popupText.innerHTML = html;
    popup.classList.remove('is-off');
    clearTimeout(popup.__hideTimer);
    popup.__hideTimer = setTimeout(() => popup.classList.add('is-off'), 2000);
  }

  // 상대방(친구) 말풍선에는 이름을 위에 같이 보여주고, 내 말풍선은 아바타
  // 이니셜만으로 충분해서 이름 표시를 생략(채팅앱에서 흔한 관례)
  function addLine(who, html, me, isEmoji) {
    const line = document.createElement('div');
    line.className = 'chatapp-line is-new' + (me ? ' is-me' : '');
    const nameHtml = me ? '' : '<span class="chatapp-who">' + who + '</span>';
    line.innerHTML =
      '<span class="chatapp-avatar">' + who.charAt(0) + '</span>' +
      '<span class="chatapp-bubble' + (isEmoji ? ' is-emoji' : '') + '">' + nameHtml + html + '</span>';
    chatBox.appendChild(line);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  /* 1단계: 감정 고르기(기획서 34p) */
  function stageEmotion() {
    guideEl.innerHTML = '친구의 메시지를 읽었을 때<br>어떤 감정이 드나요?';
    emotionsBox.classList.remove('is-off');
    emotionsBox.innerHTML = '';

    const shuffled = DATA.emotions.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = t;
    }

    shuffled.forEach((label) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'emotion-option';
      btn.textContent = label;
      btn.addEventListener('click', () => {
        if (label !== DATA.correctEmotion) {
          play(wrongSound);
          btn.classList.remove('is-wrong');
          void btn.offsetWidth;
          btn.classList.add('is-wrong');
          showPopup(DATA.wrongEmotion);
          return;
        }
        play(correctSound);
        btn.classList.add('is-selected');
        emotionsBox.querySelectorAll('.emotion-option').forEach((b) => { b.disabled = true; });
        setTimeout(stageSent, 800);
      });
      emotionsBox.appendChild(btn);
    });
  }

  /* 2단계: 메시지 전송(기획서 36p) */
  function stageSent() {
    emotionsBox.classList.add('is-off');
    addLine('나', DATA.myMsg, true, false);
    guideEl.innerHTML = '친구에게 메시지를 보냈어요.<br>마음을 담은 이모티콘도 함께 보내 볼까요?';
    showNext(stageOpenPicker);
  }

  /* 3단계: 이모티콘 버튼 클릭(기획서 37p) */
  function stageOpenPicker() {
    guideEl.innerHTML = '이모티콘 버튼을 클릭해요.';
    emojiBtn.classList.remove('is-dim');
    pointFingerAt(emojiBtn);
    emojiBtn.addEventListener('click', function once() {
      emojiBtn.removeEventListener('click', once);
      emojiBtn.classList.add('is-on');
      clearFingers();
      picker.classList.remove('is-off');
      stageSearch();
    });
  }

  /* 4단계: 검색 버튼 클릭(기획서 38p) */
  function stageSearch() {
    guideEl.innerHTML = '검색 버튼을 클릭해요.';
    pointFingerAt(searchBtn);
    searchBtn.addEventListener('click', function once() {
      searchBtn.removeEventListener('click', once);
      clearFingers();
      stageKeyword();
    });
  }

  /* 5단계: 감정 키워드 입력(기획서 39p) — 이 버튼만은 손가락 안내 없이 바로 노출 */
  function stageKeyword() {
    guideEl.innerHTML = '어떤 감정을 표현해야 할까요?<br>오른쪽의 버튼을 클릭해 감정 키워드를 입력해요.';
    keywordBtn.textContent = '‘' + DATA.keyword + '’ 검색하기';
    keywordBtn.classList.remove('is-off');
    keywordBtn.addEventListener('click', function once() {
      keywordBtn.removeEventListener('click', once);
      keywordBtn.classList.add('is-selected');
      setTimeout(() => {
        keywordBtn.classList.add('is-off');
        pickerInput.textContent = DATA.keyword;
        stagePick();
      }, 300);
    });
  }

  /* 6단계: 이모티콘 선택(기획서 40p) — '다음' 누를 때까지 변경 가능 */
  function stagePick() {
    guideEl.innerHTML = DATA.pickGuide;
    candidatesBox.classList.remove('is-off');
    candidatesBox.innerHTML = '';

    DATA.candidates.forEach((emoji) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chatapp-candidate';
      btn.innerHTML = emoji;
      btn.addEventListener('click', () => {
        play(clickSound);
        candidatesBox.querySelectorAll('.chatapp-candidate').forEach((b) => b.classList.remove('is-selected'));
        btn.classList.add('is-selected');
        pickedEmoji = emoji;
        showNext(stageSend);
      });
      candidatesBox.appendChild(btn);
    });
  }

  /* 7단계: 보내기(기획서 41p) */
  function stageSend() {
    guideEl.innerHTML = '보내기 버튼을 클릭해 마음을 전송해요.';
    candidatesBox.querySelectorAll('.chatapp-candidate').forEach((b) => { b.disabled = true; });
    sendBtn.classList.remove('is-dim');
    pointFingerAt(sendBtn);
    sendBtn.addEventListener('click', function once() {
      sendBtn.removeEventListener('click', once);
      clearFingers();
      picker.classList.add('is-off');
      addLine('나', pickedEmoji, true, true);
      stageDone();
    });
  }

  /* 8단계: 전송 완료(기획서 42p) */
  function stageDone() {
    guideEl.innerHTML = '내 마음을 이모티콘으로<br>표현했어요!';
    showNext(() => {
      if (FINISH_MODAL) {
        document.querySelector(FINISH_MODAL).classList.remove('is-off');
      } else {
        window.location.href = NEXT_HREF;
      }
    });
  }

  // 단계마다 같은 '다음' 버튼을 재사용하되, 누를 때 할 일만 갈아 끼움
  // js-img-swap은 한 번 눌리면 is-swapped가 계속 남는데, 이 버튼은 여러
  // 단계에서 같은 엘리먼트를 재사용하다 보니 다음번에 다시 나타날 때도
  // 눌린(_on) 이미지로 보이는 문제가 있어서 보여줄 때마다 원본으로 리셋
  function showNext(handler) {
    const nextImg = nextBtn.querySelector('.js-img-swap');
    if (nextImg) {
      nextImg.classList.remove('is-swapped');
      nextImg.src = nextImg.dataset.originalSrc || nextImg.src;
    }
    nextBtn.classList.remove('is-off');
    nextBtn.__handler = handler;
  }
  // is-off(display:none)를 클릭과 같은 틱에 걸면 클릭 이미지(_on)로 바뀐 게
  // 화면에 그려지기도 전에 사라져 버려서, 잠깐 보여준 뒤에 숨기고 다음으로 넘어감
  nextBtn.addEventListener('click', () => {
    const handler = nextBtn.__handler;
    nextBtn.__handler = null;
    setTimeout(() => {
      nextBtn.classList.add('is-off');
      if (handler) handler();
    }, 300);
  });

  addLine(DATA.friend, DATA.friendMsg, false, false);
  stageEmotion();
}

/* ==========================================================
   기능 Z: 예/아니오 판단 퀴즈 팝업 — 버튼을 누르면 실제 이동 대신
           질문 팝업이 뜨고, 정답을 골라야 실제로 이동함
   - .confirm-quiz-trigger(원래 이동할 href를 가진 <a>)를 클릭하면 실제
     이동은 막고, data-confirm-quiz로 지정한 .confirm-quiz 팝업을 띄움
   - .confirm-quiz 안은 세 부분:
     · .confirm-quiz-question: 질문 + .confirm-quiz-choice 버튼들
       (data-correct="true"인 것이 정답)
     · .confirm-quiz-correct: 정답을 골랐을 때 뜨는 설명 + 확인 버튼
       → 확인 버튼에 data-next-quiz="<선택자>"가 있으면 이 팝업은 닫고
         해당 선택자의 .confirm-quiz 팝업을 이어서 띄움(팝업 체이닝,
         여러 판단 퀴즈를 연달아 보여줄 때 사용)
       → data-next-quiz가 없고 data-next-href="<url>"이 있으면 팝업을
         닫고 실제로 그 주소로 이동(체이닝의 마지막 단계)
       → 둘 다 없으면 그냥 팝업만 닫음
     · .confirm-quiz-wrong: 오답을 골랐을 때 뜨는 설명 + 확인 버튼
       → 확인을 누르면 다시 같은 팝업의 .confirm-quiz-question으로
         돌아가 재선택
   - .confirm-quiz-question/.confirm-quiz-choices가 없는 팝업(안내문 하나 +
     확인 버튼만 있는 마지막 단계)도 가능: 이 경우 .confirm-quiz-correct를
     hidden 없이 바로 보이는 상태로 두면 됨(체이닝으로 도달했을 때 바로
     보임)
   예시 마크업:
     <a href="page15.html" class="p14-next hidden confirm-quiz-trigger" data-confirm-quiz=".p14-confirm-quiz">
       <img src="../../img/common/btn_next_content.png" class="js-img-swap js-sfx" data-sound="sound/click.mp3" alt="다음">
     </a>
     <div class="confirm-quiz p14-confirm-quiz hidden">
       <div class="confirm-quiz-panel confirm-quiz-question">
         <p class="confirm-quiz-text">질문...</p>
         <div class="confirm-quiz-choices">
           <button class="fix-word-option confirm-quiz-choice" data-correct="false">예</button>
           <button class="fix-word-option confirm-quiz-choice" data-correct="true">아니오</button>
         </div>
       </div>
       <div class="confirm-quiz-panel confirm-quiz-correct hidden">
         <p class="confirm-quiz-text">정답 설명...</p>
         <button class="fix-word-option confirm-quiz-ok">확인</button>
       </div>
       <div class="confirm-quiz-panel confirm-quiz-wrong hidden">
         <p class="confirm-quiz-text">오답 설명...</p>
         <button class="fix-word-option confirm-quiz-ok">확인</button>
       </div>
     </div>
   - 트리거에는 일부러 js-nav-effect를 안 붙임(실제 이동은 이 모듈이 직접
     처리) — 대신 js-sfx/js-img-swap은 그대로 둬도 독립적으로 잘 동작함
   - 다른 기능을 몰라도 되는 완전히 독립적인 모듈
========================================================== */
function initConfirmQuiz() {
  document.querySelectorAll('.confirm-quiz-trigger').forEach((trigger) => {
    const selector = trigger.dataset.confirmQuiz;
    const quiz = selector ? document.querySelector(selector) : null;
    if (!quiz) return;

    trigger.addEventListener('click', (e) => {
      e.preventDefault(); // 실제 이동은 정답을 맞혀야만 함
      quiz.classList.remove('hidden');
    });
  });

  // 트리거가 없는 팝업(체이닝으로만 열리는 두 번째/세 번째 단계)도 있으므로
  // .confirm-quiz 전체를 대상으로 내부 동작을 따로 초기화
  document.querySelectorAll('.confirm-quiz').forEach((quiz) => {
    const questionPanel = quiz.querySelector('.confirm-quiz-question');
    const correctPanel = quiz.querySelector('.confirm-quiz-correct');
    const wrongPanel = quiz.querySelector('.confirm-quiz-wrong');

    if (questionPanel) {
      questionPanel.querySelectorAll('.confirm-quiz-choice').forEach((btn) => {
        btn.addEventListener('click', () => {
          questionPanel.classList.add('hidden');
          const panel = btn.dataset.correct === 'true' ? correctPanel : wrongPanel;
          if (panel) panel.classList.remove('hidden');
        });
      });
    }

    if (correctPanel) {
      const ok = correctPanel.querySelector('.confirm-quiz-ok');
      if (ok) {
        ok.addEventListener('click', () => {
          const nextQuiz = ok.dataset.nextQuiz ? document.querySelector(ok.dataset.nextQuiz) : null;
          quiz.classList.add('hidden');
          if (nextQuiz) {
            nextQuiz.classList.remove('hidden');
          } else if (ok.dataset.nextHref) {
            navigateTo(ok.dataset.nextHref);
          }
        });
      }
    }

    if (wrongPanel) {
      const ok = wrongPanel.querySelector('.confirm-quiz-ok');
      if (ok) {
        ok.addEventListener('click', () => {
          wrongPanel.classList.add('hidden');
          if (questionPanel) questionPanel.classList.remove('hidden'); // 다시 고르게
        });
      }
    }
  });
}

/* ==========================================================
   공통 유틸: 아직 화면에 안 나온 이미지를 유휴 시간에 미리 받아둠
   - .step-panel.is-hidden은 display:none이라, 그 안의 배경 통이미지
     (round2/round3처럼 1MB가 넘는 전체화면 PNG)를 브라우저가 스텝이
     실제로 보이는 순간에야 받기 시작함 → 전환할 때 한 번 허옇게 비침
   - 페이지별 CSS는 각 html의 인라인 <style>에 있으므로(프로젝트 관례)
     그 텍스트에서 url(...)만 긁어서 미리 로드하면 서버 없이 file://
     에서도 그대로 동작함. 외부 css의 cssRules는 file://에서 접근이
     막히는 브라우저가 있어 일부러 건드리지 않음
   - 지금 보이는 화면의 로딩을 방해하지 않도록 load 이후 유휴 시점에만 실행
========================================================== */
function initIdlePreload() {
  const seen = new Set();

  function preload(src) {
    if (!src || seen.has(src)) return;
    if (/^(data:|https?:|blob:)/.test(src)) return;
    seen.add(src);
    new Image().src = src;
  }

  function collect() {
    document.querySelectorAll('style').forEach((styleEl) => {
      const css = styleEl.textContent || '';
      const re = /url\(\s*['"]?([^)'"]+\.(?:png|jpg|jpeg|gif|webp|svg))['"]?\s*\)/gi;
      let m;
      while ((m = re.exec(css)) !== null) preload(m[1]);
    });

    // 마크업에 직접 적힌 교체용 이미지들(호버/선택/정답 상태).
    // js-img-swap이 안 붙은 find-star 같은 요소까지 여기서 한 번에 커버함
    document
      .querySelectorAll('[data-src-on],[data-src-alt],[data-src-over]')
      .forEach((el) => {
        preload(el.dataset.srcOn);
        preload(el.dataset.srcAlt);
        preload(el.dataset.srcOver);
      });
  }

  function schedule() {
    if (window.requestIdleCallback) {
      window.requestIdleCallback(collect, { timeout: 3000 });
    } else {
      setTimeout(collect, 600);
    }
  }

  if (document.readyState === 'complete') schedule();
  else window.addEventListener('load', schedule, { once: true });
}

/* 지그소 조건 퍼즐: 판(2x2 칸) 4개를 정답 조각으로 채우는 게임. 판마다 정답 4 + 오답 2개 조각, 다 맞추면 다음 판/다음 페이지.
   마크업(.jig-* 클래스는 css/common.css, 위치는 페이지 CSS에서):
     <p class="guide-bubble is-center p05-bubble"></p>
     <div class="jig-board"><div class="jig-grid"></div></div>
     <div class="jig-tray-label">조건 퍼즐 조각</div><div class="jig-tray"></div>
     <a href="javascript:;" class="js-sfx jig-next is-off p05-next" data-sound="sound/click.mp3"><img ...다음 버튼></a>
   호출: initJigsawPuzzle({ next: 'page06.html', puzzles: [{ ask, done, pieces: [{ text, cell: 0~3(정답 칸) }, ..., { text }(오답)] }] })
   cell: 0 왼쪽 위, 1 오른쪽 위, 2 왼쪽 아래, 3 오른쪽 아래. 오답 조각은 cell을 생략 */
function initJigsawPuzzle(cfg) {
  const PUZZLES = cfg.puzzles;
  const bubble = document.querySelector('main .guide-bubble');
  const grid = document.querySelector('main .jig-grid');
  const tray = document.querySelector('main .jig-tray');
  const nextBtn = document.querySelector('main .jig-next');

  // 지그소 조각 변: 위·오른쪽·아래·왼쪽 순, 0 평평 / 1 튀어나옴 / -1 들어감. 조각은 판의 4가지 칸 모양만 씀(오답은 그중 무작위)
  const CELL_EDGES = [[0, 1, -1, 0], [0, 0, 1, -1], [1, -1, 0, 0], [-1, 0, 0, 1]];
  const COLORS = ['#fff3b8', '#cfe6ff', '#d6f5c8', '#ffd6e2', '#eee8ff', '#ffe3c7'];
  const S = 260;
  const M = 74;

  let index = 0;
  let filled = 0;
  let bubbleTimer = null;

  function jigPath(s, m, edges) {
    const corners = [[m, m], [m + s, m], [m + s, m + s], [m, m + s]];
    const dirs = [[1, 0], [0, 1], [-1, 0], [0, -1]];
    const knob = [[0.42, 0, 0.41, 0.07, 0.39, 0.11], [0.35, 0.18, 0.4, 0.27, 0.5, 0.27], [0.6, 0.27, 0.65, 0.18, 0.61, 0.11], [0.59, 0.07, 0.58, 0, 0.62, 0]];
    let d = 'M' + m + ' ' + m;
    edges.forEach((e, k) => {
      const [x0, y0] = corners[k];
      const [dx, dy] = dirs[k];
      const pt = (u, v) => (x0 + (u * dx + v * e * dy) * s).toFixed(1) + ' ' + (y0 + (u * dy - v * e * dx) * s).toFixed(1);
      if (e) {
        d += ' L' + pt(0.38, 0);
        knob.forEach((c) => { d += ' C' + pt(c[0], c[1]) + ' ' + pt(c[2], c[3]) + ' ' + pt(c[4], c[5]); });
      }
      d += ' L' + pt(1, 0);
    });
    return d + ' Z';
  }

  function jigSvg(s, m, edges, fill) {
    const w = s + m * 2;
    return '<svg class="jig" width="' + w + '" height="' + w + '" viewBox="0 0 ' + w + ' ' + w + '"><path d="' + jigPath(s, m, edges) + '"' + (fill ? ' style="fill:' + fill + '"' : '') + '/></svg>';
  }

  // 들어간 변 쪽은 홈 깊이만큼 비워서 글자·아이콘이 조각 밖으로 안 나가게 함
  function labelBox(s, m, edges, x, y) {
    const pad = Math.round(s * 0.06);
    const [t, r, b, l] = edges.map((e) => (e < 0 ? Math.round(s * 0.3) : pad));
    return 'left:' + (x + m + l) + 'px;top:' + (y + m + t) + 'px;width:' + (s - l - r) + 'px;height:' + (s - t - b) + 'px';
  }

  function drawCell(i, text, fill) {
    const x = (i % 2) * S;
    const y = Math.floor(i / 2) * S;
    const slot = grid.children[i * 2];
    const label = grid.children[i * 2 + 1];
    slot.innerHTML = jigSvg(S, M, CELL_EDGES[i], fill);
    slot.classList.toggle('is-filled', !!fill);
    slot.style.cssText = 'left:' + x + 'px;top:' + y + 'px';
    label.className = 'jig-label' + (fill ? '' : ' is-hint');
    label.style.cssText = labelBox(S, M, CELL_EDGES[i], x, y);
    label.innerHTML = text;
  }

  function render() {
    const p = PUZZLES[index];
    bubble.innerHTML = p.ask;
    filled = 0;
    nextBtn.classList.add('is-off');
    resetImageSwap(nextBtn);
    grid.innerHTML = '<div class="jig-slot"></div><div></div>'.repeat(4);
    for (let i = 0; i < 4; i++) drawCell(i, p.pieces.find((x) => x.cell === i).text);
    tray.innerHTML = '';
    const shaped = p.pieces.map((piece, i) => ({ piece, color: COLORS[i], edges: CELL_EDGES[piece.cell === undefined ? Math.floor(Math.random() * 4) : piece.cell] }));
    shuffleArray(shaped).forEach(({ piece, color, edges }) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'jig-piece';
      btn.innerHTML = jigSvg(180, 52, edges, color) + '<span class="jig-label" style="' + labelBox(180, 52, edges, 0, 0) + '">' + piece.text + '</span>';
      btn.addEventListener('click', () => pick(btn, piece, color));
      tray.appendChild(btn);
    });
  }

  function pick(btn, piece, color) {
    const p = PUZZLES[index];
    if (piece.cell === undefined) {
      playWrong();
      btn.classList.remove('is-wrong');
      void btn.offsetWidth;
      btn.classList.add('is-wrong');
      bubble.innerHTML = '다시 생각해볼까요?';
      clearTimeout(bubbleTimer);
      bubbleTimer = setTimeout(() => { bubble.innerHTML = p.ask; }, 1000);
      const hints = Array.from(grid.querySelectorAll('.jig-label.is-hint'));
      hints.forEach((h) => h.classList.add('is-on'));
      setTimeout(() => hints.forEach((h) => h.classList.remove('is-on')), 1000);
      return;
    }
    playCorrect();
    btn.classList.add('is-used');
    drawCell(piece.cell, piece.text, color);
    filled += 1;
    if (filled === 4) {
      clearTimeout(bubbleTimer);
      bubble.innerHTML = p.done;
      nextBtn.classList.remove('is-off');
    }
  }

  nextBtn.addEventListener('click', () => {
    setTimeout(() => {
      if (index < PUZZLES.length - 1) {
        index += 1;
        render();
      } else {
        navigateTo(cfg.next);
      }
    }, 300);
  });

  render();
}

// 남은 기능들은 서로 참조하지 않으므로 순서 상관없이 각각 초기화
// (단, initStepFlow는 initLinkEffect보다 반드시 먼저 실행)
initStepFlow();
initClickSound();
initImageSwap();
initLinkEffect();
initOxQuiz();
initDragQuiz();
initLineMatchQuiz();
initFindQuiz();
initVideoPlay();
initScrollToShowNav();
initFingerGuide();
initSwipeGuide();
initTocLayer();
initHintQuiz();
initMultiSelectGate();
initClausePreview();
initPromptBuilder();
initFixPromptGame();
initAnswerPickQuiz();
initPromptFixQuiz();
initLoadingSequence();
initConfirmQuiz();
initRevealStagger();
initParticleEffect();
initIdlePreload();