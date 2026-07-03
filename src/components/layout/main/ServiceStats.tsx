type StatBlockProps = {
  emphasis: string;
  caption: string;
};

function StatBlock({ emphasis, caption }: StatBlockProps) {
  return (
    <div className="flex flex-col gap-1 items-center justify-center w-[241px] h-[104px]">
      <p className="typo-h2-bd">{emphasis}</p>
      <p className="text-[#94A3B8] text-sm font-semibold">{caption}</p>
    </div>
  );
}

const statItems: StatBlockProps[] = [
  { emphasis: '6주', caption: '이내 1차 런칭 목표(팀 기준 예시)' },
  { emphasis: '100%', caption: '온라인 워크스페이스' },
  { emphasis: '3 in 1', caption: '미리보기 · 코드 · 파이프라인' },
  { emphasis: '∞', caption: '대화 기반 반복 수정' },
];

function ServiceStats() {
  return (
    <section className="w-full bg-[linear-gradient(135deg,#1E1B4B_0%,#312E81_42%,#1E1B4B_100%)]">
      <div className="flex flex-col gap-5.5 justify-center items-center text-white py-10">
        <div className="flex flex-col gap-2 items-center justify-center">
          <p className="text-3xl font-bold">숫자로 보는 목표감</p>
          <p className="text-[#94A3B8] text-md font-medium text-center">
            아래 수치는 제품 도입 시 설정 가능한 목표 예시입니다. 팀 규모
            <br />와 마일스톤에 맞게 조정하세요.
          </p>
        </div>
        <div className="flex gap-5 items-center justify-center">
          {statItems.map((item, i) => (
            <StatBlock key={i} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default ServiceStats;
