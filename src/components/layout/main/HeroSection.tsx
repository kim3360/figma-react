import { useNavigate } from '@tanstack/react-router';
import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import githubIcon from '@/assets/icons/github.svg';
import heroSectionImage from '@/assets/images/heroSection_img.svg';
import heroSectionBgImage from '@/assets/images/heroSection_bg_img.svg';
import { useGitHubLogin } from '@/hooks/useGitHubLogin';
import { useIsLoggedIn } from '@/hooks/useIsLoggedIn';

const headlineGradientBg =
  'bg-[linear-gradient(90deg,#6D28D9_0%,#7C3AED_42%,#A855F7_100%)] bg-clip-text text-transparent';

function HeroSection() {
  const {
    startGitHubLogin,
    isLoading: isLoggingIn,
    errorMessage: loginErrorMessage,
  } = useGitHubLogin();
  const [isLoggedIn] = useIsLoggedIn();
  const navigate = useNavigate();

  const handleGitHubLogin = useCallback(() => {
    if (isLoggingIn) return;
    if (isLoggedIn) {
      void navigate({ to: '/home' });
      return;
    }
    void startGitHubLogin();
  }, [isLoggingIn, isLoggedIn, navigate, startGitHubLogin]);

  return (
    <section className="relative w-full">
      <img
        src={heroSectionBgImage}
        alt="배경이미지"
        aria-hidden
        className="pointer-events-none absolute top-0 right-0 z-0 max-w-none select-none"
      />
      <div className="relative z-10 flex items-center justify-center gap-9 pb-44 pt-20">
        <div className="flex flex-col gap-2.5 w-[662px]">
          <p className="text-[#5B21B6] text-lg font-semibold">AI 웹 제작 · 프롬프트부터 배포까지</p>
          <p className="typo-h1-bd leading-tight">
            <span className={`block w-max max-w-full ${headlineGradientBg}`}>
              기획서 없이도 괜찮아요,
            </span>
            <span className="block w-max max-w-full tracking-tight">
              <span className={`inline ${headlineGradientBg} tracking-tight`}>
                말로 설명하면 사이트가 완성
              </span>
              <span className="text-[#111827] tracking-tight">됩니다</span>
            </span>
          </p>
          <p className="text-[#475569] text-md">
            디자인·카피·레이아웃을 AI가 한 번에 제안하고, 에이전트와 대화하며 계속 다듬을 수
            있습니다.
            <br />
            혼자 붙잡고 있던 랜딩·포트폴리오를{' '}
            <span className="text-[#111827] font-semibold">실제 URL까지</span> 이어 보세요.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLoggingIn}
            onClick={handleGitHubLogin}
            className="border-[#767676] py-2.5 text-md font-semibold rounded-2xl w-[578px] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div className="flex items-center gap-4.5">
              {!isLoggedIn ? (
                <img src={githubIcon} alt="GitHub" className="h-[38px] w-[38px]" />
              ) : null}
              {isLoggingIn
                ? '연결 중...'
                : isLoggedIn
                  ? '워크스페이스 이동하기'
                  : 'GitHub로 연결하기'}
            </div>
          </Button>
          {loginErrorMessage ? <p className="text-sm text-red-600">{loginErrorMessage}</p> : null}
          <div className="flex items-center gap-2.5">
            <Button variant="outline" size="xs" className="rounded-full px-4">
              <p className="font-semibold">
                에이전트 <span className="text-xs text-[#475569]">대화형 수정</span>
              </p>
            </Button>
            <Button variant="outline" size="xs" className="rounded-full px-4">
              <p className="font-semibold">
                ZIP·GitHub <span className="text-xs text-[#475569]">가져오기</span>
              </p>
            </Button>
            <Button variant="outline" size="xs" className="rounded-full px-4">
              <p className="font-semibold">
                빌드·배포 <span className="text-xs text-[#475569]">한 흐름</span>
              </p>
            </Button>
          </div>
        </div>
        <div className="relative shrink-0">
          <img src={heroSectionImage} alt="" className="relative" />
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
