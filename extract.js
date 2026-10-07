'use strict';
const fs = require('fs');
const path = require('path');
const C = require('./lib/config');
const { scan } = require('./lib/scan');
const { readBase } = require('./lib/game');
const { loadAll, saveArea } = require('./lib/ko');
const { makeSourceOf } = require('./lib/sourceof');

async function main() {
  const base = readBase(C.BUNDLE);
  const sourceOf = await makeSourceOf(C.MAP);
  let exclude;
  const exFile = path.join(__dirname, 'exclude.json');
  if (fs.existsSync(exFile)) exclude = JSON.parse(fs.readFileSync(exFile, 'utf8'));

  const { entries, protectedTexts } = scan(base, { sourceOf, exclude });
  const existing = loadAll(C.KO_DIR);
  const byArea = {};
  const seen = new Set();
  for (const e of entries) {
    if (seen.has(e.id)) continue;
    seen.add(e.id);
    const prev = existing.get(e.id);
    (byArea[e.area] ||= {})[e.id] = { en: e.en, kind: e.kind, ko: prev ? prev.ko : '', source: e.source };
  }
  const stale = {};
  for (const [id, v] of existing) {
    if (!seen.has(id)) stale[id] = { en: v.en, kind: v.kind, ko: v.ko, source: v.source };
  }
  for (const [area, obj] of Object.entries(byArea)) saveArea(C.KO_DIR, area, obj);
  saveArea(C.KO_DIR, '_stale', stale);

  fs.mkdirSync(C.WORK_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(C.WORK_DIR, 'protected.txt'),
    [...protectedTexts].filter((t) => /[A-Za-z]{2}/.test(t) && /^[A-Z]/.test(t)).sort().join('\n') + '\n',
  );

  console.log('추출 완료: 고유 항목 ' + seen.size + '개');
  for (const [area, obj] of Object.entries(byArea)) {
    const n = Object.keys(obj).length;
    const done = Object.values(obj).filter((v) => v.ko).length;
    console.log(`  ${area}: ${done}/${n}`);
  }
  console.log('  stale(원문 변경으로 미사용): ' + Object.keys(stale).length);
}

main().catch((e) => { console.error(e); process.exit(1); });
