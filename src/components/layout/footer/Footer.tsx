import instagramIcon from '@/assets/icons/instagram.svg';
import youtubeIcon from '@/assets/icons/youtube.svg';
import companyIcon from '@/assets/icons/company.svg';

const quickLinks = ['프로그램', '추천', '기능', '후기', '요금', 'FAQ', '결과물'];

const footerColumns = [
  {
    title: '제품',
    items: ['AI 생성', '프로젝트', '템플릿·유형', '요금제'],
  },
  {
    title: '리소스',
    items: ['가이드', '블로그', '업데이트', '활용 사례'],
  },
  {
    title: '회사',
    items: ['채용', '문의', '보안', '제휴'],
  },
  {
    title: '약관',
    items: ['이용약관', '개인정보처리방침'],
  },
];

export default function Footer() {
  return (
    <footer className="w-full border-t border-[#0B0C12]/8 bg-white">
      <div className="mx-auto w-[1120px] pt-[52px] pb-[34px]">
        <div className="flex items-center justify-between pb-[30px]">
          <div className="flex items-center gap-[10px]">
            <div className="size-8 rounded-[10px] border border-[#7C3AED]/20 bg-[linear-gradient(135deg,rgba(192,132,252,0.95)_0%,rgba(109,40,217,0.75)_100%)] shadow-[0_8px_20px_0_rgba(124,58,237,0.2)]" />
            <p
              className="text-[32px] leading-none tracking-[-0.44px] text-[#0B0C12]"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Devely
            </p>
          </div>

          <ul className="flex items-center gap-[14px]">
            {quickLinks.map((link, index) => (
              <li key={link} className="flex items-center gap-[12px]">
                <button className="typo-b5-rg text-[#5C576F] hover:text-[#0B0C12] cursor-pointer">
                  {link}
                </button>
                {index < quickLinks.length - 1 ? (
                  <span className="h-[10px] w-px bg-[#0B0C12]/12" />
                ) : null}
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-4 gap-x-7 pb-7">
          {footerColumns.map((column) => (
            <div key={column.title} className="flex flex-col gap-[11px]">
              <h3 className="typo-b5-sb text-[#0B0C12]">{column.title}</h3>
              <ul className="flex flex-col gap-2">
                {column.items.map((item) => (
                  <li key={item} className="typo-b5-rg text-[#3D3A47]">
                    <button className="text-left hover:text-[#0B0C12] cursor-pointer">
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-[#0B0C12]/10 pt-7">
          <p className="typo-b5-rg text-[#6B6578]">
            (주)데블리 · 대표이사 홍길동 · 개인정보보호책임자 privacy@devely.ai · 고객센터 1588-0000
            · 서울특별시 강남구 테헤란로 000
          </p>
          <div className="mt-3 flex items-center gap-4">
            <button className="typo-b5-rg text-[#5C576F] hover:text-[#0B0C12]">이용약관</button>
            <button className="typo-b5-sb text-[#0B0C12] hover:opacity-80">개인정보처리방침</button>
            <button className="typo-b5-rg text-[#5C576F] hover:text-[#0B0C12]">쿠키 정책</button>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-[#0B0C12]/10 pt-[21px]">
          <p className="typo-b5-rg text-[#6B6578]">© Devely Demo. All rights reserved.</p>
          <div className="flex items-center gap-[18px] text-[#1A1A1A]/70">
            <button aria-label="회사">
              <img src={companyIcon} alt="회사" />
            </button>
            <button aria-label="유튜브" className="text-[#FF3B30]">
              <img src={youtubeIcon} alt="유튜브" />
            </button>
            <button aria-label="인스타그램">
              <img src={instagramIcon} alt="인스타그램" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
