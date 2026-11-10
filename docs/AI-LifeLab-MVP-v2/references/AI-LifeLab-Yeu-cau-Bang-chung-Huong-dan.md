# AI LifeLab — Yêu cầu, bằng chứng và hướng dẫn thiết kế

**Bản thiết kế bước 4 và 6 đã thực hiện:** [CV, AI, kiến trúc, ERD và API](AI-LifeLab-Thiet-ke-CV-AI-He-thong.html). Bản này chốt 10 bảng, thêm snapshot người nhận bài so với gợi ý 9 bảng ban đầu bên dưới; khi triển khai ưu tiên bản thiết kế mới.

**Ngày soạn:** 28/10/2026.  
**Dùng cùng:** [Đặc tả 6 nhiệm vụ MVP](AI-LifeLab-Dac-ta-MVP.html). Tài liệu đó là nơi quy định công thức, dữ liệu mẫu, giả định và giới hạn thực tế.  
**Phạm vi:** Viết hoàn chỉnh mục 3 và 5; hướng dẫn thực hiện mục 4 và 6. Các thiết kế kỹ thuật dưới đây là bản khởi đầu để nhóm hoàn thiện trước khi code, không phải hệ thống đã triển khai.

| Phần | Bạn dùng để làm gì? |
|---|---|
| 3 — Yêu cầu và nghiệm thu | Biết phải xây chức năng gì và kiểm tra thế nào |
| 5 — Bằng chứng học tập | Biết cần ghi gì, nhận xét dựa vào đâu và hiển thị ra sao |
| 4 — Vai trò CV và AI | Chốt ranh giới xử lý, dữ liệu trao đổi và thử nghiệm kỹ thuật |
| 6 — Thiết kế hệ thống | Vẽ kiến trúc, thiết kế bảng dữ liệu, API và phân quyền |

## 3. Yêu cầu và tiêu chí nghiệm thu

### 3.1. Quy ước nghiệm thu

Mỗi mã yêu cầu tương ứng một chức năng có thể kiểm tra. “Đạt” nghĩa là chức năng chạy đúng trong phạm vi dữ liệu và quy tắc đã chốt; không có nghĩa mô hình đã được xác nhận đúng ngoài đời.

**Đã lưu** chỉ được hiển thị sau khi máy chủ xác nhận lưu thành công. **Hoàn thành trải nghiệm** không đồng nghĩa học sinh có năng lực cao hoặc chọn được phương án tốt nhất.

### 3.2. Yêu cầu chức năng

| Mã | Chức năng cần có | Tiêu chí nghiệm thu |
|---|---|---|
| FR-01 | Đăng nhập và nhận diện vai trò | Tài khoản học sinh mở khu vực học sinh; tài khoản giáo viên mở khu vực giáo viên. Máy chủ nhận diện người dùng từ phiên đăng nhập. |
| FR-02 | Xem thư viện | Có đủ 6 nhiệm vụ; lọc lớp 8/lớp 9 đúng nội dung. Mỗi nhiệm vụ có mục tiêu, dữ liệu và giới hạn mô hình trước khi bắt đầu. |
| FR-03 | Giáo viên giao nhiệm vụ | Giáo viên chọn bài có sẵn, lớp mình quản lý, hướng dẫn và thời hạn. Sau khi lưu, đúng học sinh của lớp thấy nhiệm vụ. Không có trình tạo kịch bản. |
| FR-04 | Bắt đầu và tiếp tục phiên | Bắt đầu tạo một phiên gắn với người học và phiên bản bài. Mở lại đúng phiên khôi phục được dữ liệu đã lưu, các lượt thử và phản tư nháp. |
| FR-05 | Thay đổi đầu vào | Chỉ nhận lựa chọn thuộc miền cho phép của bài. Dữ liệu sai được chỉ rõ tại trường liên quan; không tạo kết quả mới từ đầu vào sai. |
| FR-06 | Chạy mô phỏng | Máy chủ tính bằng bộ quy tắc của bài, trả kết quả khớp bộ KT-01 đến KT-14 của đặc tả. Gửi trùng cùng yêu cầu chạy không tạo hai lượt thử. |
| FR-07 | Thử lại và so sánh | Sau khi đổi đầu vào, lượt chạy tiếp tạo bản ghi mới; lượt cũ còn nguyên. Giao diện so sánh đầu vào, đầu ra và đơn vị tương ứng của hai lượt cùng phiên bản bài. |
| FR-08 | Lưu bản nháp | Lưu lựa chọn hiện tại và phản tư nháp. Khi lỗi mạng, báo chưa lưu; sau khi kết nối lại có thể thử lưu. Hai tab sửa cùng phiên không âm thầm ghi đè bản mới hơn. |
| FR-09 | Nhận gợi ý từ AI Coach | Coach nhận nhiệm vụ và dữ liệu của phiên đang mở. Khi AI lỗi hoặc quá thời gian chờ, câu hỏi có sẵn vẫn xuất hiện và học sinh vẫn tiếp tục được. |
| FR-10 | Viết phản tư | Có ít nhất một câu hỏi gắn với bài và ô trả lời. Học sinh mở lại được kết quả để tham khảo. Câu trả lời nháp được khôi phục sau khi mở lại phiên đã lưu. |
| FR-11 | Hoàn thành nhiệm vụ | Kiểm tra điều kiện của bài, lượt thử được chọn và phản tư không rỗng. Lưu kết quả và phản tư cuối thành công rồi mới chuyển Hoàn thành. Lỗi lưu không được báo hoàn thành. |
| FR-12 | Xem hồ sơ và bằng chứng | Học sinh xem được nhiệm vụ đã hoàn thành, lựa chọn, kết quả và nhận xét có nguồn. Mở một nhận xét phải truy được phiên/lượt thử hoặc phản tư tương ứng. |
| FR-13 | Gợi ý trải nghiệm tiếp theo | Chỉ gợi ý bài phù hợp khối lớp, ưu tiên bài chưa hoàn thành và kỹ năng học sinh tự chọn; có lý do hiển thị. Nếu không có bài phù hợp, cho mở thư viện hoặc thử lại. |
| FR-14 | Giáo viên theo dõi | Trong nhiệm vụ của lớp mình, giáo viên thấy trạng thái từng học sinh, xem lượt thử, phản tư và lưu góp ý. Học sinh chưa bắt đầu vẫn được tính trong danh sách lớp. |
| FR-15 | Cử chỉ ở bài 8.2 | Cử chỉ chọn/thả một công trình vào ô cố định tạo cùng lựa chọn như chuột. Thả sai ô không áp dụng; tắt/từ chối camera vẫn làm và hoàn thành bài bằng chuột được. |

