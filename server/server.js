'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { URL } = require('node:url');
const { MIN_QUESTIONS, MAX_QUESTIONS } = require('./quiz-contract');
const { decideQuiz } = require('../codebase/decision');
const { keyEnvFor } = require('../codebase/llm');
const { callTutor, validateTutorRequest } = require('./tutor');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC_ROOT = path.join(ROOT, 'mockup');
const SOURCES = JSON.parse(fs.readFileSync(path.join(__dirname, 'sources.json'), 'utf8'));
const VLEARN_SLIDE_FILES = {
  1: path.join(ROOT, 'data', 'd1-slide-hackathon.json'),
  2: path.join(ROOT, 'data', 'd2-slide-hackathon.json')
};
const VLEARN_PDF_FILES = {
  1: path.join(ROOT, 'data', 'd1-slide-hackathon.pdf'),
  2: path.join(ROOT, 'data', 'd2-slide-hackathon.pdf')
};
const PORT = Number(process.env.PORT || 3000);
const MIME = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
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

<<<<<<< HEAD
// Slide + tutor conversation sent by the client for items saved from chat.
// It is not a curated source, so allowlisted sources always take precedence.
function inlineSourceFor(request) {
  const inline = request.slideSource;
  if (typeof inline?.text !== 'string' || !inline.text.trim() || inline.text.length > 12000) return null;
  return {
    sourceId: `slide:${String(request.itemId).slice(0, 80)}`,
    sourceVersion: 'slide-chat-v1',
    title: typeof inline.title === 'string' ? inline.title.slice(0, 300) : 'Slide',
    text: inline.text,
    statements: []
  };
}

function providerKeyName() {
  return keyEnvFor((process.env.LLM_PROVIDER || 'gemini').toLowerCase());
=======
function vlearnSlidesFor(day) {
  const file = VLEARN_SLIDE_FILES[day];
  if (!file || !fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
>>>>>>> 4ac626809382a9dfa0209dd0b73280f74ca07e16
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

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (req.method === 'GET' && url.pathname === '/api/health') return json(res, 200, { ok: true, mode: 'curated-demo' });
  if (req.method === 'GET' && url.pathname === '/api/sources') {
    return json(res, 200, SOURCES.map(({ text, statements, ...source }) => source));
  }
  if (req.method === 'GET' && url.pathname === '/api/vlearn-slides') {
    const day = Number(url.searchParams.get('day'));
    if (!Number.isInteger(day) || !VLEARN_SLIDE_FILES[day]) {
      return json(res, 400, { error: 'day must be 1 or 2' });
    }
    try {
      const pack = vlearnSlidesFor(day);
      if (!pack) return json(res, 404, { error: 'slide data not found' });
      return json(res, 200, pack);
    } catch (error) {
      return json(res, 500, { error: `cannot read slide data: ${error.message}` });
    }
  }
  if (req.method === 'GET' && url.pathname === '/api/vlearn-pdf') {
    const day = Number(url.searchParams.get('day'));
    const file = VLEARN_PDF_FILES[day];
    if (!Number.isInteger(day) || !file) return json(res, 400, { error: 'day must be 1 or 2' });
    if (!fs.existsSync(file)) return json(res, 404, { error: 'PDF not found' });
    res.writeHead(200, {
      'content-type': 'application/pdf',
      'content-disposition': 'inline',
      'cache-control': 'public, max-age=3600'
    });
    return fs.createReadStream(file).pipe(res);
  }
  if (req.method === 'POST' && url.pathname === '/api/quiz') {
    try {
      const request = await parseJsonBody(req);
      if (!request.itemId || !Number.isInteger(request.revision)) return json(res, 400, errorResponse('invalid_request', 'itemId và revision là bắt buộc.'));
      const sourceRef = typeof request.sourceRef === 'string' ? request.sourceRef : request.sourceRef?.sourceId;
      if (!process.env[providerKeyName()]) {
        const curated = sourceFor(sourceRef);
        if (process.env.VINMARK_DEMO_MODE === 'true' && curated) return json(res, 200, buildQuiz(request, curated));
        return json(res, 503, errorResponse('missing_api_key', `${providerKeyName()} chưa được cấu hình; không dùng fixture fallback.`, false));
      }
      const { response, trace } = await decideQuiz({
        itemId: request.itemId, revision: request.revision, sourceRef,
        source: /^d[12]:/i.test(sourceRef || '') || sourceFor(sourceRef) ? undefined : inlineSourceFor(request) || undefined,
        learnerQuestions: request.learnerQuestions, mode: request.mode, previousAttempt: request.previousAttempt
      });
      console.log(`[quiz] ${request.itemId} ${trace.sourceId || sourceRef || '-'} → ${response.status} (${trace.traceId})`);
      if (response.status === 'error') return json(res, 502, errorResponse(response.code, response.message, true));
      return json(res, 200, response);
    } catch (error) {
      console.error('[quiz]', error.code || '', error.message, error.traceId || '');
      const code = error.code || 'decision_error';
      const status = code === 'invalid_json' ? 400 : code === 'missing_api_key' ? 503 : 502;
      return json(res, status, errorResponse(code, error.message, code !== 'missing_api_key'));
    }
  }
  if (req.method === 'POST' && url.pathname === '/api/chat') {
    try {
      const checked = validateTutorRequest(await parseJsonBody(req));
      if (checked.error) return json(res, 400, errorResponse('invalid_request', checked.error));
      const { slide } = checked.value;
      if (process.env[providerKeyName()]) {
        const result = await callTutor(checked.value);
        return json(res, 200, { status: 'ok', answer: result.answer, grounded: result.grounded });
      }
      if (process.env.VINMARK_DEMO_MODE === 'true') {
        return json(res, 200, { status: 'ok', answer: `Minh họa từ slide hiện tại: ${slide.bullets.join(' ')} Đây là phần nhắc lại nguồn, chưa phải câu trả lời từ AI thật.`, grounded: true, demo: true });
      }
      return json(res, 503, errorResponse('missing_api_key', `${providerKeyName()} chưa được cấu hình.`, false));
    } catch (error) {
      console.error('[chat]', error.code || '', error.message);
      const code = error.code || 'tutor_error';
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
