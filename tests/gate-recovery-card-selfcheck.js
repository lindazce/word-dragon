const fs = require('fs');
const vm = require('vm');
global.window = global;
vm.runInThisContext(fs.readFileSync('js/gate-recovery-card.js', 'utf8'));

const Card = global.WordDragonGateRecoveryCard;
const assert = (ok, msg) => { if (!ok) throw new Error(msg); };

const gate = Card.render({
  state: 'gate', title: '守门挑战', actionLabel: '开始挑战', actionEnabled: true, skills: []
});
assert(gate.includes('data-state="gate"'), 'gate state missing');
assert(gate.includes('开始挑战'), 'gate action missing');

const repair = Card.render({
  state: 'repair',
  badge: '需要修复',
  title: 'Dragon Repair',
  actionLabel: '继续修复',
  actionEnabled: true,
  progressText: '3/4 次有效修复',
  skills: [
    { key: 'listening', label: '听力', completed: 2, required: 2, done: true },
    { key: 'sentence', label: '句子', completed: 1, required: 2, done: false }
  ]
});
assert(repair.includes('3/4 次有效修复'), 'repair progress missing');
assert(repair.includes('听力 <b>✓</b>'), 'completed skill marker missing');
assert(repair.includes('句子 <b>1/2</b>'), 'unfinished skill progress missing');

const retest = Card.render({
  state: 'retest', badge: '修复完成', title: '重新挑战守门测试',
  actionLabel: '重新挑战', actionEnabled: true, skills: []
});
assert(retest.includes('重新挑战'), 'retest action missing');

const escaped = Card.render({
  state: 'gate', title: '<script>alert(1)</script>', actionLabel: 'Go & test', skills: []
});
assert(!escaped.includes('<script>'), 'renderer must escape injected markup');
assert(escaped.includes('&lt;script&gt;'), 'escaped title missing');

console.log('B28-F Gate Recovery card selfcheck PASS');
