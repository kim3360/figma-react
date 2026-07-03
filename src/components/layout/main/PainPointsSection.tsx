import InfoCard from '@/components/common/InfoCard';

const infoCardClassName = 'w-[330px] shadow-[0_10px_40px_-8px_rgba(15,23,42,0.12)]';

function PainPointsSection() {
  return (
    <section className="w-full bg-[linear-gradient(180deg,#FFFFFF_0%,#F8FAFC_100%)]">
      <div className="flex flex-col gap-2 items-start justify-center py-16 px-52">
        <p className="text-[#7C3AED] text-lg font-extrabold">이런 고민 없으신가요?</p>
        <p className="text-[#111827] typo-h2-bd">혼자 만들기엔 막막한 순간들</p>
        <div className="flex items-center justify-between w-full">
          <InfoCard
            title="강의만 듣다가... 막상 랜딩을 만드려니 어디서부터 할지 모르겠어요"
            description="프롬프트 한 줄이면 섹션 구조와 톤이 잡히고, 수정은 대화로 이어갑니다."
            className={infoCardClassName}
          />
          <InfoCard
            title="디자인·개발이 따로 노는 팀... 결과물 하나로 묶기가 어려워요"
            description="같은 워크스페이스에서 미리보기·코드·파이프라인까지 한 화면에 둡니다."
            className={infoCardClassName}
          />
          <InfoCard
            title="포트폴리오에 올릴 만한 완성 URL이 없어요"
            description="배포까지 연결하는 흐름을 데모로 경험하고, 실제 제품에 맞게 확장할 수 있습니다."
            className={infoCardClassName}
          />
        </div>
        <InfoCard
          title={
            <p className="text-[#475569] font-medium">
              외주 비용·일정 부담 없이
              <span className="text-[#111827] font-extrabold"> 첫 버전</span>을 빠르게 보고 싶은 분,
              사내 PoC·해커톤·취업 포트폴리오까지
              <span className="text-[#111827] font-extrabold"> 한 흐름</span>
              으로 정리하고 싶은 분께 특히 잘 맞습니다.
            </p>
          }
          description={
            <ul className="list-disc pl-8 text-md text-[#475569] font-medium">
              <li>스타트업 마케터·PM - 랜딩 카피·구조를 반복 실험</li>
              <li>프론트엔드·디자이너 - 시안과 코드 미리보기를 바로 맞춤</li>
              <li>1인 창업·프리랜서 - 도메인 연결 전까지 데모로 검증</li>
            </ul>
          }
          className={`border-dotted border-[#7C3AED]/25`}
        />
      </div>
    </section>
  );
}

export default PainPointsSection;
