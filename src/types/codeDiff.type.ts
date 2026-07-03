export type DiffLineType = 'context' | 'removed' | 'added';

export type DiffLine = {
  type: DiffLineType;
  content: string;
  oldLineNumber: number | null;
  newLineNumber: number | null;
};

export type DiffHunk = {
  header: string;
  oldStart: number;
  newStart: number;
  lines: DiffLine[];
};

export type DiffFile = {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  hunks: DiffHunk[];
  oldPath?: string;
};

export type CodeDiffPayload = {
  meta: {
    generatedAt: string;
    baseSha: string | null;
    headSha: string | null;
  };
  summary: {
    totalFiles: number;
    totalAdditions: number;
    totalDeletions: number;
  };
  files: DiffFile[];
};

export type SideBySideCellKind = 'context' | 'removed' | 'added' | 'empty';

export type SideBySideCell = {
  lineNumber: number | null;
  content: string;
  kind: SideBySideCellKind;
};

export type SideBySideRow = {
  left: SideBySideCell;
  right: SideBySideCell;
};

export type SideBySideHunk = {
  header: string;
  rows: SideBySideRow[];
};
