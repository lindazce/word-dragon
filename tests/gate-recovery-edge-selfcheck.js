/* B28-F edge-case contract selfcheck. */
const fs = require('fs');
const vm = require('vm');
global.window = global;
[
  'js/gate-recovery.js',
  'js/gate-recovery-integration.js',
  'js/gate-recovery-controller.js',
  'js/gate-retest-sampler.js',
  'js/gate-retest-history.js'
].forEach((path) => vm.runInThisContext(fs.readFileSync(path, 'utf8')));

const R = global.WordDragonGateRecovery;
const C = global.WordDragonGateRecoveryController;
const S = global.WordDragonGateRetestSampler;
const H = global.WordDragonGateRetestHistory;
const assert = (ok, msg) => { if (!ok) throw new Error(msg); };

// Legacy profile: missing B28-F fields must migrate lazily.
const legacy = { stats: {}, stageGatePassed: {} };
assert(R.getPlan(legacy, 1) === null, 'legacy profile should initialize without recovery');
assert(legacy.gateRecovery && typeof legacy.gateRecovery === 'object', 'gateRecovery migration failed');
H.recentIds(legacy, 1, 1);
assert(legacy.gateRetestHistory && typeof legacy.gateRetestHistory === 'object', 'history migration failed');

// Unknown/duplicate skills are filtered.
C.failGate(legacy, 1, {
  weakSkills: ['listening', 'unknown', 'listening'],
  failedWordIds: ['a', 'a']
});
let plan = R.getPlan(legacy, 1);
assert(plan.weakSkills.length === 1 && plan.weakSkills[0] === 'listening', 'skill normalization failed');
assert(plan.failedWordIds.length === 1, 'failed word de-duplication failed');

// Unknown repair is ignored; valid repair caps at required count.
let result = C.completeRepair(legacy, 1, 'unknown');
assert(result.accepted === false, 'unknown repair should be rejected');
for (let i = 0; i < 10; i += 1) C.completeRepair(legacy, 1, 'listening');
plan = R.getPlan(legacy, 1);
assert(plan.progress.listening.completed === plan.progress.listening.required, 'repair count must cap');

// A later Gate failure replaces prior recovery rather than mixing attempts.
C.failGate(legacy, 1, { weakSkills: ['sentence'], failedWordIds: ['b'] });
plan = R.getPlan(legacy, 1);
assert(plan.weakSkills.length === 1 && plan.weakSkills[0] === 'sentence', 'new failure must replace old weak skills');
assert(plan.progress.sentence.completed === 0, 'new failure must reset repair progress');

// Empty weak-skill result must not deadlock retest.
C.failGate(legacy, 2, { weakSkills: [], failedWordIds: [] });
assert(C.canStartGate(legacy, 2), 'empty weak-skill plan must not lock retest');

// Tiny candidate pool may reuse historical questions, but never duplicates within one test.
const tiny = S.resample(['q1', 'q2'], ['q1', 'q2'], 2, () => 0);
assert(tiny.length === 2 && new Set(tiny).size === 2, 'tiny-pool fallback must stay unique');

// Asking for more than the available unique pool returns only unique available questions.
const short = S.resample(['q1', 'q2'], ['q1'], 5, () => 0);
assert(short.length === 2 && new Set(short).size === 2, 'sampler must not invent or duplicate questions');

console.log('B28-F Gate Recovery edge selfcheck PASS');
