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
