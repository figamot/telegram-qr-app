let tg = window.Telegram.WebApp;
tg.expand();

let lastScannedData = null;

document.getElementById('scanButton').addEventListener('click', () => {
    // Открываем сканер QR кода с callback функцией
    window.Telegram.WebApp.showScanQrPopup({
        text: "Сканируем QR код",
        callback: function(text) {
            console.log("Отсканированный текст:", text); // для отладки
            if (text) {
                lastScannedData = text;
                document.getElementById('result').textContent = `Отсканировано: ${text}`;
                document.getElementById('sendButton').style.display = 'block';
            }
        }
    });
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
        document.getElementById('sendButton').style.display = 'none';
        lastScannedData = null;
    } catch (error) {
        document.getElementById('result').textContent += '\nОшибка при сохранении данных';
        console.error('Error:', error);
    }
} 
