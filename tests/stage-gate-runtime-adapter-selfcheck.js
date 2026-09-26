const fs = require('fs');
const vm = require('vm');
global.window = global;
[
  'js/gate-recovery.js',
  'js/gate-recovery-integration.js',
  'js/gate-recovery-controller.js',
  'js/gate-retest-sampler.js',
  'js/gate-retest-history.js',
  'js/stage-gate-runtime-adapter.js'
].forEach((path) => vm.runInThisContext(fs.readFileSync(path, 'utf8')));

const C = global.WordDragonGateRecoveryController;
const A = global.WordDragonStageGateRuntimeAdapter;
const H = global.WordDragonGateRetestHistory;
const assert = (ok, msg) => { if (!ok) throw new Error(msg); };

(async () => {
  const profile = { stageGatePassed: {}, stats: { a: { mastered: true } } };
  const masteryBefore = JSON.stringify(profile.stats);
  const candidates = ['q1','q2','q3','q4','q5','q6','q7','q8'];

  let out = await A.run({
    profile, stageId: 1, candidateQuestionIds: candidates, questionCount: 4, randomFn: () => 0,
    runGate: async ({ isRetest }) => {
      assert(isRetest === false, 'first attempt marked as retest');
      return { passed: false, weakSkills: ['listening'], failedWordIds: ['a'] };
    }
  });
  assert(out.status === 'failed', 'first Gate should fail');
  assert(C.getRecoveryView(profile, 1).mode === 'repair', 'failure did not create recovery');
  assert(H.recentIds(profile, 1, 1).length === 4, 'first attempt history missing');
  assert(JSON.stringify(profile.stats) === masteryBefore, 'adapter changed mastery');
  assert(!profile.stageGatePassed[1], 'adapter granted passage');

  out = await A.run({
    profile, stageId: 1, candidateQuestionIds: candidates, questionCount: 4,
    runGate: async () => ({ passed: true })
  });
  assert(out.status === 'repair-required', 'Gate must be blocked until repair completes');

  C.completeRepair(profile, 1, 'listening');
  C.completeRepair(profile, 1, 'listening');
  const previous = H.recentIds(profile, 1, 1);

  out = await A.run({
    profile, stageId: 1, candidateQuestionIds: candidates, questionCount: 4, randomFn: () => 0,
    runGate: async ({ isRetest, questionIds }) => {
      assert(isRetest === true, 'retest not identified');
      assert(questionIds.every((id) => !previous.includes(id)), 'retest reused avoidable recent question');
      profile.stageGatePassed[1] = true; // existing Gate runtime owns formal passage
      return { passed: true };
    }
  });
  assert(out.status === 'passed', 'retest should pass');
  assert(C.getRecoveryView(profile, 1).mode === 'gate', 'pass did not clear recovery');
  assert(profile.stageGatePassed[1] === true, 'adapter disturbed runtime passage');
  assert(JSON.stringify(profile.stats) === masteryBefore, 'adapter changed mastery on pass');

  console.log('B28-F Stage Gate runtime adapter selfcheck PASS');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
