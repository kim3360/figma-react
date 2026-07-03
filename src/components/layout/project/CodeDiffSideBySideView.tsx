import type { DiffFile, SideBySideCell, SideBySideHunk } from '@/types/codeDiff.type';
import { hunksToSideBySide } from '@/lib/codeDiffSideBySide';
import { cn } from '@/lib/utils';

type CodeDiffSideBySideViewProps = {
  file: DiffFile;
};

function cellBackground(kind: SideBySideCell['kind'], side: 'left' | 'right') {
  if (kind === 'empty') return 'bg-[#fafafa]';
  if (kind === 'removed') return 'bg-[#ffebe9]';
  if (kind === 'added') return 'bg-[#e6ffec]';
  if (side === 'left' && kind === 'context') return 'bg-[#fff]';
  if (side === 'right' && kind === 'context') return 'bg-[#fff]';
  return 'bg-white';
}

function cellTextColor(kind: SideBySideCell['kind']) {
  if (kind === 'removed') return 'text-[#82071e]';
  if (kind === 'added') return 'text-[#116329]';
  return 'text-[#1f2328]';
}

function DiffCell({
  cell,
  side,
}: {
  cell: SideBySideCell;
  side: 'left' | 'right';
}) {
  const showMarker = cell.kind === 'removed' || cell.kind === 'added';

  return (
    <div className={cn('flex min-h-[22px] min-w-0', cellBackground(cell.kind, side))}>
      <span
        className={cn(
          'w-12 shrink-0 select-none border-r border-[#d0d7de] px-2 text-right font-mono text-[11px] leading-[22px] tabular-nums',
          cell.kind === 'empty' ? 'text-transparent' : 'text-[#656d76]',
          cell.kind === 'removed' && 'bg-[#ffcecb]',
          cell.kind === 'added' && 'bg-[#ccffd8]',
        )}
      >
        {cell.lineNumber ?? ''}
      </span>
      <span
        className={cn(
          'w-6 shrink-0 select-none text-center font-mono text-[11px] leading-[22px]',
          cell.kind === 'removed' && 'text-[#cf222e]',
          cell.kind === 'added' && 'text-[#1a7f37]',
        )}
      >
        {showMarker ? (cell.kind === 'removed' ? '−' : '+') : ''}
      </span>
      <pre
        className={cn(
          'min-w-0 flex-1 overflow-x-auto whitespace-pre px-2 font-mono text-[12px] leading-[22px]',
          cellTextColor(cell.kind),
          cell.kind === 'empty' && 'opacity-0',
        )}
      >
        {cell.content || ' '}
      </pre>
    </div>
  );
}

function DiffHunkBlock({ hunk }: { hunk: SideBySideHunk }) {
  return (
    <div className="border-b border-[#d0d7de] last:border-b-0">
      <div className="bg-[#ddf4ff] px-4 py-1.5 font-mono text-[11px] text-[#0969da]">{hunk.header}</div>
      <div className="grid grid-cols-2 divide-x divide-[#d0d7de]">
        <div className="min-w-0">
          {hunk.rows.map((row, index) => (
            <DiffCell key={`left-${index}`} cell={row.left} side="left" />
          ))}
        </div>
        <div className="min-w-0">
          {hunk.rows.map((row, index) => (
            <DiffCell key={`right-${index}`} cell={row.right} side="right" />
          ))}
        </div>
      </div>
    </div>
  );
}

function CodeDiffSideBySideView({ file }: CodeDiffSideBySideViewProps) {
  const hunks = hunksToSideBySide(file.hunks);

  return (
    <div className="overflow-hidden rounded-lg border border-[#d0d7de]">
      {hunks.map((hunk, index) => (
        <DiffHunkBlock key={`${hunk.header}-${index}`} hunk={hunk} />
      ))}
    </div>
  );
}

export default CodeDiffSideBySideView;
