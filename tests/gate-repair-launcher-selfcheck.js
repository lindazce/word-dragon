const fs = require('fs');
const vm = require('vm');
global.window = global;
[
  'js/gate-recovery.js',
  'js/gate-recovery-integration.js',
  'js/gate-recovery-controller.js',
  'js/gate-repair-launcher.js'
].forEach((path) => vm.runInThisContext(fs.readFileSync(path, 'utf8')));

const C = global.WordDragonGateRecoveryController;
const L = global.WordDragonGateRepairLauncher;
const assert = (ok, msg) => { if (!ok) throw new Error(msg); };

(async () => {
  assert(L.routeFor('vocabulary') === 'vocabulary', 'vocabulary route wrong');
  assert(L.routeFor('listening') === 'sentence-listening', 'listening route wrong');
  assert(L.routeFor('sentence') === 'sentence-order', 'sentence route wrong');
  assert(L.routeFor('speaking') === 'sentence-speaking', 'speaking route wrong');
  assert(L.routeFor('unknown') === null, 'unknown route must be null');

  const profile = {};
  C.failGate(profile, 1, { weakSkills: ['listening'], failedWordIds: ['apple'] });

  let calls = 0;
  const activities = {
    'sentence-listening': async () => { calls += 1; return { success: false, reason: 'wrong-answer' }; }
  };

  let result = await L.launch({ profile, stageId: 1, skill: 'listening', wordIds: ['apple'], activities });
  assert(result.accepted === false, 'failed activity must not count');
  assert(C.getRecoveryView(profile, 1).skills[0].completed === 0, 'failed activity advanced recovery');

  activities['sentence-listening'] = async () => { calls += 1; return { success: true, score: 1 }; };
  result = await L.launch({ profile, stageId: 1, skill: 'listening', wordIds: ['apple'], activities });
  assert(result.accepted === true, 'successful repair should count');
  assert(C.getRecoveryView(profile, 1).skills[0].completed === 1, 'successful repair did not advance');

  result = await L.launch({ profile, stageId: 1, skill: 'unknown', activities });
  assert(result.reason === 'unknown-skill', 'unknown skill reason wrong');

  result = await L.launch({ profile, stageId: 1, skill: 'listening', activities: {} });
  assert(result.reason === 'activity-unavailable', 'missing activity reason wrong');
  assert(C.getRecoveryView(profile, 1).skills[0].completed === 1, 'missing activity advanced recovery');

  assert(calls === 2, 'unexpected activity invocation count');
  console.log('B28-F Gate Repair launcher selfcheck PASS');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
