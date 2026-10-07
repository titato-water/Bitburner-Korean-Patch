'use strict';
const fs = require('fs');
const path = require('path');
const C = require('../lib/config');
const { pickTodo } = require('../lib/todo');

const [area, ...rest] = process.argv.slice(2);
if (!area) { console.error('사용법: node tools/todo.js <area> [--chars N] [--offset N] [--grep REGEX]'); process.exit(1); }
const opt = {};
for (let i = 0; i < rest.length; i += 2) opt[rest[i].replace(/^--/, '')] = rest[i + 1];
const obj = JSON.parse(fs.readFileSync(path.join(C.KO_DIR, area + '.json'), 'utf8'));
console.log(JSON.stringify(pickTodo(obj, {
  chars: opt.chars ? Number(opt.chars) : 6000,
  offset: opt.offset ? Number(opt.offset) : 0,
  grep: opt.grep,
}), null, 1));
