let qr = null;
let confirmedBoxes = []; // массив подтверждённых коробок
const input = document.getElementById("barcodeInput");
const qrContainer = document.getElementById("qrContainer");
const boxCount = document.getElementById("boxCount");
const cameraBtn = document.getElementById("cameraBtn");
const cameraOverlay = document.getElementById("cameraOverlay");
let html5QrCode;

// Обработка ввода после Enter (ручной ввод или ScannerGun)
input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        addBoxesFromInput();
        e.preventDefault();
    }
});

// Кнопка Clear
function clearInput() {
    input.value = "";
    qrContainer.innerHTML = "";
    confirmedBoxes = [];
    boxCount.textContent = 0;
}

// Добавление новых коробок из поля
function addBoxesFromInput() {
    let text = input.value.trim();
    if (!text) return;

    text = text.replace(/-/g, "");
    let newBoxes = text.split("|").map(b => b.trim()).filter(b => b);
    newBoxes.forEach(box => {
        if (box && !confirmedBoxes.includes(box)) {
            confirmedBoxes.push(box);
        }
    });

    // Обновляем поле ввода с авто-вставкой "|" в конце
    input.value = confirmedBoxes.join("|") + "|";
    boxCount.textContent = confirmedBoxes.length;

    // Генерация QR локально (для проверки)
    generateQR(confirmedBoxes.join("\r"));
}

// Генерация QR локально
function generateQR(text) {
    qrContainer.innerHTML = "";
    qr = new QRCode(qrContainer, {
        text: text,
        width: 260,
        height: 260
    });
}

// Кнопка камеры
cameraBtn.addEventListener("click", () => {
    openCamera();
});

function openCamera() {
cameraOverlay.style.display = "flex";
html5QrCode = new Html5Qrcode("reader");

setTimeout(() => {
    Html5Qrcode.getCameras().then(cameras => {
        if (cameras && cameras.length) {
            html5QrCode.start(
                cameras[0].id,
                { fps: 10, qrbox: 250 },
                qrText => {
                    input.value = qrText;
                    addBoxesFromInput();
                }
            );
        } else {
            alert("Камера не найдена");
        }
    }).catch(err => {
        console.error(err);
        alert("Ошибка при доступе к камере");
    });
}, 100); // 100 мс задержка
}

function closeCamera() {
    cameraOverlay.style.display = "none";
    if (html5QrCode) {
        html5QrCode.stop().then(() => {
            html5QrCode.clear();
        });
    }
}
