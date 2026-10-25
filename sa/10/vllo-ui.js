/* VLLO 앱 화면(HTML/CSS). 좌표는 모두 디자인 캡처(1080x2340)의 절반인 540x1170 기준 px, 글꼴은 전부 Pretendard.
   VL.screen(이름, 옵션) 이 화면 한 장의 HTML 글자를 돌려줌. 영상 칸(#vlViewer)·자막·블러는 화면에 포함되지 않고 페이지가 따로 둠(영상이 끊기지 않게). 스타일은 page09.html 의 .v-* */
(function () {
  const VL = window.VL = {};
  const S = (d, o = {}) => '<svg viewBox="0 0 ' + (o.w || 24) + ' ' + (o.h || 24) + '"' + (o.c ? ' class="' + o.c + '"' : '') + '>' + d + '</svg>';
  const I = {
    back: S('<path d="M15 4.5L7.5 12l7.5 7.5"/>'),
    help: S('<circle cx="12" cy="12" r="10"/><path d="M8.8 9.2a3.2 3.2 0 116.2 1c0 1.6-2.2 2.2-2.2 3.8M12.8 17.4h.01" stroke-width="2.2"/>'),
    dots: S('<circle cx="5" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.6" fill="currentColor" stroke="none"/>'),
    gear: S('<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1"/>'),
    out: S('<path d="M5 15v4.5h14V15M12 4v11M7.5 8.5L12 4l4.5 4.5"/>'),
    play: S('<path d="M8 5.5v13l11-6.5z"/>'),
    full: S('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>'),
    undo: S('<path d="M8.5 6.5H15a5 5 0 010 10H8.5M11.5 3.5l-3 3 3 3"/>'),
    redo: S('<path d="M15.5 6.5H9a5 5 0 000 10h6.5M12.5 3.5l3 3-3 3"/>'),
    first: S('<path d="M5 5v14M19 5L8.5 12 19 19z"/>'),
    prev: S('<path d="M8.5 5v14M20 5l-10 7 10 7z"/>'),
    next: S('<path d="M15.5 5v14M4 5l10 7L4 19z"/>'),
    last: S('<path d="M19 5v14M5 5l10.5 7L5 19z"/>'),
    plus: S('<circle cx="12" cy="12" r="10"/><path d="M6.5 12h11M12 6.5v11"/>'),
    music: S('<path d="M8 18.5V5h11v12M8 9.5h11"/><circle cx="5.8" cy="18.3" r="2.4"/><circle cx="16.8" cy="16.6" r="2.4"/>'),
    wave: S('<path d="M2 12h3.5l2-5 3 11 3-15 3 17 2-8h4"/>'),
    mic: S('<rect x="8.5" y="2.5" width="7" height="12" rx="3.5"/><path d="M5 11.5a7 7 0 0014 0M12 18.5v3"/>'),
    aiv: S('<path d="M5 4h8M4 8v9h6l3 3.5 3-3.5h4V8"/><path d="M9 10v5M12 9v7M15 10v5"/>'),
    text: S('<path d="M5 8V5h14v3M12 5v14M9 19h6"/>'),
    label: S('<path d="M4 10.5l8-7 8 7V20H4z"/><path d="M8 15h8M8 18h5"/>'),
    sub: S('<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><path d="M3.5 14.5h17M7 17.5h7"/>'),
    autosub: S('<path d="M13 4.5H4.5v15h15V11"/><path d="M4.5 14.5h15M8 17.5h6"/><text x="15.5" y="9.5" font-size="8" font-weight="700" fill="currentColor" stroke="none" text-anchor="middle">AI</text>'),
    filter: S('<circle cx="9" cy="9.5" r="5.5"/><circle cx="14.5" cy="14.5" r="5.5"/>'),
    special: S('<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M7 17l5-5M15 7v2M14 8h2"/>'),
    distort: S('<rect x="3.5" y="3.5" width="17" height="17" rx="2"/><path d="M3.5 9.2h17M3.5 14.8h17M9.2 3.5v17M14.8 3.5v17"/>'),
    trash: S('<path d="M5 6.5h14M9.5 6.5V4h5v2.5M7 6.5l1 13h8l1-13M10 10v6M14 10v6"/>'),
    listen: S('<path d="M7 4.5v15l12-7.5z"/>'),
    moveto: S('<path d="M12 3.5v11M7.5 10.5l4.5 4.5 4.5-4.5M5 19.5h14"/>'),
    pencil: S('<path d="M4 20l1-4.5L16.5 4a2 2 0 012.8 0l.7.7a2 2 0 010 2.8L8.5 19zM4 21h16"/>'),
    start: S('<path d="M4 4v16M7.5 12h10M12 7.5L17.5 12 12 16.5"/>', {}),
    scissors: S('<circle cx="7" cy="7" r="2.8"/><circle cx="17" cy="7" r="2.8"/><path d="M9 9l9 11M15 9L6 20"/>'),
    chevL: S('<path d="M15 4.5L7.5 12l7.5 7.5"/>'),
    chevR: S('<path d="M9 4.5l7.5 7.5L9 19.5"/>'),
    swap: S('<path d="M20 8H5.5l3-3M4 16h14.5l-3 3"/>'),
    folder: S('<path d="M3.5 7.5v10h17V9.5h-8l-2-2z"/>'),
    waveform: S('<path d="M4 9v6M8 6v12M12 3v18M16 7v10M20 10v4"/>'),
    check: S('<path d="M4.5 12.5l5 5L19.5 7"/>'),
    mute: S('<path d="M4 9.5v5h4l5 4v-13l-5 4zM17 9.5l4 5M21 9.5l-4 5"/>'),
    noise: S('<path d="M3 12h2M7 7v10M11 4v16M15 8v8M19 10v4M22 12h0"/>'),
    echo: S('<path d="M12 3.5a4 4 0 014 4V12a4 4 0 01-8 0V7.5a4 4 0 014-4zM5 11.5a7 7 0 0014 0M12 18.5v3"/>'),
    fade: S('<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8v8M12 8v8M16 8v8"/>'),
    speed: S('<text x="12" y="16" font-size="12" font-weight="600" fill="currentColor" stroke="none" text-anchor="middle">1.0x</text>'),
    vol: S('<path d="M12 4l7 8-7 8-7-8z"/>'),
    keyfr: S('<path d="M12 3.5l6 8.5-6 8.5-6-8.5z"/>'),
    gridI: S('<rect x="3.5" y="3.5" width="17" height="17" rx="1.5"/><path d="M9.2 3.5v17M14.8 3.5v17M3.5 9.2h17M3.5 14.8h17"/>'),
    magnet: S('<path d="M6 4v9a6 6 0 0012 0V4h-4v9a2 2 0 01-4 0V4z"/>'),
    crown: S('<path d="M3.5 9l4 3.5L12 5l4.5 7.5 4-3.5-1.5 10h-14z"/>', {}),
    gift: S('<rect x="4" y="9" width="16" height="11" rx="1"/><path d="M3 9h18v3.5H3zM12 9v11M12 9c-3 0-5-1.2-5-3s2.5-2 5 3c2.5-5 5-4.8 5-3s-2 3-5 3z"/>'),
    menu: S('<path d="M3.5 7h17M3.5 12h17M3.5 17h17"/>'),
    mark: S('<path d="M14.5 4v6l5 5-5 1v4"/>')
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
      s += txt('v-title', 120, 66, '제목 없음 (2.12:1)<i class="v-ic" style="width:15px;height:15px;margin-left:6px;vertical-align:-1px">' + I.gear + '</i>', 300);
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
  // const template = () => '<div class="v-tpl"><i class="v-ic">' + S('<rect x="4" y="5" width="12" height="14" rx="2"/><path d="M8 9v6l5-3z"/><path d="M18 6v12" /><circle cx="18" cy="14" r="2.5"/>') + '</i><span>템플릿</span></div>';
  const template = () => '';
  const bigBtn = (x, y, w, h, label, c, cls) => '<div class="v-btn ' + (cls || '') + '" style="left:' + x + 'px;top:' + y + 'px;width:' + w + 'px;height:' + h + 'px;background:' + c + '">' + label + '</div>';
  const clipThumb = (x, w, cls, inner) => '<div class="v-clip ' + (cls || '') + '" style="left:' + x + 'px;width:' + w + 'px"><div class="v-frames"></div>' + (inner || '') + '</div>';
  const badge = (x2, y, tt, o = {}) => '<em class="v-badge' + (o.c ? ' ' + o.c : '') + '" style="left:' + (x2 - (o.w || 41)) + 'px;top:' + y + 'px;width:' + (o.w || 41) + 'px">' + tt + '</em>';
  const swapIc = () => '<i class="v-ic" style="left:508px;top:783px;width:26px;height:26px">' + I.swap + '</i>';
  const moveBtn = (cx) => '<i class="v-move" style="left:' + (cx - 17.5) + 'px;top:777px">' + S('<path d="M12 3v18M3 12h18M8.5 6.5L12 3l3.5 3.5M8.5 17.5L12 21l3.5-3.5M6.5 8.5L3 12l3.5 3.5M17.5 8.5L21 12l-3.5 3.5"/>') + '</i>';
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
    + '<p class="v-mp">내 프로젝트 (0) <i class="v-ic is-down">' + S('<circle cx="12" cy="12" r="10" fill="currentColor" stroke="none"/><path d="M7.5 10.5l4.5 4.5 4.5-4.5" stroke="#16171b" stroke-width="2.4"/>') + '</i></p>'
    + '<i class="v-ic v-lv" style="left:372px;top:455px">' + S('<rect x="4" y="5.5" width="16" height="13" rx="2.5" fill="currentColor" stroke="none"/><rect x="6.5" y="8" width="11" height="8" rx="1" fill="#16171b" stroke="none"/>') + '</i><i class="v-ic v-lv" style="left:431px;top:455px">' + S('<rect x="5" y="3.5" width="9" height="6.5" rx="1.5"/><rect x="5" y="13.5" width="9" height="6.5" rx="1.5"/><path d="M18 5v11M15 13.5l3 3 3-3"/>') + '</i><span class="v-sel">선택</span>'
    + '<div class="v-load"><i class="v-ic">' + S('<path d="M7 3.5h7l4 4v13H7zM13 3.5v5h5M12 11v6M9.5 14.5l2.5 2.5 2.5-2.5"/>') + '</i>프로젝트 불러오기</div>'
    + '</div>';

  /* 1: 편집기 첫 화면(디자인 1) */
  SC.audio = () => editor({ rows: audioRows(), tab: 0 });
  /* 2/3: 음성 녹음(디자인 2, 3) */
  SC.record = (o = {}) => appBar({}) + playRow({ undo: 0 }) + ruler(o.rec ? [60, 130, 200, 245, 270, 330, 400, 460] : [360, 450, 539]) + transport(o.rec ? '00:01<sup>02</sup>' : '00:00<sup>00</sup>', '00:05') + '<div class="v-trk is-rec"></div>'
    + (o.rec ? '<div class="v-recclip" style="left:79px;width:190px"></div>' : '') + clipThumb(271, 270, 'is-main is-dimclip', '') + playhead(878)
    + '<div class="v-recpanel"></div>'
    + (o.rec ? '' : '<div class="v-timer"><i class="v-ic">' + S('<circle cx="12" cy="12" r="9.5"/><text x="12" y="16" font-size="9" font-weight="700" fill="currentColor" stroke="none" text-anchor="middle">3</text>') + '</i>타이머</div>')
    + '<p class="v-rtime">' + (o.rec ? '00:01' : '00:00') + '</p>'
    + '<div class="v-rbtn"><b class="' + (o.rec ? 'is-stop' : '') + '"></b></div>'
    + '<div class="v-cancel">취소</div>';
  /* 4: 녹음 파일(디자인 4) */
  SC.recdone = () => clipTop({ undo: 1, full: 0 }) + moveBtn(193) + '<div class="v-aclip"><i class="v-lh">' + I.chevL + '</i><div class="v-ab"><span class="v-an"><i class="v-ic">' + S('<rect x="9.5" y="3" width="5" height="10" rx="2.5"/><path d="M6.5 11a5.5 5.5 0 0011 0M12 17v3"/>', { c: '' }) + '</i>V1</span>' + wave(8, 82, 8, 5, '#fff') + '<em class="v-badge is-a" style="right:4px;bottom:3px">00:04</em></div></div>'
    + playhead(876) + '<div class="v-name"><span>파일명 :</span><b>V1</b><i class="v-ic">' + I.pencil + '</i></div>'
    + '<div class="v-act" style="left:152px"><i class="v-ic">' + I.trash + '</i><span>삭제</span></div><div class="v-act" style="left:270px"><i class="v-ic">' + I.listen + '</i><span>듣기</span></div><div class="v-act" style="left:388px"><i class="v-ic">' + I.moveto + '</i><span>여기로 이동</span></div>'
    + '<div class="v-add"><b class="v-rdot"></b>추가</div>' + bigBtn(200, 1112, 324, 55, '완료', '#0a9cf7', 'is-done');
  /* 5/6: 클립 도구(디자인 5, 6): second 이면 오른쪽으로 밀려 자동 자막이 보이는 줄. slide=0~1 */
  VL.NAVW = 358;
  const row2items = [['추가', I.plus, 164], ['음소거', I.mute, 251], ['음량', I.vol, 339], ['노이즈 제거', I.noise, 434], ['페이드', I.fade, 512], ['오디오 이펙트', I.waveform, 605], ['에코&amp;리버브', I.echo, 698], ['자동 자막', I.autosub, 786], ['배속', I.speed, 866]];
  SC.clip = (o = {}) => {
    const off = (o.slide || 0) * VL.NAVW;
    let s = clipTop({ undo: 1, grid: 0 }) + moveBtn(193) + '<div class="v-aclip"><i class="v-lh">' + I.chevL + '</i><div class="v-ab"><span class="v-an"><i class="v-ic">' + S('<rect x="9.5" y="3" width="5" height="10" rx="2.5"/><path d="M6.5 11a5.5 5.5 0 0011 0M12 17v3"/>') + '</i>V1</span>' + wave(8, 82, 8, 5, '#fff') + '<em class="v-badge is-a" style="right:4px;bottom:3px">00:04</em></div></div>'
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
    + '<div class="v-sel2" style="left:17px"><span>오디오 : <b>음성 녹음</b></span><i class="v-ic">' + S('<path d="M5 12a7 7 0 0112-5l2 2M19 12a7 7 0 01-12 5l-2-2M17 4v5h-5M7 20v-5h5"/>') + '</i></div><div class="v-sel2" style="left:278px"><span>언어 : <b>한국어</b></span><i class="v-ic">' + S('<path d="M5 12a7 7 0 0112-5l2 2M19 12a7 7 0 01-12 5l-2-2M17 4v5h-5M7 20v-5h5"/>') + '</i></div>'
    + bigBtn(17, 1112, 238, 55, '취소', '#4c4d50') + bigBtn(272, 1112, 252, 55, '생성하기', '#0a9cf7', 'is-done');
  /* 로딩 화면(자막 생성 중 / 트래킹 중 / 비디오 만드는 중): msg, warn, pct(0~1), cls */
  SC.loading = (o = {}) => '<div class="v-full is-load' + (o.cls ? ' ' + o.cls : '') + '">'
    + (o.back ? '<i class="v-ic" style="left:20px;top:58px;width:34px;height:34px">' + I.back + '</i>' : '')
    + '<div class="v-logo" id="vlLogo">' + VL.logoSvg + '</div>'
    + '<p class="v-lmsg">' + o.msg + '</p>'
    + '<div class="v-lbar"><i id="vlLoadBar"></i></div><u class="v-lpct" id="vlLoadPct">0%</u>'
    + (o.warn ? '<p class="v-lwarn"><i class="v-ic is-warn">' + S('<path d="M12 3.5l10 17H2z" fill="#f5c518" stroke="none"/><path d="M12 10v5M12 17.5h.01" stroke="#232428" stroke-width="2"/>') + '</i>' + o.warn + '</p>' : '')
    + (o.tip ? '<div class="v-tip"><b>VLLO TIP</b><div class="v-tipc"><span>' + o.tip + '</span></div></div>' : '') + '</div>';
  /* 8: 자막 만들어진 뒤 글자 탭(디자인 8) */
  SC.subdone = (o = {}) => clipTop({ undo: 1, grid: 1 }) + moveBtn(193) + '<div class="v-aclip is-sub"><i class="v-lh">' + I.chevL + '</i><div class="v-ab"><span class="v-an"><i class="v-ic">' + I.sub + '</i>' + (o.text || '') + '</span><em class="v-badge is-a" style="right:4px;bottom:3px">00:03</em></div></div>'
    + '<div class="v-kf"><i class="v-ic">' + I.keyfr + '</i><span>변형<br>키프레임</span><u class="v-tog"><b></b></u></div><div class="v-sidetabs"><i class="v-ic">' + I.folder + '</i><i class="v-ic">' + I.waveform + '</i></div>' + playhead(951) + tools1([2, 3])
    + '<div class="v-row2"><div class="v-row2-fix"><i class="v-ic">' + I.trash + '</i><span>삭제</span></div><div class="v-all"><u class="v-tog is-on"><b></b></u><span>전체 적용</span></div><div class="v-row2-in2"><div class="v-r2" style="left:0"><i class="v-ic">' + I.plus + '</i><span>추가</span></div><div class="v-r2" style="left:67px"><i class="v-ic">' + S('<path d="M5 5v14h14M5 15l4-4 4 4 5-8"/>') + '</i><span>변형</span></div><div class="v-r2" style="left:132px"><i class="v-ic">' + S('<rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="12" cy="12" r="3.5"/>') + '</i><span>마스크</span><em class="v-new2">New</em></div><div class="v-r2" style="left:198px"><i class="v-ic">' + I.pencil + '</i><span>편집</span></div></div></div>'
    + bigBtn(10, 1112, 521, 55, '완료', '#0a9cf7', 'is-done');

  SC.todo = () => editor({ rows: textRows(), tab: 2 }) + '<p class="v-todo">이후 화면은 준비 중이에요</p>';


  /* ---------- 자막 수정·효과·블러·트래킹·추출 (디자인 8~23) ---------- */
  const faces = (sel) => ['블러', '픽셀', '확대', '볼록 렌즈'].map((t, i) => '<div class="v-fc' + (sel && i === 0 ? ' is-sel' : '') + '" style="left:' + (30 + i * 118.5) + 'px"><img src="img/p09_face_' + (i + 1) + '.png" alt=""></div><span class="v-fl" style="left:' + (30 + i * 118.5) + 'px">' + t + '</span>').join('');
  const dimBtns = (ok) => bigBtn(17, 1112, 245, 55, '취소', '#4c4d50') + bigBtn(279, 1112, 245, 55, '완료', ok ? '#0a9cf7' : '#2c4a6c', ok ? 'is-done' : 'is-dimbtn');
  const crownI = S('<path d="M3.5 9l4 3.5L12 5l4.5 7.5 4-3.5-1.5 10h-14z" fill="currentColor"/>');

  /* 글자 탭 편집기(디자인 12, 20, 23) */
  SC.subed = () => editor({ undo: 1, rows: sideIcon(I.plus, 779, '미디어') + sideIcon(I.text, 853, '글자') + sideIcon(I.label, 921, '라벨') + sideIcon(I.sub, 991, '자막') + sideIcon(I.autosub, 1058, '자동 자막'), tab: 2, dots: [360, 450, 539], t2: '00:05' })
    + '<div class="v-subbar"></div><span class="v-subtag" style="left:272px;top:1082px">여기</span><div class="v-edbox"><i class="v-ic">' + I.pencil + '</i></div>';
  /* 키보드(디자인 9, 10) */
  SC.keyboard = (o = {}) => appBar({ grid: 1 }) + playRow({ play: 0 }) + '<div class="v-kpanel"></div>'
    + '<div class="v-align"><span><i class="v-ic">' + S('<path d="M4 7h16M4 12h10M4 17h16"/>') + '</i>왼쪽</span><span class="is-on"><i class="v-ic">' + S('<path d="M4 7h16M7 12h10M4 17h16"/>') + '</i>가운데</span><span><i class="v-ic">' + S('<path d="M4 7h16M10 12h10M4 17h16"/>') + '</i>오른쪽</span></div>'
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
  const r2a = [['추가', I.plus, 160], ['변형', S('<path d="M5 5v14h14M5 15l4-4 4 4 5-8"/>'), 248], ['모양', S('<rect x="4.5" y="4.5" width="15" height="15" rx="2"/>'), 335], ['40%<br>강도', S('<text x="12" y="16" font-size="11" fill="currentColor" stroke="none" text-anchor="middle">40%</text>'), 419]];
  const r2b = [['반전', S('<path d="M12 3v18M4 6.5l5 2.5v6l-5 2.5zM20 6.5L15 9v6l5 2.5z"/>'), 142 + VL.TRKW], ['얼굴 트래킹', S('<circle cx="12" cy="12" r="6.5"/><path d="M12 2.5v4M12 17.5v4M2.5 12h4M17.5 12h4M12 10v4M10 12h4"/>'), 227 + VL.TRKW], ['정렬', S('<path d="M12 4l8 4-8 4-8-4zM4 12l8 4 8-4M4 16l8 4 8-4"/>'), 316 + VL.TRKW], ['여기로 이동', I.moveto, 402 + VL.TRKW]];
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
    + '<p class="v-es" style="top:238px">파일</p><div class="v-ebox" style="top:262px;height:118px"><div class="v-er"><span>파일명</span><em>제목 없음</em></div><div class="v-er is-2"><span>저장 위치</span><em><b>앨범</b> | 파일</em></div></div>'
    + '<p class="v-es" style="top:400px">추출 옵션</p><div class="v-ebox" style="top:424px;height:54px"><div class="v-er"><span>추출 범위</span><em><b>전체</b> &gt;</em></div></div>'
    + '<p class="v-es" style="top:500px">포맷</p><div class="v-ebox" style="top:524px;height:324px"><div class="v-er is-fmt"><b>기본값 (추천)</b><u>▲</u></div><div class="v-er is-sl"><span>해상도</span><em>1920 x 906 / 기본값</em></div><div class="v-sl"><i style="width:55%"></i><b style="left:55%"></b></div><div class="v-ticks"><span>SD</span><span>HD</span><span>Full HD</span><span>QHD</span><span>4K UHD</span></div><div class="v-er is-sl" style="margin-top:12px"><span>프레임레이트</span><em>기본값</em></div><div class="v-sl"><i style="width:84%"></i><b style="left:84%"></b></div><div class="v-ticks"><span>18</span><span>24</span><span>25</span><span>30</span><span>60</span></div></div>'
    + '<div class="v-eb"><span>완료 알람</span><u class="v-tog is-on"><b></b></u></div>'
    + '<div class="v-bigb">추출하기 (약 5.56 MB)</div></div>';
  /* 저장 완료(디자인 22) */
  SC.saved = () => '<div class="v-full is-saved"><i class="v-ic" style="left:22px;top:60px;width:34px;height:34px">' + I.back + '</i><i class="v-ic" style="left:489px;top:60px;width:34px;height:34px">' + S('<path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z"/>') + '</i>'
    + '<div class="v-chk"><svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="95" fill="none" stroke="#e9416a" stroke-width="5"/><path d="M62 98l30 40 60-84" fill="none" stroke="#e9416a" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>'
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
