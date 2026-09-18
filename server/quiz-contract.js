'use strict';

const MIN_QUESTIONS = 3;
const MAX_QUESTIONS = 10;

function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function validateQuizResponse(response, sources) {
  const errors = [];
  const sourceMap = new Map((Array.isArray(sources) ? sources : []).map(source => [source.sourceId, source]));

  if (!response || response.status !== 'ready') errors.push('status must be ready');
  if (!Number.isInteger(response?.questionCount)) errors.push('questionCount must be an integer');
  if (response?.questionCount < MIN_QUESTIONS || response?.questionCount > MAX_QUESTIONS) {
    errors.push(`questionCount must be between ${MIN_QUESTIONS} and ${MAX_QUESTIONS}`);
  }
  if (!Array.isArray(response?.questions)) errors.push('questions must be an array');
  if (Array.isArray(response?.questions) && response.questionCount !== response.questions.length) {
    errors.push('questionCount must match questions.length');
  }

  const prompts = new Set();
  for (const [index, question] of (Array.isArray(response?.questions) ? response.questions : []).entries()) {
    const prompt = text(question?.prompt).toLowerCase();
    if (!prompt) errors.push(`questions[${index}].prompt is required`);
    if (prompts.has(prompt)) errors.push(`questions[${index}].prompt is duplicated`);
    prompts.add(prompt);

    if (!Array.isArray(question?.options) || question.options.length !== 4) {
      errors.push(`questions[${index}].options must contain four choices`);
    } else {
      const options = question.options.map(option => text(option).toLowerCase());
      if (options.some(option => !option) || new Set(options).size !== 4) {
        errors.push(`questions[${index}].options must be distinct and non-empty`);
      }
    }
    if (!Number.isInteger(question?.correctIndex) || question.correctIndex < 0 || question.correctIndex > 3) {
      errors.push(`questions[${index}].correctIndex must be between 0 and 3`);
    }
    if (!text(question?.explanation)) errors.push(`questions[${index}].explanation is required`);
    if (!sourceMap.has(question?.sourceId)) errors.push(`questions[${index}].sourceId is unknown`);
    const source = sourceMap.get(question?.sourceId);
    if (!text(question?.evidenceQuote) || !source?.text?.includes(question.evidenceQuote)) {
      errors.push(`questions[${index}].evidenceQuote must match its source`);
    }
  }

  if (!Array.isArray(response?.summary)) errors.push('summary must be an array');
  for (const [index, summary] of (Array.isArray(response?.summary) ? response.summary : []).entries()) {
    if (!text(summary?.text)) errors.push(`summary[${index}].text is required`);
    if (!sourceMap.has(summary?.sourceId)) errors.push(`summary[${index}].sourceId is unknown`);
  }

  return errors.length ? { ok: false, errors } : { ok: true, value: response };
}

module.exports = { MIN_QUESTIONS, MAX_QUESTIONS, validateQuizResponse };
