/* ÉTERNA 11.6 — scroll-scrubbed paper envelope & chapter film cues.
   The overlay never receives pointer events and is removed when complete. */
(()=>{'use strict';
 const root=document.documentElement;
 if(root.dataset.et116==='1')return;
 root.dataset.et116='1';
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const invitation=document.getElementById('invitation');
 const letter=invitation?.querySelector('.letter');
 const chapters=[['invitation','02 / THE LETTER'],['story','03 / OUR STORY'],['day','04 / THE DAY'],['venue','05 / THE PLACE'],['dress','06 / THE MOOD'],['rsvp','07 / YOUR REPLY']];
 const active=[];
 for(const [id,label] of chapters){
   const section=document.getElementById(id);if(!section)continue;
   section.classList.add('et116-chapter');
   const line=document.createElement('span');line.className='et116-film-line';line.setAttribute('aria-hidden','true');section.appendChild(line);
   const tag=document.createElement('span');tag.className='et116-cinema-label';tag.textContent=label;tag.setAttribute('aria-hidden','true');section.appendChild(tag);
   active.push(section);
 }
 if(reduce.matches){active.forEach(el=>el.classList.add('et116-entered'));return;}
 let mask=null,finished=false,pending=false;
 if(letter){
   mask=document.createElement('div');mask.className='et116-envelope';mask.setAttribute('aria-hidden','true');
   mask.innerHTML='<span class="et116-underfold"></span><span class="et116-fold"></span><span class="et116-stamp">АВ</span><span class="et116-caption">ПИСЬМО ДЛЯ ВАС · ОТКРОЙТЕ ИСТОРИЮ</span>';
   // Fallback: without JS, the letter remains fully visible.
   letter.appendChild(mask);
 }
 const clamp=x=>Math.max(0,Math.min(1,x));
 const update=()=>{
   pending=false;
   if(!mask||finished||!invitation)return;
   const rect=invitation.getBoundingClientRect();
   const viewport=innerHeight||document.documentElement.clientHeight;
   // 0 when invitation enters the lower edge, 1 when its headline reaches top 30%.
   const progress=clamp((viewport*.85-rect.top)/(viewport*.58));
   const fold=clamp((progress-.10)/.60);
   const opacity=1-clamp((progress-.48)/.42);
   mask.style.setProperty('--et116-fold',fold.toFixed(3));
   mask.style.setProperty('--et116-mask',opacity.toFixed(3));
   mask.style.setProperty('--et116-stamp-opacity',(1-clamp(progress/.55)).toFixed(3));
   mask.style.setProperty('--et116-stamp-scale',(1-progress*.2).toFixed(3));
   if(progress>=.99){finished=true;mask.remove();mask=null;removeEventListener('scroll',schedule);removeEventListener('resize',schedule)}
 };
 const schedule=()=>{if(!pending){pending=true;requestAnimationFrame(update)}};
 if(mask){addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});schedule()}
 if('IntersectionObserver' in window){
   const io=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add('et116-entered');io.unobserve(entry.target)}}},{threshold:.09,rootMargin:'0px 0px -5% 0px'});
   active.forEach(el=>io.observe(el));
 }else active.forEach(el=>el.classList.add('et116-entered'));
 reduce.addEventListener?.('change',()=>{if(reduce.matches){mask?.remove();mask=null;finished=true;active.forEach(el=>el.classList.add('et116-entered'));removeEventListener('scroll',schedule);removeEventListener('resize',schedule)}});
})();
