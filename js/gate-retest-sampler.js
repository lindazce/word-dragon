/* Word Dragon RC6 B28-F — retest resampling helper.
 * Prefer unseen candidate IDs from the same skill; fall back only when pool is small.
 */
(function (global) {
  'use strict';

  function unique(values) {
    return [...new Set((values || []).filter((v) => v !== null && v !== undefined))];
  }

  function sampleWithoutReplacement(values, count, randomFn) {
    const rng = typeof randomFn === 'function' ? randomFn : Math.random;
    const pool = unique(values).slice();
    for (let i = pool.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rng() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, Math.max(0, count || 0));
  }

  function resample(candidateIds, previousIds, count, randomFn) {
    const candidates = unique(candidateIds);
    const previous = new Set(unique(previousIds));
    const fresh = candidates.filter((id) => !previous.has(id));
    const chosen = sampleWithoutReplacement(fresh, count, randomFn);
    if (chosen.length >= count) return chosen;
    const fallback = candidates.filter((id) => !chosen.includes(id));
    return chosen.concat(sampleWithoutReplacement(fallback, count - chosen.length, randomFn));
  }

  global.WordDragonGateRetestSampler = {
    resample,
    sampleWithoutReplacement
  };
})(typeof window !== 'undefined' ? window : globalThis);
