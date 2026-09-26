const fs = require('fs');
const vm = require('vm');
global.window = global;
[
  'js/gate-retest-sampler.js',
  'js/gate-retest-history.js'
].forEach((path) => vm.runInThisContext(fs.readFileSync(path, 'utf8')));

const S = global.WordDragonGateRetestSampler;
const H = global.WordDragonGateRetestHistory;
const profile = {};

H.recordAttempt(profile, 1, ['q1', 'q2', 'q3']);
const previous = H.recentIds(profile, 1, 1);
const fresh = S.resample(['q1','q2','q3','q4','q5','q6'], previous, 3, () => 0);
if (fresh.some((id) => previous.includes(id))) throw new Error('fresh pool reused previous question');
if (new Set(fresh).size !== fresh.length) throw new Error('duplicate question in retest');

const fallback = S.resample(['q1','q2','q3','q4'], previous, 3, () => 0);
if (fallback.length !== 3 || new Set(fallback).size !== 3) throw new Error('small-pool fallback failed');

for (let i = 0; i < 7; i += 1) H.recordAttempt(profile, 2, ['x' + i]);
if (profile.gateRetestHistory['2'].length !== H.MAX_ATTEMPTS_PER_STAGE) {
  throw new Error('history retention cap failed');
}

console.log('B28-F Gate retest sampler/history selfcheck PASS');
