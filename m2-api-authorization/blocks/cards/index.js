// @ts-check
/**
 * Recall cards: a prompt on the front; selecting a card turns it over to show the answer, so
 * the viewer can try to recall it first. The answer is announced to screen readers.
 */
(() => {
Breakdown.css('cards', `
.bdb-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(10.5rem, 1fr)); gap: 0.5rem; align-content: start; padding: 0.25rem 0.75rem 0.875rem; }
.bdb-card { display: grid; gap: 0.375rem; align-content: start; min-height: 5.5rem; padding: 0.625rem 0.75rem; font: inherit; color: var(--bd-ink);
  text-align: start; cursor: pointer; background: var(--bd-surface); border: 1px solid var(--bd-line); border-radius: 0.5rem; }
.bdb-card-front { font-size: 0.9375rem; font-weight: 650; line-height: 1.3; }
.bdb-card-hint { font-size: 0.8125rem; color: var(--bd-ink-soft); }
.bdb-card-back { font-size: 0.875rem; line-height: 1.45; color: var(--bd-ink); }
.bdb-card[aria-pressed="true"] { background: var(--bd-raised); border-color: var(--bd-accent); box-shadow: inset 0 3px 0 var(--bd-accent); }
.bdb-card[aria-pressed="true"] .bdb-card-hint, .bdb-card[aria-pressed="false"] .bdb-card-back { display: none; }
`);

Breakdown.registerBlock({
  mount(element, data, context) {
    const { el } = Breakdown;
    element.append(el('div', { class: 'bdb-cards' }, ...data.cards.map((/** @type {any} */ card) => {
      const button = el('button', { type: 'button', class: 'bdb-card', 'aria-pressed': 'false' },
        el('span', { class: 'bdb-card-front', 'data-bd-label': true }, card.front),
        el('span', { class: 'bdb-card-hint' }, 'Show the answer'),
        el('span', { class: 'bdb-card-back' }, card.back));
      button.addEventListener('click', () => {
        const open = button.getAttribute('aria-pressed') !== 'true';
        button.setAttribute('aria-pressed', String(open));
        if (open) context.announce(`${card.front}: ${card.back}`);
      });
      return button;
    })));
  },
});
})();
