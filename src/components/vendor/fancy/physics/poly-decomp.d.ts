/** Typy pre `poly-decomp` 0.3.0 (balík ich nemá). Používa sa len cez `Common.setDecomp` v gravity.tsx. */
declare module 'poly-decomp' {
  export type Point = [number, number];
  export type Polygon = Point[];
  export function decomp(polygon: Polygon): Polygon[];
  export function quickDecomp(polygon: Polygon): Polygon[];
  export function isSimple(polygon: Polygon): boolean;
  export function makeCCW(polygon: Polygon): boolean;
  export function removeCollinearPoints(polygon: Polygon, thresholdAngle?: number): number;
  export function removeDuplicatePoints(polygon: Polygon, precision?: number): void;
  const polyDecomp: {
    decomp: typeof decomp;
    quickDecomp: typeof quickDecomp;
    isSimple: typeof isSimple;
    makeCCW: typeof makeCCW;
    removeCollinearPoints: typeof removeCollinearPoints;
    removeDuplicatePoints: typeof removeDuplicatePoints;
  };
  export default polyDecomp;
}
