'use strict';

// 마크다운 문서를 문단 경계("\n\n")에서 max자 안팎의 조각으로 나눈다. 코드 블록(```) 안에서는 자르지 않는다.
// 조각을 이어 붙이면 항상 원문과 같다.
function sliceDoc(text, max) {
  const blocks = [];
  let cur = '';
  let inFence = false;
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isLast = i === lines.length - 1;
    cur += line + (isLast ? '' : '\n');
    if (/^\s*```/.test(line)) inFence = !inFence;
    // 문단 끝: 빈 줄이고 코드 블록 밖
    if (!inFence && line === '' && !isLast) {
      blocks.push(cur);
      cur = '';
    }
  }
  if (cur) blocks.push(cur);

  const parts = [];
  let acc = '';
  for (const b of blocks) {
    if (acc && acc.length + b.length > max) {
      parts.push(acc);
      acc = '';
    }
    acc += b;
  }
  if (acc) parts.push(acc);
  return parts;
}

function codeBlocks(s) {
  return s.match(/```[\s\S]*?```/g) || [];
}

function linkTargets(s) {
  return [...s.matchAll(/\]\(([^)\s]+)[^)]*\)/g)].map((m) => m[1]);
}

// 번역문이 코드 블록과 링크 대상을 보존했는지 검사한다. 오류 메시지 배열을 반환한다 (비어 있으면 통과).
function validateTranslation(en, ko) {
  const errors = [];
  const a = codeBlocks(en);
  const b = codeBlocks(ko);
  if (a.length !== b.length) {
    errors.push(`코드 블록 개수가 다릅니다 (원문 ${a.length}, 번역 ${b.length})`);
  } else {
    a.forEach((blk, i) => {
      if (blk !== b[i]) errors.push(`코드 블록 ${i + 1}번이 원문과 다릅니다`);
    });
  }
  // 한국어 어순 때문에 링크 순서가 바뀔 수 있으므로 정렬해서 비교한다
  const la = linkTargets(en).sort();
  const lb = linkTargets(ko).sort();
  if (la.length !== lb.length || la.some((t, i) => t !== lb[i])) {
    const count = (arr) => arr.reduce((m, t) => m.set(t, (m.get(t) || 0) + 1), new Map());
    const ca = count(la);
    const cb = count(lb);
    const diff = [];
    for (const t of new Set([...ca.keys(), ...cb.keys()])) {
      const d = (cb.get(t) || 0) - (ca.get(t) || 0);
      if (d > 0) diff.push(`${t} +${d}`);
      if (d < 0) diff.push(`${t} ${d}`);
    }
    errors.push(`링크 대상이 원문과 다릅니다 (원문 ${la.length}개, 번역 ${lb.length}개): ${diff.join(', ')}`);
  }
  return errors;
}

module.exports = { sliceDoc, validateTranslation };
