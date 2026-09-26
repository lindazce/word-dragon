/* Word Dragon RC6 B28-F — adapters from B28-F Repair to restored B28-E activities. */
(function (global) {
  'use strict';

  function normalizeResult(result) {
    if (result === true) return { success: true };
    if (!result) return { success: false };
    return result;
  }

  function create(runtime) {
    const r = runtime || {};

    return {
      vocabulary: async function (ctx) {
        if (typeof r.startVocabularyRepair !== 'function') return { success: false, reason: 'unavailable' };
        return normalizeResult(await r.startVocabularyRepair({
          stageId: ctx.stageId,
          failedWordIds: ctx.failedWordIds || [],
          skill: 'vocabulary'
        }));
      },

      'sentence-listening': async function (ctx) {
        if (typeof r.startSentenceRepair !== 'function') return { success: false, reason: 'unavailable' };
        return normalizeResult(await r.startSentenceRepair({
          stageId: ctx.stageId,
          failedWordIds: ctx.failedWordIds || [],
          skill: 'listening',
          mode: 'blind-listening'
        }));
      },

      'sentence-order': async function (ctx) {
        if (typeof r.startSentenceRepair !== 'function') return { success: false, reason: 'unavailable' };
        return normalizeResult(await r.startSentenceRepair({
          stageId: ctx.stageId,
          failedWordIds: ctx.failedWordIds || [],
          skill: 'sentence',
          mode: 'sentence-order'
        }));
      },

      'sentence-speaking': async function (ctx) {
        if (typeof r.startSentenceRepair !== 'function') return { success: false, reason: 'unavailable' };
        const result = normalizeResult(await r.startSentenceRepair({
          stageId: ctx.stageId,
          failedWordIds: ctx.failedWordIds || [],
          skill: 'speaking',
          mode: 'sentence-speaking'
        }));
        const score = Number(result.score);
        return Object.assign({}, result, {
          success: result.success === true && Number.isFinite(score) && score >= 9
        });
      }
    };
  }

  function sentenceQuestStarter(item) {
    const sq = global.WDSentenceQuest;
    if (!sq || typeof sq.startRepair !== 'function') {
      return Promise.resolve({ success: false, reason: 'sentence-quest-unavailable' });
    }
    return Promise.resolve(sq.startRepair(item));
  }

  global.WordDragonB28ERepairRuntime = { create, sentenceQuestStarter };
})(typeof window !== 'undefined' ? window : globalThis);
