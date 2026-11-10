# Tiến độ AI LifeLab

**Cập nhật gần nhất: 10/11/2026 · Mốc hiện tại: ngày 2 đã hoàn thiện; đã bổ sung luồng kết nối cho hai bài cân.**

Đây là nơi theo dõi tiến độ chung của dự án. Mốc ngày trong lộ trình là nhóm công việc, không phải số ngày đã trôi qua. Không quy đổi sang phần trăm khi chưa có tiêu chí nghiệm thu toàn dự án.

## Trạng thái hiện tại

| Hạng mục | Đã làm tới đâu | Còn thiếu / điều kiện hoàn thành |
| --- | --- | --- |
| Phạm vi và thiết kế | Có tài liệu phân tích, flow, ERD, schema SQL và thiết kế UI tham khảo | Đồng bộ tài liệu khi quy tắc hoặc phạm vi thực sự đổi |
| Thư viện và điều hướng | Lớp 8–9, 6 chủ đề, 12 bài nhỏ; chọn lớp → chủ đề → bài → lab; xử lý URL sai | Tiếp tục kiểm tra trải nghiệm trên thiết bị thật |
| Mô phỏng 3D | Cả 6 chủ đề có cảnh, mô hình/chất liệu và điều khiển; 12 bài có tham số riêng | Chưa kiểm định mức giống đời thực 98%; cần đánh giá hành vi theo từng kịch bản |
| Hai bài cân | Đã nối phiên → thao tác → dự đoán → API tính/lưu → Coach → phản tư → hoàn thành; khôi phục lượt đã lưu khi tải lại | Rà soát sâu thao tác vật ở ngày 3 và tách/kiểm thử quy tắc ở ngày 4 |
| Các chủ đề còn lại | Có giao diện, cảnh 3D và tính toán cục bộ | Chưa có luồng backend, lưu bài và Coach riêng cho từng chủ đề |
| CV | Bài cân có bật/tắt camera, nhận diện giữ–di chuyển–thả, xử lý lỗi và quay về chuột/slider | Đã thử camera giả lập và cử chỉ tổng hợp; chưa nghiệm thu tay thật |
| AI Coach | Có giao diện, tham chiếu lần thử, gợi ý dự phòng và adapter Ollama | Chưa nghiệm thu LLM thật; cần model được cấu hình và kiểm tra chất lượng trả lời |
| Lưu trữ | Backend lưu bộ nhớ, frontend giữ mã phiên trong sessionStorage | Chưa nối database; mất dữ liệu khi server khởi động lại |
| Tài khoản và giáo viên | Có thiết kế trong tài liệu | Chưa triển khai đăng nhập, phân quyền, giao bài và dashboard |
| Công cụ phát triển | Prettier frontend, Black Python, format khi lưu và script kiểm tra | Kiểm tra extension được nhận sau Reload Window trên máy sử dụng |
| Triển khai | Có hướng dẫn chạy local và build | Chưa triển khai công khai; backend local chưa có xác thực |

## Lịch sử thay đổi

Các dòng P001–P005 được tổng hợp từ tài liệu và công việc trước khi lập nhật ký. Chỉ ghi ngày đã xác định được; kết quả kiểm tra là kết quả tại mốc đó, không có nghĩa vừa chạy lại ngày hôm nay.

