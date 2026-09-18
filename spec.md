# AI SPEC — VinMark: biến chỗ chưa hiểu thành quiz ôn tập

Nhóm VinMark · K4–3B · E403 · Track A2 — tính năng mới trên VLearn.

Dự thảo cập nhật theo canvas nhóm cung cấp ngày 18/09/2026. Chưa xác nhận commit/nộp CP4 hoặc khóa quality bar. Các đề xuất dưới đây chưa phải báo cáo đã triển khai.

Tài liệu: [Canvas nhóm](CANVAS.md) · [Workflow](WORKFLOW.html) · [Chi tiết triển khai](SHOWCASE_SPEC.md) · [Bối cảnh BTC/data](HACKATHON_CONTEXT.md).

## §1. User & Job

**Job executor:** Học viên đang học lý thuyết trên VLearn, vừa hỏi Tutor về một đoạn slide chưa hiểu.

**Core JTBD:** Tìm lại và ôn đúng phần kiến thức từng chưa hiểu sau buổi học để tiếp tục làm bài thực hành.

**Problem statement:** Sau khi hỏi bài, học viên khó tìm lại câu hỏi và đoạn kiến thức liên quan; phải dò chat từng slide hoặc chụp màn hình vào ghi chú rời. Việc ôn bị gián đoạn, có nguy cơ giữ nguyên chỗ hổng khi làm lab.

### Bằng chứng và giới hạn

| Nguồn | Đã có | Chưa được chứng minh |
|---|---|---|
| Khảo sát nhóm | Nhóm báo cáo 11/12 học viên khó tìm lại kiến thức khó hiểu; 91,7% trong mẫu | Chưa có log câu hỏi/câu trả lời; chưa đủ ≥20 người chuẩn A; chưa biết thời gian mất mỗi lần |
| Chatlog pack | Đã đếm 13.494 lượt, K4 có 3.097 lượt; có ví dụ yêu cầu ôn/tóm tắt | Không tự chứng minh mất thời gian tìm lại, hiệu quả học hoặc nhu cầu nhắc +1/+3 |
| Willing users | Ba người được nhóm xác nhận đồng ý thử | Chưa có phiên dùng thử hoặc feedback |

Năm ví dụ đã đọc, trích ngắn:

| Turn ID | Nguyên văn | Tín hiệu |
|---|---|---|
| T11631 | “tớ muốn ôn lại bài cũ day01” | Muốn ôn lại |
| T12740 | “tóm tắt những nội dung chính core nhất để tôi ôn tập được chứ ?” | Tổng hợp để ôn |
| T13197 | “tôi ko hiểu câu quizz này” | Cần giải thích quiz |
| T11920 | “nếu làm sai k được max điểm có ảnh hưởng tới điểm chung không” | Cần phân biệt luyện tập với điểm chính thức |
| T10696 | “target của việc ôn tập là gì, kiểm tra cuối tuần à” | Cần rõ mục tiêu ôn |

Phương pháp và số đếm: [HACKATHON_CONTEXT.md](HACKATHON_CONTEXT.md). Năm ví dụ không thay thế log khảo sát. Khuê tiếp tục đến ≥20 người ngoài nhóm và lưu câu hỏi/câu trả lời thực tế; Dũng hoàn thiện mining kiểm lại được. Không suy rộng 91,7% thành tỷ lệ toàn VLearn.

## §2. Impact và quyết định chọn

VinMark được nhóm chọn trong canvas. Bảng dưới là khung so sánh đề xuất, chưa phải lịch sử ba phương án đã được nhóm thử nghiệm.

| Phương án | Người gặp / tần suất | Chi phí mỗi lần | Quyết định |
|---|---|---|---|
| Kho ôn có nguồn + quiz nhiều câu | 11/12 báo khó tìm lại; tần suất chưa đo | Chưa đo phút tìm hoặc ảnh hưởng lab | Chọn theo canvas; đã có UI và data pack |
| Cải thiện Tutor tại chỗ | K4 có 839/3.097 lượt không citation theo cờ dữ liệu; không phải số người gặp lỗi | Chưa đo; thiếu citation không đồng nghĩa trả lời sai | Tạm để sau; chưa tạo lối tìm lại câu đã hỏi |
| Tổng hợp toàn buổi | Có ví dụ T12740, chưa có tỷ lệ người cần | Chưa đo thời gian đọc/tìm | Tạm để sau; rộng hơn một chỗ chưa hiểu |

