# AI LifeLab — Đặc tả MVP và căn cứ kiểm chứng

**Tài liệu tiếp theo:** [Yêu cầu, bằng chứng học tập và hướng dẫn CV/AI, thiết kế hệ thống](AI-LifeLab-Yeu-cau-Bang-chung-Huong-dan.html).

**Thiết kế đã thực hiện:** [CV, AI, sơ đồ hệ thống, cơ sở dữ liệu và API](AI-LifeLab-Thiet-ke-CV-AI-He-thong.html).

**Đối tượng:** Học sinh lớp 8–9 THCS.  
**Mục đích:** Thống nhất học sinh làm gì, hệ thống tính gì và trả kết quả gì trước khi phát triển.  
**Phạm vi đề xuất:** 6 kịch bản, mỗi kịch bản có **1 nhiệm vụ chính**. Các vấn đề còn lại trong bản ban đầu được giữ làm hướng mở rộng.

**Cập nhật:** 28/10/2026. Các số liệu trong nhiệm vụ là **tham số giả lập đề xuất**, không phải dữ liệu vận hành ngoài đời hoặc số liệu đã được chuyên gia phê duyệt. Nguồn tham khảo hỗ trợ nguyên lý; không mặc nhiên xác nhận các số liệu giả lập hay toàn bộ ứng dụng.

### Hiểu đúng về mức độ kiểm chứng

| Mức kiểm chứng | Cần chứng minh điều gì? | Tình trạng của bản này |
|---|---|---|
| Đúng phép tính | Kết quả khớp công thức, đơn vị và ví dụ độc lập | Đã kiểm tra các ví dụ số; chưa kiểm thử phần mềm vì chưa triển khai |
| Đúng mô hình học tập | Giả định rõ ràng, không làm sai nguyên lý cần học | Đã đối chiếu tài liệu; còn cần giáo viên duyệt nội dung và mức phù hợp lớp 8–9 |
| Phù hợp thực tế | Kết quả khớp dữ liệu đo hoặc thử nghiệm trong điều kiện xác định | Chưa có kiểm chứng thực nghiệm; không khẳng định dùng được để ra quyết định thực tế |

Các nguồn nước ngoài bên dưới là căn cứ chuyên môn/giáo dục tham khảo, **không thay thế việc đối chiếu chương trình Việt Nam**. Chưa có xác nhận mọi nội dung đều là yêu cầu bắt buộc của từng lớp.

## 1. Tổng quan phạm vi

| Mã | Kịch bản | Nhiệm vụ chính trong MVP | Chưa triển khai trong MVP |
|---|---|---|---|
| 8.1 | Cảnh báo mực nước | Chọn ngưỡng và so sánh kết quả trên hai bộ dữ liệu | Phát hiện lỗi cảm biến; thiết kế nhiều tầng cảnh báo |
| 8.2 | Khu dân cư thích ứng mưa lớn | Chọn công trình chứa nước; tính lượng nước được giữ và chưa được giữ | Dự báo ngập; mô phỏng dòng chảy, thấm và thoát nước thực tế |
| 8.3 | Quản lý tiền tiêu vặt | Lập kế hoạch tuần và điều chỉnh khi phát sinh chi phí | Ví tiền thật; vay nợ; giao dịch hoặc thanh toán |
| 9.1 | Năng lượng trường học | Điều chỉnh thời gian dùng thiết bị để so sánh điện năng | Điện mặt trời; pin lưu trữ; điều khiển thiết bị thật |
| 9.2 | Tài chính cá nhân | Lập kế hoạch tiết kiệm tháng và tính thời gian đạt mục tiêu | Đầu tư; lãi suất; kinh doanh và điểm hòa vốn |
| 9.3 | Khám phá hướng học tập | Chọn một kỹ năng và lập kế hoạch luyện tập tuần | Tuyển sinh thật; dự đoán nghề phù hợp; phỏng vấn bằng giọng nói |

**Luồng chung:** Nhận nhiệm vụ → Thao tác → Xem kết quả → Điều chỉnh nếu muốn → Phản tư → Lưu kết quả.

## 2. Kịch bản 8.1 — Cảnh báo mực nước

### Bảng đặc tả

| Nội dung | Quy định cho MVP |
|---|---|
| Mục tiêu | Đọc chuỗi số đo, hiểu ngưỡng và cân nhắc giữa cảnh báo sớm với cảnh báo giả. |
| Nhiệm vụ | Chọn ngưỡng cảnh báo; thử ít nhất hai ngưỡng khác nhau; giải thích lựa chọn cuối cùng. |
| Đầu vào | Hai bộ dữ liệu A và B ở bảng dưới. Học sinh chọn ngưỡng **50, 60, 70 hoặc 80 cm**. Mỗi số đo cách nhau **1 phút**. |
| Thao tác | Chọn ngưỡng → Chạy thử cả hai bộ dữ liệu → Xem kết quả → Đổi ngưỡng và thử lại. |
| Quy tắc cảnh báo | Phát cảnh báo khi có **2 số đo liên tiếp lớn hơn hoặc bằng ngưỡng**. Thời điểm cảnh báo là thời điểm của số đo thứ hai. |
| Quy tắc kết thúc | Mỗi bộ dữ liệu chỉ ghi nhận lần phát cảnh báo đầu tiên. Cảnh báo được giữ đến hết lượt thử; không tự tắt và phát lại. |
| Chuẩn đối chiếu | Nguy cơ xuất hiện khi mực nước đạt **80 cm**. Đây là điều kiện cố định của dữ liệu, độc lập với ngưỡng học sinh chọn. |
| Đầu ra | Biểu đồ mực nước, thời điểm cảnh báo, mức sớm so với nguy cơ, cảnh báo giả hoặc bỏ sót, bảng so sánh các lượt thử. |
| Hoàn thành | Có kết quả của ít nhất **2 ngưỡng khác nhau**, chọn ngưỡng cuối và trả lời câu hỏi phản tư. Không bắt buộc chọn một ngưỡng do hệ thống chỉ định. |
| Bằng chứng lưu | Các ngưỡng đã thử, kết quả từng bộ dữ liệu, lựa chọn cuối và lời giải thích. |

