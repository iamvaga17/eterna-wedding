/* ÉTERNA — управление содержимым, без изменения структуры RSVP */
(function(){
const set=(selector,value)=>{const el=document.querySelector(selector);if(el&&value!==undefined&&value!==null)el.textContent=String(value)};
const img=(selector,url,position)=>{const el=document.querySelector(selector);if(!el)return;if(typeof url==='string'&&url.trim())el.src=url.trim();if(position)el.style.objectPosition=position};
const hide=(selector,enabled)=>{const el=document.querySelector(selector);if(el)el.hidden=!enabled};
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
window.addEventListener('message',e=>{if(e.origin!==location.origin||!e.data||e.data.type!=='eterna-preview')return;apply(e.data.config)});
})();