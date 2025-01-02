let tg = window.Telegram.WebApp;
tg.expand();

let lastScannedData = null;

// Создаем обработчик события сканирования
const qrEventHandler = (event) => {
    // Получаем текст из объекта события
    const qrData = event.data;
    if (qrData) {
        lastScannedData = qrData;
        document.getElementById('result').textContent = `Отсканировано: ${qrData}`;
        document.getElementById('sendButton').style.display = 'block';
    }
};

document.getElementById('scanButton').addEventListener('click', () => {
    // Добавляем обработчик события
    tg.onEvent('qrTextReceived', qrEventHandler);
    
    // Открываем сканер QR кода
    const par = {
        text: "Сканируем QR код"
    };
    window.Telegram.WebApp.showScanQrPopup(par);
});

// Добавляем обработчик для кнопки отправки
document.getElementById('sendButton').addEventListener('click', async () => {
    if (lastScannedData) {
        await sendToGoogleSheets(lastScannedData);
        // Удаляем обработчик события после отправки
        tg.offEvent('qrTextReceived', qrEventHandler);
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
    } catch (error) {
        document.getElementById('result').textContent += '\nОшибка при сохранении данных';
        console.error('Error:', error);
    }
} 
