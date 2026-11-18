/* ÉTERNA 11.5 progressive scroll choreography. No form/editor mutations. */
(()=>{'use strict';
 if(document.documentElement.dataset.eterna115)return;
 document.documentElement.dataset.eterna115='1';
 const chapters=[...document.querySelectorAll('#photo-story,#invitation,#story,#day,#venue,#dress,#rsvp,.ending')];
 if(!chapters.length)return;
 const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 if(reduced||!('IntersectionObserver' in window)){chapters.forEach(el=>el.classList.add('et-chapter-visible'));return;}
 const io=new IntersectionObserver((entries)=>{for(const e of entries){if(e.isIntersecting){e.target.classList.add('et-chapter-visible');io.unobserve(e.target)}}},{threshold:0.08,rootMargin:'0px 0px -3% 0px'});
 chapters.forEach(el=>io.observe(el));
})();
