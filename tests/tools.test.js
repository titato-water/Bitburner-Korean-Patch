'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { pickTodo, mergeFill } = require('../lib/todo');

const area = {
  a1: { en: 'First text', ko: '', source: 's' },
  a2: { en: 'Second text', ko: '두 번째', source: 's' },
  a3: { en: 'Third text', ko: '', source: 's' },
  a4: { en: 'Fourth ' + 'x'.repeat(50), ko: '', source: 's' },
};

test('pickTodo는 미번역만 글자 예산 안에서 고른다 (최소 1개)', () => {
  assert.deepEqual(pickTodo(area, { chars: 25 }).map((x) => x.id), ['a1', 'a3']);
  assert.deepEqual(pickTodo(area, { chars: 1 }).map((x) => x.id), ['a1']);
});

test('pickTodo의 offset과 grep', () => {
  assert.deepEqual(pickTodo(area, { chars: 1000, offset: 1 }).map((x) => x.id), ['a3', 'a4']);
  assert.deepEqual(pickTodo(area, { chars: 1000, grep: 'Third' }).map((x) => x.id), ['a3']);
});

test('mergeFill은 병합하고, 알 수 없는 ID/플레이스홀더 오류는 errors로 반환한다', () => {
  const t = { b1: { en: 'You have {0} items', kind: 'template', ko: '', source: 's' } };
  const bad = mergeFill(t, { zzz: '없음', b1: '아이템이 있습니다' });
  assert.equal(bad.errors.length, 2);
  const ok = mergeFill(t, { b1: '아이템 {0}개' });
  assert.deepEqual(ok.errors, []);
  assert.equal(ok.merged.b1.ko, '아이템 {0}개');
});

test('mergeFill: "="는 원문 유지로 저장된다', () => {
  const t = { c1: { en: 'calc(1px)', kind: 'string', ko: '', source: 's' } };
  const r = mergeFill(t, { c1: '=' });
  assert.deepEqual(r.errors, []);
  assert.equal(r.merged.c1.ko, 'calc(1px)');
});
