/** V7-07 · Chodba pavilónov A–E (hlavný pohybový motor). Desktop (≥ 1024 px, výška ≥ 700 px, bez reduced motion):
 *  GSAP ScrollTrigger pin + x — sekcia sa prilepí a pavilóny idú vodorovne so scrollom, dole je podlahová čiara
 *  s mapou chodby (progress + písmená pavilónov). Mobil a reduced motion: zvislý tok s tými istými tabuľami.
 *  GSAP hýbe iba koľajou (track), karty vnútri majú CSS/Motion (nikdy oba na jednom prvku).
 *  Otvára aj prekrytia: detail chorobopisu (sheet) a hru (dialóg / drawer) — z kariet aj z ⌘K (udalosť v707:otvor).
 *  Ostrov: <Chodba client:load posledny={…} />. */
import * as React from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { CHODBA, PROJEKTY, miesto, type MiestoId, type Projekt } from './data';
import { ChodbaKontext, useVodorovne } from './kontext';
import { OTVOR, chod, type Otvor } from './navigacia';
import { Dvere, PavA, PavB, PavC, PavD, PavE, type Text } from './Pavilony';
import { Detail } from './Detail';
import { Hra } from './Hra';

type Znacka = { id: MiestoId; pismeno: string; p: number };

/** Podlaha: čiara chodby s priebehom a písmenami pavilónov (klik = choď). Stav drží sama, aby scrub neprekresľoval celú chodbu. */
function Podlaha({ napoj, znacky }: { napoj: (f: (p: number) => void) => void; znacky: Znacka[] }) {
  const [p, setP] = React.useState(0);
  React.useEffect(() => napoj(setP), [napoj]);
  return (
    <div className="v07-podlaha absolute inset-x-0 bottom-0 z-20 flex h-14 items-center gap-4 border-t-3 border-ink bg-ink px-6 text-paper">
      <span className="shrink-0 font-mono text-xs font-bold tracking-[0.14em] text-yellow uppercase">Chodba A–E</span>
      <div className="relative flex-1">
        <Progress value={Math.round(p * 100)} aria-label="Kde si na chodbe" className="h-4 border-paper bg-ink shadow-none [&>div]:bg-yellow [&>div]:transition-none" />
        {znacky.map((z) => (
          <button
            key={z.id}
            type="button"
            onClick={() => chod(z.id)}
            style={{ left: `${z.p * 100}%` }}
            className={cn(
              'absolute top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center border-3 font-display text-base font-extrabold',
              p + 0.004 >= z.p ? 'border-ink bg-yellow text-ink' : 'border-paper bg-ink text-paper',
            )}
            aria-label={`Choď do pavilónu ${z.pismeno}: ${miesto(z.id).nazov}`}
          >
            {z.pismeno}
          </button>
        ))}
      </div>
      <button type="button" onClick={() => chod('vysetrenie')} className="shrink-0 border-3 border-paper bg-hot px-3 py-1.5 font-mono text-xs font-bold text-ink uppercase">
        F · cieľ →
      </button>
    </div>
  );
}

export default function Chodba({ posledny }: { posledny: Text | null }) {
  const vodorovne = useVodorovne();
  const sekcia = React.useRef<HTMLElement>(null);
  const track = React.useRef<HTMLDivElement>(null);
  const setProgres = React.useRef<((p: number) => void) | null>(null);
  const napoj = React.useCallback((f: (p: number) => void) => {
    setProgres.current = f;
  }, []);
  const [znacky, setZnacky] = React.useState<Znacka[]>([]);
  const [projekt, setProjekt] = React.useState<Projekt | null>(null);
  const [sheet, setSheet] = React.useState(false);
  const [hra, setHra] = React.useState(false);

  // prekrytia: z kariet aj z ⌘K (iný ostrov)
  React.useEffect(() => {
    const on = (e: Event) => {
      const d = (e as CustomEvent<Otvor>).detail;
      if (d.typ === 'hra') setHra(true);
      else {
        const p = PROJEKTY.find((x) => x.id === d.id) ?? null;
        if (p) {
          setProjekt(p);
          setSheet(true);
        }
      }
    };
    window.addEventListener(OTVOR, on);
    return () => window.removeEventListener(OTVOR, on);
  }, []);

  // hlavný motor: GSAP pin + vodorovný posun koľaje
  React.useEffect(() => {
    window.dispatchEvent(new Event('v707:chodba'));
    if (!vodorovne) return;
    let zivy = true;
    let zrus = () => {};
    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')]);
      const s = sekcia.current;
      const t = track.current;
      if (!zivy || !s || !t) return;
      gsap.registerPlugin(ScrollTrigger);
      const dist = () => Math.max(0, t.scrollWidth - window.innerWidth);
      const tween = gsap.to(t, {
        x: () => -dist(),
        ease: 'none',
        scrollTrigger: {
          trigger: s,
          start: 'top top',
          end: () => `+=${dist()}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (st) => setProgres.current?.(st.progress),
        },
      });
      const st = tween.scrollTrigger!;
      const zmeraj = () => {
        const d = dist() || 1;
        setZnacky(
          CHODBA.map((id) => {
            const el = t.querySelector<HTMLElement>(`#${id}`);
            return { id, pismeno: miesto(id).pismeno, p: el ? Math.min(1, el.offsetLeft / d) : 0 };
          }),
        );
      };
      window.__v707chodba = {
        pozicia: (id) => {
          const el = t.querySelector<HTMLElement>(`#${id}`);
          if (!el) return null;
          return st.start + Math.min(el.offsetLeft, dist()) + 2;
        },
      };
      const lenis = window.__lenis;
      const upd = () => ScrollTrigger.update();
      lenis?.on('scroll', upd);
      ScrollTrigger.addEventListener('refresh', zmeraj);
      let casovac = 0;
      const ro = new ResizeObserver(() => {
        window.clearTimeout(casovac);
        casovac = window.setTimeout(() => ScrollTrigger.refresh(), 150);
      });
      ro.observe(t);
      ScrollTrigger.refresh();
      zmeraj();
      window.dispatchEvent(new Event('v707:chodba'));
      zrus = () => {
        ro.disconnect();
        window.clearTimeout(casovac);
        lenis?.off('scroll', upd);
        ScrollTrigger.removeEventListener('refresh', zmeraj);
        st.kill(true);
        tween.kill();
        gsap.set(t, { clearProps: 'transform' });
        window.__v707chodba = null;
      };
    })();
    return () => {
      zivy = false;
      zrus();
    };
  }, [vodorovne]);

  return (
    <ChodbaKontext.Provider value={{ vodorovne }}>
      <TooltipProvider delayDuration={150}>
        <section
          ref={sekcia}
          id="chodba"
          aria-label="Chodba: pavilóny A až E"
          className={cn('v07-chodba relative bg-paper', vodorovne ? 'h-dvh overflow-hidden pt-16' : '')}
        >
          <div ref={track} className={cn('v07-track relative', vodorovne ? 'flex h-[calc(100%-3.5rem)] w-max flex-row' : 'flex flex-col')}>
            <PavA />
            <PavB />
            <PavC />
            <PavD />
            <PavE posledny={posledny} />
            <Dvere />
          </div>
          {vodorovne && <Podlaha napoj={napoj} znacky={znacky} />}
        </section>
        <Detail p={projekt} open={sheet} onOpenChange={setSheet} />
        <Hra open={hra} onOpenChange={setHra} />
      </TooltipProvider>
    </ChodbaKontext.Provider>
  );
}
