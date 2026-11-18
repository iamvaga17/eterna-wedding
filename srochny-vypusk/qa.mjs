import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {devices, webkit} from 'playwright';

const url = 'http://127.0.0.1:8080/srochny-vypusk/';
await mkdir('screenshots', {recursive: true});
const browser = await webkit.launch();
try {
  for (const [name, options] of [
    ['narrow', {...devices['iPhone SE'], viewport: {width: 320, height: 568}, reducedMotion: 'reduce'}],
    ['iphone', devices['iPhone 13']],
    ['landscape', devices['iPhone 13 landscape']]
  ]) {
    const context = await browser.newContext(options);
    const page = await context.newPage();
    const faults = [];
    page.on('pageerror', error => faults.push(error.message));
    try {
      await page.goto(url);
      assert.equal(await page.locator('#broadcast').isVisible(), false);
      await page.locator('.monitor img').evaluate(image => image.decode());
      await page.screenshot({path: `screenshots/news-${name}-opening.png`});
      await page.getByRole('link', {name: 'Выйти в эфир'}).tap();
      await page.waitForURL('**/#live');
      await page.getByRole('heading', {name: 'Свадьба подтверждена'}).waitFor();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      for (const image of await page.locator('main img').all()) {
        await image.scrollIntoViewIfNeeded();
        assert.equal(await image.evaluate(async element => {
          await element.decode();
          return element.naturalWidth > 0;
        }), true);
      }
      await page.getByRole('button', {name: 'Проверить торт'}).tap();
      await page.getByText('Торт обнаружен. Целостность крема подтверждена.').waitFor();
      const motion = name !== 'narrow';
      assert.equal(await page.locator('.camera-frame img').evaluate(image => image.getAnimations().length > 0), motion);
      await page.getByRole('button', {name: 'Запустить прогноз'}).tap();
      await page.getByText('Вероятность конфетти — 100%. Берегите причёски.').waitFor();
      assert.equal(await page.locator('.confetti-layer i').count(), motion ? 24 : 0);
      if (motion) await page.locator('.confetti-layer i').first().waitFor({state: 'detached'});
      await page.getByRole('radio', {name: 'В этот раз без меня'}).tap();
      assert.equal(await page.getByText('Чем поднимете бокал?').count(), 0);
      await page.getByRole('radio', {name: 'Буду в кадре'}).tap();
      await page.getByText('Чем поднимете бокал?').waitFor();
      await page.locator('#rsvp-name').fill('Тестовый гость');
      await page.getByRole('button', {name: 'Проверить ответы'}).tap();
      await page.getByText('Это демонстрация. Ответы никуда не отправлены.').waitFor();
      await page.goto(url + '?section=1#rsvp');
      await page.getByRole('heading', {name: 'Будете в кадре?'}).waitFor();
      assert.deepEqual(faults, []);
      console.log('Passed broadcast demo on ' + name);
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}
