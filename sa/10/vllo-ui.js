/* VLLO 앱 화면(HTML/CSS). 좌표는 모두 디자인 캡처(1080x2340)의 절반인 540x1170 기준 px, 글꼴은 전부 Pretendard.
   VL.screen(이름, 옵션) 이 화면 한 장의 HTML 글자를 돌려줌. 영상 칸(#vlViewer)·자막·블러는 화면에 포함되지 않고 페이지가 따로 둠(영상이 끊기지 않게). 스타일은 page09.html 의 .v-* */
(function () {
  const VL = window.VL = {};
  const I = {
    back: ICONS.chevL,
    help: ICONS.help,
    dots: ICONS.dotsH,
    gear: ICONS.gear,
    out: ICONS.out,
    play: ICONS.play,
    full: ICONS.expand,
    undo: ICONS.undo,
    redo: ICONS.redo,
    first: ICONS.first,
    prev: ICONS.prev,
    next: ICONS.next,
    last: ICONS.last,
    plus: ICONS.plusCircle,
    music: ICONS.music,
    wave: ICONS.wave,
    mic: ICONS.mic,
    aiv: ICONS.aiv,
    text: ICONS.text,
    label: ICONS.label,
    sub: ICONS.sub,
    autosub: ICONS.autosub,
    filter: ICONS.filter,
    special: ICONS.special,
    distort: ICONS.distort,
    trash: ICONS.trash,
    listen: ICONS.listen,
    moveto: ICONS.moveto,
    pencil: ICONS.pencil,
    start: ICONS.start,
    scissors: ICONS.scissors,
    chevL: ICONS.chevL,
    chevR: ICONS.chevR,
    swap: ICONS.swap,
    folder: ICONS.folder,
    waveform: ICONS.waveform,
    check: ICONS.check,
    mute: ICONS.mute,
    noise: ICONS.noise,
    echo: ICONS.mic,
    fade: ICONS.fade,
    speed: ICONS.speed,
    vol: ICONS.vol,
    keyfr: ICONS.keyfr,
    gridI: ICONS.gridI,
    magnet: ICONS.magnet,
    crown: ICONS.crown,
    gift: ICONS.gift,
    menu: ICONS.menu,
    mark: ICONS.markFlag
  };
  VL.I = I;

  const t = (n) => (n < 10 ? '0' : '') + n;
  const box = (cls, x, y, w, h, inner, st) => '<div class="' + cls + '" style="left:' + x + 'px;top:' + y + 'px;width:' + w + 'px;height:' + h + 'px' + (st ? ';' + st : '') + '">' + (inner || '') + '</div>';
  const txt = (cls, x, y, s, w) => '<p class="' + cls + '" style="left:' + x + 'px;top:' + y + 'px' + (w ? ';width:' + w + 'px' : '') + '">' + s + '</p>';

  /* ---------- 공통 조각 ---------- */
  const appBar = (o = {}) => {
    let s = '<div class="v-bar"></div>';
    if (o.back) s += '<i class="v-ic" style="left:20px;top:58px;width:34px;height:34px">' + I.back + '</i>';
    s += '<i class="v-ic is-help" style="left:81px;top:60px;width:32px;height:32px">' + I.help + '</i>';
    if (o.title) {
      s += txt('v-title', 120, 66, '제목 없음 (2.12:1)<i class="v-ic" style="width:20px;height:20px;margin-left:6px;vertical-align:-4px">' + I.gear + '</i>', 300);
      s += '<div class="v-out" style="left:438px;top:61px"><i class="v-ic" style="width:18px;height:18px">' + I.out + '</i>추출하기</div>';
    }
    if (o.grid) s += '<i class="v-ic is-blue" style="left:503px;top:56px;width:30px;height:30px;left:' + 428 + 'px">' + I.gridI + '</i><i class="v-ic is-blue" style="left:476px;top:56px;width:30px;height:30px">' + I.magnet + '</i>';
    return s;
  };
  const playRow = (o = {}) => {
    let s = '';
    if (o.play !== false) s += '<i class="v-rb" style="left:15px;top:649px">' + I.play + '</i>';
    if (o.full) s += '<i class="v-rb" style="left:77px;top:649px">' + I.full + '</i>';
    if (o.undo !== undefined) s += '<i class="v-rb' + (o.undo ? '' : ' is-dim') + '" style="left:423px;top:649px">' + I.undo + '</i><i class="v-rb is-dim" style="left:484px;top:649px">' + I.redo + '</i>';
    return s;
  };
  const ruler = (dots, labels) => {
    let s = '<div class="v-ruler"></div>';
    (dots || []).forEach((x) => { s += '<b class="v-dot" style="left:' + (x - 2) + 'px"></b>'; });
    return s;
  };
  const transport = (a, b) => '<div class="v-trans"><i style="left:0">' + I.first + '</i><i style="left:90px">' + I.prev + '</i><u>' + a + '</u><u style="left:298px;color:#9a9b9f">' + b + '</u><i style="left:361px">' + I.next + '</i><i style="left:451px">' + I.last + '</i></div>';
  const playhead = (y1) => '<div class="v-head" style="height:' + ((y1 || 1111) - 702) + 'px"></div>';
  const sideIcon = (ic, cy, label, nw) => '<div class="v-side" style="top:' + (cy - 16) + 'px"><i class="v-ic">' + ic + '</i><span>' + label + '</span>' + (nw ? '<em>New</em>' : '') + '</div>';
  const trackArea = (rows) => '<div class="v-trk"></div>' + rows;
  const tabs = (active) => {
    const L = ['오디오', '그래픽', '글자', 'PIP', '효과'], X = [70.5, 169.5, 269.5, 369, 468.5], C = ['#6d9fd8', '#c7a6d3', '#7ca593', '#9fa3b8', '#b799bb'];
    let s = '<div class="v-tabs"></div>';
    if (active >= 0) s += '<div class="v-tab-on" style="left:' + (X[active] - 44) + 'px;background:' + (C[active] || '#6d9fd8') + '"></div>';
    L.forEach((n, i) => { s += '<span class="v-tab' + (i === active ? ' is-on' : '') + '" style="left:' + (X[i] - 44) + 'px">' + n + '</span>'; });
    return s;
  };
  // const template = () => '<div class="v-tpl"><i class="v-ic">' + ICONS.playClip + '</i><span>템플릿</span></div>';
  const template = () => '';
  const bigBtn = (x, y, w, h, label, c, cls) => '<div class="v-btn ' + (cls || '') + '" style="left:' + x + 'px;top:' + y + 'px;width:' + w + 'px;height:' + h + 'px;background:' + c + '">' + label + '</div>';
  const clipThumb = (x, w, cls, inner) => '<div class="v-clip ' + (cls || '') + '" style="left:' + x + 'px;width:' + w + 'px"><div class="v-frames"></div>' + (inner || '') + '</div>';
  const badge = (x2, y, tt, o = {}) => '<em class="v-badge' + (o.c ? ' ' + o.c : '') + '" style="left:' + (x2 - (o.w || 41)) + 'px;top:' + y + 'px;width:' + (o.w || 41) + 'px">' + tt + '</em>';
  const swapIc = () => '<i class="v-ic" style="left:508px;top:783px;width:26px;height:26px">' + I.swap + '</i>';
  const moveBtn = (cx) => '<i class="v-move" style="left:' + (cx - 17.5) + 'px;top:777px">' + ICONS.moveAll + '</i>';
  const wave = (x0, n, bot, seed, c) => {
    let s = '', r = seed || 7;
    for (let i = 0; i < n; i++) { r = (r * 9301 + 49297) % 233280; const h = 3 + (r / 233280) * 22 * (0.4 + 0.6 * Math.abs(Math.sin(i * 0.31 + seed))); s += '<b style="left:' + (x0 + i * 3) + 'px;height:' + h.toFixed(1) + 'px;bottom:' + bot + 'px;background:' + (c || '#b9babd') + '"></b>'; }
    return '<div class="v-wave">' + s + '</div>';
  };

  /* 편집기 바탕(디자인 1): 앱바 + 재생줄 + 눈금 + 타임라인 + 오른쪽 클립 + 탭 */
  const editor = (o = {}) => appBar({ back: 1, title: 1 }) + playRow({ full: 1, undo: o.undo ? 1 : 0 }) + ruler(o.dots || [360, 450, 539]) + transport('00:00<sup>00</sup>', o.t2 || '00:05') + trackArea(o.rows || '') + (o.clip === false ? '' : clipThumb(271, 229, 'is-main', '') + badge(497, 809, o.t2 || '00:05', { w: 40 })) + (o.clip === false ? '' : swapIc()) + playhead() + (o.tpl === false ? '' : template()) + tabs(o.tab === undefined ? 0 : o.tab);

  const audioRows = () => sideIcon(I.plus, 779, '미디어') + sideIcon(I.music, 853, '배경음악', 1) + sideIcon(I.wave, 921, '효과음', 1) + sideIcon(I.mic, 991, '음성 녹음') + sideIcon(I.aiv, 1058, 'AI 보이스', 1);
  const textRows = () => sideIcon(I.plus, 779, '미디어') + sideIcon(I.text, 853, '글자') + sideIcon(I.label, 921, '라벨') + sideIcon(I.sub, 991, '자막') + sideIcon(I.autosub, 1058, '자동 자막');
  const fxRows = () => sideIcon(I.plus, 779, '미디어') + sideIcon(I.filter, 853, '필터/보정') + sideIcon(I.special, 921, '특수효과') + sideIcon(I.distort, 991, '왜곡<br>(모자이크)');
  VL.rows = { audio: audioRows, text: textRows, fx: fxRows };

  /* 클립 편집기(디자인 4~6): 위쪽 클립 줄 + 파형 + 도구 두 줄 */
  const clipTop = (o = {}) => appBar({ grid: o.grid }) + playRow({ undo: o.undo ? 1 : 0, full: o.full }) + ruler(o.dots || [360, 450, 539]) + transport('00:00<sup>00</sup>', o.t2 || '00:05') + '<div class="v-trk is-clip"></div>';
  const tools1 = (dis) => {
    const L = [['처음부터', I.start], ['여기부터', I.first], ['분할', I.scissors], ['여기까지', I.last], ['끝까지', I.next]];
    return '<i class="v-ic v-chev" style="left:6px;top:979px">' + I.chevL + '</i><i class="v-ic v-chev" style="left:520px;top:979px">' + I.chevR + '</i>' + L.map((a, i) => '<div class="v-tool' + (dis && dis.indexOf(i) >= 0 ? ' is-dim' : '') + '" style="left:' + (88 + i * 92) + 'px;top:960px"><i class="v-ic">' + a[1] + '</i><span>' + a[0] + '</span></div>').join('');
  };

  /* ---------- 화면 목록 ---------- */
  const SC = {};
  /* 0: 프로젝트 목록(디자인 0) */
  SC.list = () => '<div class="v-full is-list">'
    + '<i class="v-ic" style="left:36px;top:74px;width:34px;height:34px">' + I.menu + '</i>'
    + '<div class="v-pill is-blue" style="left:348px;top:72px;width:97px;height:34px"><i class="v-ic" style="width:17px;height:17px">' + I.gift + '</i>친구 초대</div>'
    + '<div class="v-crown" style="left:467px;top:70px"><i class="v-ic">' + I.crown + '</i></div>'
    + '<div class="v-banner"><img src="img/p09_banner.png" alt=""></div>'
    + '<p class="v-mp">내 프로젝트 (0) <i class="v-ic is-down">' + ICONS.chevCircle + '</i></p>'
    + '<i class="v-ic v-lv" style="left:372px;top:455px">' + ICONS.watch + '</i><i class="v-ic v-lv" style="left:431px;top:455px">' + ICONS.blocksDown + '</i><span class="v-sel">선택</span>'
    + '<div class="v-load"><i class="v-ic">' + ICONS.fileDown + '</i>프로젝트 불러오기</div>'
    + '</div>';

  /* 1: 편집기 첫 화면(디자인 1) */
  SC.audio = () => editor({ rows: audioRows(), tab: 0 });
  /* 2/3: 음성 녹음(디자인 2, 3) */
  SC.record = (o = {}) => appBar({}) + playRow({ undo: 0 }) + ruler(o.rec ? [60, 130, 200, 245, 270, 330, 400, 460] : [360, 450, 539]) + transport(o.rec ? '00:01<sup>02</sup>' : '00:00<sup>00</sup>', '00:05') + '<div class="v-trk is-rec"></div>'
    + (o.rec ? '<div class="v-recclip" style="left:79px;width:190px"></div>' : '') + clipThumb(271, 270, 'is-main is-dimclip', '') + playhead(878)
    + '<div class="v-recpanel"></div>'
    + (o.rec ? '' : '<div class="v-timer"><i class="v-ic">' + ICONS.timer3 + '</i>타이머</div>')
    + '<p class="v-rtime">' + (o.rec ? '00:01' : '00:00') + '</p>'
    + '<div class="v-rbtn"><b class="' + (o.rec ? 'is-stop' : '') + '"></b></div>'
    + '<div class="v-cancel">취소</div>';
  /* 4: 녹음 파일(디자인 4) */
  SC.recdone = () => clipTop({ undo: 1, full: 0 }) + moveBtn(193) + '<div class="v-aclip"><i class="v-lh">' + I.chevL + '</i><div class="v-ab"><span class="v-an"><i class="v-ic">' + ICONS.mic + '</i>V1</span>' + wave(8, 82, 8, 5, '#fff') + '<em class="v-badge is-a" style="right:4px;bottom:3px">00:04</em></div></div>'
    + playhead(876) + '<div class="v-name"><span>파일명 :</span><b>V1</b><i class="v-ic">' + I.pencil + '</i></div>'
    + '<div class="v-act" style="left:152px"><i class="v-ic">' + I.trash + '</i><span>삭제</span></div><div class="v-act" style="left:270px"><i class="v-ic">' + I.listen + '</i><span>듣기</span></div><div class="v-act" style="left:388px"><i class="v-ic">' + I.moveto + '</i><span>여기로 이동</span></div>'
    + '<div class="v-add"><b class="v-rdot"></b>추가</div>' + bigBtn(200, 1112, 324, 55, '완료', '#0a9cf7', 'is-done');
  /* 5/6: 클립 도구(디자인 5, 6): second 이면 오른쪽으로 밀려 자동 자막이 보이는 줄. slide=0~1 */
  VL.NAVW = 358;
  const row2items = [['추가', I.plus, 164], ['음소거', I.mute, 251], ['음량', I.vol, 339], ['노이즈 제거', I.noise, 434], ['페이드', I.fade, 512], ['오디오 이펙트', I.waveform, 605], ['에코&amp;리버브', I.echo, 698], ['자동 자막', I.autosub, 786], ['배속', I.speed, 866]];
  SC.clip = (o = {}) => {
    const off = (o.slide || 0) * VL.NAVW;
    let s = clipTop({ undo: 1, grid: 0 }) + moveBtn(193) + '<div class="v-aclip"><i class="v-lh">' + I.chevL + '</i><div class="v-ab"><span class="v-an"><i class="v-ic">' + ICONS.mic + '</i>V1</span>' + wave(8, 82, 8, 5, '#fff') + '<em class="v-badge is-a" style="right:4px;bottom:3px">00:04</em></div></div>'
      + '<div class="v-sidetabs"><i class="v-ic">' + I.folder + '</i><i class="v-ic">' + I.waveform + '</i></div>' + wave(274, 60, 12, 3, '#b9babd').replace('class="v-wave"', 'class="v-wave is-low"') + playhead(951) + tools1([2, 3]);
    s += '<div class="v-row2"><div class="v-row2-fix"><i class="v-ic">' + I.trash + '</i><span>삭제</span></div><div class="v-row2-clip"><div class="v-row2-in" id="vlRow2" style="transform:translateX(' + (-off) + 'px)">';
    row2items.forEach((a) => { s += '<div class="v-r2" style="left:' + (a[2] - 45 - 100) + 'px"><i class="v-ic">' + a[1] + '</i><span>' + a[0] + '</span></div>'; });
    s += '</div></div></div>' + bigBtn(10, 1112, 521, 55, '완료', '#0a9cf7', 'is-done');
    return s;
  };
  /* 7: 자막 생성 범위(디자인 7) */
  SC.subrange = () => clipTop({ undo: 1 }) + moveBtn(193) + '<div class="v-aclip is-ai"><i class="v-lh">' + I.chevL + '</i><div class="v-ab"><span class="v-an is-sm">자막 생성 범위</span>' + wave(8, 82, 14, 11, '#cfd8e6') + '<em class="v-badge is-a" style="right:4px;bottom:3px">00:04</em></div></div>'
    + '<div class="v-tools4"><div class="v-tool is-dim" style="left:46px;top:886px"><i class="v-ic">' + I.start + '</i><span>처음부터</span></div><div class="v-tool is-dim" style="left:163px;top:886px"><i class="v-ic">' + I.first + '</i><span>여기부터</span></div><div class="v-tool is-dim" style="left:277px;top:886px"><i class="v-ic">' + I.last + '</i><span>여기까지</span></div><div class="v-tool" style="left:400px;top:886px"><i class="v-ic">' + I.next + '</i><span>끝까지</span></div></div>'
    + '<div class="v-aiopt"><i>AI</i>더 정확한 처리<u class="v-tog"><b></b></u></div>'
    + '<div class="v-sel2" style="left:17px"><span>오디오 : <b>음성 녹음</b></span><i class="v-ic">' + ICONS.refresh + '</i></div><div class="v-sel2" style="left:278px"><span>언어 : <b>한국어</b></span><i class="v-ic">' + ICONS.refresh + '</i></div>'
    + bigBtn(17, 1112, 238, 55, '취소', '#4c4d50') + bigBtn(272, 1112, 252, 55, '생성하기', '#0a9cf7', 'is-done');
  /* 로딩 화면(자막 생성 중 / 트래킹 중 / 비디오 만드는 중): msg, warn, pct(0~1), cls */
  SC.loading = (o = {}) => '<div class="v-full is-load' + (o.cls ? ' ' + o.cls : '') + '">'
    + (o.back ? '<i class="v-ic" style="left:20px;top:58px;width:34px;height:34px">' + I.back + '</i>' : '')
    + '<div class="v-logo" id="vlLogo">' + VL.logoSvg + '</div>'
    + '<p class="v-lmsg">' + o.msg + '</p>'
    + '<div class="v-lbar"><i id="vlLoadBar"></i></div><u class="v-lpct" id="vlLoadPct">0%</u>'
    + (o.warn ? '<p class="v-lwarn"><i class="v-ic is-warn">' + ICONS.warn + '</i>' + o.warn + '</p>' : '')
    + (o.tip ? '<div class="v-tip"><b>VLLO TIP</b><div class="v-tipc"><span>' + o.tip + '</span></div></div>' : '') + '</div>';
  /* 8: 자막 만들어진 뒤 글자 탭(디자인 8) */
  SC.subdone = (o = {}) => clipTop({ undo: 1, grid: 1 }) + moveBtn(193) + '<div class="v-aclip is-sub"><i class="v-lh">' + I.chevL + '</i><div class="v-ab"><span class="v-an"><i class="v-ic">' + I.sub + '</i>' + (o.text || '') + '</span><em class="v-badge is-a" style="right:4px;bottom:3px">00:03</em></div></div>'
    + '<div class="v-kf"><i class="v-ic">' + I.keyfr + '</i><span>변형<br>키프레임</span><u class="v-tog"><b></b></u></div><div class="v-sidetabs"><i class="v-ic">' + I.folder + '</i><i class="v-ic">' + I.waveform + '</i></div>' + playhead(951) + tools1([2, 3])
    + '<div class="v-row2"><div class="v-row2-fix"><i class="v-ic">' + I.trash + '</i><span>삭제</span></div><div class="v-all"><u class="v-tog is-on"><b></b></u><span>전체 적용</span></div><div class="v-row2-in2"><div class="v-r2" style="left:0"><i class="v-ic">' + I.plus + '</i><span>추가</span></div><div class="v-r2" style="left:67px"><i class="v-ic">' + ICONS.trend + '</i><span>변형</span></div><div class="v-r2" style="left:132px"><i class="v-ic">' + ICONS.frame + '</i><span>마스크</span><em class="v-new2">New</em></div><div class="v-r2" style="left:198px"><i class="v-ic">' + I.pencil + '</i><span>편집</span></div></div></div>'
    + bigBtn(10, 1112, 521, 55, '완료', '#0a9cf7', 'is-done');

  SC.todo = () => editor({ rows: textRows(), tab: 2 }) + '<p class="v-todo">이후 화면은 준비 중이에요</p>';


  /* ---------- 자막 수정·효과·블러·트래킹·추출 (디자인 8~23) ---------- */
  const faces = (sel) => ['블러', '픽셀', '확대', '볼록 렌즈'].map((t, i) => '<div class="v-fc' + (sel && i === 0 ? ' is-sel' : '') + '" style="left:' + (30 + i * 118.5) + 'px"><img src="img/p09_face_' + (i + 1) + '.png" alt=""></div><span class="v-fl" style="left:' + (30 + i * 118.5) + 'px">' + t + '</span>').join('');
  const dimBtns = (ok) => bigBtn(17, 1112, 245, 55, '취소', '#4c4d50') + bigBtn(279, 1112, 245, 55, '완료', ok ? '#0a9cf7' : '#2c4a6c', ok ? 'is-done' : 'is-dimbtn');
  const crownI = ICONS.crown;

  /* 글자 탭 편집기(디자인 12, 20, 23) */
  SC.subed = () => editor({ undo: 1, rows: sideIcon(I.plus, 779, '미디어') + sideIcon(I.text, 853, '글자') + sideIcon(I.label, 921, '라벨') + sideIcon(I.sub, 991, '자막') + sideIcon(I.autosub, 1058, '자동 자막'), tab: 2, dots: [360, 450, 539], t2: '00:05' })
    + '<div class="v-subbar"></div><span class="v-subtag" style="left:272px;top:1082px">여기</span><div class="v-edbox"><i class="v-ic">' + I.pencil + '</i></div>';
  /* 키보드(디자인 9, 10) */
  SC.keyboard = (o = {}) => appBar({ grid: 1 }) + playRow({ play: 0 }) + '<div class="v-kpanel"></div>'
    + '<div class="v-align"><span><i class="v-ic">' + ICONS.alignL2 + '</i>왼쪽</span><span class="is-on"><i class="v-ic">' + ICONS.alignC2 + '</i>가운데</span><span><i class="v-ic">' + ICONS.alignR2 + '</i>오른쪽</span></div>'
    + '<div class="v-input"><span>' + (o.text || '') + '</span><i class="v-x"><b></b></i></div><div class="v-ok"><i class="v-ic">' + I.check + '</i></div>'
    + ''
    + '<div class="v-knav"><i class="v-ic">' + I.mic + '</i><u>|||</u><u>□</u><u>◁</u><u>⌄</u></div></div>';
  /* 효과 탭(디자인 13) */
  SC.fx = () => editor({ undo: 1, rows: fxRows() + '<i class="v-crown2">' + crownI + '</i>', tab: 4, dots: [360, 450, 539] });
  /* 왜곡 고르기(디자인 14) */
  SC.faces = () => appBar({}) + playRow({ full: 0, play: 1 }) + '<div class="v-panel2"></div>' + faces(false) + dimBtns(false);
  /* 블러 상자 설정(디자인 15) */
  SC.blursel = () => appBar({ grid: 1 }) + playRow({}) + '<div class="v-panel2"></div>'
    + '<div class="v-shape is-on" style="left:121px"><i></i><span>사각형</span></div><div class="v-shape" style="left:392px"><i class="is-r"></i><span>원</span></div>'
    + '<p class="v-str">강도</p><div class="v-scale">' + Array.from({ length: 37 }, (_, i) => '<b' + (i % 5 === 0 ? ' class="is-b"' : '') + ' style="left:' + (85.5 + i * 13) + 'px"></b>').join('') + [10, 20, 30, 40, 50, 60, 70].map((v, i) => '<span class="v-pct' + (v === 40 ? ' is-on' : '') + '" style="left:' + (111 + i * 65) + 'px">' + v + '%</span>').join('') + '<u class="v-needle"></u></div>'
    + faces(true) + dimBtns(true);
  /* 블러 클립 편집(디자인 16, 17) */
  VL.TRKW = 366;
  const r2a = [['추가', I.plus, 160], ['변형', ICONS.trend, 248], ['모양', ICONS.square, 335], ['40%<br>강도', ICONS.pct40, 419]];
  const r2b = [['반전', ICONS.flip, 142 + VL.TRKW], ['얼굴 트래킹', ICONS.focus, 227 + VL.TRKW], ['정렬', ICONS.layers, 316 + VL.TRKW], ['여기로 이동', I.moveto, 402 + VL.TRKW]];
  SC.blurclip = (o = {}) => {
    const off = (o.slide || 0) * VL.TRKW;
    let s = appBar({ grid: 1 }) + playRow({ undo: 1 }) + ruler([360, 450, 539]) + transport('00:00<sup>18</sup>', '00:05') + '<div class="v-trk is-clip"></div>' + moveBtn(193)
      + '<div class="v-aclip is-blur"><i class="v-lh">' + I.chevL + '</i><div class="v-ab"><span class="v-an"><i class="v-ic">' + I.distort + '</i>블러</span><em class="v-badge is-a" style="right:4px;bottom:3px">00:04</em></div></div>'
      + '<span class="v-subtag" style="left:226px;top:850px;border-color:#5aa0e0;color:#8fc2f5">V1</span><span class="v-subtag" style="left:272px;top:850px">여기</span>'
      + '<div class="v-kf"><i class="v-ic">' + I.keyfr + '</i><span>변형<br>키프레임</span><u class="v-tog"><b></b></u></div><div class="v-sidetabs"><i class="v-ic">' + I.folder + '</i><i class="v-ic">' + I.waveform + '</i></div>' + wave(274, 60, 12, 3, '#b9babd').replace('class="v-wave"', 'class="v-wave is-low"') + playhead(951) + tools1([2, 3]);
    s += '<div class="v-row2"><div class="v-row2-fix"><i class="v-ic">' + I.trash + '</i><span>삭제</span></div><div class="v-row2-clip is-w2"><div class="v-row2-in" id="vlRow2" style="transform:translateX(' + (-off) + 'px)">';
    r2a.concat(r2b).forEach((a) => { s += '<div class="v-r2" style="left:' + (a[2] - 45 - 100) + 'px"><i class="v-ic">' + a[1] + '</i><span>' + a[0] + '</span></div>'; });
    s += '</div></div><div class="v-prem"><i class="v-ic">' + crownI + '</i><span>VLLO 프리미엄 플러스</span></div></div>' + bigBtn(10, 1112, 521, 55, '완료', '#0a9cf7', 'is-done');
    return s;
  };
  /* 트래킹 영역 설정(디자인 18) */
  SC.trackset = () => appBar({}) + playRow({ undo: 0, play: 1 }) + ruler([360, 450, 539]) + transport('00:00<sup>18</sup>', '00:05') + '<div class="v-trk is-clip"></div>' + moveBtn(193)
    + '<div class="v-aclip is-blur"><i class="v-lh">' + I.chevL + '</i><div class="v-ab"><span class="v-an"><i class="v-ic">' + I.distort + '</i>블러</span><em class="v-badge is-a" style="right:4px;bottom:3px">00:04</em><span class="v-trg">트래킹 범위</span></div></div>'
    + '<span class="v-subtag" style="left:226px;top:850px;border-color:#5aa0e0;color:#8fc2f5">V1</span><span class="v-subtag" style="left:272px;top:850px">여기</span><div class="v-sidetabs is-s"><i class="v-ic">' + I.folder + '</i></div><div class="v-ti"></div>' + playhead(896)
    + '<p class="v-tinfo">트래킹 할 얼굴 영역을 설정하세요. 영역을 조금 더 넓게 설정할 때 트래킹 정확도가<br>올라갑니다.</p>' + bigBtn(172, 1026, 196, 54, '트래킹하기', '#0a9cf7', 'is-done')
    + '<div class="v-cancel2">취소</div>';
  /* 추출하기(디자인 21) */
  SC.export = () => '<div class="v-full is-exp"><i class="v-ic" style="left:22px;top:60px;width:34px;height:34px">' + I.back + '</i><p class="v-et">추출하기</p>'
    + '<div class="v-etabs"><span class="is-on">비디오</span><span>GIF</span><span>프로젝트</span><span>자막</span><span>오디오</span><u></u></div>'
    + '<p class="v-es" style="top:236px">파일</p><div class="v-ebox" style="top:262px;height:118px"><div class="v-er"><span>파일명</span><em>제목 없음</em></div><div class="v-er is-2"><span>저장 위치</span><em><b>앨범</b> | 파일</em></div></div>'
    + '<p class="v-es" style="top:398px">추출 옵션</p><div class="v-ebox" style="top:424px;height:54px"><div class="v-er"><span>추출 범위</span><em><b>전체</b> &gt;</em></div></div>'
    + '<p class="v-es" style="top:498px">포맷</p><div class="v-ebox" style="top:524px;height:324px"><div class="v-er is-fmt"><b>기본값 (추천)</b><u>▲</u></div><div class="v-er is-sl"><span>해상도</span><em>1920 x 906 / 기본값</em></div><div class="v-sl"><i style="width:55%"></i><b style="left:55%"></b></div><div class="v-ticks"><span>SD</span><span>HD</span><span>Full HD</span><span>QHD</span><span>4K UHD</span></div><div class="v-er is-sl" style="margin-top:12px"><span>프레임레이트</span><em>기본값</em></div><div class="v-sl"><i style="width:84%"></i><b style="left:84%"></b></div><div class="v-ticks"><span>18</span><span>24</span><span>25</span><span>30</span><span>60</span></div></div>'
    + '<div class="v-eb"><span>완료 알람</span><u class="v-tog is-on"><b></b></u></div>'
    + '<div class="v-bigb"><i class="v-ic">' + I.out + '</i>추출하기 (약 5.56 MB)</div></div>';
  /* 저장 완료(디자인 22) */
  SC.saved = () => '<div class="v-full is-saved"><i class="v-ic" style="left:22px;top:60px;width:34px;height:34px">' + I.back + '</i><i class="v-ic" style="left:489px;top:60px;width:34px;height:34px">' + ICONS.home3 + '</i>'
    + '<div class="v-chk">' + ic('doneRed') + '</div>'
    + '<p class="v-sv1">저장 완료</p><p class="v-sv2">저장 위치 : 앨범</p><div class="v-sv3">추출한 파일 확인하기 &gt;</div><p class="v-sv4"><i></i>공유하기<i></i></p>'
    + '<div class="v-soc"><img src="img/p09_share_1.png" alt=""><img src="img/p09_share_2.png" alt=""><img src="img/p09_share_3.png" alt=""><img src="img/p09_share_4.png" alt=""></div></div>';


  /* 로딩 로고 모션: VLLO 글자 → 점 4개 → 물고기 → 점 → VLLO 반복 (캡처 영상 기준) */
  VL.LOGO = [220, 385, 100, 66];
  VL.logoSvg = '<svg viewBox="76 6 148 98" width="100" height="66" fill="none" stroke="#fe2c5e" style="stroke:#fe2c5e" stroke-linecap="round" stroke-linejoin="round">'
    + '<g id="vlLg"><path d="M86 40L97 79L108 40"/><path d="M126 40V79H144"/><path d="M154 40V79H172"/><ellipse cx="197" cy="59" rx="19" ry="20"/></g>'
    + '<g id="vlDt" fill="#fe2c5e" stroke="none"><circle r="3.5"/><circle r="3.5"/><circle r="3.5"/><circle r="3.5"/></g>'
    + '<g id="vlFs"><path pathLength="1" d="M85 60C85 30 100 13 127 13C152 13 172 30 188 56" stroke-width="9"/><path pathLength="1" d="M85 56C85 82 100 99 127 99C152 99 172 82 188 56" stroke-width="9"/>'
    + '<path d="M192 56L215 40V72Z" fill="#fe2c5e" stroke-width="4"/></g></svg>';
  VL.logo = (box) => {
    const svg = box.querySelector('svg'), lg = svg.querySelector('#vlLg').children, dt = svg.querySelector('#vlDt').children, fs = svg.querySelector('#vlFs').children;
    const DOT = [[97, 57], [133, 57], [169, 57], [203, 57]], ANC = [[97, 59], [135, 59], [163, 59], [197, 59]];
    const T = 6.2, t0 = performance.now();
    const cl = (x) => Math.max(0, Math.min(1, x)), ez = (x) => (x = cl(x), x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2), mix = (a, b, k) => a + (b - a) * k;
    const K = () => (svg.clientWidth || 100) / 148;
    function draw(c) {
      const lp = c < .6 ? ez(c / .6) : c < 1.6 ? 1 : c < 2.3 ? 1 - ez((c - 1.6) / .7) : 0;
      const f = c < 3.1 ? 0 : c < 4.1 ? ez(c - 3.1) : c < 5.4 ? 1 : c < 5.9 ? 1 - ez((c - 5.4) / .5) : 0;
      const sw = 6.5 * K();
      for (let i = 0; i < 4; i++) {
        const s = Math.max(lp, .0001), x = mix(DOT[i][0], ANC[i][0], lp), y = mix(DOT[i][1], ANC[i][1], lp);
        lg[i].setAttribute('transform', 'translate(' + x + ' ' + y + ') scale(' + s + ') translate(' + -ANC[i][0] + ' ' + -ANC[i][1] + ')');
        lg[i].setAttribute('stroke-width', sw);
        lg[i].setAttribute('vector-effect', 'non-scaling-stroke');
        lg[i].style.display = lp > .002 ? '' : 'none';
      }
      const showDots = lp <= .002;
      const top = ez(f / .7), bot = ez((f - .2) / .8);
      const d = [DOT[0].slice(), DOT[1].slice(), DOT[2].slice(), DOT[3].slice()], r = [3.5, 3.5, 3.5, 3.5], o = [1, 1, 1, 1];
      d[0][0] = mix(97, 86, cl(f / .15));
      o[0] = top > .02 ? 0 : 1;
      const e = ez(f / .8);
      d[1] = [mix(133, 118, e), mix(57, 50, e)]; r[1] = mix(3.5, 7, e);
      d[2] = [mix(169, 188, ez(f / .5)), 57]; o[2] = 1 - cl((f - .35) / .3);
      const tail = cl((f - .6) / .4);
      d[3] = [mix(203, 205, ez(f / .6)), mix(57, 56, ez(f / .6))]; r[3] = mix(3.5, 9, ez(f / .6)); o[3] = 1 - tail;
      for (let i = 0; i < 4; i++) {
        dt[i].setAttribute('cx', d[i][0]); dt[i].setAttribute('cy', d[i][1]); dt[i].setAttribute('r', r[i]);
        dt[i].style.opacity = showDots ? o[i] : 0;
      }
      [top, bot].forEach((q, i) => { fs[i].style.display = q > .02 ? '' : 'none'; fs[i].setAttribute('stroke-dasharray', q + ' 2'); });
      fs[2].style.opacity = tail;
      fs[2].setAttribute('transform', 'translate(205 56) scale(' + (.4 + .6 * tail) + ') translate(-205 -56)');
    }
    function tick() {
      if (!box.isConnected) return;
      draw(((performance.now() - t0) / 1000) % T);
      requestAnimationFrame(tick);
    }
    tick();
  };

  VL.screen = (name, o) => SC[name](o || {});
  VL.names = Object.keys(SC);
})();
