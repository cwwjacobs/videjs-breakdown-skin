// @ts-check
/**
 * Quick check: one question, a few answers. Choosing an answer says whether it is right and
 * shows that answer's own feedback. The viewer can try another answer at any time.
 * Right and wrong are told apart by a mark and a word, never by colour alone.
 */
(() => {
Breakdown.css('quick-check', `
.bdb-quiz { display: grid; gap: 0.625rem; align-content: start; max-width: 40rem; padding: 0.25rem 0.75rem 0.875rem; margin: 0 auto; }
.bdb-quiz-question { margin: 0; font-size: 1.0625rem; font-weight: 650; line-height: 1.35; color: var(--bd-ink); }
.bdb-quiz-list { display: grid; gap: 0.375rem; }
.bdb-quiz-answer { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 0.625rem; align-items: center; width: 100%;
  min-height: 2.75rem; padding: 0.375rem 0.75rem 0.375rem 0.5rem; font: inherit; font-size: 0.9375rem; line-height: 1.35;
  color: var(--bd-ink); text-align: start; cursor: pointer; background: var(--bd-surface); border: 1.5px solid var(--bd-line);
  border-radius: 0.5rem; }
.bdb-quiz-letter { display: grid; place-items: center; width: 1.75rem; height: 1.75rem; font-size: 0.8125rem; font-weight: 700;
  color: var(--bd-ink-soft); background: var(--bd-raised); border-radius: 50%; }
.bdb-quiz-verdict { font-size: 0.8125rem; font-weight: 700; white-space: nowrap; }
.bdb-quiz-answer[data-state="right"] { background: var(--bd-raised); border-color: var(--bd-accent); box-shadow: inset 4px 0 0 var(--bd-accent); }
.bdb-quiz-answer[data-state="right"] .bdb-quiz-letter { color: var(--bd-accent-ink); background: var(--bd-accent); }
.bdb-quiz-answer[data-state="right"] .bdb-quiz-verdict { color: var(--bd-accent); }
.bdb-quiz-answer[data-state="wrong"] { border-style: dashed; border-color: var(--bd-ink-soft); }
.bdb-quiz-answer[data-state="wrong"] .bdb-quiz-verdict { color: var(--bd-ink-soft); }
.bdb-quiz-feedback { min-height: 2.75rem; padding: 0.5rem 0.75rem; margin: 0; font-size: 0.9375rem; line-height: 1.45; color: var(--bd-ink);
  background: var(--bd-surface); border: 1px solid var(--bd-line); border-inline-start: 4px solid var(--bd-accent); border-radius: 0.5rem; }
.bdb-quiz-feedback:empty { visibility: hidden; }
`);

Breakdown.registerBlock({
  mount(element, data, context) {
    const { el } = Breakdown;
    const feedback = el('p', { class: 'bdb-quiz-feedback', 'data-quiz-feedback': true });
    const list = el('div', { class: 'bdb-quiz-list', role: 'group', 'aria-label': 'Answers' });

    data.answers.forEach((/** @type {any} */ answer, /** @type {number} */ i) => {
      const verdict = el('span', { class: 'bdb-quiz-verdict', 'aria-hidden': 'true' });
      const button = el('button', { type: 'button', class: 'bdb-quiz-answer', 'data-state': 'idle', 'data-quiz-answer': i, 'aria-pressed': 'false' },
        el('span', { class: 'bdb-quiz-letter', 'aria-hidden': 'true' }, String.fromCharCode(65 + i)),
        el('span', { 'data-bd-label': true }, answer.text),
        verdict);
      button.addEventListener('click', () => {
        const right = answer.correct === true;
        for (const other of list.querySelectorAll('.bdb-quiz-answer')) other.setAttribute('aria-pressed', String(other === button));
        button.dataset.state = right ? 'right' : 'wrong';
        verdict.textContent = right ? '✓ Correct' : '✕ Not quite';
        feedback.textContent = answer.feedback;
        // Read out the verdict and the feedback together, once.
        context.announce(`${right ? 'Correct.' : 'Not quite.'} ${answer.feedback}`);
      });
      list.append(button);
    });

    element.append(el('div', { class: 'bdb-quiz' },
      el('h3', { class: 'bdb-quiz-question', 'data-bd-label': true }, data.question), list, feedback));
  },
});
})();
