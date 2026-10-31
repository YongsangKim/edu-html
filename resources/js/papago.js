/* Papago 번역 앱 화면 그리기(사회 12차시). 공용 폰 틀(.phone-frame > .phone-screen) 안에 넣을 화면을 HTML 글자로 돌려줌. 스타일은 css/common.css 의 .pp-*
   PP.mount(화면요소, PP.home({...})) 처럼 씀. 눌러야 할 곳은 o.hot 에 이름을 넘기면 data-hot="이름" 이 붙고, 페이지에서 PP.finger 로 그곳에 손가락·깜빡임(.hit-pulse)·클릭 영역(HOT)을 붙임.
   PP.home({from,to,hot:['voice','talk','image','doc','learn','input','from','to'],time})
   PP.voice({from,to,state:'listen'|'result',src,out,pron,hot:['mic','back'],time})
   PP.cam({from,to,photo,pos,mode:'live'|'result',overlays:[{box:[left%,top%,폭%,높이%],html,bg,color,fs,rot,hot} | {cls:"페이지 CSS 클래스",html}],load,hot:['shoot'],time})
   PP.launcher({hot:['app']}), PP.speak(글,언어,소리파일,끝나면)
   PP.text({from,to,input,kb,sug,result:{big,pron},hot:['input','sug','enter'],time})
   PP.lang({sel,hot:['한국어','영어',…],time}) */
