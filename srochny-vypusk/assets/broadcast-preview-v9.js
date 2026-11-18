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

  // Efficient two-cannon celebration: one canvas instead of dozens of 3D DOM animations.
  const forecastButton = document.querySelector('[data-forecast]');
  const forecastResult = document.querySelector('[data-forecast-result]');
  const forecastSection = document.querySelector('.forecast');
  const confetti = document.querySelector('.confetti-layer');
  const colors = ['#fff2c3', '#f5a59b', '#d84953', '#a2c8ed', '#f3cf75', '#ffffff'];
  let launchId = 0;
  let hasAutoLaunched = false;
  let cleanupTimer = 0;
  let animationFrame = 0;
  let canvas;
  const random = (min, max) => min + Math.random() * (max - min);

  function stopConfetti() {
    cancelAnimationFrame(animationFrame);
    clearTimeout(cleanupTimer);
    confetti.replaceChildren();
    confetti.classList.remove('cannon-firing');
  }

  function launchConfetti() {
    forecastResult.textContent = 'Вероятность конфетти — 100%. Берегите причёски.';
    if (motion.matches || document.hidden) return;
    ++launchId;
    stopConfetti();
    const rect = confetti.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';
    const dpr = 1;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    const ctx = canvas.getContext('2d', {alpha: true});
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    confetti.append(canvas);
    confetti.classList.add('cannon-firing');

    const count = matchMedia('(max-width: 650px)').matches ? 26 : 48;
    const pieces = Array.from({length: count}, (_, i) => {
      const shot = i % 2;
      const dir = shot ? -1 : 1;
      return {
        start: shot * 340 + random(0, 130),
        duration: random(1900, 2800),
        x: shot ? rect.width * .98 : rect.width * .02,
        y: rect.height * random(.68, .78),
        dx: dir * random(rect.width * .17, rect.width * .9),
        lift: random(rect.height * .26, rect.height * .72),
        fall: random(rect.height * .28, rect.height * .75),
        drift: random(-14, 14),
        w: random(3.5, 9), h: random(4, 12),
        phase: random(0, Math.PI * 2),
        spin: random(6, 15) * (i % 2 ? -1 : 1),
        color: colors[i % colors.length]
      };
    });
    const id = launchId;
    let startTime = 0;
    let lastDraw = 0;

    function frame(now) {
      if (id !== launchId || document.hidden || !canvas.isConnected) return;
      if (!startTime) startTime = now;
      const elapsed = now - startTime;
      if (elapsed - lastDraw < 40 && elapsed < 3250) {
        animationFrame = requestAnimationFrame(frame);
        return;
      }
      lastDraw = elapsed;
      ctx.clearRect(0, 0, rect.width, rect.height);
      let active = false;
      for (const p of pieces) {
        const t = (elapsed - p.start) / p.duration;
        if (t < 0) { active = true; continue; }
        if (t >= 1) continue;
        active = true;
        // Initial upward burst then a slower fluttering descent.
        const x = p.x + p.dx * (1 - Math.pow(1 - t, 2.1)) +
          Math.sin(t * 14 + p.phase) * p.drift * t;
        const y = p.y - p.lift * Math.sin(Math.PI * Math.min(1, t * .92)) +
          p.fall * t * t;
        const flip = Math.cos(t * p.spin + p.phase);
        const alpha = Math.min(1, t * 12, (1 - t) * 5);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(t * p.spin * .38 + p.phase);
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2 * Math.max(.12, Math.abs(flip)), -p.h / 2,
          p.w * Math.max(.12, Math.abs(flip)), p.h);
        ctx.restore();
      }
      if (active && elapsed < 3300) animationFrame = requestAnimationFrame(frame);
      else stopConfetti();
    }
    animationFrame = requestAnimationFrame(frame);
  }

  // Avoid drawing particles while the effect is completely outside the viewport.
  if ('IntersectionObserver' in window) {
    const confettiVisibility = new IntersectionObserver(entries => {
      if (entries.some(e => !e.isIntersecting)) { ++launchId; stopConfetti(); }
    }, {threshold: 0});
    confettiVisibility.observe(forecastSection);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { ++launchId; stopConfetti(); }
  });
  // Visible test marker: distinguishes the preview from stale cached versions.
  const buildMarker = document.createElement('span');
  buildMarker.textContent = 'ТЕСТ V9 · ОБЛЕГЧЁННЫЕ КОНФЕТТИ';
  buildMarker.style.cssText = 'display:block;margin:.35rem 0;color:#f4dcca;font:600 11px/1.4 monospace;letter-spacing:.035em;';
  forecastResult.before(buildMarker);
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
      stopConfetti();
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
