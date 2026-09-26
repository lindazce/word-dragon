const fs=require('fs');
const p=fs.readFileSync('docs/stage1-curriculum-policy.md','utf8');
for(const x of ['lv1','lv2','lv3/lv4','Due review','Distractor','Sentence Quest','unlock','wrong answer'])if(!p.includes(x))throw new Error('missing Stage 1 policy: '+x);
console.log('Stage 1 curriculum policy selfcheck PASS');
