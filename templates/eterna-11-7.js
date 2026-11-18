/* ÉTERNA 11.7 — LUXE MOTION behavior layer */
(()=>{
  'use strict';
  const root=document.documentElement;
  if(root.dataset.et117==='1') return;
  root.dataset.et117='1';
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const body=document.body;

  // Ambient glow
  const glow=document.createElement('div');
  glow.className='et117-glow';
  glow.setAttribute('aria-hidden','true');
  body.appendChild(glow);

  const setPointer=(x,y)=>{
    root.style.setProperty('--et117-pointer-x', ((x/innerWidth)*100).toFixed(2));
    root.style.setProperty('--et117-pointer-y', ((y/innerHeight)*100).toFixed(2));
    glow.style.setProperty('--et117-glow-x', x+'px');
    glow.style.setProperty('--et117-glow-y', y+'px');
  };
  setPointer(innerWidth*.52, innerHeight*.26);
  if(!reduce){
    addEventListener('pointermove',e=>setPointer(e.clientX,e.clientY),{passive:true});
    addEventListener('touchmove',e=>{const t=e.touches&&e.touches[0]; if(t) setPointer(t.clientX,t.clientY)}, {passive:true});
  }

  // Mark scenes
  const sceneDefs=[
    ['#photo-story','01'],['#invitation','02'],['#story','03'],['.memory-banner','04'],['#day','05'],['#venue','06'],['#dress','07'],['.timer-section','08'],['#rsvp','09'],['.ending','10']
  ];
  const scenes=[];
  sceneDefs.forEach(([sel,index])=>{
    const el=document.querySelector(sel);
    if(!el) return;
    el.classList.add('et117-scene');
    el.dataset.et117Index=index;
    scenes.push(el);
  });

  // Entrance targets
  const entranceSelectors=[
    '#top .ao-hero-copy','#top .ao-artboard','.v10-manifesto p','#photo-story .ao-prologue-statement','#photo-story .ao-prologue-gallery','#invitation .letter','#invitation .invite-photo-left','#invitation .invite-photo-right','#story .story-header','#story .story-main','#story .story-small','#story .story-note','.memory-banner-content','#day .day-top','#day .event','#venue .venue-card','#dress .mood-grid figure','.timer-section .countdown','#rsvp .rsvp-paper','.ending .reveal'
  ];
  const entranceEls=[];
  entranceSelectors.forEach(sel=>document.querySelectorAll(sel).forEach(el=>{el.classList.add('et117-entrance'); entranceEls.push(el)}));

  // Float targets
  ['#top .ao-artboard','#photo-story figure','#story .story-main','#story .story-small','.memory-banner-content','#venue .venue-card','#dress .mood-grid figure'].forEach(sel=>{
    document.querySelectorAll(sel).forEach(el=>el.classList.add('et117-float'));
  });

  // Hero tilt
  const art=document.getElementById('aoArtboard');
  const updateHeroTilt=(x,y)=>{
    if(!art || reduce) return;
    const rect=art.getBoundingClientRect();
    const cx=rect.left + rect.width/2;
    const cy=rect.top + rect.height/2;
    const dx=(x-cx)/Math.max(rect.width,1);
    const dy=(y-cy)/Math.max(rect.height,1);
    art.style.setProperty('--et117-hero-tilt-x', (dx*12).toFixed(2));
    art.style.setProperty('--et117-hero-tilt-y', (-dy*10).toFixed(2));
  };
  if(!reduce){
    addEventListener('pointermove',e=>updateHeroTilt(e.clientX,e.clientY),{passive:true});
  }

  // Enter animations
  if('IntersectionObserver' in window){
    const io=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('et117-in');io.unobserve(entry.target)}})
    },{threshold:.14, rootMargin:'0px 0px -8% 0px'});
    entranceEls.forEach(el=>io.observe(el));
  }else entranceEls.forEach(el=>el.classList.add('et117-in'));

  // Scene progress for parallax/light lines
  let ticking=false;
  const update=()=>{
    ticking=false;
    const vh=innerHeight || document.documentElement.clientHeight;
    scenes.forEach(scene=>{
      const r=scene.getBoundingClientRect();
      const progress=Math.max(0,Math.min(1,(vh-r.top)/(vh+r.height)));
      scene.style.setProperty('--et117-progress',progress.toFixed(4));
    });
  };
  const request=()=>{ if(!ticking){ ticking=true; requestAnimationFrame(update); } };
  addEventListener('scroll',request,{passive:true});
  addEventListener('resize',request,{passive:true});
  request();
})();
