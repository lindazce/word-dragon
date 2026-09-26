const fs=require('fs'),vm=require('vm');global.window=global;
for(const p of ['js/listening-ladder.js','js/sentence-listening-ladder-adapter.js','js/sentence-listening-question.js'])vm.runInThisContext(fs.readFileSync(p,'utf8'));
const a=(x,m)=>{if(!x)throw new Error(m)};
const A=global.WordDragonSentenceListeningLadderAdapter,Q=global.WordDragonSentenceListeningQuestion;
const profile={xp:12,stats:{word:{mastered:true}},stageGatePassed:{0:true}};
const protectedState=JSON.stringify({xp:profile.xp,stats:profile.stats,stageGatePassed:profile.stageGatePassed});
const question=Q.build('contrast','The two pictures contrast sharply.',['future','evidence','contrast','method','result']);

// Normal quest: blind miss -> hint miss -> full correct -> puzzle is the caller's next stage.
let s=A.create(profile,{repair:false});
a(s.prompt().level==='blind','normal quest must start blind');
a(!s.answer(false).success&&s.prompt().level==='hint','normal first miss must enter hint');
a(!s.answer(false).success&&s.prompt().level==='full','normal second miss must enter full');
let out=s.answer(question.isCorrect('contrast'));
a(out.success&&out.level==='full'&&!out.repairCompleted,'normal full recovery must not complete repair');

// Perfect normal quest stays distinct.
s=A.create(profile,{repair:false});out=s.answer(true);
a(out.success&&out.blindPerfect&&!out.repairCompleted,'normal blind perfect wrong');

// Listening Repair: playback alone is outside adapter; only scored correct can complete.
s=A.create(profile,{repair:true});
a(s.prompt().level==='blind','repair must start blind');
out=s.answer(false);a(!out.success&&out.prompt.level==='hint','repair miss must not complete');
out=s.answer(true);a(out.success&&out.repairCompleted&&out.level==='hint'&&!out.blindPerfect,'hint repair recovery wrong');

// Cancelled repair never completes.
s=A.create(profile,{repair:true});out=s.cancel();
a(!out.success&&out.cancelled&&out.repairCompleted===false,'cancelled repair completed');

// Formal progression remains untouched.
a(JSON.stringify({xp:profile.xp,stats:profile.stats,stageGatePassed:profile.stageGatePassed})===protectedState,'lifecycle contaminated formal progress');
console.log('B28-G listening lifecycle selfcheck PASS');
