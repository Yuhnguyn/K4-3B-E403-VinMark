# Dữ liệu cục bộ cho VinMark

Bộ dữ liệu VLearn hiện nằm trong bản clone repo BTC tại `data/local/hackathon-context/data/vlearn-pack/` trên máy này (đọc ngày 18/09/2026, commit `eccc0acb7cee6cbcbbe3ec2e3c24721c5a2050d3`).
Toàn bộ `data/local/` được `.gitignore` loại khỏi Git; khi clone repo nhóm sang máy khác phải lấy pack từ nguồn được BTC cấp. Đường dẫn tương đối bên dưới tính từ thư mục pack đó.

## File dùng cho CP3

- `chatlog/tutor_turns.csv`: đã đếm lại 13.494 lượt hỏi–đáp; lọc `cohort_hint == "K4"` được 3.097 lượt. Riêng `course_id == "K4P1"` có 2.146 lượt; không trộn với chương trình L2-L3 khi chọn bài. Đọc `chatlog/DATA_DICTIONARY.md` trước khi dùng.
- `transcript/`: 6 transcript có mã đoạn để dẫn nguồn, phù hợp lấy nội dung làm căn cứ cho quiz sau đối chiếu.
- `slides/`: 2 PDF Day 1 và Day 2 bản hackathon.

Chatlog dùng để tìm nhu cầu ôn và tạo ca kiểm thử. Slide/transcript dùng làm căn cứ kiểm chứng kiến thức; câu trả lời tutor không phải đáp án chuẩn mặc định. Mã bài `lecture_code` không duy nhất giữa các khóa, cần đi cùng `course_id`. Không tự coi số trang trích trong chatlog trùng số trang PDF hackathon: cần kiểm tra nội dung trước khi ánh xạ nguồn.

Chỉ sử dụng trong hackathon. Không đưa nguyên pack lên repo công khai, không đặt dữ liệu vào thư mục mockup được phát hành. Golden set công khai ưu tiên dẫn `turn_id` hoặc mã đoạn; chỉ trích ngắn khi cần. Khi gọi dịch vụ AI ngoài, chỉ gửi phần tối thiểu cần thiết. Quy tắc đầy đủ nằm trong README của pack.

Bản sao slide Day 1/Day 2 được mockup đọc qua các endpoint local `/api/vlearn-slides` và `/api/vlearn-pdf`; PDF được hiển thị trong viewer khi chạy bằng `node server/server.js`, còn JSON cung cấp text cho chat/quiz. Dữ liệu này chưa được gửi đến API AI.

Kết quả đọc và giới hạn dữ liệu: [HACKATHON_CONTEXT.md](../HACKATHON_CONTEXT.md).
