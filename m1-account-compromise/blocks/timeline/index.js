// @ts-check
/**
 * Timeline: events in order down a line. Each event shows when it happened and its name;
 * selecting it puts the detail in the card. Text flows, so a long timeline simply grows.
 */
(() => {
Breakdown.css('timeline', `
.bdb-tl { position: relative; display: grid; gap: 0.375rem; align-content: start; max-width: 36rem; padding: 0.25rem 0.75rem 0.875rem 2rem; margin: 0 auto; list-style: none; }
.bdb-tl::before { position: absolute; top: 1rem; bottom: 1.5rem; left: 1.1875rem; width: 2px; content: ""; background: var(--bd-line); }
.bdb-tl-item { position: relative; }
.bdb-tl-item::before { position: absolute; top: 50%; left: -1.125rem; width: 0.75rem; height: 0.75rem; content: ""; background: var(--bd-accent);
  border: 2px solid var(--bd-stage); border-radius: 50%; translate: 0 -50%; }
.bdb-tl-event { display: grid; grid-template-columns: minmax(5.5rem, 30%) minmax(0, 1fr); gap: 0.75rem; align-items: center; width: 100%; min-height: 2.75rem;
  padding: 0.375rem 0.75rem; font: inherit; color: var(--bd-ink); text-align: start; cursor: pointer; background: var(--bd-surface);
  border: 1px solid var(--bd-line); border-radius: 0.5rem; }
.bdb-tl-when { font-size: 0.8125rem; font-weight: 700; font-variant-numeric: tabular-nums; color: var(--bd-accent); }
.bdb-tl-label { font-size: 0.9375rem; font-weight: 600; }
.bdb-tl-event[aria-pressed="true"] { background: var(--bd-raised); border-color: var(--bd-accent); box-shadow: inset 3px 0 0 var(--bd-accent); }
`);

Breakdown.registerBlock({
  mount(element, data, context) {
    const { el } = Breakdown;
    /** @type {string | null} */
    let selected = null;
    const list = el('ol', { class: 'bdb-tl' });
    for (const event of data.events) {
      list.append(el('li', { class: 'bdb-tl-item' }, el('button', {
        type: 'button', class: 'bdb-tl-event', 'data-bd-part': event.id, 'aria-pressed': 'false', onclick: () => select(event.id),
      }, el('span', { class: 'bdb-tl-when' }, event.when), el('span', { class: 'bdb-tl-label', 'data-bd-label': true }, event.label))));
    }

    /** Select an event, or clear the selection when the same one is chosen again. */
    function select(/** @type {string} */ id) {
      selected = selected === id ? null : id;
      for (const button of list.querySelectorAll('[data-bd-part]')) {
        button.setAttribute('aria-pressed', String(/** @type {HTMLElement} */ (button).dataset.bdPart === selected));
      }
      const event = data.events.find((/** @type {any} */ e) => e.id === selected);
      context.showDetail(event ? { label: `${event.when}: ${event.label}`, detail: event.detail } : null);
    }
    element.append(list);
  },
});
})();
