/* Word Dragon RC6 B28-F — thin adapter for existing world-map runtime. */
(function (global) {
  'use strict';

  function deps() {
    if (!global.WordDragonGateRecoveryViewModel) throw new Error('gate-recovery-view-model.js must load first');
    if (!global.WordDragonGateRecoveryCard) throw new Error('gate-recovery-card.js must load first');
    return {
      view: global.WordDragonGateRecoveryViewModel,
      card: global.WordDragonGateRecoveryCard,
      coordinator: global.WordDragonGateRepairCoordinator || null
    };
  }

  function mount(options) {
    const opts = options || {};
    const { view, card, coordinator } = deps();
    const model = view.forMap(opts.profile, opts.stageId);

    return card.mount(opts.container, model, async () => {
      if (model.state === 'repair') {
        if (coordinator && opts.activities) {
          const outcome = await coordinator.continueRepair({
            profile: opts.profile,
            stageId: opts.stageId,
            activities: opts.activities
          });
          if (typeof opts.onRepairResult === 'function') opts.onRepairResult(outcome);
          if (opts.autoRefresh !== false) mount(opts);
          return;
        }
        if (typeof opts.onRepair === 'function') opts.onRepair({ stageId: opts.stageId, model });
        return;
      }
      if (model.state === 'retest') {
        if (typeof opts.onRetest === 'function') opts.onRetest({ stageId: opts.stageId, model });
        return;
      }
      if (typeof opts.onGate === 'function') opts.onGate({ stageId: opts.stageId, model });
    });
  }

  global.WordDragonGateRecoveryMapAdapter = { mount };
})(typeof window !== 'undefined' ? window : globalThis);
