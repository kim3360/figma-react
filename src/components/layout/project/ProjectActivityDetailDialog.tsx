import { useCallback, useEffect } from 'react';
import { formatActivityTime } from '@/lib/projectActivity';
import type { ProjectActivityLog } from '@/types/projects.type';

type ProjectActivityDetailDialogProps = {
  activity: ProjectActivityLog | null;
  onClose: () => void;
};

/**
 * 활동 이력 상세.
 * CHANGE_* 는 message 에 에이전트 요약 마크다운이 통째로 들어와 30줄을 넘기므로
 * 목록에서는 한 줄로 자르고 전문은 여기서 본다. 마크다운은 렌더링하지 않고 원문 그대로 둔다.
 */
function ProjectActivityDetailDialog({ activity, onClose }: ProjectActivityDetailDialogProps) {
  const handleClose = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    if (!activity) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleClose();
    };

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [activity, handleClose]);

  if (!activity) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="닫기"
        className="absolute inset-0 bg-[#0f172a]/30 backdrop-blur-[2px]"
        onClick={handleClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="activity-detail-title"
        className="relative z-10 flex max-h-[70vh] w-full max-w-[560px] flex-col overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-[0_8px_30px_rgba(15,23,42,0.12)]"
      >
        <div className="flex items-center justify-between gap-3 border-b border-[#f1f5f9] px-6 py-4">
          <span
            id="activity-detail-title"
            className="rounded-full bg-[#f1f5f9] px-2 py-0.5 text-[12px] font-medium text-[#475569]"
          >
            {activity.type}
          </span>
          <span className="text-[12px] text-[#94a3b8]">
            {formatActivityTime(activity.occurredAt)}
          </span>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          <p className="whitespace-pre-wrap break-words text-[13px] leading-relaxed text-[#334155]">
            {activity.message}
          </p>
        </div>

        <div className="border-t border-[#f1f5f9] px-6 py-4">
          <button
            type="button"
            onClick={handleClose}
            className="flex w-full cursor-pointer items-center justify-center rounded-xl bg-[#0f172a] py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#1e293b]"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProjectActivityDetailDialog;
