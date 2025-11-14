FROM php:8.2-fpm

# Cài extension cần cho Laravel
RUN apt-get update && apt-get install -y \
    zip unzip curl \
    libpng-dev libonig-dev libxml2-dev \
    && docker-php-ext-install pdo pdo_mysql mbstring gd

# Cài Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy source Laravel
WORKDIR /var/www
COPY . .

# Cài vendor
RUN composer install --no-interaction

# Set quyền
RUN chown -R www-data:www-data /var/www/storage

EXPOSE 9000
CMD ["php-fpm"]
