'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const acorn = require('acorn');
const { scan } = require('../lib/scan');
const { applyTranslations, checkPlaceholders } = require('../lib/patch');

function run(code, ko, extra) {
  const { entries, fontEdits } = scan(code);
  const tr = new Map();
  for (const e of entries) if (ko[e.en]) tr.set(e.id, ko[e.en]);
  return applyTranslations(code, entries, tr, extra ? fontEdits : []);
}
const evalWith = (code, ...args) => {
  let got;
  new Function('f', ...args.map((_, i) => 'a' + i), code)((x) => { got = x; }, ...args);
  return got;
};

test('문자열을 ASCII 이스케이프 리터럴로 치환한다', () => {
  const r = run('f("Hello world");', { 'Hello world': '안녕 세계' });
  assert.equal(r.applied, 1);
  assert.match(r.code, /^[\x00-\x7f]*$/);
  assert.equal(evalWith(r.code), '안녕 세계');
});

test('따옴표/역슬래시/줄바꿈이 있어도 유효한 문자열이 된다', () => {
  const ko = '그는 "안녕" 이라 말했다 \\ 다음줄\n끝';
  const r = run('f("Hello world");', { 'Hello world': ko });
  assert.equal(evalWith(r.code), ko);
});

test('템플릿은 플레이스홀더를 원래 식으로 되돌린다 (순서 변경/중복 허용)', () => {
  const code = 'f(`You have ${a0} servers and ${a1} ports`);';
  const r = run(code, { 'You have {0} servers and {1} ports': '포트 {1}개, 서버 {0}개 ({0})' });
  assert.equal(evalWith(r.code, 3, 5), '포트 5개, 서버 3개 (3)');
});

test('템플릿 번역문의 백틱, ${, 역슬래시를 이스케이프한다', () => {
  const code = 'f(`Value is ${a0} now`);';
  const r = run(code, { 'Value is {0} now': '값 `{0}` ${x} \\ 입니다' });
  assert.equal(evalWith(r.code, 7), '값 `7` ${x} \\ 입니다');
});

test('플레이스홀더를 빠뜨린 번역은 거부하고 원문을 유지한다', () => {
  const code = 'f(`You have ${a0} servers`);';
  const r = run(code, { 'You have {0} servers': '서버가 있습니다' });
  assert.equal(r.applied, 0);
  assert.equal(r.rejected.length, 1);
  assert.equal(r.code, code);
});

test('checkPlaceholders: 문자열 엔트리는 {n} 검사를 하지 않는다', () => {
  assert.equal(checkPlaceholders({ en: 'Use {0} here', kind: 'string' }, '여기'), null);
  assert.match(checkPlaceholders({ en: 'x {0} {1}', kind: 'template' }, '{0}만'), /\{1\}/);
});

test('템플릿 식 안의 중첩 번역은 건너뛰고 바깥 번역을 유지한다', () => {
  const code = 'f(`Total ${g("Inner text here")} items`);';
  const r = run(code, {
    'Total {0} items': '총 {0}개',
    'Inner text here': '안쪽 텍스트',
  });
  assert.equal(r.applied, 1);
  assert.equal(r.skippedNested, 1);
  const out = new Function('f', 'g', r.code);
  let got; out((x) => { got = x; }, (s) => s);
  assert.equal(got, '총 Inner text here개');
});

test('폰트 편집과 번역 편집이 함께 적용되고 결과가 파싱된다', () => {
  const code = 'f("Hello world"); g("Lucida Console, monospace");';
  const r = run(code, { 'Hello world': '안녕' }, true);
  assert.equal(r.applied, 2);
  assert.ok(acorn.parse(r.code, { ecmaVersion: 'latest' }));
  assert.match(r.code, /D2Coding KO/);
});
