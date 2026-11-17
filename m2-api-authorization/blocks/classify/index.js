// @ts-check
/**
 * Sort the statements: the viewer puts each statement into one of a few named groups. Choosing
 * a group says in words whether it was right and shows the reason. A count keeps score.
 * Right and wrong are told apart by a mark and a word, never by colour alone.
 */
(() => {
Breakdown.css('classify', `
.bdb-cls { display: grid; gap: 0.5rem; align-content: start; max-width: 42rem; padding: 0.25rem 0.75rem 0.875rem; margin: 0 auto; }
.bdb-cls-prompt { margin: 0; font-size: 1rem; font-weight: 650; line-height: 1.35; color: var(--bd-ink); }
.bdb-cls-score { margin: 0; font-size: 0.8125rem; font-weight: 700; color: var(--bd-ink-soft); }
.bdb-cls-list { display: grid; gap: 0.5rem; padding: 0; margin: 0; list-style: none; }
.bdb-cls-item { display: grid; gap: 0.375rem; padding: 0.625rem 0.75rem; background: var(--bd-surface); border: 1px solid var(--bd-line); border-radius: 0.5rem; }
.bdb-cls-text { margin: 0; font-size: 0.9375rem; font-weight: 600; line-height: 1.35; color: var(--bd-ink); }
.bdb-cls-choices { display: flex; flex-wrap: wrap; gap: 0.375rem; }
.bdb-cls-choice { min-height: 2.25rem; padding: 0.25rem 0.75rem; font: inherit; font-size: 0.8125rem; font-weight: 700; color: var(--bd-ink);
  cursor: pointer; background: var(--bd-raised); border: 1.5px solid var(--bd-line); border-radius: 999px; }
.bdb-cls-choice[data-state="right"] { color: var(--bd-accent-ink); background: var(--bd-accent); border-color: var(--bd-accent); }
.bdb-cls-choice[data-state="wrong"] { color: var(--bd-ink-soft); text-decoration: line-through; border-style: dashed; border-color: var(--bd-ink-soft); }
.bdb-cls-why { margin: 0; font-size: 0.875rem; line-height: 1.45; color: var(--bd-ink); }
.bdb-cls-why:empty { display: none; }
`);

Breakdown.registerBlock({
  mount(element, data, context) {
    const { el } = Breakdown;
    const label = new Map(data.groups.map((/** @type {any} */ g) => [g.id, g.label]));
    const solved = new Set();
    const score = el('p', { class: 'bdb-cls-score', 'data-cls-score': true });
    const tally = () => { score.textContent = `${solved.size} of ${data.items.length} sorted`; };

    const rows = data.items.map((/** @type {any} */ item, /** @type {number} */ i) => {
      const why = el('p', { class: 'bdb-cls-why', 'data-cls-why': i });
      const choices = el('div', { class: 'bdb-cls-choices', role: 'group', 'aria-label': 'Which group?' });
      for (const group of data.groups) {
        const button = el('button', { type: 'button', class: 'bdb-cls-choice', 'data-cls-item': i, 'data-cls-group': group.id, 'data-state': 'idle' }, group.label);
        button.addEventListener('click', () => {
          const right = group.id === item.group;
          button.dataset.state = right ? 'right' : 'wrong';
          button.textContent = `${right ? '✓' : '✕'} ${group.label}`;
          if (right) {
            solved.add(i);
            why.textContent = item.why;
            for (const other of choices.children) /** @type {HTMLButtonElement} */ (other).disabled = other !== button;
          } else {
            why.textContent = `Not ${group.label.toLowerCase()}. Try again.`;
          }
          tally();
          context.announce(right ? `Right: ${label.get(item.group)}. ${item.why}` : `Not ${group.label}. Try again.`);
        });
        choices.append(button);
      }
      return el('li', { class: 'bdb-cls-item' }, el('p', { class: 'bdb-cls-text', 'data-bd-label': true }, item.text), choices, why);
    });

    tally();
    element.append(el('div', { class: 'bdb-cls' },
      el('h3', { class: 'bdb-cls-prompt', 'data-bd-label': true }, data.prompt), score, el('ol', { class: 'bdb-cls-list' }, ...rows)));
  },
});
})();
