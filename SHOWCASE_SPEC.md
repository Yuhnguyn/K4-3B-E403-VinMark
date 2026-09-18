# VinMark — Showcase spec

Ngày: 18/09/2026 · Bản 1.2 · Đã đối chiếu đề bài và data pack BTC; chưa phải báo cáo triển khai.

> Tìm lại đúng chỗ chưa hiểu → ôn theo nguồn → làm quiz → biết cần ôn gì tiếp.

**Track đề xuất: A2 — tính năng mới trên VLearn.** Lát cắt: Một học viên muốn ôn lại điểm chưa hiểu trong bài vừa học · AI quyết định tạo quiz bám nguồn hoặc yêu cầu bổ sung căn cứ · học viên kiểm tra lại và biết ý cần ôn tiếp.

Bối cảnh, số liệu đã đếm, giới hạn và nguồn tham chiếu: [HACKATHON_CONTEXT.md](HACKATHON_CONTEXT.md). Dùng tài liệu này để phát triển; bài nộp vẫn phải hoàn thiện `spec.md` theo mẫu BTC.

## 1. Người dùng và mục tiêu

Học viên VLearn vừa hỏi Tutor hoặc đánh dấu một đoạn slide chưa hiểu. Họ cần tìm lại nội dung đó theo buổi học và kiểm tra mức hiểu mà không phải tìm lại toàn bộ chat.

**Thành công của showcase:** người xem thực hiện được một vòng lưu → xem nguồn → quiz AI → nhận giải thích → ôn lại hoặc hoàn tất. Mọi câu hỏi quiz đều mở được nguồn tương ứng.

Đã tìm thấy câu hỏi thật về ôn lại bài và tóm tắt để ôn (T11631, T12740). Đã kiểm tra 13.494 lượt toàn pack, trong đó K4 có 3.097 lượt. Những dữ liệu này chưa xác nhận pain mất thời gian tìm lại kiến thức hoặc hiệu quả học tập của VinMark; cần mining có phương pháp và user test. Không biến thiếu rating/mức hiểu trong log thành kết luận học viên chưa hiểu.

## 2. Phạm vi và ranh giới thật/mô phỏng

| Thành phần | Hiện tại | Mục tiêu showcase |
|---|---|---|
| Giao diện | HTML/CSS/JS thuần, 3 màn hình | Giữ và hoàn thiện luồng |
| Lưu mục ôn, ghi chú | localStorage | Lưu thêm phiên bản nội dung, quiz và từng lượt làm |
| Nguồn bài học | Slide demo | Một bài, vài đoạn transcript đã đối chiếu; gắn trang PDF chỉ khi kiểm chứng |
| Chat Tutor | Nhắc lại slide, chưa có AI | Giữ mô phỏng, ghi rõ; câu hỏi là đầu vào của mục ôn |
| Quiz | Câu hỏi viết sẵn | Gọi AI thật qua server, kiểm tra cấu trúc và nguồn |
| Nhắc ôn | Nhãn minh họa | Opt-in; tính hạn +1/+3 ngày và hiển thị khi mở ứng dụng |
| Mất kết nối AI | Chưa tích hợp | Báo lỗi, cho thử lại; chế độ demo mẫu phải được chọn và ghi nhãn rõ |

Không làm: tài khoản, đồng bộ nhiều thiết bị, tích hợp VLearn thật, chatbot mới, tự luận, OCR, vector database, hệ nhiều agent chạy trong sản phẩm, email/push, hệ thống chấm điểm chính thức.

Đã clone pack vào `data/local/hackathon-context/data/vlearn-pack/`: chatlog, 6 transcript và 2 PDF. Chưa tích hợp vào app, chưa có manifest nguồn được duyệt. Đề xuất bắt đầu từ Foundation/attention với đoạn `T04-040`; chọn đủ nội dung hỗ trợ quiz trước khi triển khai. Transcript là lời giảng có diễn giải giản lược; người phụ trách phải đối chiếu nội dung, bỏ ý không rõ hoặc tuyệt đối hóa. Không coi câu trả lời Tutor là đáp án chuẩn. Mức đích: **Mock có AI thật ở lõi**; chỉ khai Working khi thật sự chạy end-to-end trên pack.

## 3. Đơn vị dữ liệu và giao diện

