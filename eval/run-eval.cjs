'use strict';

// Runs eval/golden_set.csv through the central decision module (codebase/decision.js) with the
// real model configured by LLM_PROVIDER, then writes:
//   eval/results_<round>.md    — stats + per-case table (+ hand-written analysis kept below the marker)
//   eval/results_<round>.json  — machine-readable results
//   eval/trace_<round>.jsonl   — one line per case: prompt, raw model response, validation
// Usage: node eval/run-eval.cjs [round1] [--check]   (--check validates the CSV only, no model calls)

const fs = require('node:fs');
const path = require('node:path');
process.env.VINMARK_LOG = 'off'; // the runner writes its own trace file below

const { decideQuiz, PROMPT_VERSION } = require('../codebase/decision');
const { resolveSource } = require('../codebase/sources');
const { keyEnvFor, providerName } = require('../codebase/llm');

const args = process.argv.slice(2);
const checkOnly = args.includes('--check');
const round = args.find(arg => !arg.startsWith('--')) || 'round1';
const EVAL_DIR = __dirname;
const MARKER = '<!-- analysis: nội dung dưới dòng này được giữ nguyên khi chạy lại -->';
const INFRA_CODES = new Set(['llm_http_error', 'llm_timeout', 'llm_network_error', 'missing_api_key', 'llm_model_missing', 'unsupported_provider']);

function parseCsv(input) {
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (char === '"' && quoted && input[i + 1] === '"') { field += '"'; i++; continue; }
    if (char === '"') { quoted = !quoted; continue; }
    if (char === ',' && !quoted) { row.push(field); field = ''; continue; }
    if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && input[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some(Boolean)) rows.push(row);
      row = [];
      continue;
    }
    field += char;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const headers = rows.shift();
  return rows.map(values => Object.fromEntries(headers.map((header, index) => [header, (values[index] || '').trim()])));
}

// User Input Grid rule (eval/input_grid.md): the expected action follows from the dimensions.
function expectedFromGrid(c) {
  if (c.dim_scope === 'off_course' || c.dim_scope === 'authority') return 'out_of_scope';
  if (c.dim_request === 'noise') return 'needs_context';
  if (c.dim_source !== 'full') return 'needs_context';
  if (c.dim_scope === 'in_course_not_source') return 'needs_context';
  return 'ready';
}

function checkComposition(cases) {
  const problems = [];
  const count = predicate => cases.filter(predicate).length;
  const byLayer = layer => count(c => c.layer === layer);
  if (cases.length < 20) problems.push(`cần ≥20 case, có ${cases.length}`);
  for (const layer of ['1_source_truth', '2_ambiguity', '3_scope', '4_domain']) if (byLayer(layer) < 2) problems.push(`lớp ${layer} cần ≥2 case, có ${byLayer(layer)}`);
  const normal = count(c => c.class === 'normal'), rare = count(c => c.class === 'rare');
  if (normal < 8 || normal > 10) problems.push(`cần 8–10 case thường, có ${normal}`);
  if (rare < 2 || rare > 4) problems.push(`cần 2–4 case hiếm, có ${rare}`);
  const fromChatlog = count(c => (c.origin === 'chatlog' || c.origin === 'developed') && /^T\d{5}$/.test(c.turn_id));
  if (fromChatlog < 10) problems.push(`cần ≥10 case từ chatlog, có ${fromChatlog}`);
  for (const c of cases) {
    const grid = expectedFromGrid(c);
    if (grid !== c.expected_action) problems.push(`${c.id}: expected_action=${c.expected_action} nhưng luật Grid cho ${grid}`);
  }
  return { problems, normal, rare, fromChatlog, layers: Object.fromEntries(['1_source_truth', '2_ambiguity', '3_scope', '4_domain'].map(layer => [layer, byLayer(layer)])) };
}

function sourceFor(c) {
  if (!c.source_append) return { sourceRef: c.source_ref || null };
  const resolved = resolveSource(c.source_ref);
  if (resolved.error) return { sourceRef: c.source_ref };
  const source = structuredClone(resolved.source);
  const last = source.pages ? source.pages[source.pages.length - 1] : null;
  if (last) last.text += `\n${c.source_append}`;
  source.text += `\n${c.source_append}`;
  return { source, sourceRef: c.source_ref };
}

