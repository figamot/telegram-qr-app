let tg = window.Telegram.WebApp;

// Проверяем, запущено ли приложение в Telegram
if (!window.Telegram.WebApp.initData) {
    document.body.innerHTML = '<div style="padding: 20px; text-align: center;">Это приложение работает только в Telegram.<br>Пожалуйста, откройте его через бота в Telegram.</div>';
} else {
    tg.expand();

    let lastScannedData = null;
    let lastCode = null;

    function showQRScanner() {
        const par = {
            text: "Наведите камеру на QR код"
        };
        tg.showScanQrPopup(par);
    }

    function processQRCode(data) {
        if (data === lastCode) {
            return;
        }
        
        // Закрываем окно сканера
        tg.closeScanQrPopup();
        
        lastCode = data;
        lastScannedData = data;
        
        document.getElementById('result').textContent = `Отсканировано: ${data}`;
        document.getElementById('sendButton').style.display = 'block';
    }

    document.getElementById('scanButton').addEventListener('click', () => {
        showQRScanner();
    });

    tg.onEvent('qrTextReceived', (event) => {
        processQRCode(event.data);
    });

    document.getElementById('sendButton').addEventListener('click', async () => {
        if (lastScannedData) {
            await sendToGoogleSheets(lastScannedData);
        }
    });

    // Добавим функцию для логирования
    function debugLog(message, data = null) {
        const logElement = document.getElementById('debug-log');
        const timestamp = new Date().toISOString();
        let logMessage = `${timestamp}: ${message}`;
        
        if (data) {
            logMessage += '\n' + JSON.stringify(data, null, 2);
        }
        
        logElement.innerHTML += logMessage + '\n\n';
        console.log(message, data);
    }

    // И изменим функцию отправки данных
    async function sendToGoogleSheets(qrData) {
        const timestamp = new Date().toISOString();
        
        try {
            debugLog('Отправляем данные:', { timestamp, qrData });

            // Обновляем URL на новый
            const url = new URL('https://script.google.com/macros/s/AKfycbwaLIpSc9zKq5B7Bg9QMGmdK0SA_5ulYfOexpNc0k5RR40zH9T72sAb-LXA0-AH2A5Wew/exec');
            url.searchParams.append('timestamp', timestamp);
            url.searchParams.append('qrData', qrData);

            const response = await fetch(url.toString(), {
                method: 'GET',
                mode: 'no-cors'
            });

            debugLog('Ответ сервера получен');
            
            document.getElementById('result').textContent += '\nДанные отправлены!';
            document.getElementById('sendButton').style.display = 'none';
            lastScannedData = null;
            lastCode = null;

        } catch (error) {
            debugLog('Ошибка:', {
                message: error.message,
                stack: error.stack
            });
            document.getElementById('result').textContent += `\nОшибка при сохранении данных: ${error.message}`;
        }
    }
} 
