import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const requestedVersion = process.argv[2]?.replace(/^v/, '').trim();

if (!requestedVersion) {
  console.error('Uso: node scripts/release/validate.mjs <semver ou tag>');
  process.exit(1);
}

const read = (relativePath) => fs.readFileSync(path.join(rootDir, relativePath), 'utf8');
const tauriConfig = JSON.parse(read('apps/desktop/src-tauri/tauri.conf.json'));
const desktopPackage = JSON.parse(read('apps/desktop/package.json'));
const cargoManifest = read('apps/desktop/src-tauri/Cargo.toml');
const cargoLock = read('apps/desktop/src-tauri/Cargo.lock');
const changelog = read('CHANGELOG.md');
const capabilities = read('apps/desktop/src-tauri/capabilities/default.json');
const mainRs = read('apps/desktop/src-tauri/src/main.rs');

const errors = [];
const assert = (condition, message) => {
  if (!condition) errors.push(message);
};

assert(tauriConfig.version === requestedVersion, `tauri.conf.json está em ${tauriConfig.version}, esperado ${requestedVersion}.`);
assert(desktopPackage.version === requestedVersion, `apps/desktop/package.json está em ${desktopPackage.version}, esperado ${requestedVersion}.`);
assert(new RegExp(`^version\\s*=\\s*"${requestedVersion.replaceAll('.', '\\.') }"`, 'm').test(cargoManifest), `Cargo.toml não está em ${requestedVersion}.`);
assert(new RegExp(`name = "cansche-desktop"\\s+version = "${requestedVersion.replaceAll('.', '\\.') }"`).test(cargoLock), `Cargo.lock não está em ${requestedVersion}.`);

const releaseStart = changelog.indexOf(`## [${requestedVersion}]`);
const nextRelease = releaseStart >= 0 ? changelog.indexOf('\n## [', releaseStart + 1) : -1;
const releaseSection = releaseStart >= 0 ? changelog.slice(releaseStart, nextRelease >= 0 ? nextRelease : undefined) : '';
assert(releaseStart >= 0, `CHANGELOG.md não possui a versão ${requestedVersion}.`);
assert(/^-\s+.+/m.test(releaseSection), `A seção ${requestedVersion} do CHANGELOG.md está vazia.`);

assert(tauriConfig.bundle?.createUpdaterArtifacts === true, 'createUpdaterArtifacts precisa estar true.');
assert(tauriConfig.plugins?.updater?.pubkey, 'Chave pública do updater ausente.');
assert(Array.isArray(tauriConfig.plugins?.updater?.endpoints) && tauriConfig.plugins.updater.endpoints.length > 0, 'Endpoint do updater ausente.');
assert(capabilities.includes('updater:default'), 'Capability updater:default ausente.');
assert(capabilities.includes('process:allow-restart'), 'Capability process:allow-restart ausente.');
assert(mainRs.includes('tauri_plugin_process::init()'), 'Plugin process não registrado no main.rs.');

if (errors.length) {
  console.error('Validação de release falhou:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Release ${requestedVersion} validado: versão, changelog, updater e capabilities estão consistentes.`);