Tài khoản có thể được chuẩn bị sẵn cho đợt thử nghiệm. Đăng ký công khai, mạng xã hội, xếp hạng học sinh và quản trị trường học nhiều cấp nằm ngoài MVP.

### 3.3. Điều kiện hoàn thành từng nhiệm vụ

| Nhiệm vụ | Điều kiện để chuyển Hoàn thành | Kiểm tra phép tính |
|---|---|---|
| 8.1 — Mực nước | Đã chạy ít nhất 2 ngưỡng khác nhau trên cả hai bộ dữ liệu, chọn lượt cuối và giải thích | KT-01 đến KT-04 |
| 8.2 — Lưu nước mưa | Có một phương án hợp lệ chứa công trình và phản tư về lượng nước/chi phí | KT-05, KT-06 |
| 8.3 — Tiền tiêu vặt | Có kế hoạch trước sự kiện và bản điều chỉnh hợp lệ sau chi phí phát sinh; giải thích thay đổi | KT-07, KT-08 |
| 9.1 — Năng lượng | Có một cấu hình trong miền cho phép, kết quả và phản tư | KT-09, KT-10 |
| 9.2 — Tiết kiệm tháng | Có kế hoạch trước sự kiện và kế hoạch hợp lệ sau tăng chi phí; giải thích | KT-11 đến KT-13 |
| 9.3 — Kế hoạch kỹ năng | Có kỹ năng, ít nhất một hoạt động, ngày, sản phẩm dự kiến, tổng thời gian hợp lệ và lý do | KT-14 |

Phản tư không rỗng là điều kiện lưu, không phải tiêu chí đánh giá chất lượng. Với 8.2 và 9.1, chưa đạt mục tiêu tối ưu vẫn được hoàn thành nếu đã thực hiện và phản tư theo yêu cầu. Với 9.3, Hoàn thành chỉ là hoàn thành bài lập kế hoạch.

### 3.4. Yêu cầu phi chức năng

Các con số dưới đây là **mục tiêu thử nghiệm đề xuất**, cần kiểm tra trên thiết bị và mạng nhóm ghi rõ; chưa phải kết quả đo.

| Mã | Yêu cầu | Cách kiểm tra |
|---|---|---|
| NF-01 | Bảo vệ quyền truy cập | Học sinh A không đọc/sửa phiên của B; giáo viên không đọc lớp ngoài phạm vi quản lý. Thử bằng yêu cầu trực tiếp tới máy chủ, không chỉ ẩn nút trên UI. |
| NF-02 | Kết quả nhất quán | Lặp cùng đầu vào, phiên bản quy tắc và dữ liệu 10 lần; kết quả số/trạng thái giống nhau. ID và thời gian tạo được phép khác. |
| NF-03 | Phản hồi mô phỏng nhanh | Với dữ liệu mẫu, ít nhất 19/20 lần chạy trả kết quả trong 1 giây, không tính AI. Ghi thiết bị, mạng và số người dùng khi đo. |
| NF-04 | Lưu và phản hồi rõ | Mục tiêu gửi lưu trong 3 giây sau khi ngừng sửa; biểu thị Đang lưu/Đã lưu/Chưa lưu theo phản hồi thật của máy chủ. |
| NF-05 | Không phụ thuộc AI | Đề xuất chờ tối đa 10 giây cho một lần hỏi, sau đó dùng gợi ý cố định và cho thử lại. Không khóa kết quả, phản tư hay hoàn thành vì AI lỗi. |
| NF-06 | Có thể sử dụng không cần camera | Toàn bộ nhiệm vụ có đường thao tác chuột/bàn phím. Trạng thái có chữ, lỗi gắn trường nhập; các điều khiển chính có thể tiếp cận bằng bàn phím. |
| NF-07 | Không lưu dữ liệu camera không cần thiết | Xử lý cử chỉ trên thiết bị; không gửi/lưu video mặc định. Chỉ gửi lựa chọn công trình/ô được xác nhận. Kiểm tra dữ liệu gửi đi và dữ liệu đã lưu. |
| NF-08 | Dữ liệu gốc có thể đối chiếu | Mọi nhận xét đang hiển thị tham chiếu được dữ liệu còn tồn tại, đúng phiên. Không sửa ngầm kết quả cũ khi cập nhật bộ quy tắc. |

