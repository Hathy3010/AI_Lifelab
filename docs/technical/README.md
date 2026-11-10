# AI LifeLab — Thiết kế bước 4 và 6

Đọc `../AI-LifeLab-Thiet-ke-CV-AI-He-thong.html` trước. Đây là các artifact thiết kế và PoC, không phải backend đã triển khai.

## Các lệnh tái tạo

Chạy từ thư mục gốc dự án. Cần Python có `jsonschema`; Node để chạy replay cử chỉ. Playwright chỉ cần cho kiểm tra trang trình bày.

```text
C:/Python314/python.exe docs/technical/build_contracts.py
C:/Python314/python.exe docs/technical/make_diagrams.py
C:/Python314/python.exe docs/technical/reference_checks.py
node docs/technical/test_cv.mjs
C:/Python314/python.exe docs/render_spec.py docs/AI-LifeLab-Thiet-ke-CV-AI-He-thong.md
```

## Mẫu thử camera

```text
C:/Python314/python.exe -m http.server 8765 --bind 127.0.0.1 --directory docs/technical
```

Mở `http://127.0.0.1:8765/cv-probe.html`. Dừng bằng Ctrl+C khi xong. Không cần tài khoản AI cho mẫu này. Camera cần quyền trình duyệt; model/thư viện tải từ mạng. Chưa có kết quả thử nhận diện tay thật.

## Xác minh đã làm

- 30 kiểm tra tham chiếu (phép tính/schema/nguồn AI/API).
- 10 kiểm tra replay cử chỉ tổng hợp.
- Kiểm tra trình duyệt cho tài liệu, ảnh SVG và chuột/bàn phím; kết quả trong `page-check-report.json`.

Không coi các kiểm tra trên là thử nghiệm PostgreSQL, xác thực/phân quyền của server, nhận diện camera thật hoặc chất lượng phản hồi LLM thật. DDL chưa được chạy trong cơ sở dữ liệu. `schema.sql` không phải script tự chạy khi mở tài liệu và không được áp vào DB có sẵn mà bỏ qua quy trình migration.
