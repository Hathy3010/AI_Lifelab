# AI LifeLab · Pastel UI & Prototype

22 màn hình desktop, ba nhóm Home / Student / Teacher. Giao diện dùng #F4FAFF, #FFF7E6, #E8F8F1; chữ và nút dùng xanh đậm để dễ đọc.

## Xem bản tương tác

Mở `index.html` bằng trình duyệt. Thanh trên cùng chọn màn hình hoặc nhóm vai trò. Nút và liên kết dẫn đến các màn hình tương ứng. Nội dung nhập được lưu trong localStorage nếu trình duyệt cho phép. Font Be Vietnam Pro và Manrope tải qua Google Fonts khi có mạng, dự phòng bằng Segoe UI.

## Đưa UI và prototype vào Figma

1. Giải nén toàn bộ thư mục.
2. Mở file AI LifeLab trong ứng dụng Figma desktop.
3. Trong menu Plugins → Development → Import plugin from manifest, chọn `manifest.json` của thư mục này.
4. Chạy **AI LifeLab · Pastel UI & Prototype** từ Development.
5. Mở page **UI · Prototype**. Chọn một flow trong Present: Home, Student hoặc Teacher.

Plugin tạo lớp chữ, hình vector, biến màu và các button instance có thể chỉnh sửa. Các liên kết ON_CLICK được tạo tự động giữa các frame trên cùng page. Không gửi dữ liệu ra mạng, không xóa các page wireframe gốc. Nếu chạy lại, plugin cập nhật các frame được đặt tên trong page UI · Prototype.

## Trạng thái bàn giao

- Bản UI mới chưa được ghi vào Figma bằng MCP: tài khoản Starter báo hết hạn mức tại lần ghi đầu tiên.
- Plugin này là gói nguồn để người dùng chạy trong Figma; chưa được chạy và kiểm tra trong Figma thật.
- Prototype thể hiện luồng UX, không chạy mô phỏng vật lý, nhận diện camera hay AI.
- Các kịch bản ngoài Thiết kế cầu hiện dùng frame đại diện để minh họa luồng.
- Bộ lọc khối lớp/chủ đề là giao diện minh họa; chưa lọc dữ liệu thật.
- Các giá trị, thời hạn và học sinh là dữ liệu minh họa.

## Nguồn chỉnh sửa

`scenes.js`: nội dung và bố cục 22 màn hình. `build.js`: xuất bản xem và đóng gói mã plugin. `plugin-renderer.js`: dựng lớp Figma và nối prototype. Chạy `node build.js` để tạo lại đầu ra.
