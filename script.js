const input = document.getElementById("barcodeInput");
const qrContainer = document.getElementById("qrContainer");
const boxCount = document.getElementById("boxCount");
const modeBtn = document.getElementById("modeBtn");
const cameraBtn = document.getElementById("cameraBtn");
const reader = document.getElementById("reader");

let confirmedBoxes = [];
let mode = "scanner"; // scanner | camera
let html5Qr = null;

// ENTER / Scanner Gun
input.addEventListener("keydown", (e) => {
    if (mode !== "scanner") return;

    if (e.key === "Enter") {
        handleInput(input.value);
        e.preventDefault();
    }
});

// Process input
function handleInput(value) {
    let text = value.trim();
    if (!text) return;

    text = text.replace(/-/g, "");

    let boxes = text.split("|").map(b => b.trim()).filter(b => b);

    boxes.forEach(box => {
        if (!confirmedBoxes.includes(box)) {
            confirmedBoxes.push(box);
        }
    });

    input.value = confirmedBoxes.join("|") + "|";
    boxCount.textContent = confirmedBoxes.length;

    generateQR();
}

// QR generation (REAL CR)
function generateQR() {
    qrContainer.innerHTML = "";
    const qrData = confirmedBoxes.join("\r");

    new QRCode(qrContainer, {
        text: qrData,
        width: 260,
        height: 260
    });
}

// Clear
function clearInput() {
    input.value = "";
    qrContainer.innerHTML = "";
    confirmedBoxes = [];
    boxCount.textContent = 0;
    stopCamera();
}

// MODE SWITCH
function toggleMode() {
    if (mode === "scanner") {
        mode = "camera";
        modeBtn.textContent = "Mode: Phone Camera";
        cameraBtn.style.display = "inline-block";
        reader.style.display = "block";
        input.blur();
    } else {
        mode = "scanner";
        modeBtn.textContent = "Mode: Scanner Gun";
        cameraBtn.style.display = "none";
        reader.style.display = "none";
        stopCamera();
        input.focus();
    }
}

// CAMERA
function startCamera() {
    if (html5Qr) return;

    html5Qr = new Html5Qrcode("reader");

    html5Qr.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
            handleInput(decodedText);
        }
    ).catch(err => {
        console.error(err);
        alert("Camera error");
    });
}

function stopCamera() {
    if (html5Qr) {
        html5Qr.stop().then(() => {
            html5Qr.clear();
            html5Qr = null;
        });
    }
}
