import assert from 'node:assert/strict';
import {mkdir, readFile} from 'node:fs/promises';
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
      const gate = page.getByRole('dialog', {name: 'Приглашение'});
      await gate.waitFor();
      assert.equal(await gate.locator('.intro-names').textContent(), 'Александр & Виктория');
      assert.deepEqual(await page.locator('[data-initials]').allTextContents(), ['А·В', 'А·В', 'А·В', 'А·В']);
      assert.equal(await page.title(), 'Александр & Виктория — свадебное приглашение');
      assert.equal(await page.evaluate(() => {
        const intro = document.querySelector('.intro-gate');
        return intro.matches(':modal') && intro.contains(document.elementFromPoint(10, 10));
      }), true);
      await page.screenshot({path: `screenshots/${name}-intro.png`});
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'Horizontal overflow');
      const enter = gate.getByRole('button', {name: 'Раскрыть сайт'});
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
        assert.equal(await gate.isVisible(), true);
        await page.waitForFunction(() => document.querySelector('.entry-knob').parentElement.style.getPropertyValue('--seal-x') === '0px');
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
      await gate.waitFor({state: 'hidden'});
      assert.equal(new URL(page.url()).hash, '');
      assert.equal(await page.evaluate(() => scrollY), 0);
      await page.screenshot({path: `screenshots/${name}-cover.png`});
      assert.equal(await page.locator('.masthead').count(), 0);
      const names = page.getByRole('heading', {name: 'Александр & Виктория', level: 1});
      await page.waitForFunction(() => document.activeElement?.matches('.cover-caption h1'));
      assert.equal(await names.evaluate(element => getComputedStyle(element).outlineStyle), 'none');
      await page.getByRole('link', {name: 'Листайте вниз'}).tap();
      await page.waitForURL('**/#atmosphere');
      const letter = page.locator('.letter');
      const greeting = letter.locator('h2');
      if (name === 'iphone-13') {
        await letter.locator('summary').scrollIntoViewIfNeeded();
        await letter.locator('.letter-content').waitFor();
        assert.equal(await letter.getAttribute('open'), '');
        await letter.locator('.letter-content').evaluate(element => Promise.all(element.getAnimations().map(animation => animation.finished)));
      } else {
        assert.equal(await greeting.isVisible(), false);
        await letter.getByText('Открыть письмо', {exact: true}).tap();
      }
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
      assert.equal(await page.locator('.cover-bar a[href="#rsvp"]').count(), 0);
      if (name === 'iphone-se') {
        const config = await readFile('wedding-config.js', 'utf8');
        const endpoint = 'https://example.test/rsvp';
        await page.route('**/wedding-config.js?rev=*', route => route.fulfill({
          contentType: 'application/javascript',
          body: config + '\nwindow.WEDDING_CONFIG.rsvp = {questions: [], endpoint: ' + JSON.stringify(endpoint) + '};'
        }));
        const payloads = [];
        await page.route(endpoint, async route => {
          const data = JSON.parse(route.request().postData());
          payloads.push(data);
          await route.fulfill({
            headers: {'access-control-allow-origin': '*'},
            json: payloads.length === 1 ? {ok: false} : {ok: true, id: data.id}
          });
        });
        await page.goto('http://127.0.0.1:8080/eterna-12/index.html#rsvp');
        await page.locator('#rsvp-name').fill('Тестовый гость');
        const send = page.getByRole('button', {name: 'Отправить ответ'});
        await send.tap();
        await page.getByText('Не удалось подтвердить сохранение.', {exact: false}).waitFor();
        assert.equal(await page.locator('#rsvp-name').inputValue(), 'Тестовый гость');
        assert.equal(await page.getByText('Ваш ответ сохранён.').count(), 0);
        await send.tap();
        await page.getByText('Ваш ответ сохранён.', {exact: true}).waitFor();
        assert.equal(payloads.length, 2);
        assert.deepEqual(payloads[0], payloads[1]);
        assert.equal(payloads[0].name, 'Тестовый гость');
        assert.equal(payloads[0].attendance, 'yes');
        await page.goto('http://127.0.0.1:8080/editor.html');
        await page.getByLabel('Имя жениха', {exact: true}).fill('  ёлка');
        await page.getByLabel('Имя невесты', {exact: true}).fill('Анна-Мария');
        const preview = page.frameLocator('#siteFrame');
        await preview.locator('.mark').filter({hasText: 'Ё·А'}).waitFor();
        assert.deepEqual(await preview.locator('[data-initials]').allTextContents(), ['Ё·А', 'Ё·А', 'Ё·А', 'Ё·А']);
        for (const [index, label] of ['Для неё', 'Для него'].entries()) {
          const group = page.locator('#photos details.photo-group').filter({has: page.getByText('Дресс-код — ' + label, {exact: false})});
          await group.locator('summary').click();
          await group.getByRole('button', {name: '+ Добавить фотографию'}).click();
          await group.getByLabel('Выбрать ' + label + ' — фото 3').setInputFiles('eterna-12/assets/editorial-3.webp');
          const extraLook = preview.locator('.moodboard .looks').nth(index).locator('img').nth(1);
          await extraLook.waitFor({state: 'attached'});
          assert.match(await extraLook.getAttribute('src'), /^blob:/);
        }
      }
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
