'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('vm');
const { prelude } = require('../lib/font');
const { MARKER } = require('../lib/game');

function run(src, readyState = 'loading') {
  const appended = [];
  const listeners = {};
  const document = {
    readyState,
    currentScript: { src },
    head: { appendChild: (n) => appended.push(n) },
    createElement: () => ({ textContent: '' }),
    addEventListener: (ev, fn) => { listeners[ev] = fn; },
  };
  vm.runInNewContext(prelude(), { document });
  return { appended, listeners };
}

const SRC = 'file:///C:/Program%20Files%20(x86)/Steam/Bitburner/resources/app/dist/main.bundle.js';

test('prelude는 MARKER로 시작한다', () => {
  assert.ok(prelude().startsWith(MARKER));
});

test('로딩 중에는 DOMContentLoaded까지 스타일 주입을 미룬다', () => {
  const { appended, listeners } = run(SRC, 'loading');
  assert.equal(appended.length, 0);
  listeners.DOMContentLoaded();
  assert.equal(appended.length, 1);
});

test('이미 로드됐으면 즉시 주입한다', () => {
  assert.equal(run(SRC, 'complete').appended.length, 1);
});

test('url()은 따옴표로 감싸 괄호가 있는 경로도 유효하다', () => {
  const css = run(SRC, 'complete').appended[0].textContent;
  assert.match(css, /url\("file:\/\/\/C:\/Program%20Files%20\(x86\)\/Steam\/Bitburner\/resources\/app\/dist\/D2Coding\.ttf"\)/);
  assert.match(css, /D2CodingBold\.ttf"\)/);
});

test('JetBrainsMono와 D2Coding KO 이름을 모두 D2Coding으로 정의한다', () => {
  const css = run(SRC, 'complete').appended[0].textContent;
  assert.match(css, /font-family:"JetBrainsMono"/);
  assert.match(css, /font-family:"D2Coding KO"/);
});

test('currentScript가 없으면 아무것도 하지 않는다', () => {
  const document = { readyState: 'complete', currentScript: null, head: { appendChild() { throw new Error('x'); } }, createElement() {}, addEventListener() {} };
  assert.doesNotThrow(() => vm.runInNewContext(prelude(), { document }));
});

test('renameGameFont는 게임 자체의 JetBrainsMono @font-face 선언 이름을 바꾼다', () => {
  const { renameGameFont } = require('../lib/font');
  const code = 'c.push([e.id,`@font-face {\n  font-family: "JetBrainsMono";\n  src: url(${u})}`]);' +
    "sourcesContent:['@font-face {\n  font-family: \"JetBrainsMono\";}'];" +
    'x={fontFamily:\'JetBrainsMono, "Courier New", monospace\'};';
  const out = renameGameFont(code);
  assert.equal(out.split('font-family: "JetBrainsMono Orig"').length - 1, 2);
  assert.ok(out.includes("fontFamily:'JetBrainsMono, \"Courier New\", monospace'"));
});

test('buildOutput: 폰트 있으면 prelude+게임 폰트 이름 변경, 없으면 마커만 붙인다', () => {
  const { buildOutput } = require('../lib/font');
  const code = 'x=`font-family: "JetBrainsMono";`;';
  const withFont = buildOutput(code, true);
  assert.ok(withFont.startsWith(MARKER));
  assert.ok(withFont.includes('font-family: "JetBrainsMono Orig"'));
  assert.equal(buildOutput(code, false), MARKER + '\n' + code);
});
