'use strict';
const fs = require('fs');

const MARKER = '/*bitburner-ko:patched*/';

// 패치 전 원본 코드를 반환한다. 현재 번들이 패치본이면 .orig를, 새 원본이면 .orig를 갱신하고 그 내용을 쓴다.
function readBase(bundlePath) {
  const orig = bundlePath + '.orig';
  const cur = fs.readFileSync(bundlePath, 'utf8');
  if (cur.startsWith(MARKER)) {
    if (!fs.existsSync(orig)) {
      throw new Error('패치된 번들인데 .orig 백업이 없습니다. Steam에서 게임 파일 무결성 검사를 실행하세요.');
    }
    return fs.readFileSync(orig, 'utf8');
  }
  fs.writeFileSync(orig, cur);
  return cur;
}

module.exports = { MARKER, readBase };
