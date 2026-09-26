const fs = require('fs');
const vm = require('vm');
global.window = global;
[
  'js/gate-recovery.js',
  'js/gate-recovery-integration.js',
  'js/gate-recovery-controller.js'
].forEach((path) => vm.runInThisContext(fs.readFileSync(path, 'utf8')));

const C = global.WordDragonGateRecoveryController;
const profile = { stageGatePassed: {}, stats: { apple: { mastered: false } } };

C.failGate(profile, 'forest', {
  weakSkills: ['vocabulary', 'speaking'],
  failedWordIds: ['apple']
});

let view = C.getRecoveryView(profile, 'forest');
if (view.mode !== 'repair' || C.canStartGate(profile, 'forest')) {
  throw new Error('failed gate must enter locked repair mode');
}

C.completeRepair(profile, 'forest', 'vocabulary');
C.completeRepair(profile, 'forest', 'vocabulary');
C.completeRepair(profile, 'forest', 'speaking');
view = C.getRecoveryView(profile, 'forest');
if (view.readyForRetest) throw new Error('partial repair unlocked retest');

C.completeRepair(profile, 'forest', 'speaking');
view = C.getRecoveryView(profile, 'forest');
if (view.mode !== 'retest' || !C.canStartGate(profile, 'forest')) {
  throw new Error('completed repair did not unlock retest');
}

if (profile.stageGatePassed.forest) throw new Error('repair granted gate passage');
if (profile.stats.apple.mastered !== false) throw new Error('repair changed formal mastery');

C.passGate(profile, 'forest');
view = C.getRecoveryView(profile, 'forest');
if (view.mode !== 'gate') throw new Error('gate pass did not clear recovery');

console.log('B28-F Gate Recovery controller selfcheck PASS');
