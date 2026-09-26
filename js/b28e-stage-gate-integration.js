/* Word Dragon RC6 B28-F — application integration helpers for restored B28-E.
 * Pure helpers: no DOM, no mastery mutation, no passage mutation.
 */
(function (global) {
  'use strict';

  function uniq(values) {
    return Array.from(new Set((values || []).filter((v) => v !== undefined && v !== null)));
  }

  function buildAttempt(gateState) {
    const g = gateState || {};
    const skillResults = g.skillResults || {};
    const testedSkills = [];
    const weakSkills = [];

    ['vocabulary', 'listening', 'sentence', 'speaking'].forEach((skill) => {
      const result = skillResults[skill];
      if (!result || result.skipped === true || result.tested === false) return;
      testedSkills.push(skill);

      const correct = Number(result.correct) || 0;
      const total = Number(result.total) || 0;
      // B28-E Gate rule: each tested skill must reach 2/3.
      if (total > 0 && correct / total < 2 / 3) weakSkills.push(skill);
    });

    const totalCorrect = Number(g.correct) || 0;
    const totalQuestions = Number(g.total) || 0;
    const totalPass = totalQuestions > 0 && totalCorrect / totalQuestions >= 0.8;
    const skillPass = weakSkills.length === 0;

    return {
      passed: g.passed === true || (totalPass && skillPass),
      testedSkills,
      weakSkills,
      failedWordIds: uniq(g.failedWordIds || g.wrongWordIds || [])
    };
  }

  function finish(profile, stageId, gateState) {
    const bridge = global.WordDragonB28EStageGateBridge;
    if (!bridge) return { status: 'bridge-unavailable', attempt: buildAttempt(gateState) };
    const attempt = buildAttempt(gateState);
    const outcome = bridge.finish(profile, stageId, attempt);
    return Object.assign({ attempt }, outcome);
  }

  function mapMode(profile, stageId) {
    const controller = global.WordDragonGateRecoveryController;
    if (!controller) return 'gate';
    const view = controller.getRecoveryView(profile, stageId);
    return view && view.mode ? view.mode : 'gate';
  }

  global.WordDragonB28EStageGateIntegration = { buildAttempt, finish, mapMode };
})(typeof window !== 'undefined' ? window : globalThis);
