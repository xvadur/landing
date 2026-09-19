// Fancy Components (MIT, (c) Daniel Petho) — https://www.fancycomponents.dev/r/calculate-position.json
/** Pozícia telesa v Gravity: "50%" → percento kontajnera, číslo → px, nič → stred. */
export function calculatePosition(value: number | string | undefined, containerSize: number, elementSize: number): number {
  if (typeof value === 'string' && value.endsWith('%')) {
    return containerSize * (parseFloat(value) / 100);
  }
  if (typeof value === 'number') return value;
  return (containerSize - elementSize) / 2;
}
