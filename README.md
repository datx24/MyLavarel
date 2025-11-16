# Dekey — Web bán đồ điện tử

> **Laravel (API) + Next.js (Frontend)**

---

## 🚀 Tổng quan

**Dekey** là một ứng dụng thương mại điện tử bán thiết bị điện tử (phụ kiện, thiết bị thông minh, phụ kiện ô tô, v.v.).

* **Backend:** PHP Laravel (REST API)
* **Frontend:** Next.js (React) — SSR/SSG, SEO tốt
* **DB:** MySQL 
* **Mục tiêu:** MVP có giỏ hàng, thanh toán (gateway), quản trị sản phẩm, user authentication, và tích hợp CMS cơ bản.

---


## ✨ Tính năng chính

* Quản lý sản phẩm (CRUD)
* Danh mục, filter & tìm kiếm
* Giỏ hàng & checkout
* Xử lý đơn hàng (Admin)
* Hình ảnh sản phẩm (upload / CDN)
* Trang quản trị đơn giản (Admin UI)
* Tối ưu SEO & performance cho Next.js

---

## 🛠️ Yêu cầu môi trường

* PHP >= 8.1
* Composer
* Node.js >= 18
* pnpm / npm / yarn
* MySQL hoặc MariaDB
* Redis (tùy chọn, cho cache / queue)
* Docker (tùy chọn — gợi ý file `docker-compose.yml` có sẵn)

---

## ⚙️ Cài đặt nhanh (Local)

### 1) Backend (Laravel)

```bash
cd backend
cp .env.example .env
# chỉnh DB credentials trong .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve --http://127.0.0.1:8000
```

> API mặc định chạy tại: `http://127.0.0.1:8000`

### 2) Frontend (Next.js)

```bash
cd frontend
cp .env.local.example .env.local
# cấu hình NEXT_PUBLIC_API_URL = http://localhost:8000
npm install
npm run dev
```

> Frontend mặc định chạy tại: `http://localhost:3000`

---

## 🔐 Biến môi trường 

**backend/.env**

```
APP_NAME=Dekey
APP_ENV=local
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=dekey_db
DB_USERNAME=root
DB_PASSWORD=
JWT_SECRET=your_jwt_secret
FILESYSTEM_DRIVER=public
```

**frontend/.env.local**

```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_CLOUDINARY_URL=...
```

---

## 📦 API chính (ví dụ)

* `POST /api/auth/login` — Đăng nhập
* `POST /api/auth/register` — Đăng ký
* `GET /api/products` — Lấy danh sách sản phẩm
* `GET /api/products/{slug}` — Chi tiết sản phẩm
* `POST /api/cart` — Thêm vào giỏ
* `POST /api/orders` — Tạo đơn hàng
* `GET /api/admin/orders` — (Admin) Danh sách đơn

---

## 🧩 Thiết kế & Kiến trúc

* **Backend**: Laravel API thuần, Service → Repository pattern (tách business logic), Events & Jobs cho xử lý async.
* **Frontend**: Next.js, React Hooks, SWR/React Query cho data-fetching, component-driven design.
* **Auth**: Laravel Sanctum hoặc JWT cho SPA/Next.js.
* **File storage**: Sử dụng `storage/app/public` khi local, hoặc Cloud storage (S3/Cloudinary) khi production.

---

## 🚢 Triển khai (gợi ý)

* **Dockerize** cả backend & frontend. Sử dụng `nginx` làm reverse proxy.
* **CI/CD:** GitHub Actions/GitLab CI — pipeline: lint → test → build → deploy.
* **Hosting:** Backend: VPS / DigitalOcean / Render; Frontend: Vercel / Netlify.
* **DB backup & migrations:** tự động hóa migration & backup trước deploy.

---

## 🧭 Roadmap (Đang làm)

1. Tích hợp cổng thanh toán (VNPay, Stripe)
2. Multi-warehouse & logistics integration
3. Notification (Email, SMS, Push)
4. Realtime order status với WebSocket
5. Analytics & dashboard bán hàng

---

## 📸 Giao diện

> Thêm ảnh giao diện: `docs/screenshots/home.png`, `docs/screenshots/product.png`, `docs/screenshots/admin.png`.

---
