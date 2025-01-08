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
                    
                    // Показываем результат и поле для ввода количества
                    document.getElementById('result').innerHTML = `
                        <div>Отсканировано: ${data}</div>
                        <div style="margin-top: 15px;">
                            <input type="number" id="quantityInput" 
                                style="background: #242f3d; border: 1px solid #3498db; 
                                color: white; padding: 8px; border-radius: 5px; width: 100px; 
                                text-align: center;" 
                                placeholder="Количество"
                                min="1"
                                onchange="checkQuantity(this.value)">
                        </div>
                    `;
                    // Кнопка отправки скрыта по умолчанию
                    document.getElementById('sendButton').style.display = 'none';
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

    // Добавим функцию проверки количества
    function checkQuantity(value) {
        const sendButton = document.getElementById('sendButton');
        if (value && parseInt(value) > 0) {
            sendButton.style.display = 'block';
        } else {
            sendButton.style.display = 'none';
        }
    }

    // Изменим функцию отправки данных
    async function sendToGoogleSheets(qrData) {
        const quantity = document.getElementById('quantityInput').value;
        
        // Проверяем наличие количества
        if (!quantity || parseInt(quantity) <= 0) {
            document.getElementById('result').textContent += '\nВведите количество!';
            return;
        }

        const timestamp = formatDate(new Date());
        
        try {
            debugLog('Отправляем данные:', { timestamp, qrData, quantity });

            const url = new URL('https://script.google.com/macros/s/AKfycbwzqhUYemEJ7c5CqWFdXigckQUvP7g167U8Fl25VU4ruJXZ5LKX_gj4rWN29RxjI9UvCg/exec');
            url.searchParams.append('timestamp', timestamp);
            url.searchParams.append('qrData', qrData);
            url.searchParams.append('quantity', quantity);

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

    // Изменим функцию сохранения в историю
    function saveToHistory(qrData, timestamp) {
        const quantity = document.getElementById('quantityInput')?.value;
        if (quantity && parseInt(quantity) > 0) {
            const history = JSON.parse(localStorage.getItem('scan_history') || '[]');
            history.push({ qrData, timestamp, quantity });
            localStorage.setItem('scan_history', JSON.stringify(history));
        }
    }

    document.getElementById('historyButton').addEventListener('click', () => {
        window.location.href = 'history.html';
    });
} 
