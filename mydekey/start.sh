#!/bin/sh
# start.sh - chạy Laravel trên Railway

# Cài đặt composer nếu cần (Railway đôi khi build container mới)
composer install --no-dev --optimize-autoloader

# Chạy migration nếu muốn tự động tạo bảng DB
php artisan migrate --force

# Serve Laravel trên host 0.0.0.0 và port Railway cấp
php artisan serve --host=0.0.0.0 --port=$PORT
