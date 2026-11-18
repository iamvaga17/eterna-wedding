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
        const door = gate.locator('.intro-door-left');
        const initialDoor = await door.boundingBox();
        const seal = await knob.boundingBox();
        const start = seal.x + seal.width / 2;
        const y = seal.y + seal.height / 2;
        await page.mouse.move(start, y);
        await page.mouse.down();
        await page.mouse.move(start + 45, y, {steps: 5});
        assert.ok(Math.abs((await knob.boundingBox()).x - seal.x - 45) < 3);
        assert.ok((await door.boundingBox()).x < initialDoor.x - 15);
        assert.equal(await gate.isVisible(), true);
        await page.mouse.up();
        assert.equal(await gate.isVisible(), true);
        await page.waitForFunction(() => document.querySelector('.entry-knob').parentElement.style.getPropertyValue('--seal-x') === '0px');
        await door.evaluate(element => Promise.all(element.getAnimations().map(animation => animation.finished)));
        assert.ok(Math.abs((await door.boundingBox()).x - initialDoor.x) < 1);
        await page.mouse.move(35, 130);
        await page.mouse.down();
        await page.mouse.move(device.viewport.width * .72, 130, {steps: 10});
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
      if (device.viewport.width < 760) {
        const gap = await page.locator('.atmosphere').evaluate(section => {
          const title = section.querySelector('h2').getBoundingClientRect();
          const photo = section.querySelector('.atmosphere-wide').getBoundingClientRect();
          return photo.top - title.bottom;
        });
        assert.ok(gap >= 12, 'The prologue title needs space above the photo');
      }
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
          await group.locator(':scope > summary').click();
          await group.getByRole('button', {name: '+ Добавить фотографию'}).click();
          const input = group.getByLabel('Выбрать ' + label + ' — фото 3');
          await input.evaluate(async element => {
            const canvas = document.createElement('canvas');
            const jpeg = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg'));
            const transfer = new DataTransfer();
            transfer.items.add(new File([jpeg], 'look.jpg', {type: 'image/jpeg'}));
            element.files = transfer.files;
            element.dispatchEvent(new Event('change', {bubbles: true}));
          });
          try {
            await page.locator('#status').filter({hasText: /Фото добавлено|Ошибка:/}).waitFor({timeout: 7000});
          } catch (error) {
            console.log('Editor upload status:', await page.locator('#status').textContent(), await input.evaluate(element => [element.files.length, element.disabled]));
            throw error;
          }
          assert.match(await page.locator('#status').textContent(), /^Фото добавлено/);
          await preview.locator('.moodboard .looks').nth(index).locator('img[src^="blob:"]').waitFor({state: 'attached'});
        }
      }
      if (name === 'iphone-se') {
        const music = page.getByLabel('Загрузить или заменить трек');
        const preview = page.frameLocator('#siteFrame');
        await page.getByText('Фоновая музыка', {exact: true}).click();
        const tone = Buffer.from('SUQzBAAAAAAAIlRTU0UAAAAOAAADTGF2ZjYxLjcuMTAzAAAAAAAAAAAAAAD/+0DAAAAAAAAAAAAAAAAAAAAAAABJbmZvAAAADwAAAAsAAAUzADc3Nzc3Nzc3N0tLS0tLS0tLS19fX19fX19fX3Nzc3Nzc3Nzc4eHh4eHh4eHh5ubm5ubm5ubm6+vr6+vr6+vr8PDw8PDw8PDw9fX19fX19fX1+vr6+vr6+vr6////////////wAAAABMYXZjNjEuMTkAAAAAAAAAAAAAAAAkBC8AAAAAAAAFMwdtESkAAAAAAP/7EMQAAASQHUVU8YAolAZoQzYgAAAAHUwAAADVkvYhuBHAcgSAcCER83fxw8e6AAOdmHv/4Aj/8PMLKDwWkgPzVXQmAA31AAG6SQ/iwh7vP9//4UB8BBrhUFfER761MD0JIwsxIDJZ//sSxASDxbQbFB3gAACaA2KBn2gIQCNMP2I9lCqTKaHVBwrhgHgKGBqCQYFAC6arCFYuz/9TtX//QGQgPMwnAUDMZbsP1QKww7wHzpBjRgTFAC6imb6V//v9XV9X//2WqjUHznqDAugH//sQxAQDxOgbEg1/QECkA2JBr+gIcw4khZNFoA1zBEQCYBwStOEEEbFG3iq//36vd6/+mk1jM4NwwJIENMLNRkzN1gd8wNMByOInMqEUi3JdrXpb/93q63f/+m37KjQNzQ8jAQAVcwX/+xLEBQPFDBsSDX8gQLkDYcG/6AhNZFMa6CZTAWQJozvRCsgjV+q1oUh7f+7VXX//0f2mJIJJMGAZg45gvjpaY9eGVmA1AaRobpkFhjSoGFiwRUcI7P77tVdb/X/yHbZbbRUSZqAYNof/+xDEA4PEiBsUDXsgQKCDYkGv6AhJkrf4nduNeYVwMx90mwgZI5ctMBx5Z//6vf6v+kSVHCHGBZgPJhvxLCaJ6B5mCHAGR4SJqgxkQ5Z9Lxw6T/7r9XV//00KNigO4pMDbAbjEFh74//7EsQGg8VkHRANf0BAp4NiQa/oCFBMDEMFAAIQfmGsgGRlz1UG6zX6f6fkeQt7v/7tVRrWBxK5gTYH8YXchWGc8g4hgbwDWclEZYCnk3VdzXZd/992p/d6v+jo7DLUIy6HMBdBhDByGP/7EMQGA8WIHRAN/0BApINiQa/oCPoyPEK0MB+AsTPyAQbGACzE4l+yL9X9FHI8lZ2//fd6zGrBTiYAcCuGBtrWBiUATgYBqBPmKhGDOmAEF2Eg2gSft//U/X//000VJCDP5MFQNQx7//sSxASDxDAbFgz7IECUA2KBn2gIelDm2GIMI0F07IjRNMQJBxXb8W//v+/W8mVPVEwlgejMBlsPtwPQw5wMzoEDRhTFAi4CgbsU///39////tU1iz1KMIoC0ywT5T2qBXMNEAAfGjTM//sQxAsDxHQbFgz7QEB9A2MBn2QIICJyM/j13/7vv1fV/0Gouc9xgxBMmQPU2dFAi5hKgcHUWGJKefB2Y1Z//+/UMgdMnCMDINcxKehzX4GHMEsFo2fC4mjve3sDTv/3/f3cMAcA8wH/+xLEEwNEDBsYDXsAQPmOJQa8MAKwQTCLC1BCkZgJAFA4EkwJQGwEAWrWYAIAoKADUvmn8hyx+gMW5wIACKACCrmhUAAE3dzjuc9zgd4Aaj0ej0fDgUAAAAAABW17df/nNZGlXP7V/zH/+xDEDYAICGVfuakAEAAANIOAAAQpzLFL2X+CigMkk+FlIN9DvK+HJkDFUN+uvxQQxo+CUIn8EQqJKkxBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqg==', 'base64');
        await music.setInputFiles({name: 'Тест.mp3', mimeType: 'audio/mpeg', buffer: tone});
        await page.locator('#musicStatus').filter({hasText: 'Тест.mp3'}).waitFor();
        const audio = preview.locator('audio');
        const toggle = preview.getByRole('button', {name: 'Музыка'});
        await toggle.waitFor();
        assert.equal(await audio.evaluate(element => element.paused), true);
        await toggle.tap();
        await preview.getByRole('button', {name: 'Музыка', pressed: true}).waitFor();
        await toggle.tap();
        await preview.getByRole('button', {name: 'Музыка', pressed: false}).waitFor();
        const previous = await audio.getAttribute('src');
        await music.setInputFiles({name: 'Новый трек.mp3', mimeType: 'audio/mpeg', buffer: tone});
        await page.locator('#musicStatus').filter({hasText: 'Новый трек.mp3'}).waitFor();
        await page.waitForFunction(oldSource => {
          const current = document.getElementById('siteFrame').contentDocument.querySelector('audio').getAttribute('src');
          return current?.startsWith('blob:') && current !== oldSource;
        }, previous);
        await page.reload();
        await page.locator('#musicStatus').filter({hasText: 'Новый трек.mp3'}).waitFor({state: 'attached'});
        const downloaded = page.waitForEvent('download');
        await page.locator('#downloadBtn').click();
        const zip = await readFile(await (await downloaded).path());
        assert.ok(zip.includes(Buffer.from('orders/demo/wedding-music.mp3')));
        assert.ok(zip.includes(tone));
        await page.getByText('Фоновая музыка', {exact: true}).click();
        await page.getByRole('button', {name: 'Убрать музыку'}).click();
        await toggle.waitFor({state: 'hidden'});
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
