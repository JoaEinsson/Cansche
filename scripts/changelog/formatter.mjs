import { ChangelogRelease } from './parser.mjs';

const SECTION_EMOJIS: Record<string, string> = {
  Added: '✨ Novos Recursos',
  Changed: '🛠️ Alterações e Melhorias',
  Fixed: '🐛 Correções de Bugs',
  Removed: '🗑️ Remoções',
  Deprecated: '⚠️ Descontinuado',
  Security: '🔒 Segurança',
  Performance: '⚡ Desempenho',
};

export function toMarkdown(release: ChangelogRelease): string {
  const lines: string[] = [];

  for (const sec of release.sections) {
    if (sec.items.length === 0) continue;
    lines.push(`### ${sec.title}`);
    for (const item of sec.items) {
      lines.push(`- ${item}`);
    }
    lines.push('');
  }

  return lines.join('\n').trim();
}

export function toText(release: ChangelogRelease): string {
  const lines: string[] = [];

  for (const sec of release.sections) {
    if (sec.items.length === 0) continue;
    const header = SECTION_EMOJIS[sec.title] || sec.title;
    lines.push(header);
    for (const item of sec.items) {
      lines.push(`• ${item}`);
    }
    lines.push('');
  }

  return lines.join('\n').trim();
}

export function toJSON(release: ChangelogRelease): string {
  return JSON.stringify(release, null, 2);
}
