/* Word Dragon RC6 B28-F — additive profile migration only. */
(function (global) {
  'use strict';

  const SCHEMA_VERSION = 1;

  function migrate(profile) {
    if (!profile || typeof profile !== 'object') throw new Error('profile required');

    if (!profile.gateRecovery || typeof profile.gateRecovery !== 'object') {
      profile.gateRecovery = {};
    }
    if (!profile.gateRetestHistory || typeof profile.gateRetestHistory !== 'object') {
      profile.gateRetestHistory = {};
    }
    if (!profile.featureSchema || typeof profile.featureSchema !== 'object') {
      profile.featureSchema = {};
    }

    const previous = Number(profile.featureSchema.gateRecovery) || 0;
    if (previous < SCHEMA_VERSION) {
      profile.featureSchema.gateRecovery = SCHEMA_VERSION;
    }

    return {
      profile,
      fromVersion: previous,
      toVersion: SCHEMA_VERSION,
      changed: previous !== SCHEMA_VERSION
    };
  }

  global.WordDragonGateRecoveryProfileMigration = { SCHEMA_VERSION, migrate };
})(typeof window !== 'undefined' ? window : globalThis);
