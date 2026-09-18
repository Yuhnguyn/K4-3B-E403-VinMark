'use strict';

// Append-only JSONL trace: one line per model decision, with the exact prompt sent and the raw
// model text received, so any output can be re-checked later. Logs hold learner questions and
// course text, so the default directory (logs/) is git-ignored.

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const DEFAULT_DIR = path.resolve(__dirname, '..', 'logs');

function logDir() {
  return process.env.VINMARK_LOG_DIR ? path.resolve(process.env.VINMARK_LOG_DIR) : DEFAULT_DIR;
}

function newTraceId() {
  return `tr_${Date.now().toString(36)}_${crypto.randomBytes(3).toString('hex')}`;
}

function appendTrace(record) {
  if (process.env.VINMARK_LOG === 'off') return null;
  const entry = { traceId: record.traceId || newTraceId(), loggedAt: new Date().toISOString(), ...record };
  try {
    const directory = logDir();
    fs.mkdirSync(directory, { recursive: true });
    fs.appendFileSync(path.join(directory, `decisions-${entry.loggedAt.slice(0, 10)}.jsonl`), `${JSON.stringify(entry)}\n`);
  } catch (error) {
    console.error('[trace] could not write trace:', error.message);
  }
  return entry.traceId;
}

module.exports = { appendTrace, logDir, newTraceId };
