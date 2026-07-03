import InfoCard from '@/components/common/InfoCard';
import processSection_icon_1 from '@/assets/icons/processSection_icon_1.svg';
import processSection_icon_2 from '@/assets/icons/processSection_icon_2.svg';
import processSection_icon_3 from '@/assets/icons/processSection_icon_3.svg';
import processSection_icon_4 from '@/assets/icons/processSection_icon_4.svg';
import processSection_icon_5 from '@/assets/icons/processSection_icon_5.svg';
import processSection_icon_6 from '@/assets/icons/processSection_icon_6.svg';

const infoCardClassName = 'w-[330px] shadow-[0_10px_40px_-8px_rgba(15,23,42,0.12)] h-[220px]';

const processCards = [
  {
    step: '01',
    title: '프롬프트·가져오기',
    description: '새 프로젝트 생성 또는 ZIP·GitHub로 소스를 불러옵니다.',
    icon: processSection_icon_1,
  },
  {
    step: '02',
    title: 'AI 에이전트와 다듬기',
    description: '브랜드 톤·섹션 순서·문구를 대화로 조정합니다.',
    icon: processSection_icon_2,
  },
  {
    step: '03',
    title: '코드 · 구조 확인',
    description: '폴더 트리와 파일을 브라우저에서 확인합니다.',
    icon: processSection_icon_3,
  },
  {
    step: '04',
    title: '빌드 · 파이프라인',
    description: 'CI 로그 형태로 진행 상황을 추적합니다.',
    icon: processSection_icon_4,
  },
  {
    step: '05',
    title: '배포 · URL',
    description: '라이브 URL을 프로젝트 카드에 연결합니다.',
    icon: processSection_icon_5,
  },
  {
    step: '06',
    title: '유지보수 · 다음 스프린트',
    description: '추가 페이지·실험을 같은 워크스페이스에서 이어갑니다.',
    icon: processSection_icon_6,
  },
];

function ProcessSection() {
  return (
    <section className="w-full bg-[linear-gradient(180deg,#FDFBFF_0%,#F3EEFF_100%)]">
      <div className="flex flex-col gap-2 items-start justify-center py-16 px-52">
        <p className="text-[#7C3AED] text-lg font-extrabold">프로그램 진행 과정</p>
        <p className="text-[#111827] typo-h2-bd">이렇게 이어집니다</p>
        <div className="grid grid-cols-3 items-center justify-center gap-4 w-full pt-5">
          {processCards.map((card) => (
            <InfoCard
              key={card.step}
              title={
                <div className="flex flex-col">
                  <img src={card.icon} alt={card.title} className="w-[50px] h-[50px]" />
                  <p className="text-[#7C3AED] typo-b3-sb font-extrabold">{card.step}</p>
                  <p className="text-[#111827] text-lg font-extrabold">{card.title}</p>
                  <p className="text-[#475569] text-sm font-semibold">{card.description}</p>
                </div>
              }
              className={infoCardClassName}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default ProcessSection;
