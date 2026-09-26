/* Word Dragon RC6 B28-H — phrase/chunk learning core.
 * Independent skill telemetry; never writes formal vocabulary mastery.
 */
(function(global){
'use strict';
const STOP=new Set('a an the to of in on at for from with and or but is are was were be been being do does did have has had this that these those it its i you he she we they my your his her our their'.split(' '));
const WEAK_START=new Set('a an the this that these those it its i you he she we they my your his her our their'.split(' '));
const PREP=new Set('to of in on at for from with by about into over after before under through between'.split(' '));
function words(s){return String(s||'').toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g)||[]}
function score(part,t){
 const content=part.filter(w=>!STOP.has(w)).length,ti=part.indexOf(t);
 let s=content*5-part.length*.8;
 if(part.length===2)s+=2.5;
 if(part.length===3)s+=1;
 if(WEAK_START.has(part[0]))s-=3.5;
 if(PREP.has(part[part.length-1]))s-=4;
 if(ti===0&&part.length<=3)s+=1.5;
 if(ti===part.length-1&&part.length<=3)s+=1;
 return s;
}
function candidates(sentence,target){
 const ws=words(sentence),t=String(target||'').toLowerCase(),out=[];
 for(let n=2;n<=4;n++)for(let i=0;i+n<=ws.length;i++){
  const part=ws.slice(i,i+n);if(!part.includes(t))continue;
  const content=part.filter(w=>!STOP.has(w));if(content.length<1)continue;
  const text=part.join(' ');if(!out.some(x=>x.text===text))out.push({text,score:score(part,t)});
 }
 return out.sort((a,b)=>b.score-a.score||words(a.text).length-words(b.text).length).map(x=>x.text);
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
