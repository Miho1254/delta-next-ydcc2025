# Agri-Loop: Giải pháp Xử lý Phụ phẩm Nông nghiệp bằng AI

> **YDCC 2025 Submission** - Team Delta Next

Agri-Loop là ứng dụng di động hỗ trợ nông dân Đồng Bằng Sông Cửu Long (ĐBSCL) xử lý phụ phẩm nông nghiệp (rơm rạ, vỏ tôm, bèo tây) thành phân bón hữu cơ thông qua công nghệ Trí tuệ Nhân tạo (AI), thúc đẩy quá trình chuyển đổi số và chuyển đổi xanh trong nông nghiệp.

## 1. Vấn đề (Problem Statement)

Nông nghiệp ĐBSCL tạo ra lượng lớn phụ phẩm sau thu hoạch nhưng chưa được xử lý hiệu quả:
1.  **Ô nhiễm môi trường**: Thói quen đốt rơm rạ, xả thải vỏ tôm gây ô nhiễm không khí và nguồn nước.
2.  **Lãng phí tài nguyên**: Phụ phẩm nông nghiệp là nguồn nguyên liệu giá trị để sản xuất phân bón hữu cơ.
3.  **Rào cản công nghệ**: Nông dân lớn tuổi gặp khó khăn khi tiếp cận các quy trình kỹ thuật phức tạp.

## 2. Giải pháp (Solution Overview)

**Agri-Loop** đóng vai trò là trợ lý ảo nông nghiệp, đơn giản hóa quy trình xử lý phụ phẩm:
*   **Phân tích hình ảnh**: Sử dụng AI (Gemini 1.5 Flash) để nhận diện hiện trạng đống ủ qua camera và đưa ra phác đồ xử lý cụ thể.
*   **Tương tác giọng nói**: Cho phép người dùng hỏi đáp trực tiếp bằng giọng nói, loại bỏ rào cản thao tác bàn phím.
*   **Giám sát theo thời gian thực**: Theo dõi toàn bộ vòng đời của quá trình ủ phân (Timeline) để đưa ra khuyến nghị kịp thời.

## 3. Tính năng chính (Key Features)

### Giao diện Người dùng (User Experience)
- **Thiết kế tối ưu**: Sử dụng bố cục thẻ (Card-based) và cỡ chữ lớn, phù hợp với đối tượng người dùng lớn tuổi.
- **Trực quan hóa**: Các thông tin kỹ thuật được chuyển tải dưới dạng "đơn thuốc" dễ hiểu.

### Chức năng Hệ thống
1.  **Nhận diện Phụ phẩm**: Tự động xác định loại phụ phẩm qua hình ảnh.
2.  **Tư vấn Kỹ thuật**: Cung cấp quy trình xử lý chi tiết theo từng giai đoạn.
3.  **Quản lý Đống ủ**: Theo dõi trạng thái và tiến độ phân hủy.
4.  **Kết nối Thị trường**: Tìm kiếm và kết nối nguồn cung/cầu phụ phẩm (Marketplace).

## 4. Công nghệ sử dụng (Tech Stack)

### Mobile Application
*   **Framework**: React Native (Expo).
*   **UI Library**: React Native Paper.
*   **Features**: Camera Integration, Speech-to-Text/Text-to-Speech.

### Backend System
*   **Core**: Next.js 15 (API Routes).
*   **Language**: TypeScript.
*   **Database**: PostgreSQL (Supabase) + Prisma ORM.
*   **AI Engine**: Google Gemini 1.5 Flash.

## 5. Hướng dẫn Cài đặt (Installation)

### Yêu cầu hệ thống
*   Node.js v18 trở lên.
*   Thiết bị di động cài đặt Expo Go.

### Các bước triển khai

**Bước 1: Clone Repository**
```bash
git clone https://github.com/Miho1254/delta-next-ydcc2025.git
cd delta-next-ydcc2025
```

**Bước 2: Cấu hình Backend**
```bash
cd backend
npm install
# Tạo file .env từ .env.example và điền thông tin cấu hình
cp .env.example .env
npx prisma migrate dev
npm run dev
```

**Bước 3: Khởi chạy Mobile App**
```bash
cd mobile
npm install
npx expo start
```
Sử dụng ứng dụng Expo Go để quét mã QR và trải nghiệm.

## 6. Hướng dẫn Sử dụng (User Guide)

1.  **Đăng nhập**: Sử dụng số điện thoại (VD: 0987654321) để truy cập.
2.  **Quản lý**: Theo dõi danh sách các đống ủ hiện có tại màn hình chính.
3.  **Tạo mới**: Sử dụng tính năng Camera để chụp ảnh và tạo đống ủ mới.
4.  **Tư vấn**: Nhận khuyến nghị xử lý từ AI và cập nhật trạng thái sau khi thực hiện.

---

## Công bố sử dụng AI (AI Disclosure)

Dự án sử dụng các công cụ AI sau đây theo quy định của YDCC 2025:

| Công cụ | Mục đích sử dụng | Phạm vi áp dụng |
|---------|------------------|-----------------|
| **Google Gemini 1.5 Flash** | **Core Engine**: Phân tích hình ảnh, sinh nội dung tư vấn. | Backend Integration |
| **Google Antigravity/Copilot** | **Development**: Hỗ trợ lập trình và gỡ lỗi. | Development |

> **Cam kết**: Logic nghiệp vụ và kiến trúc hệ thống do đội ngũ phát triển thực hiện và kiểm soát.

---

## Bản quyền và Nguồn lực (Attribution)

*   **Hình ảnh**: Unsplash.
*   **Icons**: Ant Design, Feather Icons.
*   **Fonts**: Inter, Roboto.

---

## Đội ngũ Phát triển (Team Members)

| Họ và Tên | Vai trò (Role) | Đóng góp (Contribution) |
|-----------|----------------|-------------------------|
| **Đặng Quang Hiển** | **Full Stack Developer** | Phát triển toàn bộ Source Code (Mobile & Backend), System Architecture. |
| Trương Tuấn Minh | [Researcher/Designer] | Nghiên cứu thị trường, Thiết kế Slide, Quay dựng Video. |
| Trần Minh Triết | [Business Analyst] | Phân tích nghiệp vụ nông nghiệp, Lên ý tưởng sản phẩm. |
| Đặng Trọng Phúc | [Business Analyst] | Lên ý tưởng sản phẩm. |

*Team Delta Next - YDCC 2025*
