// @ts-check
/**
 * Mockup of the real screen: what the viewer will meet when they do the thing the video talks
 * about (a console with an alert, an app, a web page, a terminal, an inbox, a phone, a document),
 * built from typed sections in a frame. The author writes what the screen says; the block lays it
 * out (sections flow in columns, wide ones span the screen, tables become cards when narrow).
 * Every section, row, place, button, metric and step (and every log line with an id and a detail)
 * is a part: it opens the card, and a scene's focus rings it and quiets the rest. In a scene the
 * window keeps a fixed height and scrolls inside, bringing focused parts into view. Colours come
 * only from the theme.
 */
(() => {
  const TONE = { bad: 'var(--bd-bad)', good: 'var(--bd-good)', warn: 'var(--bd-warn)', info: 'var(--bd-accent)' };
  const SOFT = { bad: 'var(--bd-bad-soft)', good: 'var(--bd-good-soft)', warn: 'var(--bd-warn-soft)', info: 'var(--bd-accent-soft)' };
  const SEVERITY = { low: 'info', medium: 'warn', high: 'bad', critical: 'bad' };
  const toned = (/** @type {string|undefined} */ t) => (t && TONE[t] ? `--tone: ${TONE[t]}; --soft: ${SOFT[t]}` : null);

  Breakdown.css('mockup', `
.bdm { container: bdm / inline-size; min-height: 100%; padding: 0.75rem; box-sizing: border-box; font-size: 0.875rem; line-height: 1.4; color: var(--bd-ink); }
.bdm-win { overflow: hidden; background: var(--bd-surface); border: 1px solid var(--bd-line); border-radius: 0.8rem; }
.bdm-bar { display: flex; gap: 0.6rem; align-items: center; min-width: 0; padding: 0.45rem 0.7rem; background: var(--bd-raised); border-bottom: 1px solid var(--bd-line); }
.bdm-dots { display: inline-flex; gap: 0.3rem; } .bdm-dots i { width: 0.6rem; height: 0.6rem; background: var(--bd-line); border-radius: 50%; }
.bdm-name { font-size: 0.8125rem; font-weight: 700; white-space: nowrap; }
.bdm-addr { flex: 1 1 auto; min-width: 0; overflow: hidden; padding: 0.2rem 0.65rem; font-family: var(--bd-font-mono); font-size: 0.75rem; color: var(--bd-ink-soft);
  text-overflow: ellipsis; white-space: nowrap; background: var(--bd-surface); border: 1px solid var(--bd-line); border-radius: 999px; }
.bdm-zoom { display: inline-flex; gap: 2px; margin-inline-start: auto; }
.bdm-zoom button { min-width: 1.9rem; min-height: 1.9rem; font: inherit; font-weight: 700; color: var(--bd-ink-soft); cursor: pointer; background: transparent; border: 0; border-radius: 0.4rem; }
.bdm-body { display: flex; min-width: 0; }
.bdm-nav { display: flex; flex: 0 0 auto; flex-direction: column; gap: 2px; min-width: 8.5rem; padding: 0.6rem; background: var(--bd-stage); border-inline-end: 1px solid var(--bd-line); }
.bdm-nav span { padding: 0.35rem 0.6rem; font-size: 0.8125rem; font-weight: 600; color: var(--bd-ink-soft); white-space: nowrap; border-radius: 0.45rem; }
.bdm-nav span[aria-current] { color: var(--bd-ink); background: var(--bd-accent-soft); }
.bdm-grid { display: grid; flex: 1 1 auto; grid-template-columns: repeat(auto-fill, minmax(min(100%, 16rem), 1fr)); gap: 0.7rem; align-content: start; min-width: 0; padding: 0.75rem; }
.bdm-sec { min-width: 0; padding: 0.7rem 0.8rem; background: var(--bd-surface); border: 1px solid var(--bd-line); border-radius: 0.65rem; transition: opacity 0.3s; }
.bdm-sec[style*="--tone"] { border-inline-start: 4px solid var(--tone); } .bdm-sec[data-wide] { grid-column: 1 / -1; }
.bdm-head { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; margin-bottom: 0.45rem; }
.bdm-title { min-height: 24px; padding: 0; font: inherit; font-weight: 700; color: var(--bd-ink); text-align: start; cursor: pointer; background: none; border: 0; }
.bdm-time { margin-inline-start: auto; font-family: var(--bd-font-mono); font-size: 0.75rem; color: var(--bd-ink-soft); }
.bdm-pill { padding: 0.1rem 0.5rem; font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.05em; color: var(--tone); text-transform: uppercase; background: var(--soft); border-radius: 999px; }
.bdm-text { margin: 0 0 0.4rem; }
.bdm-fields { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 9rem), 1fr)); gap: 0.4rem 0.9rem; margin: 0.4rem 0 0; }
.bdm-fields dt { font-size: 0.6875rem; letter-spacing: 0.05em; color: var(--bd-ink-soft); text-transform: uppercase; }
.bdm-fields dd { margin: 0; font-family: var(--bd-font-mono); font-size: 0.8125rem; font-weight: 600; color: var(--tone, var(--bd-ink)); overflow-wrap: anywhere; }
.bdm-table { width: 100%; border-collapse: collapse; }
.bdm-table th { padding: 0.3rem 0.45rem; font-size: 0.6875rem; letter-spacing: 0.05em; color: var(--bd-ink-soft); text-align: start; text-transform: uppercase; border-bottom: 1px solid var(--bd-line); }
.bdm-table td { padding: 0.3rem 0.45rem; border-bottom: 1px solid var(--bd-line); } .bdm-table tr[style*="--tone"] td:first-child { box-shadow: inset 3px 0 var(--tone); }
.bdm-table td:not(:first-child) { color: var(--bd-ink-soft); }
.bdm-cell { min-height: 24px; padding: 0; font: inherit; font-family: var(--bd-font-mono); font-weight: 700; color: var(--bd-ink); cursor: pointer; background: none; border: 0; }
@container bdm (max-width: 32rem) {
  .bdm-body { flex-direction: column; } .bdm-nav { flex-direction: row; min-width: 0; overflow-x: auto; border-inline-end: 0; border-bottom: 1px solid var(--bd-line); }
  .bdm-table thead { display: none; } .bdm-table tr { display: grid; padding: 0.3rem 0; border-bottom: 1px solid var(--bd-line); } .bdm-table td { padding: 0.05rem 0.45rem; border: 0; } }
.bdm-log { display: grid; gap: 0.15rem; margin: 0; padding: 0.5rem 0.6rem; font-family: var(--bd-font-mono); font-size: 0.75rem; list-style: none; background: var(--bd-stage); border-radius: 0.45rem; }
.bdm-log li { display: flex; gap: 0.6rem; padding-inline-start: 0.4rem; border-inline-start: 3px solid var(--tone, transparent); } .bdm-log time { flex: 0 0 auto; color: var(--bd-ink-soft); }
.bdm-line { min-height: 24px; padding: 0; font: inherit; color: inherit; text-align: start; cursor: pointer; background: none; border: 0; }
.bdm[data-capped] .bdm-body { max-height: var(--bdm-h); } .bdm[data-capped] :is(.bdm-grid, .bdm-nav) { min-height: 0; overflow-y: auto; overscroll-behavior: contain; }
.bdm-code { counter-reset: line; } .bdm-code li::before { flex: 0 0 1.4rem; color: var(--bd-ink-soft); text-align: end; content: counter(line); counter-increment: line; }
.bdm-globe { display: grid; grid-template-columns: minmax(7rem, 11rem) 1fr; gap: 0.8rem; align-items: center; } .bdm-globe svg { width: 100%; height: auto; }
@container bdm (max-width: 22rem) { .bdm-globe { grid-template-columns: 1fr; } }
.bdm-places { display: grid; gap: 0.35rem; margin: 0; padding: 0; list-style: none; }
.bdm-place { display: flex; gap: 0.45rem; align-items: center; min-height: 26px; padding: 0.2rem 0.5rem; font: inherit; font-weight: 600; color: var(--bd-ink); text-align: start; cursor: pointer;
  background: var(--soft, var(--bd-stage)); border: 1px solid var(--bd-line); border-radius: 0.5rem; } .bdm-place i, .bdm-dot { flex: 0 0 auto; width: 0.6rem; height: 0.6rem; background: var(--tone, var(--bd-accent)); border-radius: 50%; }
.bdm-trip { margin: 0.2rem 0 0; font-family: var(--bd-font-mono); font-size: 0.75rem; color: var(--bd-ink-soft); }
.bdm-chart svg { display: block; width: 100%; height: auto; } .bdm-legend { display: flex; flex-wrap: wrap; gap: 0.6rem; font-size: 0.75rem; color: var(--bd-ink-soft); }
.bdm-legend span { display: inline-flex; gap: 0.3rem; align-items: center; }
.bdm-actions { display: flex; flex-wrap: wrap; gap: 0.45rem; }
.bdm-act { min-height: 2.2rem; padding: 0 0.9rem; font: inherit; font-weight: 700; color: var(--bd-ink); cursor: pointer; background: var(--bd-surface); border: 1px solid var(--bd-line); border-radius: 0.55rem; }
.bdm-act[data-style="primary"] { color: var(--bd-accent-ink); background: var(--bd-accent); border-color: var(--bd-accent); }
.bdm-act[data-style="danger"] { color: var(--bd-bad); background: var(--bd-bad-soft); border-color: var(--bd-bad); }
.bdm-msg dl { display: grid; grid-template-columns: auto 1fr; gap: 0.15rem 0.6rem; margin: 0 0 0.5rem; font-size: 0.8125rem; } .bdm-msg dt { color: var(--bd-ink-soft); } .bdm-msg dd { margin: 0; font-weight: 600; }
.bdm-msg p { margin: 0; padding-top: 0.5rem; white-space: pre-line; border-top: 1px solid var(--bd-line); }
.bdm-tiles { display: grid; grid-template-columns: repeat(auto-fill, minmax(7.5rem, 1fr)); gap: 0.5rem; }
.bdm-tile { display: grid; gap: 0.1rem; padding: 0.55rem 0.65rem; font: inherit; color: var(--bd-ink-soft); text-align: start; cursor: pointer; background: var(--bd-stage); border: 1px solid var(--bd-line); border-radius: 0.55rem; }
.bdm-tile b { font-size: 1.35rem; line-height: 1.1; color: var(--tone, var(--bd-ink)); }
.bdm-steps { display: flex; flex-wrap: wrap; gap: 0.4rem; margin: 0; padding: 0; list-style: none; counter-reset: step; }
.bdm-step { display: inline-flex; gap: 0.4rem; align-items: center; min-height: 2rem; padding: 0.2rem 0.65rem; font: inherit; font-weight: 600; color: var(--bd-ink-soft); cursor: pointer; background: var(--bd-stage); border: 1px solid var(--bd-line); border-radius: 999px; }
.bdm-step[data-state="done"] { color: var(--bd-good); background: var(--bd-good-soft); } .bdm-step:not([data-state="done"]) > span { color: var(--bd-ink); } .bdm-step[data-state="current"] { color: var(--bd-ink); border: 2px solid var(--bd-accent); }
.bdm [data-focus] { outline: 3px solid var(--bd-accent); outline-offset: 2px; animation: bdm-pulse 1.8s ease-in-out infinite; }
.bdm-sec[data-focus] { background: color-mix(in srgb, var(--bd-accent-soft) 45%, var(--bd-surface)); } tr[data-focus] td { background: var(--bd-accent-soft); }
/* Quieted sections lose their colour, not their contrast: text stays readable. */
.bdm[data-quieting] .bdm-sec:not([data-hot]) { filter: grayscale(0.85); }
@keyframes bdm-pulse { 50% { outline-color: color-mix(in srgb, var(--bd-accent) 35%, transparent); } }
@media (prefers-reduced-motion: reduce) { .bdm [data-focus] { animation: none; } }
.bdm :is(button):focus-visible { outline: 2px solid var(--bd-focus); outline-offset: 2px; }
.bdm[data-frame="terminal"] :is(.bdm-win, .bdm-sec, .bdm-log, .bdm-bar) { color: var(--bd-on-video); background: var(--bd-video); border-color: color-mix(in srgb, var(--bd-on-video) 30%, transparent); }
.bdm[data-frame="terminal"] :is(.bdm-title, .bdm-cell, .bdm-time, .bdm-log time, dd, dt, th, td, .bdm-text, .bdm-trip, .bdm-legend, .bdm-zoom button, .bdm-name, .bdm-code li) {
  font-family: var(--bd-font-mono); color: var(--bd-on-video); }
.bdm[data-frame="terminal"] .bdm-code li::before { color: color-mix(in srgb, var(--bd-on-video) 72%, var(--bd-video)); }
.bdm[data-frame="terminal"] :is(.bdm-sec[data-focus], tr[data-focus] td) { background: color-mix(in srgb, var(--bd-accent) 22%, var(--bd-video)); }
.bdm[data-frame="mail"] .bdm-sec[data-kind="message"] { grid-column: 1 / -1; }
.bdm[data-frame="phone"] .bdm-win { max-width: 23rem; margin: 0 auto; border: 7px solid var(--bd-raised); border-radius: 1.8rem; }
.bdm[data-frame="phone"] .bdm-grid { grid-template-columns: 1fr; }
.bdm[data-frame="document"] .bdm-win { max-width: 48rem; margin: 0 auto; }
`);

  Breakdown.registerBlock({
    mount(element, data, context) {
      const E = Breakdown.el, S = Breakdown.svg;
      const pick = (/** @type {any} */ item) => context.showDetail(item);
      /** A part: a real button with its label, marked for focus. */
      const part = (item, cls, attrs = {}, ...kids) => E('button', { type: 'button', class: cls, 'data-bd-part': item.id, 'data-bd-label': '', 'data-mid': item.id,
        style: toned(item.tone), onclick: () => pick(item), ...attrs }, ...(kids.length ? kids : [item.label]));
      const fields = (list) => list?.length ? E('dl', { class: 'bdm-fields' }, ...list.map((f) => E('div', null, E('dt', null, f.label), E('dd', { style: toned(f.tone) }, f.value)))) : null;
      const lines = (list, cls) => E('ol', { class: `bdm-log ${cls}` }, ...(list ?? []).map((l) => E('li', { 'data-mid': l.id ?? null, style: toned(l.tone) },
        l.time ? E('time', null, l.time) : null, l.id && l.detail ? part({ id: l.id, label: l.text, detail: l.detail }, 'bdm-line', { style: null, 'data-mid': null }) : E('span', null, l.text))));

      function table(s) {
        const cols = s.columns ?? [];
        return E('table', { class: 'bdm-table' }, cols.length ? E('thead', null, E('tr', null, ...cols.map((c) => E('th', null, c)))) : null,
          E('tbody', null, ...(s.rows ?? []).map((r) => E('tr', { 'data-mid': r.id, style: toned(r.tone) },
            E('td', null, part(r, 'bdm-cell', { style: null, 'data-mid': null })), ...(r.cells ?? []).map((c) => E('td', null, c))))));
      }

      function globe(s) {
        const places = s.places ?? [], rad = Math.PI / 180, R = 100;
        const lon0 = Math.atan2(places.reduce((a, p) => a + Math.sin(p.lon * rad), 0), places.reduce((a, p) => a + Math.cos(p.lon * rad), 0)) / rad || 0;
        const lat0 = Math.max(-35, Math.min(45, (places.reduce((a, p) => a + p.lat, 0) / Math.max(1, places.length)) * 0.6));
        const P = (lat, lon, lift = 1) => {
          const f = lat * rad, l = (lon - lon0) * rad, f0 = lat0 * rad;
          return { x: lift * R * Math.cos(f) * Math.sin(l), y: -lift * R * (Math.cos(f0) * Math.sin(f) - Math.sin(f0) * Math.cos(f) * Math.cos(l)),
            v: Math.sin(f0) * Math.sin(f) + Math.cos(f0) * Math.cos(f) * Math.cos(l) > 0 };
        };
        const path = (pts) => { let d = '', on = false; for (const p of pts) { if (!p.v) { on = false; continue; } d += `${on ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`; on = true; } return d; };
        const grid = [];
        for (let lon = -180; lon < 180; lon += 30) grid.push(path(Array.from({ length: 33 }, (_, i) => P(-80 + i * 5, lon))));
        for (let lat = -60; lat <= 60; lat += 30) grid.push(path(Array.from({ length: 73 }, (_, i) => P(lat, -180 + i * 5))));
        const svg = S('svg', { viewBox: '-112 -112 224 224', role: 'img', 'aria-label': `A globe showing ${places.map((p) => p.label).join(' and ')}` },
          S('circle', { r: R, fill: 'var(--bd-stage)', stroke: 'var(--bd-line)' }),
          S('path', { d: grid.join(''), fill: 'none', stroke: 'var(--bd-line)', 'stroke-width': 0.8 }));
        const trip = s.travel && places.find((p) => p.id === s.travel.from) && places.find((p) => p.id === s.travel.to) ? s.travel : null;
        let km = 0;
        if (trip) {
          const a = places.find((p) => p.id === trip.from), b = places.find((p) => p.id === trip.to);
          const vec = (p) => [Math.cos(p.lat * rad) * Math.cos(p.lon * rad), Math.cos(p.lat * rad) * Math.sin(p.lon * rad), Math.sin(p.lat * rad)];
          const [va, vb] = [vec(a), vec(b)], w = Math.acos(Math.min(1, va.reduce((sum, v, i) => sum + v * vb[i], 0)));
          km = Math.round((w * 6371) / 100) * 100;
          const pts = Array.from({ length: 25 }, (_, i) => {
            const t = i / 24, k1 = Math.sin((1 - t) * w) / Math.sin(w || 1), k2 = Math.sin(t * w) / Math.sin(w || 1);
            const v = va.map((x, j) => k1 * x + k2 * vb[j]);
            return P(Math.asin(v[2]) / rad, Math.atan2(v[1], v[0]) / rad, 1 + 0.16 * Math.sin(Math.PI * t));
          }).map((p) => ({ ...p, v: true }));
          svg.append(S('path', { d: path(pts), fill: 'none', stroke: TONE[b.tone ?? ''] ?? 'var(--bd-accent)', 'stroke-width': 2.4, 'stroke-dasharray': '5 4', 'stroke-linecap': 'round' }));
        }
        places.forEach((p, i) => {
          const at = P(p.lat, p.lon);
          if (at.v) svg.append(S('g', { 'data-mid': p.id }, S('circle', { cx: at.x, cy: at.y, r: 9, fill: SOFT[p.tone ?? ''] ?? 'var(--bd-accent-soft)' }),
            S('circle', { cx: at.x, cy: at.y, r: 4.5, fill: TONE[p.tone ?? ''] ?? 'var(--bd-accent)', stroke: 'var(--bd-surface)', 'stroke-width': 1.5 }),
            S('text', { x: at.x + (at.x > 40 ? -14 : 12), y: at.y + 4, 'font-size': 11, 'font-weight': 700, fill: 'var(--bd-ink)', 'text-anchor': at.x > 40 ? 'end' : 'start' }, String(i + 1))));
        });
        return [E('div', { class: 'bdm-globe' }, svg, E('div', null,
          E('ul', { class: 'bdm-places' }, ...places.map((p, i) => E('li', null, part(p, 'bdm-place', {}, E('i'), `${i + 1}. `, p.label)))),
          trip ? E('p', { class: 'bdm-trip' }, `≈ ${km.toLocaleString('en')} km apart${trip.label ? ` · ${trip.label}` : ''}`) : null))];
      }

      function chart(s) {
        const series = s.series ?? [], n = Math.max(2, ...series.map((x) => x.values.length)), max = Math.max(1, ...series.flatMap((x) => x.values));
        const W = 300, H = 110, colour = (x, i) => TONE[x.tone ?? ''] ?? `var(--bd-series-${i + 1})`;
        const y = (v) => H - (v / max) * (H - 12);
        const art = S('svg', { viewBox: `0 0 ${W} ${H + 16}`, role: 'img', 'aria-label': `${s.label}: ${series.map((x) => `${x.label} ${x.values.join(', ')}`).join('; ')}` },
          S('line', { x1: 0, x2: W, y1: H, y2: H, stroke: 'var(--bd-line)' }));
        series.forEach((x, k) => {
          if (s.style === 'line') {
            art.append(S('polyline', { points: x.values.map((v, i) => `${(i / (n - 1)) * W},${y(v)}`).join(' '), fill: 'none', stroke: colour(x, k), 'stroke-width': 2.5, 'stroke-linejoin': 'round' }));
          } else {
            const bw = ((W / n) * 0.7) / series.length;
            x.values.forEach((v, i) => art.append(S('rect', { x: i * (W / n) + (W / n) * 0.15 + k * bw, y: y(v), width: bw - 1, height: H - y(v), rx: 2, fill: colour(x, k) })));
          }
        });
        const axis = s.axis ?? [];
        [0, Math.floor((axis.length - 1) / 2), axis.length - 1].filter((v, i, a) => axis[v] && a.indexOf(v) === i).forEach((i) => art.append(S('text', {
          x: s.style === 'line' ? (i / (n - 1)) * W : i * (W / n) + W / n / 2, y: H + 13, 'font-size': 10, fill: 'var(--bd-ink-soft)', 'text-anchor': i === 0 ? 'start' : i === axis.length - 1 ? 'end' : 'middle' }, axis[i])));
        return E('div', { class: 'bdm-chart' }, art, E('div', { class: 'bdm-legend' }, ...series.map((x, k) => E('span', null, E('i', { class: 'bdm-dot', style: `--tone: ${colour(x, k)}` }),
          `${x.label}${s.unit ? ` (${s.unit})` : ''}: ${x.values[x.values.length - 1]}`))));
      }

      const R = {
        alert: (s) => [s.text ? E('p', { class: 'bdm-text' }, s.text) : null, fields(s.fields)],
        fields: (s) => [fields(s.fields)],
        table: (s) => [table(s)],
        log: (s) => [lines(s.lines, '')],
        code: (s) => [lines(s.lines, 'bdm-code')],
        globe: (s) => globe(s),
        chart: (s) => [chart(s)],
        actions: (s) => [E('div', { class: 'bdm-actions' }, ...(s.items ?? []).map((it) => part(it, 'bdm-act', { 'data-style': it.style ?? 'plain', style: null })))],
        message: (s) => [E('div', { class: 'bdm-msg' }, E('dl', null, ...[['From', s.from], ['To', s.to], ['Subject', s.subject]].filter((r) => r[1]).flatMap(([k, v]) => [E('dt', null, k), E('dd', null, v)])),
          s.text ? E('p', null, s.text) : null)],
        metrics: (s) => [E('div', { class: 'bdm-tiles' }, ...(s.items ?? []).map((it) => part(it, 'bdm-tile', {}, E('b', null, `${it.value ?? ''}${s.unit && it.value ? ` ${s.unit}` : ''}`), E('span', null, it.label))))],
        steps: (s) => [E('ol', { class: 'bdm-steps' }, ...(s.items ?? []).map((it) => E('li', null, part(it, 'bdm-step', { 'data-state': it.state ?? 'todo', style: null },
          E('span', { 'aria-hidden': 'true' }, it.state === 'done' ? '✓' : it.state === 'current' ? '●' : '○'), it.label))))],
      };

      const sections = data.sections.map((s) => {
        const tone = s.kind === 'alert' && !s.tone ? SEVERITY[s.severity ?? 'medium'] : s.tone;
        return E('section', { class: 'bdm-sec', 'data-mid': s.id, 'data-kind': s.kind, 'data-wide': s.wide ? '' : null, style: toned(tone) },
          E('header', { class: 'bdm-head' }, s.severity ? E('span', { class: 'bdm-pill', style: toned(SEVERITY[s.severity]) }, s.severity) : null,
            part(s, 'bdm-title', { style: null }), s.time ? E('span', { class: 'bdm-time' }, s.time) : null), ...(R[s.kind] ?? (() => []))(s));
      });
      const grid = E('div', { class: 'bdm-grid' }, ...sections);
      let zoom = 1;
      const setZoom = (z) => { zoom = Math.min(1.6, Math.max(0.8, z)); grid.style.zoom = String(zoom); };
      const frame = data.frame ?? 'app';
      const bar = E('div', { class: 'bdm-bar' },
        frame === 'phone' ? E('span', { class: 'bdm-name' }, '9:41') : frame === 'mail' ? E('span', { class: 'bdm-name', 'aria-hidden': 'true' }, '✉')
          : E('span', { class: 'bdm-dots', 'aria-hidden': 'true' }, E('i'), E('i'), E('i')),
        E('span', { class: 'bdm-name' }, frame === 'terminal' ? `${data.title} — bash` : data.title),
        frame === 'browser' && data.address ? E('span', { class: 'bdm-addr' }, `🔒 ${data.address}`) : null,
        E('span', { class: 'bdm-zoom', role: 'group', 'aria-label': 'Zoom' },
          E('button', { type: 'button', 'aria-label': 'Zoom out', onclick: () => setZoom(zoom - 0.2) }, '−'),
          E('button', { type: 'button', 'aria-label': 'Zoom in', onclick: () => setZoom(zoom + 0.2) }, '+')));
      const nav = data.nav?.length ? E('nav', { class: 'bdm-nav', 'aria-label': `${data.title} menu` },
        ...data.nav.map((item) => E('span', { 'aria-current': item === data.current ? 'page' : null }, item))) : null;
      const body = E('div', { class: 'bdm-body' }, nav, grid);
      const root = E('div', { class: 'bdm', 'data-frame': frame }, E('div', { class: 'bdm-win', role: 'group', 'aria-label': `Mockup: ${data.title}` }, bar, body));
      element.append(root);
      // In a scene the window has a fixed height and scrolls inside; worked out again only when the width changes.
      let width = 0, room = 0;
      const fit = () => {
        width = element.clientWidth;
        if (context.place !== 'scene') return;
        room = context.size().height;
        root.setAttribute('data-capped', '');
        root.style.setProperty('--bdm-h', '9999px');
        const chrome = root.offsetHeight - body.offsetHeight;
        root.style.setProperty('--bdm-h', `${Math.max(80, Math.round(room - chrome))}px`);
      };
      fit();
      return {
        resize() { if (Math.abs(element.clientWidth - width) > 1 || (context.place === 'scene' && Math.abs(context.size().height - room) > 1)) fit(); },
        focus({ ids }) {
          const on = new Set(ids);
          root.toggleAttribute('data-quieting', on.size > 0);
          root.querySelectorAll('[data-mid]').forEach((el) => el.toggleAttribute('data-focus', on.has(/** @type {HTMLElement} */ (el).dataset.mid ?? '')));
          // A part that is its own section's title marks the section, not a second ring.
          root.querySelectorAll('.bdm-title[data-focus]').forEach((el) => el.removeAttribute('data-focus'));
          sections.forEach((sec) => sec.toggleAttribute('data-hot', sec.hasAttribute('data-focus') || Boolean(sec.querySelector('[data-focus]'))));
          // Bring the first focused part into view inside the window, never by scrolling the page.
          const first = /** @type {HTMLElement|null} */ (grid.querySelector('[data-focus]'));
          if (first && grid.scrollHeight > grid.clientHeight + 1) {
            const top = first.getBoundingClientRect().top - grid.getBoundingClientRect().top + grid.scrollTop - 12;
            grid.scrollTo({ top: Math.max(0, top), behavior: Breakdown.kit.reducedMotion() ? 'auto' : 'smooth' });
          }
        },
      };
    },
  });
})();
