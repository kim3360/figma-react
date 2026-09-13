import { useCallback, useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { ArrowRight, X } from 'lucide-react';
import { useGitHubLogin } from '@/hooks/useGitHubLogin';
import { useIsLoggedIn } from '@/hooks/useIsLoggedIn';

const NAV_ITEMS = [
  { label: '서비스 소개', id: 'intro' },
  { label: '요금제', id: 'pricing' },
  { label: '도움말', id: 'process' },
  { label: '공지/소식', id: 'reviews' },
  { label: '이벤트', id: 'showcase' },
  { label: '블로그', id: 'footer' },
] as const;

function scrollToSection(sectionId: string) {
  const target = document.getElementById(sectionId);
  if (!target) return;
  const header = document.querySelector('header');
  const offset = header instanceof HTMLElement ? header.offsetHeight + 12 : 84;
  const top = target.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
}

function HeaderContainer() {
  const [bannerOpen, setBannerOpen] = useState(true);

  const navigate = useNavigate();
  const { startGitHubLogin, isLoading: isLoggingIn } = useGitHubLogin();
  const [isLoggedIn] = useIsLoggedIn();

  const handleAuth = useCallback(() => {
    if (isLoggingIn) return;
    if (isLoggedIn) {
      void navigate({ to: '/home' });
      return;
    }
    void startGitHubLogin();
  }, [isLoggedIn, isLoggingIn, navigate, startGitHubLogin]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white">
      <div className="relative mx-auto flex h-[72px] w-full max-w-[1280px] items-center justify-between px-6">
        <Link to="/" className="relative z-10 text-[22px] font-extrabold tracking-tight text-black">
          Qeploy
        </Link>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 text-[14px] font-medium text-[#4B5563] md:flex">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => scrollToSection(item.id)}
              className="whitespace-nowrap transition hover:text-black"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="relative z-10 flex items-center gap-5">
          <button
            type="button"
            disabled={isLoggingIn}
            onClick={handleAuth}
            className="inline-flex h-10 items-center gap-1.5 rounded-full bg-[#7C3AED] px-5 text-[14px] font-semibold text-white shadow-[0_6px_16px_rgba(124,58,237,0.28)] transition hover:bg-[#6D28D9] disabled:opacity-60"
          >
            시작하기
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>

      {bannerOpen ? (
        <div className="relative flex w-full items-center justify-center bg-[#1e1b4b] px-12 py-2.5 text-white">
          <p className="truncate text-center text-[13px]">
            <b>쓰던 GitHub에 Qeploy를 연결하세요.</b> 말로 설명하면 홈페이지가 만들어집니다.
          </p>
          <button
            type="button"
            onClick={handleAuth}
            disabled={isLoggingIn}
            className="ml-3 shrink-0 rounded-md border border-white/70 px-3 py-1 text-[12px] font-semibold disabled:opacity-60"
          >
            연결 방법 보기
          </button>
          <button
            type="button"
            aria-label="안내 닫기"
            onClick={() => setBannerOpen(false)}
            className="absolute right-4 text-white/80 hover:text-white"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : null}
    </header>
  );
}

export default HeaderContainer;
