# Template AI Spec *(spec.md — commit trước hạn chốt spec: 21:00 18/9, tại CP4 · quality bar chốt từ thời điểm nộp)*

> Cấu trúc phủ đúng "SPEC 8 phần" của chương trình: Bằng chứng (§1-§2) · Lát cắt (§4) · Canvas (đính kèm CP1) · Augment/Automate (§4) · 4 đường đi của trải nghiệm (§6) · Kiểu lỗi (§5) · Kiểm thử (§7) · Phân công (§8). Hướng dẫn viết từng mục: `02-guide.md`.

```markdown
# AI SPEC — [Tên lát cắt] · Nhóm [XX] · Zone [X]
Hướng: [x] A — VLearn  [ ] B — Trợ lý Học viên  [ ] C — Làn mở
Loại: [ ] Tối ưu tính năng có sẵn  [x] Tính năng mới

## §1. User & Job
- Job executor + workflow (đính kèm worksheet JTBD / ảnh sơ đồ):
- Core JTBD (không tên sản phẩm/AI trong câu):
- Problem statement (KHÔNG chữ AI):
- Evidence (chuẩn A và/hoặc B — log đầy đủ trong repo):
  - Số liệu mining / kết quả khảo sát (n = ?, % xác nhận):
  - ≥5 quote/ví dụ nguyên văn + nguồn:

## §2. Impact & quyết định chọn
- Bảng impact ≥3 ứng viên (bao nhiêu người · tần suất · tốn gì mỗi lần · khả thi):
- Ứng viên ĐÃ LOẠI + vì sao:
- Ứng viên CHỌN + vì sao (bằng số):

## §3. Giải pháp tương tự đã nghiên cứu
- [Sản phẩm 1]: flow / đáng học / đáng né / mình khác gì
- [Sản phẩm 2]: ...

## §4. Thiết kế
- Lát cắt MỘT CÂU: Một học viên VLearn · ôn lại kiến thức khó hiểu trong bài vừa học · AI tổng hợp bài học, câu hỏi và điểm yếu của học viên, tạo quiz ôn tập khi đoạn đó có đủ ngữ cảnh · học viên ôn bài và làm quiz.
- Non-goals (≥3 thứ KHÔNG build):
    - Không build một hệ thống tự động sinh quiz cho toàn bộ khoá học hoặc cả course bằng cách scan toàn bộ VLearn mà không có ngữ cảnh học viên.
    - Không build chức năng lưu trữ toàn bộ lịch sử chat như “notebook cá nhân” để thả hết mọi câu hỏi/đáp vào một kho, mà không phân loại theo slide hay bài học.
    - Không build tính năng chốt điểm/đánh giá học viên theo tự động hoá hoàn toàn; mục tiêu là hỗ trợ ôn tập chứ không thay thế giảng viên hoặc đánh giá chính thức.
    - Không build một bot “nhắc nhở liên tục” mà không có sự đồng ý của người học; nhắc lại chỉ xảy ra khi học viên đã xác nhận nội dung cần ôn hoặc đã đánh dấu slide/chỗ chưa hiểu.
- Mức prototype nhắm tới: [x] Sketch [ ] Mock [ ] Working — phần nào mock, phần nào thật:
  - Sketch workflow: toàn bộ trải nghiệm người dùng được mô phỏng dạng sơ đồ luồng, từ “học viên gặp chỗ chưa hiểu” → “AI kiểm tra ngữ cảnh” → “sinh quiz/nói rõ khi thiếu căn cứ” → “nhắc ôn lại sau 1/3 ngày”.
  - Sketch: giao diện và các nhánh quyết định được vẽ ở mức concept, không phải mock UI hoàn chỉnh hay product flow chạy thật.
  - Thật: dữ liệu mining, pain point và các ví dụ người dùng từ khảo sát/log thực tế được dùng để làm căn cứ thiết kế, nhưng chưa có AI thật được tích hợp chạy trong sản phẩm này.
- Automation: [ ] augment [x] conditional [ ] automate — lý do theo cost-of-error:
  - Chọn “conditional” vì AI chỉ làm việc khi có đủ ngữ cảnh và mức tự tin cao; nếu thiếu thông tin, AI không sinh quiz mà yêu cầu người dùng bổ sung hoặc chuyển sang gợi ý khác.
  - Cost-of-error ở đây là trung bình–cao: nếu AI sinh quiz sai do không đủ ngữ cảnh, học viên sẽ ôn sai chỗ và tăng hiểu nhầm, làm mất niềm tin. Do đó, hệ thống phải có “abstain” rõ ràng: không tạo quiz khi thiếu căn cứ, thay vì “đẩy” quiz sai.
  - Tỷ lệ sai có thể gây phản tác dụng lớn hơn lợi ích của tự động hóa hoàn toàn, nên cần kiểm soát ở mức điều kiện.
- §4b. Nguyên tắc đã áp dụng (≥4 — HAX/PAIR, xem guide):
  | Nguyên tắc | Áp cụ thể vào đâu trong prototype |
  |---|---|
  | G1 — Làm rõ hệ thống làm được gì | Câu chào đầu của tutor/AI phải xác định rõ phạm vi: “Mình chỉ hỗ trợ ôn tập theo slide/đoạn bạn đã học, không giải quyết toàn bộ tài liệu/course.” (trong bước khởi động flow) |
  | G2 — Làm rõ nó làm tốt đến đâu | Giao diện quiz hiển thị nhãn “Dựa trên slide/chỗ bạn đánh dấu” và “được sinh khi có đủ ngữ cảnh”; từ đó học viên biết khi nào nên tin và khi nào nên kiểm lại |
  | G10 — Thu hẹp phạm vi khi nghi ngờ | Nếu học viên hỏi mơ hồ hoặc slide không đủ ngữ cảnh, AI không tạo quiz ngay; nó hỏi lại 1 câu ngắn hoặc yêu cầu chọn slide/đoạn cụ thể |
  | G11 — Giải thích vì sao | Mỗi quiz có câu giải thích ngắn: “Câu này gắn với khái niệm X ở slide Y”; output cho thấy căn cứ để học viên kiểm chứng |
  | G9 — Sửa dễ dàng | Người dùng có nút sửa câu hỏi, tạo lại quiz, hoặc bỏ qua quiz; không cần bắt đầu lại từ đầu |
  | G15 — Mời feedback ngay trong flow | Sau khi xem quiz, học viên có thể đánh giá “quiz đúng chỗ / sai chỗ / cần thay đổi”; đây là nhánh feedback để cải thiện prompt và lọc lỗi |
  | PAIR — Explainability + Trust | Không trả lời kiểu “AI biết rồi”; luôn gắn output với slide/chỗ được đánh dấu, giúp học viên tự kiểm và tin đúng mức |
  | PAIR — Feedback + Control | Người dùng có quyền bỏ qua, chỉnh sửa, xóa quiz, tắt nhắc lại; so với AI tự động hóa hoàn toàn, đây là mức kiểm soát phù hợp cho prototype |
  | PAIR — Errors + Graceful Failure | Khi thiếu ngữ cảnh hoặc ngoài phạm vi, AI không lạc hướng; nó dừng ở mức cảnh báo + yêu cầu thêm thông tin, thay vì trả lời liều lĩnh |

## §5. Kiểu lỗi — 4 lớp chỗ khó + kịch bản (≥8) [bảng theo guide §2.5]

## §6. Bốn đường đi của trải nghiệm
- Happy path: Học viên hỏi tutor hoặc đánh dấu một điểm chưa hiểu trên slide; AI kiểm tra xem đoạn này có đủ ngữ cảnh để sinh quiz hay không; nếu đủ, tạo ra 3 câu trắc nghiệm kèm giải thích ngắn và lưu vào kho ôn tập; hệ thống tự nhắc lại sau 1 ngày và 3 ngày; học viên ôn lại và cảm thấy “đã tìm lại đúng chỗ hổng” mà không phải mò chat hay chụp ảnh.
- Low-confidence (②): Học viên hỏi một câu mơ hồ hoặc slide không đủ ngữ cảnh để AI suy đoán đúng; AI không tạo quiz ngay mà gợi ý: “Bạn có thể nhấn vào slide/đoạn cụ thể hoặc mô tả thêm điểm chưa hiểu”; hệ thống giữ lại câu hỏi để chờ đủ thông tin hơn. Tại đây, AI ưu tiên an toàn và tránh tạo quiz sai.
- Failure/không căn cứ (①): Học viên hỏi về nội dung không nằm trong slide hoặc không có đủ dữ liệu nền để xác định được “điểm cần ôn”; AI không suy diễn từ các giả thuyết lung tung, mà từ chối tạo quiz và yêu cầu người dùng cung cấp ngữ cảnh rõ hơn hoặc chọn slide cụ thể. Mục tiêu là không tạo “đề ôn nhầm chỗ”.
- Correction (user sửa): Học viên xem quiz và nhận ra một câu hỏi không chính xác, không phù hợp với slide, hoặc khó hiểu; người dùng có thể sửa câu hỏi, gắn lại nội dung slide, xóa quiz, hoặc chọn “tạo lại đề mới”; hệ thống cập nhật lại kho ôn tập mà không mất ngữ cảnh gốc.
- Khi bị đòi ngoài phạm vi (③): Nếu học viên hỏi về các chủ đề nằm ngoài phạm vi của lesson hoặc yêu cầu AI giải thích tổng thể cả khóa học, AI không cố gắng “bật chế độ tổng quát” mà sẽ xác nhận phạm vi: “Mình chỉ hỗ trợ ôn tập theo slide/đoạn bạn đã học”; nếu cần, hệ thống chuyển người dùng đến tài liệu/course chính thức hoặc gợi ý nơi liên hệ.
- Case đặc thù domain (④): Với slide có đồ thị, sơ đồ, định nghĩa ngắn, hoặc mô tả logic khó, AI chỉ sinh quiz khi đoạn đó đủ rõ để tách thành câu hỏi đúng; nếu slide quá dạng hình/không có văn bản mô tả đủ, AI sẽ yêu cầu học viên chọn vùng cụ thể hoặc nhấn vào đoạn cần ôn để tránh quiz sai ngữ cảnh. Đây là trường hợp đặc thù của nội dung domain học thuật, nơi AI phải “đúng chỗ” hơn là “sinh nhiều câu”.

## §7. Kiểm thử
- Chiều chất lượng + định nghĩa kiểm chứng được:
- Golden set (≥20 case theo cơ cấu trong guide §2.6, file trong eval/):
- Quality bar (chốt từ hạn chốt spec của khoá, giữ nguyên sau đó): "Đạt khi ≥ ___% qua bộ, và ___"
- Kết quả các lượt chạy (bảng % — cập nhật đến trước CP6):

## §8. Phân công & kế hoạch
- Phân công có tên: spec / evidence / prompt / code / demo
- Willing users (≥2 tên) + kế hoạch vòng validation *(bonus, nếu làm)*:
- Multi-prototype (nếu làm): trục khác biệt của ≥2 phương án + lý do chọn:

## §9. Changelog
| Thời điểm | Đổi gì | Vì sao (trỏ về feedback/case nào) |
```