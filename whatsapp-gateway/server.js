require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const express = require('express');
const QRCode = require('qrcode');
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';
const CHROME_PATH =
  process.env.CHROME_PATH || '/usr/bin/chromium';
const GATEWAY_TOKEN = process.env.WA_GATEWAY_TOKEN || '';
const OPERATION_TIMEOUT = 15000; // 15 seconds timeout for WhatsApp operations

let isClientReady = false;
let isInitializing = false;
let isReconnecting = false;
let currentQrDataUrl = null;
let qrGeneratedAt = null;
let currentPairingCode = null;
let pairingPhoneNumber = null;
let pairingGeneratedAt = null;
let lastReadyAt = null;
let lastHealthCheckAt = null;

app.use(express.json());

const client = new Client({
  authStrategy: new LocalAuth({
    clientId: 'doclang-boba',
  }),
  puppeteer: {
    headless: true,
    executablePath: CHROME_PATH,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-extensions',
      '--disable-plugins',
      '--disable-images',
      '--disable-default-apps',
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

  let normalized = originalPhone.replace(/@c\.us$/i, '');
  normalized = normalized.replace(/\D/g, '');

  if (normalized.startsWith('08')) {
    normalized = `62${normalized.slice(1)}`;
  }

  while (normalized.startsWith('6208')) {
    normalized = `628${normalized.slice(4)}`;
  }

  if (normalized.startsWith('062')) {
    normalized = normalized.slice(1);
  }

  if (normalized.startsWith('8')) {
    normalized = `62${normalized}`;
  }

  if (!normalized.startsWith('62')) {
    throw new Error('Nomor HP harus diawali 08, +62, atau 62.');
  }

  if (!/^62\d{8,15}$/.test(normalized)) {
    throw new Error('Format nomor HP tidak valid.');
  }

  return normalized;
}

function sanitizePhoneNumber(phone) {
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
    lastHealthCheckAt,
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

// Timeout wrapper for WhatsApp operations
function withTimeout(promise, timeoutMs) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Operasi WhatsApp timeout')), timeoutMs)
    ),
  ]);
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
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  isClientReady = true;
  currentQrDataUrl = null;
  qrGeneratedAt = null;
  clearPairingCode();
  lastReadyAt = new Date().toISOString();
  console.log('WhatsApp Gateway siap.');
});

client.on('disconnected', (reason) => {
  isClientReady = false;
  console.warn('WhatsApp terputus:', reason);
  if (!isReconnecting) {
    isReconnecting = true;
    setTimeout(() => initializeClient(), 5000);
  }
});

app.get('/health', (req, res) => {
  lastHealthCheckAt = new Date().toISOString();
  res.json({ status: 'ok', whatsapp: getGatewayStatus() });
});

app.get('/api/admin/status', requireGatewayToken, (req, res) => {
  lastHealthCheckAt = new Date().toISOString();
  res.json({ online: true, whatsapp: getGatewayStatus() });
});

app.get('/api/admin/qr', requireGatewayToken, (req, res) => {
  if (!currentQrDataUrl) {
    return res.status(404).json({ error: 'QR belum tersedia.' });
  }
  return res.json({ qrDataUrl: currentQrDataUrl, generatedAt: qrGeneratedAt });
});

app.post('/api/send-message', requireGatewayToken, async (req, res) => {
  try {
    const { phone, message } = req.body;
    
    if (!phone) {
      return res.status(400).json({ success: false, error: 'Nomor HP wajib diisi.' });
    }
    
    if (!message) {
      return res.status(400).json({ success: false, error: 'Message wajib diisi.' });
    }

    const gatewayStatus = getGatewayStatus();
    if (!gatewayStatus.ready) {
      return res.status(503).json({ 
        success: false, 
        error: 'Gateway belum siap.', 
        status: gatewayStatus 
      });
    }

    try {
      const chatId = sanitizePhoneNumber(phone);
      
      // Check if user is registered with timeout
      console.log(`Checking if ${chatId} is registered...`);
      const isRegistered = await withTimeout(
        client.isRegisteredUser(chatId),
        OPERATION_TIMEOUT
      );
      
      if (!isRegistered) {
        console.warn(`Nomor ${chatId} tidak terdaftar.`);
        return res.status(422).json({ 
          success: false, 
          error: 'Nomor tidak terdaftar.' 
        });
      }

      // Send message with timeout
      console.log(`Sending message to ${chatId}...`);
      const result = await withTimeout(
        client.sendMessage(chatId, message.trim()),
        OPERATION_TIMEOUT
      );
      
      console.log(`Message sent to ${chatId}, ID: ${result.id.id}`);
      return res.json({ 
        success: true, 
        data: { 
          to: chatId, 
          messageId: result.id.id 
        } 
      });
    } catch (error) {
      console.error(`Error sending message to ${phone}:`, error.message);
      
      if (error.message.includes('timeout')) {
        return res.status(504).json({ 
          success: false, 
          error: 'Operasi WhatsApp timeout. Silakan coba lagi.' 
        });
      }
      
      return res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  } catch (error) {
    console.error('Unexpected error in /api/send-message:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

app.listen(PORT, HOST, () => {
  console.log(`WhatsApp Gateway berjalan di http://${HOST}:${PORT}`);
});

initializeClient();

