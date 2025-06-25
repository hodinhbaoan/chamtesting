// DOMContentLoaded ensures the HTML is loaded before script runs
window.addEventListener('DOMContentLoaded', () => {

  // Store current language
  let currentLang = "en";

  // BLE SCAN (Connect to ESP32, read and show artifact info)
  document.getElementById('bleButton').addEventListener('click', async () => {
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: 'Cham_' }],
        optionalServices: ['12345678-1234-1234-1234-1234567890ab'] // Replace with your actual service UUID
      });

      const server = await device.gatt.connect();
      const service = await server.getPrimaryService('12345678-1234-1234-1234-1234567890ab'); // Match ESP32
      const characteristic = await service.getCharacteristic('abcd'); // Replace with actual characteristic UUID

      const value = await characteristic.readValue();
      const data = new TextDecoder().decode(value);
      const [id, name, desc, audio] = data.split('|');

      document.querySelector('.content').innerHTML = `
        <h2>${name}</h2>
        <p><strong>ID:</strong> ${id}</p>
        <p>${desc}</p>
        <audio controls src="${audio}"></audio>
      `;
    } catch (err) {
      alert("BLE connection failed: " + err);
    }
  });

  // QR SCAN
  let html5QrcodeScanner;

  document.getElementById('qrButton').addEventListener('click', () => {
    const reader = document.getElementById('reader');
    const resultBox = document.getElementById('qr-result');
    reader.style.display = 'block';
    resultBox.textContent = '📷 Point camera to QR code';

    if (html5QrcodeScanner) {
      html5QrcodeScanner.clear();
    }

    html5QrcodeScanner = new Html5Qrcode("reader");

    html5QrcodeScanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
      msg => {
        html5QrcodeScanner.stop().then(() => {
          reader.style.display = 'none';
          resultBox.textContent = '✅ QR recognized, opening...';
          window.location.href = msg;
        });
      },
      err => {
        // Optional: console.log(err);
      }
    ).catch(e => alert('QR scanner error: ' + e));
  });

  // LANGUAGE SYSTEM
  const translations = {
    en: {
      header: "Cham Museum",
      langLabel: "🌐 Choose Language:",
      title: "Welcome!",
      desc: "Tap BLE or QR to get exhibit info.",
      bleButton: "📶 Scan BLE",
      qrButton: "📷 Scan QR"
    },
    vi: {
      header: "Bảo tàng Chăm",
      langLabel: "🌐 Chọn ngôn ngữ:",
      title: "Chào mừng!",
      desc: "Chạm vào BLE hoặc mã QR để xem thông tin hiện vật.",
      bleButton: "📶 Quét BLE",
      qrButton: "📷 Quét mã QR"
    },
    ko: {
      header: "참 박물관",
      langLabel: "🌐 언어 선택:",
      title: "환영합니다!",
      desc: "BLE 또는 QR을 탭하여 전시 정보 보기",
      bleButton: "📶 BLE 스캔",
      qrButton: "📷 QR 스캔"
    },
    zh: {
      header: "占族博物馆",
      langLabel: "🌐 选择语言:",
      title: "欢迎！",
      desc: "点击 BLE 或二维码以获取展品信息",
      bleButton: "📶 扫描 BLE",
      qrButton: "📷 扫描二维码"
    }
  };

  function updateLanguage(lang) {
    currentLang = lang;
    const t = translations[lang] || translations.en;
    document.querySelector('h1').textContent = t.header;
    document.querySelector('label[for="language"]').textContent = t.langLabel;
    document.querySelector('.content').innerHTML = `
      <h2 id="title">${t.title}</h2>
      <p id="desc">${t.desc}</p>
    `;
    document.getElementById('bleButton').textContent = t.bleButton;
    document.getElementById('qrButton').textContent = t.qrButton;
  }

  document.getElementById('language').addEventListener('change', function () {
    updateLanguage(this.value);
  });

  updateLanguage("en"); // Default on load

});
