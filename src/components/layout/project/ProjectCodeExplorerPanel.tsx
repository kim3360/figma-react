import { useState } from 'react';
import { ChevronDown, File, Folder, Tag } from 'lucide-react';
import CodeDiffSideBySideView from '@/components/layout/project/CodeDiffSideBySideView';
import { codeExplorerTree, DEFAULT_CODE_FILE_PATH } from '@/mocks/project/codeExplorer';
import { getDiffFileByPath } from '@/mocks/project/todoCodeDiff';
import type { CodeExplorerFileNode } from '@/mocks/project/codeExplorer';
import { cn } from '@/lib/utils';

type SidebarTab = 'folder' | 'tag';

function collectFolderIds(nodes: CodeExplorerFileNode[]): string[] {
  return nodes.flatMap((node) =>
    node.type === 'folder'
      ? [node.id, ...(node.children ? collectFolderIds(node.children) : [])]
      : [],
  );
}

function CodeFileTreeItem({
  node,
  depth,
  expandedIds,
  selectedPath,
  onToggle,
  onSelectFile,
}: {
  node: CodeExplorerFileNode;
  depth: number;
  expandedIds: Set<string>;
  selectedPath: string;
  onToggle: (id: string) => void;
  onSelectFile: (path: string) => void;
}) {
  const isFolder = node.type === 'folder';
  const isExpanded = isFolder && expandedIds.has(node.id);
  const isSelected = !isFolder && selectedPath === node.path;
  const paddingLeft = 12 + depth * 16;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (isFolder) {
            onToggle(node.id);
            return;
          }
          onSelectFile(node.path);
        }}
        className={cn(
          'flex w-full items-center gap-1.5 py-1.5 pr-3 text-left text-[13px] transition',
          isSelected ? 'bg-[#eff6ff] text-[#0f172a]' : 'text-[#334155] hover:bg-[#f8fafc]',
        )}
        style={{ paddingLeft }}
      >
        {isFolder ? (
          <ChevronDown
            className={cn(
              'size-3.5 shrink-0 text-[#94a3b8] transition',
              !isExpanded && '-rotate-90',
            )}
            aria-hidden
          />
        ) : (
          <span className="size-3.5 shrink-0" aria-hidden />
        )}
        {isFolder ? (
          <Folder className="size-3.5 shrink-0 text-[#94a3b8]" strokeWidth={1.75} />
        ) : (
          <File className="size-3.5 shrink-0 text-[#94a3b8]" strokeWidth={1.75} />
        )}
        <span className="min-w-0 flex-1 truncate">{node.name}</span>
        {node.changeCount != null ? (
          <span className="shrink-0 text-[12px] tabular-nums text-[#94a3b8]">
            {node.changeCount}
          </span>
        ) : null}
      </button>
      {isFolder && isExpanded && node.children
        ? node.children.map((child) => (
            <CodeFileTreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              expandedIds={expandedIds}
              selectedPath={selectedPath}
              onToggle={onToggle}
              onSelectFile={onSelectFile}
            />
          ))
        : null}
    </>
  );
}

type ProjectCodeExplorerPanelProps = {
  className?: string;
};

function ProjectCodeExplorerPanel({ className }: ProjectCodeExplorerPanelProps) {
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('folder');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(collectFolderIds(codeExplorerTree)),
  );
  const [selectedPath, setSelectedPath] = useState(DEFAULT_CODE_FILE_PATH);

  const diffFile = getDiffFileByPath(selectedPath);

  const handleToggleFolder = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className={cn('flex min-h-0 min-w-0 flex-1 bg-white', className)}>
      <aside className="flex w-[min(280px,36vw)] shrink-0 flex-col border-r border-[#e2e8f0] bg-[#fafafa]">
        <div className="shrink-0 border-b border-[#e2e8f0] bg-white px-3 pb-3 pt-3">
          <div
            role="tablist"
            aria-label="탐색 방식"
            className="grid grid-cols-2 gap-1 rounded-lg bg-[#f1f5f9] p-1"
          >
            {(
              [
                { id: 'folder' as const, label: '폴더', icon: Folder },
                { id: 'tag' as const, label: '태그', icon: Tag },
              ] as const
            ).map(({ id, label, icon: Icon }) => {
              const isActive = sidebarTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setSidebarTab(id)}
                  className={cn(
                    'inline-flex items-center justify-center gap-1.5 rounded-md py-2 text-[12px] font-semibold transition',
                    isActive
                      ? 'bg-white text-[#0f172a] shadow-[0_1px_2px_rgba(15,23,42,0.06)]'
                      : 'text-[#64748b] hover:text-[#334155]',
                  )}
                >
                  <Icon className="size-3.5 shrink-0" strokeWidth={isActive ? 2 : 1.75} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-white py-1">
          {sidebarTab === 'folder' ? (
            codeExplorerTree.map((node) => (
              <CodeFileTreeItem
                key={node.id}
                node={node}
                depth={0}
                expandedIds={expandedIds}
                selectedPath={selectedPath}
                onToggle={handleToggleFolder}
                onSelectFile={setSelectedPath}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
              <span className="flex size-10 items-center justify-center rounded-full bg-[#f1f5f9] text-[#94a3b8]">
                <Tag className="size-4" strokeWidth={1.75} />
              </span>
              <p className="mt-3 text-[13px] font-medium text-[#334155]">태그가 없습니다</p>
              <p className="mt-1 text-[12px] leading-relaxed text-[#94a3b8]">
                파일에 태그를 추가하면 여기에서 모아볼 수 있어요.
              </p>
            </div>
          )}
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col bg-[#f6f8fa]">
        <div className="shrink-0 border-b border-[#d0d7de] bg-white px-4 py-2.5">
          <div className="flex items-center justify-between gap-3">
            <p className="min-w-0 flex-1 truncate font-mono text-[13px] font-semibold text-[#1f2328]">
              {selectedPath}
            </p>
            {diffFile ? (
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-[12px] font-medium text-[#1a7f37]">+{diffFile.additions}</span>
                <span className="text-[12px] font-medium text-[#cf222e]">−{diffFile.deletions}</span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-4">
          {diffFile ? (
            <CodeDiffSideBySideView file={diffFile} />
          ) : (
            <p className="text-[13px] text-[#94a3b8]">선택한 파일의 변경 내용이 없습니다.</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default ProjectCodeExplorerPanel;
