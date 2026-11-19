(() => {
'use strict';
const style=document.createElement('style');
style.textContent='.et-two-events{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:26px auto;max-width:1100px}.et-event{padding:clamp(16px,3vw,28px);border:1px solid rgba(154,126,89,.34);background:#fcf7ee;color:#292923;border-radius:15px;min-width:0}.et-event-number{font:600 11px system-ui;letter-spacing:.16em;color:#a17b55}.et-event h3{font:400 clamp(24px,3vw,37px) Georgia,serif;margin:14px 0 8px}.et-event-date{font:600 clamp(17px,2.3vw,24px) system-ui;margin:8px 0}.et-event-meta{font:400 13px/1.7 system-ui;color:#695e52;margin:8px 0 0}.et-event-venue{font-weight:700;color:#2c2823}.field-report .et-two-events{margin:14px 0 28px}@media(max-width:600px){.et-two-events{grid-template-columns:1fr;gap:9px}.et-event{padding:17px}.et-event h3{font-size:27px}}';
document.head.append(style);
const format=value=>{
 if(!/^\\d{4}-\\d\\d-\\d\\d$/.test(value||''))return '';
 const date=new Date(value+'T12:00:00');
 if(Number.isNaN(date.getTime())||date.toISOString().slice(0,10)!==value)return '';
 return new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'long',year:'numeric'}).format(date);
};
let last='';
function apply(config){
 const d=config?.eventDates||{};
 const site=document.querySelector('.schedule')||document.querySelector('.field-report');
 if(!site)return;
 let cards=site.querySelector('.et-two-events');
 if(d.mode!=='split'){cards?.remove();const agenda=site.querySelector('.rundown');if(agenda)agenda.hidden=false;last='';return;}
 const signature=JSON.stringify(d);
 if(signature===last&&cards)return;last=signature;
 if(!cards){cards=document.createElement('div');cards.className='et-two-events';const anchor=site.querySelector('.schedule-title,.field-report-head');if(anchor)anchor.after(cards);else site.prepend(cards);}
 cards.replaceChildren();
 const entries=[
  ['01 / РОСПИСЬ','Официальная роспись',d.ceremonyDate,d.ceremonyTime,d.ceremonyVenue,d.ceremonyAddress],
  ['02 / ПРАЗДНИК','Свадебный банкет',d.partyDate,d.partyTime,d.partyVenue,d.partyAddress]
 ];
 for(const [number,title,date,time,venue,address] of entries){
  const card=document.createElement('article');card.className='et-event';
  function add(tag,cls,text){if(!text)return;const el=document.createElement(tag);el.className=cls;el.textContent=text;card.append(el);}
  add('span','et-event-number',number);add('h3','',title);
  add('p','et-event-date',format(date)||'Дата уточняется');
  add('p','et-event-meta',time?'Начало в '+time:'Время уточняется');
  add('p','et-event-meta et-event-venue',venue);add('p','et-event-meta',address);
  cards.append(card);
 }
 const agenda=site.querySelector('.rundown');if(agenda)agenda.hidden=true;
}
const config=window.ETERNA_BROADCAST_ORDER||window.ETERNA_ORDER||window.WEDDING_CONFIG;
if(config)apply(config);
addEventListener('message',event=>{
 if(event.origin!==location.origin||event.source!==parent||!['eterna-preview','broadcast-editor-preview'].includes(event.data?.type))return;
 apply(event.data.config);
});
})();