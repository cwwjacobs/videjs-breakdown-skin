// @ts-check
/**
 * Compare: two things side by side, one row per point of comparison. A real table, so it reads
 * correctly to screen readers; the columns share the width and long text wraps.
 */
(() => {
Breakdown.css('compare', `
.bdb-cmp { width: calc(100% - 1.5rem); max-width: 44rem; margin: 0.25rem auto 0.875rem; font-size: 0.9375rem; line-height: 1.4;
  color: var(--bd-ink); table-layout: fixed; border-spacing: 0; border-collapse: separate; background: var(--bd-surface);
  border: 1px solid var(--bd-line); border-radius: 0.5rem; }
.bdb-cmp th, .bdb-cmp td { padding: 0.5rem 0.625rem; text-align: start; vertical-align: top; overflow-wrap: anywhere; border-top: 1px solid var(--bd-line); }
.bdb-cmp thead th { font-size: 0.875rem; font-weight: 700; color: var(--bd-accent); border-top: 0; }
.bdb-cmp tbody th { width: 26%; font-size: 0.8125rem; font-weight: 700; color: var(--bd-ink-soft); }
.bdb-cmp td + td, .bdb-cmp thead th + th + th { border-inline-start: 1px solid var(--bd-line); }
`);

Breakdown.registerBlock({
  mount(element, data) {
    const { el } = Breakdown;
    const head = el('thead', null, el('tr', null, el('td', null),
      el('th', { scope: 'col', 'data-bd-label': true }, data.left), el('th', { scope: 'col', 'data-bd-label': true }, data.right)));
    const body = el('tbody', null, ...data.rows.map((/** @type {any} */ row) => el('tr', null,
      el('th', { scope: 'row', 'data-bd-label': true }, row.aspect), el('td', null, row.left), el('td', null, row.right))));
    element.append(el('table', { class: 'bdb-cmp' }, head, body));
  },
});
})();