**Một mục ôn = một vị trí nguồn**, khóa bằng `courseId + lectureCode + materialId + locator`. Với slide, locator là page; với transcript, là segmentId. Câu hỏi khác trên cùng nguồn được thêm vào mục đó; đánh dấu hoặc gửi lại đúng câu hỏi không tạo bản trùng. Chưa dùng AI để gộp chủ đề giữa nhiều slide/đoạn.

Tên buổi lấy từ bảng ánh xạ được duyệt: `K4P1/D03` trong data là DAY02, không phải buổi 3. Không gán trang chatlog sang PDF hackathon. Nếu chỉ có transcript, nút **Mở nguồn** mở đúng đoạn, không hiển thị số trang giả.

Mỗi mục có câu hỏi đã lưu, thời điểm, nguồn, tóm tắt ngắn, phiên bản nội dung và lịch sử làm bài. Danh sách nhóm theo buổi; hỗ trợ tìm kiếm và lọc trạng thái.

| Màn hình | Thông tin chính | Hành động chính |
|---|---|---|
| Bài học | Slide, nguồn, câu hỏi | Đánh dấu / gửi câu hỏi |
| Luyện tập | Danh sách mục + chi tiết câu hỏi, tóm tắt, nguồn | Làm quiz / bổ sung câu hỏi / mở nguồn slide hoặc transcript |
| Quiz & kết quả | Câu hỏi; sau nộp mới hiện đáp án, giải thích, nguồn | Nộp bài / xem ý sai / ôn lại / báo câu sai |

Quiz và kết quả dùng vùng chi tiết hiện có, không tạo thêm hệ thống điều hướng.

## 4. Luồng và quy tắc quyết định

1. Học viên hỏi Tutor hoặc đánh dấu slide. Lưu mục trước; không gọi AI chỉ để lưu.
2. Mở Luyện tập, chọn mục, xem câu hỏi và nguồn. Trước lần tạo quiz đầu, tóm tắt có thể là trích đoạn nguồn đã chuẩn bị; không gắn nhãn AI cho nội dung này.
3. Bấm **Làm quiz**. Nếu có bộ cùng phiên bản nội dung và hợp lệ, dùng lại. Nếu chưa có bộ, có đầu vào mới hoặc học viên chọn ôn lại sau lần chưa đạt, chuẩn bị bộ mới. Mục đã đạt cho phép làm lại bộ cũ; mở lại mục không tự gọi AI. Lượt làm lại được lưu riêng và kết quả mới nhất quyết định trạng thái.
4. Server lấy nguồn theo mã tham chiếu. Nguồn thiếu, ngoài phạm vi hoặc không đủ tạo bài kiểm tra thì trả về lý do và yêu cầu bổ sung; không đoán đáp án.
5. AI tạo tóm tắt và chọn **3–10 câu** trắc nghiệm theo độ rộng nguồn; mỗi câu có một đáp án đúng, giải thích và dẫn nguồn. Thiếu căn cứ cho số câu đã chọn hoặc không tạo được câu không trùng thì yêu cầu bổ sung nguồn.
6. Học viên biết số câu cần đúng trước khi làm. Cho đổi đáp án trước khi nộp; chỉ nộp khi đã trả lời hết.
7. Chấm bằng code: `correct / total >= 0.8`, làm tròn ngưỡng tối thiểu lên bằng `ceil(80% × total)`. Vì vậy 3 câu cần 3/3, 5 câu cần 4/5, 10 câu cần 8/10. Canvas chưa chốt ngưỡng đạt. Đây là tiêu chí demo, không phải bằng chứng đã thành thạo kiến thức. Hiển thị **Luyện tập — không tính vào điểm khóa học**, đáp ứng lo ngại quan sát được ở T11920.
8. Đạt: chuyển **Đã ôn đạt**, dừng nhắc cho mục đó, giữ lịch sử. Chưa đạt: giữ **Cần ôn**, hiển thị ý sai, giải thích và nguồn.
9. Học viên chủ động chọn **Ôn lại**. Bộ mới giữ số câu và tập ý cốt lõi (`coverageTags`) của bộ đầu trong cùng phiên bản, ưu tiên cách hỏi khác về ý đã sai. Mỗi lượt chấm độc lập; không cộng điểm qua nhiều lượt và không đánh dấu đạt chỉ nhờ mini quiz phần sai. Nếu không thể tạo đủ câu có căn cứ, trả `needs_context`, không giảm phạm vi để học viên dễ đạt.

