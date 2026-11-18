(() => {
  'use strict';

  const defaults = window.WEDDING_CONFIG || {};
  const defaultRsvp = window.WEDDING_RSVP_CONFIG;
  const asset = name => new URL(name, document.currentScript.src).href;
  const cover = asset('cover.webp');
  const editorial = Array.from({length: 6}, (_, index) => asset('editorial-' + index + '.webp'));
  const defaultPhotos = {
    main: cover, secondary1: editorial[0], secondary2: editorial[5],
    collage1: editorial[1], collage2: editorial[5],
    storyMain: cover, storySmall: editorial[0],
    memoryBg: editorial[5], venueBg: editorial[2], endingBg: editorial[1],
    dress1: editorial[3], dress2: editorial[4]
  };
  const palettes = {
    female: ['#e8d9c8', '#c6af94', '#b2b5a5', '#d3b8ac', '#73665b'],
    male: ['#272b2e', '#51595b', '#9b9d95', '#d0c7b9', '#f1e9de']
  };
  const sections = [...document.querySelectorAll('[data-section]')];
  const images = [...document.querySelectorAll('[data-photo]')];
  const schedule = document.querySelector('[data-schedule]');
  const moodboard = document.querySelector('[data-dress]');
  const rsvpRoot = document.getElementById('rsvpDynamic');
  const rsvpDeadline = document.querySelector('[data-rsvp-deadline]');
  const map = document.querySelector('[data-map]');
  const clock = document.querySelector('.clock');
  const timerMessage = document.querySelector('[data-timer-message]');
  const timerFields = [...clock.querySelectorAll('[data-time]')];
  const entry = document.querySelector('[data-entry]');
  const rsvpLink = document.querySelector('.nav-link');
  let previousSchedule;
  let previousDress;
  let previousRsvp;
  let deadline;

  function element(tag, text) {
    const node = document.createElement(tag);
    if (text != null) node.textContent = text;
    return node;
  }

  function setPhoto(image, source, position) {
    if (source) {
      if (image.getAttribute('src') !== source) image.src = source;
    } else {
      image.removeAttribute('src');
    }
    image.hidden = !source;
    image.style.objectPosition = position || 'center';
  }

  function renderSchedule(events) {
    schedule.replaceChildren(...events.map(event => {
      const item = element('li');
      const time = element('time', event.time);
      if (/^\d{2}:\d{2}$/.test(event.time)) time.dateTime = event.time;
      const detail = element('div');
      detail.append(element('h3', event.title), element('p', event.description));
      item.append(time, detail);
      return item;
    }));
  }

  function renderDress(config, photos, positions) {
    moodboard.replaceChildren();
    for (const [group, title, first, second, prefix] of [
      ['female', 'Для неё', 'dress1', 'dress3', 'dressFemale'],
      ['male', 'Для него', 'dress2', 'dress4', 'dressMale']
    ]) {
      const column = element('div');
      const swatches = element('div');
      swatches.className = 'swatches';
      const looks = element('div');
      looks.className = 'looks';
      palettes[group].forEach((fallback, index) => {
        const configured = config.dressPalettes?.[group]?.[index];
        const color = /^#[\da-f]{6}$/i.test(configured) ? configured : fallback;
        const swatch = element('span');
        swatch.style.backgroundColor = color;
        swatch.setAttribute('role', 'img');
        swatch.setAttribute('aria-label', color);
        swatches.append(swatch);
      });
      const count = Math.min(8, Math.max(2, Math.floor(Number(config.dressPhotoCounts?.[group]) || 2)));
      for (let i = 0; i < count; i++) {
        const key = [first, second][i] || prefix + (i + 1);
        const source = photos[key] || defaultPhotos[key];
        if (!source) continue;
        const figure = element('figure');
        const image = element('img');
        image.alt = title + ', образ ' + (i + 1);
        image.loading = 'lazy';
        image.decoding = 'async';
        setPhoto(image, source, positions[key]);
        figure.append(image);
        looks.append(figure);
      }
      column.append(element('h3', title), swatches, looks);
      moodboard.append(column);
    }
  }

  function updateClock() {
    const total = Math.ceil((deadline - Date.now()) / 1000);
    clock.hidden = !(total > 0);
    timerMessage.hidden = total > 0;
    if (clock.hidden) {
      timerMessage.textContent = Number.isFinite(total) ? 'День свадьбы уже наступил.' : 'Время начала уточняется.';
      return;
    }
    const values = [Math.floor(total / 86400), Math.floor(total / 3600) % 24, Math.floor(total / 60) % 60, total % 60];
    timerFields.forEach((field, index) => {
      const value = String(values[index]).padStart(2, '0');
      if (field.textContent !== value) field.textContent = value;
    });
  }

  function apply(config) {
    if (!config || typeof config !== 'object') return;
    const couple = {...defaults.couple, ...config.couple};
    const text = {...defaults.text, ...config.text};
    const content = {couple, text};
    const photos = config.photos || {};
    const positions = config.photoPosition || {};
    const names = [couple.first, couple.second].filter(Boolean).join(' & ');
    document.title = names ? names + ' — ÉTERNA' : 'ÉTERNA — свадебное приглашение';
    document.querySelectorAll('[data-names]').forEach(node => { node.textContent = names; });
    document.querySelectorAll('[data-copy]').forEach(node => {
      const [group, key] = node.dataset.copy.split('.');
      node.textContent = content[group]?.[key] ?? '';
    });
    for (const image of images) {
      const key = image.dataset.photo;
      const fallback = defaultPhotos[key];
      const supplied = photos[key] !== defaults.photos?.[key] || !fallback;
      setPhoto(image, (supplied && photos[key]) || fallback, positions[key]);
    }
    for (const section of sections) section.hidden = config.sections?.[section.dataset.section] === false;
    const first = sections.find(section => !section.hidden);
    entry.hidden = !first;
    if (first) entry.href = '#' + first.id;
    rsvpLink.hidden = document.getElementById('rsvp').hidden;
    const mapLink = typeof text.venueMap === 'string' ? text.venueMap.trim() : '';
    map.hidden = !/^https:\/\//i.test(mapLink);
    if (!map.hidden) map.href = mapLink;

    const events = Array.isArray(config.schedule) ? config.schedule : (defaults.schedule || []);
    const scheduleKey = JSON.stringify(events);
    if (scheduleKey !== previousSchedule) {
      previousSchedule = scheduleKey;
      renderSchedule(events);
    }
    const dressKeys = Object.keys({...photos, ...positions}).filter(key => /^dress(?!Bg)/.test(key));
    const dressKey = JSON.stringify([config.dressPalettes, config.dressPhotoCounts, dressKeys.map(key => [key, photos[key], positions[key]])]);
    if (dressKey !== previousDress) {
      previousDress = dressKey;
      renderDress(config, photos, positions);
    }
    deadline = Date.parse(couple.dateTime);
    updateClock();

    const rsvp = config.rsvp || defaultRsvp;
    document.querySelector('[data-rsvp-title]').textContent = rsvp?.title || 'Подтвердите присутствие';
    rsvpDeadline.textContent = config.rsvp?.deadline || '';
    rsvpDeadline.hidden = !rsvpDeadline.textContent;
    const rsvpKey = JSON.stringify(rsvp);
    if (rsvpKey !== previousRsvp) {
      previousRsvp = rsvpKey;
      window.ETERNA_MOUNT_RSVP(rsvpRoot, rsvp, {demo: true});
    }
  }

  apply(window.ETERNA_ORDER || defaults);
  setInterval(updateClock, 1000);
  if (window.parent !== window && location.search.includes('editor-preview=1')) {
    window.addEventListener('message', event => {
      if (event.origin === location.origin && event.source === window.parent && event.data?.type === 'eterna-preview') apply(event.data.config);
    });
  }
})();
