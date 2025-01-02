let tg = window.Telegram.WebApp;
tg.expand();

document.getElementById('scanButton').addEventListener('click', async () => {
    try {
        // Создаем аудио элемент заранее
        const audio = new Audio();
        audio.src = 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU' + 'A'.repeat(1024);

        // Используем встроенный сканер QR кодов Telegram с коллбэком
        const qrData = await tg.showScanQrPopup({
            text: "Пожалуйста, отсканируйте QR код",
            onScan: () => {
                // Вибрация при успешном сканировании
                if (navigator.vibrate) {
                    navigator.vibrate([200, 100, 200]); // Двойная вибрация
                }
                // Воспроизводим звук
                audio.play().catch(console.error);
            }
        });

        // Показываем результат на странице
        document.getElementById('result').textContent = `Отсканировано: ${qrData}`;

        // Отправляем данные в Google таблицу
        await sendToGoogleSheets(qrData);

    } catch (error) {
        document.getElementById('result').textContent = `Ошибка: ${error.message}`;
    }
});

async function sendToGoogleSheets(qrData) {
    const timestamp = new Date().toISOString();
    
    try {
        const response = await fetch('https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec', {
            method: 'POST',
            body: JSON.stringify({
                timestamp: timestamp,
                qrData: qrData
            })
        });

        if (!response.ok) {
            throw new Error('Ошибка при отправке данных');
        }

        document.getElementById('result').textContent += '\nДанные успешно сохранены!';
    } catch (error) {
        document.getElementById('result').textContent += '\nОшибка при сохранении данных';
    }
} 
