/* Word Dragon RC6 B28-F — framework-free Gate/Repair map card. */
(function (global) {
  'use strict';

  function esc(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function skillRows(skills) {
    if (!skills || !skills.length) return '';
    return '<div class="wd-gate-recovery-skills">' + skills.map((item) => {
      const mark = item.done ? '✓' : `${item.completed}/${item.required}`;
      return `<span class="wd-gate-recovery-skill${item.done ? ' is-done' : ''}" data-skill="${esc(item.key)}">${esc(item.label)} <b>${esc(mark)}</b></span>`;
    }).join('') + '</div>';
  }

  function render(model) {
    const m = model || {};
    return `
      <section class="wd-gate-recovery-card" data-state="${esc(m.state || 'gate')}">
        ${m.badge ? `<div class="wd-gate-recovery-badge">${esc(m.badge)}</div>` : ''}
        <h3>${esc(m.title || '守门挑战')}</h3>
        ${m.progressText ? `<p class="wd-gate-recovery-progress">${esc(m.progressText)}</p>` : ''}
        ${skillRows(m.skills)}
        <button type="button" class="wd-gate-recovery-action" data-action="gate-recovery-primary" ${m.actionEnabled === false ? 'disabled' : ''}>
          ${esc(m.actionLabel || '开始挑战')}
        </button>
      </section>
    `.trim();
  }

  function mount(container, model, onAction) {
    if (!container) throw new Error('container required');
    container.innerHTML = render(model);
    const button = container.querySelector('[data-action="gate-recovery-primary"]');
    if (button && typeof onAction === 'function') {
      button.addEventListener('click', () => onAction(model));
    }
    return button;
  }

  global.WordDragonGateRecoveryCard = { render, mount, esc };
})(typeof window !== 'undefined' ? window : globalThis);
