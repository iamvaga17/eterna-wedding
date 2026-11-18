(() => {
  'use strict';

  const broadcast = document.getElementById('broadcast');
  const entry = document.getElementById('tune-in');
  const firstSection = document.getElementById('live');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');

  broadcast.hidden = !location.hash || location.hash === '#top';

  function showBroadcast() {
    broadcast.hidden = false;
  }

  entry.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    event.preventDefault();
    showBroadcast();
    if (location.hash !== '#live') history.pushState(null, '', '#live');
    if (!motion.matches) firstSection.classList.add('signal-in');
    firstSection.focus({preventScroll: true});
    firstSection.scrollIntoView({behavior: motion.matches ? 'auto' : 'smooth'});
  });

  addEventListener('hashchange', () => {
    if (location.hash && location.hash !== '#top') showBroadcast();
  });

  const cakeButton = document.querySelector('[data-cake]');
  const cakeResult = document.querySelector('[data-cake-result]');
  const cameraFrame = document.querySelector('.camera-frame');
  const cake = cameraFrame.querySelector('img');
  const target = cameraFrame.querySelector('.camera-target');
  let cameraAnimation;

  cakeButton.hidden = false;
  cakeButton.addEventListener('click', () => {
    cakeResult.textContent = 'Торт обнаружен. Целостность крема подтверждена.';
    if (motion.matches || !cake.animate) return;
    cameraAnimation?.cancel();
    target.getAnimations().forEach(animation => animation.cancel());
    cameraAnimation = cake.animate([
      {transform: 'scale(1)'},
      {transform: 'scale(2.45) rotate(-1deg)', offset: .22},
      {transform: 'scale(2.28) rotate(0deg)', offset: .5},
      {transform: 'scale(2.28)', offset: .72},
      {transform: 'scale(1)'}
    ], {duration: 1700, easing: 'ease-in-out'});
    target.animate([
      {opacity: 0, scale: 1.25},
      {opacity: 1, scale: 1, offset: .27},
      {opacity: 1, scale: 1, offset: .7},
      {opacity: 0, scale: 1.1}
    ], {duration: 1700, easing: 'ease-in-out'});
  });

  // Two staged confetti cannon blasts; all particles are contained in the TV frame.
  const forecastButton = document.querySelector('[data-forecast]');
  const forecastResult = document.querySelector('[data-forecast-result]');
  const forecastSection = document.querySelector('.forecast');
  const confetti = document.querySelector('.confetti-layer');
  const colors = ['#fff2c3', '#f5a59b', '#d84953', '#a2c8ed', '#f3cf75', '#ffffff'];
  let launchId = 0;
  let hasAutoLaunched = false;
  let cleanupTimer = 0;

  function launchConfetti() {
    forecastResult.textContent = 'Вероятность конфетти — 100%. Берегите причёски.';
    if (motion.matches || typeof document.createElement('i').animate !== 'function') return;
    const id = ++launchId;
    clearTimeout(cleanupTimer);
    confetti.getAnimations({subtree: true}).forEach(a => a.cancel());
    confetti.replaceChildren();
    confetti.classList.remove('cannon-firing');
    void confetti.offsetWidth;
    confetti.classList.add('cannon-firing');
    const rect = confetti.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    const reducedDensity = matchMedia('(max-width: 650px)').matches;
    const count = reducedDensity ? 70 : 126;
    const fragment = document.createDocumentFragment();
    const random = (min, max) => min + Math.random() * (max - min);

    // Alternate two cannons. The second shot follows 340ms after the first.
    for (let shot = 0; shot < 2; shot++) {
      const side = shot === 0 ? 1 : -1;
      const originX = shot === 0 ? rect.width * .02 : rect.width * .98;
      const originY = rect.height * random(.68, .8);
      for (let i = 0; i < count / 2; i++) {
        const piece = document.createElement('i');
        const near = i % 3 === 0;
        const w = random(near ? 8 : 3, near ? 15 : 8);
        const h = w * random(.65, 1.8);
        const dx = side * random(rect.width * .14, rect.width * 1.02);
        const lift = random(rect.height * .28, rect.height * .94);
        const down = random(rect.height * .11, rect.height * .55);
        const spin = random(420, 1400) * (i % 2 ? -1 : 1);
        const duration = random(1600, 3000);
        piece.style.cssText = 'left:' + originX + 'px;top:' + originY + 'px;width:' + w +
          'px;height:' + h + 'px;background:' + colors[(i + shot * 2) % colors.length] +
          ';opacity:0;position:absolute;will-change:transform,opacity;';
        if (i % 7 === 0) piece.style.borderRadius = '50%';
        fragment.append(piece);
        const delay = shot * 340 + random(0, 120);
        const animation = piece.animate([
          {transform:'translate3d(0,0,0) rotate(0deg) scale(1)', opacity:0, offset:0},
          {transform:'translate3d(' + (dx * .17) + 'px,' + (-lift * .48) + 'px,0) rotate(' + (spin * .18) + 'deg) scale(1.12)', opacity:1, offset:.12},
          {transform:'translate3d(' + (dx * .68) + 'px,' + (-lift) + 'px,0) rotate(' + (spin * .66) + 'deg) scale(.95)', opacity:1, offset:.47},
          {transform:'translate3d(' + dx + 'px,' + (-lift * .13 + down) + 'px,0) rotate(' + spin + 'deg) scale(.7)', opacity:0, offset:1}
        ], {duration, delay, easing:'cubic-bezier(.22,.52,.46,1)', fill:'both'});
        animation.onfinish = () => piece.remove();
      }
    }
    confetti.append(fragment);
    cleanupTimer = setTimeout(() => {
      if (id === launchId) { confetti.replaceChildren(); confetti.classList.remove('cannon-firing'); }
    }, 3800);
  }

  forecastButton.hidden = false;
  forecastButton.textContent = 'Повторить залп ↗';
  forecastButton.addEventListener('click', launchConfetti);

  // Automatic first run when the forecast is actually on screen.
  if ('IntersectionObserver' in window) {
    const forecastObserver = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting && e.intersectionRatio >= .45)) {
        if (!hasAutoLaunched) {
          hasAutoLaunched = true;
          launchConfetti();
        }
        forecastObserver.disconnect();
      }
    }, {threshold: [0, .45, .7]});
    forecastObserver.observe(forecastSection);
  } else {
    // Browser fallback: manual replay button remains available.
    forecastButton.textContent = 'Запустить конфетти ↗';
  }

  // Archive behaves like a recovered tape: one short rewind glitch upon entry.
  const archivePhoto = document.querySelector('.archive-photo');
  const archive = document.querySelector('.archive');
  if ('IntersectionObserver' in window && !motion.matches) {
    const archiveObserver = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) {
        archivePhoto.classList.add('tape-rewind');
        archiveObserver.disconnect();
      }
    }, {threshold: .45});
    archiveObserver.observe(archive);

    // Gentle editorial transitions; never hide content when observers are unavailable.
    const revealTargets = document.querySelectorAll('.live-copy, .archive-grid > div, .field-report-head, .rundown, .forecast-copy, .response > div:first-child');
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('editorial-visible');
          revealObserver.unobserve(e.target);
        }
      });
    }, {threshold: .12, rootMargin:'0px 0px -24px 0px'});
    revealTargets.forEach(el => {
      el.classList.add('editorial-ready');
      revealObserver.observe(el);
    });
  }

  // Reveal the event schedule like a live production rundown.
  const rundown = document.querySelector('.rundown');
  if (rundown && 'IntersectionObserver' in window && !motion.matches) {
    const scheduleObserver = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) {
        rundown.classList.add('rundown-on-air');
        scheduleObserver.disconnect();
      }
    }, {threshold: .2});
    scheduleObserver.observe(rundown);
  }

  // Returning to the page after changing motion settings should never trap effects.
  motion.addEventListener?.('change', () => {
    if (motion.matches) {
      ++launchId;
      clearTimeout(cleanupTimer);
      confetti.replaceChildren();
      confetti.classList.remove('cannon-firing');
      document.querySelectorAll('.editorial-ready').forEach(el => el.classList.add('editorial-visible'));
    }
  });

  window.ETERNA_MOUNT_RSVP(document.getElementById('rsvpDynamic'), {
    attendancePrompt: 'Будете в кадре?',
    attendanceLabels: {yes: 'Буду в кадре', no: 'В этот раз без меня'},
    questions: [
      {
        id: 'drinks',
        title: 'Чем поднимете бокал?',
        type: 'multiple',
        options: ['Игристое', 'Вино', 'Безалкогольное'],
        showIf: {field: 'attendance', equals: 'yes'}
      }
    ]
  }, {demo: true});
})();
