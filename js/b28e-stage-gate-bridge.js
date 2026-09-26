/* Word Dragon RC6 B28-F — bridge for the existing B28-E Stage Gate runtime.
 * B28-E remains owner of question UI/scoring and formal profile.stageGates passage.
 * This bridge only normalizes the completed attempt for B28-F recovery.
 */
(function (global) {
  'use strict';

  const SKILLS = ['vocabulary', 'listening', 'sentence', 'speaking'];

  function uniq(values) {
    return Array.from(new Set((values || []).filter(Boolean)));
  }

  function normalizeSkill(value) {
    const v = String(value || '').toLowerCase();
    if (v === 'word' || v === 'vocab' || v === 'vocabulary') return 'vocabulary';
    if (v === 'listen' || v === 'listening') return 'listening';
    if (v === 'sentence' || v === 'sentence-order' || v === 'construction') return 'sentence';
    if (v === 'speak' || v === 'speaking' || v === 'voice') return 'speaking';
    return SKILLS.includes(v) ? v : null;
  }

  function fromAttempt(attempt) {
    const a = attempt || {};
    const testedSkills = uniq((a.testedSkills || []).map(normalizeSkill).filter(Boolean));
    const weakSkills = uniq((a.weakSkills || []).map(normalizeSkill).filter(Boolean));
    const failedWordIds = uniq(a.failedWordIds || a.wrongWordIds || []);
    return {
      passed: a.passed === true,
      weakSkills,
      failedWordIds,
      testedSkills
    };
  }

  function finish(profile, stageId, attempt) {
    const result = fromAttempt(attempt);
    const controller = global.WordDragonGateRecoveryController;

    if (!controller) {
      return { status: 'recovery-unavailable', result };
    }

    if (result.passed) {
      controller.passGate(profile, stageId);
      return { status: 'passed', result };
    }

    controller.failGate(profile, stageId, result);
    return { status: 'repair-required', result };
  }

  global.WordDragonB28EStageGateBridge = { fromAttempt, finish };
})(typeof window !== 'undefined' ? window : globalThis);
