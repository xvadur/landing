/** Mechanika „spis“ (XDR-266): web sa pred návštevníkom odtajňuje. Opakovaná, nie jednorazová:
 *
 *  <span class="rd" data-rd>slovo</span>          čierny redakčný pruh; keď vojde do obrazu, stiahne sa a text sa
 *                                                  poskladá zo znakov. Odkryté ostáva.
 *  <span class="rd" data-rd="hover">slovo</span>  ostáva začiernené, kým naň neprejdeš myšou, nefokusuješ ho alebo
 *                                                  neťukneš; potom ostane odkryté.
 *  <span data-count="138921">138 921</span>        číslo sa dopočíta od nuly, keď vojde do obrazu.
 *  <span data-sifra>DIVIDED,</span>                trvalo čitateľné; pri hoveri sa na chvíľu zašifruje a zloží späť.
 *  [data-rd-skupina]                               pruhy v skupine sa odkrývajú postupne (stagger).
 *  [data-odtajnit]                                 tlačidlo: odkryje všetko v najbližšej [data-rd-skupina] / sekcii.
 *  [data-rd-pocitadlo]                             vypíše „odtajnené X %“ zo všetkých pruhov na stránke.
 *
 *  Bez JS: nič sa nezačierni (pruhy kreslí CSS iba pod html.spis-js). Reduced motion: všetko odkryté hneď, bez šifry.
 *  Text je v DOM vždy celý, čítačky obrazovky ho čítajú bez ohľadu na pruhy. */

const ZNAKY = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&@$§×/\\<>[]{}=+*';
const nahodny = () => ZNAKY[Math.floor(Math.random() * ZNAKY.length)]!;
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Zloží text elementu zo znakov (zľava doprava). Šírka ostáva pevná počas šifry. */
export function sifruj(el: HTMLElement, trvanie = 520): Promise<void> {
  const cielovy = el.dataset.text ?? el.textContent ?? '';
  el.dataset.text = cielovy;
  if (reduced()) {
    el.textContent = cielovy;
    return Promise.resolve();
  }
  const w = el.getBoundingClientRect().width;
  if (w) el.style.minWidth = `${w}px`;
  el.style.display = el.style.display || 'inline-block';
  const start = performance.now();
  return new Promise((resolve) => {
    const krok = (t: number) => {
      const p = Math.min(1, (t - start) / trvanie);
      const hotovych = Math.floor(p * cielovy.length);
      let s = '';
      for (let i = 0; i < cielovy.length; i++) {
        const c = cielovy[i]!;
        s += i < hotovych || c === ' ' || c === ' ' ? c : nahodny();
      }
      el.textContent = s;
      if (p < 1) requestAnimationFrame(krok);
      else {
        el.textContent = cielovy;
        el.style.minWidth = '';
        resolve();
      }
    };
    requestAnimationFrame(krok);
  });
}

function odkry(el: HTMLElement) {
  if (el.classList.contains('rd-on')) return;
  el.classList.add('rd-on');
  const vnutro = el.querySelector<HTMLElement>('.rd-t') ?? el;
  void sifruj(vnutro, 420 + Math.min(600, (vnutro.textContent?.length ?? 0) * 18));
  aktualizujPocitadlo();
}

