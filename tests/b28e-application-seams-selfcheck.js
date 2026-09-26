const fs = require('fs');
const assert = (ok, msg) => { if (!ok) throw new Error(msg); };

const patch = fs.readFileSync('patches/b28e-b28f-application-seams.patch', 'utf8');
assert(patch.includes("typeof window.WDB28FGateFinished==='function'"), 'finish hook guard missing');
assert(patch.includes('profile,stageId:idx,passed,score,total,skills,wrong'), 'Gate result payload incomplete');
assert(patch.includes('window.WDB28FWorldMapGateAction?'), 'map hook missing');
assert(patch.includes(':startStageGate(${s.current})'), 'B28-E fallback missing');
assert(!patch.includes('profile.stageGates[idx].passed=true'), 'patch must not grant passage');
console.log('B28-F B28-E additive application seams selfcheck PASS');
