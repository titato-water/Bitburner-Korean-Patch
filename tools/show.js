'use strict';
// 번역 작업용: 미번역 청크를 한 줄씩 출력한다. 사용법: node tools/show.js <area> [chars]
const fs = require('fs');
const path = require('path');
const C = require('../lib/config');
const { pickTodo } = require('../lib/todo');

const [area, chars] = process.argv.slice(2);
const obj = JSON.parse(fs.readFileSync(path.join(C.KO_DIR, area + '.json'), 'utf8'));
for (const x of pickTodo(obj, { chars: Number(chars || 14000) })) {
  console.log(x.id + ' ' + JSON.stringify(x.en) + '  <' + x.source.split('/').pop() + '>');
}