**Phiên bản nội dung:** tăng khi có câu hỏi mới, thay nguồn hoặc sửa nội dung nguồn. Hủy bộ đang làm, giữ kết quả cũ dưới phiên bản cũ; mục trở lại Cần ôn. Khóa chỉnh nội dung khi đang làm bài; muốn sửa phải chọn thoát bài trước.

Server trả thêm `sourceVersion` của nguồn đã curate; client đối chiếu để phát hiện nguồn đổi và tăng `revision` của mục. `revision` là phiên bản mục ôn, `sourceVersion` là phiên bản tài liệu. Revision mới chọn lại coverage và số câu trong khoảng 3–10, không kế thừa bắt buộc baseline cũ.

**Bổ sung nguồn:** chọn lại nguồn trong bộ đã đối chiếu. Ghi chú tự nhập không tự trở thành nguồn đúng; nếu bộ nguồn không trả lời được thì tiếp tục báo thiếu căn cứ.

**Báo câu sai:** cho nhập ghi chú, đánh dấu bộ quiz không còn hợp lệ, đưa mục về Cần ôn; giữ lịch sử và feedback. Chỉ tiếp tục sau khi chọn nguồn phù hợp hoặc tạo bộ khác. Không tự sửa đáp án theo ý người dùng.

**Nhắc ôn:** mặc định tắt. Khi bật, hạn được tính từ lúc lưu mục; nếu chưa đạt thì vẫn giữ các hạn đó, sau ngày +3 chỉ hiển thị quá hạn. Khi nội dung thay đổi và đã bật nhắc, tính lại từ thời điểm cập nhật. Không gửi thông báo ngoài ứng dụng.

## 5. Trạng thái và lỗi

Automation: **conditional**. Sai kiến thức khiến học viên ôn sai; chỉ tạo khi nguồn đủ và output qua kiểm tra. Với trường hợp chưa chắc, hỏi làm rõ hoặc yêu cầu nguồn; không tự quyết định điểm khóa học.

### Bốn đường đi phải thấy trong demo

| Đường đi | Hiển thị và hành động |
|---|---|
| Happy | Đủ nguồn → quiz → kết quả và dẫn nguồn |
| Low-confidence | Câu hỏi mơ hồ → hỏi lại một câu cụ thể; giữ mục ôn |
| Failure | Không có căn cứ hoặc API/schema lỗi → giải thích lý do, bổ sung nguồn/thử lại; không hiện quiz giả |
| Correction | Học viên báo câu sai → giữ feedback, vô hiệu bộ cũ, chọn lại nguồn hoặc tạo bộ khác |

Trả lời quiz sai là nhánh luyện tập; không thay thế nhánh correction do người dùng sửa lỗi của hệ thống.

Nguyên tắc áp dụng: **G1** ghi phạm vi và mock ở đầu luồng; **G2** nói rõ kết quả là luyện tập; **G10** hỏi làm rõ khi thiếu căn cứ; **G11** giải thích kèm nguồn từng câu; **G9/G15** nút báo câu sai và sửa nguồn ngay trong mục ôn.

Trạng thái mục: `need` (Cần ôn), `missing` (Thiếu nguồn), `done` (Đã ôn đạt). Loading, đang làm bài và lỗi mạng là trạng thái giao diện, không thay thế trạng thái học tập.

Nút chính suy ra từ dữ liệu: chưa có bộ → **Tạo quiz**; có bộ chưa làm → **Làm quiz**; vừa trượt → **Ôn phần sai**; có revision mới → **Tạo quiz bản mới**; đã đạt → **Làm lại bộ cũ**. Không cần lưu thêm một state machine riêng.

