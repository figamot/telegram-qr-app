let tg = window.Telegram.WebApp;
tg.expand();

let lastScannedData = null;
let lastCode = null; // для предотвращения повторного сканирования

// Функция для показа QR сканера
function showQRScanner() {
    const par = {
        text: "Наведите камеру на QR код"
    };
    tg.showScanQrPopup(par);
}

// Функция обработки QR кода
function processQRCode(data) {
    // Проверяем, не тот же это код
    if (data === lastCode) {
        return;
    }
    
    lastCode = data;
    lastScannedData = data;
    
    // Показываем результат
    document.getElementById('result').textContent = `Отсканировано: ${data}`;
    document.getElementById('sendButton').style.display = 'block';
}

// Обработчик кнопки сканирования
document.getElementById('scanButton').addEventListener('click', () => {
    showQRScanner();
});

// Добавляем обработчик события сканирования
tg.onEvent('qrTextReceived', (event) => {
    processQRCode(event.data);
});

// Обработчик кнопки отправки
document.getElementById('sendButton').addEventListener('click', async () => {
    if (lastScannedData) {
        await sendToGoogleSheets(lastScannedData);
    }
});

async function sendToGoogleSheets(qrData) {
    const timestamp = new Date().toISOString();
    
    try {
        const response = await fetch('https://script.google.com/macros/s/AKfycbwtade14oC_eU7tmCxea1dtus_4J7HsEgf9SEwv5_FmjACMKrz5eFhjkoa3tLi4XKz6lQ/exec', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                timestamp: timestamp,
                qrData: qrData
            })
        });

        if (!response.ok) {
            throw new Error('Ошибка при отправке данных');
        }

        document.getElementById('result').textContent += '\nДанные успешно сохранены!';
        document.getElementById('sendButton').style.display = 'none';
        lastScannedData = null;
        lastCode = null;
    } catch (error) {
        document.getElementById('result').textContent += '\nОшибка при сохранении данных';
        console.error('Error:', error);
    }
} 
