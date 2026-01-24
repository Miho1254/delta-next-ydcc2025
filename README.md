# 🌱 Agri-Loop: Giải pháp Xử lý Phụ phẩm Nông nghiệp bằng AI

> **YDCC 2025 Submission** - Team Delta Next

Agri-Loop là ứng dụng di động hỗ trợ nông dân Đồng Bằng Sông Cửu Long (ĐBSCL) xử lý phụ phẩm nông nghiệp (rơm rạ, vỏ tôm, bèo tây) thành phân bón hữu cơ bằng công nghệ AI, hướng tới chuyển đổi kép (Digital & Green Transformation).

## 🚩 Problem Statement (Vấn đề)

Nông dân ĐBSCL đối mặt với lượng lớn phụ phẩm nông nghiệp nhưng thiếu kiến thức và công cụ để xử lý hiệu quả, dẫn đến:
1.  **Ô nhiễm môi trường**: Đốt rơm rạ, xả thải vỏ tôm gây ô nhiễm không khí và nguồn nước.
2.  **Lãng phí tài nguyên**: Phụ phẩm có thể tái chế thành phân bón giá trị cao nhưng bị bỏ phí.
3.  **Rào cản công nghệ**: Các giải pháp hiện có quá phức tạp cho nông dân lớn tuổi.

## 💡 Solution Overview (Giải pháp)

**Agri-Loop** cung cấp một "chuyên gia nông nghiệp bỏ túi" (AI Agronomist) đơn giản, dễ sử dụng:
*   **Chụp & Phân tích**: Chụp ảnh đống phụ phẩm -> AI (Gemini 1.5 Flash) phân tích và đưa ra lời khuyên xử lý ngay lập tức.
*   **Tương tác tự nhiên**: Hỏi đáp bằng giọng nói hoặc chọn câu hỏi gợi ý, không cần gõ phím.
*   **Theo dõi quy trình**: Giám sát quá trình ủ phân theo thời gian thực (Timeline).

## ✨ Key Features (Tính năng chính)

1.  📸 **Photo Diagnosis**: Chụp ảnh hiện trạng đống ủ, AI nhận diện loại phụ phẩm và đánh giá mức độ phân hủy.
2.  🤖 **AI Chat Assistant**: Trợ lý ảo tư vấn kỹ thuật ủ, trả lời các câu hỏi thường gặp (tưới nước, đảo đống, bổ sung chế phẩm...).
3.  🗣️ **Voice & Selection Mode**: Giao diện tối ưu cho người lớn tuổi - hỗ trợ nhập liệu bằng giọng nói và nút chọn nhanh.
4.  📊 **Timeline Tracking**: Lưu trữ lịch sử chăm sóc để AI đưa ra lời khuyên chính xác theo ngữ cảnh.
5.  🔐 **Phone Auth**: Đăng nhập đơn giản bằng số điện thoại.

## 🛠️ Tech Stack & Architecture

### Mobile App
*   **Framework**: React Native (Expo Go) - *Fast iteration, no native build required.*
*   **UI Library**: React Native Paper - *Material Design styled.*
*   **Core Features**: Expo Camera, Expo Speech, Expo FileSystem.

### Backend API
*   **Framework**: Next.js 15 (App Router API Routes) - *Serverless ready.*
*   **Language**: TypeScript.
*   **Database**: PostgreSQL (Supabase).
*   **ORM**: Prisma.
*   **AI Engine**: Google Gemini 1.5 Flash (via Google AI SDK).

### Infrastructure
*   **Deployment**: Vercel (Backend) & Expo Go (Mobile).
*   **Storage**: Supabase Storage.

## 🚀 Setup & Installation (Hướng dẫn cài đặt)

### Prerequisites (Yêu cầu)
*   Node.js v18+
*   npm or yarn
*   Git
*   Điện thoại cài sẵn ứng dụng **Expo Go** (Android/iOS)

### 1. Clone Repository
```bash
git clone https://github.com/Miho1254/delta-next-ydcc2025.git
cd delta-next-ydcc2025
```

### 2. Backend Setup
```bash
cd backend
npm install
# Copy .env.example -> .env
cp .env.example .env
# Chỉnh sửa DATABASE_URL và GEMINI_API_KEY trong .env
npx prisma migrate dev
npm run dev
```
Backend sẽ chạy tại `http://localhost:3000`.

### 3. Mobile App Setup
```bash
cd mobile
npm install
npx expo start
```
Quét mã QR bằng ứng dụng Expo Go trên điện thoại để trải nghiệm.

## 📖 User Guide (Hướng dẫn sử dụng)

1.  **Đăng nhập**: Nhập số điện thoại bất kỳ (VD: 0901234567) để bắt đầu.
2.  **Tạo đống ủ mới**: Bấm nút `+`, chụp ảnh đống phụ phẩm và đặt tên.
3.  **Nhận tư vấn**: Đọc lời khuyên từ AI về cách xử lý ban đầu.
4.  **Chăm sóc định kỳ**:
    *   Bấm vào đống ủ để xem chi tiết.
    *   Bấm icon Micro 🎤 để hỏi: "Cần tưới nước không?"
    *   Hoặc chọn các câu hỏi gợi ý sẵn.
    *   Chụp ảnh cập nhật tiến độ khi cần thiết.

---
*Built with ❤️ for YDCC 2025*