### Dữ liệu cố định

| Bộ dữ liệu | Phút 0 | Phút 1 | Phút 2 | Phút 3 | Phút 4 | Phút 5 | Ý nghĩa |
|---|---:|---:|---:|---:|---:|---:|---|
| A | 30 | 40 | 55 | 65 | 75 | 85 | Có nguy cơ ở phút 5 |
| B | 30 | 55 | 60 | 40 | 35 | 30 | Tăng tạm thời, không đạt mức nguy cơ |

Đơn vị toàn bộ số đo: **cm**. Trong MVP này, tất cả số đo đều hợp lệ; chưa xử lý cảm biến lỗi.

### Cách mô tả kết quả

| Trường hợp | Kết quả hiển thị |
|---|---|
| Cảnh báo trước phút nguy cơ | Cảnh báo sớm hơn nguy cơ bao nhiêu phút |
| Cảnh báo đúng phút nguy cơ | Cảnh báo cùng thời điểm xuất hiện nguy cơ |
| Có nguy cơ nhưng không cảnh báo | Bỏ sót trong bộ dữ liệu thử |
| Không có nguy cơ nhưng phát cảnh báo | Cảnh báo giả trong bộ dữ liệu thử |
| Không có nguy cơ và không cảnh báo | Không phát cảnh báo trong bộ dữ liệu này |

**Câu hỏi phản tư:** “Ngưỡng của bạn phản ứng thế nào ở hai bộ dữ liệu? Vì sao bạn giữ hoặc đổi lựa chọn?”

### Căn cứ và kiểm chứng

