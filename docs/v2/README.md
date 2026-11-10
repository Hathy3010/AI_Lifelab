# AI LifeLab — Bộ thiết kế MVP v2

Thiết kế database CHỐT TOÀN DỰ ÁN: database/AI-LifeLab-Database-Toan-du-an.html (13 bảng). SQL chuẩn: database/schema.sql; schema-v2.sql là bản sao đồng nhất. Không có bản 7 bảng riêng.

Mở AI-LifeLab-Phan-tich-Thiet-ke-v2.html để đọc. HTML dùng các SVG trong diagrams; giữ cùng thư mục khi di chuyển.

Trong diagrams.net: File → Open From → Device → AI-LifeLab-System-v2.drawio. Có 9 tab: học sinh, giáo viên, kiến trúc, ERD lớp, ERD học tập, sequence, trạng thái CV, flow CV–Coach–dữ liệu, ERD nguồn Chat. Mọi hình và đường nối đều chỉnh sửa được.

Đọc thêm AI-LifeLab-CV-Chat-Flow-Database.html: cách tay tương tác với bàn 3D, Coach theo nguồn, từ điển dữ liệu và thời điểm lưu. Giao diện chuyển sang 3D, quy tắc đòn bẩy và vị trí rời rạc giữ nguyên. Phát triển trước một bài; năm bài khác là phạm vi sau.

Phạm vi mới: 8.2 là đòn bẩy, không còn bài CV chọn công trình chứa nước. 5 bài khác giữ đặc tả cũ; file tham khảo nằm trong references. Bản v1 không được xem là hợp đồng API hoàn chỉnh của v2.

schema-v2.sql tạo mới 13 bảng, không chạy trên database đã tồn tại. DDL đã kiểm bằng PostgreSQL bộ nhớ PGlite; chưa chạy server PostgreSQL và chưa tích hợp camera/LLM. contracts-v2.json là ví dụ thiết kế, không phải JSON Schema hay OpenAPI đầy đủ.

build_package.py tạo sơ đồ, SQL và ví dụ. render_document.py tạo HTML từ Markdown. validate_package.py kiểm tra tài liệu, sơ đồ, quan hệ và phép tính rồi đóng ZIP. check_visual.py kiểm tra hiển thị HTML/SVG bằng trình duyệt. Các kiểm tra đó không thay thế kiểm thử phần mềm.
