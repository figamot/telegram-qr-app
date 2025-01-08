function doGet(e) {
  try {
    // Получаем параметры из URL
    const timestamp = e.parameter.timestamp;
    const qrData = e.parameter.qrData;
    const quantity = e.parameter.quantity || '1'; // По умолчанию 1, если не указано
    const userName = e.parameter.userName || 'Unknown'; // По умолчанию Unknown, если не указано
    
    // Открываем таблицу и добавляем данные
    const sheet = SpreadsheetApp.openById('1ORCAJeJYZUd5FxfhDKDTErSvldbjha8TVG0TRE2PvAI').getSheetByName('Лист1');
    sheet.appendRow([timestamp, qrData, quantity, userName]);
    
    // Возвращаем ответ
    return ContentService.createTextOutput(JSON.stringify({
      'status': 'success'
    }))
    .setMimeType(ContentService.MimeType.JSON);
    
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({
      'status': 'error',
      'message': error.message
    }))
    .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  return doGet(e);
} 