| Nội dung | Cách hiểu và việc cần làm |
|---|---|
| Căn cứ nguyên lý | [NWS — Flooding FAQ](https://www.weather.gov/lot/floodingfaq) giải thích mực nước được đọc theo mốc tại một vị trí và mức gây nguy cơ gắn với địa điểm đó. Nguồn hỗ trợ việc phân biệt số đo, ngưỡng và nguy cơ; không xác nhận ngưỡng của bài này. |
| Giả định riêng | Các chuỗi A/B, mốc 80 cm, khoảng đo 1 phút, quy tắc 2 lần liên tiếp và giữ cảnh báo đến hết lượt đều do nhóm thiết kế. Mọi giá trị được so với cùng mốc 0 cm của mô hình. |
| Cách kiểm chứng | Tính tay thời điểm cảnh báo cho từng ngưỡng rồi đối chiếu KT-01 đến KT-04. Nếu làm mô hình bàn học, đối chiếu số đo với thước và thử kích hoạt; ghi điều kiện và sai số quan sát, không tự coi là đã đạt. |
| Giới hạn kết luận | Đúng quy tắc cảnh báo trong bộ dữ liệu mẫu. Không suy ra ngưỡng an toàn cho khu dân cư thật, không dự báo lũ và không bảo đảm thời gian sơ tán. Chỉ dùng “nguy cơ/cảnh báo giả/bỏ sót” theo nhãn của bài. |

**Trạng thái:** Đã đối chiếu nguyên lý và ví dụ tính; chưa thử cảm biến thật, chưa được giáo viên duyệt. Hai bộ dữ liệu chỉ phục vụ so sánh, chưa chứng minh ngưỡng nào tốt nhất cho mọi tình huống.

## 3. Kịch bản 8.2 — Khu dân cư thích ứng mưa lớn

### Bảng đặc tả

| Nội dung | Quy định cho MVP |
|---|---|
| Mục tiêu | Hiểu quan hệ giữa lượng nước thu được, sức chứa và chi phí; giải thích đánh đổi. |
| Nhiệm vụ | Chọn công trình lưu nước mưa cho khu vực thu nước giả lập, ngân sách **100 điểm**. |
| Đầu vào | Diện tích thu nước **1.000 m²**, lượng mưa của một đợt **50 mm**, 3 công trình ở vị trí cố định như bảng dưới. |
| Thao tác | Chọn hoặc bỏ công trình; đặt vào vị trí được chỉ định; tính lượng nước; so sánh phương án. |
| Giới hạn | Mỗi công trình tối đa một lần; chi phí không vượt 100 điểm. Không thay đổi vị trí, kích thước hoặc đường dẫn nước. |
| Quy tắc tính | **Nước mưa = lượng mưa mm ÷ 1.000 × diện tích m². Sức chứa = tổng dung tích công trình. Nước được giữ = min(nước mưa, sức chứa). Nước chưa được giữ = max(0, nước mưa − sức chứa).** Các thể tích tính bằng m³. |
| Điều kiện mô hình | Các công trình ban đầu rỗng; toàn bộ mưa trên diện tích này được dẫn đến hệ thống chung, không tính trùng nước. Bỏ qua thấm, bốc hơi, rò rỉ, lưu lượng theo thời gian và nước từ nơi khác đến. |
| Đầu ra | Sơ đồ bố trí, chi phí, ngân sách còn, **50 m³ nước mưa**, lượng được giữ và lượng chưa được giữ. Không hiển thị bản đồ độ sâu ngập. |
| Hoàn thành | Có một phương án hợp lệ chứa ít nhất một công trình và lời giải thích. Không bắt buộc giữ được toàn bộ nước. |
| Bằng chứng lưu | Công trình đã chọn, các thể tích tính được, phương án cuối và lý do. |

### Bảng tham số

| Công trình | Chi phí quy ước | Kích thước trong mô hình (dài × rộng × sâu) | Sức chứa khi rỗng | Vị trí |
|---|---:|---|---:|---|
| Bồn thu nước | 30 điểm | 5 × 2 × 1 m | 10 m³ | Ô A |
| Bể chứa nước mưa | 40 điểm | 5 × 2 × 2 m | 20 m³ | Ô B |
| Hồ lưu nước mô hình | 50 điểm | 5 × 3 × 2 m | 30 m³ | Ô C |

Toàn bộ công trình được lý tưởng hóa thành hình hộp chữ nhật, dung tích = dài × rộng × sâu; kích thước là phần rỗng hữu dụng. Chi phí và kích thước là giả định cho bài học, không phải báo giá hoặc thiết kế xây dựng. **Bỏ công thức “điểm giảm ngập” của bản trước.**

**Câu hỏi phản tư:** “Bạn giữ được bao nhiêu nước với chi phí đã chọn? Vì sao chưa thể từ kết quả đó khẳng định khu dân cư sẽ không ngập?”

### Căn cứ và kiểm chứng

| Nội dung | Cách hiểu và việc cần làm |
|---|---|
| Căn cứ nguyên lý | [EPA — Mitigate Flooding](https://www.epa.gov/green-infrastructure/mitigate-flooding) nêu vai trò lưu giữ nước mưa và sự cần thiết của mô hình thủy văn/thủy lực khi đánh giá ngập. Nguồn không cung cấp bảng dung tích hoặc giá của bài này. |
| Giả định riêng | Đây là bài cân bằng thể tích do nhóm đơn giản hóa, không phải mô hình EPA. Điều kiện thu toàn bộ nước, công trình rỗng và các dung tích đều được công khai ngay trong nhiệm vụ. |
| Cách kiểm chứng | Kiểm tra đổi đơn vị, dung tích từng hình hộp và đẳng thức **nước mưa = nước giữ + nước chưa giữ**. Đối chiếu KT-05/KT-06. Có thể thử bằng mô hình khay và cốc đong theo tỉ lệ để quan sát nguyên lý; thử nghiệm này chưa được thực hiện. |
| Giới hạn kết luận | Chỉ biết thể tích hệ thống có thể giữ theo giả định. Nước chưa được giữ không đồng nghĩa toàn bộ trở thành ngập; còn 0 m³ cũng không chứng minh ngoài đời không ngập. Chưa đánh giá tác động riêng của cây xanh hay thoát nước. |

**Trạng thái:** Đã kiểm tra ví dụ thể tích; còn chờ giáo viên duyệt mức đơn giản hóa. Không dùng các mức giảm 20/30/35 điểm của bản cũ làm kết quả khoa học.

## 4. Kịch bản 8.3 — Quản lý tiền tiêu vặt

### Bảng đặc tả

| Nội dung | Quy định cho MVP |
|---|---|
| Mục tiêu | Lập kế hoạch khả thi, xác định ưu tiên và điều chỉnh khi điều kiện thay đổi. |
| Nhiệm vụ | Phân bổ **300.000 đồng** cho một tuần; đặt mục tiêu tiết kiệm **60.000 đồng**; xử lý khoản phát sinh **20.000 đồng**. |
| Đầu vào | Các nhóm: ăn uống, đi lại, học tập, giải trí, tiết kiệm. Số tiền nhập theo bước 10.000 đồng. |
| Điều kiện cố định | Ăn uống tối thiểu 100.000 đồng; đi lại tối thiểu 50.000 đồng. Đây là giả định riêng của nhân vật trong bài. |
| Thao tác | Nhập kế hoạch → Kiểm tra → Xem sự kiện phát sinh → Điều chỉnh và lưu kế hoạch mới. |
| Quy tắc tính | **Tiền chưa phân bổ = nguồn tiền − tổng phân bổ.** Trước sự kiện, nguồn tiền là 300.000 đồng; sau sự kiện là 280.000 đồng. |
| Kiểm tra hợp lệ | Không nhận số âm; các khoản thiết yếu đạt mức tối thiểu; tổng phân bổ không vượt nguồn tiền hiện tại. |
| Khi có phát sinh | Giữ kế hoạch cũ để so sánh. Nếu tổng phân bổ vượt 280.000 đồng, hiển thị số thiếu và yêu cầu điều chỉnh trước khi lưu bản mới. |
| Đầu ra | Kế hoạch trước/sau, tiền chưa phân bổ, mức đạt mục tiêu tiết kiệm và khoản đã điều chỉnh. |
| Hoàn thành | Lưu được kế hoạch hợp lệ sau sự kiện và giải thích lựa chọn. Được giảm mục tiêu tiết kiệm nếu nêu lý do. |
| Bằng chứng lưu | Hai bản kế hoạch, khoản thay đổi, mức chênh lệch tiết kiệm và phản tư. |

Đây là **bài lập kế hoạch**, chưa mô phỏng giao dịch từng ngày. “Tiền chưa phân bổ” không được gọi là “số dư thực tế cuối tuần”.

**Câu hỏi phản tư:** “Khi phát sinh thêm 20.000 đồng, bạn đã thay đổi khoản nào và vì sao?”

### Căn cứ và kiểm chứng

| Nội dung | Cách hiểu và việc cần làm |
|---|---|
| Căn cứ nguyên lý | [CFPB — Hoạt động giáo dục tài chính](https://www.consumerfinance.gov/consumer-tools/educator-tool/youth-financial-education/teach/activities/) có hoạt động về quyết định chi tiêu và mục tiêu. [CFPB — Your Money, Your Goals](https://www.consumerfinance.gov/consumer-tools/educator-tool/your-money-your-goals/toolkit/) cung cấp công cụ theo dõi thu/chi, ngân sách và điều chỉnh. Đây là tham khảo giáo dục, không phải định mức chi tiêu Việt Nam. |
| Giả định riêng | 300.000 đồng/tuần, khoản thiết yếu tối thiểu và phát sinh 20.000 đồng thuộc nhân vật giả định. Khoản phát sinh được tính một lần ngoài các nhóm phân bổ; không tiếp tục trừ lần thứ hai. |
| Cách kiểm chứng | Cộng độc lập các khoản trong KT-07/KT-08; kiểm tra **phân bổ + tiền chưa phân bổ = nguồn tiền hiện tại**. Nhờ giáo viên xem bối cảnh nhân vật, không xác nhận đây là mức chi cần thiết cho mọi học sinh. |
| Giới hạn kết luận | Xác định kế hoạch có khả thi về số học trong bài, không kết luận “chi tiêu tốt/xấu” chỉ từ số tiết kiệm. Không phải kết quả thực hiện ngân sách của một tuần thật. |

**Trạng thái:** Phép tính và cách ghi nhận phát sinh đã có ví dụ đối chiếu; chưa được giáo viên thẩm định bối cảnh.

## 5. Kịch bản 9.1 — Năng lượng trường học

### Bảng đặc tả

| Nội dung | Quy định cho MVP |
|---|---|
| Mục tiêu | Tính điện năng và so sánh cách sử dụng thiết bị trong các giới hạn đã cho. |
| Nhiệm vụ | Điều chỉnh thời gian sử dụng để giảm điện năng so với hiện trạng, vẫn đáp ứng giới hạn tối thiểu. |
| Đầu vào | Bảng thiết bị bên dưới. Đơn giá giả lập cố định **2.500 đồng/kWh**. |
| Thao tác | Chọn số giờ dùng từng nhóm thiết bị; tính kết quả; đổi cấu hình và so sánh. |
| Giới hạn | Số giờ là số nguyên, thuộc miền cho phép. Số lượng và công suất thiết bị không đổi. |
| Quy tắc tính | **Điện năng từng nhóm = công suất W ÷ 1.000 × số lượng × số giờ. Tổng điện năng = tổng các nhóm. Chi phí = tổng điện năng × 2.500.** |
| Hiện trạng | Đèn 6 giờ, quạt 6 giờ, máy tính 2 giờ. Tổng **3,4 kWh**, chi phí **8.500 đồng**. |
| Đầu ra | Điện năng từng nhóm, tổng điện năng, chi phí, chênh lệch so với hiện trạng. |
| Hoàn thành | Có một cấu hình hợp lệ và lời giải thích. Nếu không tiết kiệm, hệ thống phản hồi kết quả thay vì khóa bước phản tư. |
| Bằng chứng lưu | Các cấu hình đã thử, kết quả tính và lý do lựa chọn cuối. |

### Bảng thiết bị

| Nhóm thiết bị | Công suất mỗi thiết bị | Số lượng | Số giờ cho phép |
|---|---:|---:|---|
| Đèn | 20 W | 10 | 4–6 giờ |
| Quạt | 50 W | 4 | 4–6 giờ |
| Máy tính | 100 W | 5 | 1–2 giờ |

Giới hạn tối thiểu và đơn giá là tham số của bài, không phải kết luận về nhu cầu điện thực tế của trường. Hiển thị điện năng tối đa 2 chữ số thập phân, tiền theo đồng; tính bằng giá trị đầy đủ trước khi làm tròn để hiển thị.

**Câu hỏi phản tư:** “Bạn đã giảm thời gian ở nhóm nào? Vì sao phương án vẫn đáp ứng giới hạn của nhiệm vụ?”

### Căn cứ và kiểm chứng

| Nội dung | Cách hiểu và việc cần làm |
|---|---|
| Căn cứ nguyên lý | [Chính phủ Australia — Energy Ratings](https://www.energy.gov.au/households/energy-rating) hướng dẫn đổi W sang kW và ước tính chi phí từ công suất, thời gian và giá điện. Bài áp dụng phép tính điện năng cho từng nhóm rồi cộng tổng. |
| Giả định riêng | Thiết bị chạy với công suất không đổi trong giờ đã chọn; bỏ qua chế độ chờ, điều chỉnh tốc độ và chu kỳ bật/tắt. Số lượng, công suất, giờ tối thiểu và giá 2.500 đồng/kWh đều là dữ liệu bài tập; giá này không phải biểu giá điện hiện hành. |
| Cách kiểm chứng | Tính tay KT-09/KT-10. Nếu có dữ liệu thiết bị thật, đối chiếu nhãn hoặc thông số của nhà sản xuất; muốn so với điện năng thực phải có dữ liệu đo cùng khoảng thời gian và ghi sai lệch. Chưa tiến hành đo thực tế. |
| Giới hạn kết luận | Kết quả đúng theo mô hình công suất cố định; chưa cam kết điện năng/tiền điện của trường thật. Đạt số giờ tối thiểu trong bài chưa chứng minh đáp ứng mọi nhu cầu sử dụng thực tế. |

**Trạng thái:** Đã đối chiếu công thức và kiểm tra ví dụ; chưa đối chiếu dữ liệu đo thiết bị thật, chưa duyệt mức giờ tối thiểu.

## 6. Kịch bản 9.2 — Tài chính cá nhân

### Bảng đặc tả

| Nội dung | Quy định cho MVP |
|---|---|
| Mục tiêu | Liên hệ kế hoạch tháng với thời gian đạt mục tiêu và điều chỉnh khi chi phí thay đổi. |
| Nhiệm vụ | Lập kế hoạch cho nhân vật có nguồn tiền **400.000 đồng/tháng**, muốn mua món đồ **900.000 đồng**, đã tiết kiệm **300.000 đồng**. |
| Đầu vào | Chi phí cố định ban đầu 250.000 đồng/tháng; mức tiết kiệm chọn **0, 50.000, 100.000 hoặc 150.000 đồng/tháng**. |
| Thao tác | Chọn mức tiết kiệm → Xem thời gian → Áp dụng sự kiện tăng chi phí cố định 50.000 đồng/tháng → Điều chỉnh. |
| Kiểm tra hợp lệ | **Chi phí cố định + tiết kiệm ≤ 400.000 đồng.** Phần còn lại là tiền dự phòng/chưa phân bổ. |
| Quy tắc mục tiêu | **Tiền còn thiếu = max(0, 900.000 − 300.000). Số tháng = làm tròn lên(tiền còn thiếu ÷ tiết kiệm mỗi tháng).** |
| Trường hợp đặc biệt | Nếu tiền còn thiếu bằng 0, hiển thị đã đạt mục tiêu. Nếu còn thiếu và mức tiết kiệm bằng 0, hiển thị chưa có thời điểm đạt mục tiêu. |
| Khi có biến động | Chi phí cố định mới là 300.000 đồng/tháng. Giữ kế hoạch cũ và hiển thị nếu vượt nguồn tiền; chỉ tính dự báo mới từ kế hoạch hợp lệ. |
| Đầu ra | Kế hoạch trước/sau, tiền dự phòng, số tháng dự kiến và phần thay đổi do sự kiện. |
| Hoàn thành | Lưu kế hoạch hợp lệ sau biến động và giải thích lựa chọn. |
| Bằng chứng lưu | Mức tiết kiệm trước/sau, kết quả dự kiến, phương án cuối và phản tư. |

Không tính lãi suất và không tự tăng số tiền đã tiết kiệm khi chỉ chạy dự báo. Dùng dữ liệu nhân vật giả định, không yêu cầu học sinh khai thu nhập gia đình.

**Câu hỏi phản tư:** “Sau khi chi phí tăng, bạn thay đổi kế hoạch như thế nào? Mục tiêu bị ảnh hưởng ra sao?”

### Căn cứ và kiểm chứng

| Nội dung | Cách hiểu và việc cần làm |
|---|---|
| Căn cứ nguyên lý | [CFPB — Savings Plan](https://files.consumerfinance.gov/f/documents/cfpb_your-money-your-goals_savings_plan_tool_2018-11_ADA.pdf) hướng dẫn gắn số tiền cần tiết kiệm với số kỳ và mức tiết kiệm mỗi kỳ. Công thức số tháng trong bài là phép biến đổi số học dưới giả định mức tiết kiệm cố định. |
| Giả định riêng | Không có lãi suất, lạm phát, phí hoặc biến động khác. Sau sự kiện, chi phí tăng được giữ ở mức mới trong toàn bộ các tháng dự kiến; tiết kiệm mỗi tháng giữ nguyên theo kế hoạch mới. |
| Cách kiểm chứng | Kiểm tra KT-11 đến KT-13; với mức tiết kiệm dương, số tiền dự kiến ở tháng tính được phải đủ mục tiêu, còn tháng liền trước chưa đủ. Tính trường hợp đã đủ tiền trước khi xử lý phép chia. |
| Giới hạn kết luận | Thời gian dự kiến chỉ đúng nếu tuân theo giả định; không bảo đảm đạt mục tiêu trong đời thực và không đánh giá tài chính gia đình học sinh. |

**Trạng thái:** Đã kiểm tra ví dụ và trường hợp mức tiết kiệm bằng 0; bối cảnh nhân vật còn chờ giáo viên duyệt.

## 7. Kịch bản 9.3 — Khám phá hướng học tập

### Bảng đặc tả

| Nội dung | Quy định cho MVP |
|---|---|
| Mục tiêu | Chọn một kỹ năng muốn luyện và chuyển thành kế hoạch có thể thực hiện, quan sát được. |
| Nhiệm vụ | Chọn một kỹ năng trong **trình bày ý tưởng, phân tích dữ liệu, lập kế hoạch**; xây dựng kế hoạch luyện trong một tuần. |
| Đầu vào | Quỹ thời gian **120 phút/tuần**, danh sách hoạt động bên dưới, kỹ năng và lý do do học sinh tự chọn. |
| Thao tác | Chọn kỹ năng; chọn hoạt động; chọn ngày; viết sản phẩm dự kiến; điều chỉnh và lưu. |
| Giới hạn | Mỗi hoạt động được chọn tối đa một lần; tổng thời gian không vượt 120 phút; có ít nhất một hoạt động và sản phẩm dự kiến cụ thể. |
| Quy tắc xử lý | Cộng thời lượng, kiểm tra các trường bắt buộc, ghi nhận mục tiêu và hoạt động. Không tính điểm phù hợp nghề nghiệp. |
| Đầu ra | Kế hoạch tuần, tổng thời gian, sản phẩm dự kiến và gợi ý phản tư. |
| Hoàn thành | Lưu được kế hoạch hợp lệ và giải thích vì sao muốn luyện kỹ năng đó. |
| Bằng chứng lưu | Kỹ năng tự chọn, kế hoạch, các lần điều chỉnh và lý do lựa chọn. |

### Hoạt động có sẵn

| Hoạt động | Thời lượng | Sản phẩm dự kiến |
|---|---:|---|
| Đọc một tình huống và ghi 3 ý chính | 30 phút | Ghi chú 3 ý |
| Giải thích một phương án bằng văn bản | 30 phút | Đoạn giải thích có lý do |
| Thử sửa phương án sau phản hồi | 45 phút | Hai phiên bản trước/sau |

Học sinh được mô tả sản phẩm cụ thể hơn theo kỹ năng đã chọn. **Hoàn thành kế hoạch không có nghĩa đã thành thạo kỹ năng.** Trong MVP, chưa triển khai nhắc lịch, thu bài luyện tập hoặc đánh giá phỏng vấn.

**Câu hỏi phản tư:** “Vì sao bạn muốn luyện kỹ năng này? Sản phẩm nào sẽ giúp bạn tự nhìn lại việc luyện tập?”

### Căn cứ và kiểm chứng

| Nội dung | Cách hiểu và việc cần làm |
|---|---|
| Căn cứ giáo dục | [EEF — Metacognition and self-regulation](https://educationendowmentfoundation.org.uk/education-evidence/teaching-learning-toolkit/metacognition-and-self-regulation/) trình bày việc hỗ trợ học sinh lập kế hoạch, theo dõi và tự đánh giá trong nhiệm vụ học tập cụ thể. Nguồn không xác nhận bộ hoạt động hoặc thời lượng của AI LifeLab. |
| Giả định riêng | Quỹ 120 phút và các hoạt động 30/30/45 phút là phương án sư phạm của nhóm. Chưa có nghiên cứu riêng chứng minh kế hoạch này phát triển kỹ năng hoặc phù hợp mọi học sinh. |
| Cách kiểm chứng | Hệ thống kiểm tra thời gian và nội dung bắt buộc. Giáo viên xem mục tiêu có gắn hành động và sản phẩm quan sát được không; KT-14 chỉ chứng minh kế hoạch hợp lệ. Nếu đánh giá tiến bộ thật về sau, phải có sản phẩm đã làm và quan sát nhiều lần. |
| Giới hạn kết luận | Xác nhận học sinh đã lập kế hoạch và nêu lý do; chưa xác nhận đã thực hiện hay thành thạo. Không chấm phù hợp nghề nghiệp, không suy ra tương lai từ lựa chọn hoặc lời phản tư. |

**Trạng thái:** Có căn cứ giáo dục cho cấu trúc hoạt động; bộ hoạt động cụ thể chưa được giáo viên thẩm định và chưa được thử nghiệm với học sinh.

## 8. Quy tắc dùng chung

### Trạng thái phiên học

| Trạng thái hiển thị | Khi nào sử dụng |
|---|---|
| Chưa bắt đầu | Chưa tạo phiên học |
| Đang thực hiện | Đã bắt đầu; đang thao tác, xem kết quả hoặc thử lại |
| Chờ phản tư | Đã có kết quả hợp lệ, chưa lưu phần phản tư |
| Hoàn thành | Đạt điều kiện của nhiệm vụ và đã lưu phản tư |

“Đang tính kết quả” là trạng thái xử lý tạm thời của nút/chức năng; “bình thường/cảnh báo” là trạng thái của mô hình 8.1. Không trộn hai loại này với tiến độ phiên học.

### Hành vi bắt buộc

| Tình huống | Hệ thống phải làm |
|---|---|
| Đầu vào không hợp lệ | Chỉ rõ trường lỗi; giữ dữ liệu đang sửa; không tạo kết quả giả |
| Cùng đầu vào và bộ quy tắc | Trả cùng kết quả mô phỏng cốt lõi |
| Học sinh thử lại | Lưu thành lượt mới; giữ các lượt trước để so sánh |
| Thoát và quay lại | Mở bản nháp hoặc lượt hợp lệ gần nhất; hiển thị thời điểm đã lưu |
| Mất mạng hoặc lỗi lưu | Báo chưa lưu và cho thử lưu lại; không hiển thị đã lưu thành công |
| AI chậm hoặc lỗi | Vẫn cho xem kết quả và dùng câu hỏi phản tư có sẵn |
| Hoàn thành | Không yêu cầu kết quả tối ưu; không chấm chất lượng chỉ theo độ dài câu trả lời |

### Đầu ra tối thiểu cần lưu

| Nhóm | Nội dung |
|---|---|
| Nhận diện | Học sinh, kịch bản/nhiệm vụ, phiên bản nội dung |
| Lượt thử | Số thứ tự, thời điểm, đầu vào, kết quả và phiên bản bộ quy tắc |
| Bản nháp | Dữ liệu đang sửa và thời điểm lưu gần nhất |
| Phản tư | Câu trả lời của học sinh, thời điểm lưu |
| Bằng chứng | Quyết định hoặc thay đổi cụ thể, lượt thử được tham chiếu, lời giải thích liên quan |
| Tiến độ | Trạng thái phiên và thời điểm hoàn thành nếu có |

Không cần lưu mọi chuyển động chuột hoặc mọi khung hình camera. Chỉ ghi các thao tác có ý nghĩa như chọn phương án, thay đổi đầu vào và chạy thử.

## 9. AI, Computer Vision và giáo viên

| Thành phần | Phạm vi nhỏ gọn |
|---|---|
| Simulation Engine | Kiểm tra đầu vào, áp dụng công thức/quy tắc, tính kết quả và lưu lượt thử |
| AI Coach | Hỏi gợi mở dựa trên dữ liệu phiên học; không sửa số liệu hoặc tự quyết định kết quả |
| Phản tư | Luôn có câu hỏi cố định. Phản hồi AI là phần hỗ trợ, không phải điều kiện để hoàn thành |
| Hồ sơ học sinh | Hiển thị hoạt động, quyết định và nhận xét có bằng chứng; chưa tạo điểm tính cách hoặc phân cụm năng lực |
| Gợi ý trải nghiệm | Dùng quy tắc đơn giản: nhiệm vụ tiếp theo chưa làm hoặc hoạt động gắn với kỹ năng học sinh tự chọn; hiển thị lý do |
| CV ở kịch bản 8.2 | Một thao tác cử chỉ chọn/thả hạng mục vào vị trí cố định; dùng thư viện có sẵn và có chuột thay thế |
| Giáo viên | Chọn bài có sẵn, giao lớp, đặt hạn/hướng dẫn, xem tiến độ, lượt thử và phản tư |

**Chưa làm:** nhận dạng bản vẽ tự do, CV cho cả 6 kịch bản, trình tạo kịch bản, huấn luyện mô hình riêng, phân tích dự báo năng lực và hệ thống đề xuất bằng Machine Learning. Đây là phần thu hẹp so với đề cương ban đầu, cần nhóm thống nhất với giảng viên trước khi chốt phạm vi.

## 10. Bộ kiểm tra nghiệm thu tối thiểu

| Mã | Đầu vào / thao tác | Kết quả mong đợi |
|---|---|---|
| KT-01 | 8.1: ngưỡng 50 cm | A cảnh báo phút 3, sớm 2 phút; B cảnh báo giả phút 2 |
| KT-02 | 8.1: ngưỡng 60 cm | A cảnh báo phút 4, sớm 1 phút; B không cảnh báo |
| KT-03 | 8.1: ngưỡng 70 cm | A cảnh báo phút 5, cùng lúc xuất hiện nguy cơ; B không cảnh báo |
| KT-04 | 8.1: ngưỡng 80 cm | A không đủ 2 số đo liên tiếp: bỏ sót; B không cảnh báo |
| KT-05 | 8.2: chọn bể 20 m³ và hồ 30 m³ | Mưa 50 mm trên 1.000 m² = 50 m³; chi phí 90, còn 10; giữ 50 m³, chưa giữ 0 m³. Nếu chỉ chọn bồn 10 m³ và bể 20 m³: chi phí 70, giữ 30 m³, chưa giữ 20 m³ |
| KT-06 | 8.2: chọn cả 3 hạng mục | Tổng 120; báo vượt 20; không chấp nhận phương án mới |
| KT-07 | 8.3: ăn 100.000, đi lại 50.000, học tập 30.000, giải trí 40.000, tiết kiệm 60.000 | Tổng 280.000; trước sự kiện còn 20.000; sau sự kiện còn 0; vẫn hợp lệ |
| KT-08 | 8.3: kế hoạch phân bổ 300.000 rồi phát sinh 20.000 | Giữ bản cũ; hiển thị thiếu 20.000 và yêu cầu sửa trước khi lưu bản mới |
| KT-09 | 9.1: đèn 6 giờ, quạt 6 giờ, máy tính 2 giờ | 3,4 kWh; 8.500 đồng |
| KT-10 | 9.1: đèn 4 giờ, quạt 4 giờ, máy tính 1 giờ | 2,1 kWh; 5.250 đồng; giảm 1,3 kWh và 3.250 đồng |
| KT-11 | 9.2: tiết kiệm 100.000/tháng | Còn thiếu 600.000; cần 6 tháng; vẫn hợp lệ sau biến động |
| KT-12 | 9.2: tiết kiệm 150.000/tháng rồi tăng chi phí | Trước biến động: 4 tháng; sau biến động: vượt nguồn tiền 50.000/tháng, cần điều chỉnh |
| KT-13 | 9.2: tiết kiệm 0 đồng/tháng | Hiển thị chưa có thời điểm đạt mục tiêu; không chia cho 0 |
| KT-14 | 9.3: chọn cả 3 hoạt động | Tổng 105 phút; còn 15 phút; hợp lệ nếu đủ kỹ năng, ngày, sản phẩm dự kiến và lý do |
| KT-15 | Thử lại hoặc đóng rồi mở phiên | Lượt cũ còn nguyên; bản nháp/tiến độ đã lưu có thể tiếp tục |
| KT-16 | API AI lỗi | Kết quả mô phỏng vẫn xem được; câu hỏi phản tư có sẵn vẫn sử dụng được |

## 11. Thứ tự triển khai đề xuất

| Đợt | Công việc | Điều kiện chuyển tiếp |
|---|---|---|
| 1 | Xây 8.1 từ đầu đến cuối: thao tác → kết quả → thử lại → phản tư → lưu | Chạy đúng KT-01 đến KT-04, tiếp tục được phiên đã lưu |
| 2 | Dùng lại cấu trúc để xây 8.3 và 9.1 | Tính đúng, xử lý đầu vào lỗi, lưu được bằng chứng |
| 3 | Bổ sung 8.2, 9.2, 9.3; tích hợp một thao tác CV ở 8.2 | Đủ 6 nhiệm vụ chính, chạy được bằng chuột và kiểm tra được CV |
| 4 | Hoàn thiện giao nhiệm vụ, hồ sơ, gợi ý theo quy tắc và kiểm thử | Không còn lỗi chặn luồng học sinh/giáo viên |

**Chốt phạm vi:** MVP gồm 6 nhiệm vụ chính, một vòng học tập dùng chung, AI Coach có phương án dự phòng và một tương tác CV giới hạn. Chưa triển khai đồng thời 24 vấn đề trải nghiệm.

## 12. Khi nào có thể coi nội dung đã sẵn sàng để code?

| Việc cần xác nhận | Người/nguồn xác nhận | Tình trạng hiện tại |
|---|---|---|
| Phép tính và đơn vị nhất quán | Nhóm đối chiếu các ví dụ và bộ nghiệm thu | Đã kiểm tra các ví dụ trong tài liệu; chưa phải kết quả chạy phần mềm |
| Phần giả lập được phân biệt với nguyên lý thật | Bảng căn cứ của từng kịch bản | Đã bổ sung; mọi tham số giả lập đều phải tiếp tục hiển thị đúng bản chất trong UI |
| Phù hợp kiến thức lớp 8–9 và mục tiêu đồ án | Giảng viên/giáo viên đối chiếu yêu cầu cần đạt và kế hoạch dạy học | Chờ xác nhận |
| Nội dung không tạo hiểu nhầm ngoài thực tế | Giáo viên duyệt nhiệm vụ, câu giải thích và câu hỏi phản tư | Chờ xác nhận |
| Phần mềm chạy đúng quy tắc | Nhóm chạy bộ nghiệm thu sau khi triển khai | Chưa thực hiện |

Có thể bắt đầu prototype kỹ thuật bằng dữ liệu giả lập. Trước khi dùng để đánh giá học tập với học sinh, cần hoàn thành phần duyệt nội dung. Khi thêm dữ liệu thật, phải ghi nguồn, đơn vị, điều kiện thu thập và phiên bản; không tự bỏ nhãn giới hạn chỉ vì đã có dữ liệu đo.

### Mẫu ghi nhận một lần kiểm chứng

| Nội dung cần ghi | Ví dụ cách ghi |
|---|---|
| Kịch bản, phiên bản và quy tắc | 8.1 / v1.1 / hai số đo liên tiếp đạt ngưỡng |
| Đầu vào và chuẩn đối chiếu | Bộ A, ngưỡng 60 cm; bảng tính tay cho kết quả phút 4 |
| Kết quả quan sát | Điền kết quả thực sự sau khi chạy; không dùng ví dụ này như biên bản đã làm |
| Sai lệch và quyết định | Khớp chuẩn / cần sửa, kèm mô tả sai lệch và lý do |
| Người kiểm tra, ngày và bằng chứng | Họ tên, ngày, ảnh/bảng tính hoặc kết quả kiểm thử |

## 13. Nguồn tham khảo đã đối chiếu

Ngày truy cập: **28/10/2026**. Đây là tài liệu tham khảo nguyên lý, không phải chứng nhận cho sản phẩm hoặc xác nhận chương trình Việt Nam.

| Nguồn | Dùng cho | Không dùng để khẳng định |
|---|---|---|
| [NWS — Flooding FAQ](https://www.weather.gov/lot/floodingfaq) | Phân biệt mực nước, mốc đo và mức gây nguy cơ theo địa điểm | 80 cm là mức nguy hiểm ngoài đời hoặc 2 lần đo là tiêu chuẩn cảnh báo |
| [EPA — Mitigate Flooding](https://www.epa.gov/green-infrastructure/mitigate-flooding) | Vai trò lưu giữ nước và giới hạn của suy luận về ngập | Dung tích, chi phí, công thức hình hộp hoặc khả năng chống ngập của công trình giả lập đã được EPA xác nhận |
| [CFPB — Hoạt động giáo dục tài chính](https://www.consumerfinance.gov/consumer-tools/educator-tool/youth-financial-education/teach/activities/) | Tham khảo cách xây tình huống quyết định tài chính | Định mức tiêu vặt, mức chi tối thiểu hoặc chuẩn tiết kiệm cho học sinh Việt Nam |
| [CFPB — Your Money, Your Goals](https://www.consumerfinance.gov/consumer-tools/educator-tool/your-money-your-goals/toolkit/) | Tham khảo công cụ ngân sách và điều chỉnh | Mức thu/chi nhân vật trong bài là số liệu thực tế |
| [Chính phủ Australia — Energy Ratings](https://www.energy.gov.au/households/energy-rating) | Đổi đơn vị và ước tính điện năng/chi phí | Công suất các thiết bị mẫu, giờ tối thiểu hoặc đơn giá điện Việt Nam |
| [CFPB — Savings Plan](https://files.consumerfinance.gov/f/documents/cfpb_your-money-your-goals_savings_plan_tool_2018-11_ADA.pdf) | Mối quan hệ giữa mục tiêu, số kỳ và mức tiết kiệm | Thời gian thực tế chắc chắn đạt mục tiêu |
| [EEF — Metacognition and self-regulation](https://educationendowmentfoundation.org.uk/education-evidence/teaching-learning-toolkit/metacognition-and-self-regulation/) | Căn cứ cho lập kế hoạch, theo dõi và tự đánh giá | AI LifeLab đã được chứng minh có hiệu quả học tập hoặc dự đoán được năng lực/nghề nghiệp |