Khuê/Dũng bổ sung số người, số lần và phút/lần từ dữ liệu hoặc quan sát thật. Chưa tính được impact định lượng hoàn chỉnh.

## §3. Giải pháp tương tự đã nghiên cứu

Chưa có log trải nghiệm trực tiếp của nhóm. Khuê phân công thử hai giải pháp học với nguồn/quiz, ghi flow thực tế, điểm đáng học, điểm đáng tránh và khác biệt của VinMark. Không khai đã dùng thử khi chưa có dữ liệu.

Khác biệt mục tiêu: mở lại đúng câu hỏi và vị trí nguồn của học viên, rồi kiểm tra bằng quiz ngắn.

## §4. Thiết kế

**Lát cắt theo canvas:** Học viên vừa hỏi Tutor về hoặc đánh dấu một slide · cần ôn lại đúng chỗ đó vài ngày sau · AI quyết định slide có đủ ngữ cảnh để sinh quiz hay không và chọn 3–10 câu phù hợp · nhận quiz trắc nghiệm kèm giải thích trong kho ôn và nhắc sau 1 và 3 ngày.

**Quyết định AI trung tâm:** nguồn có đủ căn cứ tạo số câu phù hợp trong khoảng 3–10 không? Có → tạo số câu AI chọn, mỗi câu có giải thích/dẫn nguồn. Chưa đủ → hỏi làm rõ/yêu cầu nguồn. Ứng dụng tính lịch nhắc bằng code.

**Automation: conditional.** Quiz sai khiến học viên ôn sai; nguồn thiếu phải bị chặn. Kiểm tra citation không chứng minh kiến thức đúng, cần người đối chiếu output đánh giá và có cơ chế báo câu sai.

**Hiện tại:** Module quyết định trung tâm nằm ở [codebase/decision.js](codebase/decision.js), gồm ba trạng thái ready / needs_context / out_of_scope, nguồn là trang PDF Day 1/2, và ghi vết prompt cùng phản hồi thô. Server và eval dùng chung module này. Lượt 1 trên 26 ca đạt 19/26 (73,1%); ba lượt chạy lặp đạt trung bình 75,6%; chưa đạt quality bar đề xuất. Xem [eval/results_round1.md](eval/results_round1.md). **Mục tiêu:** chỉ khai Working khi thực sự chạy end-to-end trên pack đã curate đầy đủ.

**Non-goals:** không quét toàn khóa, không chatbot mới, không đăng nhập/đồng bộ, không tự luận hoặc chấm điểm chính thức, không vector database/multi-agent trong sản phẩm. Nhắc showcase đề xuất hiển thị trong app khi mở lại; không coi đó là email/push.

### Quy tắc MVP

1. Lưu câu hỏi/đánh dấu kèm khóa, bài, tài liệu, trang/đoạn và thời điểm. Cùng vị trí nguồn gom một mục; thao tác lặp không tạo trùng.
2. Luyện tập nhóm theo buổi; mở mục thấy câu hỏi, tóm tắt và nguồn.
3. Chưa có quiz, đầu vào thay đổi hoặc yêu cầu ôn lại sau khi chưa đạt → kiểm tra nguồn và tạo bộ mới. Có bộ hợp lệ cùng phiên bản → dùng lại.
4. Mỗi bộ có **3–10 câu**, số câu do AI chọn theo độ rộng nguồn; mỗi câu có bốn lựa chọn, một đáp án đúng, giải thích và tham chiếu. Không đủ căn cứ cho số câu đã chọn hoặc không tạo được câu không trùng → yêu cầu thêm ngữ cảnh, không bịa thêm.
5. Trả lời hết rồi nộp; sau nộp mới hiện đáp án. Chấm bằng code.
6. **Ngưỡng học viên đề xuất:** đạt khi `correct / total >= 0.8`, tương đương `ceil(80% × total)` câu đúng; 3 câu cần 3/3, 5 câu cần 4/5, 10 câu cần 8/10. Canvas chưa quy định ngưỡng, nhóm cần chốt. Đây không phải quality bar của AI.
7. Đạt → Đã ôn đạt, dừng nhắc, giữ lịch sử. Chưa đạt → xem ý sai/nguồn, chủ động ôn tiếp. Bộ mới giữ số câu và phạm vi của bộ đầu trong cùng phiên bản, ưu tiên hỏi khác về ý sai; chấm mỗi lượt riêng.
8. Câu hỏi/nguồn mới → tăng phiên bản, giữ kết quả cũ, trở lại Cần ôn. Không để phản hồi cũ ghi đè phiên bản mới.
9. Nhắc **đề xuất opt-in trong app**: hạn +1/+3 ngày từ lúc lưu/cập nhật; chưa đạt giữ hạn, sau +3 hiển thị quá hạn; đạt hoặc tắt nhắc thì dừng. Không cần model tính ngày.

