import fs from 'fs';

/**
 * @typedef {Object} ChangelogSection
 * @property {string} title
 * @property {string[]} items
 */

/**
 * @typedef {Object} ChangelogRelease
 * @property {string} version
 * @property {string} [date]
 * @property {ChangelogSection[]} sections
 */

export function parseChangelog(filePathOrContent) {
  let content = filePathOrContent;
  if (fs.existsSync(filePathOrContent)) {
    content = fs.readFileSync(filePathOrContent, 'utf-8');
  }

  const releases = [];
  const lines = content.split(/\r?\n/);

  let currentRelease = null;
  let currentSection = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    // Match Version Headers: ## [1.1.0] - 2026-08-02 or ## [v1.1.0]
    const versionMatch = line.match(/^##\s+\[v?([0-9]+\.[0-9]+\.[0-9]+(?:-[a-zA-Z0-9.]+)?)]\s*(?:-\s*([0-9]{4}-[0-9]{2}-[0-9]{2}))?/);

    if (versionMatch) {
      if (currentRelease) {
        if (currentSection && currentSection.items.length > 0) {
          currentRelease.sections.push(currentSection);
        }
        releases.push(currentRelease);
      }

      currentRelease = {
        version: versionMatch[1],
        date: versionMatch[2] || undefined,
        sections: [],
      };
      currentSection = null;
      continue;
    }

    // Match Section Headers: ### Added, ### Fixed, ### Performance, etc.
    const sectionMatch = line.match(/^###\s+(.+)$/);
    if (sectionMatch && currentRelease) {
      if (currentSection && currentSection.items.length > 0) {
        currentRelease.sections.push(currentSection);
      }

      currentSection = {
        title: sectionMatch[1].trim(),
        items: [],
      };
      continue;
    }

    // Match List Bullet Items: - item or * item
    const itemMatch = line.match(/^[-*]\s+(.+)$/);
    if (itemMatch && currentSection && currentRelease) {
      const itemText = itemMatch[1].trim();
      if (itemText && itemText !== '-') {
        currentSection.items.push(itemText);
      }
    }
  }

  if (currentRelease) {
    if (currentSection && currentSection.items.length > 0) {
      currentRelease.sections.push(currentSection);
    }
    releases.push(currentRelease);
  }

  // Validate duplicate versions
  const versionSet = new Set();
  for (const rel of releases) {
    if (versionSet.has(rel.version)) {
      throw new Error(`Duplicate version detected in CHANGELOG.md: [${rel.version}]`);
    }
    versionSet.add(rel.version);
  }

  return releases;
}

export function findRelease(releases, targetVersion) {
  const cleanTarget = targetVersion.replace(/^v/, '').trim();
  return releases.find((r) => r.version === cleanTarget) || null;
}
