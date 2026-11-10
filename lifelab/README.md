# AI LifeLab

Ứng dụng thực hành mô phỏng dành cho học sinh lớp 8–9. Học sinh chọn khối lớp, chủ đề, bài nhỏ và mở không gian 3D để thay đổi dữ liệu, quan sát kết quả.

Theo dõi [bảng tiến độ chung và lịch sử thay đổi](../PROGRESS.md). Bảng được cập nhật một lần sau mỗi đợt sửa dự án theo hướng dẫn tại `../AGENTS.md`, không dùng tác vụ chạy nền.

Bản dễ đọc trên trình duyệt: [Tiến độ và lộ trình học](../docs/AI-LifeLab-Tien-do.html). Bản này được sinh từ `PROGRESS.md` bằng `python scripts/render_progress.py` tại gốc workspace; không sửa nội dung HTML riêng.

**Cập nhật ngày 08/11/2026 — hoàn thiện phạm vi ngày 2 và nối luồng thực hành bài cân với backend, camera/CV và Coach.** Đây là mốc theo nội dung công việc, không có nghĩa mọi phần đã viết trước đó đều hoàn chỉnh hoặc đã triển khai lên Internet.

## Chạy frontend

Cần Node.js và npm. Môi trường phát triển đã sử dụng Node.js 24.

```powershell
cd C:\Users\OS\OneDrive\Documents\ChatGPT\DATN\lifelab
npm ci
npm run dev
```

Mở http://127.0.0.1:5173/#/lab. Nếu cổng 5173 đang được sử dụng, kiểm tra terminal Vite đang chạy. Dùng lại server đó hoặc dừng bằng Ctrl+C trong đúng terminal rồi chạy lại.

```powershell
npm test
npm run build
npm run preview
```

`test` kiểm tra logic định tuyến và cấu trúc thư viện. `build` kiểm tra TypeScript và tạo thư mục `dist`. `preview` xem bản build trên cổng 4173. Các lệnh này không triển khai ứng dụng lên Internet.

## Đã làm được gì?

| Phần | Trạng thái thực tế |
| --- | --- |
| Chọn khối lớp | Có lớp 8 và lớp 9 |
| Thư viện | Mỗi khối có 3 chủ đề, mỗi chủ đề có 2 bài nhỏ; tổng 12 bài |
| Điều hướng | Liên kết mở bài, breadcrumb, quay lại thư viện, Back/Forward của trình duyệt và mở đường dẫn trực tiếp |
| Đường dẫn sai | Hiện thông báo và liên kết quay lại; không tự mở một bài khác |
| Lab 3D | Có cảnh 3D, mô hình, chất liệu và điều khiển góc nhìn |
| Tương tác hiện tại | Slider cho các bài; bài cân hỗ trợ kéo quả A bằng chuột và chạy thử |
| Kết quả | Hai bài cân dùng kết quả API và lịch sử server; các chủ đề khác vẫn tính cục bộ |
| Backend | Hai bài cân đã nối tạo/khôi phục phiên, lưu lần thử, Coach và hoàn thành; dữ liệu trong bộ nhớ server |
| Computer Vision | Bài cân có nút bật/tắt camera, nhận diện tay tại máy, chụm để giữ A và mở để thả; có đường dùng chuột/slider khi lỗi |
| AI Coach | Bài cân có chat, chọn kiểu hỗ trợ, tham chiếu lượt thử; nhãn phân biệt LLM với gợi ý có sẵn |
| Database | Có thiết kế SQL/ERD trong tài liệu; backend hiện chưa kết nối database |
| Tài khoản / giáo viên | Chưa triển khai đăng nhập, phân quyền, giao bài và dashboard trong app hiện tại |

Hình ảnh 3D và các quy tắc hiện tại là bản mô phỏng phục vụ phát triển. Chưa có phép đánh giá để khẳng định mức giống thực tế 98% hoặc độ chính xác ngoài đời cho mọi kịch bản.

## Luồng và đường dẫn

