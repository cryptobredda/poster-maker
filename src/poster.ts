import { Resvg, initWasm } from '@resvg/resvg-wasm';
import UPNG from 'upng-js';
import type { PrayerTime } from './api';
import { TEMPLATE_CONFIG } from './template-config';
import resvgWasm from './resvg.wasm';
import posterPng from './poster.png';
import fontPaths from './font-paths.json';

let wasmInitialized = false;

interface DecodedPoster {
  rgba: Uint8Array;
  width: number;
  height: number;
}

let cachedPoster: DecodedPoster | null = null;

async function initResvg() {
  if (wasmInitialized) return;
  const wasmInput = await resvgWasm;
  await initWasm(wasmInput as any);
  wasmInitialized = true;
}

function decodePoster(): DecodedPoster {
  if (cachedPoster) return cachedPoster;
  const posterBytes = toBytes(posterPng as any);
  const posterImg = (UPNG as any).decode(posterBytes as any);
  const posterRgba = new Uint8Array((UPNG as any).toRGBA8(posterImg)[0]);
  cachedPoster = { rgba: posterRgba, width: posterImg.width, height: posterImg.height };
  return cachedPoster;
}

function crc32(data: Uint8Array): number {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function encodePNG(rgba: Uint8Array, width: number, height: number): Uint8Array {
  const rowBytes = 1 + width * 4;
  const rawLen = height * rowBytes;

  const raw = new Uint8Array(rawLen);
  for (let y = 0; y < height; y++) {
    const srcOff = y * width * 4;
    raw[y * rowBytes] = 0;
    raw.set(rgba.subarray(srcOff, srcOff + width * 4), y * rowBytes + 1);
  }

  let a = 1, b = 0;
  for (let i = 0; i < raw.length; i++) {
    a = (a + raw[i]) % 65521;
    b = (b + a) % 65521;
  }

  const numBlocks = Math.ceil(rawLen / 65535);
  const zlibLen = 2 + rawLen + numBlocks * 5 + 4;
  const zlib = new Uint8Array(zlibLen);
  let p = 0;
  zlib[p++] = 0x78;
  zlib[p++] = 0x01;
  let rOff = 0;
  while (rOff < rawLen) {
    const remaining = rawLen - rOff;
    const blockLen = Math.min(remaining, 65535);
    zlib[p++] = blockLen === remaining ? 0x01 : 0x00;
    zlib[p++] = blockLen & 0xFF;
    zlib[p++] = (blockLen >> 8) & 0xFF;
    zlib[p++] = ~blockLen & 0xFF;
    zlib[p++] = (~blockLen >> 8) & 0xFF;
    zlib.set(raw.subarray(rOff, rOff + blockLen), p);
    p += blockLen;
    rOff += blockLen;
  }
  zlib[p++] = (b >> 8) & 0xFF;
  zlib[p++] = b & 0xFF;
  zlib[p++] = (a >> 8) & 0xFF;
  zlib[p++] = a & 0xFF;
  const zlibFinal = zlib.subarray(0, p);

  function chunk(type: string, data: Uint8Array): Uint8Array {
    const len = data.length;
    const out = new Uint8Array(12 + len);
    const dv = new DataView(out.buffer);
    dv.setUint32(0, len);
    const typeBytes = new Uint8Array(4);
    for (let i = 0; i < 4; i++) typeBytes[i] = type.charCodeAt(i);
    out.set(typeBytes, 4);
    out.set(data, 8);
    const crcInput = new Uint8Array(4 + len);
    crcInput.set(typeBytes, 0);
    crcInput.set(data, 4);
    dv.setUint32(8 + len, crc32(crcInput));
    return out;
  }

  const ihdr = new Uint8Array(13);
  const dv = new DataView(ihdr.buffer);
  dv.setUint32(0, width);
  dv.setUint32(4, height);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const sig = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrChunk = chunk('IHDR', ihdr);
  const idatChunk = chunk('IDAT', zlibFinal);
  const iendChunk = chunk('IEND', new Uint8Array(0));

  const total = sig.length + ihdrChunk.length + idatChunk.length + iendChunk.length;
  const out = new Uint8Array(total);
  let off = 0;
  out.set(sig, off); off += sig.length;
  out.set(ihdrChunk, off); off += ihdrChunk.length;
  out.set(idatChunk, off); off += idatChunk.length;
  out.set(iendChunk, off); off += iendChunk.length;
  return out;
}

function toBytes(input: string | ArrayBuffer | Uint8Array): Uint8Array {
  if (input instanceof Uint8Array) return input;
  if (input instanceof ArrayBuffer) return new Uint8Array(input);
  if (typeof input === 'string') {
    const base64 = input.startsWith('data:') ? input.split(',')[1] : input;
    const bin = atob(base64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }
  return new Uint8Array(0);
}

const C = {
  maroon: '#2d0a1f',
  maroonLight: '#3d0f2f',
  gold: '#c9a227',
  goldDark: '#b8860b',
  cream: '#faf8f3',
  creamAlt: '#f0ebe0',
  text: '#1a1a2e',
  white: '#ffffff',
  border: '#e0d5c0',
};

const COL = {
  date:    { x: 0,   w: 36 },
  day:     { x: 36,  w: 36 },
  islamic: { x: 72,  w: 70 },
  fajrS:   { x: 142, w: 48 },
  fajrJ:   { x: 190, w: 48 },
  sunrise: { x: 238, w: 48 },
  dhuhrS:  { x: 286, w: 48 },
  dhuhrJ:  { x: 334, w: 48 },
  asrS:    { x: 382, w: 48 },
  asrJ:    { x: 430, w: 48 },
  maghrib: { x: 478, w: 56 },
  ishaJ:   { x: 534, w: 56 },
};

const TABLE_W = 590;
const H1 = 20;
const H2 = 14;
const HEADER_H = H1 + H2;
const ROW_H = 16;

interface SubCol { label: string; x: number; w: number }

interface PrayerGroupDef {
  name: string;
  x: number;
  w: number;
  subs: SubCol[];
  headerSub?: string;
}

const PRAYER_GROUPS: PrayerGroupDef[] = [
  { name: 'FAJR', x: COL.fajrS.x, w: COL.fajrS.w + COL.fajrJ.w + COL.sunrise.w, subs: [
    { label: 'START', x: COL.fajrS.x, w: COL.fajrS.w },
    { label: 'JAMAT', x: COL.fajrJ.x, w: COL.fajrJ.w },
    { label: 'SUNRISE', x: COL.sunrise.x, w: COL.sunrise.w }
  ]},
  { name: 'DHUHR', x: COL.dhuhrS.x, w: COL.dhuhrS.w + COL.dhuhrJ.w, subs: [
    { label: 'START', x: COL.dhuhrS.x, w: COL.dhuhrS.w },
    { label: 'JAMAT', x: COL.dhuhrJ.x, w: COL.dhuhrJ.w }
  ]},
  { name: 'ASR', x: COL.asrS.x, w: COL.asrS.w + COL.asrJ.w, subs: [
    { label: 'START', x: COL.asrS.x, w: COL.asrS.w },
    { label: 'JAMAT', x: COL.asrJ.x, w: COL.asrJ.w }
  ]},
  { name: 'MAGHRIB', x: COL.maghrib.x, w: COL.maghrib.w, subs: [
    { label: 'JAMAT', x: COL.maghrib.x, w: COL.maghrib.w }
  ]},
  { name: 'ISHA', x: COL.ishaJ.x, w: COL.ishaJ.w, subs: [
    { label: 'JAMAT', x: COL.ishaJ.x, w: COL.ishaJ.w }
  ]},
];

const DATA_CELLS: { col: typeof COL.date; key: keyof PrayerTime; bold?: boolean }[] = [
  { col: COL.fajrS, key: 'fajrStart' },
  { col: COL.fajrJ, key: 'fajrJamat', bold: true },
  { col: COL.sunrise, key: 'sunrise' },
  { col: COL.dhuhrS, key: 'dhuhrStart' },
  { col: COL.dhuhrJ, key: 'dhuhrJamat', bold: true },
  { col: COL.asrS, key: 'asrStart' },
  { col: COL.asrJ, key: 'asrJamat', bold: true },
  { col: COL.maghrib, key: 'maghribJamat', bold: true },
  { col: COL.ishaJ, key: 'ishaJamat', bold: true },
];

const FONTS = fontPaths as any;

function getGlyphPaths(char: string, font: any): any | null {
  if (char === ' ') return null;
  const glyph = font[char];
  if (!glyph || glyph === null) {
    const upper = char.toUpperCase();
    if (font[upper] && font[upper] !== null) return font[upper];
    return null;
  }
  return glyph;
}

function svgText(
  text: string,
  x: number,
  y: number,
  fontSize: number,
  fill: string,
  font: any,
  anchor: 'left' | 'middle' | 'right' = 'left',
): string {
  const meta = font._meta;
  if (!meta) return '';
  const scale = fontSize / meta.unitsPerEm;

  const advances: number[] = [];
  let totalWidth = 0;
  for (const char of text) {
    const glyph = getGlyphPaths(char, font);
    let adv: number;
    if (glyph && glyph.aw) {
      adv = glyph.aw * scale;
    } else if (char === ' ') {
      adv = fontSize * 0.25;
    } else if (glyph) {
      adv = (glyph.x2 - glyph.x1) * scale;
    } else {
      adv = fontSize * 0.3;
    }
    advances.push(adv);
    totalWidth += adv;
  }

  let offsetX = 0;
  if (anchor === 'middle') offsetX = -totalWidth / 2;
  else if (anchor === 'right') offsetX = -totalWidth;

  const baselineOffset = ((meta.ascender - Math.abs(meta.descender)) / 2) * scale;

  const paths: string[] = [];
  let cursorX = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const glyph = getGlyphPaths(char, font);
    if (glyph && glyph.d) {
      const tx = (x + offsetX + cursorX).toFixed(2);
      const ty = (y + baselineOffset).toFixed(2);
      paths.push(`<path d="${glyph.d}" transform="translate(${tx},${ty}) scale(${scale.toFixed(6)},${(-scale).toFixed(6)})" fill="${fill}"/>`);
    } else if (char === '"') {
      // Draw a double-quote as two vertical strokes in font units
      const tx = (x + offsetX + cursorX).toFixed(2);
      const ty = (y + baselineOffset).toFixed(2);
      const upm = meta.unitsPerEm || 1000;
      const h = upm * 0.35;
      const w = upm * 0.06;
      const gap = upm * 0.14;
      const d = `M${w/2},${-h} L${w/2},0 M${gap+w/2},${-h} L${gap+w/2},0`;
      paths.push(`<path d="${d}" transform="translate(${tx},${ty}) scale(${scale.toFixed(6)},${(-scale).toFixed(6)})" fill="none" stroke="${fill}" stroke-width="${(upm*0.04).toFixed(1)}" stroke-linecap="round"/>`);
    }
    cursorX += advances[i];
  }
  return paths.join('\n');
}

function el(tag: string, attrs: Record<string, string | number | undefined>, children?: string): string {
  const attrStr = Object.entries(attrs)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}="${v}"`)
    .join(' ');
  if (children) return `<${tag} ${attrStr}>${children}</${tag}>`;
  return `<${tag} ${attrStr}/>`;
}

function getCellValue(current: string, previous: string | null, key: string): string {
  if (previous !== null && current === previous && key.endsWith('Jamat')) {
    return '" "';
  }
  return current;
}

function getIslamicDateCell(t: PrayerTime, prevT: PrayerTime | null): { text: string; fontSize: number } {
  if (prevT && t.hijriMonth !== prevT.hijriMonth) {
    const monthName = t.hijriMonth.toUpperCase();
    // Use smaller font for longer month names
    const fontSize = monthName.length > 8 ? 5.5 : 7;
    return { text: monthName, fontSize };
  }
  return { text: t.hijriDay, fontSize: 7 };
}

function buildTable(times: PrayerTime[], monthName: string): string {
  const f = FONTS.inter;
  const p: string[] = [];
  const tableH = HEADER_H + times.length * ROW_H;

  // Determine Islamic month for header
  const islamicMonthHeader = times[0]?.hijriMonthEn?.toUpperCase() || '';

  p.push(el('rect', { x: 0, y: 0, width: TABLE_W, height: tableH, fill: C.cream, stroke: C.maroon, 'stroke-width': 2, rx: 4 }));
  p.push(`<clipPath id="tc"><rect x="1" y="1" width="${TABLE_W - 2}" height="${tableH - 2}" rx="3"/></clipPath>`);
  p.push('<g clip-path="url(#tc)">');
  p.push(el('rect', { x: 0, y: 0, width: TABLE_W, height: HEADER_H, fill: C.maroon }));

  const prayerX = COL.fajrS.x;
  const prayerW = COL.ishaJ.x + COL.ishaJ.w - prayerX;
  p.push(el('rect', { x: prayerX, y: H1, width: prayerW, height: H2, fill: C.maroonLight }));

  p.push(svgText(monthName, (COL.date.x + COL.day.x + COL.day.w) / 2, H1 / 2, 8, C.white, f.regular, 'middle'));

  const dateDayX = COL.date.x + (COL.day.x + COL.day.w - COL.date.x) / 2;
  p.push(el('rect', { x: COL.date.x, y: H1, width: COL.day.x + COL.day.w - COL.date.x, height: H2, fill: C.maroonLight }));
  p.push(svgText('DATE', COL.date.x + COL.date.w / 2, H1 + H2 / 2, 6, C.gold, f.bold, 'middle'));
  p.push(svgText('DAY', COL.day.x + COL.day.w / 2, H1 + H2 / 2, 6, C.gold, f.bold, 'middle'));

  // Islamic date column header
  p.push(el('rect', { x: COL.islamic.x, y: H1, width: COL.islamic.w, height: H2, fill: C.maroonLight }));
  p.push(svgText(islamicMonthHeader, COL.islamic.x + COL.islamic.w / 2, H1 + H2 / 2, 5.5, C.gold, f.bold, 'middle'));

  for (const g of PRAYER_GROUPS) {
    const cx = g.x + g.w / 2;
    if (g.headerSub) {
      p.push(svgText(g.name, cx, H1 * 0.36, 8, C.white, f.regular, 'middle'));
      p.push(svgText(g.headerSub, cx, H1 * 0.76, 5.5, C.white, f.regular, 'middle'));
    } else {
      p.push(svgText(g.name, cx, H1 / 2, 8, C.white, f.bold, 'middle'));
    }
  }

  for (const g of PRAYER_GROUPS) {
    for (const sc of g.subs) {
      if (sc.label) {
        p.push(svgText(sc.label, sc.x + sc.w / 2, H1 + H2 / 2, 6, C.gold, f.bold, 'middle'));
      }
    }
  }

  for (let i = 0; i < times.length; i++) {
    const t = times[i];
    const prevT = i > 0 ? times[i - 1] : null;
    const isFri = t.dayName === 'FRI';
    const bg = isFri ? C.maroon : (i % 2 === 0 ? C.cream : C.creamAlt);
    const dateC = isFri ? C.gold : C.text;
    const dayC = isFri ? C.gold : C.text;
    const islamicC = isFri ? C.gold : C.text;
    const timeC = isFri ? C.white : C.text;
    const maghribC = isFri ? C.gold : C.goldDark;
    const font = isFri ? f.bold : f.regular;

    const ry = HEADER_H + i * ROW_H;

    p.push(el('rect', { x: 0, y: ry, width: TABLE_W, height: ROW_H, fill: bg }));
    p.push(el('line', { x1: 0, y1: ry + ROW_H, x2: TABLE_W, y2: ry + ROW_H, stroke: C.border, 'stroke-width': 0.5 }));

    p.push(svgText(String(t.dayNumber), COL.date.x + 8, ry + ROW_H / 2, 7, dateC, f.bold, 'left'));
    p.push(svgText(t.dayName, COL.day.x + COL.day.w / 2, ry + ROW_H / 2, 7, dayC, font, 'middle'));

    // Islamic date
    const islamicVal = getIslamicDateCell(t, prevT);
    p.push(svgText(islamicVal.text, COL.islamic.x + COL.islamic.w / 2, ry + ROW_H / 2, islamicVal.fontSize, islamicC, font, 'middle'));

    for (const dc of DATA_CELLS) {
      const prevVal = prevT ? String(prevT[dc.key] || '') : null;
      const val = getCellValue(String(t[dc.key] || ''), prevVal, dc.key);
      if (!val) continue;
      const colFill = dc.key === 'maghribJamat' ? maghribC : timeC;
      p.push(svgText(val, dc.col.x + dc.col.w / 2, ry + ROW_H / 2, 7, colFill, dc.bold ? f.bold : font, 'middle'));
    }
  }

  p.push('</g>');
  return p.join('\n');
}

function compositeRgba(
  dst: Uint8Array, dstW: number, dstH: number,
  src: Uint8Array, srcW: number, srcH: number,
  ox: number, oy: number,
): void {
  for (let sy = 0; sy < srcH; sy++) {
    const dy = oy + sy;
    if (dy < 0 || dy >= dstH) continue;
    const dstRowStart = dy * dstW * 4;
    const srcRowStart = sy * srcW * 4;
    for (let sx = 0; sx < srcW; sx++) {
      const dx = ox + sx;
      if (dx < 0 || dx >= dstW) continue;
      const si = srcRowStart + sx * 4;
      const di = dstRowStart + dx * 4;
      const sa = src[si + 3];
      if (sa === 0) continue;
      const sr = src[si], sg = src[si + 1], sb = src[si + 2];
      const da = dst[di + 3];
      const dr = dst[di], dg = dst[di + 1], db = dst[di + 2];
      const saF = sa / 255;
      const daF = da / 255;
      const outA = saF + daF * (1 - saF);
      if (outA === 0) continue;
      dst[di] = Math.round((sr * saF + dr * daF * (1 - saF)) / outA);
      dst[di + 1] = Math.round((sg * saF + dg * daF * (1 - saF)) / outA);
      dst[di + 2] = Math.round((sb * saF + db * daF * (1 - saF)) / outA);
      dst[di + 3] = Math.round(outA * 255);
    }
  }
}

function drawRect(
  buf: Uint8Array, bufW: number, bufH: number,
  rx: number, ry: number, rw: number, rh: number,
  r: number, g: number, b: number, a: number,
): void {
  for (let y = ry; y < ry + rh && y < bufH; y++) {
    for (let x = rx; x < rx + rw && x < bufW; x++) {
      const i = (y * bufW + x) * 4;
      const srcA = a / 255;
      const dstA = buf[i + 3] / 255;
      const outA = srcA + dstA * (1 - srcA);
      if (outA === 0) continue;
      buf[i] = Math.round((r * srcA + buf[i] * dstA * (1 - srcA)) / outA);
      buf[i + 1] = Math.round((g * srcA + buf[i + 1] * dstA * (1 - srcA)) / outA);
      buf[i + 2] = Math.round((b * srcA + buf[i + 2] * dstA * (1 - srcA)) / outA);
      buf[i + 3] = Math.round(outA * 255);
    }
  }
}

export async function buildTableSvg(times: PrayerTime[], monthLabel: string): Promise<string> {
  const tableH = HEADER_H + times.length * ROW_H;
  const content = buildTable(times, monthLabel);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${TABLE_W}" height="${tableH}" viewBox="0 0 ${TABLE_W} ${tableH}">${content}</svg>`;
}

