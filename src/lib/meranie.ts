/** Meranie V5 (XDR-210): udalosti pre analytiku a reklamný pixel. Jedna funkcia `track(nazov, data)`:
 *  1. window.dataLayer.push (GTM / GA4, ak ho Adam pridá),
 *  2. Meta Pixel (fbq), TikTok Pixel (ttq), gtag — iba ak sú na stránke (zatiaľ nie sú; ID pixelov čakajú na Adama),
 *  3. sendBeacon na /api/udalost/ (Workers Logs + denný počítadlo).
 *  UTM a click-id z prvej návštevy sa držia v sessionStorage („utm“) a posielajú sa s formulármi. */
type W = Window & {
  dataLayer?: unknown[];
  fbq?: (...a: unknown[]) => void;
  ttq?: { track: (...a: unknown[]) => void };
  gtag?: (...a: unknown[]) => void;
};

const UTM_KLUCE = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'ttclid', 'gclid'];

/** Pri prvom načítaní zachyť UTM z URL (a referrer), ulož do sessionStorage. */
export function zachytUtm(): void {
  try {
    const p = new URLSearchParams(location.search);
    const nove: Record<string, string> = {};
    for (const k of UTM_KLUCE) {
      const v = p.get(k);
      if (v) nove[k] = v.slice(0, 200);
    }
    const stare = JSON.parse(sessionStorage.getItem('utm') || '{}');
    if (!stare.ref && document.referrer && !document.referrer.includes(location.host)) nove.ref = document.referrer.slice(0, 200);
    if (Object.keys(nove).length) sessionStorage.setItem('utm', JSON.stringify({ ...stare, ...nove }));
  } catch {
    /* súkromné okno: bez UTM */
  }
}

export function utm(): Record<string, string> {
  try {
    return JSON.parse(sessionStorage.getItem('utm') || '{}');
  } catch {
    return {};
  }
}

/** Mapovanie na štandardné udalosti reklamných platforiem. */
const STANDARD: Record<string, { meta?: string; tiktok?: string }> = {
  konzultacia_rezervacia: { meta: 'Schedule', tiktok: 'Schedule' },
  zapis_odoslany: { meta: 'Lead', tiktok: 'SubmitForm' },
  konzultacia_klik: { meta: 'Contact', tiktok: 'ClickButton' },
};

export function track(nazov: string, data: Record<string, string> = {}): void {
  const w = window as W;
  try {
    (w.dataLayer ||= []).push({ event: nazov, ...data });
    const s = STANDARD[nazov];
    if (s?.meta) w.fbq?.('track', s.meta, data);
    else w.fbq?.('trackCustom', nazov, data);
    if (s?.tiktok) w.ttq?.track(s.tiktok, data);
    w.gtag?.('event', nazov, data);
    const body = JSON.stringify({ nazov, miesto: data.miesto ?? '', stranka: location.pathname, utm: utm() });
    if (!navigator.sendBeacon?.('/api/udalost/', new Blob([body], { type: 'application/json' }))) {
      fetch('/api/udalost/', { method: 'POST', body, keepalive: true, headers: { 'content-type': 'application/json' } }).catch(() => {});
    }
  } catch {
    /* meranie nikdy nesmie rozbiť stránku */
  }
}

/** Delegovaný klik: každý prvok s data-track="nazov" (a voliteľne data-track-miesto) pošle udalosť. */
export function zapniKliky(): void {
  document.addEventListener(
    'click',
    (e) => {
      const el = e.target instanceof Element ? e.target.closest<HTMLElement>('[data-track]') : null;
      if (!el) return;
      track(el.dataset.track!, { miesto: el.dataset.trackMiesto ?? '' });
    },
    { capture: true },
  );
}
