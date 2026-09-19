/** OG karta 1200×630 cez satori + resvg. Šablóna v tokenoch (satori nevie oklch → hex ekvivalenty z tokens.css:
 *  ink oklch(15% 0 0) = #0b0b0b, paper oklch(95% .01 85) = #f1eee7, hot #ED4E26, yellow #FFE600).
 *  Písmo: satori potrebuje TTF/OTF/WOFF — Bricolage je vo fontsource len ako woff2, preto titulok
 *  v Space Grotesk 700 (.woff) a akcent v Instrument Serif italic (.woff). Bricolage TTF = otvorená položka. */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import satori, { type Font } from 'satori';

/* natívny resvg sa nesmie bundlovať (adaptér Cloudflare má noExternal) — načítame ho cez require v Node pri builde */
const require = createRequire(import.meta.url);

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

const T = {
  ink: '#0b0b0b',
  paper: '#f1eee7',
  hot: '#ed4e26',
  yellow: '#ffe600',
  white: '#ffffff',
};

const fontsDir = (pkg: string) => join(process.cwd(), 'node_modules', pkg, 'files');

let fontsCache: Font[] | null = null;
export function loadFonts(): Font[] {
  if (fontsCache) return fontsCache;
  const sg = fontsDir('@fontsource/space-grotesk');
  const is = fontsDir('@fontsource/instrument-serif');
  /* satori berie na jedno meno jeden font; latin-ext subsety (Ľ, Č, Ť…) preto registrujeme pod iným menom —
     satori v nich hľadá glyfy, ktoré v latin súbore chýbajú (per-glyph fallback). */
  fontsCache = [
    { name: 'Space Grotesk', data: readFileSync(join(sg, 'space-grotesk-latin-700-normal.woff')), weight: 700, style: 'normal' },
    { name: 'Space Grotesk', data: readFileSync(join(sg, 'space-grotesk-latin-500-normal.woff')), weight: 500, style: 'normal' },
    { name: 'Space Grotesk Ext', data: readFileSync(join(sg, 'space-grotesk-latin-ext-700-normal.woff')), weight: 700, style: 'normal' },
    { name: 'Space Grotesk Ext', data: readFileSync(join(sg, 'space-grotesk-latin-ext-500-normal.woff')), weight: 500, style: 'normal' },
    { name: 'Instrument Serif', data: readFileSync(join(is, 'instrument-serif-latin-400-italic.woff')), weight: 400, style: 'italic' },
    { name: 'Instrument Serif Ext', data: readFileSync(join(is, 'instrument-serif-latin-ext-400-italic.woff')), weight: 400, style: 'italic' },
  ];
  return fontsCache;
}

/** X znak z public/brand/x.svg (rovnaká cesta, fill podľa farby). */
function XMark({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
      <path
        fill={color}
        d="M0 0H26L53 43L80 0H106L66 65L106 130H79L53 87L27 130H0L40 65Z"
        transform="translate(63,48) scale(1.23)"
      />
    </svg>
  );
}

export type OgInput = { title: string; description?: string; eyebrow?: string };

function titleSize(title: string) {
  if (title.length <= 18) return 128;
  if (title.length <= 30) return 104;
  if (title.length <= 44) return 84;
  return 68;
}

export function OgCard({ title, description, eyebrow = 'xvadur.com' }: OgInput) {
  const fs = titleSize(title);
  return (
    <div
      style={{
        width: OG_WIDTH,
        height: OG_HEIGHT,
        display: 'flex',
        backgroundColor: T.paper,
        padding: 28,
        fontFamily: 'Space Grotesk',
        color: T.ink,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '100%',
          height: '100%',
          border: `6px solid ${T.ink}`,
          borderRadius: 16,
          backgroundColor: T.white,
          boxShadow: `14px 14px 0 0 ${T.ink}`,
          padding: '44px 56px',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              fontSize: 26,
              fontWeight: 500,
              letterSpacing: 4,
              textTransform: 'uppercase',
              backgroundColor: T.yellow,
              border: `4px solid ${T.ink}`,
              borderRadius: 10,
              padding: '8px 18px',
              boxShadow: `5px 5px 0 0 ${T.ink}`,
            }}
          >
            {eyebrow}
          </div>
          <XMark size={96} color={T.hot} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div
            style={{
              display: 'flex',
              fontSize: fs,
              fontWeight: 700,
              lineHeight: 0.98,
              letterSpacing: -2,
              textTransform: 'uppercase',
              maxWidth: 1040,
            }}
          >
            {title}
          </div>
          {description ? (
            <div
              style={{
                display: 'flex',
                fontFamily: 'Instrument Serif',
                fontStyle: 'italic',
                fontSize: 38,
                lineHeight: 1.2,
                maxWidth: 1000,
                color: T.ink,
              }}
            >
              {description}
            </div>
          ) : null}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', fontSize: 64, fontWeight: 700, letterSpacing: 6 }}>XVADUR</div>
          <div style={{ display: 'flex', fontSize: 22, fontWeight: 500, letterSpacing: 3, textTransform: 'uppercase' }}>
            Adam Rudavský · Postavené s AI · Riadené človekom
          </div>
        </div>
      </div>
    </div>
  );
}

export async function renderOgSvg(input: OgInput): Promise<string> {
  return satori(<OgCard {...input} />, {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts: loadFonts(),
  });
}

export async function renderOgPng(input: OgInput): Promise<Uint8Array> {
  const svg = await renderOgSvg(input);
  const { Resvg } = require('@resvg/resvg-js') as typeof import('@resvg/resvg-js');
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: OG_WIDTH } });
  return resvg.render().asPng();
}
