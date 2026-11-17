// @ts-check
/**
 * Boundaries: areas as raised platforms on one floor, seen at an angle, and a path that crosses from one
 * area to another through checkpoints that let it through, stop it, or are missing. The author names the
 * areas, their parts, how they are joined and the steps; everything else is worked out here. The starting
 * view is laid out first so that no label covers another, and every spot is then kept on the floor.
 */
(() => {
  const PAD = 10, GAP = 8, ZP = 9, RISE = 9, WALL = 15, FM = 8, LIMIT = 0.6, STEP = Math.PI / 12;
  const WORD = { passes: 'Let through', blocked: 'Stopped', missing: 'No check' };
  const SAY = { passes: 'The check at the edge lets it through.', blocked: 'The check at the edge stops it.', missing: 'There is no check at the edge, so it goes straight through.' };
  const RING = 'M8 2.5a5.5 5.5 0 1 0 0 11a5.5 5.5 0 1 0 0-11z', ICON = { passes: 'M3.5 8.5l3 3 6-7', blocked: `${RING}M5 8h6`, missing: RING };

  Breakdown.css('boundaries', `
.bdb-bnd { position: relative; height: 100%; isolation: isolate; } .bdb-bnd[data-turning] :is(.bdb-bnd-view, .bdb-bnd-view button, polygon) { cursor: grabbing; }
.bdb-bnd-view { position: absolute; inset: 0; overflow: hidden; touch-action: pan-y; cursor: grab; user-select: none; -webkit-user-select: none; }
.bdb-bnd-art { position: absolute; inset: 0; width: 100%; height: 100%; fill: none; stroke-linecap: round; stroke-linejoin: round; }
.bdb-bnd-floor { fill: var(--bd-raised); fill-opacity: 0.45; stroke: var(--bd-line); } .bdb-bnd-side { fill: var(--bd-line); stroke: var(--bd-line); }
.bdb-bnd-top { fill: var(--bd-raised); stroke: var(--bd-line); cursor: pointer; } .bdb-bnd-top[data-on] { stroke: var(--bd-accent); stroke-width: 2; }
.bdb-bnd-band { stroke: var(--bd-line); stroke-width: 9; } .bdb-bnd-wire { stroke: var(--bd-ink-soft); stroke-width: 2; } .bdb-bnd-snap { stroke: var(--bd-ink); stroke-width: 2.25; }
.bdb-bnd-way { stroke: var(--bd-ink-soft); stroke-width: 2.25; stroke-dasharray: 0.1 5; } .bdb-bnd-way[data-done] { stroke-width: 1.5; stroke-dasharray: none; }
.bdb-bnd-head { stroke: var(--bd-ink-soft); stroke-width: 1.75; } .bdb-bnd-art [data-on] { stroke: var(--bd-accent); stroke-width: 2.5; stroke-dasharray: none; }
.bdb-bnd-rest { stroke: var(--bd-ink-soft); stroke-width: 1.25; stroke-dasharray: 2 4; opacity: 0.7; } .bdb-bnd-lead { stroke: var(--bd-ink-soft); stroke-width: 1.5; }
.bdb-bnd-block { fill: var(--bd-ink-soft); stroke: var(--bd-ink-soft); stroke-width: 1; } .bdb-bnd-block[data-face] { fill: var(--bd-ink); stroke: var(--bd-ink); }
.bdb-bnd-lead[data-note] { stroke-width: 1; stroke-dasharray: 2 3; } .bdb-bnd-art [data-gate="missing"] { fill: none; stroke: var(--bd-ink-soft); stroke-width: 1.75; stroke-dasharray: 3.5 2.5; }
.bdb-bnd-zone, .bdb-bnd-tile { position: absolute; top: 0; left: 0; width: max-content; min-width: 1.75rem; min-height: 1.75rem; padding: 0.25rem 0.5rem; margin: 0; font: inherit;
  font-size: 0.875rem; font-weight: 600; line-height: 1.25; color: var(--bd-ink); overflow-wrap: anywhere; cursor: pointer; background: var(--bd-surface); border: 1px solid var(--bd-line); border-radius: 0.5rem; }
.bdb-bnd[data-narrow] :is(.bdb-bnd-zone, .bdb-bnd-tile) { padding: 0.25rem 0.375rem; font-size: 0.8125rem; }
.bdb-bnd-zone { font-weight: 700; text-align: start; background: var(--bd-raised); border-color: transparent; }
.bdb-bnd-zone[aria-pressed="true"] { border-color: var(--bd-accent); box-shadow: inset 3px 0 0 var(--bd-accent); }
.bdb-bnd-tile { text-align: center; box-shadow: 0 2px 0 var(--bd-line), 0 5px 8px rgb(0 0 0 / 0.16); }
.bdb-bnd-tile[aria-pressed="true"] { color: var(--bd-accent-ink); background: var(--bd-accent); border-color: var(--bd-accent); }
.bdb-bnd-sign, .bdb-bnd-note { position: absolute; top: 0; left: 0; z-index: 8000; display: flex; gap: 0.25rem; align-items: center; width: max-content; padding: 0 0.5rem;
  font-size: 0.75rem; font-weight: 700; line-height: 1.5; color: var(--bd-ink); pointer-events: none; background: var(--bd-surface); border: 1.5px solid var(--bd-ink-soft); border-radius: 0.5rem; }
.bdb-bnd-sign { min-height: 1.5rem; padding-left: 0.3125rem; box-shadow: 0 2px 6px rgb(0 0 0 / 0.14); } .bdb-bnd-sign[data-gate="blocked"] { border-color: var(--bd-ink); }
.bdb-bnd-sign[data-gate="missing"] { background: var(--bd-stage); border-style: dashed; box-shadow: none; } .bdb-bnd-sign[data-gate="missing"] svg { stroke-width: 1.5; stroke-dasharray: 2.2 2.2; }
.bdb-bnd-sign[data-on] { border-color: var(--bd-accent); box-shadow: inset 0 -2px 0 var(--bd-accent); }
.bdb-bnd-sign svg { width: 0.875rem; height: 0.875rem; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.bdb-bnd-note::first-letter { text-transform: uppercase; } .bdb-bnd-note { z-index: 7000; display: block; font-weight: 600; color: var(--bd-ink-soft); background: var(--bd-stage); border: 1px solid var(--bd-line); }
.bdb-bnd-marker { position: absolute; top: 0; left: 0; z-index: 9000; width: 16px; height: 16px; margin: -8px 0 0 -8px; pointer-events: none; background: var(--bd-accent);
  border: 2.5px solid var(--bd-stage); border-radius: 50%; box-shadow: 0 0 0 1.5px var(--bd-accent), 0 3px 5px rgb(0 0 0 / 0.3); }
.bdb-bnd-bar { position: absolute; top: 2px; left: 10px; right: 10px; z-index: 9999; display: flex; flex-wrap: wrap; gap: 0.375rem; align-items: center; }
.bdb-bnd-go, .bdb-bnd-tool { display: inline-flex; gap: 0.25rem; align-items: center; justify-content: center; min-width: 1.75rem; height: 1.75rem; padding: 0 0.5rem; font: inherit;
  font-size: 0.8125rem; font-weight: 600; color: var(--bd-ink); cursor: pointer; background: var(--bd-surface); border: 1px solid var(--bd-line); border-radius: 0.5rem; }
.bdb-bnd-tool { padding: 0 0.375rem; font-size: 0.75rem; } .bdb-bnd-go:disabled { cursor: default; opacity: 0.5; } .bdb-bnd-play { margin-left: auto; }
.bdb-bnd :is(.bdb-bnd-go, .bdb-bnd-tool) svg { width: 1rem; height: 1rem; fill: none; stroke: currentColor; stroke-width: 1.75; stroke-linecap: round; stroke-linejoin: round; }
.bdb-bnd .bdb-bnd-go svg.bdb-bnd-solid { width: 0.75rem; fill: currentColor; stroke-width: 1; } .bdb-bnd[data-compact] .bdb-bnd-more { display: none; }
.bdb-bnd-count { min-width: 5.75em; font-size: 0.8125rem; font-weight: 700; font-variant-numeric: tabular-nums; color: var(--bd-ink-soft); }
.bdb-bnd-tools { position: absolute; right: 10px; bottom: 10px; z-index: 9999; display: flex; gap: 0.25rem; }
`);

  /** How much of box `a` is covered by the boxes already placed (0 when it is clear of all of them). */
  const covered = (a, placed) => placed.reduce((sum, b) => sum + Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0) + 3) * Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0) + 3), 0);
  const box = (x, y, w, h) => ({ x0: x - w / 2, y0: y - h / 2, x1: x + w / 2, y1: y + h / 2 }), length = (pts) => pts.slice(1).reduce((sum, p, i) => sum + Math.hypot(p.x - pts[i].x, p.y - pts[i].y), 0);
  const line = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join('');
  /** The point part of the way along a drawn line, measured by length. */
  function along(pts, t) {
    const piece = (i) => Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    let left = t * length(pts), i = 1;
    for (; i < pts.length - 1 && left > piece(i); i += 1) left -= piece(i);
    const p = pts[i - 1], q = pts[i] ?? p, k = q === p || !piece(i) ? 1 : Math.min(1, left / piece(i));
    return { x: p.x + (q.x - p.x) * k, y: p.y + (q.y - p.y) * k };
  }
  /** A drawn line that starts at the edge of the label `b` it leaves from, rather than under it. */
  function trim(b, pts) {
    let i = 1;
    while (i < pts.length - 1 && Math.abs(pts[i].x - b.x) < b.w / 2 + 3 && Math.abs(pts[i].y - b.y) < b.h / 2 + 3) i += 1;
    const dx = pts[i].x - b.x, dy = pts[i].y - b.y, k = Math.min(1, (b.w / 2 + 3) / (Math.abs(dx) || 1e-6), (b.h / 2 + 3) / (Math.abs(dy) || 1e-6));
    return [{ x: b.x + dx * k, y: b.y + dy * k }, ...pts.slice(i)];
  }

  Breakdown.registerBlock({
    mount(element, data, context) {
      const { el, svg } = Breakdown, steps = data.steps, last = steps.length;
      let start = 0.12, off = 0, aim = 0, frame = 0, run = 0, timer = 0, at = 0, playing = false, selected = null, drag = null, dropped = -1000;
      let view3 = { cx: 0, cy: 0, s: 0.6, wide: 0, high: 0, bar: 0, tall: null, floor: [] }, mark = { k: 1, t: 0 };   // the marker is part of the way (t) along one step's route
      const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches, move = (item, x, y) => { item.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`; };
      const icon = (d, solid = false) => svg('svg', { viewBox: '0 0 16 16', 'aria-hidden': 'true', class: solid ? 'bdb-bnd-solid' : null }, svg('path', { d }));
      const press = (kind, attrs, ...face) => el('button', { type: 'button', class: kind, title: attrs['aria-label'], ...attrs }, ...face);
      const floor = svg('polygon', { class: 'bdb-bnd-floor' }), ground = svg('g'), under = svg('g'), over = svg('g'), marker = el('div', { class: 'bdb-bnd-marker', 'aria-hidden': 'true' });
      const view = el('div', { class: 'bdb-bnd-view' }, svg('svg', { class: 'bdb-bnd-art', 'aria-hidden': 'true' }, floor, ground, under, over), marker);
      const tool = (name, way, face) => press('bdb-bnd-tool', { 'data-turn': ['left', 'reset', 'right'][way + 1], 'aria-label': name, onclick: () => glide(way ? aim + way * STEP : 0) }, face);
      const tools = el('div', { class: 'bdb-bnd-tools', role: 'group', 'aria-label': 'Turn the floor. The left and right arrow keys turn it too.' },
        tool('Turn left', -1, icon('M13 11.5c0-3.3-2.2-5.5-5-5.5S3.5 7.5 3.5 7.5M3 4v3.5h3.5')), tool('Turn right', 1, icon('M3 11.5C3 8.2 5.2 6 8 6s4.5 1.5 4.5 1.5M13 4v3.5H9.5')), tool('Reset to the starting view', 0, 'Reset'));
      const back = press('bdb-bnd-go', { 'data-step': 'back', 'aria-label': 'Back one step', onclick: () => { halt(); goTo(at - 1); } }, icon('M10 3.5 5.5 8l4.5 4.5'), 'Back');
      const next = press('bdb-bnd-go', { 'data-step': 'next', 'aria-label': 'Next step', onclick: () => { halt(); goTo(at + 1, true); } }, 'Next', icon('M6 3.5 10.5 8 6 12.5'));
      const play = press('bdb-bnd-go bdb-bnd-play', { 'data-step': 'play', onclick: () => (playing ? halt() : player()) }), count = el('span', { class: 'bdb-bnd-count' });
      const bar = el('div', { class: 'bdb-bnd-bar', role: 'group', 'aria-label': 'Step along the path' }, back, next, count, play), root = el('div', { class: 'bdb-bnd' }, view, bar, tools);

      // Areas and their parts are real buttons; each is a spot on its platform that a step can leave from or arrive at.
      const buttons = new Map(), spots = new Map();
      const button = (part, kind, zone) => {
        const made = view.appendChild(press(kind, { 'data-bd-part': part.id, 'data-bd-label': true, 'aria-pressed': 'false', title: null, onclick: () => select(part.id) }, part.label));
        spots.set(part.id, zone.items[zone.items.push({ id: part.id, zone, el: buttons.set(part.id, made).get(part.id) }) - 1]);
      };
      const zones = data.zones.map((zone, i) => {
        const top = svg('polygon', { class: 'bdb-bnd-top', 'data-zone': zone.id, onclick: () => select(zone.id) }), side = svg('path', { class: 'bdb-bnd-side' });
        const area = { id: zone.id, i, top, side, group: ground.appendChild(svg('g', null, side, top)), x0: 0, x1: 0, z0: 0, z1: 0, near: 0, more: 0, items: [] };
        return button(zone, 'bdb-bnd-zone', area), area;
      });
      const byId = new Map(zones.map((z) => [z.id, z]));
      for (const part of data.parts ?? []) button(part, 'bdb-bnd-tile', byId.get(part.zone));

      // Words that stand on the floor: a sign at each checkpoint, and a name on a connection.
      const tags = [];
      const tag = (kind, text, state = null, way = null) => tags[tags.push({ kind, way, el: view.appendChild(el('span', { class: `bdb-bnd-${kind}`, 'data-bd-label': true, 'data-gate': state, 'data-step': way?.k }, state ? icon(ICON[state]) : null, ...[].concat(text))),
          line: over.appendChild(svg('path', { class: 'bdb-bnd-lead', 'data-gate': state, 'data-note': kind === 'note' ? '' : null })), dx: 0, dy: 0, w: 0, h: 0, cands: [], ends: [], foot: null, crowded: false }) - 1];
      const links = (data.links ?? []).filter((l) => l.from !== l.to).map((l) => {
        const [a, b] = [byId.get(l.from), byId.get(l.to)].sort((p, q) => p.i - q.i), cut = l.state === 'cut', text = l.label ? (cut ? [el('span', { class: 'bdb-bnd-more' }, `${l.label} · `), 'cut'] : l.label) : cut ? 'Cut' : '';
        const made = { a, b, cut, lane: NaN, at: null, runs: [], caps: [], band: svg('path', { class: 'bdb-bnd-band', 'data-state': l.state }), wire: svg('path', { class: 'bdb-bnd-wire' }),
          snap: svg('path', { class: 'bdb-bnd-snap' }), tag: text ? tag('note', text) : null };
        if (made.tag) made.tag.ends = [a.id, b.id];
        return under.append(made.band, made.wire, made.snap), made;
      });
      const ways = steps.map((step, k) => {
        const A = spots.get(step.from), B = spots.get(step.to), gated = A.zone !== B.zone && step.gate, block = (face) => svg('path', { class: 'bdb-bnd-block', 'data-face': face, 'data-gate': step.gate, 'data-step': k + 1 });
        const way = { k: k + 1, A, B, lane: 0, twin: null, key: k + 1, go: [], rest: [], track: [], line: svg('path', { class: 'bdb-bnd-way' }), head: svg('path', { class: 'bdb-bnd-head' }), tail: svg('path', { class: 'bdb-bnd-rest' }), gate: null };
        if (gated) way.gate = { state: step.gate, blocks: [], feet: [], mid: null, top: block(null), face: block(''), tag: tag('sign', WORD[step.gate], step.gate, way) };
        return over.append(way.tail, way.line, way.head, ...(gated ? [way.gate.face, way.gate.top] : [])), way;
      });

      /** Lay out one area's name and parts in rows, back to front, and say how deep the area must be. */
      function pack(zone, wide, tall, edge, k) {
        const room = wide - 2 * ZP, cs = k.c0 * k.s, rows = [];
        // The area's name may reach over the gap beside it on a crowded floor; the parts stay on their platform.
        zone.items.forEach((it, i) => { it.el.style.maxWidth = `${Math.max(48, i || tall || zone.i === zones.length - 1 ? room : room + edge - GAP)}px`; Object.assign(it, { w: it.el.offsetWidth, h: it.el.offsetHeight }); });
        zone.items.forEach((it, i) => { const row = rows[rows.length - 1]; if (row && row.reduce((sum, r) => sum + r.w + GAP, 0) + it.w <= room && (tall || i > 1)) row.push(it); else rows.push([it]); });
        let v = 0;
        rows.forEach((row, r) => {
          let left = tall || r === 0 ? ZP : ZP + (room - row.reduce((sum, it) => sum + it.w + GAP, -GAP)) / 2;   // the name sits at the back on the left; parts are centred
          for (const it of row) Object.assign(it, { u: (left + it.w / 2) / k.c0, row: r }), left += it.w + GAP;
          // Rows run along the platform, so each is set back from the one behind it far enough to clear it everywhere.
          v = r ? v + Math.max(...rows[r - 1].flatMap((a) => row.map((b) => ((a.h + b.h) / 2 + GAP + (b.u - a.u) * k.n0 * k.s) / cs))) : Math.max(...row.map((it) => (it.h / 2 + ZP) / cs));
          for (const it of row) it.v = v;
        });
        return v + Math.max(...rows[rows.length - 1].map((it) => (it.h / 2 + ZP) / cs));
      }
      /** Work out the whole layout for the room there is, then draw it. */
      function fit(size = context.size()) {
        if (!size.width) return;
        const n = zones.length, room = size.width - 2 * PAD, word = Math.max(...[...data.zones, ...(data.parts ?? [])].flatMap((p) => p.label.split(/\s+/).map((w) => w.length)));
        // On a phone, or where the longest word of a label would not fit on a platform side by side, the areas go one behind another.
        const tall = size.width < 480 || (room - (n - 1) * (n >= 4 ? 52 : 66) - 2 * FM - 24) / n < Math.max(78, word * 7.6 + 16 + 2 * ZP), edge = !tall && n >= 4 ? 52 : 66;
        [start, off, aim] = [tall ? 0.06 : 0.12, ...(tall === view3.tall ? [off, aim] : [0, 0])];   // a floor laid out the other way starts from its starting view
        const s = tall ? 0.7 : 0.6, c0 = Math.cos(start), n0 = Math.sin(start), cs = c0 * s, barH = bar.offsetHeight + 4, toolsW = tools.offsetWidth, toolsH = tools.offsetHeight;
        const P0 = (p) => ({ x: p.x * c0 + p.z * n0, y: (p.z * c0 - p.x * n0) * s - p.e });
        root.dataset.layout = tall ? 'tall' : 'wide', root.toggleAttribute('data-compact', size.width < 420);
        let wide = 0, deep = [];
        /** Size the platforms from their labels, made `extra` pixels deeper than they need to be, and lay them out. */
        const shape = (extra) => {
          wide = tall ? room - 2 * FM - 24 : (room - (n - 1) * edge - 2 * FM - 24) / n;
          for (let pass = 0; pass < 3; pass += 1) {   // the labels decide how deep the platforms are, and the depth how wide they can be
            root.toggleAttribute('data-narrow', wide < 112);
            deep = zones.map((zone) => pack(zone, wide, tall, edge, { c0, n0, s }));
            const depth = (tall ? deep.reduce((a, b) => a + b, 0) + edge * (n - 1) : Math.max(...deep)) + extra / cs + 2 * FM;
            const fits = tall ? (room - depth * n0) / c0 - 2 * FM : ((room - depth * n0) / c0 - 2 * FM - (n - 1) * edge) / n;
            if (Math.abs(fits - wide) < 1.5) break;
            wide = fits;
          }
          return build(extra);
        };
        let got = shape(0);
        // Spare height makes the platforms deeper, up to about as deep as they are wide.
        const extra = Math.min(size.height - got.least, tall ? deep.reduce((sum, d) => sum + 0.5 * wide - d * cs, 0) : 0.9 * wide - Math.max(...deep) * cs);
        if (extra > 6) got = shape(extra);
        const height = Math.max(size.height, got.least), placed = [];
        root.style.minHeight = `${got.least}px`;
        view3 = { ...view3, cx: got.cx, cy: barH + PAD - got.top + (height - got.least) / 2, s, wide: size.width, high: height, tall, bar: barH };

        /** Place the platforms, lanes, routes and connections, and say how tall the picture is. */
        function build(extra) {
          let cursor = 0;
          zones.forEach((zone, i) => {
            const depth = tall ? deep[i] + extra / cs / n : Math.max(...deep) + extra / cs;
            Object.assign(zone, tall ? { x0: 0, x1: wide, z0: cursor, z1: cursor + depth } : { x0: i * (wide + edge), x1: i * (wide + edge) + wide, z0: 0, z1: depth }, { more: (depth - deep[i]) / 2 });
            cursor += depth + edge;
          });
          const mx = zones[n - 1].x1 / 2, mz = zones[n - 1].z1 / 2;   // the floor turns about its middle
          for (const zone of zones) {
            Object.assign(zone, { x0: zone.x0 - mx, x1: zone.x1 - mx, z0: zone.z0 - mz, z1: zone.z1 - mz });
            for (const it of zone.items) Object.assign(it, { x: zone.x0 + it.u, z: zone.z0 + it.v + (it.row ? zone.more : 0), e: RISE });
          }
          view3.floor = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => ({ x: a * (mx + FM), z: b * (mz + FM), e: 0 }));
          const pt = (a, c, e = 0) => (tall ? { x: c, z: a, e } : { x: a, z: c, e }), edgeOf = (zone, side) => (tall ? (side > 0 ? zone.z1 : zone.z0) : side > 0 ? zone.x1 : zone.x0);
          /** Off the edge of one platform, down to the floor, across the gap and up onto the next one, in lane L. */
          const cross = (zone, dir, L) => { const out = edgeOf(zone, dir), into = edgeOf(zones[zone.i + dir], -dir); return [pt(out, L, RISE), pt(out, L), pt(into, L), pt(into, L, RISE)]; };
          // Each crossing gets a lane across the gaps, clear of the others. A step between two joined areas runs beside their connection
          // (unless it is cut, so the break and any checkpoint each read on their own), and steps into one area from the same side share
          // its checkpoint, as people share a door.
          const lo = -(tall ? mx : mz) + 24, hi = (tall ? mx : mz) - 24, taken = zones.map(() => []);
          const claim = (i, j, want) => {
            const gaps = taken.slice(Math.min(i, j), Math.max(i, j)), tries = [0, 26, -26, 52, -52, 78, -78, 104, -104].map((d) => Math.max(lo, Math.min(hi, want + d)));
            const lane = tries.find((l) => gaps.every((list) => list.every((m) => Math.abs(m - l) >= 24))) ?? tries[0];
            return gaps.forEach((list) => list.push(lane)), lane;
          };
          links.forEach((link) => { link.lane = NaN; });
          for (const way of ways) {
            const i = way.A.zone.i, j = way.B.zone.i, link = links.find((l) => !l.cut && l.a.i === Math.min(i, j) && l.b.i === Math.max(i, j));
            way.twin = way.gate && ways.find((w) => w.k < way.k && w.gate && w.B.zone === way.B.zone && Math.sign(w.B.zone.i - w.A.zone.i) === Math.sign(j - i)), way.key = way.twin?.key ?? way.k;
            if (link && i !== j && Number.isNaN(link.lane)) link.lane = claim(i, j, tall ? (way.A.x + way.B.x) / 2 : (way.A.z + way.B.z) / 2);
            if (i !== j) way.lane = way.twin ? way.twin.lane : link ? link.lane + 12 : claim(i, j, tall ? (way.A.x + way.B.x) / 2 : (way.A.z + way.B.z) / 2);
          }
          for (const link of links) if (Number.isNaN(link.lane)) link.lane = claim(link.a.i, link.b.i, tall ? lo : hi);
          // A step to another area runs off its platform, across each gap and onto the next; within one area it bows in a low arc.
          for (const way of ways) {
            const { A, B, gate } = way, i = A.zone.i, j = B.zone.i, dir = Math.sign(j - i), L = way.lane, dx = B.x - A.x, dz = B.z - A.z, span = Math.hypot(dx, dz) || 1;
            const bow = (Math.abs(dx) * (Math.max(A.h, B.h) / 2 + 12) / cs + Math.abs(dz) * (Math.max(A.w, B.w) / 2 + 12)) / span, arc = (q) => (bow * 4 * q * (6 - q)) / 36 / span;
            way.go = dir ? [A, ...(dir > 0 ? zones.slice(i, j) : zones.slice(j + 1, i + 1).reverse()).flatMap((zone) => cross(zone, dir, L)), B]
              : [0, 1, 2, 3, 4, 5, 6].map((q) => ({ x: A.x + (dx * q) / 6 + dz * arc(q), z: A.z + (dz * q) / 6 - dx * arc(q), e: RISE }));
            way.rest = [];
            if (!gate) continue;
            // The checkpoint stands across the lane at the edge of the area being entered: a solid block when it stops the path,
            // two posts with the way open between them when it lets the path through, and a dashed outline when it is missing.
            const into = edgeOf(B.zone, -dir), m = (a, c, e = 0) => pt(into - dir * 8 + a, L + c, e);
            gate.blocks = (gate.state === 'passes' ? [[-24, -12], [12, 24]] : [[-24, 24]]).map(([c1, c2]) => [m(-5, c1), m(5, c2)]);
            Object.assign(gate, { feet: [m(0, -18, WALL), m(0, 18, WALL)], mid: pt(into - (dir * edge) / 2, L) });
            // A stopped step halts just short of the block; coming towards the viewer that is above its top, where the block cannot hide it.
            const stop = m(-dir * Math.min(edge - 16, 5 + (tall && dir > 0 ? (WALL + 10) / cs : 10)), 0);
            if (gate.state === 'blocked') Object.assign(way, { rest: [stop, ...way.go.slice(-3)], go: [...way.go.slice(0, -3), stop] });
          }
          // A connection is a band from one platform to the other; a cut one is broken in the middle of the first gap, with a cross in the break.
          for (const link of links) {
            const L = link.lane, mid = edgeOf(link.a, 1) + edge / 2;
            const pts = [pt(edgeOf(link.a, 1) - 16, L, RISE), ...zones.slice(link.a.i, link.b.i).flatMap((zone) => cross(zone, 1, L)), pt(edgeOf(link.b, -1) + 16, L, RISE)];
            Object.assign(link, { at: pt(mid, L), runs: link.cut ? [[...pts.slice(0, 3), pt(mid - 9, L)], [pt(mid + 9, L), ...pts.slice(3)]] : [pts],
              caps: link.cut ? [-9, 9].map((a) => [pt(mid + a, L - 8), pt(mid + a, L + 8)]) : [] });
          }
          // Where each sign and name could go. A sign stands on a post at its checkpoint: above the platforms on a wide floor,
          // beside the lane in the gap on a tall one. A name sits on its connection or just off it.
          const outline = [...view3.floor, ...zones.flatMap((z) => [[z.x0, z.z0], [z.x1, z.z0], [z.x1, z.z1], [z.x0, z.z1]].map(([x, y]) => ({ x, z: y, e: RISE })))].map(P0);
          const backL = P0({ x: -mx, z: -mz, e: RISE + 6 }), backR = P0({ x: mx, z: -mz, e: RISE + 6 }), backY = (x) => backL.y + ((x - backL.x) * (backR.y - backL.y)) / (backR.x - backL.x || 1);
          for (const t of tags) {
            t.el.hidden = false;   // a label held back in the last layout is measured afresh
            Object.assign(t, { w: t.el.offsetWidth, h: t.el.offsetHeight });
            const gate = t.way?.gate, link = links.find((l) => l.tag === t), { w, h } = t, f = gate && P0(gate.feet[0]);
            if (gate && !tall) t.cands = [0, 1].flatMap((up) => [0, -(w / 2 + 6), w / 2 + 6].map((dx) => ({ foot: gate.feet[0], dx, dy: Math.min(backY(f.x + dx - w / 2), backY(f.x + dx + w / 2)) - up * (h + 4) - h / 2 - f.y })));
            else if (gate) t.cands = [0, 1, 2].flatMap((k) => [1, -1].map((side) => ({ foot: gate.feet[side > 0 ? 1 : 0], dx: side * (w / 2 + 8 + k * (w / 2 + 8)), dy: P0(gate.mid).y - RISE / 2 - f.y })));
            else {
              const lift = [h / 2 + 8, -h / 2 - 8].map((dy) => ({ foot: link.at, dx: 0, dy })), aside = [w / 2 + 14, -w / 2 - 14].map((dx) => ({ foot: link.at, dx, dy: 0 }));
              t.cands = tall ? [...aside, ...lift] : link.cut ? lift : [{ foot: link.at, dx: 0, dy: 0 }, ...lift];
            }
          }
          const ends = tags.map((t) => ({ y: P0(t.cands[0].foot).y + t.cands[0].dy, h: t.h })), xs = outline.map((p) => p.x);
          const top = Math.min(...outline.map((p) => p.y), ...ends.map((e) => e.y - e.h / 2)), bottom = Math.max(...outline.map((p) => p.y), ...ends.map((e) => e.y + e.h / 2));
          const cx = PAD + (room - (Math.max(...xs) - Math.min(...xs))) / 2 - Math.min(...xs);
          // The turn buttons sit in the bottom corner, under whatever part of the floor reaches that far right.
          const toolsX = size.width - PAD - toolsW - 4 - cx, fl = view3.floor.map(P0), low = fl.filter((p) => p.x >= toolsX).map((p) => p.y);
          fl.forEach((p, i) => { const q = fl[(i + 1) % 4]; if ((p.x - toolsX) * (q.x - toolsX) < 0) low.push(p.y + ((toolsX - p.x) * (q.y - p.y)) / (q.x - p.x)); });
          return { top, cx, least: Math.ceil(barH + 2 * PAD + Math.max(bottom, Math.max(...low, -Infinity) + 6 + toolsH) - top) };
        }

        // Each sign, then each name, goes to its first free place in the starting view.
        const far = 1e4, at0 = (p) => ({ x: view3.cx + P0(p).x, y: view3.cy + P0(p).y }), spot = (t, one) => box(at0(one.foot).x + one.dx, at0(one.foot).y + one.dy, t.w, t.h);
        placed.push({ x0: -far, y0: -far, x1: 2, y1: far }, { x0: size.width - 2, y0: -far, x1: far, y1: far }, { x0: -far, y0: -far, x1: far, y1: barH },
          { x0: -far, y0: height - 2, x1: far, y1: far }, { x0: size.width - PAD - toolsW, y0: height - PAD - toolsH, x1: far, y1: far }, ...zones.flatMap((z) => z.items.map((it) => box(at0(it).x, at0(it).y, it.w, it.h))));
        for (const t of [...tags.filter((one) => one.kind === 'sign'), ...tags.filter((one) => one.kind === 'note')]) {
          if (t.way?.twin) { Object.assign(t, { foot: t.way.twin.gate.tag.foot, dx: t.way.twin.gate.tag.dx, dy: t.way.twin.gate.tag.dy }); continue; }
          const best = t.cands.reduce((a, b) => (covered(spot(t, b), placed) < covered(spot(t, a), placed) ? b : a));
          Object.assign(t, best, { crowded: covered(spot(t, best), placed) > 0 && t.kind === 'note' });
          if (!t.crowded) placed.push(spot(t, best));
        }
        draw();
      }

      /** Redraw everything for the present turn of the floor. */
      function draw() {
        const yaw = start + off, c = Math.cos(yaw), n = Math.sin(yaw), { cx, cy, s, wide, high, bar } = view3;
        const P = (p) => ({ x: cx + p.x * c + p.z * n, y: cy + (p.z * c - p.x * n) * s - p.e, near: p.z * c - p.x * n });
        const hold = (v, lo, hi) => Math.max(lo, Math.min(hi, v)), points = (pts) => pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
        /** A box standing on the floor over the rectangle between corners a and b: its top, and the sides that face the viewer. */
        const prism = (a, b, e) => {
          const top = [[a.x, a.z], [b.x, a.z], [b.x, b.z], [a.x, b.z]].map(([x, z]) => P({ x, z, e })), mid = P({ x: (a.x + b.x) / 2, z: (a.z + b.z) / 2, e: 0 });
          return { top, near: mid.near, sides: top.map((p, k) => [p, top[(k + 1) % 4]]).filter(([p, q]) => p.near + q.near > 2 * mid.near)
            .map(([p, q]) => `${line([p, q, { x: q.x, y: q.y + e }, { x: p.x, y: p.y + e }])}Z`).join('') };
        };
        floor.setAttribute('points', points(view3.floor.map(P)));
        for (const zone of zones) {
          const solid = prism({ x: zone.x0, z: zone.z0 }, { x: zone.x1, z: zone.z1 }, RISE);
          zone.near = solid.near, zone.top.setAttribute('points', points(solid.top)), zone.top.toggleAttribute('data-on', zone.id === selected);
          zone.side.setAttribute('d', solid.sides);   // the edges that face the viewer show the height of the platform
          for (const it of zone.items) {
            // A label that would leave the picture, or go under the step buttons, is held at the edge, so every label stays in reach.
            const p = P(it), left = hold(p.x - it.w / 2, 2, wide - it.w - 2), top = hold(p.y - it.h / 2, bar, high - it.h - 2);
            it.box = { x: left + it.w / 2, y: top + it.h / 2, w: it.w, h: it.h };
            move(it.el, left, top), it.el.style.zIndex = String(Math.round(3000 + p.near));   // nearer labels cover farther ones
          }
        }
        [...zones].sort((a, b) => a.near - b.near).forEach((zone) => ground.append(zone.group));   // farther platforms first
        for (const link of links) {
          const runs = link.runs.map((one) => line(one.map(P))).join(''), mid = P(link.at);
          link.band.setAttribute('d', runs), link.wire.setAttribute('d', runs);
          link.snap.setAttribute('d', link.cut ? `${link.caps.map((cap) => line(cap.map(P))).join('')}M${(mid.x - 5).toFixed(1)},${(mid.y - 5).toFixed(1)}l10,10m0,-10l-10,10` : '');
        }
        // Steps that share a checkpoint show the one at hand: the present step, else the latest one passed, else the next.
        const shown = new Map();
        for (const way of ways.filter((w) => w.gate)) if (!shown.has(way.key) || way.k <= Math.max(at, 1)) shown.set(way.key, way);
        for (const way of ways) {
          if (way.gate) {
            const solids = shown.get(way.key) !== way ? [] : way.gate.blocks.map(([a, b]) => prism({ x: Math.min(a.x, b.x), z: Math.min(a.z, b.z) }, { x: Math.max(a.x, b.x), z: Math.max(a.z, b.z) }, WALL));
            way.gate.top.setAttribute('d', solids.map((one) => `${line(one.top)}Z`).join('')), way.gate.face.setAttribute('d', solids.map((one) => one.sides).join(''));
            way.gate.tag.el.toggleAttribute('data-on', way.k === at);
          }
          // The route starts and ends at the edge of the label it leaves from and the one it arrives at.
          const rest = way.rest.length ? trim(way.B.box, way.rest.map(P).reverse()).reverse() : null, from = trim(way.A.box, way.go.map(P));
          const pts = way.track = rest ? from : trim(way.B.box, from.reverse()).reverse();
          way.line.setAttribute('d', line(pts)), way.tail.setAttribute('d', rest ? line(rest) : '');
          way.line.toggleAttribute('data-on', way.k === at), way.line.toggleAttribute('data-done', way.k < at), way.head.toggleAttribute('data-on', way.k === at);
          // An arrowhead shows which way the step goes.
          const tip = pts[pts.length - 1], prev = [...pts].reverse().find((p) => Math.hypot(p.x - tip.x, p.y - tip.y) >= 1) ?? tip;
          const span = Math.hypot(tip.x - prev.x, tip.y - prev.y) || 1, ux = (tip.x - prev.x) / span, uy = (tip.y - prev.y) / span;
          way.head.setAttribute('d', length(pts) < 12 ? '' : line([{ x: tip.x - 7 * ux + 4 * uy, y: tip.y - 7 * uy - 4 * ux }, tip, { x: tip.x - 7 * ux - 4 * uy, y: tip.y - 7 * uy + 4 * ux }]));
        }
        for (const t of tags) {
          // A name with no free place to go is held back until one of the areas it joins is selected.
          t.el.hidden = (t.crowded && !t.ends.includes(selected)) || (t.way && shown.get(t.way.key) !== t.way), t.el.toggleAttribute('data-bd-label', !t.el.hidden);
          const f = P(t.foot), left = hold(f.x + t.dx - t.w / 2, 2, wide - t.w - 2), top = hold(f.y + t.dy - t.h / 2, bar, high - t.h - 2);
          move(t.el, left, top), t.line.setAttribute('d', t.el.hidden ? '' : line([f, { x: hold(f.x, left, left + t.w), y: hold(f.y, top, top + t.h) }]));
        }
        stand();
      }
      const stand = () => { const p = along(ways[mark.k - 1].track, mark.t); move(marker, p.x, p.y); };   // the marker, where it is along its route

      /** Go to a step (0 is the start, before the first step), travelling there when asked and motion is allowed. */
      function goTo(k, travel = false, quiet = false) {
        at = Math.max(0, Math.min(last, k)), selected = null;
        for (const made of buttons.values()) made.setAttribute('aria-pressed', 'false');
        count.textContent = at ? `Step ${at} of ${last}` : last === 1 ? '1 step' : `${last} steps`;
        back.toggleAttribute('disabled', at === 0), next.toggleAttribute('disabled', at === last);
        const step = steps[at - 1], gate = at ? ways[at - 1].gate : null, glides = travel && at > 0 && !reduced();
        if (!quiet) context.showDetail(step ? { label: step.label, detail: step.detail } : null), context.announce(step ? `Step ${at} of ${last}: ${step.label}. ${gate ? SAY[gate.state] : ''}`.trim() : 'Back at the start of the path.');
        cancelAnimationFrame(run), Object.assign(mark, at ? { k: at, t: glides ? 0 : 1 } : { k: 1, t: 0 }), draw();
        if (!glides) return 0;
        const time = Math.min(1300, 450 + 2 * length(ways[at - 1].track)), began = performance.now();
        const tick = (now) => { const done = Math.min(1, (now - began) / time); mark.t = done < 0.5 ? 4 * done ** 3 : 1 - (2 - 2 * done) ** 3 / 2; stand(); if (done < 1) run = requestAnimationFrame(tick); };
        run = requestAnimationFrame(tick);   // eased in and out, so the marker sets off and arrives gently
        return time;
      }
      /** Show the play button as it is now. */
      function paintPlay() {
        play.replaceChildren(...(playing ? [icon('M5.5 3.5v9M10.5 3.5v9'), 'Pause'] : [icon('M4.5 2.5v11l9-5.5z', true), 'Play', el('span', { class: 'bdb-bnd-more' }, ' the path')]));
        play.setAttribute('aria-label', playing ? 'Pause the path' : 'Play the path');
      }
      function halt() { clearTimeout(timer); if (playing) playing = false, paintPlay(); }
      /** Step through the whole path with a pause at every step; from the end it starts again. */
      function player() {
        playing = true, paintPlay();
        const beat = () => (at >= last ? halt() : (timer = setTimeout(beat, goTo(at + 1, true) + 1500)));
        if (at >= last) { goTo(0); timer = setTimeout(beat, 700); } else beat();
      }
      /** Select an area or a part, or clear the selection when the same one is chosen again. */
      function select(id) {
        halt(), selected = selected === id ? null : id;
        for (const [key, made] of buttons) made.setAttribute('aria-pressed', String(key === selected));
        const part = [...data.zones, ...(data.parts ?? [])].find((p) => p.id === selected);
        context.showDetail(part ? { label: part.label, detail: part.detail } : null);
        draw();
      }
      /** Turn the floor at once, never more than a little either way. */
      function turn(angle, gliding = false) {
        off = Math.max(-LIMIT, Math.min(LIMIT, angle));
        if (!gliding) cancelAnimationFrame(frame), aim = off;
        draw();
      }
      /** Turn the floor in a short glide that then stops, or at once for a viewer who asked for less motion. */
      function glide(angle) {
        if (reduced()) return turn(angle);
        cancelAnimationFrame(frame);
        const from = off, began = performance.now();
        aim = Math.max(-LIMIT, Math.min(LIMIT, angle));
        const step = (now) => { const done = Math.min(1, (now - began) / 180); turn(from + (aim - from) * (1 - (1 - done) ** 3), true); if (done < 1) frame = requestAnimationFrame(step); };
        frame = requestAnimationFrame(step);
      }
      // Dragging sideways turns the floor. Up and down is left to the page, so a phone can still scroll.
      view.addEventListener('pointerdown', (event) => { if (event.button === 0) drag = { id: event.pointerId, x: event.clientX, y: event.clientY, from: off, moved: false }; });
      view.addEventListener('pointermove', (event) => {
        if (!drag || event.pointerId !== drag.id) return;
        const dx = event.clientX - drag.x, slack = event.pointerType === 'touch' ? Math.max(6, Math.abs(event.clientY - drag.y)) : 4;
        if (drag.moved) return turn(drag.from + dx * 0.01);
        if (Math.abs(dx) < slack) return;
        // The drag takes over from here: a glide stops, and the floor turns from where it now is.
        turn(off), Object.assign(drag, { x: event.clientX, from: off, moved: true }), view.setPointerCapture(event.pointerId);
        root.dataset.turning = '';
      });
      const drop = (event) => { if (drag && event.pointerId === drag.id) dropped = drag.moved ? event.timeStamp : dropped, drag = null, delete root.dataset.turning; };
      view.addEventListener('pointerup', drop), view.addEventListener('pointercancel', drop);
      // The click that ends a drag must not select whatever is under the pointer.
      view.addEventListener('click', (event) => { if (event.timeStamp - dropped < 80) event.stopPropagation(); }, true);
      tools.addEventListener('keydown', (event) => { const way = { ArrowLeft: -1, ArrowRight: 1 }[event.key]; if (way) event.preventDefault(), glide(aim + way * STEP); });

      element.append(root), paintPlay(), fit(), goTo(0, false, true);
      return { resize: fit, destroy: () => { cancelAnimationFrame(frame); cancelAnimationFrame(run); clearTimeout(timer); } };
    },
  });
})();
