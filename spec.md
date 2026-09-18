# AI SPEC — VinMark: biến chỗ chưa hiểu thành quiz ôn tập

Nhóm VinMark · K4–3B · E403 · Track A2 — tính năng mới trên VLearn.


Tài liệu: [Canvas nhóm](CANVAS.md) · [Workflow](WORKFLOW.html) · [Chi tiết triển khai](SHOWCASE_SPEC.md) · [Bối cảnh BTC/data](HACKATHON_CONTEXT.md).

## §1. User & Job

**Job executor:** Học viên đang học lý thuyết trên VLearn, vừa hỏi Tutor về một đoạn slide chưa hiểu.

**Core JTBD:** Tìm lại và ôn đúng phần kiến thức từng chưa hiểu sau buổi học để tiếp tục làm bài thực hành.

**Problem statement:** Sau khi hỏi bài, học viên khó tìm lại câu hỏi và đoạn kiến thức liên quan; phải dò chat từng slide hoặc chụp màn hình vào ghi chú rời. Việc ôn bị gián đoạn, có nguy cơ giữ nguyên chỗ hổng khi làm lab.

### Bằng chứng và giới hạn

| Nguồn | Đã có | Chưa được chứng minh |
|---|---|---|
| Khảo sát pilot (21 phản hồi) | 18/21 người biết về trợ giảng AI trên VLearn; 14/21 ít khi sử dụng, trong đó 11 người không sử dụng vì không có nhu cầu; 19/21 cho biết họ cảm thấy khó tìm lại kiến thức khó hiểu cũ; 19/21 sẵn sàng thử/test nếu có tính năng | Mẫu nhỏ, chưa đại diện toàn VLearn; chưa đo thời gian tìm lại, hay hiệu quả ôn thực tế |
| Chatlog pack | Có ví dụ người dùng nói “ôn lại bài cũ”, “tóm tắt nội dung chính”, “không hiểu câu quiz” | Không đủ để suy ra tỷ lệ toàn người dùng hay mức độ ưu tiên tuyệt đối |
| Willing users | 19/21 phản hồi đồng ý sẵn sàng làm user | Chưa có phiên dùng thử thực tế hoặc feedback sau khi dùng |

Năm ví dụ đã đọc, trích ngắn:

| Turn ID | Nguyên văn | Tín hiệu |
|---|---|---|
| T11631 | “tớ muốn ôn lại bài cũ day01” | Muốn ôn lại |
| T12740 | “tóm tắt những nội dung chính core nhất để tôi ôn tập được chứ ?” | Tổng hợp để ôn |
| T13197 | “tôi ko hiểu câu quizz này” | Cần giải thích quiz |
| T11920 | “nếu làm sai k được max điểm có ảnh hưởng tới điểm chung không” | Cần phân biệt luyện tập với điểm chính thức |
| T10696 | “target của việc ôn tập là gì, kiểm tra cuối tuần à” | Cần rõ mục tiêu ôn |


## §2. Impact và quyết định chọn

VinMark được nhóm chọn trong canvas dựa trên bằng chứng pilot. Bảng dưới là khung so sánh đề xuất, chưa phải lịch sử ba phương án đã được nhóm thử nghiệm.

