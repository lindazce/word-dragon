/* Run all B28-F Node selfchecks from repository root. */
const { spawnSync } = require('child_process');

const tests = [
  'tests/gate-recovery-selfcheck.js',
  'tests/gate-recovery-controller-selfcheck.js',
  'tests/gate-retest-sampler-selfcheck.js',
  'tests/gate-recovery-e2e-selfcheck.js',
  'tests/gate-recovery-edge-selfcheck.js',
  'tests/gate-recovery-persistence-selfcheck.js',
  'tests/gate-recovery-card-selfcheck.js',
  'tests/gate-repair-launcher-selfcheck.js',
  'tests/gate-repair-coordinator-selfcheck.js',
  'tests/gate-repair-activity-adapters-selfcheck.js',
  'tests/stage-gate-runtime-adapter-selfcheck.js',
  'tests/gate-action-guard-selfcheck.js',
  'tests/gate-recovery-migration-selfcheck.js',
  'tests/gate-recovery-bootstrap-selfcheck.js',
  'tests/b28e-stage-gate-bridge-selfcheck.js',
  'tests/b28e-stage-gate-integration-selfcheck.js',
  'tests/b28e-world-map-gate-router-selfcheck.js',
  'tests/b28e-repair-runtime-selfcheck.js',
  'tests/b28e-repair-flow-selfcheck.js',
  'tests/b28e-gate-recovery-lifecycle-selfcheck.js',
  'tests/b28e-application-seams-selfcheck.js',
  'tests/b28e-runtime-hooks-selfcheck.js',
  'tests/b28e-load-block-selfcheck.js',
  'tests/b28e-sentence-repair-promise-selfcheck.js',
  'tests/b28e-retest-sampling-seam-selfcheck.js',
  'tests/listening-ladder-selfcheck.js',
  'tests/sentence-listening-ladder-adapter-selfcheck.js',
  'tests/sentence-listening-question-selfcheck.js',
  'tests/b28g-sentence-listening-ui-seam-selfcheck.js',
  'tests/b28g-listening-lifecycle-selfcheck.js',
  'tests/phrase-chunks-selfcheck.js'
];

let failed = 0;
for (const test of tests) {
  const result = spawnSync(process.execPath, [test], { encoding: 'utf8' });
  const output = (result.stdout || '').trim();
  if (output) console.log(output);
  if (result.status !== 0) {
    failed += 1;
    console.error(`FAIL: ${test}`);
    if (result.stderr) console.error(result.stderr.trim());
  }
}

if (failed) {
  console.error(`B28-F selfchecks FAILED: ${failed}/${tests.length}`);
  process.exit(1);
}
console.log(`B28-F selfchecks PASS: ${tests.length}/${tests.length}`);
