# Cập nhật tiến độ AI LifeLab

Đây là yêu cầu của người dùng, áp dụng cho công việc trong workspace này.

- Dùng `PROGRESS.md` ở gốc workspace làm nguồn tiến độ chung. Đọc phần trạng thái hiện tại và các dòng gần nhất khi bắt đầu sửa dự án.
- Sau mỗi đợt công việc có thay đổi mã, cấu hình hoặc tài liệu, cập nhật tiến độ **một lần trước khi trả lời kết thúc**. Gom các sửa chữa và kiểm tra trong cùng đợt thành một dòng. Không cập nhật theo từng file, từng tool call hoặc mỗi lần lưu.
- Thêm một dòng lịch sử với mã tăng dần, ngày theo Asia/Bangkok, việc đã đổi, trước → sau/cách thực hiện, lý do, kết quả và giới hạn kiểm chứng, bước tiếp theo. Nếu chưa xong, ghi rõ phần đã làm và phần còn thiếu; không đánh dấu hoàn thành sai thực tế.
- Đồng bộ bảng trạng thái hiện tại và thứ tự bước tiếp theo khi kết quả công việc làm chúng thay đổi. Giữ nguyên lịch sử cũ, chỉ sửa lỗi ghi nhận có nêu lý do.
- Khi cập nhật kế hoạch, giữ rõ hai phần: việc ưu tiên kiểm tra/đọc hiểu trước và việc thực hành tiếp theo. Mỗi bước nêu hành động cụ thể, kiến thức cần học hoặc ôn, điều kiện chuyển bước. Điều chỉnh theo mã đã có, không yêu cầu viết lại chức năng chỉ để khớp số ngày.
- Chỉ ghi lệnh và kết quả kiểm tra thực sự đã thực hiện. Ghi rõ chưa kiểm tra nếu có; không chạy lại build hoặc toàn bộ test chỉ để cập nhật tiến độ tài liệu.
- Không tạo dòng cho trao đổi kiến thức, đọc mã hoặc trả lời tình hình mà không thay đổi dự án. Việc cập nhật chính nhật ký không tự tạo thêm dòng lặp.
- Khi công việc chỉ thay đổi tiến độ, ghi một dòng cho yêu cầu tài liệu đó và dừng. Không tạo daemon, lịch chạy định kỳ, watcher hoặc gọi LLM nền để ghi nhật ký.
- README liên kết tới `PROGRESS.md`; chỉ sửa các hướng dẫn/trạng thái trong README khi chúng thực sự thay đổi, tránh sao chép toàn bộ lịch sử.
- Sau khi cập nhật `PROGRESS.md`, xuất lại bản web bằng `python scripts/render_progress.py` tại gốc workspace. Chạy đúng một lần cuối đợt, không dùng watcher. Bản HTML ở `docs/AI-LifeLab-Tien-do.html` là đầu ra sinh tự động, không chỉnh riêng nội dung ở đó.
- Kết thúc công việc bằng báo cáo ngắn, kèm liên kết tới tiến độ nếu liên quan. Không tự tiếp tục triển khai một hạng mục mới chỉ vì nó được liệt kê ở cột bước tiếp theo.

Cơ chế này hướng dẫn agent cập nhật trong những lần thực hiện công việc tại workspace. Thay đổi thủ công hoặc bằng công cụ không đọc `AGENTS.md` không được tự phát hiện; cần tổng hợp vào đợt cập nhật tiếp theo khi có bằng chứng.
