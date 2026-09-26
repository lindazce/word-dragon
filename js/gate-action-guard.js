/* Word Dragon RC6 B28-F — single-flight guard for Gate/Repair UI actions. */
(function (global) {
  'use strict';

  const flights = new Map();

  function key(stageId, action) {
    return String(stageId) + ':' + String(action || 'primary');
  }

  function run(stageId, action, task) {
    const k = key(stageId, action);
    if (flights.has(k)) return flights.get(k);

    const promise = Promise.resolve()
      .then(task)
      .finally(() => {
        if (flights.get(k) === promise) flights.delete(k);
      });

    flights.set(k, promise);
    return promise;
  }

  function busy(stageId, action) {
    return flights.has(key(stageId, action));
  }

  global.WordDragonGateActionGuard = { run, busy };
})(typeof window !== 'undefined' ? window : globalThis);
