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

    // Time-based trajectories: fast launch, brief peak, then gravity and flutter.
    // Canvas stays at DPR 1 to avoid retina fill-rate spikes in iOS Safari.
    const count = matchMedia('(max-width: 650px)').matches ? 42 : 70;
    const pieces = Array.from({length: count}, (_, i) => {
      const shot = i % 2;
      const side = shot ? -1 : 1;
      const lifetime = random(1.45, 2.4);
      return {
        start: shot * 290 + random(0, 95),
        lifetime,
        x: shot ? rect.width * .97 : rect.width * .03,
        y: rect.height * random(.74, .84),
        vx: side * random(rect.width * .49, rect.width * 1.03),
        vy: -random(rect.height * .82, rect.height * 1.37),
        gravity: random(rect.height * .95, rect.height * 1.68),
        drift: random(4, 15),
        w: random(3.5, 9),
        h: random(5, 11),
        phase: random(0, Math.PI * 2),
        flutter: random(9, 16),
        flutterPhase: random(0, Math.PI * 2),
        flutterStrength: random(.5, 1),
        spin: random(6, 12) * (i % 2 ? -1 : 1),
        color: colors[i % colors.length]
      };
    });
    const id = launchId;
    let startTime = 0;
    let lastDraw = -50;

    function frame(now) {
      if (id !== launchId || document.hidden || !canvas.isConnected) return;
      if (!startTime) startTime = now;
      const elapsed = now - startTime;
      // ~40fps: smoother than v9's 25fps without individual DOM animations.
      if (elapsed - lastDraw < 24 && elapsed < 2800) {
        animationFrame = requestAnimationFrame(frame);
        return;
      }
      lastDraw = elapsed;
      ctx.clearRect(0, 0, rect.width, rect.height);
      let active = false;
      for (const p of pieces) {
        const t = (elapsed - p.start) / 1000;
        if (t < 0) { active = true; continue; }
        if (t > p.lifetime) continue;
        active = true;
        const drag = 1 - Math.exp(-2.1 * t);
        const x = p.x + (p.vx / 2.1) * drag +
          Math.sin(t * p.flutter + p.flutterPhase) * p.drift * Math.min(t, 1) * p.flutterStrength;
        const y = p.y + p.vy * t + .5 * p.gravity * t * t +
          Math.sin(t * (p.flutter * .6) + p.phase) * 3.5 * Math.min(t, 1);
        const fade = Math.min(1, t * 12, (p.lifetime - t) * 5);
        const face = Math.max(.13, Math.abs(Math.cos(t * p.spin + p.phase)));
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(t * p.spin * .45 + p.phase);
        ctx.globalAlpha = Math.max(0, fade);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w * face / 2, -p.h / 2, p.w * face, p.h);
        ctx.restore();
      }
      if (active && elapsed < 2900) animationFrame = requestAnimationFrame(frame);
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

  // Interactive editorial scene: text-only, accessible and intentionally lightweight.
  const deskButtons = Array.from(document.querySelectorAll('[data-desk]'));
  if (deskButtons.length) {
    const deskCategory = document.getElementById('desk-category');
    const deskNumber = document.getElementById('desk-number');
    const deskTitle = document.getElementById('desk-story-title');
    const deskCopy = document.getElementById('desk-story-copy');
    const deskTicker = document.getElementById('desk-ticker');
    const deskScreen = document.querySelector('.desk-screen');
    const stories = [
      {
        category: 'СРОЧНО', number: '01',
        title: 'Двое официально перешли на сторону любви',
        copy: 'Главные подозреваемые подтвердили: 7 августа 2027 года состоится свадьба. Гостей просят явиться нарядными и голодными.',
        ticker: 'Наш источник сообщает: любовь победила здравый смысл.'
      },
      {
        category: 'СВОДКА', number: '02',
        title: 'Установлено местонахождение свадебного торта',
        copy: 'По предварительным данным, торт прибудет к концу вечера. Редакция рекомендует сохранять спокойствие и не покидать танцпол.',
        ticker: 'Очевидцы утверждают: первый кусок никто не отдаст без боя.'
      },
      {
        category: 'СЕНСАЦИЯ', number: '03',
        title: 'Гости приглашены на операцию «Горько!»',
        copy: 'Специалисты ожидают повышенную концентрацию объятий, смеха и неожиданных танцевальных решений. Присутствие гостей крайне желательно.',
        ticker: 'Срочно: уровень счастья в регионе может превысить норму.'
      }
    ];
    let deskAnimation;
    let switchTimer = 0;
    let selectedStory = 0;
    function selectStory(index) {
      const story = stories[index];
      if (!story || (index === selectedStory && !switchTimer)) return;
      clearTimeout(switchTimer);
      deskScreen.classList.remove('desk-transmitting');
      deskButtons.forEach((button, i) => {
        const selected = i === index;
        button.classList.toggle('is-active', selected);
        button.setAttribute('aria-pressed', String(selected));
      });
      const updateStory = () => {
        selectedStory = index;
        deskCategory.textContent = story.category;
        deskNumber.textContent = story.number;
        deskTitle.textContent = story.title;
        deskCopy.textContent = story.copy;
        deskTicker.textContent = story.ticker;
      };
      if (motion.matches) { updateStory(); return; }
      // A single compositor-only overlay wipe; never animate the whole page.
      void deskScreen.offsetWidth;
      deskScreen.classList.add('desk-transmitting');
      switchTimer = setTimeout(() => {
        switchTimer = 0;
        updateStory();
      }, 210);
      deskAnimation?.cancel();
      deskAnimation = deskScreen.animate(
        [{transform:'translateZ(0)'},{transform:'translateZ(0)'}],
        {duration:520}
      );
      deskAnimation.onfinish = () => deskScreen.classList.remove('desk-transmitting');
    }
    deskButtons.forEach(button => button.addEventListener('click', () => selectStory(Number(button.dataset.desk))));
  }

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