Nguồn chưa ánh xạ được PDF thì mở transcript theo mã đoạn. Trong data, K4P1/D03 là DAY02; dùng cả course và bảng ánh xạ bài. Pack ở data/local/hackathon-context/data/vlearn-pack/, đã bị Git bỏ qua.

### §4b. HAX/PAIR và vị trí áp dụng dự kiến

| Nguyên tắc | Vị trí |
|---|---|
| G1: phạm vi | Đầu trang nói rõ ôn theo phần đã lưu, Tutor mô phỏng |
| G2: giới hạn | Quiz ghi luyện tập, không tính điểm khóa học; không gọi điểm là mức thành thạo |
| G10: thu hẹp | Thiếu nguồn → hỏi lại một câu/chọn nguồn |
| G11: giải thích | Kết quả mỗi câu có giải thích và nút mở nguồn |
| G9/G15: sửa/phản hồi | Báo câu sai, sửa câu hỏi/chọn nguồn, tạo lại và giữ feedback |
| PAIR: kiểm soát | Thoát quiz, tắt nhắc, không tự bắt đầu lượt tiếp theo |

Đây là tiêu chí triển khai; chưa khẳng định toàn bộ đã có trong mockup.

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

Thêm ca hệ thống: timeout 30 giây, JSON sai, citation không tồn tại, localStorage đầy, chuyển mục khi tạo. Giữ dữ liệu, dừng loading, cho thử lại; không fallback âm thầm sang quiz mẫu.

## §6. Bốn đường đi trải nghiệm

- **Happy:** lưu → mở nguồn → đủ ngữ cảnh → quiz 3–10 câu → nộp → kết quả/lịch sử/nhắc theo trạng thái.
- **Low-confidence:** mơ hồ → hỏi một câu làm rõ → bổ sung → kiểm tra lại.
- **Failure:** thiếu căn cứ hoặc API lỗi → lý do cụ thể → chọn nguồn/thử lại; không hiện bộ lỗi.
- **Correction:** người dùng báo câu AI sai → lưu feedback, vô hiệu bộ cũ, giữ lịch sử → chọn nguồn/tạo lại. Học viên làm sai quiz là nhánh luyện tập riêng.

Ngoài phạm vi và đặc thù domain xem §5; sơ đồ xem WORKFLOW.html.

## §7. Kiểm thử

**Golden set dự kiến:** 20 ca = 10 thường + 8 khó (hai ca/lớp) + 2 hiếm; ≥10 ca từ chatlog thật, có turn ID và mô tả biến đổi. Hai ca hiếm: chỉ dẫn giả trong nguồn; phản hồi cũ sau đổi phiên bản. Dũng xây và chạy bộ.

| Chiều | Một ca pass khi |
|---|---|
| Đúng quyết định | Tạo/hỏi lại/từ chối đúng hành vi mong đợi |
| Đúng và có căn cứ | Mọi câu, đáp án, giải thích được người chấm đối chiếu; không bịa nguồn |
| Cấu trúc/phạm vi | Đúng 3–10 câu theo `questionCount`, bốn lựa chọn và một đáp án/câu; không trùng; retry giữ số câu và phạm vi |

**Quality bar đề xuất, chưa khóa:** ≥18/20 ca pass; mọi ca thiếu/ngoài phạm vi xử lý đúng; không có đáp án sai hoặc nguồn bịa trong toàn bộ output của lượt đánh giá. Abstain đúng được tính pass. Chạy và ghi cả fail, không chỉ chọn output đẹp.

