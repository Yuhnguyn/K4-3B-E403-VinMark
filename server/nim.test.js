'use strict';

const assert = require('node:assert/strict');
const { callNim, discoverModel } = require('./nim');

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

(async () => {
  const discovered = await discoverModel('test-key', 'https://nim.test/v1', async url => {
    assert.equal(url, 'https://nim.test/v1/models');
    return { ok: true, json: async () => ({ data: [{ id: 'meta/current-model' }] }) };
  });
  assert.equal(discovered, 'meta/current-model');

  const result = await callNim({ itemId: 'item-1', revision: 1, mode: 'initial' }, source, {
    apiKey: 'test-key', model: 'meta/test-model', baseUrl: 'https://nim.test/v1',
    fetchImpl: async (url, options) => {
      assert.equal(url, 'https://nim.test/v1/chat/completions');
      assert.equal(options.headers.authorization, 'Bearer test-key');
      const request = JSON.parse(options.body);
      assert.equal(request.model, 'meta/test-model');
      return { ok: true, json: async () => ({ choices: [{ message: { content: JSON.stringify(generated) } }] }) };
    }
  });
  assert.equal(result.response.status, 'ready');
  assert.equal(result.response.generationMode, 'nim');
  assert.equal(result.trace.provider, 'nim');

  let calls = 0;
  const recovered = await callNim({ itemId: 'item-2', revision: 1, mode: 'initial' }, source, {
    apiKey: 'test-key', model: 'retired-model', baseUrl: 'https://nim.test/v1',
    fetchImpl: async (url, options) => {
      calls++;
      if (calls === 1) return { ok: false, status: 410, json: async () => ({ detail: 'end of life' }) };
      if (calls === 2) return { ok: true, json: async () => ({ data: [{ id: 'current-model' }] }) };
      const request = JSON.parse(options.body);
      assert.equal(request.model, 'current-model');
      return { ok: true, json: async () => ({ choices: [{ message: { content: JSON.stringify(generated) } }] }) };
    }
  });
  assert.equal(recovered.response.status, 'ready');
  assert.equal(recovered.trace.model, 'current-model');
  assert.equal(recovered.trace.fallbackFrom, 'retired-model');
  console.log('PASS: NVIDIA NIM adapter parsing and request trace');
})().catch(error => { console.error(error); process.exitCode = 1; });
