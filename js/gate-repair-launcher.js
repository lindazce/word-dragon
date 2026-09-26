/* Word Dragon RC6 B28-F — skill-specific Repair launcher.
 * Runtime injects actual activities; only verified success advances recovery.
 */
(function (global) {
  'use strict';

  const ROUTES = {
    vocabulary: 'vocabulary',
    listening: 'sentence-listening',
    sentence: 'sentence-order',
    speaking: 'sentence-speaking'
  };

  function controller() {
    if (!global.WordDragonGateRecoveryController) {
      throw new Error('gate-recovery-controller.js must load first');
    }
    return global.WordDragonGateRecoveryController;
  }

  function routeFor(skill) {
    return ROUTES[skill] || null;
  }

  async function launch(options) {
    const opts = options || {};
    const route = routeFor(opts.skill);
    if (!route) return { accepted: false, reason: 'unknown-skill' };

    const activities = opts.activities || {};
    const activity = activities[route];
    if (typeof activity !== 'function') {
      return { accepted: false, reason: 'activity-unavailable', route };
    }

    const outcome = await activity({
      stageId: opts.stageId,
      skill: opts.skill,
      wordIds: Array.isArray(opts.wordIds) ? opts.wordIds.slice() : []
    });

    if (!outcome || outcome.success !== true) {
      return {
        accepted: false,
        reason: outcome?.reason || 'repair-not-completed',
        route,
        outcome: outcome || null
      };
    }

    const recovery = controller().completeRepair(opts.profile, opts.stageId, opts.skill);
    return {
      accepted: !!recovery.accepted,
      reason: recovery.accepted ? 'repair-counted' : 'no-active-recovery',
      route,
      outcome,
      recovery: recovery.state
    };
  }

  global.WordDragonGateRepairLauncher = { ROUTES, routeFor, launch };
})(typeof window !== 'undefined' ? window : globalThis);
