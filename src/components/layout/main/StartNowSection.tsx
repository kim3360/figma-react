import { Button } from '@/components/ui/button';

function StartNowSection() {
  return (
    <section className="relative py-12 w-full overflow-visible bg-[linear-gradient(90deg,#9360E369_41%,#F8FAFC_70%,#FFFFFF_100%)] flex justify-center">
      <div
        className="flex justify-between items-center rounded-3xl bg-white py-3.5 px-8 w-[1024px]"
        style={{ boxShadow: '0 20px 50px 0 rgba(124, 58, 237, 0.10)' }}
      >
        <div className="flex flex-col justify-between">
          <p className="typo-h4-bd">지금 바로 워크스페이스에 들어가 보세요</p>
          <p className="typo-b2-md text-[#64748B]">
            데모에서는 대시보드·프로젝트 목록·에이전트 화면까지 연결해
            <br />
            두었습니다. 로그인 없이 해시만으로 이동해 볼 수 있어요.
          </p>
        </div>
        <Button className="rounded-xl">
          <p className="typo-b1-eb">무료로 시작하기</p>
        </Button>
      </div>
    </section>
  );
}

export default StartNowSection;