| Phương án | Người gặp / tần suất | Chi phí mỗi lần | Quyết định |
|---|---|---|---|
| Kho ôn có nguồn + quiz nhiều câu | 19/21 phản hồi cho biết họ cảm thấy khó tìm lại kiến thức cũ; 14/21 ít khi sử dụng trợ giảng AI trong đó 11 người không dùng vì không có nhu cầu; 14/21 thường dùng những cách đánh dấu slides và/hoặc hỏi trợ giảng AI về kiến thức khó; 19/21 sẵn sàng thử nếu có tính năng luyện tập | Chưa đo phút tìm/lần, nhưng rõ là có friction trong quá trình recall và review | Chọn; khớp với “lấy lại đúng chỗ chưa hiểu” và có khả năng chuyển đổi tốt trong mẫu pilot |
| Cải thiện tính năng Tutor | 18/21 biết về tính năng; nhiều người chỉ ít khi dùng hoặc không cần giải thích ngay tại chỗ | Chưa đo; không chứng minh lỗi trả lời hoặc nghĩa vụ sửa lập tức | Tạm để sau; đây không phải slice chính nếu mục tiêu là recall sau buổi học |
| Tổng hợp từng buổi | Có ví dụ trong chatlog, nhưng form không đo trực tiếp nhu cầu “tóm tắt cả buổi” | Chưa đo thời gian đọc/tìm | Tạm để sau; quá rộng so với pain point được dữ liệu pilot hỗ trợ |

Dữ liệu form cho thấy người dùng không thiếu ý định học, mà thiếu một flow ôn nhắm đúng chỗ và dễ quay lại. Do đó, sản phẩm nên ưu tiên “trả lời đúng một phần khó hiểu, lưu lại và nhắc ôn”, thay vì tổng hợp cả buổi hay cải thiện toàn bộ Tutor tại chỗ. Chưa có impact định lượng đầy đủ cho toàn VLearn; cần thêm khảo sát/mỗi lần đo thời gian và hiệu quả trước khi khẳng định tỷ lệ lớn hơn mẫu.

## §3. Giải pháp tương tự đã nghiên cứu

Một số sản phẩm như Khanmigo, StudyFetch và Gemini Notebook đã giải quyết một phần vấn đề bằng cách lưu lại lịch sử hỏi đáp, cho phép hỏi trực tiếp dựa trên slide/tài liệu và tạo notes, flashcards hoặc quiz để ôn tập. Tuy nhiên, các giải pháp này chủ yếu tập trung vào chat history hoặc tài liệu học tập, chưa gắn chặt với ngữ cảnh khóa học như lecture, slide và bài lab. Khoảng trống của VLearn là biến mỗi lần học viên hỏi Tutor thành một “learning gap” được lưu theo đúng slide/kiến thức, để sau buổi học có thể nhanh chóng tìm lại, ôn tập và kiểm tra lại trước khi làm lab. 

## §4. Thiết kế

- Lát cắt MỘT CÂU (1 user · 1 việc · 1 quyết định AI · 1 kết quả):
  Học viên vừa đánh dấu hoặc hỏi về một đoạn slide khó hiểu trong buổi học · hệ thống cần quyết định xem đoạn đó có đủ ngữ cảnh để tạo quiz ôn tập không · nếu đủ, sinh bộ quiz 3–10 câu theo đúng nguồn đã lưu; nếu thiếu, hỏi lại hoặc yêu cầu nguồn bổ sung thay vì bịa đáp án.

- Non-goals (≥3 thứ KHÔNG build):
  1. Không tạo chatbot tổng quát cho toàn khóa học.
  2. Không quét hoặc tổng hợp cả buổi học thành một “AI tutor toàn bộ”.
  3. Không tính điểm/đánh giá chính thức hay thay thế bài thi của khóa.
  4. Không tự động tạo quiz khi thiếu ngữ cảnh mà không hỏi lại / không báo lỗi rõ ràng.

- Mức prototype nhắm tới: [ ] Sketch [ ] Mock [x] Working — phần nào mock, phần nào thật:
  - Mock: Không có.
  - Thật: backend AI/validator có thể gọi model, kiểm tra ngữ cảnh, sinh/cấu trúc output; log và trace dùng cho eval.
  - Chưa thật đầy đủ: chưa có end-to-end production trên toàn bộ nguồn học, và chưa hoàn toàn chốt quality bar ở mức sản phẩm.

