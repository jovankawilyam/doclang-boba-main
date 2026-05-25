require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const express = require('express');
const QRCode = require('qrcode');
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '127.0.0.1';
const CHROME_PATH =
  process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const GATEWAY_TOKEN = process.env.WA_GATEWAY_TOKEN || '';

let isClientReady = false;
let isInitializing = false;
let isReconnecting = false;
let currentQrDataUrl = null;
let qrGeneratedAt = null;
let currentPairingCode = null;
let pairingPhoneNumber = null;
let pairingGeneratedAt = null;
let lastReadyAt = null;

app.use(express.json());

const client = new Client({
  // LocalAuth menyimpan session ke folder .wwebjs_auth agar QR tidak perlu discan ulang
  // selama folder tersebut tidak dihapus dan nomor WA tidak logout dari perangkat tertaut.
  authStrategy: new LocalAuth({
    clientId: 'doclang-boba',
  }),
  puppeteer: {
    headless: true,
    executablePath: CHROME_PATH,
    args: [
      // Argumen ini membantu saat service dijalankan di Linux server/container.
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
  },
});

function normalizePhoneNumber(phone) {
  if (phone === null || phone === undefined) {
    throw new Error('Nomor HP wajib diisi.');
  }

  const originalPhone = String(phone).trim();

  if (originalPhone === '') {
    throw new Error('Nomor HP tidak boleh kosong.');
  }

  // Hapus suffix WhatsApp jika caller tidak sengaja mengirim format siap pakai.
  let normalized = originalPhone.replace(/@c\.us$/i, '');

  // Ambil angka saja agar input seperti "+62 812-3456-7890" tetap bisa diproses.
  normalized = normalized.replace(/\D/g, '');

  // 08xxxxxxxx -> 628xxxxxxxx
  if (normalized.startsWith('08')) {
    normalized = `62${normalized.slice(1)}`;
  }

  // 6208xxxxxxxx atau 0628xxxxxxxx biasanya hasil input dobel prefix.
  while (normalized.startsWith('6208')) {
    normalized = `628${normalized.slice(4)}`;
  }

  if (normalized.startsWith('062')) {
    normalized = normalized.slice(1);
  }

  // 8xxxxxxxx -> 628xxxxxxxx sebagai fallback aman untuk nomor Indonesia.
  if (normalized.startsWith('8')) {
    normalized = `62${normalized}`;
  }

  if (!normalized.startsWith('62')) {
    throw new Error('Nomor HP harus diawali 08, +62, atau 62.');
  }

  if (!/^62\d{8,15}$/.test(normalized)) {
    throw new Error('Format nomor HP tidak valid. Gunakan contoh: 081234567890 atau +6281234567890.');
  }

  return normalized;
}

function sanitizePhoneNumber(phone) {
  // Format wajib untuk chat WhatsApp personal di whatsapp-web.js.
  return `${normalizePhoneNumber(phone)}@c.us`;
}

function getGatewayStatus() {
  return {
    ready: isClientReady && Boolean(client.info),
    isClientReady,
    hasClientInfo: Boolean(client.info),
    wid: client.info?.wid?._serialized || null,
    pushname: client.info?.pushname || null,
    hasQr: Boolean(currentQrDataUrl),
    qrGeneratedAt,
    lastReadyAt,
    isReconnecting,
  };
}

function clearPairingCode() {
  currentPairingCode = null;
  pairingPhoneNumber = null;
  pairingGeneratedAt = null;
}

function requireGatewayToken(req, res, next) {
  if (GATEWAY_TOKEN && req.get('authorization') !== `Bearer ${GATEWAY_TOKEN}`) {
    return res.status(401).json({
      success: false,
      error: 'Token gateway tidak valid.',
    });
  }

  return next();
}

function initializeClient() {
  if (isInitializing) {
    return;
  }

  isInitializing = true;
  client
    .initialize()
    .catch((error) => {
      console.error('Gagal memulai WhatsApp Gateway:', error);
    })
    .finally(() => {
      isInitializing = false;
      isReconnecting = false;
    });
}

client.on('qr', async (qr) => {
  isClientReady = false;
  try {
    currentQrDataUrl = await QRCode.toDataURL(qr, { margin: 2, width: 320 });
    qrGeneratedAt = new Date().toISOString();
  } catch (error) {
    currentQrDataUrl = null;
    qrGeneratedAt = null;
    console.error('Gagal membuat gambar QR WhatsApp:', error);
  }
  console.log('\nScan QR code berikut dengan WhatsApp di HP Anda:\n');
  qrcode.generate(qr, { small: true });
});

client.on('authenticated', () => {
  console.log('WhatsApp berhasil diautentikasi. Session tersimpan di .wwebjs_auth.');
});

client.on('code', (code) => {
  currentPairingCode = code;
  pairingGeneratedAt = new Date().toISOString();
});

client.on('ready', () => {
  isClientReady = true;
  currentQrDataUrl = null;
  qrGeneratedAt = null;
  clearPairingCode();
  lastReadyAt = new Date().toISOString();
  console.log('WhatsApp Gateway siap mengirim pesan.');
});

client.on('auth_failure', (message) => {
  isClientReady = false;
  console.error('Autentikasi WhatsApp gagal:', message);
});

client.on('disconnected', (reason) => {
  isClientReady = false;
  console.warn('WhatsApp terputus:', reason);

  if (isReconnecting) {
    return;
  }

  // Inisialisasi ulang agar service mencoba tersambung lagi setelah disconnect.
  initializeClient();
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    whatsapp: getGatewayStatus(),
  });
});