function grade(c, response) {
  const checks = {};
  const actual = response.status === 'error' ? response.modelStatus || 'error' : response.status;
  checks.decision = actual === c.expected_action;
  checks.contract = response.status !== 'error';
  const questions = response.status === 'ready' ? response.questions : [];
  const failures = [];
  if (c.must_not_correct) {
    const pattern = new RegExp(c.must_not_correct, 'i');
    const hits = questions.filter(question => pattern.test(question.options[question.correctIndex]));
    checks.must_not_correct = hits.length === 0;
    if (hits.length) failures.push(`đáp án đúng chứa phát biểu cấm: "${hits[0].options[hits[0].correctIndex]}"`);
  }
  if (c.must_not_any) {
    const pattern = new RegExp(c.must_not_any, 'i');
    const body = JSON.stringify({ reason: response.reason, questions });
    checks.must_not_any = !pattern.test(body);
    if (!checks.must_not_any) failures.push(`output chứa nội dung cấm /${c.must_not_any}/`);
  }
  if (response.status === 'needs_context' || response.status === 'out_of_scope') checks.abstain_explained = Boolean(response.reason && response.nextAction);
  if (!checks.decision) failures.unshift(`quyết định sai: mong đợi ${c.expected_action}, nhận ${actual}`);
  if (!checks.contract) failures.push(`vi phạm hợp đồng: ${response.message}`);
  if (checks.abstain_explained === false) failures.push('từ chối nhưng thiếu reason/nextAction');
  return { actual, checks, pass: Object.values(checks).every(Boolean), failures };
}

const pct = (n, d) => (d ? `${(n / d * 100).toFixed(1)}%` : '—');

function statsTable(rows, key, label) {
  const groups = [...new Set(rows.map(row => row[key] || '—'))];
  const lines = groups.map(group => {
    const members = rows.filter(row => (row[key] || '—') === group);
    const passed = members.filter(row => row.pass).length;
    return `| ${group} | ${members.length} | ${passed} | ${members.length - passed} | ${pct(passed, members.length)} |`;
  });
  return `| ${label} | Số case | Đạt | Không đạt | Tỷ lệ đạt |\n|---|---:|---:|---:|---:|\n${lines.join('\n')}`;
}

function coverageTable(cases) {
  const dims = ['dim_source', 'dim_request', 'dim_scope', 'dim_trap', 'dim_lang'];
  return dims.map(dim => `- **${dim.replace('dim_', '')}**: ${[...new Set(cases.map(c => c[dim]))].map(value => `${value} (${cases.filter(c => c[dim] === value).length})`).join(' · ')}`).join('\n');
}

