/** V7-02 · Scroll-film — zástupná filmová sekvencia (bez videa, bez Higgsfieldu). Tri zábery po 120 snímok,
 *  kreslené procedurálne do malého plátna (480 × 270) a zväčšené bez vyhladenia (tvrdé pixely, risograf).
 *  F1 chodba (sestra odchádza), F2 dvere so zmenenou smenou, F3 dielňa s monitormi a agentmi ako piktogramami.
 *  Zmrazená snímka na strihu = 1-bit dither (Bayer 4 × 4, ink / žltá). Farby = tokeny cez 1 px canvas (žiadny hex). */

export type RGB = [number, number, number];
export type Paleta = {
  ink: RGB;
  paper: RGB;
  white: RGB;
  yellow: RGB;
  stamp: RGB;
  /** papier stmavený inkom (odvodené z tokenov) */
  tien: RGB;
};

export const W = 480;
export const H = 270;

const cache = new Map<string, RGB>();
export function rgbTokenu(meno: string): RGB {
  const hit = cache.get(meno);
  if (hit) return hit;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(`--color-${meno}`).trim();
  const c = document.createElement('canvas');
  c.width = 1;
  c.height = 1;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  if (!ctx || !raw) return [0, 0, 0];
  ctx.fillStyle = raw;
  ctx.fillRect(0, 0, 1, 1);
  const d = ctx.getImageData(0, 0, 1, 1).data;
  const rgb: RGB = [d[0]!, d[1]!, d[2]!];
  cache.set(meno, rgb);
  return rgb;
}

const mix = (a: RGB, b: RGB, k: number): RGB => [
  Math.round(a[0] + (b[0] - a[0]) * k),
  Math.round(a[1] + (b[1] - a[1]) * k),
  Math.round(a[2] + (b[2] - a[2]) * k),
];

export function paleta(): Paleta {
  const ink = rgbTokenu('ink');
  const paper = rgbTokenu('paper');
  return { ink, paper, white: rgbTokenu('white'), yellow: rgbTokenu('yellow'), stamp: rgbTokenu('stamp'), tien: mix(paper, ink, 0.14) };
}

export const css = ([r, g, b]: RGB, a = 1) => `rgb(${r} ${g} ${b} / ${a})`;

type C = CanvasRenderingContext2D;
type Bod = [number, number];

function poly(ctx: C, body: Bod[], fill?: string, stroke?: string, lw = 2) {
  ctx.beginPath();
  body.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lw;
    ctx.stroke();
  }
}

function box(ctx: C, x: number, y: number, w: number, h: number, fill: string, stroke?: string, lw = 2, tien?: string, off = 3) {
  if (tien) {
    ctx.fillStyle = tien;
    ctx.fillRect(Math.round(x + off), Math.round(y + off), Math.round(w), Math.round(h));
  }
  ctx.fillStyle = fill;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lw;
    ctx.strokeRect(Math.round(x) + lw / 2, Math.round(y) + lw / 2, Math.round(w) - lw, Math.round(h) - lw);
  }
}

/** Halftone bodky v obryse (risograf). */
function bodky(ctx: C, body: Bod[], farba: string, krok = 6, r = 1) {
  ctx.save();
  ctx.beginPath();
  body.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  ctx.clip();
  ctx.fillStyle = farba;
  const xs = body.map((b) => b[0]);
  const ys = body.map((b) => b[1]);
  for (let y = Math.floor(Math.min(...ys)); y < Math.max(...ys); y += krok)
    for (let x = Math.floor(Math.min(...xs)) + ((y / krok) % 2 ? krok / 2 : 0); x < Math.max(...xs); x += krok) ctx.fillRect(x, y, r * 2, r * 2);
  ctx.restore();
}

/** Deterministický šum: rovnaká snímka = rovnaké zrno. */
function zrno(ctx: C, snimka: number, farba: string, n = 60) {
  let s = (snimka + 1) * 2654435761;
  const r = () => {
    s = (s ^ (s << 13)) >>> 0;
    s = (s ^ (s >>> 17)) >>> 0;
    s = (s ^ (s << 5)) >>> 0;
    return s / 4294967296;
  };
  ctx.fillStyle = farba;
  for (let i = 0; i < n; i++) ctx.fillRect(Math.floor(r() * W), Math.floor(r() * H), 1 + Math.floor(r() * 2), 1);
}

