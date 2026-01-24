# Hướng dẫn Deploy Agri-Loop Backend lên VPS

## 1. Yêu cầu VPS (Prerequisites)
- **OS**: Ubuntu 20.04 / 22.04 LTS (Khuyên dùng)
- **Node.js**: v18.17+ hoặc v20.x
- **Git**: Đã cài đặt
- **Quyền Root/Sudo**

## 2. Cách Deploy nhanh (One-Liner)

SSH vào VPS và chạy lệnh sau (Tự động Clone, Install, Build & Setup PM2):

```bash
bash <(curl -s https://raw.githubusercontent.com/Miho1254/delta-next-ydcc2025/master/backend/deploy/deploy.sh)
```

⚠️ **Lưu ý trong quá trình chạy script:**
Script sẽ dừng lại và mở trình soạn thảo `nano` để bạn chỉnh sửa file `.env`. Hãy điền các thông tin sau:
- `DATABASE_URL` (Supabase Transaction Pooler)
- `JWT_SECRET`
- `GEMINI_API_KEY`
- `SUPABASE_URL` & `SECRET_KEY`

Sau khi sửa xong: Bấm `Ctrl+X` -> `Y` -> `Enter` để lưu và thoát.

## 3. Cấu hình Domain & SSL (Apache2)

Sau khi backend đã chạy ở port `3001` (check bằng `pm2 status`), bạn cần cấu hình Apache để trỏ domain vào.

### Bước 1: Setup Apache Config
```bash
# Copy file config mẫu
sudo cp /var/www/agri-loop/backend/deploy/apache-vhost.conf /etc/apache2/sites-available/agri-loop.conf

# Edit file để thay đổi domain của bạn
sudo nano /etc/apache2/sites-available/agri-loop.conf
# Thay YOUR_DOMAIN bằng domain thật (vd: api.myagri.com)
```

### Bước 2: Enable Site
```bash
sudo a2enmod proxy proxy_http ssl rewrite headers
sudo a2ensite agri-loop.conf
sudo systemctl reload apache2
```

### Bước 3: Cài SSL (HTTPS)
```bash
sudo apt install certbot python3-certbot-apache
sudo certbot --apache -d api.yourdomain.com
```

## 4. Troubleshooting

- **Xem log backend**: `pm2 logs agri-loop-api`
- **Restart**: `pm2 restart agri-loop-api`
- **Update code mới**: Chạy lại lệnh deploy ở Bước 2.
