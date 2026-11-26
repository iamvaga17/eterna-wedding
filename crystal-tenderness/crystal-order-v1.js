/* WEDLETTER Crystal V40 editor contract */
window.WEDLETTER_CRYSTAL_SCHEMA={
  "groups": [
    [
      "cover",
      "Заставка",
      [
        [
          "coverKicker",
          "Фраза над именами",
          ".couture-kicker",
          "История двух сердец"
        ],
        [
          "coverDate",
          "Дата на заставке (пусто — автоматически)",
          ".couture-date",
          ""
        ],
        [
          "coverButton",
          "Кнопка открытия",
          ".couture-open > span:last-child",
          "Открыть нашу историю"
        ]
      ]
    ],
    [
      "hero",
      "Главная фотография",
      [
        [
          "heroKicker",
          "Верхняя подпись",
          ".hero > small",
          "Приглашение на свадьбу"
        ],
        [
          "heroText",
          "Фраза под датой",
          ".hero > p",
          "С этого дня — рука в руке, сердце к сердцу."
        ]
      ]
    ],
    [
      "save",
      "Календарь",
      [
        [
          "saveChapter",
          "Название раздела",
          ".save .chapter",
          "II · Сохраните дату"
        ],
        [
          "saveTitle",
          "Заголовок",
          ".save h2",
          "День нашей любви"
        ],
        [
          "saveText",
          "Описание",
          ".save .reveal > p",
          "Один летний день, который мы хотим сохранить в памяти вместе с вами."
        ],
        [
          "calendarMonth",
          "Название месяца (пусто — автоматически)",
          ".save .month",
          ""
        ],
        [
          "calendarFooter",
          "Подпись даты (пусто — автоматически)",
          ".save .glass > .date",
          ""
        ]
      ]
    ],
    [
      "letter",
      "Письмо",
      [
        [
          "letterChapter",
          "Название раздела",
          ".letter .chapter",
          "III · Наше письмо"
        ],
        [
          "letterTitle",
          "Заголовок",
          ".letter h2",
          "Тем, кто дорог нашему сердцу"
        ],
        [
          "letterSalute",
          "Обращение",
          ".letter-salute",
          "Любимые наши!"
        ],
        [
          "letterText",
          "Текст письма",
          ".letter-card p",
          "Совсем скоро мы скажем друг другу самое важное «да».\n\nНам хочется, чтобы в этот день рядом были те, кто дорог нашим сердцам. Разделите с нами радость, тепло и нежность этого мгновения."
        ],
        [
          "letterSignature",
          "Подпись (пусто — имена пары)",
          ".letter-card .signature",
          ""
        ],
        [
          "letterOpen",
          "Кнопка раскрытия",
          "",
          "Раскрыть письмо ✧"
        ],
        [
          "letterClose",
          "Кнопка закрытия",
          "",
          "Свернуть письмо"
        ]
      ]
    ],
    [
      "story",
      "История любви",
      [
        [
          "storyChapter",
          "Название раздела",
          ".story .chapter",
          "IV · История любви"
        ],
        [
          "storyTitle",
          "Заголовок",
          ".story h2",
          "Наша тихая нежность"
        ],
        [
          "storyText",
          "Описание",
          ".story .reveal > p:first-of-type",
          "Взгляды, улыбки и мгновения, из которых соткана наша любовь."
        ],
        [
          "storyEnd",
          "Подпись под галереей",
          ".story .reveal > p:last-child",
          "И это только начало…"
        ]
      ]
    ],
    [
      "venue",
      "Место встречи",
      [
        [
          "venueChapter",
          "Название раздела",
          ".venue .chapter",
          "V · Место встречи"
        ],
        [
          "venueTitle",
          "Заголовок",
          ".venue h2",
          "Там, где мы будем вместе"
        ],
        [
          "venueName",
          "Название площадки",
          ".venue h3",
          "Зал торжества"
        ],
        [
          "venueAddress",
          "Адрес и описание",
          ".venue .reveal > p:first-of-type",
          "Адрес будет указан в персональном приглашении."
        ],
        [
          "venueNote",
          "Подпись (можно оставить пустой)",
          ".venue small",
          "Демонстрационная площадка"
        ],
        [
          "mapLabel",
          "Надпись кнопки карты",
          "",
          "Открыть карту"
        ],
        [
          "mapUrl",
          "HTTPS-ссылка на карту",
          "",
          ""
        ],
        [
          "ceremonyLabel",
          "Название регистрации",
          "",
          "Регистрация брака"
        ],
        [
          "partyLabel",
          "Название банкета",
          "",
          "Банкет"
        ],
        [
          "ceremonyMap",
          "HTTPS-ссылка на карту регистрации",
          "",
          ""
        ],
        [
          "partyMap",
          "HTTPS-ссылка на карту банкета",
          "",
          ""
        ]
      ]
    ],
    [
      "program",
      "Расписание",
      [
        [
          "programChapter",
          "Название раздела",
          ".program .chapter",
          "VI · Ход дня"
        ],
        [
          "programTitle",
          "Заголовок",
          ".program h2",
          "Мелодия нашего дня"
        ]
      ]
    ],
    [
      "dress",
      "Дресс-код",
      [
        [
          "dressChapter",
          "Название раздела",
          ".dress .chapter",
          "VII · Образы вечера"
        ],
        [
          "dressTitle",
          "Заголовок",
          ".dress h2",
          "Палитра нежности"
        ],
        [
          "dressText",
          "Описание",
          ".dress .reveal > p",
          "Пусть ваши образы станут частью нежной палитры нашего дня."
        ],
        [
          "dressHer",
          "Подпись женского образа",
          ".looks > div:first-child small",
          "Для неё"
        ],
        [
          "dressHim",
          "Подпись мужского образа",
          ".looks > div:last-child small",
          "Для него"
        ]
      ]
    ],
    [
      "clock",
      "Обратный отсчёт",
      [
        [
          "clockChapter",
          "Название раздела",
          ".clock .chapter",
          "VIII · Время до встречи"
        ],
        [
          "clockTitle",
          "Заголовок",
          ".clock h2",
          "До нашего «да»"
        ],
        [
          "clockText",
          "Описание",
          ".clock .reveal > p",
          "С каждым мгновением наша встреча всё ближе."
        ],
        [
          "days",
          "Подпись дней",
          "",
          "Дни"
        ],
        [
          "hours",
          "Подпись часов",
          "",
          "Часы"
        ],
        [
          "minutes",
          "Подпись минут",
          "",
          "Мин"
        ],
        [
          "seconds",
          "Подпись секунд",
          "",
          "Сек"
        ]
      ]
    ],
    [
      "rsvp",
      "Анкета гостей",
      [
        [
          "rsvpChapter",
          "Название раздела",
          ".rsvp .chapter",
          "IX · Ваш ответ"
        ],
        [
          "rsvpTitle",
          "Заголовок",
          ".rsvp h2",
          "Будем счастливы видеть вас"
        ],
        [
          "rsvpText",
          "Приглашение к заполнению",
          ".rsvp .reveal > p:first-of-type",
          "Нам будет особенно радостно разделить этот день с вами."
        ],
        [
          "rsvpDeadline",
          "Фраза о сроке (пусто — из общей анкеты)",
          ".rsvp .reveal > p:nth-of-type(2)",
          ""
        ]
      ]
    ],
    [
      "ending",
      "Финальный экран",
      [
        [
          "endingChapter",
          "Название раздела",
          ".ending .chapter",
          "С любовью"
        ],
        [
          "endingTitle",
          "Финальная фраза",
          ".ending h2",
          "До встречи\nв нашей вечности"
        ],
        [
          "endingSignature",
          "Подпись (пусто — имена пары)",
          ".ending .signature",
          ""
        ],
        [
          "endingDate",
          "Дата (пусто — автоматически)",
          ".ending .date",
          ""
        ]
      ]
    ]
  ],
  "photos": [
    [
      "crystalCover",
      "Заставка — фон",
      "cover",
      ".couture-back",
      "bg"
    ],
    [
      "crystalHero",
      "Главная фотография пары",
      "hero",
      ".hero",
      "bg"
    ],
    [
      "crystalSaveBg",
      "Календарь — фон",
      "save",
      ".save",
      "pseudo"
    ],
    [
      "crystalLetterBg",
      "Письмо — фон",
      "letter",
      ".letter",
      "pseudo"
    ],
    [
      "crystalStory0",
      "История — фото 1",
      "story",
      ".story .gallery figure:nth-child(1) img",
      "img"
    ],
    [
      "crystalStory1",
      "История — фото 2",
      "story",
      ".story .gallery figure:nth-child(2) img",
      "img"
    ],
    [
      "crystalStory2",
      "История — фото 3",
      "story",
      ".story .gallery figure:nth-child(3) img",
      "img"
    ],
    [
      "crystalStoryBg",
      "История — фон",
      "story",
      ".story",
      "pseudo"
    ],
    [
      "crystalVenue",
      "Фото места проведения",
      "venue",
      ".venue .arch img",
      "img"
    ],
    [
      "crystalVenueBg",
      "Место проведения — фон",
      "venue",
      ".venue",
      "pseudo"
    ],
    [
      "crystalProgramBg",
      "Расписание — фон",
      "program",
      ".program",
      "pseudo"
    ],
    [
      "crystalDressBg",
      "Дресс-код — фон",
      "dress",
      ".dress",
      "pseudo"
    ],
    [
      "crystalLookHer",
      "Фото образа для неё (вместо силуэта)",
      "dress",
      ".looks > div:first-child",
      "look"
    ],
    [
      "crystalLookHim",
      "Фото образа для него (вместо силуэта)",
      "dress",
      ".looks > div:last-child",
      "look"
    ],
    [
      "crystalClockBg",
      "Обратный отсчёт — фон",
      "clock",
      ".clock",
      "bg"
    ],
    [
      "crystalRsvpBg",
      "Анкета — фон",
      "rsvp",
      ".rsvp",
      "pseudo"
    ],
    [
      "crystalEndingBg",
      "Финальный экран — фон",
      "ending",
      ".ending",
      "bg"
    ]
  ],
  "events": [
    {
      "time": "15:00",
      "title": "Встреча гостей"
    },
    {
      "time": "16:00",
      "title": "Церемония"
    },
    {
      "time": "17:00",
      "title": "Праздничный ужин"
    },
    {
      "time": "20:00",
      "title": "Первый танец"
    },
    {
      "time": "23:00",
      "title": "Финал вечера"
    }
  ],
  "palette": [
    "#dedbd5",
    "#c9b8a4",
    "#afbecd",
    "#a6b2a3",
    "#92949e"
  ],
  "garments": {
    "her": "#afbecd",
    "him": "#a6b2a3",
    "tie": "#92949e"
  }
};

