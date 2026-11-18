import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {devices, webkit} from 'playwright';

await mkdir('screenshots', {recursive: true});
const browser = await webkit.launch();
try {
  const checks = [
    ['iphone-se', devices['iPhone SE']],
    ['iphone-13', devices['iPhone 13']],
    ['iphone-13-landscape', devices['iPhone 13 landscape']]
  ];
  for (const [name, device] of checks) {
    const context = await browser.newContext({...device, reducedMotion: 'reduce'});
    const page = await context.newPage();
    const faults = [];
    page.on('pageerror', error => faults.push(error.message));
    page.on('response', response => {
      if (response.url().startsWith('http://127.0.0.1:8080') && response.status() >= 400) {
        faults.push(response.status() + ' ' + response.url());
      }
    });
    try {
      await page.goto('http://127.0.0.1:8080/eterna-12/');
      await page.locator('.aperture img').evaluate(image => image.decode());
      await page.screenshot({path: `screenshots/${name}-cover.png`});
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'Horizontal overflow');
      await page.getByRole('link', {name: 'Открыть приглашение'}).tap();
      await page.waitForURL('**/#atmosphere');
      await page.getByRole('button', {name: '02', exact: true}).tap();
      await page.getByRole('button', {name: '02', exact: true, pressed: true}).waitFor();
      await page.locator('#rsvp-name').fill('Анна Иванова');
      await page.locator('input[name="transfer"][value="Да"]').tap();
      await page.getByText('Где вам удобнее сесть в автобус?', {exact: true}).waitFor();
      await page.locator('input[name="attendance"][value="no"]').tap();
      await page.getByText('Где вам удобнее сесть в автобус?', {exact: true}).waitFor({state: 'hidden'});
      await page.getByRole('button', {name: 'Проверить ответы'}).tap();
      await page.getByText('Это демонстрация. Ответы никуда не отправлены.', {exact: true}).waitFor();
      await page.screenshot({path: `screenshots/${name}-rsvp.png`});
      assert.deepEqual(faults, []);
      console.log(`Passed ${name}`);
    } catch (error) {
      await page.screenshot({path: `screenshots/${name}-failure.png`}).catch(() => {});
      throw error;
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}
