/* Word Dragon RC6 B28-F — minimal bootstrap for B28-E world map integration. */
(function (global) {
  'use strict';

  function deps() {
    if (!global.WordDragonGateRepairActivityAdapters) throw new Error('gate-repair-activity-adapters.js must load first');
    if (!global.WordDragonGateRecoveryMapAdapter) throw new Error('gate-recovery-map-adapter.js must load first');
    return {
      adapters: global.WordDragonGateRepairActivityAdapters,
      map: global.WordDragonGateRecoveryMapAdapter,
      gate: global.WordDragonStageGateRuntimeAdapter || null,
      guard: global.WordDragonGateActionGuard || null
    };
  }

  function mount(options) {
    const opts = options || {};
    const { adapters, map, gate, guard } = deps();
    const activities = opts.activities || adapters.create(opts.runtime || {});

    const runGate = async () => {
      if (!gate || typeof opts.runGate !== 'function') {
        if (typeof opts.onGate === 'function') return opts.onGate({ stageId: opts.stageId });
        return { status: 'runtime-unavailable' };
      }
      const task = () => gate.run({
        profile: opts.profile,
        stageId: opts.stageId,
        candidateQuestionIds: opts.candidateQuestionIds,
        questionCount: opts.questionCount,
        historyDepth: opts.historyDepth,
        randomFn: opts.randomFn,
        runGate: opts.runGate
      });
      const outcome = guard ? await guard.run(opts.stageId, 'gate', task) : await task();
      if (typeof opts.onGateResult === 'function') opts.onGateResult(outcome);
      if (opts.autoRefresh !== false) mount(opts);
      return outcome;
    };

    return map.mount({
      container: opts.container,
      profile: opts.profile,
      stageId: opts.stageId,
      activities,
      autoRefresh: opts.autoRefresh,
      onGate: runGate,
      onRetest: runGate,
      onRepair: opts.onRepair,
      onRepairResult: opts.onRepairResult
    });
  }

  global.WordDragonGateRecoveryBootstrap = { mount };
})(typeof window !== 'undefined' ? window : globalThis);
