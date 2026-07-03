/**
 * dldnsgkr/my-todo-app 초기 커밋 diff → CodeDiffPayload JSON 생성
 * 실행: node scripts/generate-todo-code-diff.mjs
 */

import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const COMMIT_SHA = '4258a2631a67bbcc7870f6857bed4ea8f0503191';
const REPO = 'dldnsgkr/my-todo-app';
const OUT_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  '../src/mocks/project/todoCodeDiff.payload.json',
);

function parseHunkHeader(line) {
  const match = line.match(/^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/);
  if (!match) return { oldStart: 0, newStart: 0 };
  return {
    oldStart: Number.parseInt(match[1], 10),
    newStart: Number.parseInt(match[3], 10),
  };
}

function parsePatch(patch, filename) {
  const hunks = [];
  const lines = patch.split('\n');
  let i = 0;
  let oldLine = 0;
  let newLine = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.startsWith('@@')) {
      i += 1;
      continue;
    }

    const header = line;
    const { oldStart, newStart } = parseHunkHeader(line);
    oldLine = oldStart;
    newLine = newStart;
    const hunkLines = [];
    i += 1;

    while (i < lines.length && !lines[i].startsWith('@@')) {
      const raw = lines[i];
      const prefix = raw[0];
      const content = raw.slice(1);

      if (prefix === '+') {
        hunkLines.push({
          type: 'added',
          content,
          oldLineNumber: null,
          newLineNumber: newLine,
        });
        newLine += 1;
      } else if (prefix === '-') {
        hunkLines.push({
          type: 'removed',
          content,
          oldLineNumber: oldLine,
          newLineNumber: null,
        });
        oldLine += 1;
      } else if (prefix === ' ' || prefix === undefined) {
        hunkLines.push({
          type: 'context',
          content: prefix === ' ' ? content : raw,
          oldLineNumber: oldLine,
          newLineNumber: newLine,
        });
        oldLine += 1;
        newLine += 1;
      }

      i += 1;
    }

    hunks.push({
      header,
      oldStart,
      newStart,
      lines: hunkLines,
    });
  }

  return hunks;
}

async function main() {
  const url = `https://api.github.com/repos/${REPO}/commits/${COMMIT_SHA}`;
  const response = await fetch(url, {
    headers: { Accept: 'application/vnd.github+json' },
  });

  if (!response.ok) {
    throw new Error(`GitHub API ${response.status}: ${await response.text()}`);
  }

  const commit = await response.json();
  const files = [];

  for (const file of commit.files ?? []) {
    if (!file.patch) continue;

    files.push({
      filename: file.filename,
      status: file.status,
      additions: file.additions,
      deletions: file.deletions,
      hunks: parsePatch(file.patch, file.filename),
      oldPath: file.previous_filename ?? file.filename,
    });
  }

  const payload = {
    meta: {
      generatedAt: new Date().toISOString(),
      baseSha: null,
      headSha: COMMIT_SHA,
    },
    summary: {
      totalFiles: files.length,
      totalAdditions: files.reduce((sum, f) => sum + f.additions, 0),
      totalDeletions: files.reduce((sum, f) => sum + f.deletions, 0),
    },
    files,
  };

  writeFileSync(OUT_PATH, JSON.stringify(payload, null, 2), 'utf8');
  console.log(`Wrote ${files.length} files → ${OUT_PATH}`);
  console.log(
    `Summary: +${payload.summary.totalAdditions} -${payload.summary.totalDeletions}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
