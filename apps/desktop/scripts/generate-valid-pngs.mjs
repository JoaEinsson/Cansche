import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function crc32(buf) {
  let c = 0xffffffff;
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let k = n;
    for (let i = 0; i < 8; i++) {
      k = k & 1 ? 0xedb88320 ^ (k >>> 1) : k >>> 1;
    }
    table[n] = k;
  }
  for (let i = 0; i < buf.length; i++) {
    c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function createPNG(width, height, colorRgb = [2, 184, 204]) {
  const [r, g, b] = colorRgb;
  const rowSize = width * 4 + 1;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter 0 (None)
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const isBorder = x === 0 || x === width - 1 || y === 0 || y === height - 1;
      const isAccent = x >= width * 0.25 && x <= width * 0.75 && y >= height * 0.25 && y <= height * 0.75;

      if (isBorder) {
        rawData[pxOffset] = 35; rawData[pxOffset + 1] = 37; rawData[pxOffset + 2] = 42; rawData[pxOffset + 3] = 255;
      } else if (isAccent) {
        rawData[pxOffset] = r; rawData[pxOffset + 1] = g; rawData[pxOffset + 2] = b; rawData[pxOffset + 3] = 255;
      } else {
        rawData[pxOffset] = 15; rawData[pxOffset + 1] = 16; rawData[pxOffset + 2] = 17; rawData[pxOffset + 3] = 255;
      }
    }
  }

  const idatData = zlib.deflateSync(rawData);

  function makeChunk(type, data) {
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const crcVal = crc32(Buffer.concat([typeBuf, data]));
    crcBuf.writeUInt32BE(crcVal, 0);
    return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
  }

  const header = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6;
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdrChunk = makeChunk('IHDR', ihdrData);
  const idatChunk = makeChunk('IDAT', idatData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

const iconsDir = path.resolve(__dirname, '../src-tauri/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

fs.writeFileSync(path.join(iconsDir, '32x32.png'), createPNG(32, 32));
fs.writeFileSync(path.join(iconsDir, '128x128.png'), createPNG(128, 128));
fs.writeFileSync(path.join(iconsDir, '128x128@2x.png'), createPNG(256, 256));
fs.writeFileSync(path.join(iconsDir, 'icon.png'), createPNG(512, 512));
fs.writeFileSync(path.join(iconsDir, 'Square30x30Logo.png'), createPNG(30, 30));
fs.writeFileSync(path.join(iconsDir, 'Square44x44Logo.png'), createPNG(44, 44));
fs.writeFileSync(path.join(iconsDir, 'Square150x150Logo.png'), createPNG(150, 150));
fs.writeFileSync(path.join(iconsDir, 'StoreLogo.png'), createPNG(50, 50));

console.log('✓ Valid PNG icons successfully generated in icons/!');