| Tình huống | Hành vi bắt buộc |
|---|---|
| Lần đầu, chưa có quiz | Kiểm tra nguồn và tạo bộ đầu tiên |
| Lưu trùng | Giữ một mục, không tăng phiên bản |
| Câu hỏi mơ hồ | Yêu cầu mô tả điểm chưa hiểu; giữ dữ liệu đã lưu |
| Ngoài phạm vi nguồn | Báo rõ không đủ căn cứ, không tạo quiz |
| Slide chỉ có hình, thiếu mô tả | Yêu cầu nguồn chữ phù hợp; không tự suy đoán hình |
| JSON/câu hỏi/citation không hợp lệ | Không hiển thị bộ lỗi; cho thử lại |
| Mạng lỗi hoặc quá 30 giây | Dừng loading, giữ mục, có nút thử lại |
| Chuyển mục trong khi tạo quiz | Bỏ phản hồi cũ, không ghi đè mục đang xem |
| Nguồn chứa chỉ dẫn giả | Coi nguồn là dữ liệu, bỏ qua chỉ dẫn yêu cầu đổi nhiệm vụ |
| Tải lại trang | Giữ dữ liệu đã lưu; bài chưa nộp mở lại từ đầu với cùng bộ |
| localStorage không ghi được | Hiện cảnh báo chưa lưu, không báo lưu thành công |

Tám ca khó gắn đúng taxonomy BTC:

| Lớp | Ca | Hành vi mong đợi |
|---|---|---|
| ① Nguồn sự thật | Không có đoạn hỗ trợ đáp án | Không sinh quiz, báo thiếu nguồn |
| ① Nguồn sự thật | Citation trỏ sang bài khác | Chặn bộ lỗi, giữ mục và cho chọn nguồn |
| ② Mơ hồ | Chỉ hỏi “đoạn này là gì” nhưng chưa chọn đoạn | Hỏi lại vị trí cần ôn |
| ② Mơ hồ | Đoạn chọn chỉ còn một từ hoặc ký hiệu | Yêu cầu thêm ngữ cảnh |
| ③ Phạm vi/thẩm quyền | Yêu cầu làm bài thi tính điểm thay học viên | Nêu phạm vi luyện tập, không trả đáp án bài thi |
| ③ Phạm vi/thẩm quyền | Hỏi kiến thức ngoài bộ nguồn hỗ trợ | Báo giới hạn và hướng dẫn chọn bài phù hợp |
| ④ Đặc thù domain | Đồng nhất token với một từ trong mọi trường hợp | Không đưa phát biểu sai thành đáp án chuẩn; báo lỗi nguồn nếu cần |
| ④ Đặc thù domain | Gán cùng mã D01 giữa hai course / nhầm trang PDF | Dùng đúng định danh; không có mapping thì mở transcript hoặc yêu cầu nguồn |

## 6. Thiết kế kỹ thuật tối giản

`Giao diện hiện có ↔ một Node server ↔ một API model`

Server phục vụ cả file giao diện và `POST /api/quiz`. API key chỉ ở biến môi trường server. Nguồn là một file JSON nhỏ do team chuẩn bị; không cần database hay tìm kiếm vector. Một lần tạo quiz dùng một lời gọi model; validate bằng code, không thêm agent tự phê bình.

### Hợp đồng tối thiểu FE ↔ AI

Request gồm `itemId`, `revision`, `sourceRef`, `learnerQuestions[]`, `mode` (`initial` hoặc `retry`), và `previousAttempt` khi ôn lại. `learnerQuestions` là câu học viên đã hỏi, không phải bộ đề. Lượt trước gửi `questionCount`, `coverageTags`, câu đã hỏi và các ý sai để AI tạo cách hỏi mới; không gửi toàn bộ chat. Server chỉ lấy nguồn từ danh sách cho phép và tự xác định `sourceVersion`, không tin nội dung nguồn do client tự khai.

Response có một trong ba trạng thái:

- `ready`: `itemId`, `revision`, `sourceVersion`, `quizId`, `questionCount`, `coverageTags[]`, `summary[]`, `questions[]`.
- `needs_context`: `itemId`, `revision`, `reason`, `nextAction`.
- `error`: mã lỗi, thông báo ngắn và có thể thử lại hay không.

Mỗi câu gồm `id`, `concept`, `prompt`, `options[4]`, `correctIndex`, `explanation`, `sourceId`, `evidenceQuote`. Mỗi ý tóm tắt cũng có `sourceId` để kiểm tra. Server kiểm tra `questionCount` trong khoảng 3–10, số câu thực tế khớp `questions.length`, đáp án trong khoảng 0–3, bốn lựa chọn khác nhau, không trùng câu, mã nguồn có thật và trích dẫn khớp đoạn nguồn. Khi retry, kiểm tra giữ `questionCount` và bao phủ đủ `coverageTags` đã chốt. Tags là nhãn do team chuẩn bị cho bộ nguồn nhỏ, không xây taxonomy tự động. Không dùng điểm tự tin do model tự khai để quyết định đúng/sai.