async function main() {
  const cases = parseCsv(fs.readFileSync(path.join(EVAL_DIR, 'golden_set.csv'), 'utf8'));
  const composition = checkComposition(cases);
  console.log(`Golden set: ${cases.length} case · thường ${composition.normal} · hiếm ${composition.rare} · từ chatlog ${composition.fromChatlog} · lớp ${JSON.stringify(composition.layers)}`);
  if (composition.problems.length) { console.error('CSV chưa hợp lệ:\n- ' + composition.problems.join('\n- ')); process.exitCode = 1; return; }
  if (checkOnly) { console.log('CSV hợp lệ, expected_action khớp luật Grid.'); return; }

  const provider = providerName();
  if (!process.env[keyEnvFor(provider)]) { console.error(`BLOCKED: chưa cấu hình ${keyEnvFor(provider)}.`); process.exitCode = 1; return; }

  const results = [], traces = [];
  for (const c of cases) {
    const started = Date.now();
    const { source, sourceRef } = sourceFor(c);
    try {
      const { response, trace } = await decideQuiz({ itemId: c.id, revision: 1, sourceRef, source, learnerQuestions: [c.input] }, { caseId: c.id });
      const graded = grade(c, response);
      results.push({ ...c, ...graded, decidedBy: trace.decidedBy, model: trace.model || null, latencyMs: trace.latencyMs ?? Date.now() - started, questionCount: response.questionCount ?? null, reason: response.reason || '', nextAction: response.nextAction || '', questions: response.questions || [], validationErrors: trace.validation?.ok === false ? trace.validation.errors : [] });
      traces.push({ caseId: c.id, ...trace });
      console.log(`${graded.pass ? 'PASS' : 'FAIL'} ${c.id} expected=${c.expected_action} actual=${graded.actual}${graded.failures.length ? ' · ' + graded.failures.join(' · ') : ''}`);
    } catch (error) {
      const infra = INFRA_CODES.has(error.code);
      results.push({ ...c, actual: `error:${error.code || 'unknown'}`, checks: {}, pass: false, infra, failures: [`${infra ? 'lỗi hạ tầng' : 'lỗi xử lý'}: ${error.message}`], latencyMs: Date.now() - started, questions: [] });
      traces.push({ caseId: c.id, error: { code: error.code, message: error.message } });
      console.log(`ERROR ${c.id} ${error.code} ${error.message}`);
    }
  }

  const assessed = results.filter(row => !row.infra);
  const passed = assessed.filter(row => row.pass).length;
  const failed = assessed.length - passed;
  const infraErrors = results.length - assessed.length;
  const model = results.find(row => row.model)?.model || 'n/a';
  const runAt = new Date().toISOString();
  const bar = 18 / 20;
  const status = infraErrors ? 'INCOMPLETE' : passed / assessed.length >= bar ? 'ĐẠT quality bar' : 'CHƯA ĐẠT quality bar';

  const caseRows = results.map(row => `| ${row.id} | ${row.class}${row.layer ? ` · ${row.layer}` : ''} | ${row.turn_id || '—'} | \`${row.source_ref || '—'}\` | ${row.expected_action} | ${row.actual}${row.questionCount ? ` (${row.questionCount} câu)` : ''} | ${row.pass ? '✅' : '❌'} | ${row.failures.join('; ').replace(/\|/g, '\\|') || ''} |`).join('\n');
  const auto = `# VinMark · Kết quả đánh giá ${round}

Trạng thái: **${status}** — ${passed}/${assessed.length} case đạt (${pct(passed, assessed.length)}). Quality bar đề xuất: ≥18/20 tương đương ≥${(bar * 100).toFixed(0)}% và không có nguồn bịa.

- Chạy lúc: ${runAt} · provider \`${provider}\` · model \`${model}\` · prompt \`${PROMPT_VERSION}\` · temperature 0.2
- Module: [codebase/decision.js](../codebase/decision.js) · bộ case: [golden_set.csv](golden_set.csv) · trace: [trace_${round}.jsonl](trace_${round}.jsonl)
- Số case: ${results.length} · đánh giá được: ${assessed.length} · lỗi hạ tầng (không tính): ${infraErrors}
- Cơ cấu: ${composition.normal} thường · ${Object.values(composition.layers).reduce((a, b) => a + b, 0)} khó (${Object.entries(composition.layers).map(([k, v]) => `${k} ${v}`).join(', ')}) · ${composition.rare} hiếm · ${composition.fromChatlog} case lấy/phát triển từ chatlog

Một case **đạt** khi qua mọi kiểm tra áp dụng cho nó: (1) đúng quyết định ready / needs_context / out_of_scope; (2) nếu ready: 3–10 câu, 4 lựa chọn khác nhau, 1 đáp án, trích dẫn nguyên văn nằm đúng trang được cite; (3) không vi phạm \`must_not\`; (4) nếu từ chối: có lý do và bước tiếp theo. Tiêu chí (2) chỉ kiểm tra được căn cứ hình thức; tính đúng của nội dung câu hỏi cần người chấm (xem [rater_sheet.csv](rater_sheet.csv)).

## Thống kê

| | Số case | Tỷ lệ |
|---|---:|---:|
| Đạt | ${passed} | ${pct(passed, assessed.length)} |
| Không đạt | ${failed} | ${pct(failed, assessed.length)} |
| Tổng đánh giá | ${assessed.length} | 100% |

${statsTable(assessed, 'class', 'Nhóm')}

${statsTable(assessed.filter(row => row.layer), 'layer', 'Lớp chỗ khó')}

${statsTable(assessed, 'expected_action', 'Hành vi mong đợi')}

Độ phủ User Input Grid (số case theo từng giá trị chiều, xem [input_grid.md](input_grid.md)):

${coverageTable(cases)}

## Từng case

| ID | Nhóm | Turn | Nguồn | Mong đợi | Thực tế | Đạt | Lỗi |
|---|---|---|---|---|---|:-:|---|
${caseRows}
`;
  const reportPath = path.join(EVAL_DIR, `results_${round}.md`);
  const previous = fs.existsSync(reportPath) ? fs.readFileSync(reportPath, 'utf8') : '';
  const analysis = previous.includes(MARKER) ? previous.slice(previous.indexOf(MARKER)) : `${MARKER}\n\n## Phân tích nguyên nhân\n\n_(chưa viết)_\n`;
  fs.writeFileSync(reportPath, `${auto}\n${analysis}`);
  fs.writeFileSync(path.join(EVAL_DIR, `results_${round}.json`), JSON.stringify({ round, runAt, provider, model, promptVersion: PROMPT_VERSION, passed, assessed: assessed.length, infraErrors, results: results.map(({ questions, ...row }) => ({ ...row, questions: questions.map(q => ({ page: q.page, prompt: q.prompt, correct: q.options?.[q.correctIndex], evidenceQuote: q.evidenceQuote })) })) }, null, 2));
  fs.writeFileSync(path.join(EVAL_DIR, `trace_${round}.jsonl`), traces.map(trace => JSON.stringify(trace)).join('\n') + '\n');
  console.log(`\n${status}: ${passed}/${assessed.length} (${pct(passed, assessed.length)}), lỗi hạ tầng ${infraErrors}. Báo cáo: eval/results_${round}.md`);
}

main().catch(error => { console.error(error); process.exitCode = 1; });
