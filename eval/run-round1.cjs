'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { callModel } = require('../server/model');
const { validateQuizResponse } = require('../server/quiz-contract');
const { sourceFor } = require('../server/server');

const root = path.resolve(__dirname, '..');
const csvPath = path.join(__dirname, 'golden_set.csv');
const tracePath = path.join(__dirname, 'trace_round1.json');
const resultPath = path.join(__dirname, 'results_round1.md');
const sources = JSON.parse(fs.readFileSync(path.join(root, 'server', 'sources.json'), 'utf8'));

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
  return rows.map(values => Object.fromEntries(headers.map((header, index) => [header, values[index] || ''])));
}

function expectedPass(expected, response, source) {
  if (expected === 'ready') {
    return response?.status === 'ready' && validateQuizResponse(response, [source]).ok;
  }
  return response?.status === 'needs_context';
}

async function main() {
  const provider = (process.env.LLM_PROVIDER || 'gemini').toLowerCase();
  const keyName = provider === 'nim' ? 'NVIDIA_NIM_API_KEY' : provider === 'deepseek' ? 'DEEPSEEK_API_KEY' : 'GEMINI_API_KEY';
  if (!process.env[keyName]) {
    fs.writeFileSync(resultPath, `# VinMark AI Evaluation Round 1\n\nStatus: **BLOCKED**\n\n\`${keyName}\` is not configured. No model call or score was produced.\n`);
    console.log(`BLOCKED: set ${keyName} before running the 20-case evaluation.`);
    return;
  }

  const cases = parseCsv(fs.readFileSync(csvPath, 'utf8'));
  const traces = [];
  const results = [];
  for (const testCase of cases) {
    const source = sourceFor(testCase.source_ref);
    const started = Date.now();
    if (!source) {
      const response = { status: 'needs_context', reason: 'Source is not in the allowlist.' };
      results.push({ id: testCase.id, class: testCase.class, expected: testCase.expected_action, actual: response.status, pass: expectedPass(testCase.expected_action, response, source || {}) });
      traces.push({ id: testCase.id, sourceId: testCase.source_ref, noModelCall: true, response, latencyMs: Date.now() - started });
      continue;
    }
    try {
      const result = await callModel({ itemId: testCase.id, revision: testCase.scenario === 'stale revision' ? 2 : 1, mode: 'initial', learnerQuestions: [testCase.input] }, source);
      const pass = expectedPass(testCase.expected_action, result.response, source);
      results.push({ id: testCase.id, class: testCase.class, expected: testCase.expected_action, actual: result.response.status, pass });
      traces.push({ id: testCase.id, trace: result.trace, validation: result.response.status === 'ready' ? validateQuizResponse(result.response, [source]) : null });
    } catch (error) {
      const infra = ['gemini_http_error', 'nim_http_error', 'nim_timeout', 'deepseek_http_error', 'deepseek_timeout', 'missing_api_key', 'missing_fetch'].includes(error.code);
      results.push({ id: testCase.id, class: testCase.class, expected: testCase.expected_action, actual: `error:${error.code || 'unknown'}`, pass: false, infra });
      traces.push({ id: testCase.id, error: { code: error.code || 'unknown', message: error.message }, latencyMs: Date.now() - started });
    }
  }

  const infraErrors = results.filter(result => result.infra).length;
  const assessed = results.filter(result => !result.infra);
  const passed = assessed.filter(result => result.pass).length;
  const byClass = [...new Set(results.map(result => result.class))].map(group => {
    const values = results.filter(result => result.class === group);
    const assessedValues = values.filter(value => !value.infra);
    return `| ${group} | ${assessedValues.filter(value => value.pass).length}/${assessedValues.length} |`;
  }).join('\n');
  const status = infraErrors ? 'INCOMPLETE' : passed >= 18 && results.length === 20 ? 'PASS' : 'FAIL';
  const report = `# VinMark AI Evaluation Round 1\n\nStatus: **${status}**\n\n- Cases: ${results.length}\n- Behavioral cases assessed: ${assessed.length}\n- Passed: ${passed}/${assessed.length || 0}${assessed.length ? ` (${(passed / assessed.length * 100).toFixed(1)}%)` : ''}\n- Infrastructure errors: ${infraErrors}\n- Target: >=18/20 cases, no unsupported answer or fabricated citation\n\n| Class | Result |\n|---|---|\n${byClass}\n\n## Cases\n\n| ID | Expected | Actual | Pass | Infra |\n|---|---|---|---|---|\n${results.map(result => `| ${result.id} | ${result.expected} | ${result.actual} | ${result.pass ? 'yes' : 'no'} | ${result.infra ? 'yes' : 'no'} |`).join('\n')}\n`;
  fs.writeFileSync(tracePath, JSON.stringify({ generatedAt: new Date().toISOString(), cases: traces }, null, 2));
  fs.writeFileSync(resultPath, report);
  console.log(infraErrors ? `INCOMPLETE: ${passed}/${assessed.length || 0} behavioral cases passed; ${infraErrors} infrastructure errors` : `RESULT: ${passed}/${results.length} passed (${(passed / results.length * 100).toFixed(1)}%)`);
}

main().catch(error => { console.error(error); process.exitCode = 1; });
