const fs=require('fs'),vm=require('vm');global.window=global;
vm.runInThisContext(fs.readFileSync('js/sentence-listening-question.js','utf8'));
const a=(x,m)=>{if(!x)throw new Error(m)},Q=global.WordDragonSentenceListeningQuestion;
const x=Q.build("can't","I can't believe it happened.",['believe','happen','careful','can't','future']);
a(x.choices.length===4,'must build four choices');a(new Set(x.choices.map(v=>v.toLowerCase())).size===4,'choices must be unique');
a(x.isCorrect("CAN'T"),'normalization failed');a(!x.isCorrect('believe'),'distractor accepted');
a(x.hint.startsWith('C · '),'partial hint wrong');a(x.sentence.includes("can't"),'full sentence missing');
console.log('B28-G listening question builder selfcheck PASS');
