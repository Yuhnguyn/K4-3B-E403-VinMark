# Dữ liệu cục bộ cho VinMark

Bộ dữ liệu VLearn đã được chép vào `data/local/vlearn-pack/` trên máy này.
Toàn bộ `data/local/` được `.gitignore` loại khỏi Git; khi clone repo sang máy khác phải lấy pack từ nguồn được BTC cấp và đặt vào cùng đường dẫn.

## File dùng cho CP3

- `local/vlearn-pack/chatlog/tutor_turns.csv`: 13.494 lượt hỏi–đáp; lọc `cohort_hint == "K4"` để lấy 3.097 lượt của khóa hiện tại. Đọc `chatlog/DATA_DICTIONARY.md` trước khi dùng.
- `local/vlearn-pack/transcript/`: 6 transcript có mã đoạn để dẫn nguồn, phù hợp lấy nội dung làm căn cứ cho quiz.
- `local/vlearn-pack/slides/`: 2 PDF Day 1 và Day 2 bản hackathon.

Chatlog dùng để tìm nhu cầu ôn và tạo ca kiểm thử. Slide/transcript dùng làm căn cứ kiểm chứng kiến thức; câu trả lời tutor không phải đáp án chuẩn mặc định. Mã bài `lecture_code` không duy nhất giữa các khóa, cần đi cùng `course_id`. Không tự coi số trang trích trong chatlog trùng số trang PDF hackathon: cần kiểm tra nội dung trước khi ánh xạ nguồn.

Chỉ sử dụng trong hackathon. Không đưa nguyên pack lên repo công khai, không đặt dữ liệu vào thư mục mockup được phát hành. Golden set công khai ưu tiên dẫn `turn_id` hoặc mã đoạn; chỉ trích ngắn khi cần. Khi gọi dịch vụ AI ngoài, chỉ gửi phần tối thiểu cần thiết. Quy tắc đầy đủ nằm trong README của pack.

Bản sao này chưa được tích hợp vào mockup hay gửi đến API AI; đây là bước chuẩn bị dữ liệu cục bộ cho CP3.