function dopocitaj(el: HTMLElement) {
  if (el.dataset.countDone) return;
  el.dataset.countDone = '1';
  const ciel = Number(el.dataset.count);
  if (!Number.isFinite(ciel)) return;
  const fmt = (n: number) => new Intl.NumberFormat('sk-SK').format(Math.round(n)).replace(/\s/g, ' ');
  if (reduced()) {
    el.textContent = fmt(ciel);
    return;
  }
  const start = performance.now();
  const trvanie = 1400;
  const krok = (t: number) => {
    const p = Math.min(1, (t - start) / trvanie);
    // cieľ sa číta každý snímok: keď medzitým príde čerstvý pulz, dopočítavanie skončí na ňom
    const aktualny = Number(el.dataset.count) || ciel;
    el.textContent = fmt(aktualny * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(krok);
  };
  requestAnimationFrame(krok);
}

export function aktualizujPocitadlo() {
  const vsetky = document.querySelectorAll('.rd');
  if (!vsetky.length) return;
  const on = document.querySelectorAll('.rd.rd-on').length;
  const pct = Math.round((on / vsetky.length) * 100);
  document.querySelectorAll<HTMLElement>('[data-rd-pocitadlo]').forEach((c) => {
    c.textContent = `${pct} %`;
    c.closest<HTMLElement>('[data-rd-meter]')?.style.setProperty('--rd-pct', String(pct / 100));
  });
}

let io: IntersectionObserver | null = null;

/** Spustí mechaniku v `root`. `pockaj` = počkať na koniec opony (hero). Volá sa na astro:page-load. */
export function initSpis(root: ParentNode = document, pockaj = false) {
  document.documentElement.classList.add('spis-js');
  const rds = [...root.querySelectorAll<HTMLElement>('.rd')];
  const counts = [...root.querySelectorAll<HTMLElement>('[data-count]')];

  // hover / fokus / ťuk odkryje slovo (aj pri auto pruhoch — kto je rýchlejší ako scroll)
  for (const el of rds) {
    if (el.dataset.rdInit) continue;
    el.dataset.rdInit = '1';
    if (el.dataset.rd === 'hover') {
      el.tabIndex = 0;
      el.setAttribute('role', 'button');
      el.setAttribute('aria-label', `Odkryť: ${el.textContent?.trim() ?? ''}`);
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          odkry(el);
        }
      });
    }
    el.addEventListener('pointerenter', () => odkry(el));
    el.addEventListener('focus', () => odkry(el));
    el.addEventListener('click', () => odkry(el));
  }

  // šifra na hover (motto): trvalo čitateľné, zašifruje sa iba na chvíľu
  root.querySelectorAll<HTMLElement>('[data-sifra]').forEach((el) => {
    if (el.dataset.sifraInit) return;
    el.dataset.sifraInit = '1';
    let bezi = false;
    el.addEventListener('pointerenter', async () => {
      if (bezi || reduced()) return;
      bezi = true;
      await sifruj(el, 480);
      bezi = false;
    });
  });

  // tlačidlo „odtajniť všetko“
  root.querySelectorAll<HTMLElement>('[data-odtajnit]').forEach((b) => {
    if (b.dataset.odInit) return;
    b.dataset.odInit = '1';
    b.addEventListener('click', () => {
      const scope = b.closest('[data-rd-skupina], section') ?? document;
      scope.querySelectorAll<HTMLElement>('.rd').forEach((el, i) => setTimeout(() => odkry(el), i * 60));
      scope.querySelectorAll<HTMLElement>('[data-count]').forEach(dopocitaj);
    });
  });

  if (reduced()) {
    rds.forEach((el) => el.classList.add('rd-on'));
    counts.forEach(dopocitaj);
    aktualizujPocitadlo();
    return;
  }

  const start = () => {
    io?.disconnect();
    io = new IntersectionObserver(
      (entries) => {
        // stagger v rámci dávky: pruhy, ktoré vošli do obrazu naraz, sa odkrývajú postupne (od hora nadol)
        const davka = entries
          .filter((e) => e.isIntersecting)
          .map((e) => e.target as HTMLElement)
          .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top || a.getBoundingClientRect().left - b.getBoundingClientRect().left);
        let n = 0;
        for (const el of davka) {
          io?.unobserve(el);
          if (el.hasAttribute('data-count')) {
            dopocitaj(el);
            continue;
          }
          if (el.dataset.rd === 'hover') continue;
          const oneskorenie = Number(el.dataset.rdDelay ?? 0) + n++ * 220;
          setTimeout(() => odkry(el), oneskorenie);
        }
      },
      { threshold: 0.5, rootMargin: '0px 0px -4% 0px' },
    );
    [...rds, ...counts].forEach((el) => io!.observe(el));
    aktualizujPocitadlo();
  };

  if (pockaj && document.getElementById('opona')) window.addEventListener('opona:done', start, { once: true });
  else start();
}
