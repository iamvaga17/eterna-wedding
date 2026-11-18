(() => {
  'use strict';

  const cover = document.querySelector('.cover');
  const entry = document.querySelector('[data-entry]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const track = document.querySelector('.story-track');
  const buttons = [...document.querySelectorAll('[data-frame]')];
  const scenes = [...document.querySelectorAll('.photo-scene')];
  let desiredX = 0;
  let desiredY = 0;
  let x = 0;
  let y = 0;
  let pointerFrame = 0;
  let scrollFrame = 0;
  let opening = false;

  function moveLight() {
    pointerFrame = 0;
    x += (desiredX - x) * .14;
    y += (desiredY - y) * .14;
    cover.style.setProperty('--x', x.toFixed(2) + 'px');
    cover.style.setProperty('--y', y.toFixed(2) + 'px');
    if (Math.abs(desiredX - x) + Math.abs(desiredY - y) > .1) pointerFrame = requestAnimationFrame(moveLight);
  }

  function aim(event) {
    if (reduced.matches) return;
    const bounds = cover.getBoundingClientRect();
    desiredX = (event.clientX - bounds.left - bounds.width / 2) / bounds.width * 42;
    desiredY = (event.clientY - bounds.top - bounds.height / 2) / bounds.height * 34;
    if (!pointerFrame) pointerFrame = requestAnimationFrame(moveLight);
  }

  function resetLight() {
    desiredX = 0;
    desiredY = 0;
    if (!pointerFrame) pointerFrame = requestAnimationFrame(moveLight);
  }

  cover.addEventListener('pointerdown', aim, {passive: true});
  cover.addEventListener('pointermove', aim, {passive: true});
  cover.addEventListener('pointerleave', resetLight);
  cover.addEventListener('pointercancel', resetLight);
  cover.addEventListener('pointerup', event => { if (event.pointerType === 'touch') resetLight(); });

  entry.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || reduced.matches) return;
    const target = document.getElementById(entry.hash.slice(1));
    if (!target || target.hidden) return;
    event.preventDefault();
    if (opening) return;
    opening = true;
    cover.classList.add('is-opening');
    window.setTimeout(() => {
      if (location.hash !== entry.hash) history.pushState(null, '', entry.hash);
      target.focus({preventScroll: true});
      target.scrollIntoView({behavior: 'smooth'});
    }, 410);
    window.setTimeout(() => {
      cover.classList.remove('is-opening');
      opening = false;
    }, 1200);
  });

  const gate = document.querySelector('.intro-gate');
  const opener = gate.querySelector('.enter');
  const knob = opener.querySelector('.entry-knob');
  let drag = null;
  let suppressClick = false;

  function setSeal(distance, travel) {
    opener.style.setProperty('--seal-x', distance + 'px');
    gate.style.setProperty('--seal-progress', String(distance / travel));
  }

  function revealCover() {
    if (!gate.open || gate.classList.contains('is-revealing')) return;
    const finish = () => {
      if (gate.open) gate.close();
    };
    if (reduced.matches) {
      finish();
      return;
    }
    gate.classList.add('is-revealing');
    gate.querySelector('.intro-door-left').addEventListener('transitionend', finish, {once: true});
    window.setTimeout(finish, 1000);
  }

  gate.addEventListener('close', () => cover.querySelector('h1').focus({preventScroll: true}));
  gate.addEventListener('submit', event => {
    event.preventDefault();
    revealCover();
  });
  opener.classList.add('is-interactive');
  opener.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0 || gate.classList.contains('is-revealing')) return;
    suppressClick = false;
    if (event.target !== knob) return;
    const bounds = opener.getBoundingClientRect();
    const seal = knob.getBoundingClientRect();
    const travel = bounds.right - seal.right - (seal.left - bounds.left);
    if (travel <= 0) return;
    drag = {id: event.pointerId, start: event.clientX, travel};
    opener.setPointerCapture(event.pointerId);
    opener.classList.add('is-dragging');
    gate.classList.add('is-dragging');
  });

  function moveSeal(event) {
    const delta = event.clientX - drag.start;
    if (Math.abs(delta) > 7) suppressClick = true;
    const distance = Math.min(drag.travel, Math.max(0, delta));
    setSeal(distance, drag.travel);
    return distance / drag.travel;
  }

  opener.addEventListener('pointermove', event => {
    if (event.pointerId === drag?.id) moveSeal(event);
  });
  function finishSeal(event) {
    if (event.pointerId !== drag?.id) return;
    const released = event.type === 'pointerup';
    const progress = released ? moveSeal(event) : 0;
    const {travel} = drag;
    drag = null;
    opener.classList.remove('is-dragging');
    gate.classList.remove('is-dragging');
    if (!released) suppressClick = true;
    if (progress >= .8) {
      setSeal(travel, travel);
      revealCover();
    } else {
      setSeal(0, 1);
    }
  }
  opener.addEventListener('pointerup', finishSeal);
  opener.addEventListener('pointercancel', finishSeal);
  opener.addEventListener('lostpointercapture', finishSeal);
  opener.addEventListener('click', event => {
    if (event.detail > 0 && suppressClick) event.preventDefault();
  });

  function observeContent() {
    if (reduced.matches || !('IntersectionObserver' in window)) return;

    const letter = document.querySelector('.letter');
    const summary = letter.querySelector('summary');
    const letterObserver = new IntersectionObserver(([record]) => {
      if (record.intersectionRatio < .65) return;
      letterObserver.disconnect();
      if (!reduced.matches) letter.open = true;
    }, {threshold: .65});
    summary.addEventListener('click', () => letterObserver.disconnect(), {once: true});
    if (!letter.open) letterObserver.observe(summary);

    const imageObserver = new IntersectionObserver(records => {
      for (const record of records) {
        if (!record.isIntersecting) continue;
        imageObserver.unobserve(record.target);
        if (!reduced.matches) record.target.classList.add('photo-reveal');
      }
    }, {threshold: .15});
    document.querySelectorAll('.atmosphere-wide img, .atmosphere-detail img, .venue-image img, .story-track img')
      .forEach(image => imageObserver.observe(image));
  }

  if (!new URLSearchParams(location.search).has('editor-preview')) {
    if (gate.open) gate.addEventListener('close', observeContent, {once: true});
    else observeContent();
  }

  for (const button of buttons) {
    button.addEventListener('click', () => {
      track.scrollTo({left: track.clientWidth * Number(button.dataset.frame), behavior: reduced.matches ? 'auto' : 'smooth'});
    });
  }
  track.addEventListener('scroll', () => {
    const active = Math.round(track.scrollLeft / track.clientWidth);
    buttons.forEach((button, index) => button.setAttribute('aria-pressed', String(active === index)));
  }, {passive: true});

  function updateScenes() {
    scrollFrame = 0;
    for (const scene of scenes) {
      if (scene.hidden) continue;
      const rect = scene.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > innerHeight) continue;
      const progress = (rect.top + rect.height / 2 - innerHeight / 2) / innerHeight;
      scene.style.setProperty('--drift', (reduced.matches ? 0 : Math.max(-24, Math.min(24, progress * -42))) + 'px');
    }
  }

  function queueScenes() {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScenes);
  }

  addEventListener('scroll', queueScenes, {passive: true});
  addEventListener('resize', queueScenes, {passive: true});
  reduced.addEventListener?.('change', () => {
    if (reduced.matches) resetLight();
    queueScenes();
  });
  queueScenes();
})();
