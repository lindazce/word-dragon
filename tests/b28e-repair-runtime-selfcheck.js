const fs = require('fs');
const vm = require('vm');
global.window = global;
vm.runInThisContext(fs.readFileSync('js/b28e-repair-runtime.js', 'utf8'));

const A = global.WordDragonB28ERepairRuntime;
const assert = (ok, msg) => { if (!ok) throw new Error(msg); };

(async () => {
  const calls = [];
  const activities = A.create({
    startVocabularyRepair: async (item) => { calls.push(item); return { success: true }; },
    startSentenceRepair: async (item) => {
      calls.push(item);
      if (item.skill === 'speaking') return { success: true, score: 8 };
      return { success: true };
    }
  });
  const ctx = { stageId: 2, failedWordIds: ['w1', 'w2'] };

  assert((await activities.vocabulary(ctx)).success === true, 'vocabulary success lost');
  assert(calls.at(-1).skill === 'vocabulary', 'vocabulary route wrong');

  assert((await activities['sentence-listening'](ctx)).success === true, 'listening success lost');
  assert(calls.at(-1).mode === 'blind-listening' && calls.at(-1).skill === 'listening', 'listening route wrong');

  assert((await activities['sentence-order'](ctx)).success === true, 'sentence success lost');
  assert(calls.at(-1).mode === 'sentence-order' && calls.at(-1).skill === 'sentence', 'sentence route wrong');

  let speaking = await activities['sentence-speaking'](ctx);
  assert(speaking.success === false, 'speaking below 9 incorrectly counted');

  const high = A.create({
    startSentenceRepair: async () => ({ success: true, score: 9 })
  });
  speaking = await high['sentence-speaking'](ctx);
  assert(speaking.success === true, 'speaking score 9 should count');

  const noScore = A.create({
    startSentenceRepair: async () => ({ success: true })
  });
  assert((await noScore['sentence-speaking'](ctx)).success === false,
    'speaking success without numeric score must not count');

  const unavailable = A.create({});
  assert((await unavailable.vocabulary(ctx)).success === false, 'unavailable vocabulary counted');
  assert((await unavailable['sentence-listening'](ctx)).success === false, 'unavailable sentence quest counted');

  let sqItem = null;
  global.WDSentenceQuest = { startRepair: (item) => { sqItem = item; return { success: true }; } };
  const sqResult = await A.sentenceQuestStarter({ skill: 'sentence', mode: 'sentence-order' });
  assert(sqResult.success === true && sqItem.mode === 'sentence-order', 'Sentence Quest bridge failed');

  console.log('B28-F B28-E Repair runtime selfcheck PASS');
})().catch((err) => { console.error(err); process.exit(1); });
