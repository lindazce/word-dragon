/* Word Dragon RC6 B28-H — phrase/chunk learning core.
 * Independent skill telemetry; never writes formal vocabulary mastery.
 */
(function(global){
'use strict';
const STOP=new Set('a an the to of in on at for from with and or but is are was were be been being do does did have has had this that these those it its i you he she we they my your his her our their'.split(' '));
const WEAK_START=new Set('a an the this that these those it its i you he she we they my your his her our their'.split(' '));
const PREP=new Set('to of in on at for from with by about into over after before under through between'.split(' '));
function words(s){return String(s||'').toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g)||[]}
function variants(t){let v=new Set([t,t+'s',t+'es',t+'ed',t+'ing']);if(t.endsWith('e')){v.add(t.slice(0,-1)+'ed');v.add(t.slice(0,-1)+'ing');v.add(t+'r');v.add(t+'st')}else{v.add(t+'er');v.add(t+'est')}if(/[^aeiou][aeiou][^aeiouwxy]$/.test(t)){let z=t+t.at(-1);v.add(z+'ed');v.add(z+'ing')}if(t.endsWith('y')&&!/[aeiou]y$/.test(t)){v.add(t.slice(0,-1)+'ies');v.add(t.slice(0,-1)+'ied');v.add(t.slice(0,-1)+'ier');v.add(t.slice(0,-1)+'iest')}return v}\nfunction targetSpan(ws,target){const ts=words(target);if(!ts.length)return null;if(ts.length>1){for(let i=0;i+ts.length<=ws.length;i++)if(ts.every((w,j)=>ws[i+j]===w))return [i,i+ts.length];return null}const vs=variants(ts[0]);for(let i=0;i<ws.length;i++)if(vs.has(ws[i]))return [i,i+1];return null}\nfunction score(part,ti){
 const content=part.filter(w=>!STOP.has(w)).length;
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
 const ws=words(sentence),span=targetSpan(ws,target),out=[];if(!span)return out;
 for(let n=2;n<=4;n++)for(let i=0;i+n<=ws.length;i++){
  if(i>span[0]||i+n<span[1])continue;const part=ws.slice(i,i+n),t=span[0]-i;
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
global.WordDragonPhraseChunks={words,variants,targetSpan,candidates,pick,ensure,record};
})(typeof window!=='undefined'?window:globalThis);
