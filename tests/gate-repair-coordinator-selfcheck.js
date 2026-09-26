const fs = require('fs');
const vm = require('vm');
global.window = global;
[
  'js/gate-recovery.js',
  'js/gate-recovery-integration.js',
  'js/gate-recovery-controller.js',
  'js/gate-repair-launcher.js',
  'js/gate-repair-scheduler.js',
  'js/gate-repair-coordinator.js'
].forEach((path) => vm.runInThisContext(fs.readFileSync(path, 'utf8')));

const C = global.WordDragonGateRecoveryController;
const Q = global.WordDragonGateRepairCoordinator;
const assert = (ok, msg) => { if (!ok) throw new Error(msg); };

(async () => {
  const profile = {};
  C.failGate(profile, 7, {
    weakSkills: ['listening', 'sentence'],
    failedWordIds: ['apple', 'bridge']
  });

  const calls = [];
  const activities = {
    'sentence-listening': async (ctx) => {
      calls.push(ctx.skill);
      return { success: true };
    },
    'sentence-order': async (ctx) => {
      calls.push(ctx.skill);
      return { success: true };
    }
  };

  let out = await Q.continueRepair({ profile, stageId: 7, activities });
  assert(out.status === 'repair-counted', 'first repair should count');
  assert(out.target.skill === 'listening', 'tie should preserve weak-skill order');

  out = await Q.continueRepair({ profile, stageId: 7, activities });
  assert(out.status === 'repair-counted', 'second repair should count');
  assert(out.target.skill === 'sentence', 'scheduler should balance larger remaining gap');

  out = await Q.continueRepair({ profile, stageId: 7, activities });
  assert(out.status === 'repair-counted', 'third repair should count');

  out = await Q.continueRepair({ profile, stageId: 7, activities });
  assert(out.status === 'retest-ready', 'final required repair should unlock retest');
  assert(C.canStartGate(profile, 7), 'coordinator did not unlock retest');

  const before = calls.length;
  out = await Q.continueRepair({ profile, stageId: 7, activities });
  assert(out.status === 'retest-ready', 'ready recovery should stay retest-ready');
  assert(calls.length === before, 'coordinator launched extra repair after completion');

  const clean = {};
  out = await Q.continueRepair({ profile: clean, stageId: 1, activities });
  assert(out.status === 'no-recovery', 'clean stage should not launch repair');

  console.log('B28-F Gate Repair coordinator selfcheck PASS');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