/** Sestra ako piktogram (zozadu): čiapka s krížom, tunika, nohy po krokoch. */
function sestra(ctx: C, x: number, pata: number, v: number, krok: number, p: Paleta) {
  const ink = css(p.ink);
  const s = v / 100;
  // tieň na podlahe
  ctx.fillStyle = css(p.ink, 0.9);
  ctx.fillRect(Math.round(x - 20 * s), Math.round(pata - 3 * s), Math.round(44 * s), Math.max(2, Math.round(6 * s)));
  // nohy (striedajú sa po krokoch)
  const l = krok % 2 ? 6 : -6;
  box(ctx, x - 12 * s + l * s * 0.3, pata - 34 * s, 9 * s, 34 * s, ink);
  box(ctx, x + 3 * s - l * s * 0.3, pata - 34 * s, 9 * s, 34 * s, ink);
  // tunika
  poly(
    ctx,
    [
      [x - 16 * s, pata - 34 * s],
      [x + 16 * s, pata - 34 * s],
      [x + 12 * s, pata - 80 * s],
      [x - 12 * s, pata - 80 * s],
    ],
    css(p.white),
    ink,
    Math.max(1, 3 * s),
  );
  // ruky
  box(ctx, x - 20 * s, pata - 78 * s + (krok % 2 ? 2 : 0) * s, 6 * s, 30 * s, css(p.white), ink, Math.max(1, 2 * s));
  box(ctx, x + 14 * s, pata - 78 * s + (krok % 2 ? 0 : 2) * s, 6 * s, 30 * s, css(p.white), ink, Math.max(1, 2 * s));
  // hlava (vlasy zozadu)
  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.arc(x, pata - 92 * s, 12 * s, 0, Math.PI * 2);
  ctx.fill();
  // čiapka s krížom
  box(ctx, x - 11 * s, pata - 108 * s, 22 * s, 9 * s, css(p.white), ink, Math.max(1, 2 * s));
  ctx.fillStyle = css(p.stamp);
  ctx.fillRect(Math.round(x - 1.5 * s), Math.round(pata - 107 * s), Math.max(1, Math.round(3 * s)), Math.max(1, Math.round(7 * s)));
  ctx.fillRect(Math.round(x - 3.5 * s), Math.round(pata - 105 * s), Math.max(1, Math.round(7 * s)), Math.max(1, Math.round(3 * s)));
}

/* ================================================================== F1 · chodba */

