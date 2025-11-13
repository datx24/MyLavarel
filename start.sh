#!/bin/bash

# Vào folder Laravel
cd mydekey

# Cài dependencies
composer install --no-interaction --prefer-dist

# Tạo key nếu chưa có
php artisan key:generate

# Chạy migrate (nếu muốn)
# php artisan migrate --force

# Serve Laravel bằng built-in server
php -S 0.0.0.0:$PORT -t public
