/* Word Dragon RC6 B28-H — phrase/chunk learning core.
 * Independent skill telemetry; never writes formal vocabulary mastery.
 */
(function(global){
'use strict';
const STOP=new Set('a an the to of in on at for from with and or but is are was were be been being do does did have has had this that these those it its i you he she we they my your his her our their'.split(' '));
function words(s){return String(s||'').toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g)||[]}
function candidates(sentence,target){
 const ws=words(sentence), t=String(target||'').toLowerCase(), out=[];
 for(let n=2;n<=4;n++)for(let i=0;i+n<=ws.length;i++){
  const part=ws.slice(i,i+n); if(!part.includes(t))continue;
  const content=part.filter(w=>!STOP.has(w));
  if(content.length<1)continue;
  const text=part.join(' '); if(!out.includes(text))out.push(text);
 }
 return out.sort((a,b)=>{
  const aw=words(a),bw=words(b);
  const as=aw.filter(w=>!STOP.has(w)).length,bs=bw.filter(w=>!STOP.has(w)).length;
  return (bs-as)||(aw.length-bw.length);
 });
}
function pick(sentence,target){return candidates(sentence,target)[0]||''}
function ensure(profile){
 if(!profile.phraseChunks||typeof profile.phraseChunks!=='object')profile.phraseChunks={attempts:0,firstPass:0,recoveries:0,lastPlayed:0,seen:{}};
 return profile.phraseChunks;
}
function record(profile,chunk,firstPass){
 const s=ensure(profile);s.attempts++;if(firstPass)s.firstPass++;else s.recoveries++;s.lastPlayed=Date.now();
 if(chunk)s.seen[chunk]=(s.seen[chunk]||0)+1;return s;
}
global.WordDragonPhraseChunks={words,candidates,pick,ensure,record};
})(typeof window!=='undefined'?window:globalThis);
