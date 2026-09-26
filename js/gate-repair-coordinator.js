/* Word Dragon RC6 B28-F — one-tap Repair coordinator. */
(function (global) {
  'use strict';

  function deps() {
    if (!global.WordDragonGateRepairScheduler) throw new Error('gate-repair-scheduler.js must load first');
    if (!global.WordDragonGateRepairLauncher) throw new Error('gate-repair-launcher.js must load first');
    if (!global.WordDragonGateRecoveryController) throw new Error('gate-recovery-controller.js must load first');
    return {
      scheduler: global.WordDragonGateRepairScheduler,
      launcher: global.WordDragonGateRepairLauncher,
      controller: global.WordDragonGateRecoveryController
    };
  }

  async function continueRepair(options) {
    const opts = options || {};
    const { scheduler, launcher, controller } = deps();
    const state = controller.getRecoveryView(opts.profile, opts.stageId);

    if (state.mode === 'gate') {
      return { status: 'no-recovery', state };
    }
    if (state.mode === 'retest') {
      return { status: 'retest-ready', state };
    }

    const target = scheduler.next(opts.profile, opts.stageId);
    if (!target) {
      const refreshed = controller.getRecoveryView(opts.profile, opts.stageId);
      return {
        status: refreshed.mode === 'retest' ? 'retest-ready' : 'no-target',
        state: refreshed
      };
    }

    const result = await launcher.launch({
      profile: opts.profile,
      stageId: opts.stageId,
      skill: target.skill,
      wordIds: target.wordIds,
      activities: opts.activities
    });

    const refreshed = controller.getRecoveryView(opts.profile, opts.stageId);
    return {
      status: result.accepted
        ? (refreshed.mode === 'retest' ? 'retest-ready' : 'repair-counted')
        : 'repair-not-counted',
      target,
      result,
      state: refreshed
    };
  }

  global.WordDragonGateRepairCoordinator = { continueRepair };
})(typeof window !== 'undefined' ? window : globalThis);
