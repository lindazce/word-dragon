/* B28-F recovery invariant selfcheck. Run with Node after loading modules. */
const fs = require('fs');
const vm = require('vm');
global.window = global;
vm.runInThisContext(fs.readFileSync('js/gate-recovery.js', 'utf8'));
vm.runInThisContext(fs.readFileSync('js/gate-recovery-integration.js', 'utf8'));

const R = global.WordDragonGateRecovery;
const I = global.WordDragonGateRecoveryIntegration;
const profile = { stageGatePassed: {}, stats: { 101: { mastered: true } } };

I.onGateFailed(profile, 2, { weakSkills: ['listening', 'sentence'], failedWordIds: [101, 102] });
if (I.shouldAllowRetest(profile, 2)) throw new Error('retest unlocked before repairs');
I.onRepairSucceeded(profile, 2, 'listening');
I.onRepairSucceeded(profile, 2, 'listening');
I.onRepairSucceeded(profile, 2, 'sentence');
if (I.shouldAllowRetest(profile, 2)) throw new Error('retest unlocked with incomplete skill');
I.onRepairSucceeded(profile, 2, 'sentence');
if (!I.shouldAllowRetest(profile, 2)) throw new Error('retest did not unlock');
if (profile.stageGatePassed['2']) throw new Error('repair incorrectly granted gate passage');
if (!profile.stats[101].mastered) throw new Error('recovery mutated vocabulary mastery');
I.onGatePassed(profile, 2);
if (R.getPlan(profile, 2)) throw new Error('passed gate did not clear recovery');
console.log('B28-F gate recovery selfcheck PASS');
