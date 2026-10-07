'use strict';
const fs = require('fs');
const path = require('path');

function areaFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => path.join(dir, f));
}

function loadAll(dir) {
  const m = new Map();
  for (const f of areaFiles(dir)) {
    const area = path.basename(f, '.json');
    const obj = JSON.parse(fs.readFileSync(f, 'utf8'));
    for (const [id, v] of Object.entries(obj)) m.set(id, { ...v, area });
  }
  return m;
}

function translationMap(dir) {
  const t = new Map();
  for (const [id, v] of loadAll(dir)) if (v.ko) t.set(id, v.ko);
  return t;
}

function saveArea(dir, area, obj) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, area + '.json'), JSON.stringify(obj, null, 1) + '\n', 'utf8');
}

module.exports = { loadAll, translationMap, saveArea };
