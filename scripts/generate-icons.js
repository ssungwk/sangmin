const zlib = require("zlib");
const fs = require("fs");
const path = require("path");

const crcTable = (() => {
  const table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function writePng(size, outPath, raw) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);

  fs.writeFileSync(outPath, png);
  console.log("wrote", outPath);
}

function setPixel(raw, S, x, y, color) {
  if (x < 0 || y < 0 || x >= S || y >= S) return;
  const stride = S * 4 + 1;
  const idx = y * stride + 1 + x * 4;
  raw[idx] = color[0];
  raw[idx + 1] = color[1];
  raw[idx + 2] = color[2];
  raw[idx + 3] = 255;
}

// SDF-style rounded-rect test: clamp to the "core" rect, compare distance to corner radius.
function insideRoundedRect(px, py, x, y, w, h, r) {
  const lx = px - x;
  const ly = py - y;
  if (lx < 0 || ly < 0 || lx >= w || ly >= h) return false;
  const cx = Math.min(Math.max(lx, r), w - r);
  const cy = Math.min(Math.max(ly, r), h - r);
  const dx = lx - cx;
  const dy = ly - cy;
  return dx * dx + dy * dy <= r * r;
}

function fillRoundedRect(raw, S, x, y, w, h, r, color) {
  const x0 = Math.max(0, Math.floor(x));
  const y0 = Math.max(0, Math.floor(y));
  const x1 = Math.min(S, Math.ceil(x + w));
  const y1 = Math.min(S, Math.ceil(y + h));
  for (let py = y0; py < y1; py++) {
    for (let px = x0; px < x1; px++) {
      if (insideRoundedRect(px + 0.5, py + 0.5, x, y, w, h, r)) {
        setPixel(raw, S, px, py, color);
      }
    }
  }
}

// A "sheet" (registered spec panel) with a thin border in the background color,
// so stacked sheets read as separate layers instead of one merged blob.
function drawSheet(raw, S, x, y, w, h, r, border, fillColor, gapColor) {
  fillRoundedRect(raw, S, x - border, y - border, w + 2 * border, h + 2 * border, r + border, gapColor);
  fillRoundedRect(raw, S, x, y, w, h, r, fillColor);
}

function makeIconPng(size, outPath) {
  const S = size;
  const navy = [30, 58, 95];
  const white = [255, 255, 255];

  const raw = Buffer.alloc((S * 4 + 1) * S);
  for (let y = 0; y < S; y++) raw[y * (S * 4 + 1)] = 0; // filter byte: none
  fillRoundedRect(raw, S, 0, 0, S, S, 0, navy); // full-bleed background (OS applies its own mask shape)

  // three stacked "spec sheets" (가로*세로*두께 등록판을 형상화)
  const off = S * 0.07;
  const rectW = S * 0.5;
  const rectH = S * 0.58;
  const r = S * 0.07;
  const border = Math.max(2, S * 0.018);
  const totalW = rectW + 2 * off;
  const totalH = rectH + 2 * off;
  const left = (S - totalW) / 2;
  const top = (S - totalH) / 2;

  drawSheet(raw, S, left, top, rectW, rectH, r, border, white, navy);
  drawSheet(raw, S, left + off, top + off, rectW, rectH, r, border, white, navy);
  drawSheet(raw, S, left + 2 * off, top + 2 * off, rectW, rectH, r, border, white, navy);

  writePng(S, outPath, raw);
}

const dir = path.join(__dirname, "..", "public", "icons");
makeIconPng(192, path.join(dir, "icon-192.png"));
makeIconPng(512, path.join(dir, "icon-512.png"));
