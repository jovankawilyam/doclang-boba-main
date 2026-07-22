web: php artisan migrate --force && nginx -g 'daemon off;'
worker: php artisan queue:work --sleep=3 --tries=3 --max-time=3600
