import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const reviews = [
  {
    id: 'kim',
    name: '김OO',
    role: '스타트업 PM',
    initials: '김',
    body: '기획서 없이 첫 랜딩 시안을 공유할 수 있어서 주간 회의가 빨라졌어요. 문구와 섹션 순서를 대화로 바꿔 보고, 바로 화면으로 확인하니 팀 피드백이 한 번에 모입니다. 다음 스프린트 전에 방향을 맞추는 시간이 확실히 줄었습니다.',
  },
  {
    id: 'lee',
    name: '이OO',
    role: '프론트엔드',
    initials: '이',
    body: 'GitHub만 연결하면 파이프라인까지 한 화면에 있다는 게 설득 포인트였습니다. 미리보기와 배포 상태를 오가며 설명할 수 있어서, 코드 리뷰 전에 결과물을 먼저 보게 되었습니다. 로컬 환경을 맞추느라 쓰던 시간이 줄어든 점이 가장 컸습니다.',
  },
  {
    id: 'park',
    name: '박OO',
    role: '마케터',
    initials: '박',
    body: '에이전트에 문구만 던져도 섹션이 정리돼서 카피 실험이 수월했어요. CTA와 헤드라인을 몇 번이고 바꿔 보고, 팀원에게 링크만 넘기면 됩니다. 디자인 시안을 기다리지 않고도 랜딩 톤을 빠르게 검증할 수 있었습니다.',
  },
] as const;

function ReviewCard({ name, role, initials, body }: Omit<(typeof reviews)[number], 'id'>) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="rounded-3xl border border-[#0F172A]/8 bg-white p-6">
      <div className="flex items-center gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#E2E8F0] text-[15px] font-semibold text-[#475569]">
          {initials}
        </span>
        <div>
          <p className="text-[16px] font-semibold text-[#111827]">{name}</p>
          <p className="mt-0.5 text-[13px] text-[#64748B]">{role}</p>
        </div>
      </div>

      <div className="mt-4 flex gap-0.5" aria-label="별점 5점">
        {Array.from({ length: 5 }, (_, index) => (
          <Star key={index} className="size-5 fill-[#FACC15] text-[#FACC15]" />
        ))}
      </div>

      <p
        className={cn(
          'mt-3 text-[15px] leading-relaxed text-[#334155]',
          !expanded && 'line-clamp-4',
        )}
      >
        {body}
      </p>
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        className="mt-2 text-[14px] text-[#94A3B8] transition hover:text-[#64748B]"
      >
        {expanded ? '접기' : '더 보기'}
      </button>
    </article>
  );
}

function UserReviews() {
  return (
    <section id="reviews" className="w-full scroll-mt-4 border-t border-[#E2E8F0] bg-white">
      <div className="flex flex-col items-start justify-center gap-2 px-52 py-16">
        <p className="text-lg font-extrabold text-[#7C3AED]">이용 후기</p>
        <p className="typo-h2-bd text-[#111827]">팀에서 남긴 한 줄 평가</p>

        <div className="grid w-full grid-cols-1 gap-4 pt-5 md:grid-cols-3">
          {reviews.map((review) => (
            <ReviewCard key={review.id} {...review} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default UserReviews;
