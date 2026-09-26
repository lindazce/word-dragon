const fs = require('fs');
const vm = require('vm');
global.window = global;
[
  'js/gate-recovery.js',
  'js/gate-recovery-integration.js',
  'js/gate-recovery-controller.js',
  'js/gate-retest-sampler.js',
  'js/gate-retest-history.js',
  'js/stage-gate-runtime-adapter.js',
  'js/b28e-stage-gate-bridge.js',
  'js/b28e-stage-gate-integration.js',
  'js/b28e-world-map-gate-router.js',
  'js/gate-repair-launcher.js',
  'js/gate-repair-scheduler.js',
  'js/gate-repair-coordinator.js',
  'js/b28e-repair-runtime.js',
  'js/b28e-repair-flow.js'
].forEach((path) => vm.runInThisContext(fs.readFileSync(path, 'utf8')));

const C = global.WordDragonGateRecoveryController;
const I = global.WordDragonB28EStageGateIntegration;
const R = global.WordDragonB28EWorldMapGateRouter;
const F = global.WordDragonB28ERepairFlow;
const S = global.WordDragonGateRetestSampler;
const H = global.WordDragonGateRetestHistory;
const assert = (ok, msg) => { if (!ok) throw new Error(msg); };

(async () => {
  const profile = {
    xp: 321,
    stats: { w1: { mastered: true } },
    stageGates: { 0: { passed: false, attempts: 0 } }
  };
  const protectedProgress = JSON.stringify({ xp: profile.xp, stats: profile.stats });
  const pool = Array.from({ length: 24 }, (_, i) => 'q' + (i + 1));

  // Initial Gate: listening weakness.
  let gate = I.finish(profile, 0, {
    correct: 10, total: 12,
    skillResults: {
      vocabulary: { correct: 3, total: 3 },
      listening: { correct: 1, total: 3 },
      sentence: { correct: 3, total: 3 },
      speaking: { correct: 3, total: 3 }
    },
    failedWordIds: ['w10']
  });
  assert(gate.status === 'repair-required', 'initial failure did not create recovery');
  assert(R.state(profile, 0).mode === 'repair', 'map did not enter repair');

  // Repair listening twice.
  const flow1 = F.create({
    profile, stageId: 0,
    startSentenceRepair: async () => ({ success: true, score: 10 })
  });
  await flow1.continueRepair();
  let rr = await flow1.continueRepair();
  assert(rr.status === 'retest-ready', 'first recovery did not unlock retest');
  assert(R.state(profile, 0).mode === 'retest', 'map not in retest');

  // Retest sample should prefer fresh questions.
  const initialIds = pool.slice(0, 12);
  H.recordAttempt(profile, 0, initialIds);
  const recent = H.recentIds(profile, 0);
  const retestIds = S.resample(pool, 12, recent, () => 0.42);
  assert(retestIds.length === 12, 'retest sample size wrong');
  assert(new Set(retestIds).size === 12, 'retest sample contains duplicates');
  assert(retestIds.some((id) => !initialIds.includes(id)), 'retest did not use fresh questions');

  // First retest fails a NEW skill. Old listening recovery must be replaced.
  gate = I.finish(profile, 0, {
    correct: 10, total: 12,
    skillResults: {
      vocabulary: { correct: 3, total: 3 },
      listening: { correct: 3, total: 3 },
      sentence: { correct: 1, total: 3 },
      speaking: { correct: 3, total: 3 }
    },
    failedWordIds: ['w20']
  });
  assert(gate.status === 'repair-required', 'retest failure did not rebuild recovery');
  const view2 = C.getRecoveryView(profile, 0);
  assert(view2.mode === 'repair', 'second failure not in repair');
  assert(view2.skills.length === 1 && view2.skills[0].skill === 'sentence',
    'old weak skill leaked into replacement recovery');
  assert(view2.skills[0].completed === 0, 'replacement recovery inherited old progress');

  // Repair new sentence weakness.
  const flow2 = F.create({
    profile, stageId: 0,
    startSentenceRepair: async () => ({ success: true })
  });
  await flow2.continueRepair();
  rr = await flow2.continueRepair();
  assert(rr.status === 'retest-ready', 'second recovery did not unlock retest');

  // B28-E remains formal passage owner.
  profile.stageGates[0].passed = true;
  profile.stageGates[0].attempts += 1;
  gate = I.finish(profile, 0, {
    correct: 12, total: 12,
    skillResults: {
      vocabulary: { correct: 3, total: 3 },
      listening: { correct: 3, total: 3 },
      sentence: { correct: 3, total: 3 },
      speaking: { correct: 3, total: 3 }
    }
  });
  assert(gate.status === 'passed', 'final pass not recognized');
  assert(R.state(profile, 0).mode === 'passed', 'passed stage not unlocked');
  assert(C.getRecoveryView(profile, 0).mode === 'gate', 'recovery not cleared after final pass');

  // Even stale recovery introduced later must never relock formal passage.
  C.failGate(profile, 0, { weakSkills: ['vocabulary'], failedWordIds: ['w99'] });
  assert(R.state(profile, 0).mode === 'passed', 'stale recovery relocked passed stage');

  assert(JSON.stringify({ xp: profile.xp, stats: profile.stats }) === protectedProgress,
    'lifecycle changed XP/mastery');

  console.log('B28-F B28-E Gate Recovery full lifecycle selfcheck PASS');
})().catch((err) => { console.error(err); process.exit(1); });
