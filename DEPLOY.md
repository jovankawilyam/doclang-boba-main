# Deploy Doclang Boba ke Railway

## Prasyarat

- Akun Railway (https://railway.app)
- Railway CLI (opsional): `npm i -g @railway/cli`
- Git repo sudah di-push ke GitHub

## Step 1: Buat MySQL Database di Railway

1. Login ke https://railway.app
2. Klik **New Project** → **MySQL**
3. Catat connection info:
   - `MYSQLHOST`
   - `MYSQLPORT`
   - `MYSQLDATABASE`
   - `MYSQLUSER`
   - `MYSQLPASSWORD`
4. Di tab **Data**, klik **Connect** → copy `MYSQL_URL`

## Step 2: Deploy Laravel App

1. Dari project yang sama, klik **New Service** → **GitHub Repo**
2. Pilih repo `doclang-boba-main`
3. Railway otomatis detect `Dockerfile`
4. Tab **Settings**:
   - Build Command: `docker build -t app .`
   - Start Command: (biarkan default dari Dockerfile)
   - Port: `80`
5. Tab **Variables**, tambahkan:

```
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:ISI_KEY_DISINI
APP_URL=https://nama-app.up.railway.app
DB_CONNECTION=mysql
DB_HOST=MYSQLHOST_dari_step_1
DB_PORT=3306
DB_DATABASE=MYSQLDATABASE_dari_step_1
DB_USERNAME=MYSQLUSER_dari_step_1
DB_PASSWORD=MYSQLPASSWORD_dari_step_1
WA_GATEWAY_URL=https://nama-wa-gateway.up.railway.app/api/send-message
WA_GATEWAY_STATUS_URL=https://nama-wa-gateway.up.railway.app/api/admin/status
WA_GATEWAY_QR_URL=https://nama-wa-gateway.up.railway.app/api/admin/qr
WA_GATEWAY_PAIRING_CODE_URL=https://nama-wa-gateway.up.railway.app/api/admin/pairing-code
WA_GATEWAY_RECONNECT_URL=https://nama-wa-gateway.up.railway.app/api/admin/reconnect
WA_GATEWAY_TOKEN=token_acak_disini
QUEUE_CONNECTION=database
SESSION_DRIVER=database
CACHE_STORE=database
```

6. Generate APP_KEY:
   ```bash
   php -r "echo 'base64:' . base64_encode(random_bytes(32));"
   ```

## Step 3: Deploy WhatsApp Gateway

1. Di project yang sama, klik **New Service** → **GitHub Repo**
2. Pilih **Same Repo** tapi set **Root Directory** ke `/whatsapp-gateway`
3. Railway detect `whatsapp-gateway/Dockerfile`
4. Tab **Variables**:
```
WA_GATEWAY_TOKEN=sama_dengan_step_2
PORT=3001
```
5. **Important**: Add Persistent Volume
   - Tab **Settings** → **Volumes**
   - Mount Path: `/app/.wwebjs_auth`
   - Ini menyimpan session WhatsApp supaya tidak perlu scan QR ulang

## Step 4: Setup Queue Worker

Di service Laravel, tab **Settings** → **Deploy**:

Add deploy command:
```bash
php artisan migrate --force && php artisan config:cache && php artisan route:cache
```

Railway tidak support Procfile langsung, jadi queue worker perlu dijadikan service terpisah:

1. **New Service** → **GitHub Repo** (repo yang sama)
2. Set **Root Directory** ke `/` (root)
3. Override **Start Command**:
   ```bash
   php artisan queue:work --sleep=3 --tries=3 --max-time=3600
   ```
4. Copy semua environment variables dari service Laravel

## Step 5: Custom Domain (Opsional)

1. Tab **Settings** → **Networking** → **Custom Domain**
2. Tambah domain kamu
3. Update `APP_URL` di env variables

## Step 6: Generate APP_KEY & Migrate

Buka terminal di Railway (tab **Deployments** → klik latest → **View Logs**):

```bash
php artisan key:generate
php artisan migrate --force
php artisan storage:link
```

Atau jalankan via Railway CLI:
```bash
railway run php artisan key:generate
railway run php artisan migrate --force
```

## Monitoring

- **Logs**: Tab **Deployments** di setiap service
- **Metrics**: Tab **Metrics** untuk CPU/Memory usage
- **Database**: Tab **Data** di MySQL service

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| App crash | Cek logs di Deployments tab |
| WhatsApp QR expired | Restart wa-gateway service |
| Database connection failed | Cek env variables DB_HOST/DB_PORT/DB_* |
| 502 Bad Gateway | App belum start, tunggu 1-2 menit |
| Queue not processing | Cek queue worker service logs |

## Biaya

Railway free tier: **$5 credit/bulan** (cukup untuk project kecil)

- Laravel app: ~$1-2/bulan
- WhatsApp gateway: ~$2-3/bulan (butuh Chromium/RAM lebih)
- MySQL: ~$1/bulan