Hai người chấm độc lập năm output để làm rõ tiêu chí. Dũng ghi mọi kết quả/%, Huy sửa rồi chạy lại đủ bộ. Nhóm chốt bar và commit trước CP4, không đổi sau khi khóa vì kết quả thấp.

| Lượt | Số ca | Kết quả | Trạng thái |
|---|---|---|---|
| ~~AI lượt 1 cũ · DeepSeek Flash~~ | 20 | ~~14/20~~ | **Vô hiệu**: `source_ref` không có trong allowlist nên runner cũ không gọi model |
| AI lượt 1 · gpt-4o-mini · `decision-v1` | 26 | 19/26 (73,1%) | Chưa đạt bar. Lặp 3 lượt: 19 / 22 / 18. Lỗi chính: từ chối quá mức (3/3 lượt); trích dẫn chắp vá (dao động); thẩm quyền không ổn định. [eval/results_round1.md](eval/results_round1.md) |

Đã chạy node --check trên app.js, data.js, check.cjs và các server adapter. Chưa chạy lại Playwright trên máy này vì môi trường chưa cài dependency. Cú pháp pass không phải kết quả eval AI.

## §8. Phân công và kế hoạch

| Thành viên | Theo canvas nhóm | Đầu ra |
|---|---|---|
| Dũng | Evidence chatlog, ≥20 ca và đo | Phương pháp/bảng đếm/turn ID; golden set; kết quả từng lượt và phân tích fail |
| Huy | Prototype, AI đủ ngữ cảnh → quiz 3–10 câu, nhắc +1/+3 | Luồng end-to-end, API/trace, lỗi/abstain/retry, nhắc và persistence |
| Khuê | Canvas, khảo sát ≥20, spec, user test, feedback/changelog, slide/demo | Log khảo sát, impact/spec, validation, PDF sáu trang và video |

**Willing users ngoài nhóm đã đồng ý theo xác nhận của nhóm:** Nguyễn Ngọc Thái An, Hồ Hoàng Phương Anh, Đoàn Anh Quân. Chưa có log đã dùng thử. README BTC yêu cầu năm người khi làm R6 trong khi rubric/guide ghi hai: chuẩn bị thêm hai nếu theo README, đối chiếu TA; không tự tạo tên/kết quả.

Dũng/Huy chốt nguồn và contract → Huy nối AI/UI, Dũng làm eval song song → Khuê hoàn thiện khảo sát/spec → cả nhóm user test và dry run. Codex Pro FE/Senior AI hỗ trợ, không thay tên người chịu trách nhiệm.

| Mốc 3B | Hạn, giờ Việt Nam | Đầu ra |
|---|---|---|
| CP3 | 16:00 · 18/09/2026 | AI thật, video 30 giây, golden set/kết quả lượt đầu |
| CP4 | 21:00 · 18/09/2026 | Chốt spec/bar, khai phần thiếu |
| CP5 | 22:30 · 18/09/2026 | PDF sáu trang, video dự phòng, dry run |
| CP6 | 09:00 · 19/09/2026 | Thuyết trình |

Đây là lịch sự kiện, chưa xác nhận nhóm đã nộp mốc nào. README/rubric khác nhau về người nộp/thời lượng pitch; theo hướng dẫn TA hiện hành. Tên đầy đủ/mã học viên ba thành viên chưa được cung cấp.

Multi-prototype: chưa có so sánh thực nghiệm, không khai đã thử.

## §9. Changelog

| Mốc | Thay đổi | Căn cứ |
|---|---|---|
| Đọc repo BTC | Taxonomy, golden set, nguồn, checkpoint | HACKATHON_CONTEXT.md |
| Nhận canvas | Khảo sát 11/12, ba willing users, phân công thật | Canvas nhóm cung cấp |
| Tiếp tục spec | Quiz linh hoạt 3–10 câu; thay template bằng dự thảo có evidence và trạng thái thiếu | Canvas ưu tiên hơn đề xuất 3–5 câu trước |

**Còn thiếu trước khi gọi là bài nộp hoàn chỉnh:** log khảo sát/cỡ mẫu A hoặc mining B đầy đủ; impact đủ số; nghiên cứu tương tự; nguồn duyệt; AI thật/trace; golden set/số đo; validation; PDF/video; tên đầy đủ/mã học viên và xác nhận nộp. Không coi tài liệu thiết kế là kết quả đã thực hiện.
