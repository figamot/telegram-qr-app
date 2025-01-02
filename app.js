let tg = window.Telegram.WebApp;
tg.expand();

let lastScannedData = null;

document.getElementById('scanButton').addEventListener('click', async () => {
    try {
        // Открываем сканер QR кода
        tg.showScanQrPopup({
            text: "Пожалуйста, отсканируйте QR код",
            // Добавляем обработчик события успешного сканирования
            callback: (data) => {
                if (data) {
                    // Сохраняем отсканированные данные
                    lastScannedData = data;
                    // Показываем результат и кнопку отправки
                    document.getElementById('result').textContent = `Отсканировано: ${data}`;
                    document.getElementById('sendButton').style.display = 'block';
                }
            }
        });

    } catch (error) {
        document.getElementById('result').textContent = `Ошибка: ${error.message}`;
    }
});

// Добавляем обработчик для кнопки отправки
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
        document.getElementById('sendButton').style.display = 'none'; // Скрываем кнопку после отправки
        lastScannedData = null; // Очищаем сохраненные данные
    } catch (error) {
        document.getElementById('result').textContent += '\nОшибка при сохранении данных';
        console.error('Error:', error);
    }
} 
