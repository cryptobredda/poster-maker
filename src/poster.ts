import { Resvg, initWasm } from '@resvg/resvg-wasm';
import UPNG from 'upng-js';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { PrayerTime } from './api';
import { TEMPLATE_CONFIG } from './template-config';
import fontPaths from './font-paths.json';
import type { SheetColorScheme, SheetConfig, SheetGrid, SheetMerge } from './sheets';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadAsset(name: string): Uint8Array {
  return readFileSync(resolve(__dirname, name));
}

let wasmInitialized = false;

interface DecodedPoster {
  rgba: Uint8Array;
  width: number;
  height: number;
}

let cachedPoster: DecodedPoster | null = null;
let cachedWasm: Uint8Array | null = null;

async function initResvg() {
  if (wasmInitialized) return;
  if (!cachedWasm) cachedWasm = loadAsset('resvg.wasm');
  await initWasm(cachedWasm);
  wasmInitialized = true;
}

function decodePoster(): DecodedPoster {
  if (cachedPoster) return cachedPoster;
  const posterBytes = loadAsset('poster.png');
  const posterImg = (UPNG as any).decode(posterBytes);
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

interface ColorScheme {
  maroon: string;
  maroonLight: string;
  gold: string;
  goldDark: string;
  headerText: string;
  cream: string;
  creamAlt: string;
  text: string;
  white: string;
  border: string;
}

const DEFAULT_COLORS: ColorScheme = {
  maroon: '#62121b',
  maroonLight: '#62121b',
  gold: '#c9a227',
  goldDark: '#62121b',
  headerText: '#ffffff',
  cream: '#ffffff',
  creamAlt: '#e8e8e8',
  text: '#62121b',
  white: '#ffffff',
  border: '#000000',
};

function buildColors(scheme?: SheetColorScheme): ColorScheme {
  if (!scheme) return DEFAULT_COLORS;
  return {
    maroon: scheme.headerBg,
    maroonLight: scheme.headerBg,
    gold: DEFAULT_COLORS.gold,
    goldDark: scheme.headerBg,
    headerText: scheme.headerText,
    cream: scheme.evenRowBg,
    creamAlt: scheme.oddRowBg,
    text: scheme.evenRowText,
    white: scheme.headerText,
    border: scheme.borderColor,
  };
}

const H1 = 20;
const H2 = 14;
const HEADER_H = H1 + H2;
const ROW_H = 14;

interface TableColumn {
  x: number;
  w: number;
  key?: string;
  label?: string;
  headerLabel?: string;
  group?: string;
}

interface TableLayout {
  columns: TableColumn[];
  tableW: number;
  groups: { name: string; x: number; w: number; headerSub?: string }[];
}

function buildTableLayout(config?: SheetConfig): TableLayout {
  const showMaghribStart = config?.showMaghribStart ?? TEMPLATE_CONFIG.prayerColumns.maghrib.showStart;
  const showIshaStart = config?.showIshaStart ?? TEMPLATE_CONFIG.prayerColumns.isha.showStart;

  const columns: TableColumn[] = [];
  let x = 0;

  columns.push({ x, w: 36, key: 'date', label: 'DATE' }); x += 36;
  columns.push({ x, w: 36, key: 'day', label: 'DAY' }); x += 36;
  columns.push({ x, w: 70, key: 'islamic', label: 'ISLAMIC' }); x += 70;

  columns.push({ x, w: 48, key: 'fajrStart', label: 'START', headerLabel: 'FAJR' }); x += 48;
  columns.push({ x, w: 48, key: 'fajrJamat', label: 'JAMAT', headerLabel: 'FAJR' }); x += 48;
  columns.push({ x, w: 48, key: 'sunrise', label: 'SUNRISE', headerLabel: 'FAJR' }); x += 48;

  columns.push({ x, w: 48, key: 'dhuhrStart', label: 'START', headerLabel: 'DHUHR' }); x += 48;
  columns.push({ x, w: 48, key: 'dhuhrJamat', label: 'JAMAT', headerLabel: 'DHUHR' }); x += 48;

  columns.push({ x, w: 48, key: 'asrStart', label: 'START', headerLabel: 'ASR' }); x += 48;
  columns.push({ x, w: 48, key: 'asrJamat', label: 'JAMAT', headerLabel: 'ASR' }); x += 48;

  if (showMaghribStart) {
    columns.push({ x, w: 48, key: 'maghribStart', label: 'START', headerLabel: 'MAGHRIB' }); x += 48;
  }
  columns.push({ x, w: 48, key: 'maghribJamat', label: 'JAMAT', headerLabel: 'MAGHRIB' }); x += 48;

  if (showIshaStart) {
    columns.push({ x, w: 48, key: 'ishaStart', label: 'START', headerLabel: 'ISHA' }); x += 48;
  }
  columns.push({ x, w: 48, key: 'ishaJamat', label: 'JAMAT', headerLabel: 'ISHA' }); x += 48;

  const groups: { name: string; x: number; w: number; headerSub?: string }[] = [
    { name: 'FAJR', x: 142, w: 48 + 48 + 48 },
    { name: 'DHUHR', x: 286, w: 48 + 48 },
    { name: 'ASR', x: 382, w: 48 + 48 },
    { name: 'MAGHRIB', x: 478, w: (showMaghribStart ? 48 : 0) + 48 },
    { name: 'ISHA', x: 478 + (showMaghribStart ? 48 : 0) + 48, w: (showIshaStart ? 48 : 0) + 48 },
  ];

  return { columns, tableW: x, groups };
}

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

function svgTextRotated(
  text: string,
  x: number,
  y: number,
  fontSize: number,
  fill: string,
  font: any,
): string {
  const paths = svgText(text, 0, 0, fontSize, fill, font, 'middle');
  return `<g transform="translate(${x.toFixed(2)},${y.toFixed(2)}) rotate(-90)">${paths}</g>`;
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
  if (prevT && t.hijriMonthNumber !== prevT.hijriMonthNumber) {
    const monthName = t.hijriMonth;
    const fontSize = monthName.length > 8 ? 5.5 : 7;
    return { text: monthName, fontSize };
  }
  return { text: t.hijriDay, fontSize: 7 };
}

function buildTable(times: PrayerTime[], monthName: string, sheetColors?: SheetColorScheme, config?: SheetConfig): string {
  const C = buildColors(sheetColors);
  const f = FONTS.inter;
  const p: string[] = [];
  const layout = buildTableLayout(config);
  const TABLE_W = layout.tableW;
  const tableH = HEADER_H + times.length * ROW_H;
  const islamicMonthHeader = times[0]?.hijriMonthEn || '';

  p.push(el('rect', { x: 0, y: 0, width: TABLE_W, height: tableH, fill: 'none', stroke: C.maroon, 'stroke-width': 2, rx: 4 }));
  p.push(`<clipPath id="tc"><rect x="1" y="1" width="${TABLE_W - 2}" height="${tableH - 2}" rx="3"/></clipPath>`);
  p.push('<g clip-path="url(#tc)">');

  p.push(el('rect', { x: 0, y: 0, width: TABLE_W, height: HEADER_H, fill: C.maroon }));

  p.push(svgText(monthName, 72, H1 / 2, 8, C.white, f.bold, 'middle'));

  for (const g of layout.groups) {
    const cx = g.x + g.w / 2;
    p.push(svgText(g.name, cx, H1 / 2, 8, C.headerText, f.bold, 'middle'));
  }

  for (const col of layout.columns) {
    if (col.label) {
      const label = col.key === 'islamic' ? islamicMonthHeader : col.label;
      const fs = col.key === 'islamic' ? 5.5 : 6;
      p.push(svgText(label, col.x + col.w / 2, H1 + H2 / 2, fs, C.headerText, f.bold, 'middle'));
    }
  }

  p.push(el('line', { x1: 0, y1: H1, x2: TABLE_W, y2: H1, stroke: C.border, 'stroke-width': 0.75 }));

  let daysSinceFriday = 0;
  for (let i = 0; i < times.length; i++) {
    const t = times[i];
    const prevT = i > 0 ? times[i - 1] : null;
    const isFri = t.dayName === 'FRI';
    if (isFri) daysSinceFriday = 0;

    const bg = isFri ? C.maroon : (daysSinceFriday % 2 === 0 ? C.cream : C.creamAlt);
    const textC = isFri ? C.white : C.text;
    daysSinceFriday++;

    const ry = HEADER_H + i * ROW_H;

    p.push(el('rect', { x: 0, y: ry, width: TABLE_W, height: ROW_H, fill: bg }));

    p.push(el('line', { x1: 0, y1: ry + ROW_H, x2: TABLE_W, y2: ry + ROW_H, stroke: C.border, 'stroke-width': 0.75 }));

    const dateCol = layout.columns.find(c => c.key === 'date')!;
    p.push(svgText(String(t.dayNumber), dateCol.x + 8, ry + ROW_H / 2, 7, textC, f.bold, 'left'));

    const dayCol = layout.columns.find(c => c.key === 'day')!;
    p.push(svgText(t.dayName, dayCol.x + dayCol.w / 2, ry + ROW_H / 2, 7, textC, f.bold, 'middle'));

    const islamicCol = layout.columns.find(c => c.key === 'islamic')!;
    const islamicVal = getIslamicDateCell(t, prevT);
    p.push(svgText(islamicVal.text, islamicCol.x + islamicCol.w / 2, ry + ROW_H / 2, islamicVal.fontSize, textC, f.bold, 'middle'));

    for (const col of layout.columns) {
      if (!col.key || col.key === 'date' || col.key === 'day' || col.key === 'islamic') continue;
      const prevVal = prevT ? String((prevT as any)[col.key] || '') : null;
      const currentVal = String((t as any)[col.key] || '');
      const val = getCellValue(currentVal, prevVal, col.key);
      if (!val) continue;
      p.push(svgText(val, col.x + col.w / 2, ry + ROW_H / 2, 7, textC, f.bold, 'middle'));
    }
  }

  for (const col of layout.columns) {
    const bx = col.x + col.w;
    if (bx >= TABLE_W) continue;
    p.push(el('line', { x1: bx, y1: H1, x2: bx, y2: tableH, stroke: C.border, 'stroke-width': 0.75 }));
  }

  p.push(el('line', { x1: 0, y1: HEADER_H, x2: TABLE_W, y2: HEADER_H, stroke: C.border, 'stroke-width': 0.75 }));

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

function isCellMerged(row: number, col: number, merges: SheetMerge[]): boolean {
  return merges.some(m => row >= m.startRow && row < m.endRow && col >= m.startCol && col < m.endCol);
}

function findMerge(row: number, col: number, merges: SheetMerge[]): SheetMerge | null {
  return merges.find(m => row >= m.startRow && row < m.endRow && col >= m.startCol && col < m.endCol) || null;
}

function buildTableFromGrid(grid: SheetGrid, monthName: string, sheetColors?: SheetColorScheme, config?: SheetConfig): string {
  const C = buildColors(sheetColors);
  const f = FONTS.inter;
  const p: string[] = [];
  const layout = buildTableLayout(config);
  const TABLE_W = layout.tableW;
  const dataRowCount = grid.rows.length;
  const tableH = HEADER_H + dataRowCount * ROW_H;



  p.push(el('rect', { x: 0, y: 0, width: TABLE_W, height: tableH, fill: 'none', stroke: C.maroon, 'stroke-width': 2, rx: 4 }));
  p.push(`<clipPath id="tc"><rect x="1" y="1" width="${TABLE_W - 2}" height="${tableH - 2}" rx="3"/></clipPath>`);
  p.push('<g clip-path="url(#tc)">');

  // Headers
  const headerRow1 = grid.headers[0] || [];
  const headerRow2 = grid.headers[1] || [];

  // Header background
  p.push(el('rect', { x: 0, y: 0, width: TABLE_W, height: HEADER_H, fill: C.maroon }));

  // Render header row 1 (group names)
  for (let c = 0; c < layout.columns.length; c++) {
    const val = headerRow1[c] || '';
    if (!val) continue;
    const col = layout.columns[c];
    p.push(svgText(val, col.x + col.w / 2, H1 / 2, 8, C.headerText, f.bold, 'middle'));
  }

  // Render header row 2 (column labels)
  for (let c = 0; c < layout.columns.length; c++) {
    const val = headerRow2[c] || '';
    if (!val) continue;
    const col = layout.columns[c];
    const fs = val.length > 8 ? 5.5 : 6;
    p.push(svgText(val, col.x + col.w / 2, H1 + H2 / 2, fs, C.headerText, f.bold, 'middle'));
  }

  p.push(el('line', { x1: 0, y1: H1, x2: TABLE_W, y2: H1, stroke: C.border, 'stroke-width': 0.75 }));

  // Pre-calculate merge rectangles
  const mergeRects = new Map<string, SheetMerge>();
  for (const m of grid.merges) {
    for (let r = m.startRow; r < m.endRow; r++) {
      for (let c = m.startCol; c < m.endCol; c++) {
        mergeRects.set(`${r},${c}`, m);
      }
    }
  }

  // PASS 1: Draw all row backgrounds
  for (let r = 0; r < dataRowCount; r++) {
    const row = grid.rows[r];
    const ry = HEADER_H + r * ROW_H;

    let rowBg = '';
    for (let c = 0; c < row.formats.length; c++) {
      if (row.formats[c]?.bgColor) {
        rowBg = row.formats[c].bgColor;
        break;
      }
    }
    if (!rowBg) {
      rowBg = (r % 2 === 0) ? C.cream : C.creamAlt;
    }
    p.push(el('rect', { x: 0, y: ry, width: TABLE_W, height: ROW_H, fill: rowBg }));

    // Horizontal line
    p.push(el('line', { x1: 0, y1: ry + ROW_H, x2: TABLE_W, y2: ry + ROW_H, stroke: C.border, 'stroke-width': 0.75 }));
  }

  // PASS 2: Draw merge backgrounds on top of row backgrounds
  for (const merge of grid.merges) {
    const startCol = layout.columns[merge.startCol];
    const mergeW = layout.columns
      .slice(merge.startCol, merge.endCol)
      .reduce((sum, col) => sum + col.w, 0);
    const mergeH = (merge.endRow - merge.startRow) * ROW_H;
    const ry = HEADER_H + merge.startRow * ROW_H;
    const bg = merge.format.bgColor || C.maroon;
    p.push(el('rect', { x: startCol.x, y: ry, width: mergeW, height: mergeH, fill: bg }));
  }

  // PASS 3: Draw cell text (regular cells and merge text)
  for (let r = 0; r < dataRowCount; r++) {
    const row = grid.rows[r];
    const ry = HEADER_H + r * ROW_H;

    for (let c = 0; c < layout.columns.length; c++) {
      const col = layout.columns[c];
      const merge = mergeRects.get(`${r},${c}`);

      if (merge) {
        if (r === merge.startRow && c === merge.startCol) {
          const mergeW = layout.columns
            .slice(merge.startCol, merge.endCol)
            .reduce((sum, col) => sum + col.w, 0);
          const mergeH = (merge.endRow - merge.startRow) * ROW_H;
          const cx = col.x + mergeW / 2;
          const cy = ry + mergeH / 2;
          const textC = merge.format.textColor || C.text;

          let fs = 7;
          if (mergeH > ROW_H * 2) fs = 8;
          if (mergeW < 40) fs = 5.5;

          const font = merge.format.bold ? f.bold : f.regular;

          // Render vertical text for tall narrow merges (height > width * 1.5)
          const shouldRotate = merge.format.verticalText || (mergeH > mergeW * 1.5);
          if (shouldRotate) {
            p.push(svgTextRotated(merge.value, cx, cy, fs, textC, font));
          } else {
            p.push(svgText(merge.value, cx, cy, fs, textC, font, 'middle'));
          }
        }
        continue;
      }

      const val = row.values[c] || '';
      if (!val) continue;
      const fmt = row.formats[c] || { bgColor: '', textColor: '', bold: false };
      const textC = fmt.textColor || C.text;
      const font = fmt.bold ? f.bold : f.regular;
      let fs = fmt.fontSize ? Math.min(fmt.fontSize, 7) : 7;
      if (val.length > 10) fs = 5.5;

      p.push(svgText(val, col.x + col.w / 2, ry + ROW_H / 2, fs, textC, font, 'middle'));
    }
  }

  // Vertical column lines
  for (const col of layout.columns) {
    const bx = col.x + col.w;
    if (bx >= TABLE_W) continue;
    p.push(el('line', { x1: bx, y1: H1, x2: bx, y2: tableH, stroke: C.border, 'stroke-width': 0.75 }));
  }

  p.push(el('line', { x1: 0, y1: HEADER_H, x2: TABLE_W, y2: HEADER_H, stroke: C.border, 'stroke-width': 0.75 }));

  p.push('</g>');
  return p.join('\n');
}

export async function buildTableSvg(times: PrayerTime[], monthLabel: string, colors?: SheetColorScheme, config?: SheetConfig, grid?: SheetGrid): Promise<string> {
  const layout = buildTableLayout(config);
  const dataRowCount = grid?.rows.length ?? times.length;
  const tableH = HEADER_H + dataRowCount * ROW_H;
  const content = grid
    ? buildTableFromGrid(grid, monthLabel, colors, config)
    : buildTable(times, monthLabel, colors, config);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${layout.tableW}" height="${tableH}" viewBox="0 0 ${layout.tableW} ${tableH}">${content}</svg>`;
}

export async function renderTablePng(): Promise<Uint8Array> {
  await initResvg();
  const f = FONTS.inter;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="200" viewBox="0 0 600 200"><rect x="0" y="0" width="600" height="200" fill="#2d0a1f"/>${svgText('INTER BOLD 24', 300, 50, 24, '#ffffff', f.bold, 'middle')}${svgText('inter regular 16', 300, 100, 16, '#c9a227', f.bold, 'middle')}${svgText('5:30 12:45', 300, 150, 12, '#ffffff', f.bold, 'middle')}</svg>`;
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 600 } });
  const pixmap = resvg.render();
  const rgba = new Uint8Array(pixmap.pixels as any);
  return encodePNG(rgba, pixmap.width, pixmap.height);
}

function buildTitleSvg(titleText: string, fontSize: number): string {
  const f = FONTS.inter;
  const titleW = 600;
  const titleH = 40;
  const svg = svgText(titleText, 0, titleH / 2, fontSize, DEFAULT_COLORS.gold, f.bold, 'left');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${titleW}" height="${titleH}" viewBox="0 0 ${titleW} ${titleH}">${svg}</svg>`;
}

function buildJumuahTimeSvg(timeText: string, fontSize: number): string {
  const f = FONTS.inter;
  const w = 200;
  const h = 40;
  const svg = svgText(timeText, 0, h / 2, fontSize, '#601924', f.bold, 'left');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${svg}</svg>`;
}

export async function generatePoster(
  times: PrayerTime[],
  year: number,
  monthLabel: string,
  titleText: string,
  jumuahTimeText: string,
  colors?: SheetColorScheme,
  config?: SheetConfig,
  grid?: SheetGrid,
): Promise<{ format: 'png'; data: Uint8Array }> {
  await initResvg();
  const poster = decodePoster();

  const { tableArea } = TEMPLATE_CONFIG;
  const dataRowCount = grid?.rows.length ?? times.length;
  const tableH = HEADER_H + dataRowCount * ROW_H;
  const tableContent = grid
    ? buildTableFromGrid(grid, monthLabel, colors, config)
    : buildTable(times, monthLabel, colors, config);
  const layout = buildTableLayout(config);
  const scaledW = Math.ceil(tableArea.width);

  const tableSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${layout.tableW}" height="${tableH}" viewBox="0 0 ${layout.tableW} ${tableH}">${tableContent}</svg>`;
  const resvg = new Resvg(tableSvg, { fitTo: { mode: 'width', value: scaledW } });
  const pixmap = resvg.render();
  const tableRgba = new Uint8Array(pixmap.pixels as any);

  const outRgba = new Uint8Array(poster.rgba);
  compositeRgba(outRgba, poster.width, poster.height, tableRgba, pixmap.width, pixmap.height, tableArea.x, tableArea.y);

  if (titleText) {
    const titlePos = TEMPLATE_CONFIG.titlePosition;
    const titleSvg = buildTitleSvg(titleText, titlePos.fontSize);
    const titleResvg = new Resvg(titleSvg, { fitTo: { mode: 'width', value: 600 } });
    const titlePixmap = titleResvg.render();
    const titleRgba = new Uint8Array(titlePixmap.pixels as any);
    compositeRgba(outRgba, poster.width, poster.height, titleRgba, titlePixmap.width, titlePixmap.height, titlePos.x, titlePos.y);
  }

  if (jumuahTimeText) {
    const jPos = TEMPLATE_CONFIG.jumuahTimePosition;
    const jSvg = buildJumuahTimeSvg(jumuahTimeText, jPos.fontSize);
    const jResvg = new Resvg(jSvg, { fitTo: { mode: 'width', value: 200 } });
    const jPixmap = jResvg.render();
    const jRgba = new Uint8Array(jPixmap.pixels as any);
    compositeRgba(outRgba, poster.width, poster.height, jRgba, jPixmap.width, jPixmap.height, jPos.x, jPos.y);
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
