// @ts-check
/**
 * Key points: a short numbered list of plain statements. The default when a chapter makes
 * points that no picture would improve. It is text, so it simply flows and may grow.
 */
(() => {
Breakdown.css('key-points', `
.bdb-kp { display: grid; gap: 0.5rem; align-content: start; max-width: 40rem; padding: 0.25rem 0.75rem 0.875rem; margin: 0 auto; list-style: none; }
.bdb-kp-item { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 0.125rem 0.75rem; padding: 0.625rem 0.75rem;
  background: var(--bd-surface); border: 1px solid var(--bd-line); border-radius: 0.5rem; }
.bdb-kp-num { display: grid; grid-row: 1 / span 2; place-items: center; width: 1.75rem; height: 1.75rem; font-size: 0.8125rem;
  font-weight: 700; color: var(--bd-accent-ink); background: var(--bd-accent); border-radius: 50%; }
.bdb-kp-title { margin: 0; font-size: 0.9375rem; font-weight: 650; line-height: 1.35; color: var(--bd-ink); }
.bdb-kp-text { margin: 0; font-size: 0.9375rem; line-height: 1.45; color: var(--bd-ink-soft); }
`);

Breakdown.registerBlock({
  mount(element, data) {
    const { el } = Breakdown;
    element.append(el('ol', { class: 'bdb-kp' }, ...data.points.map((/** @type {any} */ point, /** @type {number} */ i) =>
      el('li', { class: 'bdb-kp-item' },
        el('span', { class: 'bdb-kp-num', 'aria-hidden': 'true' }, String(i + 1)),
        el('h3', { class: 'bdb-kp-title', 'data-bd-label': true }, point.title),
        el('p', { class: 'bdb-kp-text' }, point.text)))));
  },
});
})();