- Automation: [ ] augment [x] conditional [ ] automate — lý do theo cost-of-error:
  - Đây là automation kiểu conditional vì chi phí sai ở mức cao: nếu không có đủ ngữ cảnh, hệ thống phải dừng và nhờ người dùng bổ sung nguồn, thay vì sinh quiz sai.
  - Cost-of-error cao khi AI bịa nội dung, thiếu nguồn, hoặc gắn quiz vào slide sai; vì vậy quyết định AI phải là “tạo / hỏi lại / từ chối”, không phải “luôn cố làm”.
  - Trong phạm vi này, mô hình giúp giảm thao tác, nhưng không được tự động hành động khi có bất kỳ dấu hiệu thiếu căn cứ nào.

### §4b. Nguyên tắc đã áp dụng (≥4 — HAX/PAIR, xem guide)

| Nguyên tắc | Áp cụ thể vào đâu trong prototype |
|---|---|
| G1: phạm vi | Chỉ làm với một đoạn slide/chỗ chưa hiểu đã lưu; không mở rộng thành “AI tổng hợp cả buổi học” |
| G2: giới hạn | Quiz chỉ là luyện tập, không thay thế điểm/chấm thi chính thức; hiển thị rõ trong UI |
| G10: thu hẹp | Nếu thiếu nguồn hoặc ngữ cảnh, app hỏi lại một câu ngắn hoặc yêu cầu chọn đúng slide/đoạn trước khi tạo câu hỏi |
| G11: giải thích | Mỗi câu hỏi có giải thích và nút mở nguồn để người học kiểm tra căn cứ |
| G8: Gạt bỏ dễ dàng. | Người học được phép bỏ qua câu quiz không phù hợp.  |

## §5. Kiểu lỗi — bốn lớp, tám kịch bản

| Lớp | Tình huống | Hành vi mong muốn | Nguyên tắc |
|---|---|---|---|
| ① Nguồn sự thật | Không có đoạn hỗ trợ số câu đã chọn | Không sinh, giữ mục, chọn nguồn | G10 |
| ① Nguồn sự thật | Citation sang bài khác | Chặn bộ lỗi, thử lại/chọn nguồn | G11 |
| ② Mơ hồ | “Đoạn này” nhưng không có đoạn | Hỏi vị trí cụ thể | G10 |
| ② Mơ hồ | Đoạn chỉ có một từ/ký hiệu | Yêu cầu ngữ cảnh | G10 |
| ③ Phạm vi | Hỏi ngoài bộ nguồn | Nêu giới hạn, chọn bài phù hợp | G1 |
| ③ Thẩm quyền | Yêu cầu làm bài thi tính điểm thay học viên | Nêu phạm vi luyện tập | G1/G2 |
| ④ Domain | Nguồn giản lược token luôn bằng một từ | Không dùng phát biểu sai làm đáp án, yêu cầu nguồn rõ | G2/G11 |
| ④ Domain | Nhầm D01 khác khóa / trang PDF | Đúng định danh; chưa mapping thì mở transcript hoặc báo thiếu | G11 |

## §6. Bốn đường đi trải nghiệm

- **Happy:** lưu → mở nguồn → đủ ngữ cảnh → quiz 3–10 câu → nộp → kết quả/lịch sử/nhắc theo trạng thái.
- **Low-confidence:** mơ hồ → hỏi một câu làm rõ → bổ sung → kiểm tra lại.
- **Failure:** thiếu căn cứ hoặc API lỗi → lý do cụ thể → chọn nguồn/thử lại; không hiện bộ lỗi.
- **Correction:** người dùng báo câu AI sai → lưu feedback, vô hiệu bộ cũ, giữ lịch sử → chọn nguồn/tạo lại. Học viên làm sai quiz là nhánh luyện tập riêng.

Ngoài phạm vi và đặc thù domain xem §5; sơ đồ xem WORKFLOW.html.

## §7. Kiểm thử

