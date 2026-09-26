/* Word Dragon RC6 B28-F — one-tap B28-E Dragon Repair flow. */
(function (global) {
  'use strict';

  function create(options) {
    const opts = options || {};
    const Coordinator = global.WordDragonGateRepairCoordinator;
    const Runtime = global.WordDragonB28ERepairRuntime;

    if (!Coordinator || !Runtime) throw new Error('B28-F repair dependencies unavailable');

    const activities = Runtime.create({
      startVocabularyRepair: opts.startVocabularyRepair,
      startSentenceRepair: opts.startSentenceRepair || Runtime.sentenceQuestStarter
    });

    async function continueRepair() {
      const result = await Coordinator.continueRepair({
        profile: opts.profile,
        stageId: opts.stageId,
        activities
      });
      if (typeof opts.onStateChange === 'function') {
        await opts.onStateChange(result);
      }
      return result;
    }

    return { continueRepair };
  }

  global.WordDragonB28ERepairFlow = { create };
})(typeof window !== 'undefined' ? window : globalThis);
