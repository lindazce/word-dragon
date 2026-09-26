const fs = require('fs');
const vm = require('vm');
global.window = global;
[
  'js/gate-recovery.js','js/gate-recovery-integration.js','js/gate-recovery-controller.js',
  'js/b28e-stage-gate-bridge.js','js/b28e-stage-gate-integration.js','js/b28e-world-map-gate-router.js',
  'js/gate-repair-launcher.js','js/gate-repair-scheduler.js','js/gate-repair-coordinator.js',
  'js/b28e-repair-runtime.js','js/b28e-repair-flow.js'
].forEach((p) => vm.runInThisContext(fs.readFileSync(p, 'utf8')));

const assert = (ok, msg) => { if (!ok) throw new Error(msg); };
(async () => {
  global.profile = { stageGates: { 0: { passed: false } }, stats: {}, xp: 1 };
  const gateCalls = [];
  global.startStageGate = (stageId, options) => { gateCalls.push({ stageId, options }); return { status: 'gate-started' }; };
  const sqCalls = [];
  global.WDSentenceQuest = { startRepair: async (item) => { sqCalls.push(item); return { success: true, score: 10 }; } };
  let renders = 0;
  global.WDWorldMap = { render: () => { renders += 1; } };

  vm.runInThisContext(fs.readFileSync('js/b28e-runtime-hooks.js', 'utf8'));
  const H = global.WordDragonB28ERuntimeHooks;
  const payload = H.stageGatePayload({
    passed: false, score: 8, total: 9,
    skills: {
      vocabulary: { correct: 3, total: 3 },
      listening: { correct: 1, total: 3 },
      sentence: { correct: 4, total: 3 }
    },
    wrong: [{ w: 'w7' }]
  });
  assert(payload.failedWordIds[0] === 'w7', 'wrong word normalization failed');
  assert(payload.skillResults.listening.correct === 1, 'skill payload normalization failed');

  let out = global.WDB28FGateFinished({
    profile: global.profile, stageId: 0, passed: false, score: 8, total: 9,
    skills: {
      vocabulary: { correct: 3, total: 3 },
      listening: { correct: 1, total: 3 },
      sentence: { correct: 4, total: 3 }
    },
    wrong: [{ w: 'w7' }]
  });
  assert(out.status === 'repair-required', 'finish hook did not create recovery');

  out = await global.WDB28FWorldMapGateAction(0);
  assert(out.status === 'repair-counted', 'map Repair action did not count');
  assert(sqCalls.at(-1).mode === 'blind-listening', 'listening did not route to blind listening');
  out = await global.WDB28FWorldMapGateAction(0);
  assert(out.status === 'retest-ready', 'second repair did not unlock retest');
  assert(renders >= 2, 'map did not refresh after repair');

  await global.WDB28FWorldMapGateAction(0);
  assert(gateCalls.at(-1).options && gateCalls.at(-1).options.isRetest === true, 'retest did not call Gate with isRetest');

  // Passed stage always routes away from Gate even if stale recovery exists.
  global.profile.stageGates[0].passed = true;
  await global.WDB28FWorldMapGateAction(0);
  assert(gateCalls.length === 1, 'passed stage started Gate again');

  console.log('B28-F B28-E runtime hooks selfcheck PASS');
})().catch((err) => { console.error(err); process.exit(1); });
