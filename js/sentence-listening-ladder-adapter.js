/* Word Dragon RC6 B28-G — Sentence Quest adapter for three-stage listening.
 * UI-agnostic: Sentence Quest renders prompt/options and reports correct/wrong/cancel.
 */
(function(global){
  'use strict';

  function create(profile,options){
    const Ladder=global.WordDragonListeningLadder;
    if(!Ladder)throw new Error('listening-ladder.js must load first');
    const opts=options||{};
    const session=Ladder.create(profile,{repair:opts.repair===true});

    function prompt(){
      const v=session.view();
      return {
        level:v.level,
        replayAudio:true,
        showPartialHint:v.reveal==='partial',
        showFullSentence:v.reveal==='full',
        showAnswerChoices:true,
        blindPerfectEligible:v.blindPerfectEligible
      };
    }

    function answer(correct){
      if(correct===true)return Object.assign({prompt:prompt()},session.correct());
      session.wrong();
      return {success:false,advance:true,prompt:prompt()};
    }

    function cancel(){return session.cancel();}
    return {prompt,answer,cancel};
  }

  global.WordDragonSentenceListeningLadderAdapter={create};
})(typeof window!=='undefined'?window:globalThis);