### 3.5. Bộ kiểm tra luồng dùng chung

| Mã | Thực hiện | Kết quả cần thấy |
|---|---|---|
| AC-01 | Gửi đầu vào ngoài miền cho phép | Máy chủ từ chối; không thêm lượt thử |
| AC-02 | Bấm chạy hai lần nhanh với cùng mã yêu cầu | Chỉ có một lượt; nhận lại cùng kết quả đã lưu |
| AC-03 | Chạy lại sau khi đổi lựa chọn | Có lượt mới; so sánh được với lượt trước |
| AC-04 | Sửa dữ liệu, lưu thành công, đóng rồi mở lại | Khôi phục đúng bản đã lưu |
| AC-05 | Ngắt mạng khi lưu | Hiện Chưa lưu; không báo thành công; dữ liệu đang sửa chưa bị xóa |
| AC-06 | Cho hai tab lưu cùng phiên từ cùng bản nháp cũ | Tab đến sau nhận thông báo xung đột và lựa chọn tải bản mới; không tự ghi đè |
| AC-07 | Cho AI lỗi | Vẫn thấy kết quả và câu hỏi có sẵn; hoàn thành được bài |
| AC-08 | Hoàn thành bài rồi mở hồ sơ | Phản tư cuối và bằng chứng mở đúng lượt thử |
| AC-09 | Truy cập dữ liệu của người/lớp khác | Máy chủ từ chối, không trả nội dung |
| AC-10 | Từ chối camera, sau đó làm bằng chuột | Bài 8.2 vẫn thao tác, chạy và hoàn thành được |

## 5. Thiết kế bằng chứng học tập

### 5.1. Phân biệt ba loại thông tin

| Loại | Ví dụ | Cách sử dụng |
|---|---|---|
| Sự kiện/kết quả hệ thống ghi được | Học sinh chạy ngưỡng 75 cm rồi chạy 60 cm | Bằng chứng về việc đã làm; chưa nói được vì sao làm |
| Lời giải thích của học sinh | “Em muốn cảnh báo trước khi mức nước đạt 80 cm.” | Bằng chứng về lý do học sinh trình bày; cần đọc cùng kết quả |
| Nhận xét AI hoặc giáo viên | “Lời giải thích gắn với thời điểm cảnh báo.” | Diễn giải dựa trên hai loại trên; phải có nguồn và người tạo |

Không dùng câu trả lời do AI tạo làm bằng chứng rằng học sinh đã suy luận. Không lấy số lần bấm, thời gian dùng ứng dụng hoặc việc chọn kết quả tối ưu làm đại diện trực tiếp cho năng lực.

### 5.2. Ba tiêu chí dùng chung

Đây là rubric đề xuất theo mục tiêu nhiệm vụ, cần giáo viên xem lại trước khi thử với học sinh; chưa phải thang đo năng lực đã được chuẩn hóa. Căn cứ nguyên lý học tập và giới hạn của mô hình được trình bày trong bản đặc tả đi kèm.

| Mã | Tiêu chí | Biểu hiện có thể quan sát | Chưa đủ để kết luận |
|---|---|---|---|
| EV-01 | Sử dụng dữ liệu | Nêu một số liệu/điều kiện đúng và liên hệ với lựa chọn | Chỉ chép lại con số mà không giải thích liên quan |
| EV-02 | Cân nhắc đánh đổi | Nêu ưu tiên, điều phải chấp nhận hoặc một phương án khác | Chọn phương án rẻ nhất hoặc tiết kiệm nhất mà không có lý do |
| EV-03 | Điều chỉnh có lý do | Có hai bản/lượt khác nhau và giải thích gắn với kết quả hoặc sự kiện | Đổi lựa chọn nhiều lần nhưng không nêu được căn cứ |

### 5.3. Cách ghi nhận từng tiêu chí

| Trạng thái | Khi dùng | Ví dụ cách hiển thị |
|---|---|---|
| Chưa đủ bằng chứng | Chưa có câu trả lời hoặc chưa có dữ liệu cần thiết | “Chưa đủ thông tin để nhận xét việc so sánh phương án.” |
| Cần làm rõ | Có giải thích nhưng còn mâu thuẫn hoặc chưa gắn được với dữ liệu | “Bạn có thể chỉ ra kết quả nào khiến mình đổi ngưỡng không?” |
| Có bằng chứng | Có dữ liệu cụ thể và lời giải thích phù hợp để minh họa tiêu chí trong phiên này | “Bạn dùng thời điểm cảnh báo để giải thích lựa chọn ở phiên này.” |
| Không áp dụng | Nhiệm vụ/lượt học không yêu cầu biểu hiện đó | Không đưa tiêu chí vào tổng hợp của phiên |

Đây là trạng thái nhận xét, không phải thang điểm năng lực. Thiếu bằng chứng không đồng nghĩa học sinh yếu. EV-03 ở nhiệm vụ chỉ có một lượt thử có thể là Chưa đủ bằng chứng; không buộc học sinh làm thêm nếu điều kiện hoàn thành của bài không yêu cầu.

### 5.4. Bằng chứng cho 6 nhiệm vụ

