let tg = window.Telegram.WebApp;
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

async function sendToGoogleSheets(qrData) {
    const timestamp = new Date().toISOString();
    
    try {
        console.log('Отправляем данные:', { timestamp, qrData });

        const response = await fetch('https://script.google.com/macros/s/AKfycbwtade14oC_eU7tmCxea1dtus_4J7HsEgf9SEwv5_FmjACMKrz5eFhjkoa3tLi4XKz6lQ/exec', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            mode: 'cors',
            body: JSON.stringify({
                timestamp: timestamp,
                qrData: qrData
            })
        });

        console.log('Ответ сервера:', response);

        const responseData = await response.text();
        console.log('Данные ответа:', responseData);

        if (!response.ok) {
            throw new Error(`Ошибка при отправке данных: ${response.status} ${responseData}`);
        }

        document.getElementById('result').textContent += '\nДанные успешно сохранены!';
        document.getElementById('sendButton').style.display = 'none';
        lastScannedData = null;
        lastCode = null;
    } catch (error) {
        console.error('Полная ошибка:', error);
        document.getElementById('result').textContent += `\nОшибка при сохранении данных: ${error.message}`;
    }
} 
