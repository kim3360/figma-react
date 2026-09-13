import { useState } from 'react';
import { Folder, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

type SidebarTab = 'folder' | 'tag';

type ProjectCodeExplorerPanelProps = {
  className?: string;
};

function ProjectCodeExplorerPanel({ className }: ProjectCodeExplorerPanelProps) {
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('folder');

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
          <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
            <span className="flex size-10 items-center justify-center rounded-full bg-[#f1f5f9] text-[#94a3b8]">
              {sidebarTab === 'folder' ? (
                <Folder className="size-4" strokeWidth={1.75} />
              ) : (
                <Tag className="size-4" strokeWidth={1.75} />
              )}
            </span>
            <p className="mt-3 text-[13px] font-medium text-[#334155]">
              {sidebarTab === 'folder' ? '파일이 없습니다' : '태그가 없습니다'}
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-[#94a3b8]">
              {sidebarTab === 'folder'
                ? '코드 변경이 생기면 여기에서 파일을 볼 수 있어요.'
                : '파일에 태그를 추가하면 여기에서 모아볼 수 있어요.'}
            </p>
          </div>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col bg-[#f6f8fa]">
        <div className="shrink-0 border-b border-[#d0d7de] bg-white px-4 py-2.5">
          <p className="min-w-0 flex-1 truncate font-mono text-[13px] font-semibold text-[#1f2328]">
            파일을 선택하세요
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-4">
          <p className="text-[13px] text-[#94a3b8]">선택한 파일의 변경 내용이 없습니다.</p>
        </div>
      </main>
    </div>
  );
}

export default ProjectCodeExplorerPanel;
