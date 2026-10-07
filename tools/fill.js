'use strict';
const fs = require('fs');
const path = require('path');
const C = require('../lib/config');
const { mergeFill } = require('../lib/todo');
const { saveArea } = require('../lib/ko');

// 사용법: node tools/fill.js <area> <file.json> [--lenient]
// --lenient: 알 수 없는 ID는 건너뛰고(목록 출력) 나머지만 병합한다. 다른 오류(플레이스홀더 등)는 여전히 중단한다.
const args = process.argv.slice(2);
const lenient = args.includes('--lenient');
const [area, file] = args.filter((a) => !a.startsWith('--'));
if (!area || !file) { console.error('사용법: node tools/fill.js <area> <file.json> [--lenient]'); process.exit(1); }
const obj = JSON.parse(fs.readFileSync(path.join(C.KO_DIR, area + '.json'), 'utf8'));
let fill = JSON.parse(fs.readFileSync(file, 'utf8'));

const unknown = Object.keys(fill).filter((id) => !obj[id]);
if (lenient && unknown.length) {
  console.warn('알 수 없는 ID(건너뜀): ' + unknown.join(' '));
  fill = Object.fromEntries(Object.entries(fill).filter(([id]) => obj[id]));
}
const { merged, errors } = mergeFill(obj, fill);
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
saveArea(C.KO_DIR, area, merged);
console.log(`병합 ${Object.keys(fill).length}건` + (unknown.length && lenient ? `, 건너뜀 ${unknown.length}건` : ''));