function chodba(ctx: C, t: number, snimka: number, p: Paleta) {
  const vx = 240;
  const vy = 112;
  const hw = 240; // polovica šírky chodby vo svete
  const strop = 112;
  const podlaha = 158;
  const zMax = 6.8;
  const pr = (X: number, Y: number, z: number): Bod => [vx + X / z, vy + Y / z];
  const ink = css(p.ink);
  const bl = pr(-hw, -strop, zMax);
  const br = pr(hw, -strop, zMax);
  const bbl = pr(-hw, podlaha, zMax);
  const bbr = pr(hw, podlaha, zMax);

  // strop, podlaha, steny
  poly(ctx, [[0, 0], [W, 0], br, bl], css(p.white));
  poly(ctx, [[0, H], [W, H], bbr, bbl], css(p.tien));
  bodky(ctx, [[0, H], [W, H], bbr, bbl], css(p.ink, 0.35), 7, 1);
  poly(ctx, [[0, 0], bl, bbl, [0, H]], css(p.paper));
  poly(ctx, [[W, 0], br, bbr, [W, H]], css(p.paper));
  bodky(ctx, [[W, 0], br, bbr, [W, H]], css(p.ink, 0.12), 9, 1);

  // jazda kamery dopredu: dlaždice, svetlá, dvere sa posúvajú k divákovi
  const faza = t * 2.4;
  const hlbka = (i: number, rozostup: number, pocet: number) => {
    const z = 1 + ((((i * rozostup - faza * rozostup * 1.6) % (rozostup * pocet)) + rozostup * pocet) % (rozostup * pocet));
    return z;
  };
  // priečne čiary podlahy
  ctx.strokeStyle = ink;
  ctx.lineWidth = 2;
  for (let i = 0; i < 10; i++) {
    const z = hlbka(i, 0.62, 10);
    if (z > zMax) continue;
    const [x1, y] = pr(-hw, podlaha, z);
    const [x2] = pr(hw, podlaha, z);
    ctx.beginPath();
    ctx.moveTo(Math.round(x1), Math.round(y) + 0.5);
    ctx.lineTo(Math.round(x2), Math.round(y) + 0.5);
    ctx.stroke();
  }
  // žltá navigačná čiara v strede podlahy (nemocnica)
  poly(ctx, [pr(-10, podlaha, 1), pr(10, podlaha, 1), pr(10, podlaha, zMax), pr(-10, podlaha, zMax)], css(p.yellow), ink, 1);

  // dvere na stenách
  for (let i = 0; i < 6; i++) {
    const z = hlbka(i, 1.05, 6);
    if (z > zMax - 0.6 || z < 1.02) continue;
    const z2 = z + 0.45;
    const strana = i % 2 ? 1 : -1;
    const dvere: Bod[] = [pr(strana * hw, -40, z), pr(strana * hw, -40, z2), pr(strana * hw, podlaha, z2), pr(strana * hw, podlaha, z)];
    poly(ctx, dvere, css(i % 3 === 0 ? p.yellow : p.white), ink, Math.max(1, 3 / z));
    // kríž nad dverami
    if (i % 3 === 1) {
      const [kx, ky] = pr(strana * hw, -70, z + 0.22);
      const k = 14 / z;
      ctx.fillStyle = css(p.stamp);
      ctx.fillRect(Math.round(kx - k / 6), Math.round(ky - k / 2), Math.max(1, Math.round(k / 3)), Math.max(1, Math.round(k)));
      ctx.fillRect(Math.round(kx - k / 2), Math.round(ky - k / 6), Math.max(1, Math.round(k)), Math.max(1, Math.round(k / 3)));
    }
  }
  // svetlá na strope
  for (let i = 0; i < 7; i++) {
    const z = hlbka(i, 0.9, 7);
    if (z > zMax) continue;
    const [lx, ly] = pr(-60, -strop + 2, z);
    const [rx] = pr(60, -strop + 2, z);
    const h = Math.max(1, 12 / z);
    box(ctx, lx, ly, rx - lx, h, css(p.yellow), ink, Math.max(1, 2.4 / z));
  }

  // zadná stena: tma a žlté dvere na konci chodby (tam sestra odchádza)
  poly(ctx, [bl, br, bbr, bbl], ink);
  const dvW = (bbr[0] - bbl[0]) * 0.34;
  const dvH = (bbl[1] - bl[1]) * 0.78;
  box(ctx, vx - dvW / 2, bbl[1] - dvH, dvW, dvH, css(p.yellow));

  // obrysy chodby
  ctx.strokeStyle = ink;
  ctx.lineWidth = 3;
  for (const [a, b] of [
    [[0, 0], bl],
    [[W, 0], br],
    [[0, H], bbl],
    [[W, H], bbr],
  ] as [Bod, Bod][]) {
    ctx.beginPath();
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.stroke();
  }

  // sestra odchádza k dverám
  const zn = 1.5 + t * 4.4;
  const [sx, sy] = pr(24 - t * 24, podlaha, zn);
  sestra(ctx, sx, sy, 150 / zn, Math.floor(snimka / 4), p);
}

/* ================================================================== F2 · dvere so zmenenou smenou */

