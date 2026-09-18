'use strict';

// Compares two independent raters on eval/rater_sheet.csv.
// Each rater fills <rater>_label (dùng được | sửa được | không chấp nhận) and <rater>_pass (yes | no)
// WITHOUT seeing the other's columns. Disagreement on pass ≥ 20% of cases means the definition of
// "đạt" is still ambiguous and must be rewritten before it is used as the quality bar.
// Usage: node eval/agreement.cjs

const fs = require('node:fs');
const path = require('node:path');

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
  const headers = rows.shift().map(header => header.replace(/^﻿/, ''));
  return rows.map(values => Object.fromEntries(headers.map((header, index) => [header, (values[index] || '').trim().toLowerCase()])));
}

const rows = parseCsv(fs.readFileSync(path.join(__dirname, 'rater_sheet.csv'), 'utf8'));
const filled = rows.filter(row => row.rater_a_pass && row.rater_b_pass);
if (!filled.length) {
  console.log('Chưa có dữ liệu: hai người chấm cần điền rater_A_* và rater_B_* (chấm độc lập, không xem cột của nhau).');
  process.exit(0);
}
const passDiff = filled.filter(row => row.rater_a_pass !== row.rater_b_pass);
const labelDiff = filled.filter(row => row.rater_a_label !== row.rater_b_label);
const rate = passDiff.length / filled.length;
console.log(`Đã chấm: ${filled.length}/${rows.length} output`);
console.log(`Lệch đạt/không đạt: ${passDiff.length}/${filled.length} (${(rate * 100).toFixed(0)}%) → ${passDiff.map(row => row.case_id).join(', ') || 'không có'}`);
console.log(`Lệch mức 3 bậc: ${labelDiff.length}/${filled.length} → ${labelDiff.map(row => row.case_id).join(', ') || 'không có'}`);
console.log(rate >= 0.2
  ? 'KẾT LUẬN: lệch ≥20% — định nghĩa "đạt" còn mơ hồ. Thảo luận các case lệch, viết lại tiêu chí, rồi chấm lại.'
  : 'KẾT LUẬN: lệch <20% — định nghĩa "đạt" đủ rõ để dùng.');
