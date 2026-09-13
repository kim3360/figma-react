import { ExternalLink, RotateCcw } from 'lucide-react';
import { extractApiErrorMessage } from '@/utils/response';
import type { AgentPreviewPhase } from '@/components/layout/project/agentPreview.utils';

type AgentSitePreviewPanelProps = {
  phase: AgentPreviewPhase;
  previewUrl: string;
  frameKey: number;
  isLoading: boolean;
  isProvisioning: boolean;
  /** 다시 띄우기가 새로 빌드하지 않고 살던 컨테이너에 도로 붙었는지 */
  didReattach: boolean;
  failureReason: string;
  onLoadPreview: () => void;
  /** 떠 있던 컨테이너를 버리고 처음부터 다시 짓는다. 멀쩡한 프리뷰도 죽는다 */
  onForceRebuild: () => void;
};

function PreviewSkeleton() {
  return (
    <div aria-hidden="true" className="flex min-h-0 flex-1 flex-col bg-white">
      <div className="h-10 border-b border-[#e2e8f0] bg-[#f8fafc]" />
      <div className="flex min-h-0 flex-1 flex-col gap-3 p-6">
        <div className="h-8 w-1/3 rounded-lg bg-[#e2e8f0]" />
        <div className="h-4 w-2/3 rounded bg-[#e2e8f0]" />
        <div className="h-4 w-1/2 rounded bg-[#e2e8f0]" />
        <div className="mt-4 min-h-0 flex-1 rounded-xl bg-[#f1f5f9]" />
      </div>
    </div>
  );
}

function AgentSitePreviewPanel({
  phase,
  previewUrl,
  frameKey,
  isLoading,
  isProvisioning,
  didReattach,
  failureReason,
  onLoadPreview,
  onForceRebuild,
}: AgentSitePreviewPanelProps) {
  if (isLoading || isProvisioning) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <PreviewSkeleton />
        {isProvisioning ? (
          <p className="border-t border-[#e2e8f0] bg-white px-4 py-3 text-center text-[12px] text-[#64748b]">
            프리뷰 컨테이너를 준비하고 있습니다. 완료되면 자동으로 열립니다.
          </p>
        ) : null}
      </div>
    );
  }

  if (phase === 'ready') {
    /*
      프레임이 살아 있는지 화면은 알 수 없다.

      프리뷰는 다른 오리진이라 iframe 이 404·502 를 받아도 onload 는 그냥 성공으로
      불린다. 서버 세션이 ACTIVE 인 채 뒤의 컨테이너만 정리된 경우가 실제로 생기는데
      (레포 연결 뒤 임시 프리뷰가 회수된다), 그때 화면에는 죽은 프레임이 남고 되살릴
      버튼은 없는 상태였다 — 중앙 CTA 는 ready 가 아닐 때만 나오기 때문이다.

      자동 감지가 불가능하니 사람이 누를 수 있는 길을 항상 열어 둔다.
    */
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-center justify-end gap-2 border-b border-[#e2e8f0] bg-white px-4 py-2">
          <button
            type="button"
            onClick={onLoadPreview}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-white px-3 py-1.5 text-[12px] font-medium text-[#334155] transition hover:bg-[#f8fafc]"
          >
            <RotateCcw className="size-3.5" />
            다시 띄우기
          </button>
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-white px-3 py-1.5 text-[12px] font-medium text-[#334155] transition hover:bg-[#f8fafc]"
          >
            <ExternalLink className="size-3.5" />새 탭에서 보기
          </a>
        </div>
        {/*
          다시 붙기만 하고 끝났을 때의 안내다.

          여기까지 왔다는 건 컨테이너가 살아 있고 그 안의 앱도 응답한다는 뜻이다 —
          안쪽이 죽어 있으면 게이트웨이가 알아채고 세션을 내리므로 애초에 붙지 않는다.

          그래서 남는 이유는 **코드가 낡은 것** 하나다. 저장소를 막 연결했거나 그 뒤로
          코드가 바뀌었으면 브랜치에는 새 것이 있는데 컨테이너는 옛 것을 서빙한다.
          서버가 보기에는 "떠 있고 응답하니 붙이면 된다" 라서 다시 붙기만 한다.

          화면은 멀쩡해 보인다 — 그래서 사용자가 스스로 알아채기 어렵고, 이 안내가 없으면
          "왜 바뀐 게 안 보이지" 로 남는다.
        */}
        {didReattach ? (
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#fde68a] bg-[#fffbeb] px-4 py-2">
            <p className="text-[12px] leading-relaxed text-[#92400e]">
              이미 떠 있는 컨테이너에 다시 연결했습니다 — 새로 빌드하지 않았습니다. 저장소를 막
              연결했거나 그 뒤로 코드가 바뀌었다면 아직 옛 화면입니다.
            </p>
            <button
              type="button"
              onClick={onForceRebuild}
              title="떠 있는 컨테이너를 버리고 preview 브랜치를 처음부터 다시 빌드합니다"
              className="shrink-0 cursor-pointer rounded-lg border border-[#f59e0b] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#92400e] transition hover:bg-[#fffbeb]"
            >
              버리고 새로 빌드
            </button>
          </div>
        ) : null}
        <iframe
          key={frameKey}
          src={previewUrl}
          title="사이트 미리보기"
          className="min-h-0 flex-1 border-0 bg-white"
        />
      </div>
    );
  }

  const trimmedFailure = extractApiErrorMessage(failureReason) ?? failureReason.trim();

  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="max-w-md text-center">
        <p className="text-[15px] font-semibold leading-relaxed text-[#334155]">
          {trimmedFailure ? trimmedFailure : '아직 띄워 둔 프리뷰가 없습니다.'}
        </p>
        {trimmedFailure ? null : (
          <p className="mt-2 text-[13px] leading-relaxed text-[#94a3b8]">
            미리보기 불러오기를 누르면 preview 브랜치를 컨테이너로 띄웁니다.
          </p>
        )}
        <button
          type="button"
          onClick={onLoadPreview}
          className="mt-4 inline-flex h-9 cursor-pointer items-center rounded-lg bg-[#0f172a] px-4 text-[13px] font-semibold text-white"
        >
          미리보기 불러오기
        </button>
      </div>
    </div>
  );
}

export default AgentSitePreviewPanel;
