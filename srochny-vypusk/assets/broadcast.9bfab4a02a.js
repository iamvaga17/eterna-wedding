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

  const forecastButton = document.querySelector('[data-forecast]');
  const forecastResult = document.querySelector('[data-forecast-result]');
  const forecast = document.querySelector('.forecast');
  const frame = forecast.querySelector('.forecast-frame');
  const canvas = forecast.querySelector('.confetti-layer');
  const colors = ['#fae6ac', '#f0b16c', '#fd837c', '#ec474d', '#99d3fa', '#f9f4e7'];
  let confettiFrame = 0;

  function stopConfetti() {
    cancelAnimationFrame(confettiFrame);
    confettiFrame = 0;
    canvas.hidden = true;
    canvas.width = canvas.height = 1;
  }

  function launchForecast() {
    forecastResult.textContent = 'Вероятность конфетти — 100%. Берегите причёски.';
    if (motion.matches) return;
    const paint = canvas.getContext('2d');
    if (!paint) return;
    stopConfetti();
    const scene = forecast.getBoundingClientRect();
    const photo = frame.getBoundingClientRect();
    const width = scene.width;
    const height = scene.height;
    if (!width || !height) return;
    const scale = Math.min(devicePixelRatio || 1, 1.75);
    canvas.width = Math.ceil(width * scale);
    canvas.height = Math.ceil(height * scale);
    canvas.hidden = false;
    paint.setTransform(scale, 0, 0, scale, 0, 0);

    const count = width < 620 ? 76 : 108;
    const particles = Array.from({length: count}, (_, index) => {
      const side = index < count / 2 ? 1 : -1;
      const near = Math.random() < .38;
      const paper = Math.random() < .22;
      return {
        x: photo.left - scene.left + photo.width * (side === 1 ? .09 : .91),
        y: photo.top - scene.top + photo.height * (.72 + Math.random() * .18),
        vx: side * (45 + Math.random() * 175),
        vy: -(190 + Math.random() * 370),
        gravity: 300 + Math.random() * 200,
        width: (near ? 7 : 3) + Math.random() * (near ? 6 : 4),
        length: paper ? 19 : 5 + Math.random() * 9,
        rotation: Math.random() * Math.PI * 2,
        spin: (Math.random() - .5) * 12,
        phase: Math.random() * Math.PI,
        delay: (side === 1 ? 0 : .21) + Math.random() * .24,
        color: colors[index % colors.length],
        paper,
        near
      };
    }).sort((a, b) => Number(a.near) - Number(b.near));
    let started;

    function draw(now) {
      started ??= now;
      const elapsed = (now - started) / 1000;
      paint.clearRect(0, 0, width, height);
      if (elapsed >= 3.15 || motion.matches) {
        stopConfetti();
        return;
      }
      for (const piece of particles) {
        const age = elapsed - piece.delay;
        if (age < 0 || age > 2.75) continue;
        const x = piece.x + piece.vx * age / (1 + .22 * age)
          + Math.sin(age * 7 + piece.phase) * 12 * age;
        const y = piece.y + (piece.vy / 1.4) * (1 - Math.exp(-1.4 * age))
          + (piece.gravity * age * age) / (2 + age);
        if (y < -24 || y > height + 24 || x < -24 || x > width + 24) continue;
        const flip = Math.cos(age * 8 + piece.phase);
        paint.save();
        paint.translate(x, y);
        paint.rotate(piece.rotation + age * piece.spin);
        paint.scale(.16 + Math.abs(flip) * .84, 1);
        paint.globalAlpha = (piece.near ? 1 : .83) * Math.min(1, (2.75 - age) * 4);
        paint.fillStyle = piece.color;
        paint.fillRect(-piece.width / 2, -piece.length / 2, piece.width, piece.length);
        paint.fillStyle = flip > 0 ? '#fff9e47d' : '#1a1f4d46';
        paint.fillRect(-piece.width / 2, -piece.length / 2, piece.width, piece.paper ? 4 : 1.5);
        paint.restore();
      }
      confettiFrame = requestAnimationFrame(draw);
    }
    confettiFrame = requestAnimationFrame(draw);
  }

  forecastButton.hidden = false;
  const archive = document.querySelector('.archive-photo');
  if ('IntersectionObserver' in window && !motion.matches) {
    const observer = new IntersectionObserver(records => {
      for (const record of records) {
        if (record.intersectionRatio < .45) continue;
        observer.unobserve(record.target);
        if (motion.matches) continue;
        if (record.target === frame) launchForecast();
        else archive.classList.add('is-rewinding');
      }
    }, {threshold: .45});
    observer.observe(frame);
    observer.observe(archive.querySelector('.archive-frame'));
    forecastButton.addEventListener('click', () => observer.unobserve(frame), {once: true});
  }
  forecastButton.addEventListener('click', launchForecast);
  motion.addEventListener?.('change', () => { if (motion.matches) stopConfetti(); });

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
