'use strict';

// Provider-agnostic "system + user → JSON text" call. Returns the raw model text untouched
// so callers can log it before parsing.

const DEFAULTS = {
  deepseek: { keyEnv: 'DEEPSEEK_API_KEY', baseEnv: 'DEEPSEEK_BASE_URL', modelEnv: 'DEEPSEEK_MODEL', timeoutEnv: 'DEEPSEEK_TIMEOUT_MS', baseUrl: 'https://api.deepseek.com', model: 'deepseek-flash' },
  nim: { keyEnv: 'NVIDIA_NIM_API_KEY', baseEnv: 'NVIDIA_NIM_BASE_URL', modelEnv: 'NVIDIA_NIM_MODEL', timeoutEnv: 'NVIDIA_NIM_TIMEOUT_MS', baseUrl: 'https://integrate.api.nvidia.com/v1', model: '' },
  gemini: { keyEnv: 'GEMINI_API_KEY', modelEnv: 'GEMINI_MODEL', model: 'gemini-3.6-flash' }
};

function providerName(options = {}) {
  return (options.provider || process.env.LLM_PROVIDER || 'gemini').toLowerCase();
}

function keyEnvFor(provider) {
  return DEFAULTS[provider]?.keyEnv || 'GEMINI_API_KEY';
}

function fail(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

async function postJson(fetchImpl, url, headers, body, timeoutMs, label) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let response;
  try {
    response = await fetchImpl(url, { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body), signal: controller.signal });
  } catch (error) {
    if (error.name === 'AbortError') throw fail('llm_timeout', `${label} request exceeded ${timeoutMs}ms.`);
    throw fail('llm_network_error', `${label} request failed: ${error.message}`);
  } finally { clearTimeout(timer); }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw fail('llm_http_error', `${label} request failed: HTTP ${response.status}. ${payload?.error?.message || payload?.message || ''}`.trim());
  return payload;
}

async function discoverNimModel(apiKey, baseUrl, fetchImpl) {
  const response = await fetchImpl(`${baseUrl}/models`, { headers: { authorization: `Bearer ${apiKey}` } });
  const payload = await response.json().catch(() => ({}));
  const model = (payload?.data || []).map(entry => entry?.id).find(id => typeof id === 'string');
  if (!response.ok || !model) throw fail('llm_model_missing', 'NVIDIA NIM returned no model. Set NVIDIA_NIM_MODEL explicitly.');
  return model;
}

async function callJson({ system, user, temperature = 0.2 }, options = {}) {
  const provider = providerName(options);
  const config = DEFAULTS[provider];
  if (!config) throw fail('unsupported_provider', `Unsupported model provider: ${provider}`);
  const apiKey = options.apiKey || process.env[config.keyEnv];
  if (!apiKey) throw fail('missing_api_key', `${config.keyEnv} is not configured.`);
  const fetchImpl = options.fetchImpl || globalThis.fetch;
  const timeoutMs = Number(options.timeoutMs || process.env[config.timeoutEnv] || 45000);
  const started = Date.now();

  if (provider === 'gemini') {
    const model = options.model || process.env[config.modelEnv] || config.model;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const payload = await postJson(fetchImpl, url, {}, {
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ parts: [{ text: user }] }],
      generationConfig: { temperature, responseMimeType: 'application/json' }
    }, timeoutMs, provider);
    return { provider, model, latencyMs: Date.now() - started, rawText: payload?.candidates?.[0]?.content?.parts?.map(part => part.text || '').join('') || '' };
  }

  const baseUrl = (options.baseUrl || process.env[config.baseEnv] || config.baseUrl).replace(/\/$/, '');
  const model = options.model || process.env[config.modelEnv] || config.model || await discoverNimModel(apiKey, baseUrl, fetchImpl);
  const payload = await postJson(fetchImpl, `${baseUrl}/chat/completions`, { authorization: `Bearer ${apiKey}` }, {
    model,
    messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
    temperature,
    response_format: { type: 'json_object' }
  }, timeoutMs, provider);
  return { provider, model, baseUrl, latencyMs: Date.now() - started, rawText: payload?.choices?.[0]?.message?.content || '' };
}

function parseJsonObject(rawText) {
  const text = String(rawText || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end < start) throw fail('invalid_model_json', 'Model response did not contain a JSON object.');
  try { return JSON.parse(text.slice(start, end + 1)); } catch { throw fail('invalid_model_json', 'Model response contained invalid JSON.'); }
}

module.exports = { callJson, keyEnvFor, parseJsonObject, providerName };
