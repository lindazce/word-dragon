const fs = require('fs');
const vm = require('vm');
global.window = global;
[
  'js/gate-recovery.js',
  'js/gate-recovery-integration.js',
  'js/gate-recovery-controller.js',
  'js/b28e-stage-gate-bridge.js',
  'js/b28e-stage-gate-integration.js',
  'js/b28e-world-map-gate-router.js'
].forEach((path) => vm.runInThisContext(fs.readFileSync(path, 'utf8')));

const R = global.WordDragonB28EWorldMapGateRouter;
const C = global.WordDragonGateRecoveryController;
const assert = (ok, msg) => { if (!ok) throw new Error(msg); };

(async () => {
  const profile = { stageGates: {}, stats: { w1: { mastered: true } }, xp: 22 };
  const protectedBefore = JSON.stringify({ stats: profile.stats, xp: profile.xp });

  assert(R.state(profile, 0).mode === 'gate', 'clean stage should route to gate');

  C.failGate(profile, 0, { weakSkills: ['listening'], failedWordIds: ['w2'] });
  assert(R.state(profile, 0).mode === 'repair', 'failed stage should route to repair');

  let called = [];
  await R.run({
    profile, stageId: 0,
    onGate: () => called.push('gate'),
    onRepair: () => called.push('repair'),
    onRetest: () => called.push('retest')
  });
  assert(called.join(',') === 'repair', 'repair state bypassed');

  C.completeRepair(profile, 0, 'listening');
  assert(R.state(profile, 0).mode === 'repair', 'one repair must not unlock retest');
  C.completeRepair(profile, 0, 'listening');
  assert(R.state(profile, 0).mode === 'retest', 'required repairs should unlock retest');

  called = [];
  await R.run({
    profile, stageId: 0,
    onGate: () => called.push('gate'),
    onRepair: () => called.push('repair'),
    onRetest: () => called.push('retest')
  });
  assert(called.join(',') === 'retest', 'retest state routed incorrectly');

  // Critical invariant: formal B28-E passage has absolute priority over stale recovery.
  profile.stageGates[0] = { passed: true };
  assert(R.state(profile, 0).mode === 'passed', 'passed stage was relocked by recovery');
  assert(R.isPassed(profile, 0) === true, 'passed stage detection failed');

  called = [];
  await R.run({
    profile, stageId: 0,
    onContinue: () => called.push('continue'),
    onRepair: () => called.push('repair'),
    onRetest: () => called.push('retest'),
    onGate: () => called.push('gate')
  });
  assert(called.join(',') === 'continue', 'passed stage did not route to continue');

  // Legacy boolean passage shape also stays unlocked.
  profile.stageGates[1] = true;
  C.failGate(profile, 1, { weakSkills: ['sentence'], failedWordIds: [] });
  assert(R.state(profile, 1).mode === 'passed', 'legacy passed stage was relocked');

  assert(JSON.stringify({ stats: profile.stats, xp: profile.xp }) === protectedBefore,
    'router changed mastery/XP');

  console.log('B28-F B28-E world map Gate router selfcheck PASS');
})().catch((err) => { console.error(err); process.exit(1); });
