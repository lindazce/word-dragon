/* Word Dragon RC6 B28-F — map-friendly recovery view model. */
(function (global) {
  'use strict';

  const LABELS = {
    vocabulary: '词汇',
    listening: '听力',
    sentence: '句子',
    speaking: '口语'
  };

  function controller() {
    if (!global.WordDragonGateRecoveryController) {
      throw new Error('gate-recovery-controller.js must load first');
    }
    return global.WordDragonGateRecoveryController;
  }

  function forMap(profile, stageId) {
    const view = controller().getRecoveryView(profile, stageId);
    if (view.mode === 'gate') {
      return {
        state: 'gate',
        badge: '',
        title: '守门挑战',
        actionLabel: '开始挑战',
        actionEnabled: true,
        progressText: '',
        skills: []
      };
    }

    const skills = (view.skills || []).map((item) => ({
      key: item.skill,
      label: LABELS[item.skill] || item.skill,
      completed: item.completed,
      required: item.required,
      done: !!item.done
    }));

    if (view.mode === 'retest') {
      return {
        state: 'retest',
        badge: '修复完成',
        title: '重新挑战守门测试',
        actionLabel: '重新挑战',
        actionEnabled: true,
        progressText: '薄弱技能已完成修复，新题已准备。',
        skills
      };
    }

    const done = skills.reduce((sum, item) => sum + Math.min(item.completed, item.required), 0);
    const total = skills.reduce((sum, item) => sum + item.required, 0);
    return {
      state: 'repair',
      badge: '需要修复',
      title: 'Dragon Repair',
      actionLabel: '继续修复',
      actionEnabled: true,
      progressText: `${done}/${total} 次有效修复`,
      skills
    };
  }

  global.WordDragonGateRecoveryViewModel = { forMap, LABELS };
})(typeof window !== 'undefined' ? window : globalThis);
