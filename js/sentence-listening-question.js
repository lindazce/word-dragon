/* B28-G: build a deterministic four-choice target-word listening question. */
(function(global){
'use strict';
function norm(s){return String(s||'').toLowerCase().replace(/[^a-z'-]/g,'')}
function build(word,sentence,pool){
 const target=norm(word), seen=new Set([target]), choices=[word];
 for(const x of (pool||[])){
   const w=typeof x==='string'?x:x?.w, n=norm(w);
   if(!n||seen.has(n)||n===target)continue;
   seen.add(n);choices.push(w);if(choices.length===4)break;
 }
 // Stable rotation avoids an always-first correct answer without introducing test randomness.
 const shift=(target.length+(sentence||'').length)%Math.max(1,choices.length);
 const rotated=choices.slice(shift).concat(choices.slice(0,shift));
 const first=(String(word||'').match(/[A-Za-z]/)||['?'])[0].toUpperCase();
 return {target,choices:rotated,hint:first+' · '+String(word||'').length+' letters',sentence:String(sentence||''),isCorrect:v=>norm(v)===target};
}
global.WordDragonSentenceListeningQuestion={build};
})(typeof window!=='undefined'?window:globalThis);
