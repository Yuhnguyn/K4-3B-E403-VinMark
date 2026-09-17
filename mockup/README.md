# VinMark — mockup CP2

Mở `index.html` bằng trình duyệt. Không cần build, dependency hoặc API key.

## Luồng demo

1. **Khóa học** → mở/thu gọn khóa → chọn một buổi → chọn tài liệu.
2. Dùng ảnh thu nhỏ, mũi tên hoặc nhập số trang để chuyển slide; có thu/phóng, ẩn mục lục, chế độ tập trung và ghi chú.
3. **Đặt câu hỏi với AI** mở chat mẫu bên cạnh slide. Gửi câu hỏi sẽ lưu câu hỏi, nội dung nguồn và tham chiếu buổi/tài liệu/trang vào Luyện tập.
4. Nút bookmark lưu slide; nút bút đánh dấu và lưu. Bấm lưu cùng slide hai lần không tạo hai mục đánh dấu.
5. **Luyện tập** → tìm mục → **Mở slide nguồn** mở đúng buổi/tài liệu/trang. Nút quay lại đưa về đúng mục ôn.
6. **Làm quiz** → Agent mô phỏng chuẩn bị bộ câu hỏi → xem số câu đã chọn → làm bài → nộp → xem giải thích và nguồn.

## Phạm vi mô phỏng

- Giao diện tái hiện theo ảnh tham chiếu; slide là nội dung dựng cho demo, không phải bản sao toàn bộ tài liệu VLearn.
- Buổi 1 có slide lịch sử AI dựng bằng SVG, attention và dự đoán token. Buổi 2 có problem statement/tự động hóa. Buổi 3 có RAG/prompt. Các buổi còn lại có tài liệu minh họa cơ bản.
- Mã nguồn tham chiếu gồm course/lesson/material/page. Không chỉ mở một slide chung cho mọi mục.
- Chat phản hồi bằng phần nhắc lại nội dung slide và ghi rõ chưa kết nối AI thật.
- `mockAgentPlan()` trả về danh sách câu hỏi có độ dài thay đổi, lý do chọn và ngưỡng đạt; UI không khóa số câu. CP3 có thể thay adapter bằng API thực.
- Dữ liệu hiện có bài 3, 4, 5 câu. Đây là ví dụ trong fixture, không phải giới hạn sản phẩm. Lần làm lại dùng cùng ngân hàng câu, đổi thứ tự; chưa sinh câu mới.
- Ngưỡng 80% là quy tắc demo đã có, không do Agent tự đổi sau khi biết kết quả. Kết quả được lưu ngay khi nộp.
- Lịch nhắc +1/+3 chỉ hiển thị minh họa; không gửi thông báo. Gửi yêu cầu hỗ trợ chỉ lưu trong ghi chú, không gửi bên ngoài.
- LocalStorage lưu tiến độ, ghi chú, câu hỏi và dấu trang. Footer có **Đặt lại demo** và xác nhận trước khi xóa dữ liệu demo.

## Kiểm thử đã chạy

Chrome headless: mở slide nguồn chính xác và quay lại; chuyển buổi/tài liệu; ảnh thu nhỏ; trước/sau; zoom; chat/lưu vào kho; không lưu trùng bookmark; tìm kiếm; quiz nhiều độ dài; đạt/chưa đạt và lưu qua tải lại; thiếu nguồn; desktop/mobile không tràn ngang; không có lỗi JavaScript khi đi qua các luồng.

`check.cjs` là kịch bản kiểm thử trong môi trường phát triển hiện tại (đường dẫn Playwright/Chrome cục bộ). Không cần chạy file này để mở mockup.
