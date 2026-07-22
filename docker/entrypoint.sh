#!/bin/sh
set -e

# Run migrations
php artisan migrate --force

# Create storage link
php artisan storage:link --force 2>/dev/null || true

# Clear and rebuild cache
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Start PHP-FPM in background
docker-php-entrypoint php-fpm &

# Start queue worker in background
php artisan queue:work --sleep=3 --tries=3 --max-time=3600 &

# Start Nginx in foreground
nginx -g "daemon off;"
