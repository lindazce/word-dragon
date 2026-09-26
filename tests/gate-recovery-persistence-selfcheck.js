/* B28-F JSON persistence/refresh selfcheck. */
const fs = require('fs');
const vm = require('vm');
global.window = global;
[
  'js/gate-recovery.js',
  'js/gate-recovery-integration.js',
  'js/gate-recovery-controller.js',
  'js/gate-retest-history.js'
].forEach((path) => vm.runInThisContext(fs.readFileSync(path, 'utf8')));

const C = global.WordDragonGateRecoveryController;
const H = global.WordDragonGateRetestHistory;
const assert = (ok, msg) => { if (!ok) throw new Error(msg); };

let profile = { stats: { a: { mastered: true } }, stageGatePassed: {} };
C.failGate(profile, 3, { weakSkills: ['vocabulary', 'speaking'], failedWordIds: ['a'] });
C.completeRepair(profile, 3, 'vocabulary');
H.recordAttempt(profile, 3, ['v1','v2','s1','s2']);

const snapshot = JSON.stringify(profile);
profile = JSON.parse(snapshot); // simulate localStorage/NAS JSON round trip + refresh

let view = C.getRecoveryView(profile, 3);
assert(view.mode === 'repair', 'refresh lost recovery mode');
const vocab = view.skills.find((x) => x.skill === 'vocabulary');
const speaking = view.skills.find((x) => x.skill === 'speaking');
assert(vocab.completed === 1 && vocab.required === 2, 'refresh lost vocabulary repair count');
assert(speaking.completed === 0 && speaking.required === 2, 'refresh corrupted speaking count');
assert(H.recentIds(profile, 3, 1).join(',') === 'v1,v2,s1,s2', 'refresh lost Gate history');

C.completeRepair(profile, 3, 'vocabulary');
C.completeRepair(profile, 3, 'speaking');
C.completeRepair(profile, 3, 'speaking');
assert(C.canStartGate(profile, 3), 'restored profile could not finish recovery');
assert(profile.stats.a.mastered === true, 'persistence flow changed mastery');

console.log('B28-F Gate Recovery persistence selfcheck PASS');
