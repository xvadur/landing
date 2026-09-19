// Fancy Components (MIT, (c) Daniel Petho) — https://www.fancycomponents.dev/r/svg-path-to-vertices.json
// Úprava xvadur.com v4: bez závislosti `svg-path-commander`. Gravity beží len v prehliadači a <path> už je v DOM-e,
// takže vzorkujeme natívnym SVGPathElement.getTotalLength / getPointAtLength (rovnaké súradnice — jednotky path-u).
export type Vertex = { x: number; y: number };

/** Navzorkuje <path> v DOM-e. `inElementPx=true` prevedie body cez getCTM() do px SVG prvku (viewBox + transform
 *  sa započítajú) → teleso v Gravity sedí s tým, čo je vykreslené. */
export function samplePathElement(path: SVGPathElement, sampleLength = 15, inElementPx = true): Vertex[] {
  const points: Vertex[] = [];
  let last: Vertex | null = null;
  const total = path.getTotalLength();
  const ctm = inElementPx && typeof path.getCTM === 'function' ? path.getCTM() : null;
  const svg = path.ownerSVGElement;
  const map = (p: DOMPointReadOnly): Vertex => {
    if (ctm && svg) {
      const pt = svg.createSVGPoint();
      pt.x = p.x;
      pt.y = p.y;
      const m = pt.matrixTransform(ctm);
      return { x: m.x, y: m.y };
    }
    return { x: p.x, y: p.y };
  };
  // Vzorkujeme v jednotkách dráhy; krok prepočítame tak, aby v px vychádzal približne `sampleLength`.
  const unitScale = ctm ? Math.hypot(ctm.a, ctm.b) || 1 : 1;
  const step = Math.max(0.5, sampleLength / unitScale);
  for (let length = 0; length < total; length += step) {
    const p = map(path.getPointAtLength(length));
    if (!last || p.x !== last.x || p.y !== last.y) {
      last = p;
      points.push(last);
    }
  }
  const end = map(path.getPointAtLength(total));
  if (last && (end.x !== last.x || end.y !== last.y)) points.push(end);
  return points;
}

/** Kompatibilný názov s originálom: berie `d` reťazec, vytvorí dočasný <path> v skrytom SVG a navzorkuje ho. */
export function parsePathToVertices(d: string, sampleLength = 15): Vertex[] {
  if (typeof document === 'undefined') return [];
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;visibility:hidden';
  const path = document.createElementNS(NS, 'path');
  path.setAttribute('d', d);
  svg.appendChild(path);
  document.body.appendChild(svg);
  try {
    return samplePathElement(path, sampleLength, false);
  } finally {
    svg.remove();
  }
}
