'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { loadAll, translationMap, saveArea } = require('../lib/ko');

test('saveArea/loadAll/translationMap 왕복, 빈 번역은 맵에서 제외', () => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'bbko-'));
  saveArea(d, 'ui', {
    aaa: { en: 'Hello', ko: '안녕', source: 'a.ts' },
    bbb: { en: 'World', ko: '', source: 'a.ts' },
  });
  const all = loadAll(d);
  assert.equal(all.size, 2);
  assert.equal(all.get('aaa').area, 'ui');
  assert.deepEqual([...translationMap(d)], [['aaa', '안녕']]);
});

test('디렉터리가 없으면 빈 맵', () => {
  assert.equal(loadAll(path.join(os.tmpdir(), 'bbko-없음-' + Date.now())).size, 0);
});
