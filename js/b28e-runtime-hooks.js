/* Word Dragon RC6 B28-F — runtime hooks installed into restored B28-E globals.
 * B28-E keeps ownership of Gate rendering/scoring and formal stage passage.
 */
(function (global) {
  'use strict';

  function profile() {
    return global.profile || null;
  }

  function stageGatePayload(raw) {
    const skills = raw && raw.skills || {};
    const wrong = raw && raw.wrong || [];
    const skillResults = {};
    ['vocabulary', 'listening', 'sentence', 'speaking'].forEach((skill) => {
      const x = skills[skill];
      if (!x) return;
      skillResults[skill] = {
        correct: Number(x.correct ?? x.ok ?? 0),
        total: Number(x.total ?? 0),
        skipped: x.skipped === true || x.tested === false
      };
    });
    return {
      passed: raw && raw.passed === true,
      correct: Number(raw && raw.score) || 0,
      total: Number(raw && raw.total) || 0,
      skillResults,
      failedWordIds: wrong.map((x) => x && (x.wordId ?? x.id ?? x.word ?? x.w)).filter(Boolean)
    };
  }

  global.WDB28FGateFinished = function (raw) {
    const I = global.WordDragonB28EStageGateIntegration;
    const p = raw && raw.profile || profile();
    if (!I || !p) return { status: 'integration-unavailable' };
    return I.finish(p, raw.stageId, stageGatePayload(raw));
  };

  function startVocabularyRepair(item) {
    if (typeof global.startRepairQuest !== 'function') {
      return Promise.resolve({ success: false, reason: 'vocabulary-repair-unavailable' });
    }
    return Promise.resolve(global.startRepairQuest(item));
  }

  function startSentenceRepair(item) {
    const R = global.WordDragonB28ERepairRuntime;
    if (!R) return Promise.resolve({ success: false, reason: 'sentence-repair-unavailable' });
    return R.sentenceQuestStarter(item);
  }

  global.WDB28FWorldMapGateAction = async function (stageId) {
    const Router = global.WordDragonB28EWorldMapGateRouter;
    const Flow = global.WordDragonB28ERepairFlow;
    const p = profile();

    if (!Router || !p) {
      if (typeof global.startStageGate === 'function') return global.startStageGate(stageId);
      return { status: 'gate-unavailable' };
    }

    return Router.run({
      profile: p,
      stageId,
      onGate: () => typeof global.startStageGate === 'function'
        ? global.startStageGate(stageId)
        : { status: 'gate-unavailable' },
      onRetest: () => typeof global.startStageGate === 'function'
        ? global.startStageGate(stageId, { isRetest: true })
        : { status: 'gate-unavailable' },
      onRepair: async () => {
        if (!Flow) return { status: 'repair-unavailable' };
        const flow = Flow.create({
          profile: p,
          stageId,
          startVocabularyRepair,
          startSentenceRepair,
          onStateChange: () => {
            if (global.WDWorldMap && typeof global.WDWorldMap.render === 'function') {
              global.WDWorldMap.render();
            } else if (typeof global.render === 'function') {
              global.render();
            }
          }
        });
        return flow.continueRepair();
      },
      onContinue: () => {
        if (global.WDWorldMap && typeof global.WDWorldMap.render === 'function') {
          return global.WDWorldMap.render();
        }
        return { status: 'already-passed' };
      }
    });
  };

  global.WordDragonB28ERuntimeHooks = { stageGatePayload };
})(typeof window !== 'undefined' ? window : globalThis);
