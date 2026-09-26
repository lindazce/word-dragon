const fs = require('fs');
const vm = require('vm');
global.window = global;
vm.runInThisContext(fs.readFileSync('js/gate-repair-activity-adapters.js', 'utf8'));

const A = global.WordDragonGateRepairActivityAdapters;
const assert = (ok, msg) => { if (!ok) throw new Error(msg); };

(async () => {
  let seenListeningMode = null;
  let seenSentenceMode = null;
  let seenSpeakingMode = null;

  const activities = A.create({
    vocabulary: async () => ({ correct: true }),
    listening: async (ctx) => {
      seenListeningMode = ctx.mode;
      return { correct: true };
    },
    sentence: async (ctx) => {
      seenSentenceMode = ctx.mode;
      return { completed: true };
    },
    speaking: async (ctx) => {
      seenSpeakingMode = ctx.mode;
      return { score: 9 };
    }
  });

  assert((await activities.vocabulary({})).success, 'correct vocabulary repair should pass');
  assert((await activities['sentence-listening']({})).success, 'correct listening repair should pass');
  assert(seenListeningMode === 'blind-listening', 'listening adapter must request blind listening');
  assert((await activities['sentence-order']({})).success, 'completed sentence repair should pass');
  assert(seenSentenceMode === 'sentence-order', 'sentence adapter mode wrong');

  let out = await activities['sentence-speaking']({});
  assert(out.success && out.score === 9, '9/10 speaking should pass');
  assert(seenSpeakingMode === 'sentence-speaking', 'speaking adapter mode wrong');

  const low = A.speaking(async () => ({ score: 8.9 }));
  out = await low({});
  assert(!out.success, '8.9 speaking must not count');

  const missingScore = A.speaking(async () => ({ success: true }));
  out = await missingScore({});
  assert(!out.success, 'speaking success flag without score must not count');

  const failedListening = A.listening(async () => ({ correct: false }));
  assert(!(await failedListening({})).success, 'wrong listening must not count');

  const unavailable = A.create({});
  assert(!(await unavailable.vocabulary({})).success, 'missing vocabulary runtime must fail safely');
  assert(!(await unavailable['sentence-speaking']({})).success, 'missing speaking runtime must fail safely');

  console.log('B28-F Gate Repair activity adapters selfcheck PASS');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
