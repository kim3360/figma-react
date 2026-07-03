import InfoCard from '@/components/common/InfoCard';

function UserReviews() {
  return (
    <section className="w-full bg-white border-t border-[#E2E8F0]">
      <div className="flex flex-col gap-2 items-start justify-center py-16 px-52">
        <p className="text-[#7C3AED] text-lg font-extrabold">이용 후기</p>
        <p className="text-[#111827] typo-h2-bd">팀에서 남긴 한 줄 평가</p>
        <p className="text-[#64748B] text-lg font-medium">
          아래 인용은 UI 데모용 가상 사례 입니다.
        </p>
        <div className="grid grid-cols-3 gap-4 pt-5 w-full">
          <InfoCard
            title='"기획서 없이 첫 랜딩 시안을 공유할 수 있어서 주간 회의가 빨라졌어요."'
            titleClassName="typo-b3-sb"
            description="스타트업 PM · 김OO"
            descriptionClassName="typo-b5-sb"
            className="bg-[#F8FAFC]"
          />
          <InfoCard
            title='"GitHub만 넣으면 파이프라인까지 한 화면에 있다는게 설득 포인트였습니다."'
            titleClassName="typo-b3-sb"
            description="프론트엔드 · 이OO"
            descriptionClassName="typo-b5-sb"
            className="bg-[#F8FAFC]"
          />
          <InfoCard
            title='"에이전트에 문구만 던져도 섹션이 정리돼서 카피 실험이 수월했어요."'
            titleClassName="typo-b3-sb"
            description="마케터 · 박OO"
            descriptionClassName="typo-b5-sb"
            className="bg-[#F8FAFC]"
          />
        </div>
      </div>
    </section>
  );
}

export default UserReviews;