| Mã / ngày | Đã thay đổi gì | Trước → sau / đã thực hiện thế nào | Vì sao đổi | Kết quả, đã tới đâu | Kiểm chứng và giới hạn | Bước tiếp theo |
| --- | --- | --- | --- | --- | --- | --- |
| P001 · Trước 08/11/2026; chưa xác định ngày từng sửa đổi | Phạm vi, CV/Coach, flow và database | Thảo luận yêu cầu → gói tài liệu phân tích, sơ đồ và schema 13 bảng trong `docs/v2` | Chốt vai trò và dữ liệu trước khi triển khai | Có thiết kế toàn dự án | Có báo cáo kiểm tra schema trong gói; chưa kết nối database vào app | Triển khai theo luồng nhỏ, đối chiếu thiết kế |
| P002 · Trước 08/11/2026; chưa xác định ngày từng sửa đổi | Thư viện và 3D | Tạo frontend React/TypeScript, catalog 6 chủ đề/12 bài; thêm cảnh, model, texture và tính toán xem trước | Cho học sinh chọn và thử từng bài nhỏ trong lab | Có thư viện và các cảnh chạy local | Build và các đường dẫn từng được kiểm tra; chưa chứng minh chân thực 98% | Hoàn thiện điều hướng và kết nối chức năng |
| P003 · 08/11/2026 | Hoàn thiện ngày 2 | Tách `labRoutes.ts`, kiểm tra URL theo catalog, thêm trang không tìm thấy và liên kết quay lại; viết README | Tránh mở nhầm bài, giúp người khác hiểu cách chạy và tiến độ | Luồng chọn lớp → bài → lab hoàn thiện trong phạm vi ngày 2 | 12 kiểm tra định tuyến đạt; build và Chromium kiểm tra Back, tải lại, URL sai, mobile đạt | Ngày 3: thao tác vật trong bài cân |
| P004 · 08/11/2026 | Nối hai bài cân với backend, CV và Coach | Thêm `ConnectedBalanceLab`, gọi API phiên/lần thử/Coach/hoàn thành; khôi phục phiên; ràng buộc nhiệm vụ ở backend | Biến các phần mã thử nghiệm thành luồng sử dụng được trên giao diện | Hai bài cân có lịch sử, dự đoán, phản tư và trạng thái hoàn thành | Build, 14 kiểm tra frontend, 2 ca backend và trình duyệt toàn luồng đạt; camera giả lập đạt; LLM/tay thật chưa nghiệm thu | Thử tay thật, rà soát tương tác; tiếp tục quy tắc và lưu trữ theo lộ trình |
| P005 · 08/11/2026 | Sửa cấu hình format | Kiểm tra log; tách Prettier cho frontend và Black cho Python; thêm config, scripts, extension; format lại mã | Prettier không hỗ trợ `.py`; cần cách format thống nhất | Frontend và backend được format, bật format khi lưu | `format:check`, build, 14 kiểm tra frontend và 2 ca backend đạt | Dùng Ctrl+S; Reload Window nếu extension chưa được nhận |
| P006 · 10/11/2026 | Lập bảng tiến độ và quy trình cập nhật | Thêm `PROGRESS.md`, yêu cầu cập nhật trong `AGENTS.md`, liên kết từ hai README | Theo dõi thay đổi, lý do, trạng thái và bước tiếp theo với ít chi phí | Có một nguồn tiến độ chung và quy trình cập nhật sau mỗi đợt | Đối chiếu README hiện có, kiểm tra các file/liên kết nội bộ; không chạy lại test ứng dụng cho thay đổi tài liệu | Khi có yêu cầu triển khai tiếp: đọc trạng thái, làm việc, kiểm tra phù hợp và cập nhật một dòng |
| P007 · 10/11/2026 | Bổ sung ưu tiên và kiến thức trước thực hành | Thay danh sách bước tiếp theo bằng hai giai đoạn: kiểm tra/đọc hiểu trước, thực hành sau; thêm kiến thức và tiêu chí chuyển bước | Giúp người học biết bắt đầu ở đâu và tránh sửa mã khi chưa hiểu luồng đang có | Có thứ tự học–làm bám trạng thái hiện tại; chưa triển khai thêm chức năng | Kiểm tra cấu trúc bảng và liên kết tài liệu; không chạy lại test ứng dụng cho thay đổi tài liệu | Bắt đầu U1: tự chạy frontend/backend và kiểm tra một lượt bài cân |
| P008 · 10/11/2026 | Xuất bản web tiến độ | Thêm trình xuất Python chuẩn, trang HTML offline có mục lục, trạng thái, bước mở rộng, lịch sử mới nhất trước và in/PDF; liên kết README và hướng dẫn xuất lại | Dễ đọc trên máy tính/điện thoại; giữ một nguồn nội dung và tránh tác vụ nền | Có bản web sinh từ PROGRESS.md; không thay đổi chức năng ứng dụng | Kiểm tra xuất HTML, nội dung và trình duyệt desktop/mobile; không chạy lại test ứng dụng cho trang tài liệu | Mở bản web, bắt đầu U1; xuất lại sau mỗi đợt cập nhật tiến độ |

## Ưu tiên thực hiện trước khi viết thêm mã

**Bắt đầu từ U1, lần lượt tới U5, rồi thực hành T1.** Đây là bước chuẩn bị cho phần còn lại của lộ trình 20 ngày, không phải thêm năm ngày bắt buộc. Bước nào tự làm và giải thích được rồi thì chỉ kiểm tra nhanh. Không cần học hết lý thuyết trước khi thực hành.

