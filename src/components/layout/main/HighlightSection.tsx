import HighlightSectionBgImg from '@/assets/images/highlightSection_bg_img.svg';

function HighlightSection() {
  return (
    <section className="relative w-full overflow-visible bg-[linear-gradient(90deg,#F3EEFF_0%,#FDFBFF_100%)]">
      <img
        src={HighlightSectionBgImg}
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 z-0 max-w-none select-none"
      />
      <div className="relative z-10 flex flex-col items-center justify-center gap-1 py-23">
        <p className="text-[#94A3B8] text-md">이제는 결과물로 증명할 시간입니다</p>
        <p className="text-[#7C3AED] text-3xl font-bold">걱정하지 마세요.</p>
        <p className="typo-h1-bd leading-tight text-center">
          말로 설명한 만큼,
          <br />
          웹이 따라옵니다
        </p>
        <p className="text-[#475569] text-md text-center font-semibold ">
          AI 시대에 영업·마케팅만큼 중요한 건
          <span className="text-[#111827]">첫인상을 만드는 웹 경험</span>입니다.
          <br />
          Dvely는 그 첫 화면을 팀이 같은 속도로 만들 수 있게 돕습니다.
        </p>
      </div>
    </section>
  );
}

export default HighlightSection;
