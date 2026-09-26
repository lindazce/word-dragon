/* Word Dragon RC6 B28-F — canonical browser script load order. */
(function (global) {
  'use strict';

  const scripts = [
    'js/gate-recovery.js',
    'js/gate-recovery-integration.js',
    'js/gate-recovery-controller.js',
    'js/gate-retest-sampler.js',
    'js/gate-retest-history.js',
    'js/gate-recovery-view-model.js',
    'js/gate-recovery-card.js',
    'js/gate-action-guard.js',
    'js/gate-repair-launcher.js',
    'js/gate-repair-scheduler.js',
    'js/gate-repair-coordinator.js',
    'js/gate-repair-activity-adapters.js',
    'js/stage-gate-runtime-adapter.js',
    'js/b28e-stage-gate-bridge.js',
    'js/b28e-stage-gate-integration.js',
    'js/b28e-world-map-gate-router.js',
    'js/b28e-repair-runtime.js',
    'js/b28e-repair-flow.js',
    'js/b28e-runtime-hooks.js',
    'js/gate-recovery-map-adapter.js',
    'js/gate-recovery-bootstrap.js'
  ];

  global.WordDragonGateRecoveryManifest = {
    version: 'B28-F',
    scripts: scripts.slice(),
    styles: ['css/gate-recovery-card.css']
  };
})(typeof window !== 'undefined' ? window : globalThis);
