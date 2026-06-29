# 🚀 PANDUAN DEPLOYMENT DOCLANG BOBA DENGAN NGROK

## Overview
Aplikasi ini berjalan di 3 service terpisah:
- **Laravel (Backend)**: Port 8000
- **Vite (Frontend Dev)**: Port 5173
- **WhatsApp Gateway**: Port 3001

Ngrok akan mengekspos ketiga port ini ke public URLs.

---

## ✅ LANGKAH SETUP (SIAP PAKAI)

### 1️⃣ Prerequisites
Pastikan sudah tersedia:
```bash
✓ ngrok (sudah installed & auth token tersimpan)
✓ PHP 8.4+
✓ Node.js & npm
✓ Composer
✓ Chrome/Chromium (untuk WhatsApp Web)
```

### 2️⃣ Project Setup (First Time Only)
```bash
cd /Users/apple/Code/Portfolio/doclang-boba-main

# Backend
composer install
cp .env.example .env (sudah ada)
php artisan key:generate
php artisan migrate

# Frontend & Gateway
npm install
npm --prefix whatsapp-gateway install
npm run build
```

### 3️⃣ Start All Services (4 Terminals)

**Terminal 1 - Laravel Backend:**
```bash
php artisan serve
# Running on: http://localhost:8000
```

**Terminal 2 - Vite Frontend:**
```bash
npm run dev
# Running on: http://localhost:5173
```

**Terminal 3 - WhatsApp Gateway:**
```bash
npm run wa:start
# Running on: http://localhost:3001
```

**Terminal 4 - Ngrok Tunnel:**
```bash
cd /Users/apple/Code/Portfolio/doclang-boba-main
./ngrok-setup.sh
```

Output akan menampilkan public URLs. Tunggu hingga selesai.

---

## 🌐 PUBLIC URLS

Setelah `ngrok-setup.sh` selesai, Anda akan mendapat URLs seperti:
```
🌐 Application:   https://abc123-def456.ngrok-free.dev
📦 Frontend Dev:  https://xyz789-uvw012.ngrok-free.dev
💬 WhatsApp API:  https://ijk345-lmn678.ngrok-free.dev
```

**Akses dari device lain:**
```
https://abc123-def456.ngrok-free.dev
```

---

## 🔧 KONFIGURASI DETAIL

### .env Variables
```env
# Primary app URL (updated by ngrok-setup.sh)
APP_URL=https://abc123-def456.ngrok-free.dev

# Ngrok public URLs (updated automatically)
NGROK_LARAVEL_URL=https://abc123-def456.ngrok-free.dev
NGROK_VITE_URL=https://xyz789-uvw012.ngrok-free.dev
NGROK_WHATSAPP_URL=https://ijk345-lmn678.ngrok-free.dev

# WhatsApp Gateway URLs (using NGROK_WHATSAPP_URL)
WA_GATEWAY_URL=${NGROK_WHATSAPP_URL}/api/send-message
WA_GATEWAY_STATUS_URL=${NGROK_WHATSAPP_URL}/api/admin/status
WA_GATEWAY_QR_URL=${NGROK_WHATSAPP_URL}/api/admin/qr
WA_GATEWAY_PAIRING_CODE_URL=${NGROK_WHATSAPP_URL}/api/admin/pairing-code
WA_GATEWAY_RECONNECT_URL=${NGROK_WHATSAPP_URL}/api/admin/reconnect
WA_GATEWAY_TOKEN=your_token_here (set in dashboard)
```

### ngrok.yml (sudah di-setup)
File: `~/.ngrok2/ngrok.yml` atau `~/Library/Application Support/ngrok/ngrok.yml`

Berisi 3 tunnels:
- `laravel` → localhost:8000
- `vite` → localhost:5173
- `whatsapp` → localhost:3001

### Vite Config
File: `vite.config.ts` (sudah update)

Menambahkan hosts yang diizinkan:
```typescript
allowedHosts: ['localhost', '127.0.0.1', '.ngrok.io', '.ngrok-free.dev']
```

---

## 🔒 CORS & Security

### Middleware CORS (Laravel)
Sudah dikonfigurasi di:
- `app/Http/Middleware/VerifyCsrfToken.php`
- Mengecualikan: `api/*`, `whatsapp/*`

### WhatsApp Gateway API
Semua endpoint dilindungi dengan Bearer Token:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://ijk345-lmn678.ngrok-free.dev/api/admin/status
```

---

## 🐛 TROUBLESHOOTING

### URL ngrok berubah setiap restart?
✅ Ini normal di free plan. Jalankan `./ngrok-setup.sh` lagi untuk update .env.

### Asset Vite tidak loading?
✅ Pastikan vite.config.ts sudah update dengan allowedHosts.
✅ Jalankan: `npm run build` untuk production.

### WhatsApp Gateway error?
✅ Cek token di .env: `WA_GATEWAY_TOKEN`
✅ Cek Chrome path di `whatsapp-gateway/server.js`
✅ Lihat logs: `npm run wa:start` (Terminal 3)

### CORS error?
✅ Request dari Vite ke Laravel? 
   - Pastikan `APP_URL` di .env sudah public ngrok URL
   - Jalankan: `php artisan config:clear`

✅ Request dari Laravel ke WhatsApp?
   - Gunakan `config('whatsapp-gateway.gateway_url')`
   - Atau gunakan env variable: `env('WA_GATEWAY_URL')`

---

## 🎯 BEST PRACTICES

### Development (Localhost)
```bash
./ngrok-setup.sh  # Jika perlu test cross-device
# Atau cukup jalankan 3 services tanpa ngrok
```

### Testing (Public Access)
```bash
# Terminal 1-3: Services seperti biasa
# Terminal 4: 
./ngrok-setup.sh
# Share URL ke tester lain
```

### Production
- Gunakan domain proper, bukan ngrok
- Upgrade ke ngrok pro untuk static domain
- Setup environment variable di hosting provider

---

## 📋 QUICK REFERENCE

| Aksi | Command |
|------|---------|
| Setup ngrok | `./ngrok-setup.sh` |
| Clear Laravel cache | `php artisan config:clear && php artisan cache:clear` |
| Ngrok admin panel | `http://127.0.0.1:4040` |
| Start all services | Buka 4 terminals (lihat Langkah 3) |
| Stop ngrok | Ctrl+C di terminal 4 |

---

## 🚨 IMPORTANT REMINDERS

1. ⚠️ **Never hardcode ngrok URLs** - Selalu gunakan environment variables
2. ⚠️ **Backup .env** - Script membuat ``.env.backup` otomatis
3. ⚠️ **Check services status** - Pastikan semua port berjalan sebelum ngrok
4. ⚠️ **CORS headers** - Sudah dikonfigurasi, tapi verify di browser console

---

## 📞 NEED HELP?

Check logs:
```bash
# Laravel
tail -f storage/logs/laravel.log

# Vite (console output)
# Lihat di Terminal 2

# WhatsApp Gateway
# Lihat di Terminal 3

# Ngrok
curl http://127.0.0.1:4040/api/tunnels | jq .
```

---

**Last Updated:** 2026-06-29  
**Version:** 1.0  
**Status:** Ready for Production
