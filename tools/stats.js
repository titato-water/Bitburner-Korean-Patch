'use strict';
const C = require('../lib/config');
const { loadAll } = require('../lib/ko');

const by = {};
for (const v of loadAll(C.KO_DIR).values()) {
  if (v.area === '_stale') continue;
  const s = (by[v.area] ||= { total: 0, done: 0, chars: 0, doneChars: 0 });
  s.total++; s.chars += v.en.length;
  if (v.ko) { s.done++; s.doneChars += v.en.length; }
}
for (const [a, s] of Object.entries(by)) {
  console.log(`${a}: ${s.done}/${s.total} (${(100 * s.doneChars / s.chars).toFixed(1)}% 글자 기준, 총 ${s.chars}자)`);
}
