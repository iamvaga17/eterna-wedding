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

  const knob = entry.querySelector('.entry-knob');
  let drag = null;
  let suppressClick = false;

  function setSeal(distance, travel) {
    entry.style.setProperty('--seal-x', distance + 'px');
    cover.style.setProperty('--seal-progress', String(distance / travel));
  }

  function openInvitation() {
    const target = document.getElementById(entry.hash.slice(1));
    if (opening || !target || target.hidden) return;
    const go = () => {
      if (location.hash !== entry.hash) history.pushState(null, '', entry.hash);
      target.focus({preventScroll: true});
      target.scrollIntoView({behavior: reduced.matches ? 'instant' : 'smooth'});
    };
    if (reduced.matches) {
      go();
      setSeal(0, 1);
      return;
    }
    opening = true;
    cover.classList.add('is-opening');
    window.setTimeout(go, 410);
    window.setTimeout(() => {
      cover.classList.remove('is-opening');
      setSeal(0, 1);
      opening = false;
    }, 1200);
  }

  entry.classList.add('is-interactive');
  entry.addEventListener('dragstart', event => event.preventDefault());
  entry.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0 || opening) return;
    suppressClick = false;
    if (event.target !== knob) return;
    const trackBounds = entry.getBoundingClientRect();
    const knobBounds = knob.getBoundingClientRect();
    const travel = trackBounds.right - knobBounds.right - (knobBounds.left - trackBounds.left);
    if (travel <= 0) return;
    drag = {id: event.pointerId, start: event.clientX, travel};
    entry.setPointerCapture(event.pointerId);
    entry.classList.add('is-dragging');
    cover.classList.add('is-dragging');
  });

  function moveSeal(event) {
    const delta = event.clientX - drag.start;
    if (Math.abs(delta) > 7) suppressClick = true;
    const distance = Math.min(drag.travel, Math.max(0, delta));
    setSeal(distance, drag.travel);
    return distance / drag.travel;
  }

  entry.addEventListener('pointermove', event => {
    if (event.pointerId === drag?.id) moveSeal(event);
  });
  function finishSeal(event) {
    if (event.pointerId !== drag?.id) return;
    const released = event.type === 'pointerup';
    const progress = released ? moveSeal(event) : 0;
    const {travel} = drag;
    drag = null;
    entry.classList.remove('is-dragging');
    cover.classList.remove('is-dragging');
    if (!released) suppressClick = true;
    if (progress >= .8) {
      setSeal(travel, travel);
      openInvitation();
    } else {
      setSeal(0, 1);
    }
  }
  entry.addEventListener('pointerup', finishSeal);
  entry.addEventListener('pointercancel', finishSeal);
  entry.addEventListener('lostpointercapture', finishSeal);
  entry.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (event.detail > 0 && suppressClick) return;
    openInvitation();
  });

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
