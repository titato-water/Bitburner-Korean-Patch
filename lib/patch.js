'use strict';
const { escapeChars } = require('./escape');

function placeholderSet(s) {
  return new Set([...s.matchAll(/\{(\d+)\}/g)].map((m) => m[1]));
}

function checkPlaceholders(entry, ko) {
  if (entry.kind !== 'template') return null;
  const need = placeholderSet(entry.en);
  const have = placeholderSet(ko);
  for (const n of need) if (!have.has(n)) return `플레이스홀더 {${n}} 누락`;
  for (const n of have) if (!need.has(n)) return `알 수 없는 플레이스홀더 {${n}}`;
  return null;
}

function render(entry, ko) {
  if (entry.kind === 'string') return '"' + escapeChars(ko, false) + '"';
  const parts = ko.split(/\{(\d+)\}/);
  let out = '`';
  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 0) out += escapeChars(parts[i], true);
    else out += '${' + entry.exprs[Number(parts[i])] + '}';
  }
  return out + '`';
}

function applyTranslations(code, entries, tr, extraEdits = []) {
  const edits = extraEdits.slice();
  const rejected = [];
  for (const e of entries) {
    const ko = tr.get(e.id);
    if (!ko) continue;
    const bad = checkPlaceholders(e, ko);
    if (bad) { rejected.push({ id: e.id, reason: bad }); continue; }
    edits.push({ start: e.start, end: e.end, text: render(e, ko) });
  }
  edits.sort((a, b) => a.start - b.start || b.end - a.end);

  let out = '';
  let pos = 0;
  let applied = 0;
  let skippedNested = 0;
  for (const ed of edits) {
    if (ed.start < pos) { skippedNested++; continue; }
    out += code.slice(pos, ed.start) + ed.text;
    pos = ed.end;
    applied++;
  }
  out += code.slice(pos);
  return { code: out, applied, skippedNested, rejected };
}

module.exports = { applyTranslations, checkPlaceholders, render };
