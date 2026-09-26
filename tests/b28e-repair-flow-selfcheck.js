const fs = require('fs');
const vm = require('vm');
global.window = global;
[
  'js/gate-recovery.js',
  'js/gate-recovery-integration.js',
  'js/gate-recovery-controller.js',
  'js/gate-repair-launcher.js',
  'js/gate-repair-scheduler.js',
  'js/gate-repair-coordinator.js',
  'js/b28e-repair-runtime.js',
  'js/b28e-repair-flow.js'
].forEach((path) => vm.runInThisContext(fs.readFileSync(path, 'utf8')));

const C = global.WordDragonGateRecoveryController;
const F = global.WordDragonB28ERepairFlow;
const assert = (ok, msg) => { if (!ok) throw new Error(msg); };

(async () => {
  const profile = { xp: 100, stats: { w1: { mastered: true } }, stageGates: { 0: { passed: false } } };
  const protectedBefore = JSON.stringify({ xp: profile.xp, stats: profile.stats, stageGates: profile.stageGates });
  C.failGate(profile, 0, { weakSkills: ['listening', 'sentence'], failedWordIds: ['w4'] });

  const calls = [];
  const refresh = [];
  const flow = F.create({
    profile,
    stageId: 0,
    startSentenceRepair: async (item) => {
      calls.push(item);
      return { success: true };
    },
    onStateChange: async (result) => refresh.push(result.status)
  });

  // Tie: preserve original weak-skill order => listening first.
  let out = await flow.continueRepair();
  assert(out.status === 'repair-counted', 'first listening repair not counted');
  assert(calls.at(-1).skill === 'listening', 'scheduler did not choose listening first');

  // Sentence now has larger deficit, so scheduler switches automatically.
  out = await flow.continueRepair();
  assert(out.status === 'repair-counted', 'first sentence repair not counted');
  assert(calls.at(-1).skill === 'sentence', 'scheduler did not switch to largest deficit');

  out = await flow.continueRepair();
  assert(out.status === 'repair-counted', 'second listening repair not counted');
  assert(calls.at(-1).skill === 'listening', 'tie order after balancing wrong');

  out = await flow.continueRepair();
  assert(out.status === 'retest-ready', 'final repair should unlock retest');
  assert(calls.at(-1).skill === 'sentence', 'final sentence repair missing');
  assert(C.getRecoveryView(profile, 0).mode === 'retest', 'controller not in retest mode');
  assert(refresh.length === 4, 'map/state refresh not called after each action');

  assert(JSON.stringify({ xp: profile.xp, stats: profile.stats, stageGates: profile.stageGates }) === protectedBefore,
    'repair flow changed XP/mastery/passage');

  // Failed/cancelled activity must not advance.
  const p2 = { stageGates: {} };
  C.failGate(p2, 1, { weakSkills: ['vocabulary'], failedWordIds: ['w8'] });
  const failFlow = F.create({
    profile: p2, stageId: 1,
    startVocabularyRepair: async () => ({ success: false, cancelled: true })
  });
  out = await failFlow.continueRepair();
  assert(out.status === 'repair-not-counted', 'cancelled repair was counted');
  const cancelledView = C.getRecoveryView(p2, 1);
  assert(cancelledView.skills.length === 1 && cancelledView.skills[0].completed === 0, 'cancel advanced progress');

  console.log('B28-F B28-E one-tap Repair flow selfcheck PASS');
})().catch((err) => { console.error(err); process.exit(1); });
