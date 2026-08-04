import changelogText from '../../../../CHANGELOG.md?raw';

export interface ChangelogRelease {
  version: string;
  date?: string;
  sections: Array<{
    title: string;
    items: string[];
  }>;
}

export function parseBundledChangelog(content: string): ChangelogRelease[] {
  const releases: ChangelogRelease[] = [];
  let currentRelease: ChangelogRelease | null = null;
  let currentSection: ChangelogRelease['sections'][number] | null = null;

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    const releaseMatch = line.match(/^##\s+\[v?([0-9]+\.[0-9]+\.[0-9]+(?:-[a-zA-Z0-9.]+)?)\]\s*(?:-\s*([0-9]{4}-[0-9]{2}-[0-9]{2}))?/);

    if (releaseMatch) {
      if (currentRelease) {
        if (currentSection?.items.length) currentRelease.sections.push(currentSection);
        releases.push(currentRelease);
      }
      currentRelease = { version: releaseMatch[1], date: releaseMatch[2], sections: [] };
      currentSection = null;
      continue;
    }

    const sectionMatch = line.match(/^###\s+(.+)$/);
    if (sectionMatch && currentRelease) {
      if (currentSection?.items.length) currentRelease.sections.push(currentSection);
      currentSection = { title: sectionMatch[1], items: [] };
      continue;
    }

    const itemMatch = line.match(/^[-*]\s+(.+)$/);
    if (itemMatch && currentRelease && currentSection) {
      currentSection.items.push(itemMatch[1]);
    }
  }

  if (currentRelease) {
    if (currentSection?.items.length) currentRelease.sections.push(currentSection);
    releases.push(currentRelease);
  }

  return releases;
}

export const bundledChangelog = parseBundledChangelog(changelogText);

export function findBundledRelease(version: string): ChangelogRelease | null {
  const normalized = version.replace(/^v/, '');
  return bundledChangelog.find((release) => release.version === normalized) || null;
}

