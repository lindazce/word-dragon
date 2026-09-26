/* Word Dragon RC6 B28-H — Phrase Power adapter for Sentence Quest. */
(function(global){
'use strict';
function create(profile,word,sentence){
 const P=global.WordDragonPhraseChunks;if(!P)throw new Error('phrase-chunks.js must load first');
 const chunk=P.pick(sentence,word);let attempts=0,done=false;
 function view(){return {chunk,active:!!chunk,attempts,firstPassEligible:attempts===0&&!done}}
 function result(sentenceCorrect){
  if(done)return {recorded:false,chunk};
  attempts++;
  if(sentenceCorrect){
   done=true;P.record(profile,chunk,attempts===1);
   return {recorded:true,chunk,firstPass:attempts===1,recovery:attempts>1};
  }
  return {recorded:false,chunk,attempts};
 }
 return {view,result};
}
global.WordDragonSentencePhrasePower={create};
})(typeof window!=='undefined'?window:globalThis);
