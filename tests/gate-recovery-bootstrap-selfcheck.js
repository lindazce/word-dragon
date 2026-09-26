const fs = require('fs');
const vm = require('vm');
global.window = global;

const manifestSource = fs.readFileSync('js/gate-recovery-manifest.js', 'utf8');
vm.runInThisContext(manifestSource);
const manifest = global.WordDragonGateRecoveryManifest;
const assert = (ok, msg) => { if (!ok) throw new Error(msg); };

assert(['B28-F','B28-G'].includes(manifest.version), 'manifest version wrong');
assert(new Set(manifest.scripts).size === manifest.scripts.length, 'manifest contains duplicate scripts');
manifest.scripts.forEach((path) => assert(fs.existsSync(path), 'manifest file missing: ' + path));
manifest.styles.forEach((path) => assert(fs.existsSync(path), 'manifest style missing: ' + path));

// Load exactly in canonical browser order.
manifest.scripts.forEach((path) => vm.runInThisContext(fs.readFileSync(path, 'utf8')));

// Migration is intentionally loaded separately before bootstrap in B28-E integration.
vm.runInThisContext(fs.readFileSync('js/gate-recovery-profile-migration.js', 'utf8'));

const B = global.WordDragonGateRecoveryBootstrap;
assert(B && typeof B.mount === 'function', 'bootstrap unavailable after canonical load');

const profile = { xp: 9, stageGatePassed: {}, stats: {} };
const protectedBefore = JSON.stringify({ xp: profile.xp, stageGatePassed: profile.stageGatePassed, stats: profile.stats });

// Minimal DOM stub for initial Gate card mount.
const button = { addEventListener: () => {} };
const container = {
  innerHTML: '',
  querySelector: () => button
};

B.mount({
  container,
  profile,
  stageId: 1,
  runtime: {},
  onGate: () => {}
});

assert(profile.featureSchema.gateRecovery === 1, 'bootstrap did not migrate profile');
assert(container.innerHTML.includes('wd-gate-recovery-card'), 'bootstrap did not render Gate card');
assert(JSON.stringify({ xp: profile.xp, stageGatePassed: profile.stageGatePassed, stats: profile.stats }) === protectedBefore,
  'bootstrap migration changed protected progress');

console.log('B28-F bootstrap integration selfcheck PASS');
