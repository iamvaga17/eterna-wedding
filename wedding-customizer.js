/* ÉTERNA — управление содержимым, без изменения структуры RSVP */
(function(){
const set=(selector,value)=>{const el=document.querySelector(selector);if(el&&value!==undefined&&value!==null)el.textContent=String(value)};
const img=(selector,url,position)=>{const el=document.querySelector(selector);if(!el)return;
 if(!el.dataset.etOriginalSrc)el.dataset.etOriginalSrc=el.getAttribute('src')||'';
 if(typeof url==='string'&&url.trim())el.src=url.trim();else if(el.dataset.etOriginalSrc)el.src=el.dataset.etOriginalSrc;
 if(position)el.style.objectPosition=position;else el.style.removeProperty('object-position');};
const hide=(selector,enabled)=>{const el=document.querySelector(selector);if(el){el.hidden=!enabled;el.style.setProperty('display',enabled?'':'none',enabled?'':'important')}};
const d=(o,k)=>o&&Object.prototype.hasOwnProperty.call(o,k)?o[k]:undefined;
function apply(c){if(!c)return;
const names=c.couple||{},t=c.text||{},p=c.photos||{},positions=c.photoPosition||{},sections=c.sections||{};
set('#ecName1',names.first);set('#ecName2',names.second);set('#ecDate',names.dateLabel);set('#ecCity',names.city);
set('#intro-title',null);
const intro=document.querySelector('#intro-title');if(intro&&names.first&&names.second)intro.innerHTML='';
if(intro&&names.first&&names.second){const a=document.createTextNode(names.first),e=document.createElement('em'),b=document.createTextNode(names.second);e.textContent='и';intro.append(a,e,b)}
set('.cover-bottom',(names.dateLabel&&names.city)?names.dateLabel+' · '+names.city:undefined);
set('.ec-edition span:last-child',(names.dateLabel||'').replace(/[^0-9]/g,' ').trim().replace(/\s+/g,' · '));
set('.ec-corner',names.first&&names.second?names.first.charAt(0)+' · '+names.second.charAt(0):undefined);
img('#ecMain',p.main,positions.main);img('#ecSide1',p.secondary1,positions.secondary1);img('#ecSide2',p.secondary2,positions.secondary2);
const cover=document.querySelector('.editorial-cover');if(cover){let count=0;[['#ecMain','main'],['#ecSide1','secondary1'],['#ecSide2','secondary2']].forEach(([selector,k])=>{const el=document.querySelector(selector),wrap=el&&el.closest('.ec-photo');if(!wrap)return;const valid=typeof p[k]==='string'&&!!p[k].trim();if(!valid&&k!=='main')wrap.style.display='none';else{wrap.style.display='';count++}});cover.dataset.photoCount=String(Math.max(count,1))}
img('.story-main img',p.storyMain);img('.story-small img',p.storySmall);

// All sections — photo replacement. Empty values preserve the template's original photo.
const replaceImage=(selector,key)=>{img(selector,p[key],positions[key])};
replaceImage('.opening-image.first img','collage1');
replaceImage('.opening-image.second img','collage2');
// Expandable women's and men's inspiration galleries (2–8 photos per group).
const mood=document.querySelector('#dress .mood-grid');
if(mood){
 if(!mood.dataset.etOriginalImages)mood.dataset.etOriginalImages=JSON.stringify(Array.from(mood.querySelectorAll('img')).map(el=>el.src));
 const originals=JSON.parse(mood.dataset.etOriginalImages);
 // Older ÉTERNA templates have three direct image cards. Once the editable
 // galleries exist these legacy cards must not remain in the layout.
 Array.from(mood.children).filter(el=>el.matches('figure')).forEach(el=>el.remove());
 const palettes=c.dressPalettes||{},defaults={female:['#e8d9c8','#c6af94','#b2b5a5','#d3b8ac','#73665b'],male:['#272b2e','#51595b','#9b9d95','#d0c7b9','#f1e9de']};
 for(const [gender,label] of [['female','Для неё'],['male','Для него']]){
  const cls='et-dress-'+gender;let group=mood.querySelector('.'+cls);
  if(!group){group=document.createElement('section');group.className='et-dress-group '+cls;const h=document.createElement('h3');h.textContent=label;group.append(h);const g=document.createElement('div');g.className='et-dress-pictures';group.append(g);const pal=document.createElement('div');pal.className='et-dress-colors';for(let i=0;i<5;i++)pal.append(document.createElement('span'));group.append(pal)}
  const grid=group.querySelector('.et-dress-pictures');const count=Math.min(8,Math.max(2,Number(c.dressPhotoCounts?.[gender])||2));grid.dataset.count=String(count);
  while(grid.children.length>count)grid.lastElementChild.remove();
  for(let i=0;i<count;i++){
   let figure=grid.children[i];if(!figure){figure=document.createElement('figure');const im=document.createElement('img');im.loading='lazy';figure.append(im,document.createElement('figcaption'));grid.append(figure)}
   const image=figure.querySelector('img');const key=gender==='female'?(i===0?'dress1':i===1?'dress3':'dressFemale'+(i+1)):(i===0?'dress2':i===1?'dress4':'dressMale'+(i+1));
   image.dataset.etKey=key;image.alt=label+' — образ '+(i+1);const fallback=i<2?(gender==='female'?(i===0?originals[0]:originals[2]||originals[0]):originals[1]):'';
   const src=typeof p[key]==='string'&&p[key].trim()?p[key].trim():fallback;
   if(src){if(image.getAttribute('src')!==src)image.src=src;figure.style.display=''}else{image.removeAttribute('src');figure.style.display='none'}
   image.style.objectPosition=positions[key]||'center';figure.querySelector('figcaption').textContent=label+' · '+String(i+1).padStart(2,'0');
  }
  mood.append(group);
  const colors=Array.isArray(palettes[gender])?palettes[gender]:defaults[gender];group.querySelectorAll('.et-dress-colors span').forEach((el,i)=>{el.style.backgroundColor=/^#[0-9a-f]{6}$/i.test(colors[i]||'')?colors[i]:defaults[gender][i]});
 }
 mood.dataset.etSplit='yes';
 let style=document.getElementById('et-dress-extended-style');if(!style){style=document.createElement('style');style.id='et-dress-extended-style';document.head.append(style)}
 style.textContent=`
 #dress .mood-grid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:clamp(22px,4vw,54px)!important;max-width:1120px!important;align-items:start!important}
 #dress .et-dress-group{text-align:center;min-width:0}
 #dress .et-dress-group h3{font:italic 400 clamp(37px,5vw,63px)/1.1 Georgia,serif;color:#453b34;margin:0 0 22px}
 #dress .et-dress-pictures{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;align-items:start}
 #dress .et-dress-pictures figure,#dress .et-dress-pictures figure:nth-child(n){height:clamp(180px,27vw,330px)!important;width:100%!important;grid-column:auto!important;margin:0!important;transform:none!important;border:5px solid #f5eee5;box-shadow:0 18px 35px #392d2630;overflow:hidden;position:relative;background:#c4b5a8}
 #dress .et-dress-pictures figure:nth-child(even){margin-top:24px!important}

 /* Three photos: two equal portraits above, one centered below. */
 #dress .et-dress-pictures[data-count="3"] > figure:nth-child(3){grid-column:1 / -1!important;justify-self:center!important;width:min(75%,340px)!important;height:clamp(220px,30vw,385px)!important;margin:10px auto 0!important}
 #dress .et-dress-pictures[data-count="3"] > figure:nth-child(2){margin-top:0!important}
 #dress .et-dress-pictures[data-count="3"] > figure:nth-child(1){margin-top:0!important}

 #dress .et-dress-pictures img{width:100%;height:100%;object-fit:cover;display:block}
 #dress .et-dress-pictures figcaption{position:absolute;bottom:0;left:0;right:0;color:white;font-size:9px;padding:25px 6px 9px;background:linear-gradient(transparent,#241e1c9c)}
 #dress .et-dress-colors{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:7px;margin:30px 0 0}
 #dress .et-dress-colors span{display:block;aspect-ratio:1/1;max-height:65px;border:3px solid #f4ecdf;box-shadow:0 4px 13px #2d23172c}
 #dress>.swatches{display:none!important}
 @media(max-width:700px){#dress .mood-grid{grid-template-columns:1fr!important;gap:48px!important}#dress .et-dress-group h3{font-size:52px}#dress .et-dress-pictures figure,#dress .et-dress-pictures figure:nth-child(n){height:clamp(200px,65vw,370px)!important}}
 `;
}
const bg=(selector,key,overlay='')=>{
 const el=document.querySelector(selector);
 if(!el)return;
 const url=p[key];
 // URL may be a GitHub-hosted relative JPEG or a temporary blob: URL in preview.
 // JSON.stringify produces a properly quoted CSS URL argument.
 if(typeof url==='string'&&url.trim()){
  el.style.setProperty('background-image',overlay+'url('+JSON.stringify(url.trim())+')','important');
  el.style.setProperty('background-position',positions[key]||'center','important');
  el.style.setProperty('background-size','cover','important');
 }else{
  el.style.removeProperty('background-image');
  el.style.removeProperty('background-position');
  el.style.removeProperty('background-size');
 }
};
bg('.book-cover','introCover');
bg('.invitation','invitationBg','linear-gradient(#29231c50,#29231c50),');
bg('.invite-photo-left','invitationLeft');
bg('.invite-photo-right','invitationRight');
bg('.memory-banner-image','memoryBg');
bg('.dress-wash','dressBg','linear-gradient(#dac9b9dd,#dac9b9dd),');
bg('.rsvp','rsvpBg','linear-gradient(#1d1916b8,#1d1916b8),');
// Pseudo-element backgrounds cannot be assigned as inline element styles.
// Replace the extension stylesheet on every preview update, so clearing a photo restores the original.
let style=document.getElementById('eterna-photo-backgrounds');
if(!style){style=document.createElement('style');style.id='eterna-photo-backgrounds';document.head.append(style)}
const pseudo=[
 ['.day::before','scheduleBg','linear-gradient(110deg,#110d11ef,#1b1119c9),'],
 ['.venue::before','venueBg',''],
 ['.timer-section::before','countdownBg',''],
 ['.ending::before','endingBg','']
];
style.textContent=pseudo.map(([selector,key,overlay])=>{
 const url=p[key];if(typeof url!=='string'||!url.trim())return '';
 const position=positions[key]||'center';
 return selector+'{background-image:'+overlay+'url('+JSON.stringify(url.trim())+') !important;background-position:'+position+' !important;background-size:cover !important;}';
}).join('\n');

const map={photoStory:'.opening-collage',invitation:'#invitation',story:'#story',memory:'.memory-banner',schedule:'#day',venue:'#venue',dress:'#dress',countdown:'.timer-section',rsvp:'#rsvp',ending:'.ending'};
Object.entries(map).forEach(([key,selector])=>{if(typeof sections[key]==='boolean')hide(selector,sections[key])});
// Keep the scroll link directed to the next visible block even when photo story is disabled.
const next=document.querySelector('.ec-next');if(next){const target=Object.entries(map).find(([key])=>sections[key]!==false);const el=target?document.querySelector(target[1]):null;next.href=el&&el.id?'#'+el.id:'#photo-story';next.onclick=el&&!el.id?function(e){e.preventDefault();el.scrollIntoView({behavior:'smooth'})}:null}
set('#invitation .letter p b',t.greeting);set('#invitation .letter p:nth-of-type(2)',t.invitation1);set('#invitation .letter p:nth-of-type(3)',t.invitation2);
set('#story .story-header > p',t.storyIntro);set('#story .story-note p',t.storyNote);
set('#venue .venue-card > p:nth-of-type(1)',t.venueName);set('#venue .venue-card > p:nth-of-type(2)',t.venueAddress);
const mapLink=document.querySelector('#venue .venue-card a');if(mapLink&&typeof t.venueMap==='string'&&/^https:\/\//i.test(t.venueMap))mapLink.href=t.venueMap;
set('#dress .dress-head > p',t.dress);set('#rsvp .rsvp-sub',t.rsvpDeadline);
if(Array.isArray(c.schedule)){const list=document.querySelector('#day .day-card');if(list){list.replaceChildren();c.schedule.forEach(event=>{const row=document.createElement('div');row.className='event';const time=document.createElement('time');time.textContent=event.time||'';const info=document.createElement('div'),h=document.createElement('h3'),p=document.createElement('p');h.textContent=event.title||'';p.textContent=event.description||'';info.append(h,p);row.append(time,info);list.append(row)})}}
}
window.ETERNA_APPLY_CONFIG=apply;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>apply(window.WEDDING_CONFIG));else apply(window.WEDDING_CONFIG);
window.addEventListener('message',e=>{if(e.origin!==location.origin||!e.data||e.data.type!=='eterna-preview')return;apply(e.data.config);const intro=document.querySelector('#intro');if(intro){intro.classList.add('done');intro.setAttribute('aria-hidden','true');intro.style.setProperty('display','none','important');document.body.classList.remove('locked')} });
})();