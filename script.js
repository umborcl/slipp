const input = document.getElementById("barcodeInput");
const qrContainer = document.getElementById("qrContainer");
const boxCount = document.getElementById("boxCount");
const cameraBox = document.getElementById("cameraBox");
const cameraBtn = document.getElementById("cameraBtn");
const modeBtn = document.getElementById("modeBtn");

let confirmedBoxes = [];
let mode = "scanner"; // scanner | phone
let qrCamera = null;
let cameraActive = false;

/* ---------- Scanner Gun mode ---------- */
input.addEventListener("keydown", (e) => {
    if (mode !== "scanner") return;

    if (e.key === "Enter") {
        e.preventDefault();
        processInput(input.value);
    }
});

/* ---------- Общая обработка ---------- */
function processInput(text) {
    text = text.trim();
    if (!text) return;

    // убираем "-"
    text = text.replace(/-/g, "");

    // разбиваем по |
    const boxes = text.split("|").map(b => b.trim()).filter(Boolean);

    boxes.forEach(box => {
        if (!confirmedBoxes.includes(box)) {
            confirmedBoxes.push(box);
        }
    });

    updateUI();
}

/* ---------- UI ---------- */
function updateUI() {
    input.value = confirmedBoxes.join("|") + "|";
    boxCount.textContent = confirmedBoxes.length;

    // настоящий Carriage Return
    const qrData = confirmedBoxes.join("\r");

    qrContainer.innerHTML =
        `<img src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrData)}" alt="QR">`;
}

/* ---------- Переключение режима ---------- */
function toggleMode() {
    stopCamera();

    if (mode === "scanner") {
        mode = "phone";
        modeBtn.textContent = "📱 Phone Camera";
        cameraBtn.classList.remove("hidden");
    } else {
        mode = "scanner";
        modeBtn.textContent = "🔫 Scanner Gun";
        cameraBtn.classList.add("hidden");
    }
}

/* ---------- Камера ---------- */
function toggleCamera() {
    if (cameraActive) {
        stopCamera();
    } else {
        startCamera();
    }
}

function startCamera() {
    cameraActive = true;
    cameraBtn.textContent = "❌ Close Camera";

    cameraBox.innerHTML = `<div id="reader" style="width:100%;"></div>`;

    // КРИТИЧЕСКИ ВАЖНО для Android
    setTimeout(() => {
        qrCamera = new Html5Qrcode("reader");

        qrCamera.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: 250 },
            (decodedText) => {
                processInput(decodedText);
            }
        );
    }, 300);
}

function stopCamera() {
    cameraActive = false;
    cameraBtn.textContent = "📷 Camera";

    if (qrCamera) {
        qrCamera.stop().then(() => {
            cameraBox.innerHTML = "";
        }).catch(() => {});
        qrCamera = null;
    }
}

/* ---------- Очистка ---------- */
function clearInput() {
    confirmedBoxes = [];
    input.value = "";
    qrContainer.innerHTML = "";
    boxCount.textContent = 0;
    stopCamera();
}
