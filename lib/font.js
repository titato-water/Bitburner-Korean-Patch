'use strict';
const { MARKER } = require('./game');

// 번들 앞에 붙는 코드. toString()으로 직렬화되므로 외부 변수를 참조하면 안 된다.
// 게임 CSS보다 뒤에 등록되어야 같은 이름("JetBrainsMono")의 @font-face를 덮어쓰므로 DOMContentLoaded에 주입한다.
function injector() {
  try {
    var s = document.currentScript && document.currentScript.src;
    if (!s) return;
    var base = s.slice(0, s.lastIndexOf('/') + 1);
    var inject = function () {
      try {
        var faces = '';
        var names = ['JetBrainsMono', 'D2Coding KO'];
        for (var i = 0; i < names.length; i++) {
          faces += '@font-face{font-family:"' + names[i] + '";font-weight:400;src:url("' + base + 'D2Coding.ttf") format("truetype")}' +
            '@font-face{font-family:"' + names[i] + '";font-weight:700;src:url("' + base + 'D2CodingBold.ttf") format("truetype")}';
        }
        var st = document.createElement('style');
        st.textContent = faces;
        document.head.appendChild(st);
      } catch (e) { /* 폰트 실패는 게임 실행에 영향 없음 */ }
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inject);
    else inject();
  } catch (e) { /* 폰트 실패는 게임 실행에 영향 없음 */ }
}

function prelude() {
  return MARKER + '(' + injector.toString() + ')();\n';
}

// 게임 CSS가 지연 주입되어 같은 이름의 @font-face 순서 싸움에서 지므로, 게임 쪽 선언 이름을 바꿔 우리 선언만 남긴다.
function renameGameFont(code) {
  return code.split('font-family: "JetBrainsMono"').join('font-family: "JetBrainsMono Orig"');
}

function buildOutput(code, haveFont) {
  return haveFont ? prelude() + renameGameFont(code) : MARKER + '\n' + code;
}

module.exports = { prelude, renameGameFont, buildOutput };
