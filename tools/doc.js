'use strict';
// 문서(마크다운) 번역 도구
//   node tools/doc.js list                  문서 목록과 번역 상태
//   node tools/doc.js show <id> [n]         문서의 n번째 조각(기본 1)을 원문 그대로 출력
//   node tools/doc.js put <id>              work/docs-ko/<id>.<n>.md 조각들을 합쳐 ko/docs.json에 반영 (검증 포함)
//   node tools/doc.js putall                work/docs-ko/에 조각이 모두 있는 문서를 전부 반영
const fs = require('fs');
const path = require('path');
const C = require('../lib/config');
const { sliceDoc, validateTranslation } = require('../lib/docs');
const { saveArea } = require('../lib/ko');

const MAX = 12000;
const PART_DIR = path.join(C.WORK_DIR, 'docs-ko');
const file = path.join(C.KO_DIR, 'docs.json');
const read = () => JSON.parse(fs.readFileSync(file, 'utf8'));
const trailing = (s) => (s.match(/\n*$/) || [''])[0].length;

function partPath(id, n) { return path.join(PART_DIR, `${id}.${n}.md`); }

function assemble(id, en) {
  const slices = sliceDoc(en, MAX);
  const parts = [];
  for (let n = 1; n <= slices.length; n++) {
    const p = partPath(id, n);
    if (!fs.existsSync(p)) return { missing: n, total: slices.length };
    let ko = fs.readFileSync(p, 'utf8');
    // 조각 끝의 줄바꿈 수를 원문과 맞춘다
    ko = ko.replace(/\n*$/, '') + '\n'.repeat(trailing(slices[n - 1]));
    parts.push(ko);
  }
  return { ko: parts.join(''), total: slices.length };
}

const [cmd, id, n] = process.argv.slice(2);
const obj = read();
const docs = Object.entries(obj).filter(([, v]) => v.source && v.source.startsWith('doc:'));

if (cmd === 'list') {
  for (const [did, v] of docs.sort((a, b) => b[1].en.length - a[1].en.length)) {
    const total = sliceDoc(v.en, MAX).length;
    console.log(`${did} ${String(v.en.length).padStart(6)}자 조각${total} ${v.ko ? '[번역됨]' : '[미번역]'} ${v.source}`);
  }
} else if (cmd === 'show') {
  const v = obj[id];
  if (!v) { console.error('알 수 없는 ID'); process.exit(1); }
  const slices = sliceDoc(v.en, MAX);
  const k = Number(n || 1);
  console.log(`<<< ${id} ${v.source} 조각 ${k}/${slices.length} >>>`);
  process.stdout.write(slices[k - 1]);
  console.log('\n<<< 끝 >>>');
} else if (cmd === 'put' || cmd === 'putall') {
  const targets = cmd === 'put' ? [[id, obj[id]]] : docs.filter(([, v]) => !v.ko);
  let done = 0;
  for (const [did, v] of targets) {
    if (!v) { console.error('알 수 없는 ID: ' + did); process.exit(1); }
    const r = assemble(did, v.en);
    if (r.missing) {
      if (cmd === 'put') { console.error(`조각 ${r.missing}/${r.total} 파일이 없습니다: ${partPath(did, r.missing)}`); process.exit(1); }
      continue;
    }
    const errors = validateTranslation(v.en, r.ko);
    if (errors.length) { console.error(`${did} (${v.source}) 검증 실패:\n  ` + errors.join('\n  ')); process.exit(1); }
    obj[did] = { ...v, ko: r.ko };
    done++;
  }
  saveArea(C.KO_DIR, 'docs', obj);
  console.log(`문서 ${done}건 반영`);
} else {
  console.error('사용법: node tools/doc.js list | show <id> [n] | put <id> | putall');
  process.exit(1);
}
