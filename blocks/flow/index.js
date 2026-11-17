// @ts-check
/**
 * Flow diagram: boxes joined by arrows. The author lists parts and connections; every position
 * is worked out here. The steps are the usual ones for drawing a layered graph:
 *   1. turn any loop back on itself so the parts can be put in ranks,
 *   2. give each part a rank (how many arrows lead to it at most),
 *   3. order each rank so that arrows cross as little as possible,
 *   4. draw left to right or top to bottom, whichever fits the room best.
 */
(() => {
Breakdown.css('flow', `
.bdb-flow { position: relative; width: 100%; overflow: hidden; }
.bdb-flow-sheet { position: absolute; top: 0; left: 0; font-size: 14px; transform-origin: 0 0; }
.bdb-flow-lines { position: absolute; top: 0; left: 0; overflow: visible; pointer-events: none; }
.bdb-flow-line { fill: none; stroke: var(--bd-ink-soft); stroke-width: 1.75; }
.bdb-flow-tip { fill: var(--bd-ink-soft); }
.bdb-flow-line[data-on] { stroke: var(--bd-accent); stroke-width: 2.75; }
.bdb-flow-tip[data-on] { fill: var(--bd-accent); }
.bdb-flow-part { position: absolute; display: grid; place-items: center; padding: 3px 8px; font: inherit; font-weight: 600;
  line-height: 1.2; color: var(--bd-ink); text-align: center; overflow-wrap: anywhere; cursor: pointer;
  background: var(--bd-surface); border: 1.5px solid var(--bd-line); border-radius: 0.5rem; }
.bdb-flow-part[aria-pressed="true"] { background: var(--bd-raised); border-color: var(--bd-accent); box-shadow: 0 0 0 2px var(--bd-accent); }
.bdb-flow-tag { position: absolute; padding: 1px 7px; font-size: 11.5px; font-weight: 600; line-height: 18px; color: var(--bd-ink-soft);
  white-space: nowrap; pointer-events: none; background: var(--bd-stage); border-radius: 999px; translate: -50% -50%; }
`);

const FLOW_PAD = 12;
const FLOW_TAG_FONT = '600 11.5px system-ui, sans-serif';

/**
 * Ranks and order, from the data alone. Returns ranks (lists of slots; a slot is a part or a
 * waypoint that a long arrow passes through) and the arrows with the slots they visit.
 * @param {any} data
 */
function flowArrange(data) {
  /** @type {string[]} */
  const ids = data.parts.map((/** @type {any} */ p) => p.id);
  const seen = new Set();
  /** @type {any[]} */
  const arrows = [];
  for (const c of data.connections) {
    const key = `${c.from}>${c.to}`;
    if (c.from === c.to || seen.has(key)) continue;
    seen.add(key);
    arrows.push({ from: c.from, to: c.to, label: c.label ?? '', a: c.from, b: c.to, back: false, visits: [] });
  }
  // 1. An arrow that closes a loop is laid out the other way round and drawn with its tip at the start.
  const state = new Map();
  const walk = (/** @type {string} */ id) => {
    state.set(id, 'open');
    for (const arrow of arrows.filter((x) => x.from === id)) {
      if (state.get(arrow.to) === 'open') Object.assign(arrow, { a: arrow.to, b: arrow.from, back: true });
      else if (!state.has(arrow.to)) walk(arrow.to);
    }
    state.set(id, 'done');
  };
  ids.forEach((id) => state.has(id) || walk(id));
  // 2. Rank: one more than the highest rank that leads here. Starting parts then move up beside what they feed.
  const rank = new Map(ids.map((id) => [id, 0]));
  for (let pass = 0; pass < ids.length; pass += 1) {
    for (const arrow of arrows) rank.set(arrow.b, Math.max(rank.get(arrow.b) ?? 0, (rank.get(arrow.a) ?? 0) + 1));
  }
  for (const id of ids) {
    const feeds = arrows.filter((x) => x.a === id);
    if (feeds.length && !arrows.some((x) => x.b === id)) rank.set(id, Math.min(...feeds.map((x) => rank.get(x.b) ?? 1)) - 1);
  }
  /** @type {{ id: string, part: boolean }[][]} */
  const ranks = Array.from({ length: Math.max(...rank.values()) + 1 }, () => []);
  ids.forEach((id) => ranks[rank.get(id) ?? 0].push({ id, part: true }));
  for (const arrow of arrows) {
    arrow.visits = [arrow.a];
    for (let r = (rank.get(arrow.a) ?? 0) + 1; r < (rank.get(arrow.b) ?? 0); r += 1) {
      const waypoint = { id: `${arrow.a}>${arrow.b}@${r}`, part: false };
      ranks[r].push(waypoint);
      arrow.visits.push(waypoint.id);
    }
    arrow.visits.push(arrow.b);
    arrow.rank = rank.get(arrow.a) ?? 0;
  }
  // 3. Order: sweep down and up, putting each slot at the average place of the slots it joins.
  const place = new Map();
  ranks.forEach((slots) => slots.forEach((slot, i) => place.set(slot.id, i)));
  const hops = arrows.flatMap((x) => x.visits.slice(1).map((/** @type {string} */ id, /** @type {number} */ i) => [x.visits[i], id]));
  for (let sweep = 0; sweep < 4; sweep += 1) {
    const down = sweep % 2 === 0;
    for (const slots of down ? ranks.slice(1) : ranks.slice(0, -1).reverse()) {
      const score = new Map(slots.map((slot) => {
        const near = hops.filter((h) => h[down ? 1 : 0] === slot.id).map((h) => place.get(h[down ? 0 : 1]));
        return [slot.id, near.length ? near.reduce((sum, v) => sum + v, 0) / near.length : place.get(slot.id)];
      }));
      slots.sort((x, y) => score.get(x.id) - score.get(y.id));
      slots.forEach((slot, i) => place.set(slot.id, i));
    }
  }
  return { ranks, arrows };
}

/**
 * Positions for one direction and one available width. All sizes are in sheet pixels.
 * @param {ReturnType<typeof flowArrange>} graph
 * @param {'right' | 'down'} way
 * @param {number} room
 * @param {(text: string) => number} measure
 */
function flowPlace(graph, way, room, measure) {
  const { ranks, arrows } = graph;
  const most = Math.max(...ranks.map((slots) => slots.length));
  const across = way === 'right';
  // The space between two ranks holds the labels of the arrows that start there.
  const gaps = ranks.slice(0, -1).map((_, r) => {
    const tags = arrows.filter((x) => x.label && x.rank === r).map((x) => measure(x.label) + 16);
    if (across) return Math.max(36, ...tags.map((w) => w + 20));
    return tags.length ? 46 + 22 * Math.min(3, tags.length - 1) : 38;
  });
  const gapSum = gaps.reduce((sum, g) => sum + g, 0);
  const clamp = (/** @type {number} */ v, /** @type {number} */ lo, /** @type {number} */ hi) => Math.max(lo, Math.min(hi, v));
  const wide = across ? clamp((room - gapSum) / ranks.length, 92, 148) : clamp((room - (most - 1) * 14) / most, 92, 168);
  const high = across ? 48 : 44;
  const along = across ? wide : high;          // a part's size in the direction of flow
  const cross = across ? high : wide;          // and across it
  const lane = (/** @type {{ part: boolean }} */ slot) => (slot.part ? cross : 12);
  const extent = (/** @type {{ part: boolean }[]} */ slots) => slots.reduce((sum, s) => sum + lane(s), 0) + (slots.length - 1) * 14;
  const widest = Math.max(...ranks.map(extent));
  /** @type {Map<string, { x: number, y: number, w: number, h: number, part: boolean }>} */
  const boxes = new Map();
  let start = 0;
  ranks.forEach((slots, r) => {
    let offset = (widest - extent(slots)) / 2;
    for (const slot of slots) {
      boxes.set(slot.id, across
        ? { x: start, y: offset, w: along, h: lane(slot), part: slot.part }
        : { x: offset, y: start, w: lane(slot), h: along, part: slot.part });
      offset += lane(slot) + 14;
    }
    start += along + (gaps[r] ?? 0);
  });
  const length = start;
  return { way, boxes, W: across ? length : widest, H: across ? widest : length };
}

/** A point on a cubic curve. @param {number[][]} c @param {number} t */
function flowPoint(c, t) {
  const u = 1 - t;
  return [0, 1].map((k) => u * u * u * c[0][k] + 3 * u * u * t * c[1][k] + 3 * u * t * t * c[2][k] + t * t * t * c[3][k]);
}

Breakdown.registerBlock({
  mount(element, data, context) {
    const { el, svg } = Breakdown;
    const graph = flowArrange(data);
    const pen = /** @type {CanvasRenderingContext2D} */ (document.createElement('canvas').getContext('2d'));
    pen.font = FLOW_TAG_FONT;
    const measure = (/** @type {string} */ text) => pen.measureText(text).width;
    /** @type {string | null} */
    let selected = null;
    const sheet = el('div', { class: 'bdb-flow-sheet' });
    const root = el('div', { class: 'bdb-flow' }, sheet);
    element.append(root);

    /** Show the current selection on the drawing. */
    function mark() {
      for (const node of sheet.querySelectorAll('[data-bd-part]')) {
        node.setAttribute('aria-pressed', String(/** @type {HTMLElement} */ (node).dataset.bdPart === selected));
      }
      for (const node of sheet.querySelectorAll('[data-ends]')) {
        node.toggleAttribute('data-on', selected !== null && (node.getAttribute('data-ends') ?? '').split(' ').includes(selected));
      }
    }

    function select(/** @type {string} */ id) {
      selected = selected === id ? null : id;
      mark();
      const part = data.parts.find((/** @type {any} */ p) => p.id === selected);
      context.showDetail(part ? { label: part.label, detail: part.detail } : null);
    }

    /** Choose a direction and a scale for the room there is, then draw. */
    function draw(size = context.size()) {
      const room = Math.max(120, size.width - 2 * FLOW_PAD);
      const tall = Math.max(120, size.height - 2 * FLOW_PAD);
      const wish = data.direction === 'down' ? 'down' : 'right';
      const other = wish === 'right' ? 'down' : 'right';
      const tries = [wish, other].map((way) => {
        const laid = flowPlace(graph, /** @type {'right' | 'down'} */ (way), room, measure);
        return { ...laid, fit: Math.min(1, room / laid.W, tall / laid.H), byWidth: Math.min(1, room / laid.W) };
      });
      // Fit the whole picture if that keeps the text a good size; otherwise run downward and grow.
      let plan = tries.find((t) => t.fit >= 0.9);
      let scale = plan?.fit ?? 1;
      if (!plan) {
        plan = tries.find((t) => t.way === 'down') ?? tries[0];
        scale = Math.max(0.7, plan.byWidth);
      }
      const height = Math.max(size.height, plan.H * scale + 2 * FLOW_PAD);
      root.style.height = `${height}px`;
      Object.assign(sheet.style, { width: `${plan.W}px`, height: `${plan.H}px`, transform: `scale(${scale})`,
        left: `${Math.max(FLOW_PAD, (size.width - plan.W * scale) / 2)}px`, top: `${(height - plan.H * scale) / 2}px` });
      render(plan);
      mark();
    }

    /** @param {ReturnType<typeof flowPlace>} plan */
    function render(plan) {
      const across = plan.way === 'right';
      const lines = svg('svg', { class: 'bdb-flow-lines', width: plan.W, height: plan.H, 'aria-hidden': 'true' });
      sheet.replaceChildren(lines);
      for (const part of data.parts) {
        const box = plan.boxes.get(part.id);
        if (!box) continue;
        sheet.append(el('button', { type: 'button', class: 'bdb-flow-part', 'data-bd-part': part.id, 'data-bd-label': true, 'aria-pressed': 'false',
          style: `left:${box.x}px;top:${box.y}px;width:${box.w}px;height:${box.h}px`, onclick: () => select(part.id) }, part.label));
      }
      // Where an arrow touches a box: arrows sharing a side are spread along it, in the order they arrive from.
      /** @type {Map<string, any[]>} */
      const sides = new Map();
      const centre = (/** @type {string} */ id) => { const b = plan.boxes.get(id); return b ? (across ? b.y + b.h / 2 : b.x + b.w / 2) : 0; };
      for (const arrow of graph.arrows) {
        for (const [id, other, side] of [[arrow.a, arrow.visits[1], 'out'], [arrow.b, arrow.visits[arrow.visits.length - 2], 'in']]) {
          const key = `${id} ${side}`;
          sides.set(key, [...(sides.get(key) ?? []), { arrow, from: centre(other) }]);
        }
      }
      const touch = (/** @type {any} */ arrow, /** @type {string} */ id, /** @type {'in' | 'out'} */ side) => {
        const box = /** @type {any} */ (plan.boxes.get(id));
        const sharing = (sides.get(`${id} ${side}`) ?? []).sort((x, y) => x.from - y.from);
        const share = (sharing.findIndex((s) => s.arrow === arrow) + 1) / (sharing.length + 1);
        const spread = 0.2 + 0.6 * share;
        if (across) return [side === 'out' ? box.x + box.w : box.x, box.y + box.h * (box.part ? spread : 0.5)];
        return [box.x + box.w * (box.part ? spread : 0.5), side === 'out' ? box.y + box.h : box.y];
      };
      /** @type {{ x: number, y: number, w: number, h: number }[]} */
      const taken = [...plan.boxes.values()].filter((b) => b.part).map((b) => ({ x: b.x - 3, y: b.y - 3, w: b.w + 6, h: b.h + 6 }));
      for (const arrow of graph.arrows) {
        let path = '';
        /** @type {number[][]} */
        let first = [];
        let tipAt = [0, 0];
        let startAt = [0, 0];
        arrow.visits.slice(1).forEach((/** @type {string} */ id, /** @type {number} */ i) => {
          const from = touch(arrow, arrow.visits[i], 'out');
          const to = touch(arrow, id, 'in');
          const half = across ? (to[0] - from[0]) / 2 : (to[1] - from[1]) / 2;
          const curve = across ? [from, [from[0] + half, from[1]], [to[0] - half, to[1]], to] : [from, [from[0], from[1] + half], [to[0], to[1] - half], to];
          if (i === 0) { first = curve; startAt = from; path = `M${from[0]} ${from[1]}`; } else path += ` L${from[0]} ${from[1]}`;
          path += ` C${curve[1][0]} ${curve[1][1]} ${curve[2][0]} ${curve[2][1]} ${to[0]} ${to[1]}`;
          tipAt = to;
        });
        const ends = `${arrow.from} ${arrow.to}`;
        lines.append(svg('path', { class: 'bdb-flow-line', d: path, 'data-ends': ends }));
        // The tip: at the end the arrow points to, turned the way the flow runs (or against it for a loop).
        const [tx, ty] = arrow.back ? startAt : tipAt;
        const s = arrow.back ? -1 : 1;
        const tip = across ? `M${tx} ${ty} l${-9 * s} -5 v10 z` : `M${tx} ${ty} l-5 ${-9 * s} h10 z`;
        lines.append(svg('path', { class: 'bdb-flow-tip', d: tip, 'data-ends': ends }));
        if (!arrow.label) continue;
        // The label sits on the arrow's first stretch, at the first spot that is free.
        const w = measure(arrow.label) + 16;
        const spots = [0.5, 0.36, 0.64, 0.26, 0.74, 0.16, 0.84].map((t) => flowPoint(first, t));
        const clear = (/** @type {number[]} */ p) => !taken.some((b) => p[0] - w / 2 < b.x + b.w && p[0] + w / 2 > b.x && p[1] - 10 < b.y + b.h && p[1] + 10 > b.y);
        const spot = spots.find(clear) ?? spots[0];
        taken.push({ x: spot[0] - w / 2 - 2, y: spot[1] - 12, w: w + 4, h: 24 });
        sheet.append(el('span', { class: 'bdb-flow-tag', 'data-bd-label': true, style: `left:${spot[0]}px;top:${spot[1]}px` }, arrow.label));
      }
    }

    draw();
    return { resize: draw };
  },
});
})();
