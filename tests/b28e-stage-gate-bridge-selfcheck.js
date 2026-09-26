const fs = require('fs');
const vm = require('vm');
global.window = global;
[
  'js/gate-recovery.js',
  'js/gate-recovery-integration.js',
  'js/gate-recovery-controller.js',
  'js/b28e-stage-gate-bridge.js'
].forEach((path) => vm.runInThisContext(fs.readFileSync(path, 'utf8')));

const B = global.WordDragonB28EStageGateBridge;
const C = global.WordDragonGateRecoveryController;
const assert = (ok, msg) => { if (!ok) throw new Error(msg); };

const profile = {
  xp: 80,
  stageGates: { 0: { passed: false, attempts: 1 } },
  skillRepairQueue: [{ skill: 'listening', wordId: 'old' }],
  stats: { w1: { mastered: true } }
};
const protectedBefore = JSON.stringify({
  xp: profile.xp,
  stageGates: profile.stageGates,
  skillRepairQueue: profile.skillRepairQueue,
  stats: profile.stats
});

let normalized = B.fromAttempt({
  passed: false,
  testedSkills: ['vocab', 'listening', 'sentence-order'],
  weakSkills: ['listen', 'construction', 'listen'],
  wrongWordIds: ['w2', 'w2', 'w3']
});
assert(normalized.weakSkills.join(',') === 'listening,sentence', 'skill aliases/dedup wrong');
assert(normalized.failedWordIds.join(',') === 'w2,w3', 'failed word dedup wrong');
assert(normalized.testedSkills.join(',') === 'vocabulary,listening,sentence', 'tested skills wrong');

let out = B.finish(profile, 0, normalized);
assert(out.status === 'repair-required', 'failed Gate should require repair');
assert(C.getRecoveryView(profile, 0).mode === 'repair', 'recovery plan missing');
assert(JSON.stringify({
  xp: profile.xp,
  stageGates: profile.stageGates,
  skillRepairQueue: profile.skillRepairQueue,
  stats: profile.stats
}) === protectedBefore, 'bridge changed B28-E owned progress/legacy repair state');

C.completeRepair(profile, 0, 'listening');
C.completeRepair(profile, 0, 'listening');
C.completeRepair(profile, 0, 'sentence');
C.completeRepair(profile, 0, 'sentence');
assert(C.getRecoveryView(profile, 0).mode === 'retest', 'repair did not unlock retest');

profile.stageGates[0].passed = true; // B28-E finishStageGate remains passage owner.
out = B.finish(profile, 0, { passed: true, testedSkills: ['vocabulary'] });
assert(out.status === 'passed', 'pass normalization wrong');
assert(C.getRecoveryView(profile, 0).mode === 'gate', 'pass did not clear B28-F recovery');
assert(profile.stageGates[0].passed === true, 'bridge disturbed B28-E passage');

console.log('B28-F B28-E Stage Gate bridge selfcheck PASS');
