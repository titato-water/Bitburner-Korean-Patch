'use strict';
const fs = require('fs');
const { SourceMapConsumer } = require('source-map');

async function makeSourceOf(mapPath) {
  const consumer = await new SourceMapConsumer(JSON.parse(fs.readFileSync(mapPath, 'utf8')));
  return ({ line, column }) => {
    const p = consumer.originalPositionFor({ line, column });
    if (!p.source) return null;
    const m = /^webpack:\/\/\/(?:\.\/)?src\/(.+)$/.exec(p.source);
    if (!m) return null;
    if (/^ThirdParty\//.test(m[1]) || /\.d\.ts$/.test(m[1])) return null;
    return m[1];
  };
}

module.exports = { makeSourceOf };
