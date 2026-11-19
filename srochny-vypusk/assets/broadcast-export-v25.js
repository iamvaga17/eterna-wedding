(() => {
  'use strict';
  // Only this local editor preview accepts same-origin configuration messages.
  let config = window.ETERNA_BROADCAST_ORDER || null;
  const set = (selector, value) => {
    const node = document.querySelector(selector);
    if (node && typeof value === 'string') node.textContent = value;
  };
  function apply() {
    if (!config) return;
    const c = config.couple || {}, b = config.broadcast || {};
    const names = [c.first,c.second].filter(Boolean).join(' и ');
    if (names) {
      set('.news-photo figcaption b', names);
      set('.live-copy h2', b.liveTitle || 'Свадьба подтверждена');
      set('.monitor figcaption span:first-child', 'Репортаж: ' + names);
      document.title = names + ' — Срочный выпуск';
    }
    set('.live-copy > p:last-child', b.liveText);
    set('.archive-grid h2', b.storyTitle);
    set('.archive-grid > div > p:last-child', b.storyText);
    set('.archive-photo figcaption', b.storyCaption);
    set('.desk-headline h2', b.newsHeader);
    set('.desk-headline > p:last-child', b.newsIntro);
    set('.case-intro > div:first-child > p:last-child', b.caseIntro);
    set('.forecast-copy h2', b.forecastTitle);
    set('.forecast-copy > p:not(.section-kicker)', b.forecastText);
    const sceneMap = [
      ['sceneCover','.monitor-picture img'],
      ['sceneCake','.news-photo img'],
      ['sceneArchive','.archive-photo img'],
      ['sceneForecast','.forecast-photo img']
    ];
    for (const [key,selector] of sceneMap) {
      const node = document.querySelector(selector);
      if (!node) continue;
      const uri = b.exportPhotos && b.exportPhotos[key];
      const defaultSrc = node.dataset.editorDefaultSrc || node.getAttribute('src');
      node.dataset.editorDefaultSrc = defaultSrc;
      if (typeof uri === 'string' && /^assets\/custom-(cover|cake|archive|forecast)\.jpg$/.test(uri)) node.src = uri;
      else node.src = defaultSrc;
    }
    const date = (c.dateLabel || '').trim();
    const city = (c.city || '').trim();
    if (date) {
      set('.monitor figcaption span:last-child', date);
      set('.edition', date + '\n' + city);
    }
    set('.live-copy .section-kicker', [city,date].filter(Boolean).join(' · '));
    const newsIndex = Array.from(document.querySelectorAll('[data-desk]')).findIndex(el => el.getAttribute('aria-pressed') === 'true');
    const i = Math.max(0,newsIndex);
    set('#desk-story-title', b['news'+i+'Title']);
    set('#desk-story-copy', b['news'+i+'Text']);
    const caseIndex = Array.from(document.querySelectorAll('[data-case]')).findIndex(el => el.getAttribute('aria-expanded') === 'true');
    if (caseIndex >= 0) {
      set('[data-case-title]', b['case'+caseIndex+'Title']);
      set('[data-case-text]', b['case'+caseIndex+'Text']);
    }
  }
  // Standalone order site: data is local, loaded by order.js before this deferred file.
  apply();
  // Apply custom copy after the original interactive scripts switch news or dossier.
  document.addEventListener('click', event => {
    if (event.target.closest('[data-desk]')) setTimeout(apply, 1230);
    if (event.target.closest('[data-case]')) requestAnimationFrame(apply);
  });

})();