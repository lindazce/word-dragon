/* B28-F end-to-end state-machine selfcheck.
 * Simulates fail -> repair -> retest -> fail again -> repair -> pass.
 */
const fs = require('fs');
const vm = require('vm');
global.window = global;
[
  'js/gate-recovery.js',
  'js/gate-recovery-integration.js',
  'js/gate-recovery-controller.js',
  'js/gate-retest-sampler.js',
  'js/gate-retest-history.js',
  'js/gate-recovery-view-model.js'
].forEach((path) => vm.runInThisContext(fs.readFileSync(path, 'utf8')));

const C = global.WordDragonGateRecoveryController;
const H = global.WordDragonGateRetestHistory;
const S = global.WordDragonGateRetestSampler;
const V = global.WordDragonGateRecoveryViewModel;

function assert(ok, message) {
  if (!ok) throw new Error(message);
}

const profile = {
  stageGatePassed: {},
  stats: {
    apple: { mastered: true },
    bridge: { mastered: false }
  }
};
const masteryBefore = JSON.stringify(profile.stats);

// Attempt 1: listening + sentence are weak.
H.recordAttempt(profile, 'forest', ['l1','l2','s1','s2']);
C.failGate(profile, 'forest', {
  weakSkills: ['listening', 'sentence'],
  failedWordIds: ['apple', 'bridge']
});

let map = V.forMap(profile, 'forest');
assert(map.state === 'repair', 'failed Gate must show repair state');
assert(map.progressText === '0/4 次有效修复', 'initial repair total should be 0/4');
assert(!C.canStartGate(profile, 'forest'), 'retest must be locked after failure');

// Partial repair: still locked.
C.completeRepair(profile, 'forest', 'listening');
C.completeRepair(profile, 'forest', 'listening');
C.completeRepair(profile, 'forest', 'sentence');
map = V.forMap(profile, 'forest');
assert(map.state === 'repair', 'partial repair must remain in repair state');
assert(map.progressText === '3/4 次有效修复', 'partial repair progress should be 3/4');
assert(!C.canStartGate(profile, 'forest'), 'partial repair must not unlock retest');

// Complete repair: unlock retest, but do not grant passage.
C.completeRepair(profile, 'forest', 'sentence');
map = V.forMap(profile, 'forest');
assert(map.state === 'retest', 'completed repair must show retest state');
assert(C.canStartGate(profile, 'forest'), 'completed repair must unlock retest');
assert(!profile.stageGatePassed.forest, 'repair must not grant Stage Gate passage');
assert(JSON.stringify(profile.stats) === masteryBefore, 'repair must not mutate vocabulary mastery');

// Retest must prefer fresh question IDs.
const previous = H.recentIds(profile, 'forest', 1);
const retest1 = S.resample(
  ['l1','l2','l3','l4','s1','s2','s3','s4'],
  previous,
  4,
  () => 0
);
assert(retest1.length === 4, 'retest should contain four questions');
assert(retest1.every((id) => !previous.includes(id)), 'retest should prefer unseen questions');
H.recordAttempt(profile, 'forest', retest1);

// Attempt 2 fails speaking only. New failure must replace old recovery plan.
C.failGate(profile, 'forest', {
  weakSkills: ['speaking'],
  failedWordIds: ['bridge']
});
map = V.forMap(profile, 'forest');
assert(map.state === 'repair', 'second failure must return to repair');
assert(map.skills.length === 1 && map.skills[0].key === 'speaking', 'new recovery must target only new weak skill');
assert(map.progressText === '0/2 次有效修复', 'new recovery must reset repair counts');

// Speaking repair completes; still no passage.
C.completeRepair(profile, 'forest', 'speaking');
C.completeRepair(profile, 'forest', 'speaking');
assert(C.canStartGate(profile, 'forest'), 'second recovery must unlock retest');
assert(!profile.stageGatePassed.forest, 'second repair must not grant passage');
assert(JSON.stringify(profile.stats) === masteryBefore, 'second repair must not mutate mastery');

// Attempt 3 passes. Runtime owns passage; recovery controller only clears recovery.
profile.stageGatePassed.forest = true;
C.passGate(profile, 'forest');
map = V.forMap(profile, 'forest');
assert(map.state === 'gate', 'pass must clear recovery UI state');
assert(profile.stageGatePassed.forest === true, 'controller must not revoke runtime passage');

console.log('B28-F Gate Recovery E2E selfcheck PASS');
