/* ÉTERNA 11.3 — native finger-tracking swipe on iOS and Android.
 * Existing editor and RSVP scripts remain unchanged.
 */
(()=>{
 const gate=document.getElementById('revealGate');
 const track=gate?.querySelector('.rv-drag-track');
 const button=document.getElementById('revealOpen');
 if(!gate||!track||!button||gate.dataset.artSwipe==='1')return;
 gate.dataset.artSwipe='1';
 let active=null,origin=0,value=0,travel=1;
 const clamp=v=>Math.max(0,Math.min(1,v));
 const distance=()=>Math.max(1,track.getBoundingClientRect().width-52);
 const paint=v=>{value=clamp(v);track.style.setProperty('--rv-knob-distance',distance()+'px');gate.style.setProperty('--rv-pull',String(value));};
 const down=e=>{
  if(e.button!==undefined&&e.button!==0||gate.classList.contains('rv-opening'))return;
  e.stopPropagation();e.preventDefault();
  active=e.pointerId;origin=e.clientX;travel=distance();
  gate.classList.remove('rv-returning');gate.classList.add('rv-dragging');
  try{track.setPointerCapture(e.pointerId)}catch{}
  paint(0);
 };
 const move=e=>{if(e.pointerId!==active)return;e.stopPropagation();if(e.cancelable)e.preventDefault();paint((e.clientX-origin)/travel)};
 const end=(e,cancel=false)=>{
  if(e.pointerId!==active)return;
  e.stopPropagation();e.preventDefault();active=null;
  try{track.releasePointerCapture(e.pointerId)}catch{}
  gate.classList.remove('rv-dragging');
  if(!cancel&&value>=.6){paint(1);button.click()}
  else{gate.classList.add('rv-returning');paint(0)}
 };
 track.addEventListener('pointerdown',down,{capture:true,passive:false});
 track.addEventListener('pointermove',move,{capture:true,passive:false});
 track.addEventListener('pointerup',e=>end(e),{capture:true,passive:false});
 track.addEventListener('pointercancel',e=>end(e,true),{capture:true,passive:false});
 track.addEventListener('lostpointercapture',()=>{if(active!==null){active=null;gate.classList.remove('rv-dragging');gate.classList.add('rv-returning');paint(0)}});
 window.addEventListener('resize',()=>paint(value),{passive:true});
 paint(0);
})();