**Golden set dự kiến:** 20 ca = 10 thường + 8 khó (hai ca/lớp) + 2 hiếm; ≥10 ca từ chatlog thật, có turn ID và mô tả biến đổi. Hai ca hiếm: chỉ dẫn giả trong nguồn; phản hồi cũ sau đổi phiên bản. 

| Chiều | Một ca pass khi |
|---|---|
| Đúng quyết định | Tạo/hỏi lại/từ chối đúng hành vi mong đợi |
| Đúng và có căn cứ | Mọi câu, đáp án, giải thích được người chấm đối chiếu; không bịa nguồn |
| Cấu trúc/phạm vi | Đúng 3–10 câu theo `questionCount`, bốn lựa chọn và một đáp án/câu; không trùng; retry giữ số câu và phạm vi |

**Quality bar:** ≥19/26 ca pass; mọi ca thiếu/ngoài phạm vi xử lý đúng; không có đáp án sai hoặc nguồn bịa trong toàn bộ output của lượt đánh giá. Abstain đúng được tính pass. Chạy và ghi cả fail, không chỉ chọn output đẹp.

Hai người chấm độc lập năm output để làm rõ tiêu chí. Nhóm chốt bar và commit trước CP4, không đổi sau khi khóa vì kết quả thấp.

| Lượt | Số ca | Kết quả |
|---|---|---|
| Lượt 1 - Huy/Khuê | 10 | 8/10 (80%) |
| Lượt 2 - Huy/Dũng | 10 | 7/10 (70%) |

## §8. Phân công và kế hoạch

| Thành viên | Theo canvas nhóm | Đầu ra |
|---|---|---|
| Dũng | Evidence chatlog, ≥20 ca và đo | Phương pháp/bảng đếm/turn ID; golden set; kết quả từng lượt và phân tích fail |
| Huy | Prototype, AI đủ ngữ cảnh → quiz 3–10 câu, nhắc +1/+3 | Luồng end-to-end, API/trace, lỗi/abstain/retry, nhắc và persistence |
| Khuê | Canvas, khảo sát ≥20, spec, user test, feedback/changelog, slide/demo | Log khảo sát, impact/spec, validation, PDF sáu trang và video |

**Willing users ngoài nhóm đã đồng ý theo xác nhận của nhóm:** Nguyễn Ngọc Thái An, Hồ Hoàng Phương Anh, Đoàn Anh Quân. Chưa có log đã dùng thử. README BTC yêu cầu năm người khi làm R6 trong khi rubric/guide ghi hai: chuẩn bị thêm hai nếu theo README, đối chiếu TA; không tự tạo tên/kết quả.

| Mốc 3B | Hạn, giờ Việt Nam | Đầu ra |
|---|---|---|
| CP3 | 16:00 · 18/09/2026 | AI thật, video 30 giây, golden set/kết quả lượt đầu |
| CP4 | 21:00 · 18/09/2026 | Chốt spec/bar, khai phần thiếu |
| CP5 | 22:30 · 18/09/2026 | PDF sáu trang, video dự phòng, dry run |
| CP6 | 09:00 · 19/09/2026 | Thuyết trình |

Đây là lịch sự kiện, chưa xác nhận nhóm đã nộp mốc nào. README/rubric khác nhau về người nộp/thời lượng pitch; theo hướng dẫn TA hiện hành. Tên đầy đủ/mã học viên ba thành viên chưa được cung cấp.


## §9. Changelog

| Mốc | Thay đổi | Căn cứ |
|---|---|---|
| Đọc repo BTC | Taxonomy, golden set, nguồn, checkpoint | HACKATHON_CONTEXT.md |
| Nhận canvas | Khảo sát 21/21, ba willing users, phân công thật | Canvas nhóm cung cấp |
| Tiếp tục spec | Quiz linh hoạt 3–10 câu; thay template bằng dự thảo có evidence và trạng thái thiếu | Canvas ưu tiên hơn đề xuất 3–5 câu trước |

