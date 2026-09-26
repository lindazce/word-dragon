/* Word Dragon RC6 B28-F — Gate Recovery controller.
 * Stable facade for UI/runtime integration.
 */
(function (global) {
  'use strict';

  function integration() {
    if (!global.WordDragonGateRecoveryIntegration) {
      throw new Error('gate-recovery-integration.js must load first');
    }
    return global.WordDragonGateRecoveryIntegration;
  }

  function failGate(profile, stageId, result) {
    return integration().onGateFailed(profile, stageId, result || {});
  }

  function completeRepair(profile, stageId, skill) {
    const plan = integration().onRepairSucceeded(profile, stageId, skill);
    return {
      accepted: !!plan,
      state: integration().retestState(profile, stageId)
    };
  }

  function getRecoveryView(profile, stageId) {
    const state = integration().retestState(profile, stageId);
    if (!state.hasRecovery) {
      return {
        mode: 'gate',
        readyForRetest: true,
        message: '',
        skills: []
      };
    }
    const skills = (state.summary?.skills || []).map((item) => ({
      skill: item.skill,
      completed: item.completed,
      required: item.required,
      done: item.completed >= item.required
    }));
    const remaining = skills.filter((item) => !item.done).length;
    return {
      mode: state.ready ? 'retest' : 'repair',
      readyForRetest: state.ready,
      message: state.ready
        ? '修复完成，可以重新挑战守门测试。'
        : `完成薄弱技能修复后再挑战：还剩 ${remaining} 项。`,
      skills
    };
  }

  function canStartGate(profile, stageId) {
    return integration().shouldAllowRetest(profile, stageId);
  }

  function passGate(profile, stageId) {
    integration().onGatePassed(profile, stageId);
    return getRecoveryView(profile, stageId);
  }

  global.WordDragonGateRecoveryController = {
    failGate,
    completeRepair,
    getRecoveryView,
    canStartGate,
    passGate
  };
})(typeof window !== 'undefined' ? window : globalThis);
