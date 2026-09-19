// Fancy Components (MIT, (c) Daniel Petho) — https://www.fancycomponents.dev/r/gravity.json
// Úpravy xvadur.com v4 (ostrov `client:only="react"` — matter-js siaha na window):
//  - bez `lodash` (vlastný debounce), bez `svg-path-commander` (natívne vzorkovanie <path> v DOM-e),
//    `poly-decomp` je voliteľný cez prop `decomp` (len konkávne `bodyType="svg"`, napr. X);
//  - bez matter Render mimo `debug` (žiadny canvas navyše; myš počúva priamo kontajner);
//  - dotyk: touchstart preberá len keď je pod prstom teleso, touchmove len počas ťahania → stránka sa dá skrolovať
//    cez sekciu; koliesko myši sa neblokuje (originál volal preventDefault na wheel);
//  - `startOnView` (engine beží len keď je sekcia vo viewporte), reduced motion → svet sa dopočíta naraz a stojí
//    (nálepky ležia na dne, nič sa nehýbe, ťahanie vypnuté);
//  - MatterBody prijíma ľubovoľné deti (nálepky `sticker`, tlačidlá, SVG) — rozmery berie z DOM-u po mount-e.
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import Matter, { Bodies, Body, Common, Engine, Events, Mouse, MouseConstraint, Query, Render, Runner, World } from 'matter-js';

import { cn } from '@/lib/utils';
import { calculatePosition } from '../utils/calculate-position';
import { samplePathElement } from '../utils/svg-path-to-vertices';
import { prefersReducedMotion } from '../hooks/use-media';

export interface GravityProps {
  children: ReactNode;
  /** vykresliť matter Render canvas s drôtenými telesami */
  debug?: boolean;
  gravity?: { x: number; y: number };
  /** po zmene šírky okna postaviť svet nanovo */
  resetOnResize?: boolean;
  grabCursor?: boolean;
  addTopWall?: boolean;
  /** spustiť automaticky (pri `startOnView` až vo viewporte) */
  autoStart?: boolean;
  startOnView?: boolean;
  /** modul `poly-decomp` (import decomp from 'poly-decomp') — len pre konkávne SVG telesá */
  decomp?: unknown;
  className?: string;
}

type PhysicsBody = { element: HTMLElement; body: Matter.Body; props: MatterBodyProps };

export interface MatterBodyProps {
  children: ReactNode;
  matterBodyOptions?: Matter.IBodyDefinition;
  /** dá sa chytiť a hodiť (myš aj dotyk) */
  isDraggable?: boolean;
  bodyType?: 'rectangle' | 'circle' | 'svg';
  /** krok vzorkovania SVG dráhy v px */
  sampleLength?: number;
  /** "50%" alebo px; nič = stred */
  x?: number | string;
  y?: number | string;
  /** stupne */
  angle?: number;
  className?: string;
}

export type GravityRef = { start: () => void; stop: () => void; reset: () => void };

const GravityContext = createContext<{
  registerElement: (id: string, element: HTMLElement, props: MatterBodyProps) => void;
  unregisterElement: (id: string) => void;
} | null>(null);

/** @types/matter-js nepozná handlery na Mouse; matter ich má (mousedown/mousemove/mouseup/mousewheel). */
type MouseWithHandlers = Matter.Mouse & {
  mousedown: EventListener;
  mousemove: EventListener;
  mouseup: EventListener;
  mousewheel: EventListener;
};

const DEFAULT_BODY: Matter.IBodyDefinition = { friction: 0.1, restitution: 0.1, density: 0.001, isStatic: false };

function debounce<T extends (...args: never[]) => void>(fn: T, wait: number) {
  let t: ReturnType<typeof setTimeout> | undefined;
  const d = (...args: Parameters<T>) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
  d.cancel = () => {
    if (t) clearTimeout(t);
  };
  return d;
}

