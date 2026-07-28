import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const iconsDir = path.resolve(__dirname, '../src-tauri/icons');
const icoPath = path.join(iconsDir, 'icon.ico');

if (fs.existsSync(icoPath)) {
  const buf = fs.readFileSync(icoPath);
  const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const pos = buf.indexOf(pngHeader);
  const pngBuf = pos !== -1 ? buf.subarray(pos) : buf;

  const targets = ['icon.png', '32x32.png', '128x128.png', '128x128@2x.png', 'icon.icns'];
  for (const file of targets) {
    const targetPath = path.join(iconsDir, file);
    fs.writeFileSync(targetPath, pngBuf);
    console.log(`✓ Icon generated: ${targetPath}`);
  }
}
