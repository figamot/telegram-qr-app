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
        tg.showScanQrPopup(par, function(data) {
            if (data) {
                if (data !== lastCode) {
                    lastCode = data;
                    lastScannedData = data;
                    const timestamp = formatDate(new Date());
                    saveToHistory(data, timestamp);
                    document.getElementById('result').textContent = `Отсканировано: ${data}`;
                    document.getElementById('sendButton').style.display = 'block';
                }
                tg.closeScanQrPopup();
            }
        });
    }

    document.getElementById('scanButton').addEventListener('click', () => {
        showQRScanner();
    });

    document.getElementById('sendButton').addEventListener('click', async () => {
        if (lastScannedData) {
            await sendToGoogleSheets(lastScannedData);
        }
    });

    // Добавим функцию форматирования даты
    function formatDate(date) {
        const pad = (num) => String(num).padStart(2, '0');
        
        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());
        const seconds = pad(date.getSeconds());
        
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    // Изменим функцию логирования
    function debugLog(message, data = null) {
        const timestamp = formatDate(new Date());
        let logMessage = `${timestamp}: ${message}`;
        
        if (data) {
            logMessage += '\n' + JSON.stringify(data, null, 2);
        }
        
        const currentLogs = localStorage.getItem('debug_logs') || '';
        localStorage.setItem('debug_logs', logMessage + '\n\n' + currentLogs);
        
        console.log(message, data);
    }

    // И изменим функцию отправки данных
    async function sendToGoogleSheets(qrData) {
        const timestamp = formatDate(new Date());
        
        try {
            debugLog('Отправляем данные:', { timestamp, qrData });

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

    // Добавляем обработчик для кнопки логов
    document.getElementById('logsButton').addEventListener('click', () => {
        window.location.href = 'logs.html';
    });

    // Добавим функцию сохранения в историю
    function saveToHistory(qrData, timestamp) {
        const history = JSON.parse(localStorage.getItem('scan_history') || '[]');
        history.push({ qrData, timestamp });
        localStorage.setItem('scan_history', JSON.stringify(history));
    }
} 