Kiểm tra cấu trúc và trích dẫn **không chứng minh đáp án đúng về ngữ nghĩa**; cần người đối chiếu trong bộ đánh giá. Showcase lưu/chấm ở client là đủ; không dùng thiết kế này cho kỳ thi chính thức.

Lưu localStorage: mục ôn + revision; bộ quiz theo revision; từng lượt làm gồm quiz snapshot, đáp án người học, điểm, thời gian; lựa chọn nhắc ôn. Không đổi schema âm thầm làm mất dữ liệu cũ; có bước chuyển đổi từ dữ liệu demo hiện tại.

## 7. Nghiệm thu và chất lượng

### Luồng sản phẩm

- Lưu từ slide/chat, tìm thấy đúng mục; mở lại đúng nguồn và quay về đúng mục.
- Gộp cùng nguồn, không gộp giữa hai khóa hoặc hai tài liệu khác nhau.
- Tạo được bộ đầu; dùng lại bộ chưa nộp; nội dung mới tạo bộ mới.
- Thiếu nguồn bị chặn, bổ sung nguồn phù hợp mới tiếp tục.
- Đạt/chưa đạt đúng ngưỡng; làm lại ưu tiên ý sai nhưng vẫn kiểm tra phạm vi gốc.
- Giữ từng lượt và phiên bản cũ qua reload; phản hồi cũ không ghi đè phiên bản mới.
- Nhắc opt-in, dừng khi đạt; lỗi API không tự chuyển thành kết quả mẫu.
- Hoàn thành trên desktop/mobile; không lỗi JavaScript và không tràn ngang ở 390px.

### Bộ đánh giá AI trước demo

Golden set hiện có **20 ca: 10 thường + 8 khó (2 ca mỗi lớp ①②③④) + 2 hiếm**. Có ít nhất 10 ca lấy/phát triển từ chatlog thật, có turn ID và ghi biến đổi trong `eval/golden_set.csv`; không đưa nguyên pack vào `eval/`. Lượt DeepSeek đầu đạt 14/20 và đã ghi trace/kết quả; chưa đạt quality bar.

Định nghĩa pass: (1) đúng hành vi tạo/hỏi lại/từ chối; (2) mọi câu của bộ sinh ra có một đáp án đúng, giải thích và citation được người chấm đối chiếu với nguồn; (3) bám yêu cầu và giữ coverage/count khi retry. Ca lỗi hệ thống phải giữ dữ liệu và không trả bộ giả. Ca thiếu nguồn pass khi từ chối/hỏi lại đúng, không yêu cầu có quiz.

**Quality bar đề xuất:** ≥18/20 ca pass; tất cả ca thiếu/ngoài phạm vi xử lý đúng; **không có đáp án sai hoặc nguồn bịa trong toàn bộ output sinh ra của lượt đánh giá**. Tách tỷ lệ pass ca (90%) khỏi ngưỡng điểm học viên (80%). Lượt DeepSeek đầu đạt 14/20; cần giữ nguyên kết quả và ghi rõ fail, không chỉ chọn output đẹp. Chưa có người chấm độc lập semantic ngoài validator/citation check.

## 8. Phân công và thứ tự bàn giao

| Chủ trì | Nhiệm vụ | Đầu ra | Hoàn tất khi |
|---|---|---|---|
| Khuê — Product | Evidence chuẩn A/B, impact ≥3 ứng viên, scope, nghiệm thu, validation | `spec.md`, log mining/khảo sát, kỳ vọng các ca, kịch bản demo | Duyệt 4 nhánh; không thiếu nguồn cho các kết luận pain |
| Huy — prototype/UI | Giữ UI, gộp mục, revision, quiz/retry, lịch sử, nhắc in-app | Luồng FE dùng contract thống nhất; sửa test đang hard-code macOS | Qua acceptance giao diện và persistence |
| Huy (AI) + Dũng (eval) | Curate nguồn, server, prompt, validate, abstain, lỗi API | Endpoint + 20 ca có ≥10 turn ID thật + trace + kết quả đầy đủ | Nguồn trace được; báo đúng kết quả so với bar kể cả chưa đạt |

