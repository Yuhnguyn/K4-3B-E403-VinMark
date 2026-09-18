<<<<<<< HEAD
# 📌 VinMark

> **Biến những chỗ chưa hiểu thành quiz ôn tập — đúng lúc, đúng chỗ.**

**Track:** A · Tính năng mới cho VLearn &nbsp;|&nbsp; **Nhóm:** K4-3B-E403

---

## 🎯 Bài toán

### Ai gặp vấn đề?
Học viên đang học lý thuyết trên **VLearn** vừa hỏi **AI tutor** về một đoạn trong slide mà mình chưa hiểu.

### Vấn đề là gì?
Hỏi xong thì học viên **không tìm lại được câu mình đã hỏi** để ôn lại:

- 🔍 Phải lục lại từng đoạn chat gắn với từng slide
- 📸 Hoặc chụp màn hình lưu vào note riêng, rồi không bao giờ mở lại
- 🧪 Đến lúc làm lab vẫn **hổng đúng chỗ cũ**

### Bằng chứng ban đầu

| Khảo sát | Kết quả |
|---|---|
| 12 học viên | **11/12** thấy khó tìm lại những phần kiến thức khó hiểu trên VLearn |

---

## 💡 Giải pháp

VinMark lấy những câu học viên **đã hỏi tutor** hoặc những slide họ **đã đánh dấu**, rồi biến chúng thành quiz ôn tập được nhắc lại theo lịch.

```mermaid
flowchart LR
    A[Học viên hỏi tutor<br/>hoặc đánh dấu slide] --> B{AI: slide có đủ<br/>ngữ cảnh để sinh quiz?}
    B -- Có --> C[Sinh 3 câu trắc nghiệm<br/>kèm giải thích]
    B -- Không --> D[Không tạo quiz]
    C --> E[Lưu vào kho ôn tập]
    E --> F[🔔 Nhắc ôn sau 1 ngày]
    F --> G[🔔 Nhắc ôn sau 3 ngày]
```

### Phạm vi của bản thử

| | |
|---|---|
| **Khi nào dùng** | Học viên vừa hỏi tutor hoặc vừa đánh dấu một slide |
| **Nhu cầu** | Vài ngày sau cần ôn lại đúng chỗ đó |
| **AI quyết định** | Slide này có **đủ ngữ cảnh** để sinh quiz hay không |
| **Kết quả** | **3 câu trắc nghiệm** kèm giải thích, lưu trong kho ôn tập, nhắc lại sau **1** và **3 ngày** |

### AI làm được đến đâu
AI tổng hợp các câu học viên đã hỏi và các slide đã đánh dấu, **tự tạo quiz** và **nhắc học viên ôn tập**.

---

## 👥 Người dùng thử

Những người dùng ngoài nhóm đã được hỏi và đồng ý dùng thử:

- Nguyễn Ngọc Thái An
- Hồ Hoàng Phương Anh
- Đoàn Anh Quân

---

## 🛠️ Phân công

| Thành viên | Phụ trách |
|---|---|
| **Dũng** | Tìm bằng chứng từ chatlog VLearn (bảng đếm, mã lượt) · soạn bộ câu thử **≥ 20 case** · chạy đo |
| **Huy** | Dựng prototype · gọi AI thật (quyết định slide có đủ ngữ cảnh không, sinh 3 câu quiz kèm giải thích) · nhắc ôn sau 1 và 3 ngày |
| **Khuê** | Canvas · khảo sát **≥ 20 người** · spec (phạm vi, mức tự động, kịch bản rủi ro) · user test · feedback log · changelog · slide và demo |

---

## 📂 Tài liệu

- [canvas.md](canvas.md) — Canvas đề tài
=======
# VinMark

VinMark giúp học viên lưu lại chỗ chưa hiểu, mở đúng nguồn và ôn bằng quiz có citation.

## Chạy nhanh

Từ thư mục gốc:

```powershell
$env:LLM_PROVIDER = "deepseek"
$env:DEEPSEEK_API_KEY = "your_key_here"
$env:DEEPSEEK_MODEL = "deepseek-flash"
node server/server.js
```

Mở `http://127.0.0.1:3000/`.

Provider được hỗ trợ:

| Provider | Biến môi trường chính | Model mặc định |
|---|---|---|
| DeepSeek | `DEEPSEEK_API_KEY` | `deepseek-flash` |
| NVIDIA NIM | `NVIDIA_NIM_API_KEY` | tự chọn model khả dụng |
| Gemini | `GEMINI_API_KEY` | `gemini-3.6-flash` |

Chọn provider bằng `LLM_PROVIDER=deepseek`, `nim` hoặc `gemini`.

Không có API key, chỉ chạy fixture demo khi bật rõ:

```powershell
$env:VINMARK_DEMO_MODE = "true"
node server/server.js
```

## Kiểm thử

```powershell
node server/quiz-contract.test.js
node server/gemini.test.js
node server/nim.test.js
node server/deepseek.test.js
node eval/run-round1.cjs
```

Eval gồm 20 case: 10 thường, 8 khó và 2 hiếm. Kết quả/trace nằm trong `eval/`. Lượt hiện tại đạt `14/20`; đây là kết quả thật, chưa đạt quality bar đề xuất `18/20`.

## Cấu trúc

- `mockup/`: giao diện HTML/CSS/JS và browser smoke test
- `server/`: API, provider adapters, source allowlist và validators
- `eval/`: golden set, runner, kết quả và trace
- `spec.md`: product spec và trạng thái triển khai
- `SHOWCASE_SPEC.md`: contract showcase và acceptance criteria
- `CANVAS.md`: canvas nhóm
- `WORKFLOW.html`: sơ đồ workflow

## Phạm vi hiện tại

- Quiz AI chọn 3–10 câu, mỗi câu có 4 lựa chọn, đáp án, giải thích và nguồn.
- Nguồn hiện là manifest cục bộ đã curate; dữ liệu course chưa tích hợp trực tiếp vào VLearn.
- Tutor, đăng nhập, đồng bộ, email/push và chấm điểm chính thức chưa nằm trong phạm vi.
- Không commit API key hoặc data pack vào repository.

## Team

Tên đầy đủ và mã học viên thành viên chưa được cung cấp trong repo.
>>>>>>> 133970b04ee29c31a6864a4494414b20913542cb
