'use strict';
const path = require('path');

const GAME_DIR = process.env.BITBURNER_DIR ||
  'C:\\Program Files (x86)\\Steam\\steamapps\\common\\Bitburner';
const DIST = path.join(GAME_DIR, 'resources', 'app', 'dist');
const ROOT = path.join(__dirname, '..');

module.exports = {
  GAME_DIR,
  DIST,
  BUNDLE: path.join(DIST, 'main.bundle.js'),
  MAP: path.join(DIST, 'main.bundle.js.map'),
  VERSION_FILE: path.join(GAME_DIR, 'version'),
  KO_DIR: path.join(ROOT, 'ko'),
  WORK_DIR: path.join(ROOT, 'work'),
  FONT_DIR: path.join(ROOT, 'font'),
};
