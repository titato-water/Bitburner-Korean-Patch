'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { SourceMapGenerator } = require('source-map');
const { makeSourceOf } = require('../lib/sourceof');

function mapFile(sources) {
  const g = new SourceMapGenerator({ file: 'x.js' });
  sources.forEach((s, i) => {
    g.addMapping({ generated: { line: 1, column: i * 10 }, original: { line: 1, column: 0 }, source: s });
  });
  const f = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'bbko-')), 'x.map');
  fs.writeFileSync(f, g.toString());
  return f;
}

test('webpack:///./src/ 와 webpack:///src/ 모두 src 기준 상대경로로 돌려준다', async () => {
  const sourceOf = await makeSourceOf(mapFile([
    'webpack:///./src/Terminal/Terminal.ts',
    'webpack:///src/Augmentation/Augmentations.ts',
  ]));
  assert.equal(sourceOf({ line: 1, column: 0 }), 'Terminal/Terminal.ts');
  assert.equal(sourceOf({ line: 1, column: 10 }), 'Augmentation/Augmentations.ts');
});

test('ThirdParty, node_modules, .d.ts, 매핑 없음은 null', async () => {
  const sourceOf = await makeSourceOf(mapFile([
    'webpack:///./src/ThirdParty/JSInterpreter.js',
    'webpack:///node_modules/react/index.js',
    'webpack:///./src/global.d.ts',
  ]));
  assert.equal(sourceOf({ line: 1, column: 0 }), null);
  assert.equal(sourceOf({ line: 1, column: 10 }), null);
  assert.equal(sourceOf({ line: 1, column: 20 }), null);
  assert.equal(sourceOf({ line: 5, column: 0 }), null);
});
