import { Button } from '@/components/ui/button';

type PricingCardProps = {
  planName: string;
  price: string;
  periodText: string;
  description: string;
  features: string[];
  buttonText: string;
};

function PricingCard({
  planName,
  price,
  periodText,
  description,
  features,
  buttonText,
}: PricingCardProps) {
  return (
    <div className="flex flex-col justify-between py-4.5 px-4 border rounded-3xl border-[#0B0C12]/8 h-[360px] w-[247.4px] transition-all hover:border-2 hover:border-[rgba(170,59,255,0.45)] hover:shadow-[0_24px_60px_0_rgba(170,59,255,0.18)]">
      <div className="flex flex-col gap-2">
        <p className="typo-b3-sb">{planName}</p>
        <p className="typo-h2-bd">
          {price}
          <span className="typo-b3-rg text-[#64748B]">{periodText}</span>
        </p>
        <p className="typo-b3-rg text-[#64748B] pb-2">{description}</p>
        {features.map((feature) => (
          <p
            key={feature}
            className="typo-b5-rg flex gap-4 items-center"
            style={{ color: 'rgba(11, 12, 18, 0.82)' }}
          >
            ✓{' '}
            <span className="typo-b3-rg" style={{ color: 'rgba(11, 12, 18, 0.72)' }}>
              {feature}
            </span>
          </p>
        ))}
      </div>
      <Button className="rounded-xl typo-b5-sb text-white bg-[#0B0C12] hover:bg-[linear-gradient(180deg,var(--color-violet-6295,rgba(170,59,255,0.95))_0%,var(--color-violet-5095,rgba(109,40,217,0.95))_100%)]">
        {buttonText}
      </Button>
    </div>
  );
}

const pricingCardItems: PricingCardProps[] = [
  {
    planName: '무료',
    price: '0원',
    periodText: ' /월',
    description: '강력한 기능의 평생 무료 쇼핑몰. 외부 서비스 연동에 제한이 없어요.',
    features: ['월 이용료 0원', '프로로 업그레이드 가능'],
    buttonText: '고도몰 basic 시작하기',
  },
  {
    planName: '고도물 pro',
    price: '33,000원',
    periodText: ' /월',
    description: '커스터마이징 통합 양장 기능. 더 넓은 영역을 운영하고 싶은 팀에 적합해요.',
    features: ['basic 모든 기능 포함', 'DB 커스텀마이징 가능', '관리자 커스텀디자인 가능'],
    buttonText: '고도몰 pro 시작하기',
  },
  {
    planName: '삼바이 enterprise',
    price: '99,000원',
    periodText: ' /월',
    description: '확장성과 안정성을 갖춘 풀패키지. 대규모 트래픽과 고급 기능이 필요할때',
    features: ['헤드리스 플랫포', '웹사이트 지원', '기존 비즈니스 API 연동'],
    buttonText: '삼바이 enterprise 시작하기',
  },
];

function PricingSection() {
  return (
    <section className="w-full bg-[linear-gradient(180deg,#FFFFFF_0%,#F8FAFC_100%)]">
      <div className="flex flex-col gap-2 items-start justify-center py-16 px-52">
        <p className="text-[#7C3AED] text-lg font-extrabold">요금 안내</p>
        <p className="text-[#111827] typo-h2-bd">팀 규모에 맞는 플랜</p>
        <div
          className="p-6.5 rounded-2xl bg-white flex flex-col gap-4.5 w-full"
          style={{ boxShadow: '0 28px 70px 0 rgba(0, 0, 0, 0.18)' }}
        >
          <div className="flex justify-between w-full">
            <div className="flex flex-col">
              <p className="typo-h4-bd">
                한눈에
                <br />
                비교해 보세요
              </p>
              <p
                className="typo-b3-rg"
                style={{ color: 'var(--color-blue-670, rgba(11, 12, 18, 0.70))' }}
              >
                솔루션 선택이 어려우신가요?
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3.5">
              {pricingCardItems.map((item, index) => (
                <PricingCard key={index} {...item} />
              ))}
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden border border-[#0B0C12]/8">
            <table className="w-full table-fixed border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC]">
                  <th className="py-3 px-4 text-left typo-b5-sb text-[#64748B] border-b border-[#0B0C12]/8">
                    &nbsp;
                  </th>
                  <th className="py-3 px-4 text-center typo-b5-sb text-[#111827] border-b border-[#0B0C12]/8">
                    고도몰 basic
                  </th>
                  <th className="py-3 px-4 text-center typo-b5-sb text-[#111827] border-b border-[#0B0C12]/8">
                    고도몰 pro
                  </th>
                  <th className="py-3 px-4 text-center typo-b5-sb text-[#111827] border-b border-[#0B0C12]/8">
                    삼바이 enterprise
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white">
                  <td className="py-3 px-4 typo-b5-sb text-[#64748B] border-b border-[#0B0C12]/8">
                    트래픽
                  </td>
                  <td className="py-3 px-4 typo-b5-sb text-center text-[#111827] border-b border-[#0B0C12]/8">
                    ✓
                  </td>
                  <td className="py-3 px-4 typo-b5-sb text-center text-[#111827] border-b border-[#0B0C12]/8">
                    ✓
                  </td>
                  <td className="py-3 px-4 typo-b5-sb text-center text-[#111827] border-b border-[#0B0C12]/8">
                    ✓
                  </td>
                </tr>
                <tr className="bg-white">
                  <td className="py-3 px-4 typo-b5-sb text-[#64748B] border-b border-[#0B0C12]/8">
                    스토리지
                  </td>
                  <td className="py-3 px-4 typo-b5-sb text-center text-[#111827] border-b border-[#0B0C12]/8">
                    4GB
                  </td>
                  <td className="py-3 px-4 typo-b5-sb text-center text-[#111827] border-b border-[#0B0C12]/8">
                    4GB(추가 가능)
                  </td>
                  <td className="py-3 px-4 typo-b5-sb text-center text-[#111827] border-b border-[#0B0C12]/8">
                    무제한
                  </td>
                </tr>
                <tr className="bg-white">
                  <td className="py-3 px-4 typo-b5-sb text-[#64748B] border-b border-[#0B0C12]/8">
                    공지사항 관리
                  </td>
                  <td className="py-3 px-4 typo-b5-sb text-center text-[#111827] border-b border-[#0B0C12]/8">
                    ✓
                  </td>
                  <td className="py-3 px-4 typo-b5-sb text-center text-[#111827] border-b border-[#0B0C12]/8">
                    ✓
                  </td>
                  <td className="py-3 px-4 typo-b5-sb text-center text-[#111827] border-b border-[#0B0C12]/8">
                    ✓
                  </td>
                </tr>
                <tr className="bg-white">
                  <td className="py-3 px-4 typo-b5-sb text-[#64748B]">모바일 웹 지원</td>
                  <td className="py-3 px-4 typo-b5-sb text-center text-[#111827]">✓</td>
                  <td className="py-3 px-4 typo-b5-sb text-center text-[#111827]">
                    무료 앱 푸시 유지
                  </td>
                  <td className="py-3 px-4 typo-b5-sb text-center text-[#111827]">
                    무료 앱 푸시 유지
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PricingSection;