```text
#/lab                       → Chọn khối lớp
#/lab/8                     → Ba chủ đề lớp 8
#/lab/8/8.2                 → Hai bài nhỏ về cân bằng đòn bẩy
#/lab/8/8.2/balance         → Lab cân bằng hai vật khác khối lượng
```

| Khối | Chủ đề | Bài nhỏ |
| --- | --- | --- |
| 8 | Cảnh báo mực nước | Chọn ngưỡng; kiểm tra khi nước dâng |
| 8 | Cân bằng đòn bẩy | Cân bằng hai vật; đổi hướng nghiêng |
| 8 | Tiền tiêu vặt | Ngân sách tuần; chi phí phát sinh |
| 9 | Điện năng | Thời gian sử dụng; công suất |
| 9 | Tiết kiệm | Mục tiêu; chi phí mới |
| 9 | Luyện kỹ năng | Lịch luyện tập; bỏ lỡ buổi |

Mỗi bài cân có một mã phiên riêng trong `sessionStorage` của tab. Tải lại trang hoặc quay về bài sẽ đọc lại lịch sử, Coach và trạng thái hoàn thành từ server. Vị trí khôi phục là lượt thử gần nhất đã lưu; thao tác chưa chạy thử và nội dung chưa gửi chưa được lưu. Đóng tab có thể mất mã phiên. Server khởi động lại sẽ mất toàn bộ dữ liệu bộ nhớ. Các chủ đề khác vẫn trở về giá trị ban đầu khi mở lại.

## Chạy luồng backend + CV + Coach

