const express = require('express');
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '127.0.0.1';
const CHROME_PATH =
  process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

let isClientReady = false;
let isInitializing = false;

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

function sanitizePhoneNumber(phone) {
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

  // Format wajib untuk chat WhatsApp personal di whatsapp-web.js.
  return `${normalized}@c.us`;
}

function getGatewayStatus() {
  return {
    ready: isClientReady && Boolean(client.info),
    isClientReady,
    hasClientInfo: Boolean(client.info),
    wid: client.info?.wid?._serialized || null,
    pushname: client.info?.pushname || null,
  };
}

function initializeClient() {
  if (isInitializing) {
    return;
  }

  isInitializing = true;
  client.initialize().finally(() => {
    isInitializing = false;
  });
}

client.on('qr', (qr) => {
  isClientReady = false;
  console.log('\nScan QR code berikut dengan WhatsApp di HP Anda:\n');
  qrcode.generate(qr, { small: true });
});

client.on('authenticated', () => {
  console.log('WhatsApp berhasil diautentikasi. Session tersimpan di .wwebjs_auth.');
});

client.on('ready', () => {
  isClientReady = true;
  console.log('WhatsApp Gateway siap mengirim pesan.');
});

client.on('auth_failure', (message) => {
  isClientReady = false;
  console.error('Autentikasi WhatsApp gagal:', message);
});

client.on('disconnected', (reason) => {
  isClientReady = false;
  console.warn('WhatsApp terputus:', reason);

  // Inisialisasi ulang agar service mencoba tersambung lagi setelah disconnect.
  initializeClient();
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    whatsapp: getGatewayStatus(),
  });
});

app.post('/api/send-message', async (req, res) => {
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
