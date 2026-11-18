function doPost(event) {
  const source = event?.postData?.contents || '';
  if (!source || source.length > 24000) return respond_({ok: false});
  let reply;
  try {
    reply = parseReply_(JSON.parse(source));
  } catch {
    return respond_({ok: false});
  }

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return respond_({ok: false});
  try {
    const spreadsheetId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
    const book = SpreadsheetApp.openById(spreadsheetId);
    const sheet = book.getSheetByName('Ответы RSVP') || book.insertSheet('Ответы RSVP');
    if (sheet.getLastRow() === 0) sheet.appendRow(['ID', 'Дата', 'Имя и фамилия', 'Присутствие', 'Ответы']);
    const rows = sheet.getLastRow() - 1;
    const existing = rows > 0 && sheet.getRange(2, 1, rows, 1)
      .createTextFinder(reply.id).matchEntireCell(true).findNext();
    if (!existing) {
      const details = reply.details.map(({title, value}) => title + ': ' + value).join('\n');
      sheet.appendRow([reply.id, new Date(), cellText_(reply.name),
        reply.attendance === 'yes' ? 'Приду' : 'Не смогу', cellText_(details)]);
      SpreadsheetApp.flush();
    }
    return respond_({ok: true, id: reply.id});
  } catch (error) {
    console.error(String(error));
    return respond_({ok: false});
  } finally {
    lock.releaseLock();
  }
}

function parseReply_(value) {
  const {id, attendance, name, details} = value;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id) ||
      !['yes', 'no'].includes(attendance) ||
      !validText_(name, 100) || !Array.isArray(details) || details.length > 40) {
    throw Error('Invalid RSVP');
  }
  const answers = details.map(detail => {
    if (!validText_(detail?.title, 240)) throw Error('Invalid question');
    const items = Array.isArray(detail.value) ? detail.value : [detail.value];
    if (items.length > 30 || !items.every(item => validText_(item, 500))) throw Error('Invalid answer');
    return {title: detail.title.trim(), value: items.map(item => item.trim()).join(', ')};
  });
  return {id, attendance, name: name.trim(), details: answers};
}

function validText_(value, limit) {
  return typeof value === 'string' && value.length <= limit && value.trim().length > 0;
}

function cellText_(text) {
  return /^[\s]*[=+\-@]/.test(text) ? "'" + text : text;
}

function respond_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
