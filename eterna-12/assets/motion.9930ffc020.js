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
    const target = document.querySelector(entry.hash);
    if (!target || target.hidden) return;
    event.preventDefault();
    if (opening) return;
    opening = true;
    cover.classList.add('is-opening');
    window.setTimeout(() => {
      history.pushState(null, '', entry.hash);
      target.focus({preventScroll: true});
      target.scrollIntoView({behavior: 'smooth'});
    }, 360);
    window.setTimeout(() => {
      cover.classList.remove('is-opening');
      opening = false;
    }, 1200);
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
