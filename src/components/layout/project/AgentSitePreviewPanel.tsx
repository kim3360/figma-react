import { ExternalLink } from 'lucide-react';
import type { AgentPreviewPhase } from '@/components/layout/project/agentPreview.utils';

type AgentSitePreviewPanelProps = {
  phase: AgentPreviewPhase;
  previewUrl: string;
};

function AgentSitePreviewPanel({ phase, previewUrl }: AgentSitePreviewPanelProps) {
  if (phase === 'ready') {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-center justify-end gap-2 border-b border-[#e2e8f0] bg-white px-4 py-2">
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-white px-3 py-1.5 text-[12px] font-medium text-[#334155] transition hover:bg-[#f8fafc]"
          >
            <ExternalLink className="size-3.5" />새 탭에서 보기
          </a>
        </div>
        <iframe
          src={previewUrl}
          title="사이트 미리보기"
          className="min-h-0 flex-1 border-0 bg-white"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="max-w-md text-center">
        <p className="text-[15px] font-semibold leading-relaxed text-[#334155]">
          {phase === 'building'
            ? 'Devely가 사이트를 구축 중입니다.'
            : '대화를 시작하면 사이트 프리뷰가 표시됩니다.'}
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-[#94a3b8]">
          {phase === 'building'
            ? '작업이 완료되면 미리보기가 열립니다.'
            : '왼쪽에서 메시지를 보내 주세요.'}
        </p>
      </div>
    </div>
  );
}

export default AgentSitePreviewPanel;
