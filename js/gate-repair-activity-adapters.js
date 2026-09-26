/* Word Dragon RC6 B28-F — adapters for existing B28-E learning activities.
 * Inject existing runtime functions; normalize their outcomes for Gate Repair.
 */
(function (global) {
  'use strict';

  function bool(value) {
    return value === true;
  }

  function vocabulary(run) {
    return async (ctx) => {
      if (typeof run !== 'function') return { success: false, reason: 'runtime-unavailable' };
      const out = await run(ctx);
      const success = bool(out?.success) || bool(out?.correct) || bool(out?.completed);
      return { success, reason: success ? 'completed' : (out?.reason || 'not-completed'), source: out || null };
    };
  }

  function listening(run) {
    return async (ctx) => {
      if (typeof run !== 'function') return { success: false, reason: 'runtime-unavailable' };
      const out = await run({ ...ctx, mode: 'blind-listening' });
      const success = bool(out?.success) || bool(out?.correct);
      return { success, reason: success ? 'completed' : (out?.reason || 'not-correct'), source: out || null };
    };
  }

  function sentence(run) {
    return async (ctx) => {
      if (typeof run !== 'function') return { success: false, reason: 'runtime-unavailable' };
      const out = await run({ ...ctx, mode: 'sentence-order' });
      const success = bool(out?.success) || bool(out?.completed) || bool(out?.correct);
      return { success, reason: success ? 'completed' : (out?.reason || 'not-completed'), source: out || null };
    };
  }

  function speaking(run, threshold) {
    const minScore = Number.isFinite(threshold) ? threshold : 9;
    return async (ctx) => {
      if (typeof run !== 'function') return { success: false, reason: 'runtime-unavailable' };
      const out = await run({ ...ctx, mode: 'sentence-speaking', threshold: minScore });
      const score = Number(out?.score);
      const success = Number.isFinite(score) && score >= minScore;
      return {
        success,
        score: Number.isFinite(score) ? score : null,
        threshold: minScore,
        reason: success ? 'completed' : (out?.reason || 'below-threshold'),
        source: out || null
      };
    };
  }

  function create(runtime) {
    const r = runtime || {};
    return {
      vocabulary: vocabulary(r.vocabulary),
      'sentence-listening': listening(r.listening),
      'sentence-order': sentence(r.sentence),
      'sentence-speaking': speaking(r.speaking, r.speakingThreshold)
    };
  }

  global.WordDragonGateRepairActivityAdapters = {
    vocabulary,
    listening,
    sentence,
    speaking,
    create
  };
})(typeof window !== 'undefined' ? window : globalThis);
