/* Word Dragon RC6 B28-F — Stage Gate recovery lifecycle.
 * Isolated from formal vocabulary mastery and stageGatePassed.
 */
(function (global) {
  'use strict';

  const REQUIRED_REPAIRS = 2;
  const SKILLS = ['vocabulary', 'listening', 'sentence', 'speaking'];

  function ensureProfile(profile) {
    if (!profile || typeof profile !== 'object') throw new Error('profile required');
    if (!profile.gateRecovery || typeof profile.gateRecovery !== 'object') {
      profile.gateRecovery = {};
    }
    return profile.gateRecovery;
  }

  function normalizeSkills(skills) {
    return [...new Set((skills || []).filter((skill) => SKILLS.includes(skill)))];
  }

  function createPlan(profile, stageId, weakSkills, failedWordIds) {
    const store = ensureProfile(profile);
    const skills = normalizeSkills(weakSkills);
    const progress = {};
    skills.forEach((skill) => {
      progress[skill] = { completed: 0, required: REQUIRED_REPAIRS };
    });
    store[String(stageId)] = {
      stageId,
      weakSkills: skills,
      failedWordIds: [...new Set(failedWordIds || [])],
      progress,
      readyForRetest: skills.length === 0,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    return store[String(stageId)];
  }

  function getPlan(profile, stageId) {
    const store = ensureProfile(profile);
    return store[String(stageId)] || null;
  }

  function recordRepair(profile, stageId, skill) {
    const plan = getPlan(profile, stageId);
    if (!plan || !plan.progress || !plan.progress[skill]) return null;
    const item = plan.progress[skill];
    item.completed = Math.min(item.required, (item.completed || 0) + 1);
    plan.readyForRetest = plan.weakSkills.every((name) => {
      const p = plan.progress[name];
      return p && p.completed >= p.required;
    });
    plan.updatedAt = Date.now();
    return plan;
  }

  function canRetest(profile, stageId) {
    const plan = getPlan(profile, stageId);
    return !!(plan && plan.readyForRetest);
  }

  function clearPlan(profile, stageId) {
    const store = ensureProfile(profile);
    delete store[String(stageId)];
  }

  function summary(profile, stageId) {
    const plan = getPlan(profile, stageId);
    if (!plan) return null;
    return {
      stageId: plan.stageId,
      readyForRetest: !!plan.readyForRetest,
      skills: plan.weakSkills.map((skill) => ({
        skill,
        completed: plan.progress[skill]?.completed || 0,
        required: plan.progress[skill]?.required || REQUIRED_REPAIRS
      }))
    };
  }

  global.WordDragonGateRecovery = {
    REQUIRED_REPAIRS,
    SKILLS,
    ensureProfile,
    createPlan,
    getPlan,
    recordRepair,
    canRetest,
    clearPlan,
    summary
  };
})(typeof window !== 'undefined' ? window : globalThis);