| Nhiệm vụ | Dữ liệu quan sát cần lưu | Phần học sinh giải thích | Tiêu chí có thể minh họa |
|---|---|---|---|
| 8.1 | Hai ngưỡng, kết quả A/B và lượt cuối được chọn | Vì sao ưu tiên cảnh báo sớm hoặc hạn chế cảnh báo giả | EV-01, EV-02; EV-03 nếu giải thích được thay đổi |
| 8.2 | Công trình, chi phí, sức chứa và nước chưa được giữ | Đánh đổi giữa chi phí và lượng nước giữ được; giới hạn suy luận về ngập | EV-01, EV-02; EV-03 nếu có sửa phương án |
| 8.3 | Kế hoạch trước/sau phát sinh, tổng phân bổ, tiết kiệm | Vì sao giảm hoặc giữ một khoản khi nguồn tiền còn 280.000 đồng | EV-01, EV-02, EV-03 |
| 9.1 | Số giờ từng nhóm, điện năng, chênh lệch với hiện trạng | Vì sao điều chỉnh nhóm đó và vẫn theo giới hạn bài | EV-01, EV-02; EV-03 nếu có thay đổi |
| 9.2 | Tiết kiệm trước/sau, chi phí mới, số tháng dự kiến | Vì sao giữ/đổi mức tiết kiệm và mục tiêu bị ảnh hưởng thế nào | EV-01, EV-02, EV-03 |
| 9.3 | Kỹ năng tự chọn, hoạt động, tổng phút, sản phẩm dự kiến | Vì sao chọn kế hoạch và sản phẩm nào sẽ giúp tự nhìn lại | EV-01, EV-02; EV-03 nếu có sửa kế hoạch |

### 5.5. Cấu trúc một bản ghi bằng chứng

| Trường | Nội dung cần có |
|---|---|
| Mã bằng chứng | Định danh để mở lại và tránh ghi trùng |
| Người học và phiên | Lấy từ phiên có quyền truy cập, không tin ID học sinh do giao diện tự gửi |
| Nhiệm vụ và phiên bản | Ví dụ 8.1, nội dung v1, dữ liệu A/B v1, bộ quy tắc v1 |
| Tiêu chí | EV-01, EV-02 hoặc EV-03 |
| Dữ liệu gốc tham chiếu | ID lượt thử, ID phản tư cuối; nguồn phải thuộc cùng phiên |
| Quan sát | Mô tả trung tính: đổi từ 75 xuống 60 cm, kết quả thay đổi thế nào |
| Nhận xét và trạng thái | Đoạn nhận xét ngắn, trạng thái theo bảng 5.3; có thể chưa được nhận xét |
| Nguồn tạo | Hệ thống ghi sự kiện, AI đề xuất nhận xét, hoặc giáo viên nhận xét |
| Thời điểm | Ngày tạo và ngày giáo viên xem lại nếu có |

**Ví dụ:** Hai lượt 8.1 cho thấy học sinh đổi 70 xuống 60 cm; bộ A cảnh báo từ phút 5 thành phút 4. Phản tư cuối viết muốn cảnh báo trước mốc nguy cơ của bài. Có thể nhận xét EV-01 và EV-03 trong phiên này; chưa đủ để kết luận “có năng khiếu kỹ thuật”.

### 5.6. Quy trình cập nhật hồ sơ

| Bước | Việc hệ thống làm |
|---|---|
| 1. Lưu lượt thử | Giữ nguyên đầu vào, kết quả và phiên bản đã dùng |
| 2. Lưu phản tư cuối | Khi hoàn thành, chốt một bản phản tư; bản nháp trước đó chưa dùng làm nhận xét chính thức |
| 3. Tạo quan sát | Từ kết quả và khác biệt giữa các lượt, tạo mô tả sự việc, chưa tự gắn mức năng lực |
| 4. Nhận xét hỗ trợ | AI có thể đề xuất trạng thái/nhận xét kèm ID nguồn. Nếu lỗi hoặc thiếu căn cứ, giữ Chưa đủ bằng chứng hoặc Chưa nhận xét |
| 5. Giáo viên xem lại | Có thể ghi nhận xét riêng; hiển thị phân biệt AI và giáo viên, giữ lại nguồn gốc |
| 6. Hiển thị hồ sơ | Gom theo tiêu chí và các phiên đã hoàn thành; cho mở từng minh chứng, không tạo điểm tính cách |

Mỗi tiêu chí chỉ có một bản tổng hợp hiện hành trong một phiên. Gửi lặp thao tác hoàn thành không tăng số bằng chứng. Khi nói “có bằng chứng trong 3 phiên”, phải đếm 3 phiên khác nhau, không đếm 3 lần bấm trong một phiên.

MVP cho sửa phản tư nháp trước khi hoàn thành. Sau khi hoàn thành, giữ bản cuối; muốn học lại thì tạo phiên mới. Chưa làm chức năng sửa ngược bài đã hoàn thành hoặc tái đánh giá toàn bộ lịch sử.

### 5.7. Nghiệm thu bằng chứng

| Mã | Kiểm tra | Kết quả mong đợi |
|---|---|---|
| BE-01 | Chỉ có hai lượt đổi ngưỡng, không giải thích | Ghi được sự thay đổi; chưa tự kết luận EV-03 Có bằng chứng |
| BE-02 | Giải thích dùng kết quả phút 4, dữ liệu thật của lượt là phút 5 | Gợi ý làm rõ; không nhận xét như dữ liệu đã khớp |
| BE-03 | AI trả ID lượt không thuộc phiên | Từ chối phần tham chiếu/nhận xét đó; dữ liệu gốc và kết quả vẫn còn |
| BE-04 | Mở nhận xét từ hồ sơ | Mở đúng lượt thử và phản tư đã dùng |
| BE-05 | Gửi lại yêu cầu hoàn thành | Không tạo phản tư cuối hoặc bằng chứng trùng |
| BE-06 | AI và giáo viên nhận xét khác nhau | Hai nguồn được phân biệt; không sửa ngầm lời học sinh hoặc kết quả tính |