export async function renderTablePng(): Promise<Uint8Array> {
  await initResvg();
  const f = FONTS.inter;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="200" viewBox="0 0 600 200"><rect x="0" y="0" width="600" height="200" fill="#2d0a1f"/>${svgText('INTER BOLD 24', 300, 50, 24, '#ffffff', f.bold, 'middle')}${svgText('inter regular 16', 300, 100, 16, '#c9a227', f.regular, 'middle')}${svgText('5:30 12:45', 300, 150, 12, '#ffffff', f.regular, 'middle')}</svg>`;
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 600 } });
  const pixmap = resvg.render();
  const rgba = new Uint8Array(pixmap.pixels as any);
  return encodePNG(rgba, pixmap.width, pixmap.height);
}

function buildTitleSvg(titleText: string, fontSize: number): string {
  const f = FONTS.inter;
  const titleW = 600;
  const titleH = 40;
  const svg = svgText(titleText, 0, titleH / 2, fontSize, C.gold, f.bold, 'left');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${titleW}" height="${titleH}" viewBox="0 0 ${titleW} ${titleH}">${svg}</svg>`;
}

export async function generatePoster(
  times: PrayerTime[],
  year: number,
  monthLabel: string,
  titleText: string,
  _preferSvg = false,
): Promise<{ format: 'png'; data: Uint8Array }> {
  await initResvg();
  const poster = decodePoster();

  const { tableArea } = TEMPLATE_CONFIG;
  const tableH = HEADER_H + times.length * ROW_H;
  const tableContent = buildTable(times, monthLabel);
  const scaledW = Math.ceil(tableArea.width);

  const tableSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${TABLE_W}" height="${tableH}" viewBox="0 0 ${TABLE_W} ${tableH}">${tableContent}</svg>`;
  const resvg = new Resvg(tableSvg, { fitTo: { mode: 'width', value: scaledW } });
  const pixmap = resvg.render();
  const tableRgba = new Uint8Array(pixmap.pixels as any);

  const outRgba = new Uint8Array(poster.rgba);
  compositeRgba(outRgba, poster.width, poster.height, tableRgba, pixmap.width, pixmap.height, tableArea.x, tableArea.y);

  // Render and composite title
  if (titleText) {
    const titlePos = TEMPLATE_CONFIG.titlePosition;
    const titleSvg = buildTitleSvg(titleText, titlePos.fontSize);
    const titleResvg = new Resvg(titleSvg, { fitTo: { mode: 'width', value: 600 } });
    const titlePixmap = titleResvg.render();
    const titleRgba = new Uint8Array(titlePixmap.pixels as any);
    compositeRgba(outRgba, poster.width, poster.height, titleRgba, titlePixmap.width, titlePixmap.height, titlePos.x, titlePos.y);
  }

  const resultPng = encodePNG(outRgba, poster.width, poster.height);
  return { format: 'png', data: resultPng };
}

export async function generateTemplatePreview(): Promise<{ format: 'png'; data: Uint8Array }> {
  const poster = decodePoster();

  const { tableArea } = TEMPLATE_CONFIG;
  const outRgba = new Uint8Array(poster.rgba);

  drawRect(outRgba, poster.width, poster.height,
    tableArea.x, tableArea.y, tableArea.width, 480,
    255, 255, 255, 200);

  const resultPng = encodePNG(outRgba, poster.width, poster.height);
  return { format: 'png', data: resultPng };
}