/* Papago 번역 앱 화면 그리기(사회 12차시). 공용 폰 틀(.phone-frame > .phone-screen) 안에 넣을 화면을 HTML 글자로 돌려줌. 스타일은 css/common.css 의 .pp-*
   PP.mount(화면요소, PP.home({...})) 처럼 씀. 눌러야 할 곳은 o.hot 에 이름을 넘기면 data-hot="이름" 이 붙고, 마우스를 올리면 분홍 테두리가 생김.
   PP.home({from,to,hot:['voice','talk','image','doc','learn','input','from','to'],time})
   PP.voice({from,to,state:'listen'|'result',src,out,pron,hot:['mic','back'],time})
   PP.cam({from,to,photo,pos,mode:'live'|'result',overlays:[{box:[left%,top%,폭%,높이%],html,bg,color,fs,rot,hot}],load,hot:['shoot'],time})
   PP.launcher({hot:['app']}), PP.speak(글,언어,소리파일,끝나면)
   PP.text({from,to,input,kb,sug,result:{big,pron},hot:['input','sug','enter'],time})
   PP.lang({sel,hot:['한국어','영어',…],time}) */
(function () {
  const S = (d, a) => '<svg viewBox="0 0 24 24"' + (a ? ' ' + a : '') + '>' + d + '</svg>';
  const I = {
    mic: S('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0013 0M12 17.5V21"/>'),
    talk: S('<path d="M4 5h16a1 1 0 011 1v9a1 1 0 01-1 1h-8l-5 4v-4H4a1 1 0 01-1-1V6a1 1 0 011-1z"/><path d="M8 10.5h.01M12 10.5h.01M16 10.5h.01" stroke-width="2.6"/>'),
    image: S('<rect x="4" y="4" width="16" height="16" rx="2.5"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/>'),
    doc: S('<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/>'),
    learn: S('<path d="M4 8V5a1 1 0 011-1h3M16 4h3a1 1 0 011 1v3M20 16v3a1 1 0 01-1 1h-3M8 20H5a1 1 0 01-1-1v-3"/><path d="M8 9h8M8 12h8M8 15h5"/>'),
    back: S('<path d="M19 12H5M11 5l-7 7 7 7"/>'),
    menu: S('<path d="M4 7h16M4 12h16M4 17h16"/>'),
    swap: S('<path d="M4 9h15M15 5l4 4-4 4M20 15H5M9 11l-4 4 4 4"/>'),
    chev: S('<path d="M6 9l6 6 6-6"/>'),
    spk: S('<path d="M4 9v6h4l5 4V5L8 9zM16.500 9a4 4 0 010 6"/>'),
    copy: S('<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2"/>'),
    share: S('<path d="M12 15V3M8 7l4-4 4 4M5 12v7a1 1 0 001 1h12a1 1 0 001-1v-7"/>'),
    star: S('<path d="M12 3.500l2.600 5.400 5.900.8-4.300 4.100 1 5.900L12 16.900 6.800 19.700l1-5.900L3.500 9.700l5.900-.8z"/>'),
    expand: S('<path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/>'),
    flash: S('<path d="M13 3L5 13.500h6L10 21l8-10.500h-6z" fill="currentColor"/>'),
    gal: S('<path d="M3 18l5-7 4 5 3-3 6 5M16 7.500h.01" stroke-width="2.4"/>'),
    rot: S('<path d="M4 12a8 8 0 108-8M4 4v5h5"/>'),
    tsel: S('<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8.500 9V8h7v1M12 8v8M10.500 16h3"/>'),
    spark: S('<path d="M12 3l1.800 5.200L19 10l-5.200 1.800L12 17l-1.800-5.200L5 10l5.200-1.800zM18 15l.8 2.200L21 18l-2.200.8L18 21l-.8-2.200L15 18l2.200-.8z" fill="currentColor"/>'),
    x: S('<path d="M6 6l12 12M18 6L6 18"/>'),
    set: S('<path d="M5 8h9M18 8h1M5 16h1M10 16h9"/><circle cx="16" cy="8" r="2"/><circle cx="8" cy="16" r="2"/>'),
    cam: S('<rect x="4" y="4" width="16" height="16" rx="2.500"/><rect x="9" y="9" width="6" height="6" rx="1.200"/>'),
    sug: S('<rect x="5" y="3" width="14" height="18" rx="2.500"/><path d="M9 8h6M9 12h6M9 16h3"/>'),
    shift: S('<path d="M12 4l8 9h-5v6H9v-6H4z"/>'),
    bs: S('<path d="M9 5h10a2 2 0 012 2v10a2 2 0 01-2 2H9l-6-7z"/><path d="M12 9.500l5 5M17 9.500l-5 5"/>'),
    dots: S('<circle cx="5" cy="12" r="1.600" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.600" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.600" fill="currentColor" stroke="none"/>')
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
        '<div class="pp-top">' + I.menu + '<b>papago</b><em>edu</em></div>' +
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
        ov += '<div class="pp-ov"' + (v.hot ? ' data-hot="' + v.hot + '"' : '') + ' style="left:' + v.box[0] + '%;top:' + v.box[1] + '%;width:' + v.box[2] + '%;height:' + v.box[3] + '%;background:' + (v.bg || 'rgba(255,255,255,.88)') + ';color:' + (v.color || '#2a2a2a') + ';font-size:' + (v.fs || 18) + 'px' + (v.rot ? ';transform:rotate(' + v.rot + 'deg)' : '') + '">' + v.html + '</div>';
      });
      const bottom = live
        ? '<div class="pp-cam-b"><span class="sm">' + I.gal + '</span><span class="sm is-sq" style="left:74px">' + I.doc + '</span><button type="button" class="go"' + h('shoot') + '>' + I.cam + '</button><span class="sm" style="right:16px">' + I.flash + '</span><div class="modes"><span class="is-on">전체번역</span><span>실시간 번역</span><span>부분번역</span></div></div>'
        : '<div class="pp-cam-r"><span>' + I.share + '공유/저장</span><span>' + I.rot + '회전</span><span>' + I.tsel + '전체선택</span><span><i class="ai">' + I.spark + '</i>바로번역</span></div>';
      return '<div class="pp is-blue">' + status(o) + '<div class="pp-bar">' + I.back + langRow(o, h) + '</div>' +
        '<div class="pp-cam' + (live ? '' : ' is-result') + '" style="background-image:url(\'' + (o.photo || '') + '\');background-position:' + (o.pos || 'center') + '">' + (live ? '<span class="tag">텍스트 정렬</span>' : '<span class="pp-err">오류신고</span>') + ov + (o.load ? '<div class="pp-load"><i></i></div>' : '') + '</div>' +
        bottom + nav('is-ghost') + '</div>';
    },
    text(o) {
      const h = hotOf(o);
      const hasIn = !!o.input;
      let tr = '';
      if (o.result) {
        tr = '<div class="pp-tr"><p class="big">' + o.result.big + '</p>' + (o.result.pron ? '<p class="pr">' + o.result.pron + '</p>' : '') + '<div class="fb"><span>좋아요</span><span>어색해요</span></div></div>';
      }
      let kb = '';
      if (o.kb) {
        const row = (s, cls) => '<div class="pp-kb-row">' + s.split('').map((c) => '<span' + (cls ? ' class="' + cls + '"' : '') + '>' + c + '</span>').join('') + '</div>';
        kb = '<div class="pp-kb"><div class="pp-kb-tools">' + (o.sug ? '<span class="pp-kb-sug"' + h('sug') + '>' + I.sug + o.sug + '</span>' : I.set) + I.dots + '</div><div class="pp-kb-rows">' +
          row('1234567890') + row('ㅂㅈㄷㄱㅅㅛㅕㅑㅐㅔ') + row('ㅁㄴㅇㄹㅎㅗㅓㅏㅣ') +
          '<div class="pp-kb-row"><span class="is-dk">' + I.shift + '</span>' + 'ㅋㅌㅊㅍㅠㅜㅡ'.split('').map((c) => '<span>' + c + '</span>').join('') + '<span class="is-dk">' + I.bs + '</span></div>' +
          '<div class="pp-kb-row"><span class="is-dk">!#1</span><span class="is-dk">,</span><span class="is-dk">한/영</span><span class="is-w">&nbsp;</span><span class="is-dk">.</span><span class="is-b"' + h('enter') + '>이동</span></div></div></div>';
      }
      return '<div class="pp">' + status(o, true) + '<div class="pp-bar">' + I.back + langRow(o, h) + '<svg class="is-r" viewBox="0 0 24 24">' + '<path d="M5 8h9M18 8h1M5 16h1M10 16h9"/><circle cx="16" cy="8" r="2"/><circle cx="8" cy="16" r="2"/></svg></div>' +
        '<div class="pp-x">' + I.x + '</div>' +
        '<div class="pp-in"><p' + h('input') + '>' + (hasIn ? o.input : '<span class="caret"></span><span class="ph">번역할 내용을 입력하세요</span>') + '</p></div>' + tr + kb + (o.kb ? '' : nav()) + '</div>';
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
        const a = new Audio(ASSET_BASE + 'sound/' + file);
        a.onended = fin;
        a.onerror = fallback;
        a.play().catch(fallback);
      } catch (e) { fallback(); }
    },
    I
  };
  window.PP = PP;
})();
