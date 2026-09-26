/* Word Dragon RC6 B28-F — integration adapter.
 * Connects Stage Gate + Skill Repair without granting mastery or gate passage.
 */
(function (global) {
  'use strict';

  function api() {
    if (!global.WordDragonGateRecovery) throw new Error('gate-recovery.js must load first');
    return global.WordDragonGateRecovery;
  }

  function onGateFailed(profile, stageId, gateResult) {
    const result = gateResult || {};
    const weakSkills = Array.isArray(result.weakSkills) ? result.weakSkills : [];
    const failedWordIds = Array.isArray(result.failedWordIds) ? result.failedWordIds : [];
    return api().createPlan(profile, stageId, weakSkills, failedWordIds);
  }

  function onGatePassed(profile, stageId) {
    api().clearPlan(profile, stageId);
    return true;
  }

  function onRepairSucceeded(profile, stageId, skill) {
    return api().recordRepair(profile, stageId, skill);
  }

  function retestState(profile, stageId) {
    const plan = api().getPlan(profile, stageId);
    if (!plan) return { hasRecovery: false, ready: true, summary: null };
    return {
      hasRecovery: true,
      ready: api().canRetest(profile, stageId),
      summary: api().summary(profile, stageId)
    };
  }

  function shouldAllowRetest(profile, stageId) {
    const state = retestState(profile, stageId);
    return !state.hasRecovery || state.ready;
  }

  global.WordDragonGateRecoveryIntegration = {
    onGateFailed,
    onGatePassed,
    onRepairSucceeded,
    retestState,
    shouldAllowRetest
  };
})(typeof window !== 'undefined' ? window : globalThis);