export function MatterBody({
  children,
  className,
  matterBodyOptions = DEFAULT_BODY,
  bodyType = 'rectangle',
  isDraggable = true,
  sampleLength = 15,
  x,
  y,
  angle = 0,
}: MatterBodyProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const context = useContext(GravityContext);

  useEffect(() => {
    if (!elementRef.current || !context) return;
    context.registerElement(id, elementRef.current, {
      children,
      matterBodyOptions,
      bodyType,
      sampleLength,
      isDraggable,
      x,
      y,
      angle,
    });
    return () => context.unregisterElement(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context, id, bodyType, sampleLength, isDraggable, x, y, angle]);

  return (
    <div
      ref={elementRef}
      className={cn('absolute top-0 left-0 will-change-transform', className, isDraggable && 'pointer-events-none')}
      style={{ visibility: 'hidden' }}
    >
      {children}
    </div>
  );
}

export const Gravity = forwardRef<GravityRef, GravityProps>(
  (
    {
      children,
      debug = false,
      gravity = { x: 0, y: 1 },
      grabCursor = true,
      resetOnResize = true,
      addTopWall = true,
      autoStart = true,
      startOnView = true,
      decomp,
      className,
    },
    ref,
  ) => {
    const canvas = useRef<HTMLDivElement>(null);
    const engine = useRef<Matter.Engine | null>(null);
    const render = useRef<Matter.Render | undefined>(undefined);
    const runner = useRef<Matter.Runner | undefined>(undefined);
    const bodiesMap = useRef(new Map<string, PhysicsBody>());
    const frameId = useRef<number | undefined>(undefined);
    const mouseConstraint = useRef<Matter.MouseConstraint | undefined>(undefined);
    const mouseDown = useRef(false);
    const cleanupFns = useRef<Array<() => void>>([]);
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
    const isRunning = useRef(false);
    const reduced = useRef(false);
    const [inView, setInView] = useState(!startOnView);

    const getEngine = () => {
      if (!engine.current) engine.current = Engine.create();
      return engine.current;
    };

    const bodyRender = useCallback(
      () => ({
        fillStyle: debug ? 'rgba(128,128,128,0.6)' : 'transparent',
        strokeStyle: debug ? 'rgba(40,40,40,1)' : 'transparent',
        lineWidth: debug ? 3 : 0,
      }),
      [debug],
    );

    const registerElement = useCallback(
      (id: string, element: HTMLElement, props: MatterBodyProps) => {
        if (!canvas.current) return;
        const width = element.offsetWidth;
        const height = element.offsetHeight;
        const canvasRect = canvas.current.getBoundingClientRect();
        const angle = (props.angle || 0) * (Math.PI / 180);
        // Štart vždy vnútri stien (teleso prekrývajúce stenu by matter vystrelil von zo sveta — na 375 px reálne).
        const clamp = (v: number, size: number, box: number) =>
          Math.min(Math.max(v, size / 2), Math.max(size / 2, box - size / 2));
        const x = clamp(calculatePosition(props.x, canvasRect.width, width), width, canvasRect.width);
        const rawY = calculatePosition(props.y, canvasRect.height, height);
        const y = addTopWall ? clamp(rawY, height, canvasRect.height) : Math.min(rawY, canvasRect.height - height / 2);
        const { chamfer, ...bodyOptions } = props.matterBodyOptions ?? {};
        const opts: Matter.IChamferableBodyDefinition = { ...bodyOptions, chamfer: chamfer ?? undefined, angle, render: bodyRender() };

        let body: Matter.Body | undefined;
        if (props.bodyType === 'circle') {
          body = Bodies.circle(x, y, Math.max(width, height) / 2, opts);
        } else if (props.bodyType === 'svg') {
          const vertexSets: Matter.Vector[][] = [];
          element.querySelectorAll('path').forEach((path) => {
            vertexSets.push(samplePathElement(path, props.sampleLength));
          });
          body = vertexSets.length ? Bodies.fromVertices(x, y, vertexSets, opts) : Bodies.rectangle(x, y, width, height, opts);
        } else {
          body = Bodies.rectangle(x, y, width, height, opts);
        }

        if (body) {
          World.add(getEngine().world, [body]);
          bodiesMap.current.set(id, { element, body, props });
          element.style.visibility = '';
        }
      },
      [addTopWall, bodyRender],
    );

    const unregisterElement = useCallback((id: string) => {
      const entry = bodiesMap.current.get(id);
      if (entry && engine.current) {
        World.remove(engine.current.world, entry.body);
        bodiesMap.current.delete(id);
      }
    }, []);

    const syncElements = useCallback(() => {
      bodiesMap.current.forEach(({ element, body }) => {
        const { x, y } = body.position;
        const rotation = body.angle * (180 / Math.PI);
        element.style.transform = `translate(${x - element.offsetWidth / 2}px, ${y - element.offsetHeight / 2}px) rotate(${rotation}deg)`;
      });
    }, []);

    const updateElements = useCallback(() => {
      syncElements();
      frameId.current = requestAnimationFrame(updateElements);
    }, [syncElements]);

    const startEngine = useCallback(() => {
      if (isRunning.current || reduced.current) return;
      const eng = getEngine();
      if (!runner.current) runner.current = Runner.create();
      runner.current.enabled = true;
      Runner.run(runner.current, eng);
      if (render.current) Render.run(render.current);
      if (frameId.current) cancelAnimationFrame(frameId.current);
      frameId.current = requestAnimationFrame(updateElements);
      isRunning.current = true;
    }, [updateElements]);

    const stopEngine = useCallback(() => {
      if (!isRunning.current) return;
      if (runner.current) Runner.stop(runner.current);
      if (render.current) Render.stop(render.current);
      if (frameId.current) cancelAnimationFrame(frameId.current);
      frameId.current = undefined;
      isRunning.current = false;
    }, []);

    const initializeRenderer = useCallback(() => {
      const el = canvas.current;
      if (!el) return;
      const height = el.offsetHeight;
      const width = el.offsetWidth;
      const eng = getEngine();
      reduced.current = prefersReducedMotion();

      if (decomp) Common.setDecomp(decomp);
      eng.gravity.x = gravity.x;
      eng.gravity.y = gravity.y;

      if (debug) {
        render.current = Render.create({
          element: el,
          engine: eng,
          options: { width, height, wireframes: false, background: 'transparent' },
        });
        render.current.canvas.style.position = 'absolute';
        render.current.canvas.style.inset = '0';
        render.current.canvas.style.pointerEvents = 'none';
      }

      const walls = [
        Bodies.rectangle(width / 2, height + 10, width, 20, { isStatic: true, friction: 1, render: { visible: debug } }),
        Bodies.rectangle(width + 10, height / 2, 20, height, { isStatic: true, friction: 1, render: { visible: debug } }),
        Bodies.rectangle(-10, height / 2, 20, height, { isStatic: true, friction: 1, render: { visible: debug } }),
      ];
      if (addTopWall) {
        walls.push(Bodies.rectangle(width / 2, -10, width, 20, { isStatic: true, friction: 1, render: { visible: debug } }));
      }
      World.add(eng.world, walls);

      if (!reduced.current) {
        const mouse = Mouse.create(el) as MouseWithHandlers;
        const mc = MouseConstraint.create(eng, { mouse, constraint: { stiffness: 0.2, render: { visible: debug } } });
        mouseConstraint.current = mc;
        World.add(eng.world, mc);

        // Dotyk a koliesko: matter volá preventDefault (blokuje scroll a klik). Preberáme len keď treba.
        el.removeEventListener('wheel', mouse.mousewheel);
        el.removeEventListener('touchstart', mouse.mousedown);
        el.removeEventListener('touchmove', mouse.mousemove);
        el.removeEventListener('touchend', mouse.mouseup);
        const dynamicBodies = () => eng.world.bodies.filter((b) => !b.isStatic);
        let touchOnBody = false;
        const onTouchStart = (e: TouchEvent) => {
          const t = e.changedTouches[0];
          if (!t) return;
          const rect = el.getBoundingClientRect();
          touchOnBody = Query.point(dynamicBodies(), { x: t.clientX - rect.left, y: t.clientY - rect.top }).length > 0;
          if (touchOnBody) mouse.mousedown(e);
        };
        const onTouchMove = (e: TouchEvent) => {
          if (touchOnBody && mc.body) mouse.mousemove(e);
        };
        const onTouchEnd = (e: TouchEvent) => {
          if (touchOnBody) mouse.mouseup(e);
          touchOnBody = false;
        };
        el.addEventListener('touchstart', onTouchStart, { passive: false });
        el.addEventListener('touchmove', onTouchMove, { passive: false });
        el.addEventListener('touchend', onTouchEnd, { passive: false });
        el.addEventListener('touchcancel', onTouchEnd, { passive: false });
        cleanupFns.current.push(() => {
          el.removeEventListener('touchstart', onTouchStart);
          el.removeEventListener('touchmove', onTouchMove);
          el.removeEventListener('touchend', onTouchEnd);
          el.removeEventListener('touchcancel', onTouchEnd);
        });

        if (grabCursor) {
          const touchingMouse = () => Query.point(dynamicBodies(), mouse.position).length > 0;
          const onBeforeUpdate = () => {
            if (!mouseDown.current && !touchingMouse()) el.style.cursor = '';
            else if (touchingMouse()) el.style.cursor = mouseDown.current ? 'grabbing' : 'grab';
          };
          const onDown = () => {
            mouseDown.current = true;
            el.style.cursor = touchingMouse() ? 'grabbing' : '';
          };
          const onUp = () => {
            mouseDown.current = false;
            el.style.cursor = touchingMouse() ? 'grab' : '';
          };
          Events.on(eng, 'beforeUpdate', onBeforeUpdate);
          el.addEventListener('mousedown', onDown);
          el.addEventListener('mouseup', onUp);
          cleanupFns.current.push(() => {
            Events.off(eng, 'beforeUpdate', onBeforeUpdate);
            el.removeEventListener('mousedown', onDown);
            el.removeEventListener('mouseup', onUp);
            el.style.cursor = '';
          });
        }
      }

      runner.current = Runner.create();
      runner.current.enabled = false;

      if (reduced.current) {
        // Statický obraz: svet sa dopočíta naraz (nálepky ležia na dne), nič nebeží.
        for (let i = 0; i < 240; i++) Engine.update(eng, 1000 / 60);
        syncElements();
        return;
      }

      syncElements();
      if (autoStart && inView) startEngine();
    }, [addTopWall, autoStart, debug, decomp, gravity.x, gravity.y, grabCursor, inView, startEngine, syncElements]);

    const clearRenderer = useCallback(() => {
      stopEngine();
      cleanupFns.current.forEach((fn) => fn());
      cleanupFns.current = [];
      const eng = engine.current;
      if (mouseConstraint.current && eng) {
        World.remove(eng.world, mouseConstraint.current);
        Mouse.clearSourceEvents(mouseConstraint.current.mouse);
        const m = mouseConstraint.current.mouse as MouseWithHandlers;
        const el = m.element;
        if (el) {
          el.removeEventListener('mousemove', m.mousemove);
          el.removeEventListener('mousedown', m.mousedown);
          el.removeEventListener('mouseup', m.mouseup);
        }
        mouseConstraint.current = undefined;
      }
      if (render.current) {
        Render.stop(render.current);
        render.current.canvas.remove();
        render.current = undefined;
      }
      if (eng) {
        // telesá ostávajú registrované (mapa), len sa vyprázdni svet a znovu sa pridajú pri reset-e
        World.clear(eng.world, false);
        Engine.clear(eng);
      }
    }, [stopEngine]);

    /** Znovu postaví svet z aktuálnych rozmerov; registrované telesá sa vrátia na štartové pozície. */
    const rebuild = useCallback(() => {
      const el = canvas.current;
      if (!el) return;
      const entries = Array.from(bodiesMap.current.entries());
      clearRenderer();
      bodiesMap.current.clear();
      setCanvasSize({ width: el.offsetWidth, height: el.offsetHeight });
      initializeRenderer();
      entries.forEach(([id, { element, props }]) => registerElement(id, element, props));
      syncElements();
    }, [clearRenderer, initializeRenderer, registerElement, syncElements]);

    const reset = useCallback(() => {
      bodiesMap.current.forEach(({ element, body, props }) => {
        Body.setAngle(body, ((props.angle || 0) * Math.PI) / 180);
        Body.setVelocity(body, { x: 0, y: 0 });
        Body.setAngularVelocity(body, 0);
        Body.setPosition(body, {
          x: calculatePosition(props.x, canvasSize.width || canvas.current?.offsetWidth || 0, element.offsetWidth),
          y: calculatePosition(props.y, canvasSize.height || canvas.current?.offsetHeight || 0, element.offsetHeight),
        });
      });
      syncElements();
    }, [canvasSize.height, canvasSize.width, syncElements]);

    useImperativeHandle(ref, () => ({ start: startEngine, stop: stopEngine, reset }), [startEngine, stopEngine, reset]);

    // Viewport: engine beží len keď je sekcia vidieť.
    useEffect(() => {
      if (!startOnView || !canvas.current || typeof IntersectionObserver === 'undefined') {
        setInView(true);
        return;
      }
      const io = new IntersectionObserver(
        (entries) => {
          const visible = entries.some((e) => e.isIntersecting);
          setInView(visible);
        },
        { rootMargin: '10% 0px' },
      );
      io.observe(canvas.current);
      return () => io.disconnect();
    }, [startOnView]);

    useEffect(() => {
      if (!autoStart) return;
      if (inView) startEngine();
      else stopEngine();
    }, [inView, autoStart, startEngine, stopEngine]);

    useEffect(() => {
      if (!resetOnResize) return;
      let lastWidth = window.innerWidth;
      const onResize = debounce(() => {
        if (window.innerWidth === lastWidth) return; // mobilná adresná lišta mení len výšku
        lastWidth = window.innerWidth;
        rebuild();
      }, 500);
      window.addEventListener('resize', onResize);
      return () => {
        window.removeEventListener('resize', onResize);
        onResize.cancel();
      };
    }, [rebuild, resetOnResize]);

    useEffect(() => {
      const el = canvas.current;
      if (el) setCanvasSize({ width: el.offsetWidth, height: el.offsetHeight });
      initializeRenderer();
      return () => {
        clearRenderer();
        engine.current = null;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Stabilná hodnota kontextu — inak by sa telesá pri každom renderi Gravity (napr. zmena inView) registrovali nanovo.
    const contextValue = useMemo(() => ({ registerElement, unregisterElement }), [registerElement, unregisterElement]);

    return (
      <GravityContext.Provider value={contextValue}>
        <div
          ref={canvas}
          className={cn('absolute top-0 left-0 h-full w-full overflow-hidden touch-pan-y select-none', className)}
        >
          {children}
        </div>
      </GravityContext.Provider>
    );
  },
);

Gravity.displayName = 'Gravity';
export default Gravity;