**M0 — Chốt trước khi code:** một buổi học, tập nguồn nhỏ, contract và fixture cho ready/needs_context/error. PM duyệt; FE và AI đồng thuận cùng mẫu dữ liệu.

**M1 — Làm song song:** FE nối dữ liệu mẫu; AI dựng endpoint và đánh giá nguồn. Mỗi người tự kiểm phần mình.

**M2 — Ghép một luồng:** lưu → quiz thật → kết quả → reload. FE và AI review chéo request/response, xử lý lỗi và phiên bản.

**M3 — Showcase:** PM chạy 4 nhánh bên dưới; team sửa blocker. Theo lịch BTC lớp 3B: CP3 **16:00 18/09** (AI thật + video 30 giây + eval lượt đầu), CP4 **21:00 18/09** (`spec.md`, khóa bar), CP5 **22:30 18/09** (PDF 6 trang + video dự phòng), CP6 **09:00 19/09**. Giờ Việt Nam. Sau CP4 không thêm tính năng mới.

README nhóm cần bổ sung họ tên đầy đủ/mã học viên; đã có phân công Dũng–Huy–Khuê trong canvas. Nếu làm R6, lên kế hoạch 5 người ngoài nhóm, trong đó 2 người đã khai CP1 nếu có; README và rubric khác nhau về số người/cách nộp, cần đối chiếu TA (chi tiết trong tài liệu bối cảnh). Không tạo tên, quote hay kết quả validation giả.

## 9. Kịch bản trình diễn 3–5 phút

1. Đánh dấu một slide, mở Luyện tập và xem đúng nguồn.
2. Tạo quiz thật, cố ý sai một câu, xem giải thích và nguồn; ôn lại rồi đạt.
3. Thêm câu hỏi cùng slide, thấy mục được cập nhật và cần ôn phiên bản mới.
4. Mở ca thiếu/mơ hồ, thấy hệ thống yêu cầu bổ sung; báo một câu quiz sai để thể hiện correction và cách khôi phục.

Chuẩn bị chế độ mẫu có nhãn riêng để minh họa UI khi mạng gián đoạn; không dùng nó làm bằng chứng API thật hoạt động.

## 10. Quyết định sau phản biện

- Gộp theo nguồn xác định để giảm mục trùng; chưa phân cụm bằng AI.
- Xử lý rõ lần đầu chưa có quiz, không chỉ hỏi có nội dung mới hay không.
- Ôn phần sai trước, sau đó kiểm tra lại phạm vi mục; không xây hệ thống cộng điểm thành thạo.
- Tập trung AI thật vào quiz có nguồn; Tutor và tích hợp LMS vẫn mô phỏng.
- Dùng lịch nhắc trong app; không thêm dịch vụ gửi thông báo.

Tài liệu này là đặc tả showcase. `spec.md` là bản dự thảo chính đã cập nhật theo canvas nhóm; các phần evidence, khảo sát và nghiên cứu đối chiếu trong đó cần bằng chứng thật trước khi nộp, không suy ra từ spec này.

### Cập nhật 1.1 sau đọc repo BTC

Bổ sung track A2, lịch checkpoint, bốn paths/HAX và taxonomy ca khó; sửa cơ cấu golden set và yêu cầu ≥10 ca từ chatlog; dùng dữ liệu đã đếm thay giả định chưa có pack; mở nguồn transcript khi chưa ánh xạ được slide. Chưa thực thi API, eval hoặc xác nhận nộp bài.


## Cập nhật theo canvas nhóm — ưu tiên bản chính

Xem [spec.md](spec.md) và [CANVAS.md](CANVAS.md). Nhóm báo cáo 11/12 học viên khó tìm lại kiến thức (91,7% trong mẫu); chưa có log gốc. Quiz chọn linh hoạt 3–10 câu. Dũng phụ trách mining/eval; Huy prototype/AI/nhắc; Khuê khảo sát/spec/validation/demo. Willing users đã đồng ý: Nguyễn Ngọc Thái An, Hồ Hoàng Phương Anh, Đoàn Anh Quân; chưa có kết quả dùng thử. Các nhận định chưa có khảo sát/tên người trong lần đọc data trước đã được cập nhật bởi canvas này. Ngưỡng 80% và nhắc opt-in trong app vẫn là đề xuất triển khai, chưa phải quyết định có sẵn trong canvas.
