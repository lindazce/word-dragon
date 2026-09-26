const fs=require('fs'),vm=require('vm');global.window=global;vm.runInThisContext(fs.readFileSync('js/phrase-chunks.js','utf8'));
const P=global.WordDragonPhraseChunks,a=(x,m)=>{if(!x)throw new Error(m)};
let x=P.pick('The two pictures contrast sharply with each other.','contrast');
a(x.includes('contrast'),'contrast missing');a(x!=='the two pictures contrast','mechanical weak-start chunk selected');
x=P.pick('We need strong evidence for this conclusion.','evidence');
a(x.includes('evidence')&&!x.endsWith(' for'),'dangling preposition selected');
x=P.pick('Students compare evidence carefully before writing.','evidence');
a(x.includes('evidence'),'content target missing');
for(const [s,w] of [['This method works well in practice.','method'],['They reached an important conclusion after discussion.','conclusion'],['The result depends on careful observation.','result']]){
 const q=P.pick(s,w);a(q.includes(w),w+' target missing');a(q.split(' ').length>=2&&q.split(' ').length<=4,w+' bad chunk length');
}
console.log('B28-H phrase chunk quality selfcheck PASS');
