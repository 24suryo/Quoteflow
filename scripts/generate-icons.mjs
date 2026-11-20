import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const outDir = path.join(process.cwd(), 'public', 'icons');
fs.mkdirSync(outDir, { recursive: true });

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

function createBrandIconPng(size, maskable = false) {
  const bg = hexToRgb('#292820');
  const gold = hexToRgb('#B69A75');
  const ivory = hexToRgb('#F3EFE6');

  // Scanlines: 1 filter byte (0) + size * 4 RGBA bytes
  const raw = Buffer.alloc(size * (size * 4 + 1));
  const cornerRadius = maskable ? 0 : Math.round(size * 0.22);

  for (let y = 0; y < size; y++) {
    const rowStart = y * (size * 4 + 1);
    raw[rowStart] = 0;

    for (let x = 0; x < size; x++) {
      const px = rowStart + 1 + x * 4;
      let r = bg[0], g = bg[1], b = bg[2], a = 255;

      if (!maskable && cornerRadius > 0) {
        const dx = Math.max(cornerRadius - x, 0, x - (size - 1 - cornerRadius));
        const dy = Math.max(cornerRadius - y, 0, y - (size - 1 - cornerRadius));
        if (dx > 0 && dy > 0 && Math.hypot(dx, dy) > cornerRadius) {
          a = 0;
        }
      }

      // Inner gold frame border
      const pad = Math.round(size * (maskable ? 0.14 : 0.08));
      const borderThick = Math.max(2, Math.round(size * 0.01));
      const inOuter = x >= pad && x < size - pad && y >= pad && y < size - pad;
      const inInner =
        x >= pad + borderThick &&
        x < size - pad - borderThick &&
        y >= pad + borderThick &&
        y < size - pad - borderThick;

      if (a > 0 && inOuter && !inInner) {
        r = gold[0]; g = gold[1]; b = gold[2];
      }

      // Minimalist quote blocks & baseline bar
      const qTop = Math.round(size * 0.30);
      const qBottom = Math.round(size * 0.56);
      const leftBlockX1 = Math.round(size * 0.32);
      const leftBlockX2 = Math.round(size * 0.46);
      const rightBlockX1 = Math.round(size * 0.54);
      const rightBlockX2 = Math.round(size * 0.68);

      const inLeftQuote = x >= leftBlockX1 && x <= leftBlockX2 && y >= qTop && y <= qBottom;
      const inRightQuote = x >= rightBlockX1 && x <= rightBlockX2 && y >= qTop && y <= qBottom;

      if (a > 0 && (inLeftQuote || inRightQuote)) {
        r = gold[0]; g = gold[1]; b = gold[2];
      }

      const barY1 = Math.round(size * 0.65);
      const barY2 = Math.round(size * 0.685);
      const barX1 = Math.round(size * 0.30);
      const barX2 = Math.round(size * 0.70);

      if (a > 0 && x >= barX1 && x <= barX2 && y >= barY1 && y <= barY2) {
        r = ivory[0]; g = ivory[1]; b = ivory[2];
      }

      raw[px] = r;
      raw[px + 1] = g;
      raw[px + 2] = b;
      raw[px + 3] = a;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const idat = zlib.deflateSync(raw, { level: 9 });
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  return Buffer.concat([
    signature,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idat),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

fs.writeFileSync(path.join(outDir, 'icon-192.png'), createBrandIconPng(192, false));
fs.writeFileSync(path.join(outDir, 'icon-512.png'), createBrandIconPng(512, false));
fs.writeFileSync(path.join(outDir, 'icon-maskable-512.png'), createBrandIconPng(512, true));

console.log('Generated PWA PNG icons in public/icons/');