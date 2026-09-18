# codebase/ — module quyết định trung tâm của VinMark

**Quyết định AI:** với một mục ôn (yêu cầu của học viên + trang slide đã lưu), nguồn có đủ căn cứ để tạo quiz không?

| Trạng thái | Khi nào | Kết quả |
|---|---|---|
| `ready` | Trong môn học, nguồn có ≥3 ý liên quan | 3–10 câu trắc nghiệm, mỗi câu cite trang + trích nguyên văn |
| `needs_context` | Yêu cầu không có nội dung, "vùng khoanh" không rõ vùng nào, nguồn mỏng, kiến thức không có trên trang, hoặc lệch bài | Lý do + một câu hỏi làm rõ |
| `out_of_scope` | Ngoài môn AI, hoặc vượt thẩm quyền (đáp án quiz/bài tính điểm, làm hộ lab, system prompt) | Lý do + VinMark hỗ trợ được gì |

| File | Vai trò |
|---|---|
| [decision.js](decision.js) | `decideQuiz()`: prompt (`PROMPT_VERSION`), gọi model, parse, `validateDecision()` (hợp đồng + trích dẫn đúng trang), ghi vết |
| [sources.js](sources.js) | `resolveSource("d1:15" \| "d2:18-19" \| id đã duyệt)`: text theo trang; trang không tồn tại → `needs_context` do code quyết định, không gọi model |
| [llm.js](llm.js) | Gọi model thật (`LLM_PROVIDER` = `deepseek` \| `nim` \| `gemini`; OpenAI dùng adapter `deepseek` với `DEEPSEEK_BASE_URL=https://api.openai.com/v1`) |
| [trace-log.js](trace-log.js) | Ghi vết JSONL |
| [build-slides.cjs](build-slides.cjs) | Tạo lại `mockup/slides/` (ảnh + text) từ PDF trong data pack |

Server ([server/server.js](../server/server.js) `/api/quiz`) và eval ([eval/run-eval.cjs](../eval/run-eval.cjs)) đều gọi cùng `decideQuiz()`, nên kết quả eval đo đúng code mà app chạy.

## Ghi vết

Mỗi lần gọi ghi một dòng vào `logs/decisions-YYYY-MM-DD.jsonl` (đổi thư mục bằng `VINMARK_LOG_DIR`, tắt bằng `VINMARK_LOG=off`):

```json
{ "traceId": "tr_…", "loggedAt": "…", "kind": "quiz_decision" | "tutor", "promptVersion": "decision-v1",
  "itemId": "…", "sourceRef": "d1:15", "learnerQuestions": ["…"], "decidedBy": "model" | "code",
  "provider": "deepseek", "model": "gpt-4o-mini", "latencyMs": 3800,
  "prompt": { "system": "…", "user": "…" },   // đúng chuỗi đã gửi
  "rawResponse": "…",                           // text thô model trả về, chưa parse
  "validation": { "ok": false, "errors": ["questions[1].evidenceQuote not found in source"] },
  "response": { "status": "ready", … }, "error": { "code": "llm_timeout", … } }
```

`logs/` bị git bỏ qua vì chứa câu hỏi học viên và nội dung khóa học. Server in `traceId` cho mỗi quyết định ra terminal để tra lại.

## Chạy

```powershell
Get-Content -Raw .\bash.sh | Invoke-Expression   # nạp LLM_PROVIDER + key
node eval/run-eval.cjs --check                    # kiểm tra golden set, không gọi model
node eval/run-eval.cjs round1                     # chạy 26 case với model thật
node server/server.js                             # app dùng cùng module
```
