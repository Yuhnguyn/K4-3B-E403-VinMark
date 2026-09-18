'use strict';

const assert = require('node:assert/strict');
const { DEFAULT_MODEL, callGemini, extractModelJson } = require('./gemini');

const source = {
  sourceId: 'source-1',
  sourceVersion: 'v1',
  title: 'Attention',
  text: 'Attention connects related tokens.',
  statements: []
};

const generated = {
  questionCount: 3,
  coverageTags: ['attention'],
  summary: [{ text: 'Attention connects related tokens.', sourceId: 'source-1' }],
  questions: [
    {
      id: 'q1', concept: 'attention', prompt: 'What does attention connect?',
      options: ['Related tokens', 'Accounts', 'Dates', 'Colors'], correctIndex: 0,
      explanation: 'It connects related tokens.', sourceId: 'source-1', evidenceQuote: 'Attention connects related tokens.'
    },
    {
      id: 'q2', concept: 'attention-2', prompt: 'What is in context?',
      options: ['Related tokens', 'Accounts', 'Dates', 'Colors'], correctIndex: 0,
      explanation: 'The source discusses related tokens.', sourceId: 'source-1', evidenceQuote: 'Attention connects related tokens.'
    },
    {
      id: 'q3', concept: 'attention-3', prompt: 'What does the source describe?',
      options: ['Related tokens', 'Accounts', 'Dates', 'Colors'], correctIndex: 0,
      explanation: 'The source describes related tokens.', sourceId: 'source-1', evidenceQuote: 'Attention connects related tokens.'
    }
  ]
};

assert.deepEqual(extractModelJson('```json\n{"questionCount":3}\n```'), { questionCount: 3 });
assert.equal(DEFAULT_MODEL, 'gemini-3.6-flash');

(async () => {
  const result = await callGemini({ itemId: 'item-1', revision: 2, mode: 'initial' }, source, {
    apiKey: 'test-key',
    model: 'test-model',
    fetchImpl: async (url, options) => {
      assert.match(url, /models\/test-model:generateContent\?key=test-key$/);
      assert.equal(options.method, 'POST');
      return { ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: JSON.stringify(generated) }] } }] }) };
    }
  });
  assert.equal(result.response.status, 'ready');
  assert.equal(result.response.questionCount, 3);
  assert.equal(result.trace.model, 'test-model');
  assert.equal(result.trace.itemId, 'item-1');
  console.log('PASS: Gemini adapter parsing and request trace');
})().catch(error => { console.error(error); process.exitCode = 1; });