(function(){
'use strict';
const S=window.WEDLETTER_CRYSTAL_SCHEMA,gate=document.getElementById('gate');
if(!gate||!document.querySelector('main .crystal-thread'))return;
const preview=new URLSearchParams(location.search).get('editor-preview')==='1'&&window.parent!==window;
const q=s=>document.querySelector(s),all=s=>[...document.querySelectorAll(s)];
const safeText=(el,v)=>{if(el&&el.textContent!==String(v??''))el.textContent=String(v??'')};
const txt=(sel,v)=>safeText(q(sel),v);
const defaultDate='2027-07-17T16:00:00+03:00';
const originalImages=new Map();
for(const [key,, ,sel,type] of S.photos)if(type==='img')originalImages.set(key,q(sel)?.getAttribute('src')||'');
const rowTemplate=q('.thread-event').cloneNode(true),thread=q('.crystal-thread'),art=q('.thread-art');
let eventsFingerprint='',rsvpFingerprint='',scheduleRows=[],pathLength=0,progress=0,raf=0;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
function updateThread(){
 raf=0;if(!scheduleRows.length||thread.closest('section').hidden)return;
 const path=art.querySelector('.thread-lit'),rect=thread.getBoundingClientRect();
 if(!rect.height)return;
 const cursor=((window.visualViewport?.height||innerHeight)*.75-rect.top)/rect.height*(scheduleRows.length*160);
 if(reduce){path.style.strokeDashoffset='0';scheduleRows.forEach(row=>row.classList.add('lit'));return;}
 const start=80,end=(scheduleRows.length-.5)*160;
 const p=end===start?1:Math.max(0,Math.min(1,(cursor-start)/(end-start)));
 progress=Math.max(progress,p);
 if(pathLength>0){
 let lo=0,hi=pathLength,target=start+progress*(end-start);
 for(let j=0;j<14;j++){let m=(lo+hi)/2;if(path.getPointAtLength(m).y<target)lo=m;else hi=m;}
 path.style.strokeDashoffset=String(pathLength-(lo+hi)/2);
 }
 scheduleRows.forEach((row,i)=>{if(cursor>=80+i*160&&!row.classList.contains('lit')){row.classList.add('lit','flash');setTimeout(()=>row.classList.remove('flash'),900)}});
}
function queueThread(){if(!raf)raf=requestAnimationFrame(updateThread)}
addEventListener('scroll',queueThread,{passive:true});addEventListener('resize',queueThread,{passive:true});
function setSchedule(events){
 const rows=Array.isArray(events)?events.slice(0,20):S.events;
 const fp=JSON.stringify(rows);if(fp===eventsFingerprint)return;eventsFingerprint=fp;
 thread.querySelectorAll('.thread-event').forEach(el=>el.remove());
 scheduleRows=rows.map(e=>{const el=rowTemplate.cloneNode(true);el.classList.remove('lit','flash');safeText(el.querySelector('time'),e.time);safeText(el.querySelector('.thread-copy p'),e.title);thread.append(el);return el});
 const n=rows.length;let d='M50 80';for(let i=1;i<n;i++){let y=80+(i-1)*160;d+=' C'+(i%2?10:90)+' '+(y+53)+' '+(i%2?90:10)+' '+(y+107)+' 50 '+(y+160);}
 art.setAttribute('viewBox','0 0 100 '+Math.max(160,n*160));
 for(const path of art.querySelectorAll('path'))path.setAttribute('d',d);
 art.style.display=n>1?'':'none';
 const path=art.querySelector('.thread-lit');pathLength=n>1?path.getTotalLength():0;
 progress=0;path.style.strokeDasharray=pathLength?pathLength+' '+pathLength:'';path.style.strokeDashoffset=reduce?'0':String(pathLength);
 // Keep text readable on fast scrolling; only the crystal line and gem animate.
 thread.classList.remove('thread-ready');queueThread();
}
function mediaUrl(value,allowBlob=preview){
 if(typeof value!=='string'||!value.trim())return '';
 try{const u=new URL(value,location.href);if(u.protocol==='https:'||u.protocol==='http:'||(allowBlob&&u.protocol==='blob:'))return u.href}catch{}
 return '';
}
function httpsUrl(value){try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password?u.href:''}catch{return ''}}
function position(value){const m=String(value||'').match(/^center\s+(\d{1,3})%$/);return m?'center '+Math.min(100,Number(m[1]))+'%':'center 50%'}
function applyPhotos(cfg){
 for(const [key,, ,sel,type] of S.photos){
  const el=q(sel);if(!el)continue;
  const src=mediaUrl(cfg.photos?.[key]),pos=position(cfg.photoPosition?.[key]);
  if(type==='img'){
   const next=src||originalImages.get(key);if(next&&el.getAttribute('src')!==next)el.setAttribute('src',next);
   el.style.objectPosition=src?pos:'';
  }else if(type==='look'){
   let image=el.querySelector('.crystal-custom-look');if(src){if(!image){image=document.createElement('img');image.className='crystal-custom-look';image.alt='Пример образа';el.prepend(image)}if(image.getAttribute('src')!==src)image.setAttribute('src',src);image.style.objectPosition=pos;el.classList.add('crystal-look-custom');}else{image?.remove();el.classList.remove('crystal-look-custom');}
  }else if(type==='pseudo'){
   if(src){el.style.setProperty('--crystal-order-bg','url('+JSON.stringify(src)+')');el.style.setProperty('--crystal-order-pos',pos);el.classList.add('crystal-custom-bg')}else{el.classList.remove('crystal-custom-bg');el.style.removeProperty('--crystal-order-bg');el.style.removeProperty('--crystal-order-pos')}
  }else{
   if(src){el.style.setProperty('background-image','url('+JSON.stringify(src)+')','important');el.style.setProperty('background-position',pos,'important')}else{el.style.removeProperty('background-image');el.style.removeProperty('background-position')}
   const section=key==='crystalCover'?gate:el;section.classList.toggle('crystal-photo-scene',!!src);
   if(src)section.querySelectorAll('video').forEach(v=>v.pause());
  }
 }
}
function validDate(value){if(!/^\d{4}-\d{2}-\d{2}$/.test(value||''))return '';const d=new Date(value+'T12:00:00');return !Number.isNaN(+d)&&d.getFullYear()===Number(value.slice(0,4))&&d.getMonth()+1===Number(value.slice(5,7))&&d.getDate()===Number(value.slice(8,10))?value:''}
function humanDate(value){return validDate(value)?new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'long',year:'numeric'}).format(new Date(value+'T12:00:00')):''}
function numericDate(value){return value.split('-').reverse().join('.')}
function setCalendar(date,selectedDates){
 const cal=q('#cal');if(!cal)return;const d=new Date(date+'T12:00:00'),y=d.getFullYear(),m=d.getMonth();if(Number.isNaN(+d))return;
 const fingerprint=date+'|'+selectedDates.join(',');if(cal.dataset.crystalFingerprint===fingerprint)return;cal.dataset.crystalFingerprint=fingerprint;cal.replaceChildren();
 const add=(v,selected=false)=>{const span=document.createElement('span');span.textContent=v;if(selected)span.className='selected';cal.append(span)};
 ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].forEach(v=>add(v));const first=(new Date(y,m,1).getDay()+6)%7;for(let i=0;i<first;i++)add('');
 for(let i=1;i<=new Date(y,m+1,0).getDate();i++){const day=y+'-'+String(m+1).padStart(2,'0')+'-'+String(i).padStart(2,'0');add(i,selectedDates.includes(day))}
}
function mapLink(parent,value,label){
 const url=httpsUrl(value);if(!url)return;
 const a=document.createElement('a');a.className='link-btn';a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=label||'Открыть карту';parent.append(a);
}
function splitDates(cfg,t){
 const d=cfg.eventDates||{},split=d.mode==='split';
 let dates=q('.crystal-event-dates');if(!dates){dates=document.createElement('div');dates.className='crystal-event-dates';q('.save .reveal').append(dates)}
 let venues=q('.crystal-event-venues');if(!venues){venues=document.createElement('div');venues.className='crystal-event-venues';q('.venue .reveal').append(venues)}
 dates.replaceChildren();venues.replaceChildren();
 const regular=[q('.venue h3'),q('.venue .reveal > p:first-of-type'),q('.venue .reveal > p:nth-of-type(2)')];
 regular.forEach(el=>{if(el)el.hidden=split});
 if(!split){mapLink(venues,t.mapUrl,t.mapLabel);return}
 for(const [key,label,map] of [['ceremony',t.ceremonyLabel,t.ceremonyMap],['party',t.partyLabel,t.partyMap]]){
  const date=validDate(d[key+'Date']),time=d[key+'Time']||'',name=d[key+'Venue']||'',address=d[key+'Address']||'';
  const dateLine=document.createElement('p');dateLine.textContent=[label,humanDate(date),time].filter(Boolean).join(' · ');dates.append(dateLine);
  const card=document.createElement('div');card.className='crystal-location-card';const h=document.createElement('h3');h.textContent=label;card.append(h);
  for(const value of [name,address,[humanDate(date),time].filter(Boolean).join(' · ')])if(value){const p=document.createElement('p');p.textContent=value;card.append(p)}
  mapLink(card,map,t.mapLabel);venues.append(card);
 }
}
const audio=document.createElement('audio');audio.loop=true;audio.preload='none';
const musicButton=document.createElement('button');musicButton.type='button';musicButton.className='crystal-music';musicButton.hidden=true;musicButton.textContent='♪';musicButton.setAttribute('aria-label','Включить музыку');document.body.append(audio,musicButton);
function musicState(){musicButton.setAttribute('aria-label',audio.paused?'Включить музыку':'Выключить музыку');musicButton.setAttribute('aria-pressed',String(!audio.paused));musicButton.textContent=audio.paused?'♪':'Ⅱ'}
audio.addEventListener('play',musicState);audio.addEventListener('pause',musicState);
musicButton.onclick=()=>audio.paused?audio.play().catch(()=>{}):audio.pause();
q('#open').addEventListener('click',()=>{if(audio.getAttribute('src'))audio.play().catch(()=>{})});
function apply(cfg){
 if(!cfg||typeof cfg!=='object')return;
 const c=cfg.crystal||{},couple=cfg.couple||{},t={};for(const [, ,fields] of S.groups)for(const [key,, ,def] of fields)t[key]=typeof c.text?.[key]==='string'?c.text[key]:def;
 for(const [, ,fields] of S.groups)for(const [key,,sel] of fields)if(sel)txt(sel,t[key]);
 const first=String(couple.first||'Михаил'),second=String(couple.second||'София');
 const cover=q('.couture-copy h2'),amp=cover.querySelector('i'),em=cover.querySelector('em');
 if(cover.firstChild?.nodeType===3)cover.firstChild.nodeValue=first+' ';else cover.prepend(document.createTextNode(first+' '));safeText(amp,'&');safeText(em,second);
 const hero=q('.hero .names'),heroAmp=hero.querySelector('span');hero.replaceChildren(document.createTextNode(first),heroAmp,document.createTextNode(second));
 document.title=first+' и '+second+' · Хрустальная нежность';
 let rawDate=validDate(String(couple.dateTime||'').slice(0,10))||defaultDate.slice(0,10);
 const ed=cfg.eventDates||{};if(ed.mode==='split')rawDate=validDate(ed[(ed.mainEvent==='party'?'party':'ceremony')+'Date'])||rawDate;
 const date=validDate(c.calendarDate)||rawDate;
 const selected=[date];if(ed.mode==='split')for(const k of ['ceremonyDate','partyDate']){const d=validDate(ed[k]);if(d&&!selected.includes(d))selected.push(d)}
 setCalendar(date,selected);
 const mo=new Intl.DateTimeFormat('ru-RU',{month:'long'}).format(new Date(date+'T12:00:00'));txt('.save .month',t.calendarMonth||mo.charAt(0).toUpperCase()+mo.slice(1)+' · '+date.slice(0,4));
 txt('.save .glass > .date',t.calendarFooter||numericDate(date));txt('.couture-date',t.coverDate||numericDate(rawDate).split('.').join(' · '));txt('.hero > .date',couple.dateLabel||humanDate(rawDate));txt('.ending .date',t.endingDate||numericDate(rawDate));
 txt('.ending .signature',t.endingSignature||first+' & '+second);txt('.letter-card .signature',t.letterSignature||first+' и '+second);txt('.seal-initials',Array.from(first.trim())[0]+' & '+Array.from(second.trim())[0]);
 window.CRYSTAL_LETTER_LABELS={open:t.letterOpen,close:t.letterClose};txt('#letterOpen',q('#letterOpen').getAttribute('aria-expanded')==='true'?t.letterClose:t.letterOpen);
 let countdown=c.countdownDateTime||couple.dateTime||defaultDate;
 if(!/(?:Z|[+-]\d{2}:\d{2})$/i.test(countdown))countdown+='+03:00';
 window.CRYSTAL_COUNTDOWN=Number.isFinite(Date.parse(countdown))?countdown:defaultDate;window.CRYSTAL_TIMER_LABELS=[t.days,t.hours,t.minutes,t.seconds];
 for(const [key] of S.groups){if(key==='cover'||key==='hero')continue;const section=q('main section.'+key);if(section)section.hidden=c.sections?.[key]===false;}
 setSchedule(c.events);applyPhotos(cfg);
 const colors=S.palette.map((v,i)=>/^#[0-9a-f]{6}$/i.test(c.palette?.[i]||'')?c.palette[i]:v);
 const garments={};for(const [k,v] of Object.entries(S.garments))garments[k]=/^#[0-9a-f]{6}$/i.test(c.garments?.[k]||'')?c.garments[k]:v;
 window.CRYSTAL_SET_DRESS_COLORS(colors,garments);splitDates(cfg,t);
 const rsvp=cfg.rsvp||window.WEDDING_RSVP_CONFIG,endpoint=preview?'':window.ETERNA_RSVP_ENDPOINT?.(rsvp?.endpoint)||'';
 const deadline=rsvp?.deadline||'';txt('.rsvp .reveal > p:nth-of-type(2)',t.rsvpDeadline||(deadline?'Пожалуйста, сообщите о своём присутствии '+deadline.replace(/\.$/,'')+'.':''));
 const demoNote=q('.rsvp .glass > .subnote');if(demoNote)demoNote.hidden=!!endpoint;
 const fingerprint=JSON.stringify([rsvp,endpoint]);if(fingerprint!==rsvpFingerprint){rsvpFingerprint=fingerprint;window.ETERNA_MOUNT_RSVP?.(q('#rsvpDynamic'),rsvp,{demo:!endpoint,endpoint})}
 const track=mediaUrl(cfg.music?.source);if(track){if(audio.getAttribute('src')!==track)audio.src=track;musicButton.hidden=false;}else{audio.pause();audio.removeAttribute('src');musicButton.hidden=true;}musicState();queueThread();
}
if(preview)addEventListener('message',e=>{if(e.origin===location.origin&&e.source===parent&&e.data?.type==='crystal-editor-preview')apply(e.data.config)});
if(!preview&&window.CRYSTAL_ORDER)apply(window.CRYSTAL_ORDER);
})();
