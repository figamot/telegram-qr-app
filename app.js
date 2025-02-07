let tg = window.Telegram.WebApp;

// Проверяем, запущено ли приложение в Telegram
if (!window.Telegram.WebApp.initData) {
    document.body.innerHTML = '<div style="padding: 20px; text-align: center;">Это приложение работает только в Telegram.<br>Пожалуйста, откройте его через бота в Telegram.</div>';
} else {
    tg.expand();

    let lastScannedData = null;
    let lastCode = null;
    let dataSent = false;
    let isProcessing = false;

    // Получаем данные пользователя из Telegram
    const user = tg.initDataUnsafe?.user || {};
    const userName = user.username || user.first_name || 'Unknown';
    debugLog('Данные пользователя:', user);

    // Очищаем все обработчики MainButton
    tg.MainButton.offClick();
    tg.MainButton.hide();

    // Обновляем обработчик отправки данных
    const sendDataHandler = async () => {
        if (isProcessing || dataSent || !lastScannedData) return;

        const quantityInput = document.getElementById('quantityInput');
        const quantity = quantityInput?.value;
        
        if (!quantity || quantity.trim() === '' || parseInt(quantity) <= 0) {
            document.getElementById('result').textContent = 'Введите количество!';
            return;
        }

        try {
            isProcessing = true;
            tg.MainButton.disable();
            
            const timestamp = formatDate(new Date());
            debugLog('Начало отправки данных:', { timestamp, lastScannedData, quantity, userName });

            const url = new URL('https://script.google.com/macros/s/AKfycbzMB5fY5BI1BdrA8AbCyWfxmvS-Bu6x2CDtD3ACASO3JDqV1BhK8dPsyt-rb9JCgbeBQg/exec');
            url.searchParams.append('timestamp', timestamp);
            url.searchParams.append('qrData', lastScannedData);
            url.searchParams.append('quantity', quantity);
            url.searchParams.append('userName', userName); // Добавляем имя пользователя

            const response = await fetch(url.toString(), {
                method: 'GET',
                mode: 'no-cors'
            });

            debugLog('Данные успешно отправлены');
            
            // Сохраняем в историю с именем пользователя
            saveToHistory(lastScannedData, timestamp, parseInt(quantity), userName);
            
            // Очищаем состояние
            dataSent = true;
            lastScannedData = null;
            lastCode = null;
            
            document.getElementById('result').textContent = 'Данные отправлены! Отсканируйте новый QR-код.';
            tg.MainButton.hide();

        } catch (error) {
            debugLog('Ошибка при отправке:', error);
            document.getElementById('result').textContent = 'Ошибка при отправке данных. Попробуйте еще раз.';
        } finally {
            isProcessing = false;
            tg.MainButton.enable();
        }
    };

    // Обновляем функцию сохранения в историю
    function saveToHistory(qrData, timestamp, quantity, userName) {
        debugLog('Сохранение в историю:', { qrData, timestamp, quantity, userName });
        
        try {
            const history = JSON.parse(localStorage.getItem('scan_history') || '[]');
            history.unshift({ 
                qrData: qrData,
                timestamp: timestamp,
                quantity: quantity,
                userName: userName
            });
            localStorage.setItem('scan_history', JSON.stringify(history));
            debugLog('История успешно обновлена');
        } catch (error) {
            debugLog('Ошибка при сохранении в историю:', error);
        }
    }

    // Устанавливаем обработчик один раз
    tg.MainButton.onClick(sendDataHandler);

    function showQRScanner() {
        // Сбрасываем состояние
        dataSent = false;
        isProcessing = false;
        lastScannedData = null;
        lastCode = null;
        
        tg.MainButton.hide();
        
        const par = {
            text: "Наведите камеру на QR код"
        };
        
        tg.showScanQrPopup(par, function(data) {
            if (data) {
                lastScannedData = data;
                lastCode = data;
                
                document.getElementById('result').innerHTML = `
                    <div>Отсканировано: ${data}</div>
                    <div style="margin-top: 15px;">
                        <input type="number" id="quantityInput" 
                            style="background: #242f3d; border: 1px solid #3498db; 
                            color: white; padding: 8px; border-radius: 5px; width: 100px; 
                            text-align: center;" 
                            placeholder="Количество"
                            min="1"
                            oninput="checkQuantity(this.value)"
                            onchange="checkQuantity(this.value)">
                    </div>
                `;
                
                tg.closeScanQrPopup();
            }
        });
    }

    function checkQuantity(value) {
        if (!isProcessing && !dataSent && value && value.trim() !== '' && parseInt(value) > 0) {
            tg.MainButton.text = "Отправить";
            tg.MainButton.show();
        } else {
            tg.MainButton.hide();
        }
    }

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

    // Добавляем обработчик для кнопки логов
    document.getElementById('logsButton').addEventListener('click', () => {
        window.location.href = 'logs.html';
    });

    document.getElementById('scanButton').addEventListener('click', showQRScanner);
    document.getElementById('historyButton').addEventListener('click', () => {
        window.location.href = 'history.html';
    });
    document.getElementById('logsButton').addEventListener('click', () => {
        window.location.href = 'logs.html';
    });
} 