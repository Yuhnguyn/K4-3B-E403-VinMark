'use strict';

const assert = require('node:assert/strict');
const { validateQuizResponse } = require('./quiz-contract');

const sourceText = 'Attention connects related tokens. Query, key, and value participate in the calculation.';
const sources = [{ sourceId: 'attention-1', text: sourceText }];

function responseWith(count) {
  return {
    status: 'ready',
    itemId: 'item-1',
    revision: 1,
    sourceVersion: 'attention-v1',
    quizId: `quiz-${count}`,
    questionCount: count,
    coverageTags: ['attention'],
    summary: [{ text: 'Attention connects related tokens.', sourceId: 'attention-1' }],
    questions: Array.from({ length: count }, (_, index) => ({
      id: `q-${index}`,
      concept: 'attention',
      prompt: `What does attention connect in question ${index}?`,
      options: ['Related tokens', 'User accounts', 'Course dates', 'Screen colors'],
      correctIndex: 0,
      explanation: 'Attention connects related tokens in context.',
      sourceId: 'attention-1',
      evidenceQuote: 'Attention connects related tokens.'
    }))
  };
}

for (const count of [3, 5, 10]) {
  const result = validateQuizResponse(responseWith(count), sources);
  assert.equal(result.ok, true, `${count}-question response should be valid`);
}

const tooShort = validateQuizResponse(responseWith(2), sources);
assert.equal(tooShort.ok, false);

const tooLong = validateQuizResponse(responseWith(11), sources);
assert.equal(tooLong.ok, false);

const duplicateQuestion = responseWith(3);
duplicateQuestion.questions[1].prompt = duplicateQuestion.questions[0].prompt;
assert.equal(validateQuizResponse(duplicateQuestion, sources).ok, false);

const duplicateOption = responseWith(3);
duplicateOption.questions[0].options[1] = duplicateOption.questions[0].options[0];
assert.equal(validateQuizResponse(duplicateOption, sources).ok, false);

const badAnswer = responseWith(3);
badAnswer.questions[0].correctIndex = 4;
assert.equal(validateQuizResponse(badAnswer, sources).ok, false);

const missingEvidence = responseWith(3);
missingEvidence.questions[0].evidenceQuote = 'Unsupported claim.';
assert.equal(validateQuizResponse(missingEvidence, sources).ok, false);

console.log('PASS: quiz contract validation');
