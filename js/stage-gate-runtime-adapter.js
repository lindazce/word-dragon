/* Word Dragon RC6 B28-F — Stage Gate lifecycle adapter.
 * Owns sampling/history/recovery orchestration, not formal passage/mastery.
 */
(function (global) {
  'use strict';

  function deps() {
    const required = {
      recovery: global.WordDragonGateRecoveryController,
      history: global.WordDragonGateRetestHistory,
      sampler: global.WordDragonGateRetestSampler
    };
    if (!required.recovery || !required.history || !required.sampler) {
      throw new Error('Gate recovery/history/sampler modules must load first');
    }
    return required;
  }

  function normalizeResult(result) {
    const r = result || {};
    return {
      passed: r.passed === true,
      weakSkills: Array.isArray(r.weakSkills) ? r.weakSkills : [],
      failedWordIds: Array.isArray(r.failedWordIds) ? r.failedWordIds : []
    };
  }

  async function run(options) {
    const opts = options || {};
    const { recovery, history, sampler } = deps();
    if (typeof opts.runGate !== 'function') {
      return { status: 'runtime-unavailable' };
    }

    const isRetest = recovery.getRecoveryView(opts.profile, opts.stageId).mode === 'retest';
    if (isRetest === false && recovery.getRecoveryView(opts.profile, opts.stageId).mode === 'repair') {
      return { status: 'repair-required' };
    }

    const candidates = Array.isArray(opts.candidateQuestionIds) ? opts.candidateQuestionIds : [];
    const count = Math.max(1, Number(opts.questionCount) || 12);
    const previousIds = isRetest ? history.recentIds(opts.profile, opts.stageId, opts.historyDepth || 1) : [];
    const questionIds = sampler.resample(candidates, previousIds, count, opts.randomFn);

    const raw = await opts.runGate({
      stageId: opts.stageId,
      questionIds,
      isRetest
    });
    const result = normalizeResult(raw);

    history.recordAttempt(opts.profile, opts.stageId, questionIds);

    if (result.passed) {
      recovery.passGate(opts.profile, opts.stageId);
      return { status: 'passed', isRetest, questionIds, result, raw };
    }

    recovery.failGate(opts.profile, opts.stageId, result);
    return { status: 'failed', isRetest, questionIds, result, raw };
  }

  global.WordDragonStageGateRuntimeAdapter = { run, normalizeResult };
})(typeof window !== 'undefined' ? window : globalThis);
