'use strict';

const assert = require('node:assert/strict');
const { DEFAULT_MODEL, callDeepSeek } = require('./deepseek');

const source = { sourceId: 'source-1', sourceVersion: 'v1', title: 'Attention', text: 'Attention connects related tokens.', statements: [] };
const generated = {
  questionCount: 3,
  coverageTags: ['attention'],
  summary: [{ text: 'Attention connects related tokens.', sourceId: 'source-1' }],
  questions: [
    { id: 'q1', concept: 'a', prompt: 'Question one', options: ['A', 'B', 'C', 'D'], correctIndex: 0, explanation: 'A', sourceId: 'source-1', evidenceQuote: 'Attention connects related tokens.' },
    { id: 'q2', concept: 'b', prompt: 'Question two', options: ['A', 'B', 'C', 'D'], correctIndex: 0, explanation: 'A', sourceId: 'source-1', evidenceQuote: 'Attention connects related tokens.' },
    { id: 'q3', concept: 'c', prompt: 'Question three', options: ['A', 'B', 'C', 'D'], correctIndex: 0, explanation: 'A', sourceId: 'source-1', evidenceQuote: 'Attention connects related tokens.' }
  ]
};

assert.equal(DEFAULT_MODEL, 'deepseek-flash');

(async () => {
  const result = await callDeepSeek({ itemId: 'item-1', revision: 1, mode: 'initial' }, source, {
    apiKey: 'test-key', model: 'deepseek-test', baseUrl: 'https://deepseek.test',
    fetchImpl: async (url, options) => {
      assert.equal(url, 'https://deepseek.test/chat/completions');
      assert.equal(options.headers.authorization, 'Bearer test-key');
      assert.equal(JSON.parse(options.body).model, 'deepseek-test');
      return { ok: true, json: async () => ({ choices: [{ message: { content: JSON.stringify(generated) } }] }) };
    }
  });
  assert.equal(result.response.status, 'ready');
  assert.equal(result.response.generationMode, 'deepseek');
  assert.equal(result.trace.provider, 'deepseek');
  console.log('PASS: DeepSeek adapter parsing and request trace');
})().catch(error => { console.error(error); process.exitCode = 1; });
