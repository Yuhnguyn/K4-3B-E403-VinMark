## Track A/D — tính năng mới
1. **Track + đề:** A · VinMark — biến chỗ chưa hiểu thành quiz ôn tập.
2. **Job executor:** Học viên đang học lý thuyết trên VLearn, vừa hỏi AI tutor về một đoạn trong slide chưa hiểu.
3. **Pain:** Sau khi hỏi xong, học viên không tìm lại được câu mình đã hỏi để ôn; phải mò lại từng đoạn chat gắn với từng slide hoặc chụp màn hình vào note riêng rồi không bao giờ mở lại, nên đến lúc làm lab vẫn hổng đúng chỗ cũ.
4. **Bằng chứng đầu:**
   - Khảo sát `12` học viên: `11/12` người khó tìm lại kiến thức khó hiểu trên VLearn.
5. **Lát cắt:** Học viên vừa hỏi tutor về hoặc đánh dấu một slide · cần ôn lại đúng chỗ đó vài ngày sau · AI **quyết định slide này có đủ ngữ cảnh để sinh quiz hay không** · kết quả là 3 câu trắc nghiệm kèm giải thích, nằm trong kho ôn tập và được nhắc lại sau 1 và 3 ngày.
6. **AI tự làm đến đâu:** AI tổng hợp những câu học viên đã hỏi và đã đánh dấu để tạo quiz và nhắc học viên ôn tập. **Willing users (ngoài nhóm, đã hỏi và đồng ý):** `Nguyễn Ngọc Thái An`, `Hồ Hoàng Phương Anh`, `Đoàn Anh Quân`.
7. **Phân công:** `Dũng` — tìm bằng chứng từ chatlog VLearn (bảng đếm, mã lượt), bộ câu thử ≥20 case, chạy đo · `Huy` — dựng prototype, lời gọi AI thật (quyết định slide có đủ ngữ cảnh không, sinh 3 câu quiz kèm giải thích), nhắc ôn sau 1 và 3 ngày · `Khuê` — canvas, khảo sát ≥20 người, spec (lát cắt, mức tự động, kịch bản rủi ro), user test, feedback log, changelog, slide và demo.

