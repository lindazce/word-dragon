/* Word Dragon RC6 B28-H2 — resilient home learning entrypoints.
 * Delegates to existing app functions, but surfaces startup failures instead of silent no-op.
 */
(function(g){
'use strict';
function visibleError(label,err){
 console.error('[Word Dragon '+label+']',err);
 const shade=document.getElementById('modalShade'),body=document.getElementById('modalBody');
 if(shade&&body){body.innerHTML='<div class="modal-card"><h3>🐉 启动失败</h3><p>'+label+' 暂时无法打开。</p><p style="font-size:.82rem;opacity:.75">'+String(err&&err.message||err)+'</p><button onclick="closeModal()">返回</button></div>';shade.hidden=false;shade.classList.add('show')}
}
function invoke(name,label){
 try{
  const fn=g[name]; if(typeof fn!=='function')throw new Error(name+' is not available');
  const out=fn(); if(out&&typeof out.catch==='function')out.catch(e=>visibleError(label,e));
  return out;
 }catch(e){visibleError(label,e)}
}
g.WDHomeLearningEntry={adventure:function(){return invoke('startAutoAdventure','继续冒险')},sentence:function(){return invoke('startSentenceQuest','句子秘境')}};
function bind(){
 const buttons=[...document.querySelectorAll('button')];
 const adv=buttons.find(b=>/继续冒险/.test(b.textContent||'')),sq=buttons.find(b=>/句子秘境/.test(b.textContent||''));
 if(adv){adv.onclick=null;adv.addEventListener('click',()=>g.WDHomeLearningEntry.adventure(),{once:true})}
 if(sq){sq.onclick=null;sq.addEventListener('click',()=>g.WDHomeLearningEntry.sentence(),{once:true})}
}
g.WDHomeLearningEntry.bind=bind;
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('button');if(b&&(/继续冒险|句子秘境/.test(b.textContent||'')))setTimeout(bind,0)},true);
setTimeout(bind,0);
})(window);
