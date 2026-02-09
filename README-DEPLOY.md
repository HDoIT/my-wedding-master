# 🚀 HƯỚNG DẪN DEPLOY LÊN RENDER TỪ A-Z

Hướng dẫn chi tiết để deploy ứng dụng Wedding với Socket.IO realtime lên Render.

---

## 📋 MỤC LỤC

1. [Chuẩn bị](#1-chuẩn-bị)
2. [Cấu hình MongoDB Atlas](#2-cấu-hình-mongodb-atlas)
3. [Tạo Repository trên GitHub](#3-tạo-repository-trên-github)
4. [Deploy lên Render](#4-deploy-lên-render)
5. [Cấu hình Environment Variables](#5-cấu-hình-environment-variables)
6. [Kiểm tra Socket.IO Realtime](#6-kiểm-tra-socketio-realtime)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. CHUẨN BỊ

### ✅ Checklist trước khi deploy:

- [ ] Đã có tài khoản [Render.com](https://render.com) (miễn phí)
- [ ] Đã có tài khoản [GitHub.com](https://github.com)
- [ ] Đã có MongoDB Atlas (hoặc sẽ tạo mới - miễn phí)
- [ ] Code đã được test local thành công

### 📁 Cấu trúc dự án hiện tại:

```
my-wedding-master/
├── models/
│   └── Comment.js          # MongoDB schema
├── public/
│   └── index.html          # Giao diện HTML
├── .env                    # Environment variables (KHÔNG push lên Git)
├── .gitignore              # Ignore files
├── package.json            # Dependencies
├── render.yaml             # Render config (đã tạo)
└── server.js               # Server chính với Socket.IO
```

---

## 2. CẤU HÌNH MONGODB ATLAS

### Bước 2.1: Tạo MongoDB Atlas Cluster (nếu chưa có)

1. Truy cập [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Đăng nhập hoặc tạo tài khoản miễn phí
3. Tạo **New Project**:
   - Project Name: `MyWedding` (hoặc tên bạn muốn)
   - Click **Create Project**

4. Tạo **Database Cluster**:
   - Click **Build a Database**
   - Chọn **FREE** (M0 Sandbox)
   - Cloud Provider: **AWS** hoặc **Google Cloud**
   - Region: Chọn gần Việt Nam nhất (Singapore, Hong Kong)
   - Cluster Name: `Cluster0` (mặc định)
   - Click **Create**

### Bước 2.2: Cấu hình Database Access

1. Vào tab **Database Access** (menu bên trái)
2. Click **Add New Database User**:
   - Authentication Method: **Password**
   - Username: `admin` (hoặc tên khác)
   - Password: Tạo password mạnh (LƯU LẠI PASSWORD NÀY!)
   - Database User Privileges: **Read and write to any database**
   - Click **Add User**

### Bước 2.3: Cấu hình Network Access

1. Vào tab **Network Access** (menu bên trái)
2. Click **Add IP Address**:
   - Click **Allow Access from Anywhere** (cho phép Render kết nối)
   - IP Address sẽ là: `0.0.0.0/0`
   - Comment: `Render deployment`
   - Click **Confirm**

> ⚠️ **Lưu ý**: Cho phép `0.0.0.0/0` là cần thiết để Render có thể kết nối. MongoDB Atlas vẫn bảo mật qua username/password.

### Bước 2.4: Lấy Connection String

1. Vào tab **Database** (menu bên trái)
2. Click nút **Connect** trên Cluster của bạn
3. Chọn **Connect your application**
4. Driver: **Node.js**, Version: **4.1 or later**
5. Copy **Connection String**:
   ```
   mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **QUAN TRỌNG**: Thay `<password>` bằng password thực tế của user `admin`
7. Thêm tên database vào sau `.net/`: 
   ```
   mongodb+srv://admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/MyWedding?retryWrites=true&w=majority
   ```

> 💾 **LƯU LẠI** connection string này, bạn sẽ cần nó ở bước 5!

---

## 3. TẠO REPOSITORY TRÊN GITHUB

### Bước 3.1: Tạo Repository mới

1. Truy cập [GitHub](https://github.com)
2. Click nút **+** góc trên bên phải → **New repository**
3. Điền thông tin:
   - Repository name: `my-wedding-app` (hoặc tên bạn muốn)
   - Description: `Wedding website with realtime comments using Socket.IO`
   - Visibility: **Public** hoặc **Private** (cả 2 đều OK với Render)
   - **KHÔNG** chọn "Initialize with README" (vì code đã có sẵn)
4. Click **Create repository**

### Bước 3.2: Push code lên GitHub

Mở **Terminal/PowerShell** trong thư mục dự án và chạy:

```bash
# Khởi tạo Git (nếu chưa có)
git init

# Thêm tất cả files
git add .

# Commit
git commit -m "Initial commit - Wedding app with Socket.IO"

# Thêm remote repository (thay YOUR_USERNAME và YOUR_REPO)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push lên GitHub
git branch -M main
git push -u origin main
```

> 📝 **Lưu ý**: Thay `YOUR_USERNAME` và `YOUR_REPO` bằng username GitHub và tên repository của bạn.

### Bước 3.3: Kiểm tra

- Refresh trang GitHub repository
- Đảm bảo tất cả files đã được push (trừ `node_modules/` và `.env`)

---

## 4. DEPLOY LÊN RENDER

### Bước 4.1: Tạo Web Service mới

1. Truy cập [Render Dashboard](https://dashboard.render.com/)
2. Click **New +** → **Web Service**
3. Kết nối GitHub:
   - Nếu lần đầu: Click **Connect GitHub** và authorize Render
   - Chọn repository `my-wedding-app` từ danh sách
   - Click **Connect**

### Bước 4.2: Cấu hình Web Service

Điền thông tin như sau:

| Field | Value |
|-------|-------|
| **Name** | `my-wedding-app` (hoặc tên bạn muốn) |
| **Region** | `Singapore` (gần Việt Nam nhất) |
| **Branch** | `main` |
| **Root Directory** | (để trống) |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` |

> 💡 **Tip**: Render sẽ tự động phát hiện `package.json` và cài đặt dependencies.

### Bước 4.3: Cấu hình Auto-Deploy

- Bật **Auto-Deploy**: `Yes` (tự động deploy khi push code mới lên GitHub)

### Bước 4.4: Tạo Service

- Click **Create Web Service**
- Render sẽ bắt đầu build và deploy (mất khoảng 2-5 phút)

---

## 5. CẤU HÌNH ENVIRONMENT VARIABLES

### Bước 5.1: Thêm Environment Variables

Trong khi Render đang deploy, thêm biến môi trường:

1. Vào tab **Environment** trong dashboard của Web Service
2. Click **Add Environment Variable**
3. Thêm các biến sau:

| Key | Value | Ghi chú |
|-----|-------|---------|
| `NODE_ENV` | `production` | Chế độ production |
| `MONGODB_URI` | `mongodb+srv://admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/MyWedding?retryWrites=true&w=majority` | Connection string từ bước 2.4 |
| `PORT` | `10000` | Port mặc định của Render |

> ⚠️ **QUAN TRỌNG**: Thay `YOUR_PASSWORD` và `cluster0.xxxxx` bằng thông tin thực tế của bạn!

4. Click **Save Changes**
5. Render sẽ tự động redeploy với environment variables mới

### Bước 5.2: Đợi Deploy hoàn tất

- Theo dõi logs trong tab **Logs**
- Khi thấy dòng `✅ Connected to MongoDB` và `🚀 Server running on port 10000` → Deploy thành công!
- Render sẽ cung cấp URL dạng: `https://my-wedding-app.onrender.com`

---

## 6. KIỂM TRA SOCKET.IO REALTIME

### Bước 6.1: Truy cập Website

1. Click vào URL được cung cấp bởi Render (ví dụ: `https://my-wedding-app.onrender.com`)
2. Giao diện HTML của bạn sẽ hiển thị

### Bước 6.2: Test Socket.IO Connection

Mở **Developer Console** trong trình duyệt (F12) và kiểm tra:

1. **Tab Console**: Tìm log kết nối Socket.IO:
   ```
   Socket.IO connected: <socket-id>
   ```

2. **Tab Network**: 
   - Filter: `WS` (WebSocket)
   - Tìm connection đến `/socket.io/?EIO=4&transport=websocket`
   - Status: `101 Switching Protocols` (màu xanh)

### Bước 6.3: Test Realtime Comments

1. Mở 2 tab/cửa sổ trình duyệt với cùng URL
2. Trong tab 1: Gửi comment mới
3. Kiểm tra tab 2: Comment sẽ xuất hiện **NGAY LẬP TỨC** không cần refresh

> ✅ Nếu comment xuất hiện realtime → Socket.IO hoạt động hoàn hảo!

### Bước 6.4: Test trên Mobile

1. Mở URL trên điện thoại
2. Gửi comment từ điện thoại
3. Kiểm tra trên máy tính → Comment xuất hiện realtime

---

## 7. TROUBLESHOOTING

### ❌ Lỗi: "Application failed to respond"

**Nguyên nhân**: Server không start được hoặc crash

**Giải pháp**:
1. Kiểm tra **Logs** trong Render dashboard
2. Tìm lỗi liên quan đến:
   - MongoDB connection: Kiểm tra `MONGODB_URI` đúng chưa
   - Missing dependencies: Chạy lại build
3. Đảm bảo `package.json` có đầy đủ dependencies

### ❌ Lỗi: "MongoDB connection error"

**Nguyên nhân**: Không kết nối được MongoDB Atlas

**Giải pháp**:
1. Kiểm tra `MONGODB_URI` trong Environment Variables:
   - Password đúng chưa?
   - Database name có trong connection string chưa?
2. Kiểm tra MongoDB Atlas Network Access:
   - Đã cho phép `0.0.0.0/0` chưa?
3. Kiểm tra Database User:
   - User có quyền "Read and write" chưa?

### ❌ Socket.IO không hoạt động realtime

**Nguyên nhân**: WebSocket bị block hoặc fallback về polling

**Giải pháp**:
1. Kiểm tra trong Developer Console:
   ```javascript
   // Nếu thấy dòng này → WebSocket hoạt động
   transport: "websocket"
   
   // Nếu thấy dòng này → Đang dùng polling (chậm hơn)
   transport: "polling"
   ```

2. Render **HỖ TRỢ** WebSocket trên Free plan, nhưng:
   - Free instance có thể sleep sau 15 phút không hoạt động
   - Lần đầu truy cập sau khi sleep sẽ mất 30-60s để wake up

3. Giải pháp:
   - Upgrade lên Paid plan ($7/tháng) để tránh sleep
   - Hoặc dùng service ping mỗi 10 phút để giữ instance active

### ❌ Website hiển thị nhưng không load CSS/JS

**Nguyên nhân**: Đường dẫn file tĩnh không đúng

**Giải pháp**:
1. Kiểm tra `server.js` có dòng:
   ```javascript
   app.use(express.static(path.join(__dirname, 'public')));
   ```
2. Đảm bảo tất cả file CSS/JS/images nằm trong thư mục `public/`
3. Trong HTML, dùng đường dẫn tương đối:
   ```html
   <link rel="stylesheet" href="/styles.css">
   <script src="/script.js"></script>
   ```

### 🔄 Cập nhật code sau khi deploy

Khi bạn sửa code:

```bash
# Commit changes
git add .
git commit -m "Update: mô tả thay đổi"

# Push lên GitHub
git push origin main
```

Render sẽ **TỰ ĐỘNG** phát hiện và deploy lại (nếu đã bật Auto-Deploy).

---

## 🎉 HOÀN TẤT!

Bây giờ bạn đã có:

✅ Website wedding chạy trên Render  
✅ MongoDB Atlas lưu trữ comments  
✅ Socket.IO realtime hoạt động  
✅ HTTPS miễn phí từ Render  
✅ Auto-deploy khi push code mới  

### 📱 Chia sẻ website

URL của bạn: `https://my-wedding-app.onrender.com`

Bạn có thể:
- Chia sẻ link này cho khách mời
- Tạo QR code từ URL
- Thêm custom domain (nếu có)

---

## 📚 TÀI LIỆU THAM KHẢO

- [Render Documentation](https://render.com/docs)
- [Socket.IO Documentation](https://socket.io/docs/v4/)
- [MongoDB Atlas Documentation](https://www.mongodb.com/docs/atlas/)

---

## 💡 GỢI Ý CẢI TIẾN

1. **Custom Domain**: 
   - Mua domain từ Namecheap, GoDaddy
   - Cấu hình trong Render Settings → Custom Domains

2. **Performance**:
   - Upgrade lên Paid plan để tránh cold start
   - Enable CDN cho static files

3. **Monitoring**:
   - Dùng Render Metrics để theo dõi traffic
   - Setup alerts khi service down

4. **Backup**:
   - MongoDB Atlas tự động backup hàng ngày (Free plan)
   - Export data định kỳ để đề phòng

---

**Chúc bạn deploy thành công! 🚀**
