'use strict';
const fs = require('fs');
const path = require('path');
const C = require('./lib/config');

const orig = C.BUNDLE + '.orig';
if (!fs.existsSync(orig)) {
  console.error('.orig 백업이 없어 복원할 수 없습니다 (패치된 적이 없거나 Steam 무결성 검사가 필요합니다).');
  process.exit(1);
}
fs.copyFileSync(orig, C.BUNDLE);
for (const f of ['D2Coding.ttf', 'D2CodingBold.ttf']) {
  const p = path.join(C.DIST, f);
  if (fs.existsSync(p)) fs.unlinkSync(p);
}
console.log('원본으로 복원했습니다.');