## 4. Hướng dẫn chốt vai trò CV và AI

### 4.1. Bước 1 — Chia trách nhiệm trước khi chọn công nghệ

| Thành phần | Được làm | Không được làm |
|---|---|---|
| Giao diện | Nhận thao tác, hiển thị mô hình, sửa/lưu nháp và trình bày kết quả | Tự quyết định kết quả cuối thay máy chủ |
| CV trên thiết bị | Chuyển cử chỉ thành chọn/thả công trình ở bài 8.2 | Đánh giá năng lực từ khuôn mặt, cử chỉ hoặc video |
| Simulation Engine | Kiểm tra miền đầu vào, dùng cấu hình bài, tính kết quả và điều kiện hoàn thành | Dùng câu trả lời LLM làm kết quả tính toán |
| AI Coach | Đặt câu hỏi theo nhiệm vụ/lượt thử, đưa gợi ý tăng dần | Sửa số dư, sức chứa, điện năng, nhãn nguy cơ hoặc phiên bản quy tắc |
| AI hỗ trợ phản tư | Đề xuất nhận xét theo EV-01 đến EV-03 và tham chiếu dữ liệu | Tự kết luận năng lực cố định; coi đầu ra AI là bằng chứng học sinh đã làm |
| Máy chủ và cơ sở dữ liệu | Kiểm tra quyền, lưu, chống ghi trùng và truy xuất bằng chứng | Tin dữ liệu nhạy cảm hoặc kết quả do máy khách tự khai |

**Đầu ra bước này:** Một bảng trách nhiệm được cả hai thành viên thống nhất. Chưa cần chọn mô hình AI trả phí hoặc huấn luyện mô hình CV riêng.

### 4.2. Bước 2 — Chốt đúng một thao tác CV

Chỉ thử bài 8.2: **chọn một công trình rồi thả vào ô hợp lệ**. Ba công trình là bồn, bể và hồ; vị trí A/B/C đã cố định trong đặc tả.

| Tình huống | Cách xử lý cần thiết kế |
|---|---|
| Mở camera | Giải thích mục đích, cho bật/tắt; chuột luôn dùng được |
| Nhận cử chỉ chọn | Hiển thị công trình đang được chọn, chưa áp dụng chi phí |
| Nhả ở đúng ô | Áp dụng một lần vào bản nháp và hiển thị thay đổi |
| Nhả sai ô hoặc mất tay | Hủy thao tác đang kéo, giữ bản nháp đã xác nhận |
| Rung hoặc nhận lặp | Một lần chọn/thả chỉ tạo một hành động; không tự chọn nhiều công trình |
| Máy chủ kiểm tra | Kiểm tra công trình, ô và ràng buộc như thao tác chuột |

Mẫu dữ liệu chuẩn hóa sau khi giao diện xác nhận thao tác:

```json
{
  "action": "PLACE_FACILITY",
  "facility_id": "tank",
  "slot_id": "B",
  "source": "gesture"
}
```

Thao tác chuột dùng cùng cấu trúc, chỉ đổi source thành mouse. facility_id/slot_id phải đối chiếu danh mục của bài. CV không gửi dung tích, chi phí hay kết quả tự tính. Không cần gửi tọa độ tay hoặc ảnh lên máy chủ để chạy phép tính.

**Đầu ra bước này:** Danh sách cử chỉ, cách xác nhận/hủy, bảng ánh xạ công trình/ô và màn hình báo trạng thái camera.

### 4.3. Bước 3 — Thống nhất dữ liệu mô phỏng trước khi tích hợp AI

Ví dụ yêu cầu chạy bài 8.1; session_id đã xác định bài và bộ phiên bản phía máy chủ:

```json
{
  "client_request_id": "run_001",
  "input": {
    "threshold_cm": 60
  }
}
```

Kết quả do máy chủ tính và lưu:

```json
{
  "attempt_id": "attempt_001",
  "scenario_id": "8.1",
  "rules_version": "v1",
  "dataset_version": "v1",
  "dataset_results": [
    {"dataset_id": "A", "alert_minute": 4, "lead_minutes": 1},
    {"dataset_id": "B", "alert_minute": null, "classification": "NO_ALERT_NO_HAZARD"}
  ]
}
```

Đây là ví dụ dữ liệu trao đổi, không thay thế việc liệt kê đủ trường đầu ra cho từng bài. Hai bộ dữ liệu A/B, mốc nguy cơ và phiên bản quy tắc được máy chủ đọc từ cấu hình bài; không nhận kết quả tính sẵn từ giao diện.

**Đầu ra bước này:** Mẫu yêu cầu/kết quả cho cả 6 bài, kèm tên trường, kiểu, đơn vị, trường bắt buộc và trường có thể rỗng.

### 4.4. Bước 4 — Viết quy tắc cho AI Coach

| Mục | Nội dung cần chốt |
|---|---|
| Ngữ cảnh gửi AI | Mục tiêu bài, giới hạn mô hình, đầu vào/kết quả của lượt đang xem và mức gợi ý đã dùng |
| Dữ liệu không cần gửi | Tên thật, thông tin liên hệ, video, dữ liệu học sinh khác |
| Gợi ý mức 1 | Hỏi học sinh chú ý dữ kiện nào |
| Gợi ý mức 2 | Gợi ý so sánh hoặc kiểm tra một quan hệ |
| Gợi ý mức 3 | Giải thích khái niệm bằng dữ liệu hiện có, vẫn để học sinh tự chọn |
| Giới hạn | Không tự đổi quy tắc; không khẳng định kết quả ngoài phạm vi; không tiết lộ sẵn phương án bắt buộc để “đạt” |
| Lỗi AI | Dùng câu hỏi cố định theo bài; có nút thử hỏi lại |

