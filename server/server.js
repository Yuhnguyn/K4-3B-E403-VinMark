'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { URL } = require('node:url');
const { MIN_QUESTIONS, MAX_QUESTIONS, validateQuizResponse } = require('./quiz-contract');
const { callModel } = require('./model');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC_ROOT = path.join(ROOT, 'mockup');
const SOURCES = JSON.parse(fs.readFileSync(path.join(__dirname, 'sources.json'), 'utf8'));
const PORT = Number(process.env.PORT || 3000);
const MIME = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml'
};

function json(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(JSON.stringify(body));
}

function errorResponse(code, message, retryable = false) {
  return { status: 'error', code, message, retryable };
}

function sourceFor(ref) {
  const sourceId = typeof ref === 'string' ? ref : ref?.sourceId;
  return SOURCES.find(source => source.sourceId === sourceId) || null;
}

function chooseQuestionCount(source, previousAttempt) {
  if (Number.isInteger(previousAttempt?.questionCount)) return previousAttempt.questionCount;
  return Math.min(MAX_QUESTIONS, Math.max(MIN_QUESTIONS, Math.ceil(source.statements.length / 2)));
}

function buildQuiz(request, source) {
  const count = chooseQuestionCount(source, request.previousAttempt);
  if (count < MIN_QUESTIONS || count > MAX_QUESTIONS || source.statements.length < count) {
    return {
      status: 'needs_context',
      itemId: request.itemId,
      revision: request.revision,
      reason: `Nguồn chỉ có ${source.statements.length} ý đủ căn cứ, không đủ cho ${count} câu khác nhau.`,
      nextAction: 'Chọn thêm nguồn hoặc bổ sung ngữ cảnh.'
    };
  }

  const wrongConcepts = new Set(request.previousAttempt?.wrongConcepts || []);
  const statements = source.statements.slice().sort((a, b) => Number(wrongConcepts.has(b.concept)) - Number(wrongConcepts.has(a.concept)));
  const questions = statements.slice(0, count).map((statement, index) => ({
    id: `${source.sourceId}-${request.revision}-${index + 1}`,
    concept: statement.concept,
    prompt: `Ý nào đúng về ${statement.concept} theo nguồn?`,
    options: [statement.fact, ...statement.distractors],
    correctIndex: 0,
    explanation: statement.fact,
    sourceId: source.sourceId,
    evidenceQuote: statement.fact
  }));
  return {
    status: 'ready',
    itemId: request.itemId,
    revision: request.revision,
    sourceVersion: source.sourceVersion,
    quizId: `${request.itemId}-r${request.revision}-${Date.now()}`,
    questionCount: count,
    coverageTags: questions.map(question => question.concept),
    summary: source.statements.slice(0, Math.min(3, count)).map(statement => ({ text: statement.fact, sourceId: source.sourceId })),
    questions,
    generationMode: 'curated-demo'
  };
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1024 * 1024) reject(new Error('request too large'));
    });
    req.on('end', () => {
      try { resolve(JSON.parse(body || '{}')); } catch { const error = new Error('invalid json'); error.code = 'invalid_json'; reject(error); }
    });
    req.on('error', reject);
  });
}

function serveStatic(req, res) {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const file = path.resolve(PUBLIC_ROOT, relative);
  if (!file.startsWith(PUBLIC_ROOT + path.sep)) return json(res, 403, { error: 'forbidden' });
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return json(res, 404, { error: 'not found' });
  res.writeHead(200, { 'content-type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}

function saveTrace(trace) {
  const directory = process.env.VINMARK_TRACE_DIR;
  if (!directory) return;
  fs.mkdirSync(directory, { recursive: true });
  const filename = `trace-${Date.now()}-${trace.itemId}.json`;
  fs.writeFileSync(path.join(directory, filename), JSON.stringify(trace, null, 2));
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (req.method === 'GET' && url.pathname === '/api/health') return json(res, 200, { ok: true, mode: 'curated-demo' });
  if (req.method === 'GET' && url.pathname === '/api/sources') {
    return json(res, 200, SOURCES.map(({ text, statements, ...source }) => source));
  }
  if (req.method === 'POST' && url.pathname === '/api/quiz') {
    try {
      const request = await parseJsonBody(req);
      if (!request.itemId || !Number.isInteger(request.revision)) return json(res, 400, errorResponse('invalid_request', 'itemId và revision là bắt buộc.'));
      const source = sourceFor(request.sourceRef);
      if (!source) return json(res, 200, { status: 'needs_context', itemId: request.itemId, revision: request.revision, reason: 'Không tìm thấy nguồn đã được duyệt.', nextAction: 'Chọn một nguồn trong danh sách cho phép.' });
      let response;
      const provider = (process.env.LLM_PROVIDER || 'gemini').toLowerCase();
      const hasKey = provider === 'nim' ? process.env.NVIDIA_NIM_API_KEY : provider === 'deepseek' ? process.env.DEEPSEEK_API_KEY : process.env.GEMINI_API_KEY;
      if (hasKey) {
        const result = await callModel(request, source);
        response = result.response;
        saveTrace(result.trace);
      } else if (process.env.VINMARK_DEMO_MODE === 'true') {
        response = buildQuiz(request, source);
      } else {
        return json(res, 503, errorResponse('missing_api_key', 'GEMINI_API_KEY chưa được cấu hình; không dùng fixture fallback.', false));
      }
      if (response.status === 'ready') {
        const checked = validateQuizResponse(response, [source]);
        if (!checked.ok) return json(res, 502, errorResponse('invalid_generated_quiz', checked.errors.join('; '), true));
      }
      return json(res, 200, response);
    } catch (error) {
      const code = error.code || 'gemini_error';
      const status = code === 'invalid_json' ? 400 : code === 'missing_api_key' ? 503 : 502;
      return json(res, status, errorResponse(code, error.message, code !== 'missing_api_key'));
    }
  }
  if (req.method !== 'GET') return json(res, 405, { error: 'method not allowed' });
  return serveStatic(req, res);
});

if (require.main === module) {
  server.listen(PORT, '127.0.0.1', () => console.log(`VinMark server listening at http://127.0.0.1:${PORT}`));
}

module.exports = { buildQuiz, chooseQuestionCount, sourceFor, server };
