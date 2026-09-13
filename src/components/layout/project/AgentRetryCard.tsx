import { useState } from 'react';
import type { GetAgentTaskResType } from '@/types/agent.type';

type AgentRetryCardProps = {
  task: GetAgentTaskResType;
  isBusy: boolean;
  onRetry: () => void;
  onDismiss: () => void;
};

/**
 * 실패한 작업을 이어서 다시 돌린다.
 *
 * 서버는 저장된 plan 과 실패한 스텝을 들고 있어서 그 지점부터 재개할 수 있다. 이 카드가
 * 없으면 사용자는 요청 전체를 처음부터 다시 적어야 했다 — 몇 분짜리 빌드를 통째로 다시
 * 도는 셈이다.
 *
 * 실패 사유는 여기 적지 않는다. 서버가 이미 채팅에 같은 내용을 남겼고, 두 벌로 보이면
 * 어느 쪽이 최신인지 헷갈린다. 이 카드는 **채팅에 없는 것만** 보탠다 — 남은 시도 횟수,
 * 에이전트가 제안하는 수정안, 그리고 다시 돌릴 버튼.
 */
function AgentRetryCard({ task, isBusy, onRetry, onDismiss }: AgentRetryCardProps) {
  const [isLogOpen, setIsLogOpen] = useState(false);

  const suggestedFix = task.suggestedFix?.trim();
  const failureLog = task.failureLog?.trim();
  const hasAttempts = task.attempt != null && task.maxAttempts != null;

  return (
    <div className="rounded-xl border border-[#fecaca] bg-[#fef2f2] px-3.5 py-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[13px] font-semibold text-[#991b1b]">작업이 실패했습니다</p>
        {hasAttempts ? (
          <span className="shrink-0 text-[11px] font-medium text-[#b91c1c]">
            {task.attempt}/{task.maxAttempts}회 시도
          </span>
        ) : null}
      </div>

      <p className="mt-1 text-[12px] leading-relaxed text-[#b91c1c]">
        처음부터 다시 요청하지 않아도 됩니다. 실패한 지점부터 이어서 다시 돌립니다.
      </p>

      {suggestedFix ? (
        <div className="mt-2 rounded-lg bg-white px-2.5 py-2">
          <p className="text-[11px] font-medium text-[#94a3b8]">에이전트 제안</p>
          <p className="mt-0.5 whitespace-pre-wrap text-[12px] leading-relaxed text-[#334155]">
            {suggestedFix}
          </p>
        </div>
      ) : null}

      {failureLog ? (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setIsLogOpen((open) => !open)}
            className="cursor-pointer text-[11px] font-medium text-[#b91c1c] underline underline-offset-2"
          >
            {isLogOpen ? '실패 로그 접기' : '실패 로그 보기'}
          </button>
          {isLogOpen ? (
            <pre className="mt-1.5 max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-[#0f172a] px-2.5 py-2 font-mono text-[11px] leading-relaxed text-[#e2e8f0]">
              {failureLog}
            </pre>
          ) : null}
        </div>
      ) : null}

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          disabled={isBusy}
          onClick={onDismiss}
          className="h-8 cursor-pointer rounded-lg border border-[#fecaca] bg-white px-3 text-[12px] font-semibold text-[#64748b] disabled:cursor-not-allowed disabled:opacity-50"
        >
          닫기
        </button>
        <button
          type="button"
          disabled={isBusy}
          onClick={onRetry}
          className="h-8 cursor-pointer rounded-lg bg-[#b91c1c] px-3 text-[12px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isBusy ? '다시 도는 중...' : '이어서 다시 시도'}
        </button>
      </div>
    </div>
  );
}

export default AgentRetryCard;