Mẫu đầu ra Coach gọn:

```json
{
  "question": "Ở hai bộ dữ liệu, ngưỡng 60 cm cho kết quả khác nhau thế nào?",
  "hint": "Bạn có thể so thời điểm cảnh báo với mốc nguy cơ của bài.",
  "related_attempt_ids": ["attempt_001"]
}
```

Máy chủ kiểm tra cấu trúc và ID tham chiếu trước khi hiển thị. Kiểm tra cấu trúc không bảo đảm mọi câu AI đều đúng; nhóm vẫn cần đọc thử phản hồi và đối chiếu dữ kiện. Nhận xét rubric của phần 5 nên dùng cấu trúc riêng gồm tiêu chí, nguồn và trạng thái, không trộn vào kết quả Simulation Engine.

**Đầu ra bước này:** Hướng dẫn vai trò Coach, bộ câu hỏi dự phòng cho 6 bài, cấu trúc phản hồi và danh sách tình huống cần kiểm tra.

### 4.5. Bước 5 — Kiểm chứng bằng hai thử nghiệm nhỏ

| Thử nghiệm | Cách làm | Ghi lại |
|---|---|---|
| CV | Thử 10 lượt chọn/thả có chủ đích; thêm trường hợp sai ô, mất tay và không cấp camera | Số thao tác đúng, nhận lặp, hủy sai và việc chuyển sang chuột. Mục tiêu ban đầu 8/10 lượt đúng chỉ là mốc kiểm chứng đề xuất, không phải độ chính xác tổng quát. |
| AI | Chạy các tình huống: chưa thử, kết quả chưa đạt, hai lượt khác nhau, phản tư thiếu căn cứ, kết quả không thể suy ra ngoài đời, API lỗi | AI có bám dữ liệu, hỏi gợi mở và có dự phòng không. Giữ ví dụ đạt/chưa đạt để chỉnh hướng dẫn. |

Nếu CV chưa ổn, thu hẹp vùng thao tác hoặc cách xác nhận rồi thử lại; không mở thêm các cử chỉ khác. Có thể code hai thử nghiệm nhỏ trước khi xây sản phẩm chính.

## 6. Hướng dẫn thiết kế hệ thống

### 6.1. Bước 1 — Chọn kiến trúc nhỏ gọn

Dùng **một ứng dụng web, một backend và một cơ sở dữ liệu quan hệ**. CV chạy trên thiết bị; backend gọi dịch vụ LLM qua một module tích hợp. Chưa cần microservices, kho dữ liệu phân tích hoặc hệ thống Machine Learning riêng.

| Khối | Trách nhiệm |
|---|---|
| Web học sinh/giáo viên | Màn hình, điều khiển nhập, trạng thái lưu và đọc kết quả |
| CV trên trình duyệt | Tạo lựa chọn công trình/ô; chuyển về luồng thao tác chung |
| Backend | Đăng nhập/phân quyền, kiểm tra yêu cầu, điều phối chạy/lưu/hoàn thành |
| Module Simulation | Một bộ xử lý cho mỗi bài, cùng cách nhận đầu vào và trả kết quả |
| Module AI | Tạo ngữ cảnh, gọi LLM, kiểm tra đầu ra và cung cấp câu hỏi dự phòng |
| Cơ sở dữ liệu | Lớp, nhiệm vụ, phiên học, lượt thử, phản tư, bằng chứng và góp ý |

Luồng cần vẽ: **Người học → Web/CV → Backend → kiểm tra quyền và đầu vào → Simulation → lưu DB → trả kết quả**. AI nhận dữ liệu kết quả đã có qua backend; lỗi AI không làm thất bại phép tính mô phỏng.

**Đầu ra bước này:** Một sơ đồ kiến trúc chứa các khối và mũi tên trên, có đánh dấu CV ở máy người dùng và LLM là dịch vụ ngoài.

### 6.2. Bước 2 — Chuẩn hóa nội dung 6 bài

Giữ dữ liệu bài trong cấu hình có phiên bản, ví dụ file JSON được quản lý cùng mã nguồn. Chưa làm màn hình sửa công thức hoặc tạo bài động. Cơ sở dữ liệu phiên chỉ tham chiếu đúng phiên bản để chạy lại và đối chiếu.

| Nhóm cấu hình | Ví dụ |
|---|---|
| Nhận diện | scenario_id, tên, khối lớp, mục tiêu |
| Phiên bản | content_version, rules_version, dataset_version |
| Miền đầu vào | 8.1: ngưỡng 50/60/70/80; 8.2: công trình và ô A/B/C |
| Dữ liệu | Chuỗi A/B, bảng dung tích hoặc bảng thiết bị |
| Điều kiện hoàn thành | Số lượt cần có, sự kiện đã áp dụng, phản tư bắt buộc |
| Phản tư và bằng chứng | Câu hỏi cố định, EV áp dụng, dữ liệu cần tham chiếu |

**Đầu ra bước này:** 6 cấu hình bài và một bảng mô tả chung các trường. Giữ lại phiên bản cũ đang được các phiên học tham chiếu.