function dvere(ctx: C, t: number, snimka: number, p: Paleta, font: string) {
  const ink = css(p.ink);
  const f = Math.round(t * 119);
  // stena a podlaha
  ctx.fillStyle = css(p.paper);
  ctx.fillRect(0, 0, W, H);
  bodky(ctx, [[0, 0], [W, 0], [W, 232], [0, 232]], css(p.ink, 0.1), 8, 1);
  box(ctx, 0, 232, W, H - 232, css(p.tien));
  ctx.fillStyle = ink;
  ctx.fillRect(0, 230, W, 3);

  const dx = 170;
  const dy = 38;
  const dw = 140;
  const dh = 194;
  // za dverami: žlté svetlo a obrysy monitorov (dielňa)
  box(ctx, dx, dy, dw, dh, css(p.yellow));
  ctx.fillStyle = ink;
  for (let i = 0; i < 3; i++) ctx.fillRect(dx + 14 + i * 42, dy + 96, 32, 24);
  ctx.fillRect(dx + 8, dy + 124, dw - 16, 4);

  // otvorenie dverí: panel sa zužuje po schodoch (od snímky 78)
  const otvor = f < 78 ? 0 : Math.min(1, Math.floor((f - 78) / 4) / 9);
  const pw = Math.max(6, Math.round(dw * (1 - otvor * 0.86)));
  // svetlo na podlahe
  if (otvor > 0) {
    poly(ctx, [[dx + pw, dy + dh], [dx + dw, dy + dh], [dx + dw + 90 * otvor, H], [dx + pw - 20 * otvor, H]], css(p.yellow));
  }
  // panel dverí
  box(ctx, dx, dy, pw, dh, css(p.white), ink, 3);
  if (pw > 40) {
    // okienko
    box(ctx, dx + 16, dy + 18, pw - 32, 36, css(p.yellow), ink, 3);
    ctx.fillStyle = ink;
    ctx.fillRect(dx + 16 + Math.round((pw - 32) / 2) - 1, dy + 18, 3, 36);
    // kľučka
    box(ctx, dx + pw - 22, dy + 108, 14, 6, ink);
    // tabuľka
    const tx = dx + 12;
    const tw = pw - 24;
    box(ctx, tx, dy + 66, tw, 34, css(p.white), ink, 2);
    ctx.save();
    ctx.beginPath();
    ctx.rect(tx, dy + 60, tw, 44);
    ctx.clip();
    ctx.fillStyle = ink;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.font = `700 7px ${font}`;
    ctx.fillText('SMENA', tx + tw / 2, dy + 73);
    ctx.font = `800 13px ${font}`;
    ctx.fillText('NEMOCNICA', tx + tw / 2, dy + 88);
    // prečiarknutie (alarm) rastie po schodoch
    if (f >= 30) {
      const k = Math.min(1, Math.floor((f - 30) / 3) / 6);
      ctx.fillStyle = css(p.stamp);
      ctx.fillRect(tx + 6, dy + 87, Math.round((tw - 12) * k), 3);
    }
    // nálepka novej smeny dopadne
    if (f >= 52) {
      const zoom = f < 54 ? 1.6 : f < 56 ? 1.2 : 1;
      ctx.save();
      ctx.translate(tx + tw / 2, dy + 84);
      ctx.rotate(-0.08);
      ctx.scale(zoom, zoom);
      box(ctx, -44, -12, 88, 24, css(p.ink), undefined, 0);
      box(ctx, -47, -15, 88, 24, css(p.yellow), ink, 2);
      ctx.fillStyle = ink;
      ctx.font = `800 13px ${font}`;
      ctx.fillText('DIELŇA', -3, -2);
      ctx.restore();
    }
    ctx.restore();
  }
  // zárubňa
  ctx.strokeStyle = ink;
  ctx.lineWidth = 5;
  ctx.strokeRect(dx - 2.5, dy - 2.5, dw + 5, dh + 3);

  // hodiny na stene: ručičky skáču po schodoch
  const hx = 84;
  const hy = 74;
  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.arc(hx + 3, hy + 3, 30, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = css(p.white);
  ctx.beginPath();
  ctx.arc(hx, hy, 30, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 3;
  ctx.stroke();
  const min = (Math.floor(snimka / 6) % 12) * (Math.PI / 6) - Math.PI / 2;
  const hod = (Math.floor(snimka / 72) % 12) * (Math.PI / 6) + 1.2;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(hx, hy);
  ctx.lineTo(hx + Math.cos(min) * 22, hy + Math.sin(min) * 22);
  ctx.moveTo(hx, hy);
  ctx.lineTo(hx + Math.cos(hod) * 14, hy + Math.sin(hod) * 14);
  ctx.stroke();

  // rozpis smien na stene (papier s riadkami)
  box(ctx, 360, 60, 74, 96, css(p.white), ink, 2, ink, 3);
  ctx.fillStyle = ink;
  for (let i = 0; i < 7; i++) ctx.fillRect(368, 74 + i * 11, i === 3 ? 30 : 56, 3);
  ctx.fillStyle = css(p.stamp);
  ctx.fillRect(366, 105, 62, 3);
}

/* ================================================================== F3 · dielňa */

function agent(ctx: C, x: number, pata: number, farba: string, p: Paleta, nesie: boolean) {
  const ink = css(p.ink);
  // tieň
  ctx.fillStyle = ink;
  ctx.fillRect(Math.round(x - 14), pata - 2, 32, 4);
  // telo
  box(ctx, x - 12, pata - 26, 24, 24, ink);
  // hlava
  box(ctx, x - 14, pata - 50, 28, 22, farba, ink, 3, ink, 3);
  ctx.fillStyle = ink;
  ctx.fillRect(x - 7, pata - 42, 4, 5);
  ctx.fillRect(x + 3, pata - 42, 4, 5);
  // anténa
  ctx.fillRect(x - 1, pata - 58, 3, 8);
  ctx.fillStyle = css(p.stamp);
  ctx.fillRect(x - 3, pata - 62, 7, 5);
  if (nesie) box(ctx, x - 16, pata - 76, 32, 12, css(p.white), ink, 2);
}

function dielna(ctx: C, t: number, snimka: number, p: Paleta) {
  const ink = css(p.ink);
  ctx.save();
  // pomalé priblíženie kamery (dolly), po schodoch každé 3 snímky
  const s = 1 + Math.floor(t * 40) / 400;
  ctx.translate(W / 2, H / 2);
  ctx.scale(s, s);
  ctx.translate(-W / 2, -H / 2);

  // stena s nástenkou papierov
  ctx.fillStyle = css(p.paper);
  ctx.fillRect(-20, -20, W + 40, H + 40);
  bodky(ctx, [[-20, -20], [W + 20, -20], [W + 20, 150], [-20, 150]], css(p.ink, 0.1), 8, 1);
  for (let i = 0; i < 7; i++) {
    const x = 18 + i * 66;
    const y = 18 + (i % 2) * 14;
    box(ctx, x, y, 46, 58, css(i === 2 ? p.yellow : p.white), ink, 2, ink, 3);
    ctx.fillStyle = ink;
    for (let r = 0; r < 4; r++) ctx.fillRect(x + 7, y + 12 + r * 10, r === 3 ? 18 : 32, 3);
    ctx.fillStyle = css(p.stamp);
    ctx.fillRect(x + 20, y - 3, 6, 6);
  }

  // stôl
  box(ctx, 20, 176, 440, 12, css(p.white), ink, 3, ink, 4);
  ctx.fillStyle = ink;
  ctx.fillRect(40, 188, 8, 50);
  ctx.fillRect(432, 188, 8, 50);
  // podlaha
  box(ctx, -20, 236, W + 40, 60, css(p.tien));
  bodky(ctx, [[-20, 236], [W + 20, 236], [W + 20, H + 20], [-20, H + 20]], css(p.ink, 0.35), 7, 1);
  ctx.fillRect(-20, 234, W + 40, 3);

  // tri monitory
  const mon = [60, 190, 320];
  mon.forEach((mx, i) => {
    box(ctx, mx + 36, 162, 28, 14, ink);
    box(ctx, mx, 88, 100, 74, ink, undefined, 0, ink, 4);
    box(ctx, mx + 6, 94, 88, 62, css(p.ink));
    ctx.save();
    ctx.beginPath();
    ctx.rect(mx + 6, 94, 88, 62);
    ctx.clip();
    if (i === 0) {
      // EKG po schodoch
      ctx.strokeStyle = css(p.yellow);
      ctx.lineWidth = 2;
      ctx.beginPath();
      const posun = (Math.floor(snimka / 2) * 3) % 60;
      for (let x = -60; x <= 100; x += 2) {
        const f = (((x + posun) % 60) + 60) % 60;
        let y = 128;
        if (f > 24 && f < 27) y = 136;
        else if (f >= 27 && f < 31) y = 104;
        else if (f >= 31 && f < 34) y = 140;
        else if (f > 40 && f < 48) y = 124;
        const px = mx + 6 + x;
        x === -60 ? ctx.moveTo(px, y) : ctx.lineTo(px, y);
      }
      ctx.stroke();
    } else if (i === 1) {
      // stĺpce rastú po snímkach
      for (let b = 0; b < 6; b++) {
        const h = Math.min(50, 8 + ((b * 7 + Math.floor(snimka / 5) * (b + 1)) % 44));
        ctx.fillStyle = css(b === 5 ? p.stamp : p.yellow);
        ctx.fillRect(mx + 12 + b * 14, 150 - h, 10, h);
      }
    } else {
      // riadky textu sa píšu
      const riadky = Math.floor(snimka / 6) % 9;
      ctx.fillStyle = css(p.white);
      for (let r = 0; r < riadky; r++) ctx.fillRect(mx + 12, 100 + r * 6, r % 3 === 2 ? 40 : 70, 3);
      if (Math.floor(snimka / 6) % 2) {
        ctx.fillStyle = css(p.yellow);
        ctx.fillRect(mx + 12, 100 + riadky * 6, 6, 4);
      }
    }
    ctx.restore();
  });
  // stohy papierov na stole
  for (let i = 0; i < 3; i++) box(ctx, 170 + i * 4, 168 - i * 4, 22, 6, css(p.white), ink, 1.5);

  // agenti: skáču medzi stanicami po schodoch (každých 6 snímok)
  const skok = Math.floor(snimka / 6);
  const trasa = [36, 120, 250, 380, 440, 300, 170, 90];
  const farby = [p.yellow, p.white, p.yellow, p.white];
  for (let a = 0; a < 4; a++) {
    const k = skok + a * 5;
    const i = Math.floor(k / 8) % trasa.length;
    const j = (i + 1) % trasa.length;
    const u = (k % 8) / 8;
    const x = Math.round(trasa[i]! + (trasa[j]! - trasa[i]!) * u);
    const hop = k % 2 ? 3 : 0;
    agent(ctx, x, 262 - hop, css(farby[a]!), p, a % 2 === 0 && u < 0.5);
  }
  ctx.restore();
}

/* ================================================================== zmrazenie na strihu */

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);

/** 1-bit dither celej snímky (ink / žltá): zmrazený filmový pás na tvrdom strihu. */
export function zmraz(ctx: C, p: Paleta) {
  const img = ctx.getImageData(0, 0, W, H);
  const d = img.data;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const l = (0.299 * d[i]! + 0.587 * d[i + 1]! + 0.114 * d[i + 2]!) / 255;
      const c = l > BAYER[(y % 4) * 4 + (x % 4)]! * 0.9 + 0.08 ? p.yellow : p.ink;
      d[i] = c[0];
      d[i + 1] = c[1];
      d[i + 2] = c[2];
    }
  ctx.putImageData(img, 0, 0);
}

/** Nakreslí snímku `snimka` (0 … 359) do malého plátna. */
export function kresli(ctx: C, snimka: number, p: Paleta, font: string, zmrazene = false) {
  const zaber = Math.min(2, Math.floor(snimka / 120));
  const lok = snimka - zaber * 120;
  const t = lok / 119;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  if (zaber === 0) chodba(ctx, t, snimka, p);
  else if (zaber === 1) dvere(ctx, t, snimka, p, font);
  else dielna(ctx, t, snimka, p);
  zrno(ctx, snimka, css(p.ink, 0.5));
  ctx.restore();
  if (zmrazene) zmraz(ctx, p);
}
