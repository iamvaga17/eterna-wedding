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
  const confetti = document.querySelector('.confetti-layer');
  const colors = ['#fff3c6', '#f4a296', '#d94d4a', '#98bce4'];

  forecastButton.hidden = false;
  forecastButton.addEventListener('click', () => {
    forecastResult.textContent = 'Вероятность конфетти — 100%. Берегите причёски.';
    confetti.replaceChildren();
    if (motion.matches) return;
    for (let index = 0; index < 24; index++) {
      const piece = document.createElement('i');
      piece.style.setProperty('--left', (index * 37 % 98) + '%');
      piece.style.setProperty('--drift', (index % 2 ? -1 : 1) * (12 + index % 6 * 9) + 'px');
      piece.style.setProperty('--delay', (index % 7) * 56 + 'ms');
      piece.style.setProperty('--color', colors[index % colors.length]);
      piece.style.setProperty('--tilt', (index % 2 ? -1 : 1) * (260 + index * 27) + 'deg');
      piece.addEventListener('animationend', () => piece.remove(), {once: true});
      confetti.append(piece);
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
