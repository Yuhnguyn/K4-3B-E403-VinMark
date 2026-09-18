# VinMark — Bối cảnh hackathon và dữ liệu VLearn

Đọc và kiểm tra ngày 18/09/2026. Repo nguồn: [VinUni-AI20k/K4-3B-Day05-06-AI-Product-Hackathon](https://github.com/VinUni-AI20k/K4-3B-Day05-06-AI-Product-Hackathon), commit `eccc0acb7cee6cbcbbe3ec2e3c24721c5a2050d3`.

Bản clone cục bộ: `data/local/hackathon-context/`, đã xác nhận bị Git bỏ qua. Không copy nguyên data pack vào repo nộp bài.

## 1. Kết luận sản phẩm

VinMark phù hợp nhất với **A2 — tính năng mới trên VLearn**: biến câu hỏi/đánh dấu đã có ngữ cảnh thành mục ôn có nguồn và quiz kiểm tra lại. Đây là đề xuất định vị, chưa thay đổi đăng ký track của nhóm.

Không mặc định gọi đây là D2: D2 đặt bài tập **trước** bài giảng, còn VinMark ôn **sau** khi học. Nếu chọn track D để nhấn mạnh học tập thích ứng, phải bổ sung ≥5 người thực sự học qua prototype và ít nhất một chỉ số về kết quả học. [Track A](https://github.com/VinUni-AI20k/K4-3B-Day05-06-AI-Product-Hackathon/blob/main/tracks/track-a-vlearn-tutor.md), [Track D](https://github.com/VinUni-AI20k/K4-3B-Day05-06-AI-Product-Hackathon/blob/main/tracks/track-d-adaptive-interactive-learning.md).

Ưu tiên ngay: evidence → golden set → một quyết định AI thật → bốn đường đi demo. Không mở rộng LMS, chatbot, đa agent hoặc hệ nhắc ngoài ứng dụng.

## 2. Mốc nộp và điều kiện cần nhớ

Giờ Việt Nam, lớp 3B; mốc dưới đây lấy từ tài liệu BTC, không phải lịch ước lượng của team.

| Mốc | Hạn | Đầu ra |
|---|---|---|
| CP1 | 19:30 · 17/09/2026 | Canvas, đội trưởng, repo |
| CP2 | 21:00 · 17/09/2026 | Luồng bấm được hoặc sơ đồ |
| CP3 | 16:00 · 18/09/2026 | Video 30 giây AI thật, ≥20 ca, kết quả lượt đầu |
| CP4 | 21:00 · 18/09/2026 | `spec.md`, chốt quality bar, khai phần chưa xong |
| CP5 | 22:30 · 18/09/2026 | Slide PDF 6 trang, video dự phòng, dry run |
| CP6 | 09:00 · 19/09/2026 | Thuyết trình, không nộp thêm |

Nguồn: [README — lịch và cách nộp](https://github.com/VinUni-AI20k/K4-3B-Day05-06-AI-Product-Hackathon/blob/main/README.md), [rubric — checklist](https://github.com/VinUni-AI20k/K4-3B-Day05-06-AI-Product-Hackathon/blob/main/04-rubric.md).

Các khác biệt nội bộ tài liệu BTC cần hỏi TA khi nộp; không tự khẳng định một bản đúng hơn:

- README yêu cầu đội trưởng nộp chung, cùng mã học viên ở mọi mốc; rubric còn ghi mỗi thành viên nộp riêng.
- README R6 yêu cầu 5 người thử, gồm 2 người khai từ CP1; rubric/guide nêu ≥2. Team nên chuẩn bị 5 người nếu làm validation; canvas đã ghi nhận 3 willing users đồng ý; chưa có kết quả dùng thử.
- README ghi vòng cụm E403 là 6 phút, chung kết 7 phút trình bày + 3 phút hỏi đáp; guide/rubric có lịch demo 5+5. Chuẩn bị lõi demo 5 phút, điều chỉnh theo hướng dẫn trực tiếp.

## 3. Kiểm tra dữ liệu thực tế

Đã đọc data README, dictionary, transcript README; đọc 40 câu hỏi K4 trải đều theo thứ tự thời gian trước khi lọc theo từ khóa. Sau đó đếm toàn bộ CSV bằng bộ đọc CSV hỗ trợ trường nhiều dòng.

| Chỉ số | Toàn bộ pack | K4 | Riêng `K4P1` |
|---|---:|---:|---:|
| Lượt hỏi–đáp | 13.494 | 3.097 | 2.146 |
| Mã học viên khác nhau | 1.617 | 448 | 293 |
| Câu mẫu `is_preset=True` | 3.067 | 542 | 297 |
| Không có citation theo cờ dữ liệu | 3.781 | 839 | 635 |
| Có rating | 177 | 12 | 9 |
| Có `understanding_level` | 20 | 6 | 6 |
| `move_used=validate_understanding` | 22 | 11 | 6 |

Nguồn cục bộ: `data/local/hackathon-context/data/vlearn-pack/chatlog/tutor_turns.csv`. SHA-256: `265fb13cd17168f9e4c9a886de477856d38e777fa2dc7f6b5d2f9c3bb03597cd`.

Tái kiểm trên máy hiện tại: `python data/local/inspect-vlearn.py`; xem mẫu: thêm tham số `sample`. Mẫu thứ i lấy ở vị trí `floor(i × (3097−1)/39)`, i=0..39, trên các hàng K4 theo thứ tự file. Đây là mẫu khám phá có hệ thống, không phải mẫu ngẫu nhiên để ước lượng tỷ lệ pain.

Các số trên mô tả **những gì log ghi nhận**, không chứng minh người học đã/ chưa hiểu, Tutor sai hoặc học viên muốn dùng VinMark. Citation có mặt cũng không chứng minh câu trả lời đúng. Phải tách K4P1 khỏi L2-L3-K4P1 và tách câu mẫu khi phân tích nhu cầu.

### Những ví dụ ngắn liên quan đến ý tưởng

| Turn ID | Trích ngắn nguyên văn | Tín hiệu quan sát được |
|---|---|---|
| T11631 | “tớ muốn ôn lại bài cũ day01” | Muốn ôn bài trước |
| T12740 | “tóm tắt những nội dung chính core nhất để tôi ôn tập được chứ ?” | Muốn tổng hợp để ôn |
| T13197 | “tôi ko hiểu câu quizz này” | Cần làm rõ câu quiz |
| T11920 | “nếu làm sai k được max điểm có ảnh hưởng tới điểm chung không” | Lo quiz ảnh hưởng điểm chính thức |
| T10696 | “target của việc ôn tập là gì, kiểm tra cuối tuần à” | Chưa rõ mục tiêu ôn |

Cách tìm: trên 2.555 lượt K4 không phải câu mẫu, bỏ dòng ngữ cảnh đầu có ngoặc, tìm không phân biệt hoa/thường `quiz|ôn tập|ôn lại|trắc nghiệm|kiểm tra kiến thức`. Có **8 lượt khớp**, đã đọc cả 8. Một lượt chỉ là URL quiz và một lượt chỉ là nhãn “Quiz cuối ngày”; không gọi cả 8 là 8 nhu cầu đã xác nhận. Cách tìm này bỏ sót diễn đạt khác và không phải bộ phân loại pain hoàn chỉnh.

Năm ví dụ trên hỗ trợ hướng ôn tập và yêu cầu UI nói rõ “luyện tập, không tính điểm khóa học”. Chưa chứng minh pain **mất thời gian tìm lại slide/chat**, mức độ phổ biến, thời gian tiết kiệm hoặc mong muốn nhận nhắc +1/+3. Cần hỏi người dùng về lần ôn gần nhất và quan sát họ tìm nguồn; không gán ví dụ nhóm VLearn Recall trong README thành bằng chứng riêng của VinMark.

## 4. Dùng từng nguồn vào việc gì

| Nguồn | Dùng cho VinMark | Không suy ra |
|---|---|---|
| Chatlog | Evidence, câu hỏi thực tế, ≥10 golden cases truy nguyên bằng turn ID | Đáp án đúng hoặc mức hiểu thật |
| Transcript | Ngữ cảnh kiến thức; mở đúng mã đoạn | Số trang PDF khi chưa đối chiếu |
| PDF Day 1/2 | Hiển thị slide và đối chiếu nội dung | Toàn bộ học liệu trên VLearn |
| User test | Khả năng tìm nguồn, hiểu luồng, phản hồi khi sai | Hiệu quả học dài hạn từ một buổi demo |

Pack có 6 transcript với **700 mã đoạn** theo tổng trong bảng README và 2 PDF. Không cần tải tất cả vào prompt; chọn vài đoạn của một bài, giữ nguồn ở server cục bộ. [Data overview](https://github.com/VinUni-AI20k/K4-3B-Day05-06-AI-Product-Hackathon/blob/main/data/README.md).

### Lỗi ánh xạ phải tránh

Trong CSV của `K4P1`: `D01 → Day01`, **`D03 → DAY02`**, `D04 → DAY03`, `D08 → DAY04`. Do đó không dùng số trong `lecture_code` làm số buổi UI. `L2-L3-K4P1/D01` lại là môn Data, khác `K4P1/D01`.

`transcript-04` là Day 1; `transcript-01/02/03` liên quan Day 2; `transcript-06` là buổi Foundation chưa gắn chắc ngày. Chỉ đối chiếu nội dung mới gán đoạn vào slide. Những nguồn chưa có trang dùng `file + segmentId`, `page=null`; UI mở đoạn transcript thay vì giả vờ mở đúng slide.

Các đoạn ứng viên đã đọc để curate:

- `T04-040`: giải thích attention ở mức khái niệm; phù hợp phạm vi Foundation nhỏ.
- `T04-089`: các thành phần prompt/API; cần loại phát biểu tuyệt đối hóa hiệu lực system prompt khỏi đáp án chuẩn.
- `T06-130`, `T06-132`: ví dụ Q/K/V, chỉ dùng khái niệm đã đối chiếu; không biến ví dụ thành công thức kỹ thuật.
- `T06-139`: nhắc RAG và citation; không đủ để xác nhận toàn bộ bộ quiz RAG-vs-fine-tuning trong mockup, không dùng các phát biểu tuyệt đối về RAG làm đáp án.

Đây là **nguồn ứng viên**, chưa phải source manifest đã nghiệm thu. Transcript vẫn là lời giảng đã làm sạch ASR, có chỗ không nghe rõ và diễn giải giản lược. Nếu không đủ chứng cứ thì loại ý đó khỏi quiz hoặc hỏi TA, không thêm kiến thức vào mà vẫn gắn citation cũ.

## 5. Điều chỉnh spec và phân công

| Ưu tiên | Chủ trì | Việc phải có trước demo |
|---|---|---|
| 1 | Khuê | Bằng chứng chuẩn A/B, impact ≥3 ứng viên, tên thành viên, xác nhận track và cách nộp |
| 2 | Dũng + Huy | Source manifest nhỏ, một AI call thật + trace, 20 ca đúng cơ cấu và chạy đủ bộ |
| 3 | Huy | Bốn đường đi rõ, mở đúng loại nguồn, trạng thái và correction; không mở rộng LMS |
| 4 | Cả nhóm | Hai người chấm độc lập 5 output, đối chiếu tiêu chí; ghi mọi fail; video/PDF và dry run |

Golden set: **10 ca thường + 8 ca khó (2 ca mỗi lớp ①②③④) + 2 ca hiếm = 20**; ≥10 ca lấy/phát triển từ chatlog thật. Nhóm tự xác định đầu ra mong muốn sau đối chiếu nguồn. Chạy trọn bộ và báo mọi kết quả, không chỉ các câu đẹp để trình diễn.

`SHOWCASE_SPEC.md` và `WORKFLOW.html` đã được điều chỉnh theo bối cảnh này. `spec.md` đã có canvas, khảo sát 11/12 do nhóm báo cáo, ba willing users và phân công thật. Chưa có log khảo sát, impact đủ số, eval thật hoặc xác nhận nộp checkpoint. Không coi tài liệu thiết kế là bằng chứng đã hoàn tất các phần đó.


## Cập nhật theo canvas nhóm — ưu tiên bản chính

Xem [spec.md](spec.md) và [CANVAS.md](CANVAS.md). Nhóm báo cáo 11/12 học viên khó tìm lại kiến thức (91,7% trong mẫu); chưa có log gốc. Quiz chọn linh hoạt 3–10 câu. Dũng phụ trách mining/eval; Huy prototype/AI/nhắc; Khuê khảo sát/spec/validation/demo. Willing users đã đồng ý: Nguyễn Ngọc Thái An, Hồ Hoàng Phương Anh, Đoàn Anh Quân; chưa có kết quả dùng thử. Các nhận định chưa có khảo sát/tên người trong lần đọc data trước đã được cập nhật bởi canvas này. Ngưỡng 80% và nhắc opt-in trong app vẫn là đề xuất triển khai, chưa phải quyết định có sẵn trong canvas.
