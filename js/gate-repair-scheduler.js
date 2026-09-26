/* Word Dragon RC6 B28-F — choose the next required Repair automatically. */
(function (global) {
  'use strict';

  function recovery() {
    if (!global.WordDragonGateRecovery) throw new Error('gate-recovery.js must load first');
    return global.WordDragonGateRecovery;
  }

  function next(profile, stageId) {
    const plan = recovery().getPlan(profile, stageId);
    if (!plan || plan.readyForRetest) return null;

    const pending = (plan.weakSkills || [])
      .map((skill, index) => {
        const item = plan.progress?.[skill];
        return {
          skill,
          index,
          completed: item?.completed || 0,
          required: item?.required || 0,
          remaining: Math.max(0, (item?.required || 0) - (item?.completed || 0))
        };
      })
      .filter((item) => item.remaining > 0)
      .sort((a, b) => b.remaining - a.remaining || a.index - b.index);

    if (!pending.length) return null;
    const target = pending[0];
    return {
      skill: target.skill,
      completed: target.completed,
      required: target.required,
      remaining: target.remaining,
      wordIds: Array.isArray(plan.failedWordIds) ? plan.failedWordIds.slice() : []
    };
  }

  global.WordDragonGateRepairScheduler = { next };
})(typeof window !== 'undefined' ? window : globalThis);
