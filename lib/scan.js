'use strict';
const acorn = require('acorn');
const walk = require('acorn-walk');
const crypto = require('crypto');
const { escapeChars } = require('./escape');

const COMPARE_OPS = new Set(['===', '!==', '==', '!=', 'in']);
const IDENT_LIKE = /^[A-Za-z_$][\w$]*$/;
// 첫 인자가 키/식별자로 쓰이는 메서드들
const KEY_METHODS = new Set([
  'includes', 'indexOf', 'lastIndexOf', 'startsWith', 'endsWith', 'hasOwnProperty',
  'has', 'get', 'set', 'delete', 'getItem', 'setItem', 'removeItem',
  'addEventListener', 'removeEventListener', 'querySelector', 'querySelectorAll',
  'createElement', 'getElementById', 'getAttribute', 'setAttribute', 'postMessage',
  'on', 'once', 'emit', 'send', 'invoke', 'handle', 'matches', 'test',
]);
// 모든 인자가 코드용인 호출
const CALLEE_NAMES = new Set(['require', '__webpack_require__', 'Symbol', 'RegExp', 'Function', 'eval']);

const DEFAULT_EXCLUDE_REGEX = [/monospace/i, /sans-serif/i, /\bserif\b/i];

const AREAS = [
  ['docs', /^Documentation\//],
  ['story', /^(Literature|BitNode|Faction\/FactionInfo)/],
  ['game', /^(Augmentation|Faction|Company|Corporation|Bladeburner|Gang|Sleeve|StockMarket|Hacknet|Work|Server|Casino|Go|Infiltration|Achievements|Programs|CodingContract|PersonObjects|Location|Locations|Sidebar)\//],
];

function makeId(text) {
  return crypto.createHash('sha1').update(text).digest('hex').slice(0, 12);
}

function areaOf(source) {
  if (!source) return 'ui';
  for (const [name, re] of AREAS) if (re.test(source)) return name;
  return 'ui';
}

function parseCode(code) {
  const base = { ecmaVersion: 'latest', locations: true, allowReturnOutsideFunction: true };
  try {
    return acorn.parse(code, { ...base, sourceType: 'script' });
  } catch {
    return acorn.parse(code, { ...base, sourceType: 'module' });
  }
}

function isKeyCall(call, node) {
  const callee = call.callee;
  if (callee.type === 'Identifier' && CALLEE_NAMES.has(callee.name)) return true;
  if (callee.type === 'MemberExpression' && !callee.computed && callee.property.type === 'Identifier') {
    return KEY_METHODS.has(callee.property.name) && call.arguments[0] === node;
  }
  return false;
}

function isProtectedContext(node, anc) {
  const parent = anc[anc.length - 2];
  if (!parent) return false;
  switch (parent.type) {
    case 'Property':
    case 'PropertyDefinition':
    case 'MethodDefinition':
      return parent.key === node && !parent.computed;
    case 'MemberExpression':
      return parent.computed && parent.property === node;
    case 'BinaryExpression': {
      if (COMPARE_OPS.has(parent.operator)) return true;
      // "BitNode" + n 처럼 식별자형 단어에 변수를 이어 붙여 만드는 키 접두사/접미사
      if (parent.operator !== '+' || !IDENT_LIKE.test(node.value)) return false;
      const other = parent.left === node ? parent.right : parent.left;
      return other.type !== 'Literal';
    }
    case 'SwitchCase':
      return parent.test === node;
    case 'ExpressionStatement':
      return !!parent.directive;
    case 'ImportDeclaration':
    case 'ExportAllDeclaration':
    case 'ExportNamedDeclaration':
    case 'ImportExpression':
      return true;
    case 'CallExpression':
    case 'NewExpression':
      return isKeyCall(parent, node);
    case 'ArrayExpression': {
      const gp = anc[anc.length - 3];
      return !!gp && gp.type === 'MemberExpression' && gp.object === parent &&
        !gp.computed && gp.property.type === 'Identifier' && KEY_METHODS.has(gp.property.name);
    }
    default:
      return false;
  }
}

function buildExclude(exclude) {
  const texts = new Set((exclude && exclude.texts) || []);
  const regex = DEFAULT_EXCLUDE_REGEX.concat(((exclude && exclude.regex) || []).map((r) => new RegExp(r)));
  const sources = ((exclude && exclude.sources) || []).map((r) => new RegExp(r));
  const include = new Set((exclude && exclude.include) || []);
  return { texts, regex, sources, include };
}

function isTranslatable(rawText, ex) {
  if (ex.include.has(rawText)) return true;
  const text = rawText.replace(/\{\d+\}/g, ' ').trim();
  if (!/[A-Za-z]{2}/.test(text)) return false;
  if (ex.texts.has(rawText)) return false;
  if (ex.regex.some((re) => re.test(rawText))) return false;
  if (/^https?:\/\//.test(text)) return false;
  if (!/\s/.test(text)) {
    return /^[A-Z][a-z][A-Za-z'’-]*[.!?:]?$/.test(text);
  }
  const tokens = text.split(/\s+/);
  if (tokens.length <= 3 && tokens.every((t) => /^[a-z][\w:-]*$/.test(t))) return false; // className 류
  if (/^[\d.\s]+(px|em|rem|%|s|ms)\b/.test(text)) return false;
  if (/^\s*[\w-]+\s*:\s*[^;]+;/.test(text)) return false; // CSS 선언
  return true;
}

// 게임 내 문서(마크다운). API Documenter가 자동 생성한 참고서는 제외한다.
function isMarkdownDoc(v) {
  if (v.startsWith('<!-- Do not edit')) return false;
  return /^#{1,3}\s\S/m.test(v);
}

function docTitle(v) {
  const m = /^#{1,3}\s+(.+)$/m.exec(v);
  return m ? m[1].trim() : 'untitled';
}

function scan(code, opts = {}) {
  const ast = parseCode(code);
  const ex = buildExclude(opts.exclude);
  const protectedTexts = new Set();
  const found = [];
  const docs = [];
  const fontEdits = [];

  walk.ancestor(ast, {
    // 식별자로 쓰인 속성/멤버 이름은 조회 키일 수 있으므로 같은 텍스트를 보호한다 (예: O = {Hack: ...}; O[name])
    Property(node) {
      if (!node.computed && node.key.type === 'Identifier') protectedTexts.add(node.key.name);
    },
    PropertyDefinition(node) {
      if (!node.computed && node.key.type === 'Identifier') protectedTexts.add(node.key.name);
    },
    MemberExpression(node) {
      if (!node.computed && node.property.type === 'Identifier') protectedTexts.add(node.property.name);
    },
    Literal(node, _s, anc) {
      if (typeof node.value !== 'string') return;
      const parent = anc[anc.length - 2];
      // webpack raw 모듈: x.exports = "<문자열>" — 마크다운 문서만 docs 항목으로, 그 외(이미지 data URI 등)는 번역하지 않는다
      if (parent && parent.type === 'AssignmentExpression' && parent.right === node &&
          parent.left.type === 'MemberExpression' && !parent.left.computed &&
          parent.left.property.name === 'exports') {
        if (isMarkdownDoc(node.value)) docs.push({ node, text: node.value });
        return;
      }
      const isMonacoFont = parent && parent.type === 'Property' && parent.value === node &&
        !parent.computed && parent.key.name === 'MonacoFontFamily';
      if (isMonacoFont || (/monospace/i.test(node.value) && node.value.includes(','))) {
        fontEdits.push({
          start: node.start,
          end: node.end,
          text: '"' + escapeChars('"D2Coding KO", ' + node.value, false) + '"',
        });
        return;
      }
      if (isProtectedContext(node, anc)) {
        protectedTexts.add(node.value);
        return;
      }
      found.push({ node, text: node.value, kind: 'string', exprs: [] });
    },
    TemplateLiteral(node, _s, anc) {
      const parent = anc[anc.length - 2];
      if (parent && parent.type === 'TaggedTemplateExpression') return;
      const parts = node.quasis.map((q) => q.value.cooked);
      if (parts.some((p) => p == null)) return;
      let text = parts[0];
      node.expressions.forEach((e, i) => { text += `{${i}}` + parts[i + 1]; });
      found.push({
        node, text, kind: 'template',
        exprs: node.expressions.map((e) => code.slice(e.start, e.end)),
      });
    },
  });

  const entries = [];
  for (const f of found) {
    if (protectedTexts.has(f.text)) continue;
    if (!isTranslatable(f.text, ex)) continue;
    let source = null;
    if (opts.sourceOf) {
      source = opts.sourceOf(f.node.loc.start);
      if (!source) continue;
      if (ex.sources.some((re) => re.test(source))) continue;
    }
    entries.push({
      id: makeId(f.text), en: f.text, kind: f.kind,
      start: f.node.start, end: f.node.end, exprs: f.exprs,
      source, area: areaOf(source),
    });
  }
  for (const d of docs) {
    const source = 'doc:' + docTitle(d.text);
    if (ex.sources.some((re) => re.test(source))) continue;
    entries.push({
      id: makeId(d.text), en: d.text, kind: 'string',
      start: d.node.start, end: d.node.end, exprs: [],
      source, area: 'docs',
    });
  }
  return { entries, fontEdits, protectedTexts };
}

module.exports = { scan, makeId, areaOf, parseCode, isTranslatable, buildExclude };
