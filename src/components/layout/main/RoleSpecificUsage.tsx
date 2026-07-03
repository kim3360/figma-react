import InfoCard from '@/components/common/InfoCard';

const infoCardClassName = 'bg-[linear-gradient(180deg,#F8FAFC_0%,#FFFFFF_100%)]';

function RoleSpecificUsage() {
  return (
    <section className="w-full bg-[linear-gradient(180deg,#FFFFFF_0%,#F8FAFC_100%)]">
      <div className="flex flex-col gap-2 items-start justify-center py-16 px-52">
        <p className="text-[#7C3AED] text-lg font-extrabold">이런 분들에게</p>
        <p className="text-[#111827] typo-h2-bd">직군별로 이렇게 씁니다</p>
        <p className="text-[#64748B] text-lg font-medium">
          팀 구성이 달라도 같은 워크스페이스에서 역할만 나누면 됩니다.
          <br />
          아래는 대표적인 사용 시나리오입니다.
        </p>
        <div className="grid grid-cols-2 gap-4 pt-5">
          <InfoCard
            title={
              <div className="flex flex-col w-[504px] gap-2.5">
                <p className="text-[#7C3AED] text-lg font-extrabold">기획 · PM</p>
                <p className="text-[#475569] text-sm font-semibold">
                  IA 없이도 섹션 순서를 대화로 바꾸고, CTA 문구·가격 표현을 A/B 느낌/
                  <br />
                  으로 여러 번 뽑아 비교합니다.
                </p>
              </div>
            }
            description={
              <ul className="list-disc pl-8 text-sm text-[#475569] font-medium">
                <li>요구사항을 프롬프트로 공유</li>
                <li>리뷰 코멘트를 에이전트에 그대로 전달</li>
              </ul>
            }
            className={infoCardClassName}
          />
          <InfoCard
            title={
              <div className="flex flex-col gap-2.5">
                <p className="text-[#7C3AED] text-lg font-extrabold">UI/UX · 브랜드</p>
                <p className="text-[#475569] text-sm font-semibold">
                  랜딩 전용 테마(SaaS/로컬 등)로 톤을 맞추고, 미리보기에서 색·타이
                  <br />포 방향을 빠르게 맞춥니다.
                </p>
              </div>
            }
            description={
              <ul className="list-disc pl-8 text-sm text-[#475569] font-medium">
                <li>세부 랜딩 테마 선택·미리보기</li>
                <li>카드·히어로 레이아웃 반복 시도</li>
              </ul>
            }
            className={infoCardClassName}
          />
          <InfoCard
            title={
              <div className="flex flex-col gap-2.5">
                <p className="text-[#7C3AED] text-lg font-extrabold">개발</p>
                <p className="text-[#475569] text-sm font-semibold">
                  Code 탭에서 폴더 구조를 보고, GitHub·ZIP으로 기존 레포를 끌어온
                  <br />뒤 파이프라인 로그로 빌드 상태를 확인합니다.
                </p>
              </div>
            }
            description={
              <ul className="list-disc pl-8 text-sm text-[#475569] font-medium">
                <li>에이전트와 병행해 수동 수정도 가능(제품 로드맵)</li>
                <li>배포 실패 시 로그 기반으로 재시도</li>
              </ul>
            }
            className={infoCardClassName}
          />
          <InfoCard
            title={
              <div className="flex flex-col gap-2.5">
                <p className="text-[#7C3AED] text-lg font-extrabold">취준 · 부트캠프</p>
                <p className="text-[#475569] text-sm font-semibold">
                  포트폴리오용 프로젝트 카드와 설명 문구를 정리하고, 배포 URL을 한<br />
                  줄로 남깁니다.
                </p>
              </div>
            }
            description={
              <ul className="list-disc pl-8 text-sm text-[#475569] font-medium">
                <li>템플릿별로 다른 스토리 연습</li>
                <li>기한 맞춰 데모 URL 제출</li>
              </ul>
            }
            className={infoCardClassName}
          />
        </div>
      </div>
    </section>
  );
}

export default RoleSpecificUsage;
