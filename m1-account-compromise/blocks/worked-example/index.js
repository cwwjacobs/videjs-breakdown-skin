// @ts-check
/**
 * Worked example: a task solved in a few stages that the viewer steps through.
 * This block is text, so it flows and grows with what it holds instead of filling a fixed area.
 * Back and Next stay in one place above the stage, so they do not move as the stages change length.
 */
(() => {
  Breakdown.css('worked-example', `
.bdb-we { display: grid; gap: 0.5rem; align-content: start; padding: 0.5rem 0.75rem 0.75rem; }
.bdb-we-prompt { margin: 0; font-size: 0.9375rem; font-weight: 600; line-height: 1.4; color: var(--bd-ink); }
.bdb-we-bar { display: flex; gap: 0.5rem; align-items: center; }
.bdb-we-count { flex: 0 0 auto; font-size: 0.75rem; font-weight: 700; font-variant-numeric: tabular-nums; color: var(--bd-accent);
  text-transform: uppercase; letter-spacing: 0.06em; white-space: nowrap; }
.bdb-we-marks { display: flex; flex: 1 1 auto; gap: 0.25rem; min-width: 0; }
.bdb-we-mark { flex: 1 1 0; max-width: 1.5rem; height: 0.25rem; background: var(--bd-line); border-radius: 0.125rem; }
.bdb-we-mark[data-state="done"] { background: var(--bd-ink-soft); }
.bdb-we-mark[data-state="now"] { background: var(--bd-accent); }
.bdb-we-go { flex: 0 0 auto; min-width: 4rem; min-height: 2.25rem; padding: 0 0.75rem; font: inherit; font-size: 0.875rem;
  font-weight: 600; color: var(--bd-ink); cursor: pointer; background: var(--bd-surface); border: 1px solid var(--bd-line);
  border-radius: 0.5rem; }
.bdb-we-go[data-way="next"]:not(:disabled) { border-color: var(--bd-accent); box-shadow: inset 0 -3px 0 var(--bd-accent); }
.bdb-we-go:disabled { color: var(--bd-ink-soft); cursor: default; opacity: 0.55; }
.bdb-we-step { display: grid; grid-template-columns: minmax(0, 1fr); gap: 0.5rem 0.75rem; align-items: start; padding: 0.75rem;
  background: var(--bd-surface); border: 1px solid var(--bd-line); border-radius: 0.5rem; }
.bdb-we[data-layout="side"] .bdb-we-step[data-picture] { grid-template-columns: minmax(0, 1fr) minmax(0, 42%); }
.bdb-we[data-layout="side"] .bdb-we-step[data-picture] > * { grid-column: 1; }
.bdb-we[data-layout="side"] .bdb-we-step[data-picture] > .bdb-we-pic { grid-column: 2; grid-row: 1 / span 3; }
.bdb-we-head { display: flex; gap: 0.5rem; align-items: center; }
.bdb-we-num { display: grid; flex: 0 0 auto; place-items: center; width: 1.375rem; height: 1.375rem; font-size: 0.75rem;
  font-weight: 700; color: var(--bd-accent-ink); background: var(--bd-accent); border-radius: 50%; }
.bdb-we-title { margin: 0; font-size: 1rem; font-weight: 650; line-height: 1.3; color: var(--bd-ink); }
.bdb-we-text { margin: 0; font-size: 0.9375rem; line-height: 1.45; color: var(--bd-ink); }
.bdb-we-pic { line-height: 0; }
.bdb-we-pic img { display: block; max-width: 100%; max-height: 11rem; margin: 0 auto; background: var(--bd-surface);
  border: 1px solid var(--bd-line); border-radius: 0.5rem; }
.bdb-we-result { display: flex; flex-wrap: wrap; gap: 0.125rem 0.625rem; align-items: baseline; padding: 0.5rem 0.75rem; margin: 0;
  font-size: 0.9375rem; font-weight: 600; line-height: 1.35; color: var(--bd-ink); background: var(--bd-raised);
  border-radius: 0.5rem; box-shadow: inset 3px 0 0 var(--bd-accent); }
.bdb-we-tag { font-size: 0.75rem; font-weight: 700; color: var(--bd-ink-soft); text-transform: uppercase; letter-spacing: 0.06em; }
`);

  Breakdown.registerBlock({
    mount(element, data, context) {
      const { el } = Breakdown;
      /** @type {{ title: string, text: string, image?: string, result?: string }[]} */
      const steps = data.steps;
      let at = 0;

      const count = el('span', { class: 'bdb-we-count' });
      const marks = steps.map(() => el('span', { class: 'bdb-we-mark' }));
      const back = el('button', { type: 'button', class: 'bdb-we-go', 'data-way': 'back', onclick: () => go(at - 1) }, 'Back');
      const next = el('button', { type: 'button', class: 'bdb-we-go', 'data-way': 'next', onclick: () => go(at + 1) }, 'Next');
      const number = el('span', { class: 'bdb-we-num', 'aria-hidden': 'true' });
      const title = el('h3', { class: 'bdb-we-title', 'data-bd-label': true });
      const text = el('p', { class: 'bdb-we-text' });
      const picture = el('div', { class: 'bdb-we-pic' });
      const outcome = el('span');
      const result = el('p', { class: 'bdb-we-result' }, el('span', { class: 'bdb-we-tag' }, 'Result'), outcome);
      const step = el('div', { class: 'bdb-we-step' }, el('div', { class: 'bdb-we-head' }, number, title), text, picture, result);
      const root = el('div', { class: 'bdb-we' },
        el('p', { class: 'bdb-we-prompt', 'data-bd-label': true }, data.prompt),
        el('div', { class: 'bdb-we-bar' }, count, el('span', { class: 'bdb-we-marks', 'aria-hidden': 'true' }, ...marks), back, next),
        step);

      /** Draw the stage the viewer is on. */
      function show() {
        const now = steps[at];
        count.textContent = `Step ${at + 1} of ${steps.length}`;
        marks.forEach((mark, i) => { mark.dataset.state = i < at ? 'done' : i === at ? 'now' : 'next'; });
        number.textContent = String(at + 1);
        title.textContent = now.title;
        text.textContent = now.text;
        outcome.textContent = now.result ?? '';
        result.hidden = !now.result;
        // The picture shows what the title says, so the title is its description.
        picture.replaceChildren(...(now.image ? [el('img', { src: context.asset(now.image), alt: now.title, draggable: 'false',
          onerror: (/** @type {Event} */ event) => {
            // A picture that cannot be loaded is left out, unless the viewer has already moved on from it.
            if (!(event.target instanceof Element) || !picture.contains(event.target)) return;
            picture.hidden = true;
            step.removeAttribute('data-picture');
          } })] : []));
        picture.hidden = !now.image;
        step.toggleAttribute('data-picture', Boolean(now.image));
        back.toggleAttribute('disabled', at === 0);
        next.toggleAttribute('disabled', at === steps.length - 1);
      }

      /** Move to another stage and say so. A button that has just gone dead hands focus to the other one. */
      function go(/** @type {number} */ to) {
        if (to < 0 || to >= steps.length || to === at) return;
        const held = document.activeElement;
        at = to;
        show();
        if (held === back && at === 0) next.focus();
        if (held === next && at === steps.length - 1) back.focus();
        context.announce(`Step ${at + 1} of ${steps.length}: ${steps[at].title}`);
      }

      /** Put the picture beside the words when there is room, under them when there is not. */
      function fit(size = context.size()) {
        root.dataset.layout = size.width < 480 ? 'stack' : 'side';
      }

      element.append(root);
      show();
      fit();
      return { resize: fit };
    },
  });
})();
