---
description: Deploy ứng dụng lên Render
---

# Deploy lên Render - Workflow

Workflow này hướng dẫn deploy ứng dụng wedding với Socket.IO lên Render.

## Điều kiện tiên quyết

- Đã có tài khoản GitHub và Render
- Đã cấu hình MongoDB Atlas
- Code đã được test local thành công

## Các bước thực hiện

### 1. Kiểm tra file cấu hình

Đảm bảo các file sau đã tồn tại:
- `render.yaml` - Cấu hình Render
- `.gitignore` - Ignore node_modules và .env
- `package.json` - Dependencies đầy đủ

### 2. Push code lên GitHub

```bash
# Khởi tạo Git (nếu chưa có)
git init

# Thêm tất cả files
git add .

# Commit
git commit -m "Deploy to Render"

# Thêm remote (thay YOUR_USERNAME và YOUR_REPO)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push
git branch -M main
git push -u origin main
```

### 3. Tạo Web Service trên Render

1. Truy cập https://dashboard.render.com/
2. Click **New +** → **Web Service**
3. Kết nối GitHub repository
4. Cấu hình:
   - Name: `my-wedding-app`
   - Region: `Singapore`
   - Branch: `main`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: `Free`

### 4. Cấu hình Environment Variables

Trong tab **Environment**, thêm:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/MyWedding?retryWrites=true&w=majority
PORT=10000
```

> ⚠️ Thay YOUR_PASSWORD và cluster URL bằng thông tin thực tế từ MongoDB Atlas

### 5. Deploy và kiểm tra

- Render sẽ tự động build và deploy
- Theo dõi logs để đảm bảo không có lỗi
- Kiểm tra kết nối MongoDB: `✅ Connected to MongoDB`
- Truy cập URL được cung cấp để test

### 6. Test Socket.IO Realtime

1. Mở 2 tab trình duyệt với cùng URL
2. Gửi comment từ tab 1
3. Kiểm tra tab 2 nhận được comment realtime

## Cập nhật sau khi deploy

Mỗi khi sửa code:

```bash
git add .
git commit -m "Update: mô tả thay đổi"
git push origin main
```

Render sẽ tự động deploy lại (nếu đã bật Auto-Deploy).

## Troubleshooting

Xem chi tiết trong file `README-DEPLOY.md` phần 7.

## Tài liệu tham khảo

- Hướng dẫn chi tiết: `README-DEPLOY.md`
- Render Docs: https://render.com/docs
- Socket.IO Docs: https://socket.io/docs/v4/
