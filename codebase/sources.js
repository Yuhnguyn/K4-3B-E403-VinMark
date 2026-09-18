'use strict';

// Resolves a source reference into page-addressed text the decision module can cite.
//   "d1:15"      → Day 1 PDF, page 15
//   "d2:18-19"   → Day 2 PDF, pages 18–19
//   "d1:18,20"   → Day 1 PDF, pages 18 and 20
//   "foundation-attention-1" → curated transcript source in server/sources.json
// Slide text comes from mockup/slides/slides-data.js (built from the BTC PDFs by build-slides.cjs).

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const SLIDES_FILE = path.join(ROOT, 'mockup', 'slides', 'slides-data.js');
const CURATED_FILE = path.join(ROOT, 'server', 'sources.json');
const DECKS = { d1: { day: 1, title: 'Day 1 · AI & LLM Foundation' }, d2: { day: 2, title: 'Day 2 · Xác định bài toán cho AI' } };
const MAX_PAGES = 4;

let slideCache = null;
function loadSlides() {
  if (slideCache) return slideCache;
  if (!fs.existsSync(SLIDES_FILE)) return (slideCache = {});
  const context = {};
  vm.runInNewContext(`${fs.readFileSync(SLIDES_FILE, 'utf8')};this.PDF_SLIDES=PDF_SLIDES;`, context);
  return (slideCache = context.PDF_SLIDES || {});
}

function loadCurated() {
  return JSON.parse(fs.readFileSync(CURATED_FILE, 'utf8'));
}

function parsePages(spec) {
  const pages = [];
  for (const part of String(spec).split(',')) {
    const range = part.trim().match(/^(\d+)(?:-(\d+))?$/);
    if (!range) return null;
    const from = Number(range[1]), to = Number(range[2] || range[1]);
    if (to < from) return null;
    for (let page = from; page <= to; page++) pages.push(page);
  }
  return [...new Set(pages)];
}

function pageText(slide) {
  return [slide.title, ...slide.bullets].join('\n');
}

// Returns { source } or { error: { code, reason, nextAction } }.
function resolveSource(ref) {
  const value = typeof ref === 'string' ? ref.trim() : ref?.sourceId;
  if (!value) return { error: { code: 'no_source', reason: 'Mục này chưa gắn trang slide hoặc đoạn nguồn nào.', nextAction: 'Mở slide liên quan rồi lưu lại, hoặc chọn nguồn cho mục này.' } };

  const match = value.match(/^(d[12]):(.+)$/i);
  if (match) {
    const deck = DECKS[match[1].toLowerCase()];
    const slides = loadSlides()[deck.day];
    if (!slides) return { error: { code: 'slides_missing', reason: 'Máy chủ chưa có dữ liệu slide. Chạy codebase/build-slides.cjs.', nextAction: 'Báo nhóm phát triển.' } };
    const pages = parsePages(match[2]);
    if (!pages?.length) return { error: { code: 'bad_locator', reason: `Không đọc được vị trí trang "${match[2]}".`, nextAction: 'Chọn lại trang slide.' } };
    const missing = pages.filter(page => !slides[page - 1]);
    if (missing.length) {
      return { error: { code: 'page_not_found', reason: `Trang ${missing.join(', ')} không có trong ${deck.title} (bộ slide có ${slides.length} trang). Số trang trong câu hỏi có thể thuộc phiên bản slide khác.`, nextAction: 'Mở đúng trang trong bộ slide hiện tại rồi lưu lại.' } };
    }
    if (pages.length > MAX_PAGES) return { error: { code: 'too_many_pages', reason: `Một mục ôn chỉ gắn tối đa ${MAX_PAGES} trang.`, nextAction: 'Chọn phần hẹp hơn.' } };
    const pageEntries = pages.map(page => ({ page, text: pageText(slides[page - 1]) }));
    return {
      source: {
        sourceId: `${match[1].toLowerCase()}:${match[2]}`,
        sourceVersion: 'hackathon-pdf-v1',
        title: `${deck.title} · trang ${pages.join(', ')}`,
        pages: pageEntries,
        text: pageEntries.map(entry => `[Trang ${entry.page}]\n${entry.text}`).join('\n\n')
      }
    };
  }

  const curated = loadCurated().find(source => source.sourceId === value);
  if (curated) return { source: { sourceId: curated.sourceId, sourceVersion: curated.sourceVersion, title: curated.title, pages: null, text: curated.text } };
  return { error: { code: 'unknown_source', reason: `Nguồn "${value}" không có trong danh sách nguồn đã duyệt.`, nextAction: 'Chọn một trang slide hoặc nguồn đã duyệt.' } };
}

module.exports = { DECKS, parsePages, resolveSource };
