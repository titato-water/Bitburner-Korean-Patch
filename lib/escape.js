'use strict';

// JS 문자열/템플릿 리터럴 본문용 이스케이프. 출력은 ASCII only.
function escapeChars(s, isTemplate) {
  let out = '';
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    const code = s.charCodeAt(i);
    if (c === '\\') out += '\\\\';
    else if (c === '\n') out += '\\n';
    else if (c === '\r') out += '\\r';
    else if (code < 0x20 || code > 0x7e) out += '\\u' + code.toString(16).padStart(4, '0');
    else if (!isTemplate && c === '"') out += '\\"';
    else if (isTemplate && c === '`') out += '\\`';
    else if (isTemplate && c === '$' && s[i + 1] === '{') out += '\\$';
    else out += c;
  }
  return out;
}

module.exports = { escapeChars };
