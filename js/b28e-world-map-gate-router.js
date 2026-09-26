/* Word Dragon RC6 B28-F — B28-E world-map Gate/Repair/Retest router.
 * Passed stages always win and are never relocked by stale recovery state.
 */
(function (global) {
  'use strict';

  function isPassed(profile, stageId) {
    const gates = profile && profile.stageGates;
    const gate = gates && (gates[stageId] || gates[String(stageId)]);
    return gate === true || !!(gate && gate.passed === true);
  }

  function state(profile, stageId) {
    if (isPassed(profile, stageId)) {
      return { mode: 'passed', action: 'continue', locked: false };
    }

    const integration = global.WordDragonB28EStageGateIntegration;
    const mode = integration ? integration.mapMode(profile, stageId) : 'gate';

    if (mode === 'repair') return { mode: 'repair', action: 'repair', locked: false };
    if (mode === 'retest') return { mode: 'retest', action: 'retest', locked: false };
    return { mode: 'gate', action: 'gate', locked: false };
  }

  async function run(options) {
    const opts = options || {};
    const s = state(opts.profile, opts.stageId);

    if (s.mode === 'passed') {
      return typeof opts.onContinue === 'function'
        ? opts.onContinue(opts.stageId)
        : { status: 'already-passed' };
    }
    if (s.mode === 'repair') {
      return typeof opts.onRepair === 'function'
        ? opts.onRepair(opts.stageId)
        : { status: 'repair-unavailable' };
    }
    if (s.mode === 'retest') {
      return typeof opts.onRetest === 'function'
        ? opts.onRetest(opts.stageId)
        : { status: 'retest-unavailable' };
    }
    return typeof opts.onGate === 'function'
      ? opts.onGate(opts.stageId)
      : { status: 'gate-unavailable' };
  }

  global.WordDragonB28EWorldMapGateRouter = { isPassed, state, run };
})(typeof window !== 'undefined' ? window : globalThis);
