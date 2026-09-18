'use strict';

const { callGemini } = require('./gemini');
const { callNim } = require('./nim');
const { callDeepSeek } = require('./deepseek');

function callModel(request, source, options = {}) {
  const provider = (options.provider || process.env.LLM_PROVIDER || 'gemini').toLowerCase();
  if (provider === 'nim') return callNim(request, source, options);
  if (provider === 'deepseek') return callDeepSeek(request, source, options);
  if (provider === 'gemini') return callGemini(request, source, options);
  const error = new Error(`Unsupported model provider: ${provider}`);
  error.code = 'unsupported_provider';
  throw error;
}

module.exports = { callModel };
