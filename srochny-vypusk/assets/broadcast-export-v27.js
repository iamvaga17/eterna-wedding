(() => {
  'use strict';
  // Only this local editor preview accepts same-origin configuration messages.
  let config = window.ETERNA_BROADCAST_ORDER || null;
  const set = (selector, value) => {
    const node = document.querySelector(selector);
    if (node && typeof value === 'string') node.textContent = value;
  };
  function apply() {
    if (!config) return;
    const c = config.couple || {}, b = config.broadcast || {};
    const names = [c.first,c.second].filter(Boolean).join(' и ');
    if (names) {
      set('.news-photo figcaption b', names);
      set('.live-copy h2', b.liveTitle || 'Свадьба подтверждена');
      set('.monitor figcaption span:first-child', 'Репортаж: ' + names);
      document.title = names + ' — Срочный выпуск';
    }
    set('.live-copy > p:last-child', b.liveText);
    set('.archive-grid h2', b.storyTitle);
    set('.archive-grid > div > p:last-child', b.storyText);
    set('.archive-photo figcaption', b.storyCaption);
    set('.desk-headline h2', b.newsHeader);
    set('.desk-headline > p:last-child', b.newsIntro);
    set('.forecast-copy h2', b.forecastTitle);
    set('.forecast-copy > p:not(.section-kicker)', b.forecastText);

    window.ETERNA_BROADCAST_LIVE_ZOOM_TEXT = b.liveZoomResult;
    window.ETERNA_BROADCAST_FORECAST_RESULT = b.forecastResult;

    const vis=b.sections||{};
    for(const [key,selector] of Object.entries({archive:'.archive',news:'.news-desk',schedule:'.field-report',forecast:'.forecast',rsvp:'.response'})){
      const target=document.querySelector(selector);if(target)target.hidden=vis[key]===false;
    }
    if(Array.isArray(b.schedule)){
      const list=document.querySelector('.rundown');
      if(list){
        list.replaceChildren();
        for(const ev of b.schedule){
          const row=document.createElement('li'),time=document.createElement('time'),part=document.createElement('div'),title=document.createElement('b'),text=document.createElement('p');
          time.textContent=ev.time||'';if(/^([01]?\d|2[0-3]):[0-5]\d$/.test(ev.time||''))time.setAttribute('datetime',ev.time);
          title.textContent=ev.title||'';text.textContent=ev.description||'';
          part.append(title,text);row.append(time,part);list.append(row);
        }
      }
    }
    // Every visible editorial section is configurable from the same order data.
    const contentMap={"introTag":".opening .broadcast-label","introText":".opening-copy > p:not(.broadcast-label)","introPhotoCaption":".monitor figcaption span:first-child","tickerLabel":".newsline-label","tickerText":".newsline p","liveTag":".live .section-bar .broadcast-label","liveCaption":".news-photo figcaption > span:first-of-type","archiveTag":".archive .section-kicker","newsTag":".desk-topline .broadcast-label","newsKicker":".desk-headline .section-kicker","scheduleTag":".field-report-head .section-kicker","scheduleTitle":"#schedule-title","venueText":".venue-note","forecastTag":".forecast .section-kicker","rsvpTag":".response .section-kicker","rsvpTitle":"#response-title","rsvpText":".response > div:first-child > p:last-child","footerText":".signoff p","news0Button":"[data-desk=\"0\"]","news1Button":"[data-desk=\"1\"]","news2Button":"[data-desk=\"2\"]"};
    for(const [key,selector] of Object.entries(contentMap)){
      if(key.endsWith('Button') || key==='introTag'||key==='liveTag'||key==='newsTag'){
        const node=document.querySelector(selector);
        if(node && typeof b[key]==='string'){
          if(key.endsWith('Button')){
            const prefix=node.querySelector('span')?.outerHTML || '';
            node.replaceChildren();
            if(prefix){const stub=document.createElement('span');stub.textContent=String(Number(key.slice(4,5))+1).padStart(2,'0');node.append(stub)}
            node.append(document.createTextNode(' '+b[key]));
          } else {
            const dot=node.querySelector('i');
            node.textContent=b[key];if(dot)node.prepend(dot);
          }
        }
      } else set(selector,b[key]);
    }
    if(typeof b.introTitle==='string'){
      const title=document.querySelector('.opening h1');
      if(title){
        const words=b.introTitle.trim().split(/\s+/);
        const midpoint=Math.max(1,Math.ceil(words.length/2));
        title.replaceChildren(document.createTextNode(words.slice(0,midpoint).join(' ')),document.createElement('br'));
        const highlight=document.createElement('em');
        highlight.textContent=words.slice(midpoint).join(' ');
        title.append(highlight);
      }
    }
    if(typeof b.introButton==='string') {
      const a=document.querySelector('#tune-in');
      if(a){const arrow=a.querySelector('span');a.textContent=b.introButton+' ';if(arrow)a.append(arrow)}
    }
    for(let i=0;i<5;i++){
      const li=document.querySelectorAll('.forecast .palette li')[i];
      const color=b['palette'+i];
      if(li && typeof color==='string' && /^#[0-9a-fA-F]{6}$/.test(color))li.style.setProperty('--swatch',color);
    }
    const btn=document.querySelector('[data-cake]');
    if(btn && typeof b.liveButton==='string')btn.textContent=b.liveButton+' ↗';
    const forecastBtn=document.querySelector('[data-forecast]');
    if(forecastBtn && typeof b.forecastButton==='string')forecastBtn.textContent=b.forecastButton+' ↗';
    const footerBtn=document.querySelector('.signoff a');
    if(footerBtn && typeof b.footerButton==='string')footerBtn.textContent=b.footerButton+' ↑';
    // Interactive updates are applied after each tab switch by the calling bridge.
    const sceneMap = [
      ['sceneCover','.monitor-picture img'],
      ['sceneCake','.news-photo img'],
      ['sceneArchive','.archive-photo img'],
      ['sceneForecast','.forecast-photo img']
    ];
    for (const [key,selector] of sceneMap) {
      const node = document.querySelector(selector);
      if (!node) continue;
      const uri = b.exportPhotos && b.exportPhotos[key];
      const defaultSrc = node.dataset.editorDefaultSrc || node.getAttribute('src');
      node.dataset.editorDefaultSrc = defaultSrc;
      if (typeof uri === 'string' && /^assets\/custom-(cover|cake|archive|forecast)\.jpg$/.test(uri)) node.src = uri;
      else node.src = defaultSrc;
    }
    const date = (c.dateLabel || '').trim();
    const city = (c.city || '').trim();
    if (date) {
      set('.monitor figcaption span:last-child', date);
      set('.edition', date + '\n' + city);
    }
    set('.live-copy .section-kicker', [city,date].filter(Boolean).join(' · '));
    const newsIndex = Array.from(document.querySelectorAll('[data-desk]')).findIndex(el => el.getAttribute('aria-pressed') === 'true');
    const i = Math.max(0,newsIndex);
    set('#desk-story-title', b['news'+i+'Title']);
    set('#desk-story-copy', b['news'+i+'Text']);
    set('#desk-category',b['news'+i+'Category']);
    set('#desk-ticker',b['news'+i+'Ticker']);

  }
  // Standalone order site: data is local, loaded by order.js before this deferred file.
  apply();
  // Apply custom copy after the original interactive scripts switch news or dossier.
  document.addEventListener('click', event => {
    if (event.target.closest('[data-desk]')) setTimeout(apply, 1230);
    if (event.target.closest('[data-case]')) requestAnimationFrame(apply);
  });

})();