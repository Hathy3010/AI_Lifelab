# Database toàn AI LifeLab

Đọc AI-LifeLab-Database-Toan-du-an.html trước khi code. schema.sql là SQL tạo mới 13 bảng; không chạy trên schema đã tồn tại. queries.sql là ví dụ đọc có tham số.

Kiểm tra cô lập: mở terminal tại thư mục này, chạy npm install rồi npm test. PGlite tạo database trong bộ nhớ và đóng sau kiểm tra, không kết nối hoặc thay đổi database thật. database-validation.json ghi rõ giới hạn kiểm thử.

schema.sql là nguồn chuẩn duy nhất. sync_schema.py chỉ đồng bộ bản sao schema-v2.sql ở thư mục cha. ERD-Database.drawio là sơ đồ riêng 3 trang, mở và sửa trực tiếp trong diagrams.net.
