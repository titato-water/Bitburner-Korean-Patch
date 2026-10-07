'use strict';
const { checkPlaceholders } = require('./patch');

function pickTodo(areaObj, { chars = 6000, offset = 0, grep } = {}) {
  const re = grep ? new RegExp(grep) : null;
  const list = Object.entries(areaObj)
    .filter(([, v]) => !v.ko && (!re || re.test(v.en)))
    .slice(offset);
  const out = [];
  let used = 0;
  for (const [id, v] of list) {
    if (out.length && used + v.en.length > chars) break;
    out.push({ id, en: v.en, source: v.source });
    used += v.en.length;
  }
  return out;
}

function mergeFill(areaObj, fill) {
  const merged = { ...areaObj };
  const errors = [];
  for (const [id, value] of Object.entries(fill)) {
    const cur = merged[id];
    if (!cur) { errors.push(`알 수 없는 ID: ${id}`); continue; }
    const ko = value === '=' ? cur.en : value; // "="는 원문 유지
    const bad = checkPlaceholders({ en: cur.en, kind: cur.kind }, ko);
    if (bad) { errors.push(`${id}: ${bad}`); continue; }
    merged[id] = { ...cur, ko };
  }
  return { merged, errors };
}

module.exports = { pickTodo, mergeFill };
