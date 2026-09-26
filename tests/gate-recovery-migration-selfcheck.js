const fs = require('fs');
const vm = require('vm');
global.window = global;
vm.runInThisContext(fs.readFileSync('js/gate-recovery-profile-migration.js', 'utf8'));

const M = global.WordDragonGateRecoveryProfileMigration;
const assert = (ok, msg) => { if (!ok) throw new Error(msg); };

const legacy = {
  xp: 1234,
  stageGatePassed: { forest: true },
  stats: { apple: { mastered: true, correct: 7 } },
  skillProgress: { sentenceQuest: { perfect: 4 } }
};
const protectedBefore = JSON.stringify({
  xp: legacy.xp,
  stageGatePassed: legacy.stageGatePassed,
  stats: legacy.stats,
  skillProgress: legacy.skillProgress
});

let out = M.migrate(legacy);
assert(out.changed === true && out.fromVersion === 0 && out.toVersion === 1, 'legacy migration version wrong');
assert(legacy.gateRecovery && legacy.gateRetestHistory, 'B28-F stores missing');
assert(legacy.featureSchema.gateRecovery === 1, 'schema marker missing');
assert(JSON.stringify({
  xp: legacy.xp,
  stageGatePassed: legacy.stageGatePassed,
  stats: legacy.stats,
  skillProgress: legacy.skillProgress
}) === protectedBefore, 'migration changed protected B28-E progress');

out = M.migrate(legacy);
assert(out.changed === false, 'migration must be idempotent');

console.log('B28-F profile migration selfcheck PASS');