| Ưu tiên | Nên làm gì trước? | Kiến thức nên học hoặc ôn | Khi nào chuyển bước? |
| --- | --- | --- | --- |
| U1 · Chạy được dự án | Mở `lifelab` trong VS Code. Làm theo README để chạy frontend và backend ở hai terminal. Mở `/api/health`, rồi vào bài cân, tạo phiên và lưu một lượt. Nếu lỗi, ghi nguyên thông báo trước khi sửa | **Ôn:** thư mục, đường dẫn, terminal, lệnh chạy. **Học:** tiến trình là chương trình đang chạy; cổng 5173 và 8000 là hai địa chỉ dịch vụ khác nhau; môi trường Python `.venv` tách thư viện dự án | Tự chạy lại được; phân biệt lỗi giao diện, server chưa chạy và cổng bị chiếm. Không coi việc máy đã từng chạy được là bản thân đã nắm bước này |
| U2 · Hiểu đường đi của một thao tác | Mở lần lượt `App.tsx` → `ConnectedBalanceLab.tsx` → `lib/api.ts` → `backend/app.py` → `backend/domain.py`. Lần theo nút **Chạy thử và lưu**. Viết lại bằng lời dữ liệu đi qua từng file | **Ôn:** biến, hàm, tham số, điều kiện, object/dictionary, array/list. **Học:** component, props, state; `async/await` là chờ một thao tác bất đồng bộ; `try/catch` xử lý lỗi | Chỉ ra được ai đọc vị trí A, ai gửi yêu cầu, ai tính kết quả và ai cập nhật lịch sử. Mã đã có nên ưu tiên đọc và giải thích trước khi viết lại |
| U3 · Thấy API đang làm việc | Mở DevTools → Network, bấm chạy thử, xem yêu cầu `/api/sessions/{id}/attempts`. Đọc dữ liệu gửi đi và kết quả trả về; đối chiếu tài liệu `/docs` của backend | **Học:** HTTP, GET/POST, JSON; request là yêu cầu, response là phản hồi; mã 200/422/409; validation là kiểm tra đầu vào. Vite proxy chuyển yêu cầu `/api` từ frontend tới backend | Tự chỉ ra method, đường dẫn, body và response của một lượt; giải thích vì sao backend phải kiểm tra dù giao diện đã giới hạn |
| U4 · Biết dữ liệu đang nằm ở đâu | Lưu hai lượt, tải lại trang và xem lịch sử. Sau đó thử khởi động lại backend với **phiên thử không quan trọng**, quan sát phiên cũ không còn. Đọc ERD để phân biệt thiết kế dự kiến với lưu trữ thực tế | **Học:** state chỉ nằm ở giao diện; sessionStorage giữ mã phiên trong tab; RAM server giữ dữ liệu tạm; database lưu bền vững. **Làm quen:** bảng, hàng, cột, khóa chính, khóa ngoại | Giải thích được vì sao tải lại trang có thể còn bài nhưng khởi động lại server lại mất. Chưa cần thuộc cả 13 bảng hoặc tạo database ngay |
| U5 · Chốt phạm vi sửa kế tiếp | Chọn bài cân làm bài mẫu. Liệt kê các trường hợp cần thử: thả đúng/sai vạch, mất dấu tay, từ chối camera, API lỗi, gửi lại lượt, hoàn thành phiên. Ghi hiện tượng thực tế; ưu tiên lỗi chặn luồng trước | **Học:** tiêu chí nghiệm thu, tái hiện lỗi, kiểm thử trường hợp biên. **Ôn:** đọc log và thông báo lỗi. CV thật/LLM thật phải có ghi nhận riêng với bản giả lập/dự phòng | Có danh sách ngắn các lỗi hoặc việc chưa kiểm chứng. Chọn một việc cho T1; chưa mở rộng cả sáu chủ đề cùng lúc |

## Các bước thực hành tiếp theo

Mỗi bước thực hành gồm đọc đoạn mã liên quan → tự thay đổi một phần nhỏ → chạy trường hợp đúng và sai → giải thích kết quả → cập nhật một dòng tiến độ. Học hoặc ôn kiến thức ở đúng bước sử dụng; không viết lại chức năng đã có chỉ để đánh dấu đủ ngày.

