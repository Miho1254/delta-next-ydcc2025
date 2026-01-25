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

### 🎨 Giao diện Stitch Design (Mới 2025)
- **Card-based Layout**: Mỗi đống ủ hiển thị bằng card lớn với ảnh nền, dễ nhìn dễ bấm.
- **Giant Typography**: Font chữ siêu to (34px header), tối ưu cho nông dân lớn tuổi.
- **Prescription Chat**: Lời khuyên AI hiển thị như "đơn thuốc", rõ ràng và trang trọng.
- **Custom Camera UI**: Camera tích hợp với hướng dẫn bằng speech bubble.

### 📱 Các màn hình chính
1.  📸 **Chụp Hình Phụ Phẩm**: Camera toàn màn hình với hướng dẫn overlay + nút chụp siêu to.
2.  🤖 **Bác Sĩ Cây Trồng Khuyên**: Lời khuyên AI dạng thẻ + nút "Xong rồi" và "Hỏi thêm".
3.  🏠 **Việc Nhà Nông**: Danh sách đống ủ dạng card với status badge và FAB tạo mới.
4.  🛒 **Chợ Nhà Nông**: Marketplace với search, filter chips, và product grid 2 cột.
5.  🗣️ **Voice & Selection Mode**: Hỗ trợ nhập liệu bằng giọng nói và nút chọn nhanh.
6.  📊 **Timeline Tracking**: Lưu trữ lịch sử chăm sóc để AI đưa ra lời khuyên theo ngữ cảnh.

## 🛠️ Tech Stack & Architecture

### Mobile App
*   **Framework**: React Native (Expo Go) - *Fast iteration, no native build required.*
*   **UI Library**: React Native Paper - *Material Design styled.*
*   **Core Features**: expo-camera (Custom Camera UI), expo-speech (TTS), expo-image-picker.
*   **Design System**: Stitch Design - Card-based layout, giant typography, farmer-friendly UX.

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
2.  **Việc Nhà Nông**: Xem danh sách đống ủ dạng card lớn với ảnh nền.
3.  **Tạo đống ủ mới**:
    *   Bấm FAB (+) màu xanh lớn ở giữa màn hình.
    *   Camera mở toàn màn hình với hướng dẫn "Chụp cái đống bác muốn xử lý".
    *   Chọn từ thư viện hoặc chụp mới.
    *   AI tự nhận diện loại phụ phẩm, bác xác nhận.
4.  **Bác Sĩ Cây Trồng Khuyên**:
    *   Bấm vào card đống ủ để xem chi tiết.
    *   Đọc "Lời Khuyên" từ AI (có thể bấm nghe TTS).
    *   Bấm "Tui làm xong rồi" khi hoàn thành.
    *   Bấm "Hỏi thêm" để đặt câu hỏi mới.
5.  **Chợ Nhà Nông**: Xem sản phẩm, tìm kiếm và gọi ngay cho người bán.


## 🤖 AI Tools Disclosure (Công bố sử dụng AI)

Project này được phát triển với sự hỗ trợ của các công cụ AI sau, tuân thủ quy định cuộc thi YDCC 2025:

| Tool | Purpose (Mục đích) | Scope (Phạm vi) |
|------|--------------------|-----------------|
| **Google Gemini 1.5 Flash** | **Core Engine**: Phân tích hình ảnh, sinh lời khuyên nông nghiệp, chat với nông dân. | Backend Integration |
| **Google Antigravity** | **Development**: Hỗ trợ viết code (Scaffolding), Debugging, Refactoring. | Full Stack Development |
| **Copilot / Cursor** | **Autocomplete**: Gợi ý code nhanh trong IDE. | Development |

> **Cam kết**: Toàn bộ logic nghiệp vụ (Business Logic), kiến trúc hệ thống (Architecture) và kiểm thử (Testing) đều được rà soát và tinh chỉnh bởi đội ngũ phát triển con người.

---

## 📄 Licensing & Attribution

*   **Images**: Unsplash (Placeholders for Demo).
*   **Icons**: Ant Design Icons, Feather Icons, Material Community Icons.
*   **Fonts**: Inter, Roboto (Google Fonts).

---
*Built with ❤️ for YDCC 2025 - Team Delta Next*
