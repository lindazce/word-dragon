const fs = require('fs');
const vm = require('vm');
global.window = global;
[
  'js/gate-recovery.js',
  'js/gate-recovery-integration.js',
  'js/gate-recovery-controller.js',
  'js/b28e-stage-gate-bridge.js',
  'js/b28e-stage-gate-integration.js'
].forEach((path) => vm.runInThisContext(fs.readFileSync(path, 'utf8')));

const I = global.WordDragonB28EStageGateIntegration;
const C = global.WordDragonGateRecoveryController;
const assert = (ok, msg) => { if (!ok) throw new Error(msg); };

const profile = {
  xp: 500,
  stageGates: { 0: { passed: false } },
  stats: { w1: { mastered: true } }
};
const protectedBefore = JSON.stringify({ xp: profile.xp, stageGates: profile.stageGates, stats: profile.stats });

let attempt = I.buildAttempt({
  correct: 9,
  total: 12,
  skillResults: {
    vocabulary: { correct: 3, total: 3 },
    listening: { correct: 1, total: 3 },
    sentence: { correct: 3, total: 3 },
    speaking: { skipped: true, correct: 0, total: 0 }
  },
  wrongWordIds: ['w2', 'w2']
});
assert(attempt.passed === false, '75% total must fail');
assert(attempt.testedSkills.join(',') === 'vocabulary,listening,sentence', 'skipped speaking counted');
assert(attempt.weakSkills.join(',') === 'listening', 'weak skill derivation wrong');
assert(attempt.failedWordIds.join(',') === 'w2', 'wrong word dedup failed');

let out = I.finish(profile, 0, {
  correct: 8,
  total: 9,
  skillResults: {
    vocabulary: { correct: 3, total: 3 },
    listening: { correct: 1, total: 3 },
    sentence: { correct: 4, total: 3 },
    speaking: { skipped: true }
  },
  failedWordIds: ['w2']
});
assert(out.status === 'repair-required', 'per-skill failure must override high total score');
assert(I.mapMode(profile, 0) === 'repair', 'map should enter repair');
assert(JSON.stringify({ xp: profile.xp, stageGates: profile.stageGates, stats: profile.stats }) === protectedBefore,
  'integration helper mutated B28-E owned progress');

C.completeRepair(profile, 0, 'listening');
C.completeRepair(profile, 0, 'listening');
assert(I.mapMode(profile, 0) === 'retest', 'map should enter retest after required repairs');

profile.stageGates[0].passed = true; // formal B28-E owner
out = I.finish(profile, 0, {
  correct: 9,
  total: 9,
  skillResults: {
    vocabulary: { correct: 3, total: 3 },
    listening: { correct: 3, total: 3 },
    sentence: { correct: 3, total: 3 },
    speaking: { skipped: true }
  }
});
assert(out.status === 'passed', 'passing attempt not recognized');
assert(I.mapMode(profile, 0) === 'gate', 'recovery not cleared after pass');
assert(profile.stageGates[0].passed === true, 'integration helper disturbed passage');

console.log('B28-F B28-E application Gate integration selfcheck PASS');