### 6.3. Bước 3 — Vẽ ERD từ các nhóm dữ liệu

Các bảng khởi đầu đề xuất; không tạo một bộ bảng riêng cho từng kịch bản:

| Bảng | Trường chính cần xác định | Quan hệ |
|---|---|---|
| users | id, tài khoản, vai trò, khối lớp nếu là học sinh | Có phiên học; giáo viên quản lý lớp |
| classes | id, tên, teacher_id | Thuộc một giáo viên; có học sinh và nhiệm vụ |
| enrollments | class_id, student_id, trạng thái | Liên kết học sinh–lớp; không ghi trùng cùng cặp |
| assignments | id, class_id, scenario_id, bộ phiên bản, hướng dẫn, hạn | Nhiệm vụ được giao cho một lớp |
| sessions | id, student_id, assignment_id có thể rỗng, bài/phiên bản, trạng thái, draft_json, draft_revision | Một phiên tự học hoặc một phiên làm bài được giao |
| attempts | id, session_id, client_request_id, số lượt, input_json, result_json, thời điểm | Mỗi phiên có nhiều lượt bất biến |
| reflections | id, session_id, selected_attempt_id, câu trả lời cuối, thời điểm | Mỗi phiên hoàn thành có một phản tư cuối |
| evidence | id, session_id, criterion_id, nguồn tham chiếu, quan sát, nhận xét/trạng thái/nguồn tạo | Mỗi phiên có các tiêu chí và nguồn minh chứng |
| teacher_reviews | id, session_id, teacher_id, nội dung, thời điểm | Góp ý riêng, không thay dữ liệu học sinh |

Tổng cộng 9 bảng khởi đầu. Hồ sơ và tiến độ lấy từ các bảng này, chưa cần thêm bảng điểm năng lực, bảng phân cụm hoặc bản sao video. draft_json có cả lựa chọn đang sửa và phản tư nháp; reflections chỉ lưu bản cuối.

Với assignments, danh sách được giao được hiểu theo học sinh thuộc lớp tại thời điểm giao. Nhóm cần lưu mốc danh sách đó, chẳng hạn danh sách ID trong cấu hình nhiệm vụ, để thay đổi thành viên sau này không làm sai thống kê. Chưa cần chức năng đổi lớp phức tạp cho MVP.

### 6.4. Bước 4 — Chốt quan hệ và ràng buộc

| Quan hệ/ràng buộc | Cần thể hiện trên ERD hoặc ghi chú |
|---|---|
| Một giáo viên – nhiều lớp | classes.teacher_id tham chiếu users.id; đúng vai trò giáo viên |
| Lớp – học sinh | enrollments nối hai bảng, có ràng buộc không ghi trùng |
| Nhiệm vụ – phiên học | Một nhiệm vụ có nhiều phiên; phiên tự học có assignment_id rỗng |
| Phiên – lượt thử | Một phiên có nhiều lượt; client_request_id duy nhất trong phiên để chống ghi trùng |
| Phiên – phản tư cuối | Tối đa một bản cuối; lượt được chọn phải thuộc cùng phiên |
| Bằng chứng – nguồn | Các ID lượt thử/phản tư đều tồn tại và thuộc cùng phiên, dù lưu tham chiếu trong JSON |
| Nội dung phiên | Phiên bản bài phải tồn tại; máy chủ không cho đổi phiên bản giữa chừng |
| Gửi lại hoàn thành | Không tạo thêm phản tư hoặc minh chứng trùng |

Nếu nhận xét AI và giáo viên cùng tồn tại, lưu riêng nguồn đề xuất và phần xem lại trong bản ghi hoặc bảng góp ý. Nhận xét giáo viên được đánh dấu đã xem lại, không xóa dấu vết nhận xét hỗ trợ.

**Đầu ra bước này:** ERD có khóa chính, khóa ngoại, quan hệ một–nhiều và các ràng buộc duy nhất. Chưa cần tối ưu cơ sở dữ liệu cho lượng người dùng lớn.

### 6.5. Bước 5 — Viết bảng API theo luồng màn hình

Tên đường dẫn dưới đây là mẫu đề xuất. Mọi yêu cầu cần phiên đăng nhập phù hợp, trừ dữ liệu giới thiệu công khai nếu nhóm chọn mở.

| Thao tác | API đề xuất | Yêu cầu xử lý chính |
|---|---|---|
| Đọc thư viện | GET /scenarios | Trả mô tả bài, khối lớp và giới hạn; không trả bí mật dịch vụ |
| Giao bài | POST /assignments | Giáo viên có quyền với lớp; lưu phiên bản và danh sách nhận tại thời điểm giao |
| Xem bài được giao | GET /me/assignments | Chỉ nhiệm vụ của người học hiện tại |
| Bắt đầu phiên | POST /sessions | Xác định tự học/làm bài được giao; kiểm tra quyền và phiên bản |
| Tiếp tục phiên | GET /sessions/{id} | Trả bản đã lưu, lượt thử và trạng thái cho người có quyền |
| Lưu nháp | PATCH /sessions/{id}/draft | Gửi draft_revision; chỉ lưu nếu khớp bản mới nhất, sau đó tăng revision |
| Chạy mô phỏng | POST /sessions/{id}/attempts | Kiểm tra quyền, đầu vào và client_request_id; tính rồi lưu một lượt |
| Hỏi Coach | POST /sessions/{id}/coach | Máy chủ tự lấy đúng ngữ cảnh; có thời gian chờ và câu hỏi dự phòng |
| Hoàn thành | POST /sessions/{id}/complete | Kiểm tra điều kiện bài; chốt phản tư, tạo quan sát và cập nhật trạng thái nhất quán |
| Hồ sơ | GET /me/profile | Tổng hợp phiên hoàn thành và bằng chứng được phép hiển thị |
| Đề xuất | GET /me/recommendations | Áp dụng quy tắc nhỏ, có lý do; không yêu cầu ML |
| Theo dõi lớp | GET /assignments/{id}/progress | Giáo viên đúng phạm vi; có cả người chưa bắt đầu |
| Góp ý | POST /sessions/{id}/reviews | Chỉ giáo viên có quyền với phiên được giao của lớp mình |

