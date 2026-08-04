import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const version = process.argv[2]?.replace(/^v/, '').trim();

if (!version || !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) {
  console.error('Uso: node scripts/release/version.mjs <semver>');
  process.exit(1);
}

const tauriConfigPath = path.join(rootDir, 'apps/desktop/src-tauri/tauri.conf.json');
const desktopPackagePath = path.join(rootDir, 'apps/desktop/package.json');
const cargoManifestPath = path.join(rootDir, 'apps/desktop/src-tauri/Cargo.toml');

const tauriConfig = JSON.parse(fs.readFileSync(tauriConfigPath, 'utf8'));
tauriConfig.version = version;
fs.writeFileSync(tauriConfigPath, `${JSON.stringify(tauriConfig, null, 2)}\n`);

const desktopPackage = JSON.parse(fs.readFileSync(desktopPackagePath, 'utf8'));
desktopPackage.version = version;
fs.writeFileSync(desktopPackagePath, `${JSON.stringify(desktopPackage, null, 2)}\n`);

const cargoManifest = fs.readFileSync(cargoManifestPath, 'utf8');
const updatedCargoManifest = cargoManifest.replace(/^version\s*=\s*"[^"]+"/m, `version = "${version}"`);
if (updatedCargoManifest === cargoManifest) {
  throw new Error('Não foi possível localizar a versão no Cargo.toml.');
}
fs.writeFileSync(cargoManifestPath, updatedCargoManifest);

console.log(`Versão do Cansche atualizada para ${version}.`);
console.log('Execute cargo check para sincronizar Cargo.lock antes do commit.');

