# 🏫 HƯỚNG DẪN CÀI ĐẶT & TRIỂN KHAI HỆ THỐNG
## CỔNG THÔNG TIN & QUẢN LÝ TỔ CHUYÊN MÔN KHOA HỌC TỰ NHIÊN - THCS

> **Kính chào Quý Thầy Cô và Ban Giám Hiệu!**
> Tài liệu này được biên soạn tỉ mỉ, chi tiết từng bước bằng tiếng Việt giúp quý thầy cô có thể tự tay khởi tạo cơ sở dữ liệu trên **Supabase** và đưa ứng dụng lên mạng Internet qua **Vercel** hoàn toàn miễn phí mà không cần biết lập trình chuyên sâu.

---

## 📋 MỤC LỤC HƯỚNG DẪN
1. [Bước 1: Khởi tạo Cơ sở dữ liệu trên Supabase](#bước-1-khởi-tạo-cơ-sở-dữ-liệu-trên-supabase)
2. [Bước 2: Chạy mã SQL khởi tạo 8 bảng dữ liệu & Phân quyền](#bước-2-chạy-mã-sql-khởi-tạo-8-bảng-dữ-liệu--phân-quyền)
3. [Bước 3: Lấy khóa kết nối (API Keys) của Supabase](#bước-3-lấy-khóa-kết-nối-api-keys-của-supabase)
4. [Bước 4: Cấu hình biến môi trường và chạy thử nghiệm cục bộ](#bước-4-cấu-hình-biến-môi-trường-và-chạy-thử-nghiệm-cục-bộ)
5. [Bước 5: Triển khai (Deploy) lên Vercel để đưa website vào hoạt động](#bước-5-triển-khai-deploy-lên-vercel-để-đưa-website-vào-hoạt-động)
6. [Bước 6: Hướng dẫn quản trị & Tạo tài khoản BGH/Tổ trưởng](#bước-6-hướng-dẫn-quản-trị--tạo-tài-khoản-bghtổ-trưởng)

---

## BƯỚC 1: KHỞI TẠO CƠ SỞ DỮ LIỆU TRÊN SUPABASE

1. Truy cập trang chủ Supabase: [https://supabase.com](https://supabase.com)
2. Nhấn nút **"Start your project"** hoặc **"Sign In"** (Có thể đăng nhập nhanh bằng tài khoản GitHub hoặc Google).
3. Tại giao diện quản lý (Dashboard), nhấn nút **"New project"** (Tạo dự án mới).
4. Điền các thông tin của dự án:
   - **Name (Tên dự án):** `khtn-thcs` (hoặc tên trường, ví dụ: `khtn-thcs-chu-van-an`).
   - **Database Password (Mật khẩu cơ sở dữ liệu):** Nhập một mật khẩu an toàn và ghi nhớ lại (ví dụ: `Khtn2025@School`).
   - **Region (Khu vực máy chủ):** Chọn **Singapore (Southeast Asia - Singapore)** để tốc độ truy cập tại Việt Nam nhanh nhất.
5. Nhấn **"Create new project"** và đợi khoảng 1-2 phút để Supabase chuẩn bị máy chủ.

---

## BƯỚC 2: CHẠY MÃ SQL KHỞI TẠO 8 BẢNG DỮ LIỆU & PHÂN QUYỀN

1. Tại thanh menu bên trái màn hình Supabase, nhấn vào biểu tượng **SQL Editor** (hình dấu nhắc lệnh `>_`).
2. Nhấn nút **"New query"** (hoặc dấu `+`).
3. Mở tệp [`supabase/schema.sql`](./supabase/schema.sql) trong thư mục mã nguồn này, copy toàn bộ nội dung và dán vào ô nhập liệu SQL của Supabase.
4. Nhấn nút **"Run"** (hoặc phím tắt `Ctrl + Enter` / `Cmd + Enter`) ở góc dưới bên phải.
5. Khi thấy thông báo màu xanh lá **"Success. No rows returned"**, tức là toàn bộ 8 bảng dữ liệu, chính sách bảo mật (RLS), Trigger đồng bộ tài khoản và 2 Kho chứa tệp (Storage Buckets: `khtn-documents`, `khtn-avatars`) đã được tạo thành công 100%!

---

## BƯỚC 3: LẤY KHÓA KẾT NỐI (API KEYS) CỦA SUPABASE

1. Trên menu bên trái Supabase, nhấn vào biểu tượng bánh răng **Project Settings** (ở dưới cùng).
2. Chọn mục **API** (nằm trong nhóm Configuration).
3. Thầy cô sẽ thấy 2 thông số quan trọng cần sao chép:
   - **Project URL:** Có dạng `https://xxxxxxxxxxxxxxxxxxxx.supabase.co`
   - **Project API keys (anon / public):** Có dạng chuỗi dài `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## BƯỚC 4: CẤU HÌNH BIẾN MÔI TRƯỜNG VÀ CHẠY THỬ NGHIỆM CỤC BỘ

1. Trong thư mục dự án trên máy tính, tạo một tệp tin mới tên là `.env` (hoặc đổi tên từ `.env.example`).
2. Dán 2 thông số vừa lấy ở Bước 3 vào:
   ```env
   VITE_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. Mở cửa sổ dòng lệnh (Terminal / PowerShell) tại thư mục dự án và gõ các lệnh:
   ```bash
   # 1. Cài đặt các thư viện cần thiết
   npm install

   # 2. Khởi chạy máy chủ chạy thử trên máy
   npm run dev
   ```
4. Trình duyệt sẽ tự động mở trang web tại địa chỉ: `http://localhost:5173`.

---

## BƯỚC 5: TRIỂN KHAI (DEPLOY) LÊN VERCEL ĐỂ ĐƯA WEBSITE VÀO HOẠT ĐỘNG

Có 2 cách đơn giản để đưa ứng dụng lên Vercel:

### Cách 1: Đẩy mã nguồn lên GitHub rồi kết nối Vercel (Khuyên dùng)
1. Đăng ký/Đăng nhập tài khoản tại [https://vercel.com](https://vercel.com).
2. Nhấn **"Add New..."** -> Chọn **"Project"**.
3. Chọn kho lưu trữ GitHub của dự án và nhấn **"Import"**.
4. Tại phần cấu hình dự án trên Vercel:
   - **Framework Preset:** Vite
   - Mở rộng mục **"Environment Variables"** (Biến môi trường) và thêm 2 biến:
     + `VITE_SUPABASE_URL` = (Dán Project URL của thầy cô)
     + `VITE_SUPABASE_ANON_KEY` = (Dán anon public key của thầy cô)
5. Nhấn nút **"Deploy"**. Đợi 1 phút, Vercel sẽ cung cấp cho thầy cô một đường link website chính thức (ví dụ: `https://khtn-thcs.vercel.app`) để toàn trường sử dụng!

### Cách 2: Triển khai trực tiếp qua Vercel CLI
```bash
npm install -g vercel
vercel login
vercel
```

---

## BƯỚC 6: HƯỚNG DẪN QUẢN TRỊ & TẠO TÀI KHOẢN BGH / TỔ TRƯỞNG

1. **Đăng ký tài khoản đầu tiên:**
   - Truy cập vào trang web vừa khởi tạo -> Bấm vào **"Đăng ký thành viên tổ"**.
   - Điền thông tin: Họ tên (VD: *Cô Nguyễn Thị Hảo*), Email, Mật khẩu, Chuyên môn (*Khoa học Tự nhiên*), Nhiệm vụ (*Tổ trưởng chuyên môn*), Vai trò (*head_teacher* hoặc *admin*).
   - Nhấn **"Hoàn tất đăng ký"**.

2. **Các phân quyền trong hệ thống:**
   - 🔴 **Ban Giám Hiệu / Admin (`admin`):** Toàn quyền xem báo cáo, quản lý toàn bộ nhân sự, văn bản, kế hoạch, ngân hàng đề và thi đua.
   - 🔵 **Tổ Trưởng / Tổ Phó (`head_teacher`):** Quản lý phân công 11 giáo viên trong tổ; Phê duyệt/từ chối lịch đăng ký thao giảng; Ban hành kế hoạch tổ; Chấm điểm thi đua định kỳ.
   - 🟢 **Giáo Viên Bộ Môn (`teacher`):** Đăng ký tiết dạy thao giảng; Đóng góp đề kiểm tra kèm Ma trận đặc tả; Ghi biên bản họp tổ (khi được phân công làm thư ký); Xem và trình chiếu thí nghiệm ảo PhET trực tiếp; Xem điểm thi đua của cá nhân.

---

**Chúc Quý Thầy Cô và Tổ Chuyên Môn Khoa Học Tự Nhiên ứng dụng công nghệ hiệu quả và đạt nhiều thành tích xuất sắc!**