| Thứ tự / mốc | Việc thực hành cụ thể | Học hoặc ôn ngay trước khi làm | Đầu ra và điều kiện hoàn thành |
| --- | --- | --- | --- |
| T1 · Ngày 3 | Rà soát giữ–kéo–thả trong `BalanceScene.tsx`, `hands.ts`, `useCamera.ts`. Tái hiện từng trường hợp ở U5; sửa lỗi đã thấy. Thử tay thật khi có camera, giữ chuột/slider làm cách tiếp tục khi camera lỗi | Sự kiện, tọa độ màn hình/3D, raycasting để chọn vật; trạng thái rảnh/giữ/thả; ngưỡng cử chỉ, hủy giữ khi mất dấu; dọn tài nguyên camera | Không kẹt vật, thả sai quay về vị trí hợp lệ, tắt camera trả quyền điều khiển. Ghi điều kiện thử, kết quả và phần chưa thử bằng tay thật |
| T2 · Ngày 4 | Rà soát quy tắc trong `backend/domain.py`, xác định công thức và đơn vị; dùng kết quả backend làm nguồn cho bài cân. Kiểm tra cân bằng, nghiêng hai phía và đầu vào không hợp lệ | Hàm thuần nhận đầu vào và trả kết quả; mômen `m × g × khoảng cách`, mét và N·m; sai số số thực; kiểm thử đơn vị | Công thức có giải thích, các trường hợp biên được kiểm tra; chỉ sửa/tách phần còn trùng hoặc sai. Không coi cảnh đẹp là bằng chứng vật lý đúng |
| T3 · Ngày 5–6 | Dùng API có sẵn để học backend: tự đọc/viết một endpoint nhỏ khi cần, thêm kiểm tra đầu vào hoặc xử lý lỗi đã xác định; quan sát lại Network và `/docs` | Hàm Python, kiểu dữ liệu, Pydantic, HTTP, JSON, mã lỗi, `async/await`; cách tránh tạo hai lượt khi gửi lại cùng yêu cầu | Tự giải thích được một endpoint và tự sửa một yêu cầu nhỏ; thử cả dữ liệu hợp lệ/sai. Luồng hiện có vẫn chạy |
| T4 · Ngày 7–10 | Đối chiếu ERD với dữ liệu thật của phiên/lượt/Coach/phản tư. Tạo migration, tự thực hành SELECT/INSERT/JOIN, rồi nối backend với database theo thiết kế đã chốt | SQL, khóa và quan hệ; ràng buộc; transaction để nhóm ghi dữ liệu cùng thành công; migration để quản lý thay đổi cấu trúc | Bài được đọc lại sau khi server khởi động lại; dữ liệu có quan hệ đúng. Chốt cách ánh xạ thiết kế trước khi sửa code lưu trữ; không tạo lại schema tùy tiện |
| T5 · Ngày 11–15 | Thêm đăng nhập/phân quyền; kiểm tra học sinh chỉ xem bài của mình. Tiếp tục nghiệm thu CV thật trên luồng đã ổn định thay vì viết lại phần tích hợp đang có | Băm mật khẩu, xác thực và phân quyền khác nhau thế nào; quyền kiểm tra ở backend; độ trễ, nhận nhầm và điều kiện ánh sáng của CV | Truy cập trái quyền bị từ chối; CV có ghi nhận thử tay thật và cách xử lý lỗi. Chưa đạt thì ghi phần thiếu |
| T6 · Ngày 16–20 | Cấu hình LLM thật, đánh giá Coach bằng câu hỏi mẫu; tiếp tục giao bài/giáo viên, mở rộng từng mô phỏng rồi kiểm thử và triển khai theo phạm vi khả thi | Prompt/ngữ cảnh, giới hạn mô hình, đánh giá câu trả lời; API theo kịch bản; cấu hình môi trường, HTTPS và log | Phân biệt kết quả thật/dự phòng, có kiểm chứng từng phần. Chỉ mở rộng sau khi bài mẫu đủ ổn định; phần chưa đạt được ghi lại, không mặc định hoàn thành hết ở ngày 20 |

**Việc nên làm ngay:** U1 rồi U2 — tự chạy hai dịch vụ và lần theo một lần bấm **Chạy thử và lưu**. Chưa cần cài thêm công nghệ hoặc mở rộng chức năng ở bước này.

Danh sách này là kế hoạch học và làm, chưa phải các công việc đã hoàn thành hoặc đang tự động triển khai. Cách chạy chi tiết nằm trong [README ứng dụng](lifelab/README.md).

## Cách cập nhật tiết kiệm tài nguyên

Sau một đợt thay đổi, agent ghi **một dòng** gồm việc đổi, cách làm, lý do, kết quả, kiểm chứng và bước tiếp theo; cập nhật trạng thái hiện tại nếu cần. Không tạo tác vụ nền, không quét theo thời gian, không gọi AI định kỳ và không ghi theo từng lần lưu file.

Quy định nằm trong [AGENTS.md](AGENTS.md). Cơ chế áp dụng cho công việc do agent thực hiện có đọc hướng dẫn workspace; thay đổi thủ công hoặc công cụ khác cần được tổng hợp khi rà soát tiếp. Hỏi kiến thức hoặc xem tiến độ mà không sửa dự án sẽ không tạo dòng mới.

Tài liệu liên quan: [README ứng dụng](lifelab/README.md), [thiết kế hệ thống](docs/v2/README.md).

Bản đọc trên trình duyệt: [Tiến độ và lộ trình học](docs/AI-LifeLab-Tien-do.html). Được sinh bằng `python scripts/render_progress.py` tại gốc workspace sau mỗi lần cập nhật tài liệu nguồn.
