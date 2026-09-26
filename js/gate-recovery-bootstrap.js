/* Word Dragon RC6 B28-F — minimal bootstrap for B28-E world map integration. */
(function (global) {
  'use strict';

  function deps() {
    if (!global.WordDragonGateRepairActivityAdapters) throw new Error('gate-repair-activity-adapters.js must load first');
    if (!global.WordDragonGateRecoveryMapAdapter) throw new Error('gate-recovery-map-adapter.js must load first');
    return {
      adapters: global.WordDragonGateRepairActivityAdapters,
      map: global.WordDragonGateRecoveryMapAdapter
    };
  }

  function mount(options) {
    const opts = options || {};
    const { adapters, map } = deps();
    const activities = opts.activities || adapters.create(opts.runtime || {});

    return map.mount({
      container: opts.container,
      profile: opts.profile,
      stageId: opts.stageId,
      activities,
      autoRefresh: opts.autoRefresh,
      onGate: opts.onGate,
      onRetest: opts.onRetest,
      onRepair: opts.onRepair,
      onRepairResult: opts.onRepairResult
    });
  }

  global.WordDragonGateRecoveryBootstrap = { mount };
})(typeof window !== 'undefined' ? window : globalThis);
