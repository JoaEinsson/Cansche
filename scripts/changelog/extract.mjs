import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseChangelog, findRelease } from './parser.mjs';
import { toMarkdown, toText, toJSON } from './formatter.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const changelogPath = path.resolve(__dirname, '../../CHANGELOG.md');

const targetArg = process.argv[2];

if (!targetArg) {
  console.error('❌ ERRO: Por favor informe a versão a ser extraída.');
  console.error('Exemplo: node scripts/changelog/extract.mjs v1.1.0');
  process.exit(1);
}

const cleanTargetVersion = targetArg.replace(/^v/, '').trim();

try {
  const releases = parseChangelog(changelogPath);
  const release = findRelease(releases, cleanTargetVersion);

  if (!release) {
    console.error(`\n❌ ERRO: Versão [${cleanTargetVersion}] não foi encontrada no CHANGELOG.md.`);
    console.error('Versões disponíveis no CHANGELOG.md:');
    if (releases.length === 0) {
      console.error('  (Nenhuma versão cadastrada)');
    } else {
      for (const r of releases) {
        console.error(`  - ${r.version}${r.date ? ` (${r.date})` : ''}`);
      }
    }
    console.error('');
    process.exit(1);
  }

  const totalItems = release.sections.reduce((acc, sec) => acc + sec.items.length, 0);
  if (totalItems === 0) {
    console.error(`\n❌ ERRO: A versão [${cleanTargetVersion}] no CHANGELOG.md não possui nenhuma nota de alteração registrada.`);
    process.exit(1);
  }

  const markdownOutput = toMarkdown(release);
  const textOutput = toText(release);
  const jsonOutput = toJSON(release);

  console.log(`\n==============================`);
  console.log(`RELEASE NOTES — CANSCHE v${release.version}`);
  console.log(`==============================\n`);
  console.log(textOutput);
  console.log(`\n==============================\n`);

  // Write outputs to GitHub Actions environment if running in CI
  if (process.env.GITHUB_OUTPUT) {
    const ghOutput = process.env.GITHUB_OUTPUT;

    function appendOutput(key, value) {
      const delimiter = `EOF_${Math.random().toString(36).substring(7)}`;
      fs.appendFileSync(ghOutput, `${key}<<${delimiter}\n${value}\n${delimiter}\n`);
    }

    appendOutput('version', release.version);
    appendOutput('date', release.date || '');
    appendOutput('markdown', markdownOutput);
    appendOutput('text', textOutput);
    appendOutput('json', jsonOutput);

    console.log('✓ Variáveis exportadas com sucesso para $GITHUB_OUTPUT');
  }
} catch (err) {
  console.error('\n❌ ERRO ao processar o CHANGELOG.md:', err.message);
  process.exit(1);
}