(function () {
  const I = {
    mic: ICONS.mic,
    talk: ICONS.talk,
    thumb: ICONS.thumb,
    image: ICONS.cam,
    doc: ICONS.doc,
    learn: ICONS.learn,
    back: ICONS.back,
    menu: ICONS.menu,
    swap: ICONS.swapDual,
    chev: ICONS.chev,
    spk: ICONS.spk,
    edu: ICONS.eduLogo,
    copy: ICONS.copy,
    share: ICONS.shareUp,
    star: ICONS.star,
    expand: ICONS.expandDiag,
    flash: ICONS.flash,
    gal: ICONS.gal,
    rot: ICONS.rot,
    tsel: ICONS.tsel,
    spark: ICONS.spark,
    x: ICONS.x,
    set: ICONS.set,
    cam: ICONS.cam,
    sug: ICONS.sug,
    shift: ICONS.shift,
    bs: ICONS.bs,
    dots: ICONS.dotsH
  };
  const hotOf = (o) => (n) => (o.hot && o.hot.indexOf(n) >= 0 ? ' data-hot="' + n + '"' : '');
  const status = (o, dark) => '<div class="phone-status' + (dark ? ' is-dark' : '') + '" data-time="' + (o.time || '12:27') + '"></div>';
  const nav = (cls) => '<div class="phone-nav' + (cls ? ' ' + cls : '') + '"></div>';
  const langRow = (o, h) => '<button type="button" class="pp-lang"' + h('from') + '>' + (o.from || '한국어') + I.chev + '</button><span class="pp-swap">' + I.swap + '</span><button type="button" class="pp-lang"' + h('to') + '>' + (o.to || '영어') + I.chev + '</button>';
  const chips = '<div class="pp-chips"><span>' + I.spk + '</span><span>' + I.copy + '</span></div>';

  const PP = {
    mount(el, html) {
      el.innerHTML = html;
      if (typeof initPhoneBars === 'function') initPhoneBars();
    },
    launcher(o) {
      const h = hotOf(o);
      return '<div class="pp pp-launch">' + status(o) + '<div class="pp-app"' + h('app') + '><i><img src="' + (o.icon || 'img/papago_icon.png') + '" alt="" onerror="this.remove()"><b>p</b></i><span>Papago</span></div>' + nav('is-ghost') + '</div>';
    },
    home(o) {
      const h = hotOf(o);
      return '<div class="pp">' + status(o, true) +
        '<div class="pp-top">' + I.menu + '<b>papago</b><em>' + I.edu + '</em></div>' +
        '<div class="pp-langs">' + '<button type="button" class="pp-lang"' + h('from') + '>' + (o.from || '한국어') + I.chev + '</button><span class="pp-swap">' + I.swap + '</span><button type="button" class="pp-lang"' + h('to') + '>' + (o.to || '일본어') + I.chev + '</button></div>' +
        '<div class="pp-line"></div>' +
        '<p class="pp-hint"' + h('input') + '>번역할 내용을 입력하세요</p>' +
        '<div class="pp-btns">' +
        '<button type="button" class="pp-btn is-voice"' + h('voice') + '>' + I.mic + '음성</button>' +
        '<button type="button" class="pp-btn is-talk"' + h('talk') + '>' + I.talk + '대화</button>' +
        '<button type="button" class="pp-btn is-image"' + h('image') + '>' + I.image + '이미지</button>' +
        '<div class="pp-btn-row"><button type="button" class="pp-btn"' + h('doc') + '>' + I.doc + '문서</button><button type="button" class="pp-btn"' + h('learn') + '>' + I.learn + '학습카메라</button></div>' +
        '</div>' + nav() + '</div>';
    },
    voice(o) {
      const h = hotOf(o);
      let body = '';
      if (o.state === 'result') {
        body = '<div class="pp-res">' + chips + '<p class="pp-src">' + o.src + '</p><div class="pp-sep"></div>' + chips + '<p class="pp-out">' + o.out + '</p>' + (o.pron ? '<p class="pp-pron">' + o.pron + '</p>' : '') + '</div>' +
          '<div class="pp-acts">' + I.share + I.star + I.expand + '</div>' +
          '<div class="pp-mic is-dim"' + h('mic') + '>' + I.mic + '</div>';
      } else {
        body = '<div class="pp-mic"' + h('mic') + '><i></i><i></i><i></i></div>';
      }
      return '<div class="pp is-green">' + status(o) + '<div class="pp-bar">' + I.back + langRow(o, h) + '</div>' + body + nav('is-ghost') + '</div>';
    },
    cam(o) {
      const h = hotOf(o);
      const live = o.mode !== 'result';
      let ov = '';
      (o.overlays || []).forEach((v) => {
        if (v.cls) { ov += '<div class="pp-ov ' + v.cls + '"' + (v.hot ? ' data-hot="' + v.hot + '"' : '') + '>' + v.html + '</div>'; return; }
        ov += '<div class="pp-ov"' + (v.hot ? ' data-hot="' + v.hot + '"' : '') + ' style="left:' + v.box[0] + '%;top:' + v.box[1] + '%;width:' + v.box[2] + '%;height:' + v.box[3] + '%;background:' + (v.bg || 'rgba(255,255,255,.88)') + ';color:' + (v.color || '#2a2a2a') + ';font-size:' + (v.fs || 18) + 'px' + (v.rot ? ';transform:rotate(' + v.rot + 'deg)' : '') + '">' + v.html + '</div>';
      });
      const bottom = live
        ? '<div class="pp-cam-b"><span class="sm">' + I.gal + '</span><span class="sm is-sq" style="left:74px">' + I.doc + '</span><button type="button" class="go"' + h('shoot') + '>' + I.cam + '</button><span class="sm" style="right:16px">' + I.flash + '</span><div class="modes"><span class="is-on">전체번역</span><span>실시간 번역</span><span>부분번역</span></div></div>'
        : '<div class="pp-cam-r"><span><i class="cc">' + I.share + '</i>공유/저장</span><span><i class="cc">' + I.rot + '</i>회전</span><span><i class="cc">' + I.tsel + '</i>전체선택</span><span><i class="ai">' + I.spark + '</i>바로번역</span></div>';
      return '<div class="pp is-blue">' + status(o) + '<div class="pp-bar">' + I.back + langRow(o, h) + '</div>' +
        '<div class="pp-cam' + (live ? '' : ' is-result') + '" style="background-image:url(\'' + (o.photo || '') + '\');background-position:' + (o.pos || 'center') + '">' + (live ? '<span class="tag">텍스트 정렬</span>' : '<span class="pp-err">오류신고</span>') + ov + (o.load ? '<div class="pp-load"><i></i></div>' : '') + '</div>' +
        bottom + nav('is-ghost') + '</div>';
    },
    text(o) {
      const h = hotOf(o);
      const hasIn = !!o.input;
      let tr = '';
      if (o.result) {
        tr = '<div class="pp-tr">' + chips + '<p class="big">' + o.result.big + '</p>' + (o.result.pron ? '<p class="pr">' + o.result.pron + '</p>' : '') + '<div class="fb"><span>' + I.thumb + '좋아요</span><span>' + I.thumb + '어색해요</span></div></div>';
      }
      let kb = '';
      if (o.kb) {
        const row = (s) => '<div class="kbd-db-row">' + s.split('').map((c) => '<span>' + c + '</span>').join('') + '</div>';
        kb = '<div class="kbd-db is-dark"><div class="kbd-db-tools">' + (o.sug ? '<span class="kbd-db-sug"' + h('sug') + '>' + I.sug + o.sug + '</span>' : I.set) + I.dots + '</div><div class="kbd-db-rows">' +
          row('1234567890') + row('ㅂㅈㄷㄱㅅㅛㅕㅑㅐㅔ') + row('ㅁㄴㅇㄹㅎㅗㅓㅏㅣ') +
          '<div class="kbd-db-row"><span class="is-fn">' + I.shift + '</span>' + 'ㅋㅌㅊㅍㅠㅜㅡ'.split('').map((c) => '<span>' + c + '</span>').join('') + '<span class="is-fn">⌫</span></div>' +
          '<div class="kbd-db-row"><span class="is-fn">!#1</span><span class="is-fn">한/영</span><span class="is-wide">한국어</span><span>.</span><span class="is-go"' + h('enter') + '>이동</span></div></div></div>';
      }
      return '<div class="pp">' + status(o, true) + '<div class="pp-bar">' + I.back + langRow(o, h) + '' + ic('set', 'class="is-r"') + '</div>' +
        '<div class="pp-x">' + I.x + '</div>' +
        '<div class="pp-in">' + (hasIn ? chips : '') + '<p' + h('input') + '>' + (hasIn ? o.input : '<span class="caret"></span><span class="ph">번역할 내용을 입력하세요</span>') + '</p></div>' + tr + kb + (o.kb ? '' : nav()) + '</div>';
    },
    lang(o) {
      const h = hotOf(o);
      const names = ['한국어', '영어', '일본어', '중국어(간체)', '중국어(번체)', '베트남어', '태국어', '인도네시아어', '스페인어', '프랑스어', '러시아어', '독일어', '이탈리아어'];
      return '<div class="pp">' + status(o, true) + '<div class="pp-ttl">' + I.back + '이 언어로 번역</div><div class="pp-list"><div class="is-chip"><span>모든 언어</span></div>' +
        names.map((n) => '<div' + (n === o.sel ? ' class="is-on"' : '') + h(n) + '>' + n + '</div>').join('') + '</div>' + nav() + '</div>';
    },
    /* 안내 소리: sound/ 의 mp3 가 있으면 그것을, 없으면 브라우저 음성(TTS)으로 읽음. 끝나면 done() */
    speak(text, lang, file, done) {
      let fired = false;
      const fin = () => { if (!fired) { fired = true; if (done) done(); } };
      const fallback = () => {
        try {
          const u = new SpeechSynthesisUtterance(text);
          u.lang = lang;
          u.onend = fin;
          u.onerror = fin;
          speechSynthesis.cancel();
          speechSynthesis.speak(u);
        } catch (e) { fin(); }
        setTimeout(fin, 6000);
      };
      try {
        const a = new Audio('sound/' + file);
        a.onended = fin;
        a.onerror = fallback;
        a.play().catch(fallback);
      } catch (e) { fallback(); }
    },
    I
  };
  /* 눌러야 할 요소 위에 손가락 + 깜빡임(.hit-pulse) + 클릭 영역 보정(HOT, ?edit 에서 조정). o: { key: FG·HOT 의 이름, FG: { 이름: [dx, dy] }, HOT: { 이름: [dx, dy, dw, dh] }, noPulse: 첫 화면(앱 로고)처럼 깜빡임을 뺄 때 true } */
  PP.finger = function (el, o) {
    clearFingers();
    if (!el) return;
    const fg = (o.FG && o.FG[o.key]) || [-10, -20];
    el.querySelectorAll(':scope > hit-pad').forEach((p) => p.remove());
    if (window.BoxEdit && o.HOT) BoxEdit.padEl(el, o.key, o.HOT);
    setTimeout(() => { if (el.isConnected) pointFingerAt(el, { onMain: true, pulse: !o.noPulse, dx: fg[0], dy: fg[1] }); }, 300);
  };
  window.PP = PP;
})();