Mở thêm terminal ở thư mục `lifelab` và chạy backend local:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r backend/requirements.txt
.\.venv\Scripts\python.exe -m uvicorn backend.app:app --host 127.0.0.1 --port 8000
```

Nếu đã có `.venv`, bỏ qua lệnh tạo môi trường. Terminal frontend vẫn chạy `npm run dev`. Vite chuyển `/api` sang cổng 8000. Xem tài liệu API tại http://127.0.0.1:8000/docs và trạng thái tại http://127.0.0.1:8000/api/health.

1. Vào lớp 8 → cân bằng đòn bẩy → một bài nhỏ → **Bắt đầu phiên**.
2. Di chuyển A bằng chuột/slider hoặc bấm **Điều khiển bằng tay**, cấp quyền camera, chụm ngón cái–trỏ tại A để giữ, di chuyển và mở để thả ở vạch bên trái. B luôn cố định theo bài. Camera xử lý trên máy, không gửi ảnh hoặc landmark lên server.
3. Chọn dự đoán, viết lý do, bấm **Chạy thử và lưu**. Backend kiểm tra vị trí theo bài rồi tính kết quả. Lịch sử lưu phương án, dự đoán, kết quả và nguồn thao tác.
4. Thử ít nhất hai vị trí A khác nhau. Hỏi Coach, chọn giải thích lượt gần nhất hoặc so sánh hai lượt gần nhất. Coach chỉ được tô sáng vật, không tự đổi vị trí.
5. Chọn một lượt làm bằng chứng, viết phản tư từ 10 ký tự và hoàn thành phiên. Giao diện khóa sửa bài sau khi hoàn thành, cho phép tạo phiên mới.

Coach dùng **gợi ý có sẵn** khi chưa cấu hình LLM hoặc nhà cung cấp lỗi. Để gọi LLM qua Ollama đã cài và có model trên máy, đặt biến trong terminal backend trước khi chạy Uvicorn:

```powershell
$env:OLLAMA_BASE_URL = 'http://127.0.0.1:11434'
$env:OLLAMA_MODEL = '<ten-model-da-cai-tren-may>'
```

Tên model phải khớp model của bạn, không dùng nguyên placeholder. Không cần LLM để chạy phần mô phỏng và hoàn thành bài. LLM thật và CV với bàn tay thật cần nghiệm thu trên máy có model/camera. Backend hiện là bản local chưa có xác thực, không dùng làm dịch vụ công khai hoặc nơi lưu dữ liệu học sinh thật.

Kiểm tra backend bằng `.\.venv\Scripts\python.exe -m unittest backend.test_flow -v`. Các ca kiểm tra bao gồm tính kết quả, chống lưu trùng khi gửi lại, tham chiếu Coach, giới hạn nhiệm vụ, phản tư và khôi phục phiên.

## Đọc mã từ đâu?

### Format mã nguồn

VS Code dùng Prettier cho TypeScript/TSX, JavaScript, CSS, HTML, JSON và Markdown; dùng Black Formatter cho Python. Cấu hình lưu tại `.vscode/settings.json` ở cả workspace và thư mục ứng dụng để hỗ trợ mở một trong hai thư mục. Lưu file bằng `Ctrl+S` để format, hoặc dùng `Shift+Alt+F`. Sau khi cài extension mới, nếu chưa hoạt động, chạy `Developer: Reload Window` rồi kiểm tra `Format Document With…`.

Frontend có Prettier local và `.prettierrc.json`. Chạy `npm run format` để format mã nguồn hoặc `npm run format:check` để kiểm tra. Tài nguyên tải về, thư mục build và môi trường Python được loại khỏi phạm vi format. Prettier không hỗ trợ Python; extension `ms-python.black-formatter` phụ trách các file backend `.py` với độ dài dòng 100.

| File / thư mục | Vai trò |
| --- | --- |
| `src/main.tsx` | Khởi động React và nạp CSS |
| `src/App.tsx` | Giao diện thư viện, breadcrumb, màn hình bài thực hành và state |
| `src/lib/labCatalog.ts` | Kiểu dữ liệu, 6 chủ đề, 12 bài và dữ liệu xem trước |
| `src/lib/labRoutes.ts` | Tạo đường dẫn, kiểm tra đường dẫn theo catalog |
| `src/lib/labRoutes.test.ts` | Kiểm tra đường dẫn hợp lệ, sai và đủ 12 bài |
| `src/components/BalanceScene.tsx` | Cảnh cân 3D và thao tác vật |
| `src/components/ConnectedBalanceLab.tsx` | Luồng bài cân nối API, CV, Coach, lịch sử và phản tư |
| `src/components/TopicScene.tsx` | Cảnh 3D của các chủ đề còn lại |
| `src/components/*Scenery.ts` | Bối cảnh, ánh sáng, chất liệu và mô hình |
| `src/lib/hands.ts`, `useCamera.ts` | Nhận diện cử chỉ và camera cho bài cân |
| `src/lib/api.ts` | Gọi API tạo/đọc phiên, chạy thử, Coach, hoàn thành |
| `backend/` | Backend thử nghiệm lưu bộ nhớ |
| `public/` | Tài nguyên 3D, texture, model nhận diện tay; nguồn asset trong `SOURCES.txt` của từng thư mục |

Tài liệu phân tích và SQL nằm tại [docs/v2](../docs/v2/README.md). Thiết kế giao diện tham khảo nằm tại `../design/`.

## Ngày 2 — luồng chọn bài

Mục tiêu là học sinh chọn đúng lớp → đúng chủ đề → đúng bài → vào lab, đồng thời có đường quay lại rõ ràng.

Rà soát đầu ngày cho thấy luồng chính và 12 cảnh/bài đã tồn tại. Công việc bổ sung gồm tách xử lý đường dẫn thành `labRoutes.ts`, chặn đường dẫn sai hoặc chủ đề sai khối, thêm màn hình không tìm thấy và liên kết quay lại theo cấp. Giao diện và cảnh 3D cũ được sử dụng tiếp.

Kiến thức cần đọc cùng mã:

- **Kiểu dữ liệu** — `Grade`, `LabTopic`, `Challenge` mô tả khối, chủ đề và bài nhỏ.
- **Props** — `topic`, `challenge` truyền dữ liệu từ App vào `ChallengeLab`.
- **State** — `route` xác định màn hình; `value`, `result` giữ trạng thái lượt thử.
- **Routing** — thay đổi phần sau dấu `#`, bắt sự kiện `hashchange`, tra catalog để chọn màn hình.
- **Key của React** — đổi bài sẽ tạo lại `ChallengeLab`, tránh dùng nhầm trạng thái của bài trước.

### Tự nghiệm thu ngày 2

1. Vào thư viện, chọn lớp 8 và kiểm tra có 3 chủ đề.
2. Chọn cân bằng đòn bẩy, kiểm tra có 2 bài và mở một bài 3D.
3. Dùng breadcrumb, liên kết quay lại, Back và Forward.
4. Làm tương tự với lớp 9; mở trực tiếp một URL bài và tải lại trang.
5. Thử `#/lab/8/9.1` hoặc `#/lab/8/8.2/khong-co`: phải có thông báo, không vào nhầm lab.
6. Kiểm tra trên màn hình nhỏ và thao tác bằng bàn phím.

### Kết quả kiểm tra ngày 08/11/2026

- `npm test`: 12 kiểm tra đạt, bao gồm đối chiếu đường dẫn của cả 12 bài trong catalog.
- `npm run build`: đạt kiểm tra TypeScript và build production. Còn cảnh báo bundle dùng chung của cảnh 3D khoảng 671 kB sau minify; cần tiếp tục theo dõi thời gian tải trên thiết bị thật.
- Chromium tự động trên server local: đạt luồng chọn lớp 8 → chủ đề cân → bài nhỏ → màn hình lab; quay về danh sách, Back, tải lại URL bài, các URL sai, danh sách lớp 9 và chiều rộng mobile 390 px. Không ghi nhận lỗi JavaScript trong lượt kiểm tra này.
- Kiểm tra trình duyệt trên tập trung điều hướng và hiển thị điều khiển của lab; chưa phải kiểm định toàn bộ vật lý, chất lượng CV hoặc tính đúng đắn của Coach. Bài kiểm tra bàn phím trong danh sách tự nghiệm thu vẫn cần kiểm tra thủ công đầy đủ.

## Nghiệm thu luồng kết nối bổ sung

- Frontend: 14 kiểm tra tự động đạt, gồm định tuyến và vòng đời giữ–di chuyển–thả/mất dấu tay bằng dữ liệu tổng hợp.
- Backend: 2 ca tích hợp đạt, bao phủ tạo phiên, kết quả, lưu trùng, phương án sai nhiệm vụ, nguồn Coach sai phiên, phản tư và khóa phiên đã hoàn thành.
- Trình duyệt với API thật: tạo phiên → lưu hai phương án → so sánh bằng Coach dự phòng → tải lại → phản tư → hoàn thành → tải lại vẫn hoàn thành. Không ghi nhận lỗi JavaScript; không tràn ngang ở 390 px.
- Camera giả lập: MediaPipe tải được model, chuyển trạng thái sẵn sàng và tắt giải phóng stream. Quyền camera bị từ chối được kiểm tra bằng giả lập lỗi có kiểm soát.
- Chưa nghiệm thu bàn tay thật và câu trả lời từ LLM thật. Chưa có lưu trữ bền vững bằng database.

## Tiếp theo — ngày 3

Trước khi sửa tiếp, làm theo [các bước ưu tiên U1–U5 và thực hành T1–T6](../PROGRESS.md#ưu-tiên-thực-hiện-trước-khi-viết-thêm-mã). Mỗi bước có kiến thức cần học/ôn và điều kiện chuyển bước. Bắt đầu bằng tự chạy frontend/backend và đọc đường đi của một lần bấm **Chạy thử và lưu**.

Tập trung bài cân: đọc cách chọn vật, chuyển tọa độ chuột sang bàn 3D, giới hạn vị trí hợp lệ, giữ–kéo–thả và thông báo thao tác. Quy tắc tính sẽ được tách và kiểm tra sâu ở ngày 4. Backend, lưu trữ, CV và Coach tiếp tục theo các mốc sau của lộ trình.
