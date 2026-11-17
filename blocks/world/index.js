// @ts-check
/**
 * World: zones and the people and things in them, drawn as shaded solids in the theme's colours,
 * seen from above (2D), at an angle (2.5D), from the side, or turned in 3D through the kit's camera.
 * The author names zones, parts, connections and routes; the block lays them out (zones side by
 * side on one ground or stacked as levels, parts in a grid inside their zone). Labels sit on the
 * picture when they fit and move to a numbered key when they do not. As a scene it brings the
 * focused parts, zones and routes forward, frames them, and quiets the rest.
 */
(() => {
  const K = Breakdown.kit;
  const CELL = 1.45, LEVEL = 2, SLAB = 0.12;
  const VIEWS = [
    { id: 'iso', label: '2.5D', state: { yaw: 0.42, pitch: 0.62 }, turn: true },
    { id: 'top', label: 'Top', state: { yaw: 0, pitch: Math.PI / 2 }, turn: false },
    { id: 'front', label: 'Front', state: { yaw: 0, pitch: 0.06 }, turn: false },
    { id: 'orbit', label: '3D', state: { yaw: 0.95, pitch: 0.36 }, turn: true },
  ];
  const SCREEN = 'color-mix(in srgb, var(--bd-accent) 30%, var(--bd-video))';
  const DETAIL = 'color-mix(in srgb, var(--bd-video) 50%, transparent)';
  const TONE = { bad: 'var(--bd-bad)', good: 'var(--bd-good)', warn: 'var(--bd-warn)' };
  const tint = (/** @type {string|undefined} */ tone, /** @type {number} */ zi) => TONE[tone ?? ''] ?? `var(--bd-series-${(zi % 5) + 1})`;
  const fillOf = (/** @type {string|undefined} */ tone, /** @type {number} */ zi) =>
    `color-mix(in srgb, ${tint(tone, zi)} ${TONE[tone ?? ''] ? 64 : 42}%, var(--bd-surface))`;
  const shade = (/** @type {string} */ f, /** @type {number} */ l) => `color-mix(in srgb, ${f} ${Math.round(56 + 44 * l)}%, var(--bd-video))`;

  // Shapes, built from boxes, cylinders, balls and signs at the part's foot.
  /** @typedef {{k:string, c:number[], s?:number[], r?:number, h?:number, rings?:number, globe?:boolean, name?:string, front?:string, deco?:string}} Prim */
  const box = (c, s, o = {}) => /** @type {Prim} */ ({ k: 'box', c, s, ...o });
  const cyl = (c, r, h, rings = 0) => /** @type {Prim} */ ({ k: 'cyl', c, r, h, rings });
  const ball = (c, r, globe = false) => /** @type {Prim} */ ({ k: 'ball', c, r, globe });
  const sign = (name) => () => [box([0, 0, 0], [0.62, 0.12, 0.62]), /** @type {Prim} */ ({ k: 'glyph', c: [0, 0.12, 0], name })];
  /** @type {Record<string, () => Prim[]>} */
  const SHAPES = {
    person: () => [cyl([0, 0, 0], 0.21, 0.52), ball([0, 0.5, 0], 0.17)],
    laptop: () => [box([0, 0, 0.04], [0.84, 0.06, 0.56]), box([0, 0.06, -0.22], [0.84, 0.52, 0.05], { front: SCREEN })],
    phone: () => [box([0, 0, 0], [0.38, 0.7, 0.07], { front: SCREEN })],
    screen: () => [box([0, 0, 0], [0.16, 0.26, 0.16]), box([0, 0.26, 0], [0.94, 0.58, 0.06], { front: SCREEN })],
    tower: () => [box([0, 0, 0], [0.52, 1.02, 0.62], { deco: 'stripes' })],
    cylinder: () => [cyl([0, 0, 0], 0.37, 0.64, 2)],
    cloud: () => [ball([-0.24, 0.04, 0], 0.26), ball([0.08, 0.12, 0], 0.34), ball([0.38, 0.02, 0.04], 0.22)],
    globe: () => [ball([0, 0.02, 0], 0.42, true)],
    building: () => [box([0, 0, 0], [0.82, 1.26, 0.72], { deco: 'windows' })],
    document: () => [box([0, 0, 0], [0.54, 0.7, 0.05], { deco: 'lines' })],
    folder: () => [box([0, 0, 0], [0.72, 0.5, 0.14]), box([-0.19, 0.5, 0], [0.3, 0.08, 0.14])],
    envelope: () => [box([0, 0, 0], [0.72, 0.48, 0.06], { deco: 'flap' })],
    box: () => [box([0, 0, 0], [0.64, 0.64, 0.64])],
    card: () => [box([0, 0, 0], [0.74, 0.48, 0.05], { deco: 'stripe' })],
    chip: () => [box([0, 0, 0], [0.66, 0.14, 0.66]), box([0, 0.14, 0], [0.4, 0.035, 0.4])],
    key: sign('key'), lock: sign('lock'), shield: sign('shield'), warning: sign('warning'),
  };
  const GLYPH = {
    key: 'M14.5 3a6.5 6.5 0 0 0-6.3 8.1L2 17.3V22h4.7v-2.2h2.2v-2.2h2.2l1.8-1.8A6.5 6.5 0 1 0 14.5 3zm2.2 6.6a1.8 1.8 0 1 1 0-3.6 1.8 1.8 0 0 1 0 3.6z',
    lock: 'M7 10V7a5 5 0 0 1 10 0v3h1.5c.8 0 1.5.7 1.5 1.5v9c0 .8-.7 1.5-1.5 1.5h-13c-.8 0-1.5-.7-1.5-1.5v-9c0-.8.7-1.5 1.5-1.5H7zm2.5 0h5V7a2.5 2.5 0 0 0-5 0v3z',
    shield: 'M12 2l8 3v6c0 5-3.4 9.4-8 11-4.6-1.6-8-6-8-11V5l8-3zm-1 13.5l6-6-1.5-1.5-4.5 4.5-2-2L7.5 12l3.5 3.5z',
    warning: 'M12 2.5l10.5 18.5h-21L12 2.5zm-1.2 7v5.5h2.4V9.5h-2.4zm0 7.2v2.4h2.4v-2.4h-2.4z',
  };

  /** Faces of a box or cylinder at world position `at`: polygons with their outward normal. */
  function faces(/** @type {Prim} */ p, /** @type {number[]} */ at) {
    /** @type {{pts:number[][], n:number[], fill?:string, line?:boolean, soft?:boolean, bias:number}[]} */
    const out = [];
    const [ax, ay, az] = [at[0] + p.c[0], at[1] + p.c[1], at[2] + p.c[2]];
    if (p.k === 'box' && p.s) {
      const [w, h, d] = p.s;
      const x0 = ax - w / 2, x1 = ax + w / 2, y0 = ay, y1 = ay + h, z0 = az - d / 2, z1 = az + d / 2;
      out.push({ pts: [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], n: [0, 1, 0], bias: 0 },
        { pts: [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], n: [0, 0, 1], fill: p.front, bias: 0 },
        { pts: [[x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0]], n: [0, 0, -1], bias: 0 },
        { pts: [[x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1]], n: [1, 0, 0], bias: 0 },
        { pts: [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]], n: [-1, 0, 0], bias: 0 });
      const on = (u0, u1, v0, v1, side = false) => side
        ? [[x1 + 0.004, y0 + v0 * h, z1 - u0 * d], [x1 + 0.004, y0 + v0 * h, z1 - u1 * d], [x1 + 0.004, y0 + v1 * h, z1 - u1 * d], [x1 + 0.004, y0 + v1 * h, z1 - u0 * d]]
        : [[x0 + u0 * w, y0 + v0 * h, z1 + 0.004], [x0 + u1 * w, y0 + v0 * h, z1 + 0.004], [x0 + u1 * w, y0 + v1 * h, z1 + 0.004], [x0 + u0 * w, y0 + v1 * h, z1 + 0.004]];
      const mark = (pts, side = false, fill = DETAIL) => out.push({ pts, n: side ? [1, 0, 0] : [0, 0, 1], fill, bias: 0.01 });
      if (p.deco === 'stripes') for (const v of [0.62, 0.72, 0.82]) mark(on(0.16, 0.84, v, v + 0.045));
      if (p.deco === 'lines') for (const v of [0.74, 0.62, 0.5, 0.38, 0.26]) mark(on(0.16, v < 0.3 ? 0.6 : 0.84, v, v + 0.035));
      if (p.deco === 'stripe') mark(on(0, 1, 0.62, 0.78));
      if (p.deco === 'flap') mark([[x0, y1, z1 + 0.004], [ax, y0 + h * 0.42, z1 + 0.004], [x1, y1, z1 + 0.004]]);
      if (p.deco === 'windows') for (const side of [false, true]) for (let r = 0; r < 4; r += 1) for (let c = 0; c < 3; c += 1) {
        mark(on(0.14 + c * 0.26, 0.3 + c * 0.26, 0.14 + r * 0.2, 0.27 + r * 0.2, side), side, SCREEN);
      }
    }
    if (p.k === 'cyl' && p.r && p.h) {
      const N = 18, r = p.r, h = p.h;
      const pt = (a, y) => [ax + r * Math.cos(a), y, az + r * Math.sin(a)];
      const top = [];
      for (let i = 0; i < N; i += 1) {
        const a = (i / N) * 2 * Math.PI, b = ((i + 1) / N) * 2 * Math.PI, n = [Math.cos((a + b) / 2), 0, Math.sin((a + b) / 2)];
        out.push({ pts: [pt(a, ay), pt(b, ay), pt(b, ay + h), pt(a, ay + h)], n, bias: 0, soft: true });
        for (let k = 1; k <= (p.rings ?? 0); k += 1) out.push({ pts: [pt(a, ay + (h * k) / ((p.rings ?? 0) + 1)), pt(b, ay + (h * k) / ((p.rings ?? 0) + 1))], n, fill: DETAIL, line: true, bias: 0.01 });
        top.push(pt(a, ay + h));
      }
      out.push({ pts: top, n: [0, 1, 0], bias: 0 });
    }
    return out;
  }

  /** Zones as stacked levels or side by side (up to three in a row), parts in a grid in each. */
  function layout(data) {
    const zones = data.zones ?? [];
    const levels = data.arrange === 'levels';
    const groups = zones.map((zone, i) => ({ zone, i, parts: data.parts.filter((p) => p.zone === zone.id), rect: { x0: 0, x1: 0, z0: 0, z1: 0, y: 0 } }));
    const loose = data.parts.filter((p) => !zones.some((z) => z.id === p.zone));
    if (loose.length || !groups.length) groups.push({ zone: null, i: groups.length, parts: loose, rect: { x0: 0, x1: 0, z0: 0, z1: 0, y: 0 } });
    const grid = (n) => { const rows = n > 6 ? 3 : n > 1 ? 2 : 1; return [Math.max(1, Math.ceil(n / rows)), rows]; };
    const sizes = groups.map((g) => grid(g.parts.length));
    const maxC = Math.max(...sizes.map((s) => s[0])), maxR = Math.max(...sizes.map((s) => s[1]));
    const perRow = levels ? 1 : groups.length <= 3 ? groups.length : Math.ceil(groups.length / 2);
    const placed = /** @type {{p:any, g:any, at:number[]}[]} */ ([]), rows = [];
    groups.forEach((g, gi) => {
      const [cols, rws] = levels ? [maxC, maxR] : sizes[gi];
      const row = levels ? 0 : Math.floor(gi / perRow);
      (rows[row] ??= []).push({ g, cols, rws });
    });
    let z = 0;
    rows.forEach((row) => {
      const depth = Math.max(...row.map((c) => c.rws)) * CELL;
      const width = row.reduce((s, c) => s + c.cols * CELL, 0) + (row.length - 1) * CELL * 0.45;
      let x = -width / 2;
      row.forEach(({ g, cols, rws }) => {
        const gi = groups.indexOf(g);
        const y = levels ? (groups.length - 1 - gi) * LEVEL : 0;
        const w = cols * CELL, d = (levels ? rws * CELL : depth);
        const ox = levels ? -w / 2 : x;
        g.rect = { x0: ox, x1: ox + w, z0: z, z1: z + d, y };
        g.parts.forEach((p, i) => placed.push({ p, g, at: [ox + ((i % cols) + 0.5) * CELL, y + (g.zone ? SLAB : 0), z + (Math.floor(i / cols) + 0.5) * (d / rws)] }));
        x += w + CELL * 0.45;
      });
      if (!levels) z += depth + CELL * 0.45;
    });
    const zmid = levels ? (maxR * CELL) / 2 : (z - CELL * 0.45) / 2;
    groups.forEach((g) => { g.rect.z0 -= zmid; g.rect.z1 -= zmid; });
    placed.forEach((q) => { q.at[2] -= zmid; });
    return { groups, placed, levels };
  }

  Breakdown.css('world', `
.bdb-world { display: grid; grid-template-columns: minmax(0, 1fr); align-content: start; gap: 0.5rem; min-height: 100%; padding: 0.6rem; box-sizing: border-box; }
.bdb-world[data-side] { grid-template-columns: minmax(0, 1fr) 12.5rem; } .bdb-world[data-side] .bdb-world-bar { grid-column: 1 / -1; }
.bdb-world[data-side] .bdb-world-key { grid-template-columns: 1fr; align-content: start; max-height: var(--bdw-h); overflow-y: auto; }
.bdb-world-bar { display: flex; flex-wrap: wrap; gap: 0.4rem; align-items: center; justify-content: space-between; }
.bdb-world-routes { display: flex; flex-wrap: wrap; gap: 0.35rem; } .bdb-world-art .q { opacity: 0.28; }
.bdb-world-view { position: relative; height: var(--bdw-h, 13rem); overflow: hidden; border-radius: 0.7rem; touch-action: pan-y; cursor: grab; outline: none; }
.bdb-world-view:focus-visible { box-shadow: inset 0 0 0 2px var(--bd-focus); } .bdb-world-art { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.bdb-world-labels { position: absolute; inset: 0; pointer-events: none; }
.bdb-world-chip { position: absolute; display: inline-flex; gap: 0.35rem; align-items: center; min-height: 26px; padding: 0.15rem 0.6rem;
  font: inherit; font-size: 0.78rem; font-weight: 600; line-height: 1.2; white-space: nowrap; color: var(--bd-ink); cursor: pointer; pointer-events: auto;
  background: var(--bd-surface); border: 1px solid var(--bd-line); border-radius: 999px; box-sizing: border-box; }
.bdb-world-chip[data-zone] { font-family: var(--bd-font-mono); font-size: 0.7rem; letter-spacing: 0.04em; text-transform: uppercase; color: var(--bd-ink-soft); }
.bdb-world-chip[data-quiet] { color: var(--bd-ink-soft); background: var(--bd-stage); } .bdb-world-chip[data-focus], .bdb-world-chip[aria-pressed="true"] { border: 2px solid var(--bd-accent); background: var(--bd-accent-soft); opacity: 1; }
.bdb-world-chip i { width: 0.55rem; height: 0.55rem; border-radius: 50%; background: var(--dot, var(--bd-accent)); }
.bdb-world-tag { position: absolute; padding: 0.05rem 0.4rem; font-size: 0.7rem; color: var(--bd-ink-soft); white-space: nowrap; background: var(--bd-surface); border-radius: 0.4rem; }
.bdb-world-key { display: grid; grid-template-columns: repeat(auto-fill, minmax(9.5rem, 1fr)); gap: 0.3rem; margin: 0; padding: 0; list-style: none; }
.bdb-world-key button { display: flex; gap: 0.45rem; align-items: center; width: 100%; min-height: 2rem; padding: 0.2rem 0.5rem; font: inherit; font-size: 0.8rem;
  font-weight: 600; color: var(--bd-ink); text-align: start; cursor: pointer; background: var(--bd-surface); border: 1px solid var(--bd-line); border-radius: 0.5rem; }
.bdb-world-key b, .bdb-world-num { display: inline-grid; place-items: center; min-width: 1.35rem; height: 1.35rem; font-family: var(--bd-font-mono); font-size: 0.7rem; color: var(--bd-accent-ink); background: var(--bd-accent); border-radius: 50%; }
.bdb-world-num { position: absolute; pointer-events: auto; cursor: pointer; border: 0; padding: 0; } .bdb-world-key button[data-focus] { border: 2px solid var(--bd-accent); background: var(--bd-accent-soft); }
.bdb-world :is(button):focus-visible { outline: 2px solid var(--bd-focus); outline-offset: 2px; }
@keyframes bdb-world-pulse { 50% { opacity: 0.35; } } .bdb-world-ring { animation: bdb-world-pulse 1.6s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .bdb-world-ring { animation: none; } }
`);

  Breakdown.registerBlock({
    mount(element, data, context) {
      const E = Breakdown.el;
      const world = layout(data);
      const parts = new Map(world.placed.map((q) => [q.p.id, q]));
      const routes = data.routes ?? [];
      const ends = world.groups.flatMap((g) => [[g.rect.x0, g.rect.y, g.rect.z0], [g.rect.x1, g.rect.y + 1.2, g.rect.z1]]);
      const mid = [0, 1, 2].map((k) => (Math.min(...ends.map((e) => e[k])) + Math.max(...ends.map((e) => e[k]))) / 2);
      /** A connection is an arc through the air between two parts, sampled in 13 points. */
      const arc = (a, b) => { const lift = 0.55 + 0.12 * Math.hypot(b.at[0] - a.at[0], b.at[2] - a.at[2]);
        return Array.from({ length: 13 }, (_, i) => { const t2 = i / 12; return [0, 1, 2].map((k) => a.at[k] + (b.at[k] - a.at[k]) * t2 + (k === 1 ? 0.3 + 4 * lift * t2 * (1 - t2) : 0)); }); };
      const solids = world.placed.map((q) => ({ q, prims: (SHAPES[q.p.shape ?? 'box'] ?? SHAPES.box)(), fill: fillOf(q.p.tone, q.g.i) }));
      const proj = (/** @type {number[]} */ p, st, s, u) => K.project([p[0] - mid[0], p[1] - mid[1], p[2] - mid[2]], st, s, u);
      const tops = new Map(solids.map(({ q, prims }) => [q.p.id, Math.max(...prims.map((p) => p.c[1] + (p.s?.[1] ?? p.h ?? (p.r ?? 0) * 2) + (p.k === 'glyph' ? 0.62 : 0)))]));
      let focus = /** @type {Set<string>} */ (new Set()), picked = '', unit = 40, keyMode = false, tick = 0, width = 0, roomH = 0;

      const view = E('div', { class: 'bdb-world-view', tabindex: 0, role: 'group',
        'aria-label': 'The world. Drag to turn or move it, Ctrl and scroll or pinch to zoom; with focus here, arrow keys turn it and plus and minus zoom.' });
      const art = Breakdown.svg('svg', { class: 'bdb-world-art', 'aria-hidden': 'true' });
      const labels = E('div', { class: 'bdb-world-labels' }); view.append(art, labels);
      const key = E('ol', { class: 'bdb-world-key', hidden: true });
      const select = (/** @type {any} */ item) => { picked = item.id; context.showDetail(item); draw(); };
      const routeChips = routes.map((r) => E('button', { type: 'button', class: 'bdb-world-chip', style: 'position: static', 'data-bd-part': r.id, 'data-bd-label': true,
        'aria-pressed': 'false', onclick: () => select(r) }, E('i', { style: `--dot: ${r.tone === 'bad' ? 'var(--bd-bad)' : r.tone === 'good' ? 'var(--bd-good)' : 'var(--bd-accent)'}` }), r.label));
      const cam = K.camera(view, { views: VIEWS, start: data.view ?? 'iso', turnTo: 'orbit', onChange: () => draw(), onFit: () => { refit(); cam.moveTo({ zoom: 1, x: 0, y: 0 }, true); } });
      const root = E('div', { class: 'bdb-world' }, E('div', { class: 'bdb-world-bar' }, E('div', { class: 'bdb-world-routes' }, ...routeChips), cam.toolbar), view, key);
      element.append(root);
      /** The picture's height follows the block's width only, so a key shown under it never feeds back into its size. */
      /** Picture height: from the width, inside a fixed block area (fullscreen); redone only when the width changes. */
      const refit = (st = cam.state) => {
        width = element.clientWidth;
        setKey(false, st);
        roomH = context.size().height;
        const chrome = root.offsetHeight - view.offsetHeight, room = roomH - chrome;
        root.style.setProperty('--bdw-h', `${Math.round(Math.max(120, Math.min(460, width * 0.56, room > 0 ? room : 460)))}px`);
        fitUnit(st);
      };
      const setKey = (on, st = cam.state) => { keyMode = on; key.hidden = !on; root.toggleAttribute('data-side', on && width >= 700); fitUnit(st); };
      art.addEventListener('click', (e) => { const q = parts.get(/** @type {Element} */ (e.target).closest('[data-p]')?.getAttribute('data-p') ?? ''); if (q) select(q.p); });

      const size = () => ({ width: view.clientWidth || 320, height: view.clientHeight || 200 });
      const corners = () => world.groups.flatMap((g) => [[g.rect.x0, g.rect.y, g.rect.z0], [g.rect.x1, g.rect.y, g.rect.z1], [g.rect.x0, g.rect.y, g.rect.z1], [g.rect.x1, g.rect.y, g.rect.z0]])
        .concat(world.placed.map((q) => [q.at[0], q.at[1] + (tops.get(q.p.id) ?? 1) + 0.3, q.at[2]]));
      const bounds = (pts, st, s) => {
        const xy = pts.map((p) => proj(p, { ...st, zoom: 1, x: 0, y: 0 }, s, 1)), xs = xy.map((p) => p.x), ys = xy.map((p) => p.y);
        return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
      };
      function fitUnit(st = cam.state) {
        const s = size(), b = bounds(corners(), st, s);
        unit = Math.max(8, Math.min((s.width - 48) / Math.max(0.5, b.x1 - b.x0), (s.height - 56) / Math.max(0.5, b.y1 - b.y0)));
      }

      /** Ids that count as in focus: the focused or picked parts, the parts of focused zones and routes. */
      const lit = () => {
        const on = new Set([...focus, ...(picked ? [picked] : [])]);
        for (const r of routes) if (on.has(r.id)) r.via.forEach((v) => on.add(v));
        for (const g of world.groups) if (g.zone && on.has(g.zone.id)) g.parts.forEach((p) => on.add(p.id));
        return on;
      };

      function draw() {
        if (dead) return;
        const s = size(), st = cam.state;
        const P = (/** @type {number[]} */ p) => proj(p, st, s, unit);
        const on = lit();
        const quiet = (/** @type {string} */ id) => (on.size && !on.has(id) ? ' class="q"' : '');
        const pts = (/** @type {number[][]} */ list) => list.map((p) => { const v = P(p); return `${v.x.toFixed(1)},${v.y.toFixed(1)}`; }).join(' ');
        const items = /** @type {{lv:number, b:number, d:number, s:string}[]} */ ([]);
        const order = world.groups.map((g) => ({ g, d: P([(g.rect.x0 + g.rect.x1) / 2, g.rect.y, (g.rect.z0 + g.rect.z1) / 2]).depth }))
          .sort((a, b) => (world.levels ? a.d - b.d : 0));
        const lvOf = new Map(order.map((o, i) => [o.g, world.levels ? i : 0]));
        for (const { g } of order) {
          if (!g.zone) continue;
          const { x0, x1, z0, z1, y } = g.rect, f = `color-mix(in srgb, ${tint(undefined, g.i)} 13%, var(--bd-stage))`;
          for (const face of faces(box([(x0 + x1) / 2, 0, (z0 + z1) / 2], [x1 - x0, SLAB, z1 - z0]), [0, y, 0])) {
            if (K.facing(/** @type {[number,number,number]} */ (face.n), st) <= 0.02) continue;
            const edge = on.has(g.zone.id) ? 'var(--bd-accent)' : 'var(--bd-line)';
            items.push({ lv: lvOf.get(g) ?? 0, b: 0, d: 0, s: `<polygon points="${pts(face.pts)}" fill="${shade(f, K.light(/** @type {[number,number,number]} */ (face.n)))}" stroke="${edge}" stroke-width="${on.has(g.zone.id) ? 2 : 1}" fill-opacity="0.92"${quiet(g.zone.id)}/>` });
          }
        }
        for (const c of data.connections ?? []) {
          const a = parts.get(c.from), b = parts.get(c.to);
          if (!a || !b) continue;
          const way = arc(a, b).map(P), [pa, pb] = [way[0], way[way.length - 1]];
          const hot = on.has(c.from) && on.has(c.to);
          const colour = c.style === 'blocked' ? 'var(--bd-bad)' : hot ? 'var(--bd-accent)' : 'var(--bd-ink-soft)';
          const lv = Math.min(lvOf.get(a.g) ?? 0, lvOf.get(b.g) ?? 0);
          const dash = c.style === 'blocked' ? ' stroke-dasharray="5 5"' : c.style === 'flow' ? '' : ' stroke-dasharray="1 4"';
          let s2 = `<polyline points="${way.map((v) => `${v.x.toFixed(1)},${v.y.toFixed(1)}`).join(' ')}" fill="none" stroke="${colour}" stroke-width="${hot ? 2.6 : 1.6}" stroke-linecap="round"${dash}${on.size && !hot ? ' class="q"' : ''}/>`;
          if (c.style === 'flow') {
            const [u, v] = [way[7], way[8]], mx = v.x, my = v.y, ang = Math.atan2(v.y - u.y, v.x - u.x);
            const tip = (o) => `${(mx + 8 * Math.cos(ang + o)).toFixed(1)},${(my + 8 * Math.sin(ang + o)).toFixed(1)}`;
            s2 += `<polygon points="${mx + 4 * Math.cos(ang)},${my + 4 * Math.sin(ang)} ${tip(2.6)} ${tip(-2.6)}" fill="${colour}"${on.size && !hot ? ' class="q"' : ''}/>`;
          }
          if (c.style === 'blocked') s2 += `<g transform="translate(${way[6].x} ${way[6].y})"><circle r="8" fill="var(--bd-bad-soft)" stroke="var(--bd-bad)" stroke-width="1.5"/><path d="M-3.5 -3.5 3.5 3.5M3.5 -3.5 -3.5 3.5" stroke="var(--bd-bad)" stroke-width="1.8"/></g>`;
          items.push({ lv: a.g === b.g ? lv : lv + 0.5, b: 3.5, d: 0, s: s2 });
        }
        for (const { q, prims, fill } of solids) {
          const lv = lvOf.get(q.g) ?? 0, id = q.p.id, cls = quiet(id);
          if (on.has(id)) {
            const ring = Array.from({ length: 24 }, (_, i) => [q.at[0] + 0.62 * Math.cos((i / 24) * 2 * Math.PI), q.at[1] + 0.01, q.at[2] + 0.62 * Math.sin((i / 24) * 2 * Math.PI)]);
            items.push({ lv, b: 2, d: 0, s: `<polygon class="bdb-world-ring" points="${pts(ring)}" fill="var(--bd-accent-soft)" stroke="var(--bd-accent)" stroke-width="2"/>` });
          }
          for (const p of prims) {
            if (p.k === 'ball' && p.r) {
              const centre = P([q.at[0] + p.c[0], q.at[1] + p.c[1] + p.r, q.at[2] + p.c[2]]), r = p.r * unit * st.zoom;
              items.push({ lv, b: 3, d: centre.depth, s: `<g data-p="${id}"${cls}><circle cx="${centre.x}" cy="${centre.y}" r="${r}" fill="${shade(fill, 0.75)}" stroke="${shade(fill, 0.2)}"/>`
                + `<circle cx="${centre.x - r * 0.3}" cy="${centre.y - r * 0.32}" r="${r * 0.5}" fill="${shade(fill, 1)}" opacity="0.8"/>`
                + (p.globe ? `<ellipse cx="${centre.x}" cy="${centre.y}" rx="${r}" ry="${r * 0.3}" fill="none" stroke="${DETAIL}"/><ellipse cx="${centre.x}" cy="${centre.y}" rx="${r * 0.4}" ry="${r}" fill="none" stroke="${DETAIL}"/>` : '') + '</g>' });
            } else if (p.k === 'glyph' && p.name) {
              const g = P([q.at[0], q.at[1] + p.c[1] + 0.36, q.at[2]]), k = Math.max(0.7, (unit * st.zoom) / 34);
              items.push({ lv, b: 3, d: g.depth + 0.5, s: `<g data-p="${id}"${cls} transform="translate(${g.x - 12 * k} ${g.y - 12 * k}) scale(${k})"><path d="${GLYPH[p.name]}" fill-rule="evenodd" fill="${shade(fill, 0.25)}" stroke="var(--bd-surface)" stroke-width="1.2" paint-order="stroke"/></g>` });
            } else {
              for (const face of faces(p, q.at)) {
                const facingBy = K.facing(/** @type {[number,number,number]} */ (face.n), st);
                if (facingBy <= 0.02) continue;
                const d = face.pts.reduce((sum, v) => sum + P(v).depth, 0) / face.pts.length + face.bias;
                const paint = face.fill === DETAIL || face.fill === SCREEN ? face.fill : shade(face.fill ?? fill, K.light(/** @type {[number,number,number]} */ (face.n)));
                items.push({ lv, b: 3, d, s: face.line ? `<polyline data-p="${id}"${cls} points="${pts(face.pts)}" fill="none" stroke="${paint}" stroke-width="1.2"/>`
                  : `<polygon data-p="${id}"${cls} points="${pts(face.pts)}" fill="${paint}" stroke="${face.soft ? paint : shade(fill, 0.15)}" stroke-width="0.8" stroke-linejoin="round"/>` });
              }
            }
          }
        }
        // Routes in focus: a path over the parts it passes, and a mark that travels along it.
        const live = routes.filter((r) => focus.has(r.id) || picked === r.id);
        live.forEach((r) => {
          const way = r.via.map((v) => parts.get(v)).filter(Boolean).map((q) => P([q.at[0], q.at[1] + (tops.get(q.p.id) ?? 1) + 0.25, q.at[2]]));
          const colour = r.tone === 'bad' ? 'var(--bd-bad)' : r.tone === 'good' ? 'var(--bd-good)' : 'var(--bd-accent)';
          items.push({ lv: 99, b: 4, d: 0, s: `<polyline points="${way.map((v) => `${v.x},${v.y}`).join(' ')}" fill="none" stroke="${colour}" stroke-width="3" stroke-dasharray="7 6" stroke-linejoin="round" stroke-linecap="round"/>`
            + `<circle data-route="${r.id}" r="6" fill="${colour}" stroke="var(--bd-surface)" stroke-width="2" cx="${way[0]?.x ?? 0}" cy="${way[0]?.y ?? 0}"/>` });
          routeWays.set(r.id, way);
        });
        items.sort((a, b) => a.lv - b.lv || a.b - b.b || a.d - b.d);
        art.innerHTML = items.map((i) => i.s).join('');
        routeChips.forEach((chip, i) => { chip.setAttribute('aria-pressed', String(focus.has(routes[i].id) || picked === routes[i].id)); chip.toggleAttribute('data-focus', focus.has(routes[i].id)); });
        placeLabels(s, st, on);
        animate(live.length > 0);
      }

      const routeWays = /** @type {Map<string, {x:number,y:number}[]>} */ (new Map());
      function animate(run) {
        if (tick) cancelAnimationFrame(tick);
        tick = 0;
        if (!run || K.reducedMotion()) return;
        const loop = (now) => {
          for (const [id, way] of routeWays) {
            const dot = art.querySelector(`[data-route="${id}"]`);
            if (!dot || way.length < 2) continue;
            const t = ((now / 2600) % 1) * (way.length - 1), i = Math.floor(t), f = t - i, a = way[i], b = way[Math.min(i + 1, way.length - 1)];
            dot.setAttribute('cx', String(a.x + (b.x - a.x) * f));
            dot.setAttribute('cy', String(a.y + (b.y - a.y) * f));
          }
          tick = requestAnimationFrame(loop);
        };
        tick = requestAnimationFrame(loop);
      }

      /** Labels on the picture when they all fit apart; otherwise numbers on the picture and a key. */
      const entries = [...world.placed.map((q) => ({ item: q.p, q, zone: null })), ...world.groups.filter((g) => g.zone).map((g) => ({ item: g.zone, q: null, zone: g }))];
      const chips = entries.map((e) => E('button', { type: 'button', class: 'bdb-world-chip', 'data-zone': e.zone ? '' : null, onclick: () => select(e.item) },
        e.item.tone && TONE[e.item.tone] ? E('i', { style: `--dot: ${TONE[e.item.tone]}` }) : null, e.item.label));
      const nums = entries.map((e, i) => E('button', { type: 'button', class: 'bdb-world-num', tabindex: -1, 'aria-hidden': 'true', onclick: () => select(e.item) }, String(i + 1)));
      const keys = entries.map((e, i) => E('button', { type: 'button', onclick: () => select(e.item) }, E('b', null, String(i + 1)), e.item.label));
      key.append(...keys.map((k) => E('li', null, k)));
      const tags = (data.connections ?? []).filter((c) => c.label).map((c) => ({ c, el: E('span', { class: 'bdb-world-tag' }, c.label) }));
      labels.append(...chips, ...nums, ...tags.map((t) => t.el));
      /** Only the visible copy of a label carries the part and label marks. */
      const mark = (/** @type {HTMLElement} */ el, id, on) => {
        el.hidden = !on;
        if (on) { el.dataset.bdPart = id; el.dataset.bdLabel = ''; } else { delete el.dataset.bdPart; delete el.dataset.bdLabel; }
      };
      function placeLabels(s, st, on) {
        const P = (p) => proj(p, st, s, unit);
        const anchors = entries.map((e) => (e.q ? P([e.q.at[0], e.q.at[1] + (tops.get(e.item.id) ?? 1) + 0.12, e.q.at[2]]) : P([e.zone.rect.x0 + 0.2, e.zone.rect.y + SLAB, e.zone.rect.z1])));
        entries.forEach((e, i) => {
          const hot = on.has(e.item.id);
          chips[i].toggleAttribute('data-focus', hot);
          chips[i].toggleAttribute('data-quiet', on.size > 0 && !hot);
          keys[i].toggleAttribute('data-focus', hot);
          chips[i].hidden = false;
        });
        // Focused labels are placed first, so they keep the best spots.
        const order = entries.map((_, i) => i).sort((a, b) => Number(on.has(entries[b].item.id)) - Number(on.has(entries[a].item.id)));
        const avoid = world.placed.map((q) => { const v = [-0.42, 0.42].flatMap((dx) => [-0.42, 0.42].flatMap((dz) => [0, (tops.get(q.p.id) ?? 1)].map((dy) => P([q.at[0] + dx, q.at[1] + dy, q.at[2] + dz]))));
          const xs = v.map((o) => o.x), ys = v.map((o) => o.y), w = Math.max(...xs) - Math.min(...xs), h = Math.max(...ys) - Math.min(...ys);
          return { x: Math.min(...xs) + w * 0.22, y: Math.min(...ys) + h * 0.22, w: w * 0.56, h: h * 0.56 }; });
        const fit = K.placeLabels(order.map((i) => ({ x: anchors[i].x, y: anchors[i].y, w: chips[i].offsetWidth || 80, h: chips[i].offsetHeight || 26, gap: entries[i].zone ? 4 : 6 })), s, avoid);
        // Labels that no longer fit apart (after a turn or a zoom) give way to the key until the next fit.
        if (!fit.ok && !keyMode) { setKey(true); requestAnimationFrame(() => draw()); }
        entries.forEach((e, i) => {
          mark(chips[i], e.item.id, !keyMode);
          mark(keys[i], e.item.id, keyMode);
          nums[i].hidden = !keyMode;
          nums[i].style.left = `${Math.min(s.width - 24, Math.max(2, anchors[i].x - 11))}px`;
          nums[i].style.top = `${Math.min(s.height - 24, Math.max(2, anchors[i].y - 22))}px`;
        });
        key.hidden = !keyMode;
        const placed = order.map((i, k) => ({ x: fit.at[k].x, y: fit.at[k].y, w: chips[i].offsetWidth, h: chips[i].offsetHeight }));
        order.forEach((i, k) => { chips[i].style.left = `${fit.at[k].x}px`; chips[i].style.top = `${fit.at[k].y}px`; });
        for (const { c, el } of tags) {
          const a = parts.get(c.from), b = parts.get(c.to);
          el.hidden = true;
          if (keyMode || !a || !b) continue;
          el.hidden = false;
          const m = P(arc(a, b)[6]);
          const r = { x: m.x - el.offsetWidth / 2, y: m.y - el.offsetHeight / 2, w: el.offsetWidth, h: el.offsetHeight };
          const clash = placed.some((o) => r.x < o.x + o.w + 2 && o.x < r.x + r.w + 2 && r.y < o.y + o.h + 2 && o.y < r.y + r.h + 2)
            || r.x < 0 || r.y < 0 || r.x + r.w > s.width || r.y + r.h > s.height;
          if (clash) el.hidden = true; else { el.style.left = `${r.x}px`; el.style.top = `${r.y}px`; placed.push(r); }
        }
      }

      // The view the chapters asked for last: a chapter without a view keeps it, whatever the viewer turned to.
      let chapterView = VIEWS.some((v) => v.id === data.view) ? data.view : 'iso', dead = false;
      refit();
      draw();
      return {
        // A scene's room does not grow with the block, so a change in its height can be followed too.
        resize() { if (Math.abs(element.clientWidth - width) > 1 || (context.place === 'scene' && Math.abs(context.size().height - roomH) > 1)) { refit(); draw(); } },
        /** Light the chapter's parts and show its view with the whole world in sight; the focus is drawn, not zoomed. */
        focus({ ids, view: next }) {
          focus = new Set(ids);
          picked = '';
          if (next) chapterView = next;
          refit({ ...cam.state, ...(VIEWS.find((v) => v.id === chapterView)?.state ?? {}), zoom: 1, x: 0, y: 0 });
          cam.view(chapterView, true);
          draw();
        },
        detailClosed() { picked = ''; draw(); },
        destroy() { dead = true; if (tick) cancelAnimationFrame(tick); cam.destroy(); },
      };
    },
  });
})();
