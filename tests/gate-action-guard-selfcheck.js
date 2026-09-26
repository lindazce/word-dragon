const fs = require('fs');
const vm = require('vm');
global.window = global;
vm.runInThisContext(fs.readFileSync('js/gate-action-guard.js', 'utf8'));

const G = global.WordDragonGateActionGuard;
const assert = (ok, msg) => { if (!ok) throw new Error(msg); };

(async () => {
  let calls = 0;
  let release;
  const wait = new Promise((resolve) => { release = resolve; });
  const task = async () => { calls += 1; await wait; return 'done'; };

  const a = G.run(1, 'gate', task);
  const b = G.run(1, 'gate', task);
  assert(a === b, 'duplicate action must share the same in-flight promise');
  assert(G.busy(1, 'gate'), 'guard should report busy');
  await Promise.resolve();
  assert(calls === 1, 'duplicate click started task twice');

  release();
  assert(await a === 'done', 'guard lost task result');
  assert(!G.busy(1, 'gate'), 'guard did not clear after completion');

  await G.run(1, 'gate', async () => { calls += 1; });
  assert(calls === 2, 'new action after completion should run');

  let repairCalls = 0;
  await Promise.all([
    G.run(1, 'repair', async () => { repairCalls += 1; }),
    G.run(2, 'repair', async () => { repairCalls += 1; })
  ]);
  assert(repairCalls === 2, 'different stages must not block each other');

  console.log('B28-F Gate action guard selfcheck PASS');
})().catch((error) => { console.error(error); process.exit(1); });
