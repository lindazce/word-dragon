/* Word Dragon RC6 B28-G — three-stage listening ladder.
 * Independent skill telemetry; never writes vocabulary mastery or Stage passage.
 */
(function(global){
  'use strict';
  const LEVELS=['blind','hint','full'];

  function ensure(profile){
    if(!profile.listeningLadder||typeof profile.listeningLadder!=='object'){
      profile.listeningLadder={attempts:0,blindPerfect:0,hintRecoveries:0,fullRecoveries:0,cancelled:0,lastPlayed:0};
    }
    return profile.listeningLadder;
  }

  function create(profile,options){
    const opts=options||{}, state={level:'blind',tries:0,done:false,repair:opts.repair===true};
    const stats=ensure(profile);

    function view(){
      return {
        level:state.level,
        reveal:state.level==='blind'?'none':state.level==='hint'?'partial':'full',
        blindPerfectEligible:state.level==='blind'&&state.tries===0,
        done:state.done
      };
    }

    function wrong(){
      if(state.done)return view();
      state.tries+=1;
      state.level=state.level==='blind'?'hint':'full';
      return view();
    }

    function correct(){
      if(state.done)return {success:false,reason:'already-finished',view:view()};
      const level=state.level;
      state.done=true;
      stats.attempts+=1;
      stats.lastPlayed=Date.now();
      if(level==='blind'&&state.tries===0)stats.blindPerfect+=1;
      else if(level==='hint')stats.hintRecoveries+=1;
      else stats.fullRecoveries+=1;
      return {
        success:true,
        level,
        blindPerfect:level==='blind'&&state.tries===0,
        repairCompleted:state.repair===true,
        view:view()
      };
    }

    function cancel(){
      if(state.done)return {success:false,reason:'already-finished'};
      state.done=true;stats.cancelled+=1;stats.lastPlayed=Date.now();
      return {success:false,cancelled:true,repairCompleted:false};
    }

    return {view,wrong,correct,cancel};
  }

  global.WordDragonListeningLadder={LEVELS,ensure,create};
})(typeof window!=='undefined'?window:globalThis);
