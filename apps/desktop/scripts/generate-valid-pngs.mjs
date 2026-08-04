import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const iconsDir = path.resolve(__dirname, '../src-tauri/icons');
const sourceIcon = path.join(iconsDir, 'icon.svg');
const webIcon = path.resolve(__dirname, '../../web/public/cansche-mark.svg');
const tauriCli = path.resolve(__dirname, '../node_modules/@tauri-apps/cli/tauri.js');

if (!fs.existsSync(sourceIcon)) {
  console.error(`Ícone-fonte não encontrado: ${sourceIcon}`);
  process.exit(1);
}

fs.copyFileSync(sourceIcon, webIcon);

const result = spawnSync(process.execPath, [tauriCli, 'icon', sourceIcon, '--output', iconsDir], {
  stdio: 'inherit',
});

if (result.error) {
  console.error('Não foi possível executar o gerador de ícones do Tauri:', result.error);
  process.exit(1);
}

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

// Keep only the formats consumed by the desktop bundle. The Tauri CLI also
// emits mobile and Windows Store assets, which do not belong in this app's
// source icon set.
const generatedOnlyFiles = [
  '64x64.png',
  'Square71x71Logo.png',
  'Square89x89Logo.png',
  'Square107x107Logo.png',
  'Square142x142Logo.png',
  'Square284x284Logo.png',
  'Square310x310Logo.png',
];

for (const filename of generatedOnlyFiles) {
  fs.rmSync(path.join(iconsDir, filename), { force: true });
}

for (const directory of ['android', 'ios']) {
  fs.rmSync(path.join(iconsDir, directory), { recursive: true, force: true });
}

console.log('Ícones PNG, ICO e ICNS gerados a partir de icon.svg.');
