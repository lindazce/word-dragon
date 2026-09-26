/* Word Dragon RC6 B28-F — Stage Gate attempt history.
 * Keeps recent Gate question IDs for resampling; does not affect mastery or passage.
 */
(function (global) {
  'use strict';

  const MAX_ATTEMPTS_PER_STAGE = 5;

  function ensure(profile) {
    if (!profile || typeof profile !== 'object') throw new Error('profile required');
    if (!profile.gateRetestHistory || typeof profile.gateRetestHistory !== 'object') {
      profile.gateRetestHistory = {};
    }
    return profile.gateRetestHistory;
  }

  function recordAttempt(profile, stageId, questions) {
    const store = ensure(profile);
    const key = String(stageId);
    const ids = [...new Set((questions || []).map((q) =>
      typeof q === 'object' && q !== null ? (q.id ?? q.questionId) : q
    ).filter((id) => id !== null && id !== undefined))];
    const attempts = Array.isArray(store[key]) ? store[key] : [];
    attempts.push({ ids, at: Date.now() });
    store[key] = attempts.slice(-MAX_ATTEMPTS_PER_STAGE);
    return store[key];
  }

  function recentIds(profile, stageId, attemptCount) {
    const store = ensure(profile);
    const attempts = Array.isArray(store[String(stageId)]) ? store[String(stageId)] : [];
    const count = Math.max(1, attemptCount || 1);
    return [...new Set(attempts.slice(-count).flatMap((attempt) => attempt.ids || []))];
  }

  function clearStage(profile, stageId) {
    const store = ensure(profile);
    delete store[String(stageId)];
  }

  global.WordDragonGateRetestHistory = {
    MAX_ATTEMPTS_PER_STAGE,
    ensure,
    recordAttempt,
    recentIds,
    clearStage
  };
})(typeof window !== 'undefined' ? window : globalThis);
