import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

/** X ako vlastný kurzor (Motion useMotionValue + useSpring). Načítava ho Cursor.tsx lazy, len na desktope
 *  s hoverom a jemným ukazovateľom (≥ 1024 px) a bez prefers-reduced-motion — mobil nenesie Motion v bundli.
 *  Nad prvkom s data-cursor="vstup" sa zmení na štítok VSTÚP (iná hodnota = jej text uppercase).
 *  Pridáva html.has-cursor (global.css skryje systémový kurzor). */
const LABELS: Record<string, string> = { vstup: 'VSTÚP' };

export default function CursorX() {
  const [active, setActive] = useState(false);
  const [visible, setVisible] = useState(false);
  const [down, setDown] = useState(false);
  const [label, setLabel] = useState<string | null>(null);

  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const sx = useSpring(x, { stiffness: 1200, damping: 70, mass: 0.3 });
  const sy = useSpring(y, { stiffness: 1200, damping: 70, mass: 0.3 });

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 1024px)');
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setActive(mq.matches && !rm.matches);
    update();
    mq.addEventListener('change', update);
    rm.addEventListener('change', update);
    return () => {
      mq.removeEventListener('change', update);
      rm.removeEventListener('change', update);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (!active) {
      root.classList.remove('has-cursor');
      return;
    }
    root.classList.add('has-cursor');
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
      const target = e.target instanceof Element ? e.target.closest<HTMLElement>('[data-cursor]') : null;
      const v = target?.dataset.cursor ?? null;
      setLabel(v ? (LABELS[v] ?? v.toUpperCase()) : null);
    };
    const leave = () => setVisible(false);
    const pdown = () => setDown(true);
    const pup = () => setDown(false);
    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('mouseleave', leave);
    window.addEventListener('pointerdown', pdown);
    window.addEventListener('pointerup', pup);
    window.addEventListener('blur', pup);
    return () => {
      window.removeEventListener('pointermove', move);
      document.removeEventListener('mouseleave', leave);
      window.removeEventListener('pointerdown', pdown);
      window.removeEventListener('pointerup', pup);
      window.removeEventListener('blur', pup);
      root.classList.remove('has-cursor');
    };
  }, [active, x, y]);

  if (!active) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[9999] will-change-transform"
      style={{ x: sx, y: sy, opacity: visible ? 1 : 0 }}
    >
      <motion.div
        className="-translate-x-1/2 -translate-y-1/2"
        animate={{ scale: down ? 0.82 : 1, rotate: label ? -6 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        {label ? (
          <span className="block rounded-lg border-3 border-ink bg-hot px-3 py-1.5 font-display text-lg font-extrabold uppercase tracking-wide text-ink shadow-brutal-sm">
            {label}
          </span>
        ) : (
          <img src="/brand/x.svg" alt="" width={36} height={36} className="h-9 w-9" draggable={false} />
        )}
      </motion.div>
    </motion.div>
  );
}
