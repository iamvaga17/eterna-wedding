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
    const count = reducedDensity ? 64 : 112;
    const fragment = document.createDocumentFragment();
    const random = (min, max) => min + Math.random() * (max - min);
    const position = (x, y, spinY, spinX, roll, scale) =>
      'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) rotateY(' +
      spinY.toFixed(0) + 'deg) rotateX(' + spinX.toFixed(0) + 'deg) rotateZ(' +
      roll.toFixed(0) + 'deg) scale(' + scale + ')';

    // Two directional bursts; paper tumbles before gravity takes over.
    for (let shot = 0; shot < 2; shot++) {
      const side = shot === 0 ? 1 : -1;
      const originX = shot === 0 ? rect.width * .02 : rect.width * .98;
      const originY = rect.height * random(.68, .78);
      for (let i = 0; i < count / 2; i++) {
        const piece = document.createElement('i');
        const near = i % 4 === 0;
        const w = random(near ? 8 : 3, near ? 13 : 7);
        const h = w * random(.55, 1.55);
        const dx = side * random(rect.width * .18, rect.width * .94);
        const lift = random(rect.height * .25, rect.height * .78);
        const fall = random(rect.height * .33, rect.height * .82);
        const wobble = random(-18, 18);
        const flipY = random(540, 1420) * (i % 2 ? -1 : 1);
        const flipX = random(200, 840) * (i % 3 ? -1 : 1);
        const roll = random(-450, 450);
        const duration = random(2450, 3750);
        const delay = shot * 340 + random(0, 115);
        piece.style.cssText = 'left:' + originX + 'px;top:' + originY + 'px;width:' + w +
          'px;height:' + h + 'px;background:' + colors[(i + shot * 2) % colors.length] +
          ';opacity:0;position:absolute;backface-visibility:visible;will-change:transform,opacity;';
        if (i % 11 === 0) piece.style.borderRadius = '45% 20% 35% 10%';
        fragment.append(piece);
        const animation = piece.animate([
          {transform: position(0, 0, 0, 0, 0, 1), opacity: 0, offset: 0},
          {transform: position(dx * .2, -lift * .5, flipY * .16, flipX * .2, roll * .2, 1.08), opacity: 1, offset: .12},
          {transform: position(dx * .58, -lift, flipY * .45, flipX * .46, roll * .5, .98), opacity: 1, offset: .42},
          {transform: position(dx * .82 + wobble, -lift * .58, flipY * .72, flipX * .76, roll * .72, .85), opacity: .98, offset: .69},
          {transform: position(dx + wobble * 1.8, fall, flipY, flipX, roll, .72), opacity: 0, offset: 1}
        ], {duration, delay, easing:'cubic-bezier(.24,.4,.45,1)', fill:'both'});
        animation.onfinish = () => piece.remove();
      }
    }
    confetti.append(fragment);
    cleanupTimer = setTimeout(() => {
      if (id === launchId) { confetti.replaceChildren(); confetti.classList.remove('cannon-firing'); }
    }, 4500);
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

  // Make broadcast chapter labels visible and persistent once their own position
  // enters the viewport; observing the entire section caused premature animation.
  const chapters = [
    ['.archive', 'АРХИВ РЕДАКЦИИ'],
    ['.field-report', 'СВОДКА СОБЫТИЙ'],
    ['.forecast', 'ПРОГНОЗ В ЭФИРЕ'],
    ['.response', 'ВАШ ВЫХОД В ЭФИР']
  ];
  const chapterObserver = 'IntersectionObserver' in window && !motion.matches
    ? new IntersectionObserver(entries => {
        entries.forEach(entry => {
          entry.target.classList.toggle('chapter-on-air', entry.isIntersecting);
        });
      }, {threshold: 0, rootMargin: '0px 0px -10% 0px'})
    : null;
  chapters.forEach(([selector, caption]) => {
    const section = document.querySelector(selector);
    if (!section) return;
    const bumper = document.createElement('span');
    bumper.className = 'chapter-bumper';
    bumper.textContent = caption;
    bumper.setAttribute('aria-hidden', 'true');
    section.append(bumper);
    if (chapterObserver) chapterObserver.observe(bumper);
    else bumper.classList.add('chapter-on-air');
  });

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