app.get('/api/admin/status', requireGatewayToken, (req, res) => {
  res.json({
    online: true,
    whatsapp: getGatewayStatus(),
  });
});

app.get('/api/admin/qr', requireGatewayToken, (req, res) => {
  if (!currentQrDataUrl) {
    return res.status(404).json({
      error: 'QR belum tersedia. Gateway mungkin sudah terhubung atau masih memulai.',
    });
  }

  return res.json({
    qrDataUrl: currentQrDataUrl,
    generatedAt: qrGeneratedAt,
  });
});

app.post('/api/admin/pairing-code', requireGatewayToken, async (req, res) => {
  if (getGatewayStatus().ready) {
    return res.status(409).json({
      success: false,
      error: 'WhatsApp masih terhubung. Putuskan koneksi lama sebelum meminta kode tautan.',
    });
  }

  try {
    const phoneNumber = normalizePhoneNumber(req.body.phone);
    pairingPhoneNumber = phoneNumber;
    const pairingCode = await client.requestPairingCode(phoneNumber);
    currentPairingCode = pairingCode;
    pairingGeneratedAt = new Date().toISOString();

    return res.json({
      success: true,
      pairingCode: currentPairingCode,
      phoneNumber: pairingPhoneNumber,
      generatedAt: pairingGeneratedAt,
    });
  } catch (error) {
    console.error('Gagal membuat kode tautan WhatsApp:', error);

    return res.status(422).json({
      success: false,
      error: error.message || 'Gagal membuat kode tautan WhatsApp.',
    });
  }
});

app.get('/api/admin/pairing-code', requireGatewayToken, (req, res) => {
  if (!currentPairingCode) {
    return res.status(404).json({
      error: 'Kode tautan belum diminta atau sudah tidak aktif.',
    });
  }

  return res.json({
    success: true,
    pairingCode: currentPairingCode,
    phoneNumber: pairingPhoneNumber,
    generatedAt: pairingGeneratedAt,
  });
});

app.post('/api/admin/reconnect', requireGatewayToken, async (req, res) => {
  if (isReconnecting) {
    return res.status(409).json({
      success: false,
      error: 'Proses penggantian nomor WhatsApp sedang berjalan.',
    });
  }

  isReconnecting = true;
  isClientReady = false;
  currentQrDataUrl = null;
  qrGeneratedAt = null;
  clearPairingCode();

  try {
    await client.logout();
    initializeClient();

    return res.status(202).json({
      success: true,
      message: 'Sesi WhatsApp lama diputus. Menunggu QR untuk nomor baru.',
    });
  } catch (error) {
    isReconnecting = false;
    console.error('Gagal memutus sesi WhatsApp lama:', error);

    return res.status(500).json({
      success: false,
      error: error.message || 'Gagal memutus koneksi WhatsApp lama.',
    });
  }
});

app.post('/api/send-message', requireGatewayToken, async (req, res) => {
  const requestId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  try {
    const { phone, message } = req.body;

    console.log(`[WA:${requestId}] Payload masuk dari Laravel:`, {
      phone,
      message,
      bodyKeys: Object.keys(req.body || {}),
      receivedAt: new Date().toISOString(),
    });

    if (!message || typeof message !== 'string' || !message.trim()) {
      console.warn(`[WA:${requestId}] Payload ditolak: message kosong atau bukan string.`);

      return res.status(400).json({
        success: false,
        error: 'Message wajib diisi dalam format string.',
      });
    }

    const gatewayStatus = getGatewayStatus();

    if (!gatewayStatus.ready) {
      console.warn(`[WA:${requestId}] Gateway belum siap:`, gatewayStatus);

      return res.status(503).json({
        success: false,
        error: 'Gateway belum siap. Scan QR atau tunggu koneksi WhatsApp selesai.',
        status: gatewayStatus,
      });
    }

    const chatId = sanitizePhoneNumber(phone);
    console.log(`[WA:${requestId}] Nomor setelah sanitasi:`, {
      originalPhone: phone,
      chatId,
    });

    // Cek apakah nomor terdaftar di WhatsApp sebelum mengirim pesan.
    const isRegistered = await client.isRegisteredUser(chatId);

    if (!isRegistered) {
      console.warn(`[WA:${requestId}] Nomor tidak terdaftar di WhatsApp:`, chatId);

      return res.status(422).json({
        success: false,
        error: 'Nomor tujuan tidak terdaftar di WhatsApp.',
      });
    }

    const result = await client.sendMessage(chatId, message.trim());

    console.log(`[WA:${requestId}] Pesan berhasil dikirim:`, {
      to: chatId,
      messageId: result.id.id,
    });

    return res.json({
      success: true,
      message: 'Pesan berhasil dikirim.',
      data: {
        to: chatId,
        messageId: result.id.id,
      },
    });
  } catch (error) {
    console.error(`[WA:${requestId}] Gagal mengirim pesan:`, error);

    return res.status(500).json({
      success: false,
      error: error.message || 'Terjadi kesalahan saat mengirim pesan.',
    });
  }
});

app.listen(PORT, HOST, () => {
  console.log(`WhatsApp Gateway berjalan di http://${HOST}:${PORT}`);
});

initializeClient();
