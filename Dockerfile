# ============================================
# Stage 1: Build frontend assets (Node.js)
# ============================================
FROM node:20-slim AS frontend

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY vite.config.ts tsconfig.json tailwind.config.ts ./
COPY resources/ resources/
RUN npm run build

# ============================================
# Stage 2: PHP 8.4 + Nginx (Production)
# ============================================
FROM php:8.4-fpm AS production

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git curl zip unzip libpng-dev libjpeg-dev libfreetype6-dev \
    libonig-dev libxml2-dev libzip-dev \
    nginx \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip opcache

# Install Redis extension (optional)
RUN pecl install redis && docker-php-ext-enable redis

# PHP config overrides
RUN { \
    echo 'upload_max_filesize = 10M'; \
    echo 'post_max_size = 12M'; \
    echo 'memory_limit = 256M'; \
    echo 'max_execution_time = 60'; \
    } > /usr/local/etc/php/conf.d/laravel.ini

WORKDIR /var/www/html

# Copy composer files and install
COPY composer.json composer.lock ./
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer \
    && composer install --no-dev --no-scripts --no-autoloader --prefer-dist \
    && composer dump-autoload --optimize --no-dev

# Copy application code
COPY . .

# Copy built frontend assets from stage 1
COPY --from=frontend /app/public/build/ public/build/

# Copy Nginx config
COPY docker/nginx.conf /etc/nginx/sites-available/default

# Storage and cache permissions
RUN chown -R www-data:www-data storage bootstrap/cache upload public/build \
    && chmod -R 775 storage bootstrap/cache upload

# Copy entrypoint
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
