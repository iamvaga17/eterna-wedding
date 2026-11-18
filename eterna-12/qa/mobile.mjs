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
    const context = await browser.newContext({...device, reducedMotion: name === 'iphone-13' ? 'no-preference' : 'reduce'});
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
      const enter = page.getByRole('link', {name: 'Открыть приглашение'});
      if (name === 'iphone-13') {
        const knob = enter.locator('.entry-knob');
        await enter.scrollIntoViewIfNeeded();
        const bounds = await enter.boundingBox();
        const seal = await knob.boundingBox();
        const start = seal.x + seal.width / 2;
        const y = seal.y + seal.height / 2;
        await page.mouse.move(start, y);
        await page.mouse.down();
        await page.mouse.move(start + 45, y, {steps: 5});
        assert.ok(Math.abs((await knob.boundingBox()).x - seal.x - 45) < 3);
        await page.mouse.up();
        assert.equal(new URL(page.url()).hash, '');
        await page.waitForFunction(() => document.querySelector('[data-entry]').style.getPropertyValue('--seal-x') === '0px');
        await knob.evaluate(element => Promise.all(element.getAnimations().map(animation => animation.finished)));
        await page.mouse.move(start, y);
        await page.mouse.down();
        await page.mouse.move(bounds.x + bounds.width - seal.width / 2 - 5, y, {steps: 10});
        await page.mouse.up();
      } else if (name === 'iphone-13-landscape') {
        await enter.press('Enter');
      } else {
        await enter.tap();
      }
      await page.waitForURL('**/#atmosphere');
      const letter = page.locator('.letter');
      const greeting = letter.locator('h2');
      assert.equal(await greeting.isVisible(), false);
      await letter.getByText('Открыть письмо', {exact: true}).tap();
      await greeting.waitFor();
      await page.screenshot({path: `screenshots/${name}-letter.png`});
      await letter.getByText('Сложить письмо', {exact: true}).tap();
      await greeting.waitFor({state: 'hidden'});
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
