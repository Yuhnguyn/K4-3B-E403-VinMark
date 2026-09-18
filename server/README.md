# VinMark server

Run from the project root with a real model key in the environment. Gemini is the default:

```bash
GEMINI_API_KEY=your_key_here node server/server.js
```

PowerShell:

```powershell
$env:GEMINI_API_KEY = "your_key_here"
node server/server.js
```

For NVIDIA NIM:

```powershell
$env:LLM_PROVIDER = "nim"
$env:NVIDIA_NIM_API_KEY = "your_nim_key_here"
$env:NVIDIA_NIM_MODEL = "openai/gpt-oss-20b"
node server/server.js
```

Open `http://127.0.0.1:3000/` to use the mockup through the local API.

For an explicitly labelled local fixture only:

```powershell
$env:VINMARK_DEMO_MODE = "true"
node server/server.js
```

Endpoints:

- `GET /api/health` checks that the server is running.
- `GET /api/sources` lists curated source metadata without source text.
- `POST /api/quiz` calls the selected provider, validates the returned 3–10 question quiz, and returns `needs_context` when the source is insufficient.

Set `VINMARK_TRACE_DIR=eval/traces` to save prompt, model output, source version, and latency for each real call. The trace never stores the API key.

Without the selected provider key, the server refuses `/api/quiz` unless `VINMARK_DEMO_MODE=true`; it never silently falls back to fixture data.

For the current DeepSeek V4.1 Flash service, use `DEEPSEEK_MODEL=deepseek-flash`. The legacy `deepseek-v4-flash` name is retired but may be accepted as an alias by DeepSeek.
