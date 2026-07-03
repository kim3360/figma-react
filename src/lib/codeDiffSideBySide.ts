import type { DiffHunk, DiffLine, SideBySideHunk, SideBySideRow } from '@/types/codeDiff.type';

function toSideBySideRow(line: DiffLine): SideBySideRow {
  if (line.type === 'context') {
    return {
      left: { lineNumber: line.oldLineNumber, content: line.content, kind: 'context' },
      right: { lineNumber: line.newLineNumber, content: line.content, kind: 'context' },
    };
  }

  if (line.type === 'removed') {
    return {
      left: { lineNumber: line.oldLineNumber, content: line.content, kind: 'removed' },
      right: { lineNumber: null, content: '', kind: 'empty' },
    };
  }

  return {
    left: { lineNumber: null, content: '', kind: 'empty' },
    right: { lineNumber: line.newLineNumber, content: line.content, kind: 'added' },
  };
}

export function hunkToSideBySide(hunk: DiffHunk): SideBySideHunk {
  return {
    header: hunk.header,
    rows: hunk.lines.map(toSideBySideRow),
  };
}

export function hunksToSideBySide(hunks: DiffHunk[]): SideBySideHunk[] {
  return hunks.map(hunkToSideBySide);
}
