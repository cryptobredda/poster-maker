const opentype = require('opentype.js');
const fs = require('fs');
const path = require('path');
const https = require('https');

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789:/.-()\' ';
const CHARS_UNIQUE = [...new Set(CHARS.split(''))];

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function generateFont(fontUrl, fontName) {
  const buf = await fetchBuffer(fontUrl);
  const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
  
  const paths = {};
  for (const char of CHARS_UNIQUE) {
    const glyph = font.charToGlyph(char);
    if (glyph && glyph.path) {
      const pathData = glyph.path.toPathData(2);
      const bbox = glyph.path.getBoundingBox();
      if (pathData && bbox.x2 > bbox.x1) {
        paths[char] = {
          d: pathData,
          aw: glyph.advanceWidth || (bbox.x2 - bbox.x1),
          x1: bbox.x1,
          y1: bbox.y1,
          x2: bbox.x2,
          y2: bbox.y2,
        };
      } else {
        paths[char] = null;
      }
    } else {
      paths[char] = null;
    }
  }
  
  const missing = CHARS_UNIQUE.filter(c => paths[c] === null && c !== ' ');
  if (missing.length > 0) {
    console.warn(fontName + ': missing glyphs for: ' + missing.join(', '));
  }
  
  paths._meta = {
    unitsPerEm: font.unitsPerEm,
    ascender: font.ascender,
    descender: font.descender,
  };
  
  return paths;
}

async function main() {
  const interRegular = await generateFont(
    'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.20/files/inter-latin-400-normal.woff',
    'Inter Regular'
  );
  const interBold = await generateFont(
    'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.20/files/inter-latin-700-normal.woff',
    'Inter Bold'
  );
  const playfairRegular = await generateFont(
    'https://cdn.jsdelivr.net/npm/@fontsource/playfair-display@5.0.24/files/playfair-display-latin-400-normal.woff',
    'Playfair Regular'
  );
  const playfairBold = await generateFont(
    'https://cdn.jsdelivr.net/npm/@fontsource/playfair-display@5.0.24/files/playfair-display-latin-700-normal.woff',
    'Playfair Bold'
  );
  
  const output = {
    inter: { regular: interRegular, bold: interBold },
    playfair: { regular: playfairRegular, bold: playfairBold },
  };
  
  fs.writeFileSync(
    path.join(__dirname, '..', 'src', 'font-paths.json'),
    JSON.stringify(output)
  );
  
  const countKeys = (obj) => Object.keys(obj).filter(k => k !== '_meta' && k.length === 1).length;
  console.log('Font paths generated successfully!');
  console.log('Inter Regular:', countKeys(interRegular));
  console.log('Inter Bold:', countKeys(interBold));
  console.log('Playfair Regular:', countKeys(playfairRegular));
  console.log('Playfair Bold:', countKeys(playfairBold));
}

main().catch(e => { console.error(e); process.exit(1); });