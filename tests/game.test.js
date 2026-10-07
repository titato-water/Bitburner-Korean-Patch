'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { readBase, MARKER } = require('../lib/game');

function tmp() { return fs.mkdtempSync(path.join(os.tmpdir(), 'bbko-')); }

test('원본 번들이면 .orig를 만들고 그대로 반환한다', () => {
  const d = tmp(); const b = path.join(d, 'main.bundle.js');
  fs.writeFileSync(b, 'ORIGINAL');
  assert.equal(readBase(b), 'ORIGINAL');
  assert.equal(fs.readFileSync(b + '.orig', 'utf8'), 'ORIGINAL');
});

test('패치된 번들이면 .orig를 반환한다 (멱등)', () => {
  const d = tmp(); const b = path.join(d, 'main.bundle.js');
  fs.writeFileSync(b + '.orig', 'ORIGINAL');
  fs.writeFileSync(b, MARKER + 'PATCHED');
  assert.equal(readBase(b), 'ORIGINAL');
  assert.equal(readBase(b), 'ORIGINAL');
});

test('패치된 번들인데 .orig가 없으면 오류', () => {
  const d = tmp(); const b = path.join(d, 'main.bundle.js');
  fs.writeFileSync(b, MARKER + 'PATCHED');
  assert.throws(() => readBase(b), /\.orig/);
});

test('게임 업데이트로 새 원본이 오면 .orig를 갱신한다', () => {
  const d = tmp(); const b = path.join(d, 'main.bundle.js');
  fs.writeFileSync(b + '.orig', 'OLD');
  fs.writeFileSync(b, 'NEW_ORIGINAL');
  assert.equal(readBase(b), 'NEW_ORIGINAL');
  assert.equal(fs.readFileSync(b + '.orig', 'utf8'), 'NEW_ORIGINAL');
});