Mỗi API cần viết thêm **đầu vào → kiểm tra → đầu ra → lỗi**. Bắt đầu với ba API tiếp tục phiên, lưu nháp và chạy mô phỏng trước; chưa cần mô tả tất cả màn hình phụ.

### 6.6. Bước 6 — Xử lý lưu và phân quyền

| Trường hợp | Quy tắc thiết kế |
|---|---|
| Chạy mô phỏng | Lưu đầu vào và kết quả cùng một lượt trước khi báo thành công. Kết quả cũ bất biến. |
| Gửi lặp yêu cầu | Cùng phiên và client_request_id trả lại lượt đã có. Không chạy thêm nếu yêu cầu đó đã được lưu. |
| Hoàn thành | Lưu phản tư cuối, trạng thái hoàn thành và quan sát nền trong một giao dịch dữ liệu. AI nhận xét sau đó, không nằm trong điều kiện thành công bắt buộc. |
| Nháp xung đột | Máy chủ từ chối bản cũ và trả dấu hiệu xung đột. UI cho tải bản mới; không tự gộp hoặc ghi đè. |
| Học sinh | Chỉ sửa phiên của mình chưa hoàn thành; chỉ xem hồ sơ và bằng chứng của mình. |
| Giáo viên | Chỉ giao bài cho lớp mình; xem phiên thuộc nhiệm vụ mình có quyền; không sửa đầu vào/kết quả/phản tư của học sinh. |
| Tự học | Phiên không gắn nhiệm vụ lớp không tự xuất hiện cho mọi giáo viên. |
| Khóa API AI | Giữ ở backend; không đưa vào mã frontend, cấu hình gửi xuống trình duyệt hoặc log công khai. |

### 6.7. Bước 7 — Đi thử thiết kế bằng một phiên mẫu

Trước khi bắt đầu sản phẩm chính, đi qua bằng giấy hoặc bảng tính một phiên 8.1:

| Lượt thao tác | Dữ liệu phải đi qua đâu? | Điều cần đối chiếu |
|---|---|---|
| Bắt đầu | users → assignment nếu có → sessions | Đúng học sinh, bài và phiên bản |
| Chọn 70 cm và chạy | sessions → attempts | Bộ A phút 5; B không cảnh báo |
| Chọn 60 cm và chạy lại | attempts thêm lượt mới | Bộ A phút 4; lượt cũ không đổi |
| Xin gợi ý | attempts → module AI → giao diện | Coach dùng đúng hai lượt; lỗi AI vẫn tiếp tục được |
| Viết và hoàn thành | draft → reflections, sessions, evidence | Chốt đúng lượt được chọn và phản tư cuối; ghi nguồn bằng chứng |
| Mở hồ sơ | sessions, attempts, reflections, evidence | Nhận xét mở được đúng minh chứng |
| Giáo viên xem | assignment → quyền lớp → phiên | Chỉ xem nếu phiên được giao thuộc lớp có quyền |

**Đầu ra bước này:** Một sequence diagram cho luồng trên và bảng đối chiếu API–bảng dữ liệu. Nếu có thao tác trên UI chưa tìm được API hoặc nơi lưu, quay lại bổ sung thiết kế trước khi code.

## 7. Checklist công việc trước khi phát triển

| Việc cần chốt | Sản phẩm cần có | Có sẵn trong tài liệu này? |
|---|---|---|
| Yêu cầu chức năng | FR-01 đến FR-15 | Có bản đề xuất đầy đủ |
| Phi chức năng và nghiệm thu | NF-01 đến NF-08, AC-01 đến AC-10, KT trong đặc tả | Có; mục tiêu thời gian cần đo khi có prototype |
| Bằng chứng học tập | EV-01 đến EV-03, bảng nguồn và BE-01 đến BE-06 | Có bản đề xuất đầy đủ; cần giáo viên xem tiêu chí |
| Vai trò CV/AI | Bảng trách nhiệm, dữ liệu trao đổi, câu hỏi dự phòng | Có mẫu; nhóm cần hoàn thiện danh mục và thử kỹ thuật |
| Kiến trúc và ERD | Sơ đồ khối, 9 bảng và các ràng buộc | Có hướng dẫn và bản khởi đầu; nhóm cần vẽ/duyệt sơ đồ |
| API và lưu tiến trình | Đặc tả đầu vào/đầu ra/lỗi, quyền và revision | Có danh sách; nhóm cần điền chi tiết cho API của luồng đầu tiên |

**Nên làm tiếp theo:** Hoàn thiện dữ liệu trao đổi và ba API đầu tiên của bài 8.1; đi thử một phiên từ đầu đến cuối. Sau khi hai thành viên thống nhất, mới bắt đầu xây luồng đó và dùng lại cho các bài còn lại.
