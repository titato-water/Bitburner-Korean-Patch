'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { sliceDoc, validateTranslation } = require('../lib/docs');

test('sliceDoc: 이어 붙이면 원문과 같고 각 조각은 한도를 (가능하면) 넘지 않는다', () => {
  const para = 'Lorem ipsum dolor sit amet. '.repeat(10).trim();
  const text = Array.from({ length: 12 }, (_, i) => `## H${i}\n\n${para}\n\n`).join('');
  const parts = sliceDoc(text, 800);
  assert.equal(parts.join(''), text);
  assert.ok(parts.length > 1);
  assert.ok(parts.every((p) => p.length <= 800 + 400));
});

test('sliceDoc: 코드 블록 안에서는 빈 줄이 있어도 자르지 않는다', () => {
  const code = '```js\nconst a = 1;\n\nconst b = 2;\n\nconst c = 3;\n```\n\n';
  const text = 'intro text here.\n\n' + code + 'outro text here.\n';
  const parts = sliceDoc(text, 30);
  assert.equal(parts.join(''), text);
  for (const p of parts) assert.equal((p.match(/```/g) || []).length % 2, 0);
});

test('sliceDoc: 한도보다 큰 단일 문단은 그대로 한 조각이 된다', () => {
  const big = 'x'.repeat(5000) + '\n\n';
  assert.deepEqual(sliceDoc(big, 1000), [big]);
});

test('validateTranslation: 코드 블록과 링크 대상이 같으면 통과', () => {
  const en = 'See [the guide](./guide.md).\n\n```js\nns.hack("n00dles");\n```\n';
  const ko = '[가이드](./guide.md)를 참고하세요.\n\n```js\nns.hack("n00dles");\n```\n';
  assert.deepEqual(validateTranslation(en, ko), []);
});

test('validateTranslation: 코드 블록이 바뀌었거나 링크 대상이 다르면 오류', () => {
  const en = 'See [the guide](./guide.md).\n\n```js\nns.hack("n00dles");\n```\n';
  const bad1 = 'See [가이드](./guide.md).\n\n```js\nns.hack("noodles");\n```\n';
  const bad2 = 'See [가이드](./가이드.md).\n\n```js\nns.hack("n00dles");\n```\n';
  assert.ok(validateTranslation(en, bad1).some((e) => /코드 블록/.test(e)));
  assert.ok(validateTranslation(en, bad2).some((e) => /링크/.test(e)));
});

test('validateTranslation: 링크 순서가 한국어 어순 때문에 바뀌어도 대상 집합이 같으면 통과', () => {
  const en = '[Reputation](r.md) gain for [Companies](c.md) and [Factions](f.md)';
  const ko = '[회사](c.md) 및 [팩션](f.md)의 [평판](r.md) 획득';
  assert.deepEqual(validateTranslation(en, ko), []);
  assert.ok(validateTranslation(en, '[회사](c.md) 및 [팩션](x.md)의 [평판](r.md) 획득').length > 0);
});
