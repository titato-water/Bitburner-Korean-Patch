'use strict';
const fs = require('fs');
const path = require('path');
const acorn = require('acorn');
const C = require('./lib/config');
const { scan } = require('./lib/scan');
const { applyTranslations } = require('./lib/patch');
const { readBase } = require('./lib/game');
const { translationMap, loadAll } = require('./lib/ko');
const { makeSourceOf } = require('./lib/sourceof');
const { buildOutput } = require('./lib/font');

const FONT_FILES = ['D2Coding.ttf', 'D2CodingBold.ttf'];

async function main() {
  const base = readBase(C.BUNDLE);
  const sourceOf = await makeSourceOf(C.MAP);
  let exclude;
  const exFile = path.join(__dirname, 'exclude.json');
  if (fs.existsSync(exFile)) exclude = JSON.parse(fs.readFileSync(exFile, 'utf8'));

  const { entries, fontEdits } = scan(base, { sourceOf, exclude });
  const tr = translationMap(C.KO_DIR);

  const haveFont = FONT_FILES.every((f) => fs.existsSync(path.join(C.FONT_DIR, f)));
  if (!haveFont) console.warn('경고: font/ 에 D2Coding 파일이 없어 폰트 적용을 건너뜁니다.');

  const res = applyTranslations(base, entries, tr, haveFont ? fontEdits : []);
  const out = buildOutput(res.code, haveFont);

  try {
    acorn.parse(out, { ecmaVersion: 'latest', allowReturnOutsideFunction: true });
  } catch (e) {
    console.error('패치 결과가 구문 오류입니다. 아무것도 쓰지 않았습니다: ' + e.message);
    process.exit(1);
  }

  fs.writeFileSync(C.BUNDLE, out, 'utf8');
  if (haveFont) for (const f of FONT_FILES) fs.copyFileSync(path.join(C.FONT_DIR, f), path.join(C.DIST, f));

  const all = loadAll(C.KO_DIR);
  const untranslated = entries.filter((e) => !tr.has(e.id)).length;
  fs.mkdirSync(C.WORK_DIR, { recursive: true });
  const report = {
    gameVersion: fs.existsSync(C.VERSION_FILE) ? fs.readFileSync(C.VERSION_FILE, 'utf8').trim() : null,
    applied: res.applied, skippedNested: res.skippedNested, rejected: res.rejected,
    untranslatedEntries: untranslated, koEntries: all.size, font: haveFont,
  };
  fs.writeFileSync(path.join(C.WORK_DIR, 'last-apply.json'), JSON.stringify(report, null, 1));
  console.log('적용 완료:', JSON.stringify({ ...report, rejected: report.rejected.length }));
  if (res.rejected.length) console.warn('거부된 번역 ' + res.rejected.length + '건: work/last-apply.json 참고');
}

main().catch((e) => { console.error(e); process.exit(1); });
