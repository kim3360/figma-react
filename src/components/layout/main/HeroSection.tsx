import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useGitHubLogin } from '@/hooks/useGitHubLogin';
import { useIsLoggedIn } from '@/hooks/useIsLoggedIn';
import { cn } from '@/lib/utils';

type Phase =
  | 'logo'
  | 'roll'
  | 'dot'
  | 'orbit'
  | 'scatter'
  | 'pill'
  | 'type'
  | 'cuts'
  | 'headline'
  | 'copy';

const LOGO_CHARS = ['Q', 'e', 'p', 'l', 'o', 'y'] as const;

const PROMPT = 'IT 기업 홈페이지, 블루 계열로 만들어주세요';

const CUT_WORDS = ['랜딩', '포트폴리오', '쇼핑몰', '관리자', '미디어'] as const;

const ROLES = ['웹에이전시', '디자인 스튜디오', '개발팀', '배포 파이프라인'] as const;

const ORBIT_WORDS = [
  { word: 'GitHub', slot: 'top' },
  { word: 'Agent', slot: 'right' },
  { word: 'Preview', slot: 'bottom' },
  { word: 'Deploy', slot: 'left' },
] as const;

const PHASE_AT: Array<[Phase, number]> = [
  ['logo', 0],
  ['roll', 900],
  ['dot', 1900],
  ['orbit', 2700],
  ['scatter', 5000],
  ['pill', 6600],
  ['type', 7600],
  ['cuts', 11200],
  ['headline', 14200],
  ['copy', 15600],
];

function scrollToSection(sectionId: string) {
  const target = document.getElementById(sectionId);
  if (!target) return;
  const header = document.querySelector('header');
  const offset = header instanceof HTMLElement ? header.offsetHeight + 12 : 84;
  const top = target.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
}

function scatterOffset(word: string, index: number, slot: string) {
  const mid = (word.length - 1) / 2;
  const x = (index - mid) * 34;
  const spread = 18 + index * 12;

  if (slot === 'top') return { x, y: -36 - spread };
  if (slot === 'bottom') return { x, y: 36 + spread };
  if (slot === 'left') return { x: -40 - spread, y: (index - mid) * 22 };
  return { x: 40 + spread, y: (index - mid) * 22 };
}

function getPrefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function HeroSection() {
  const [reduceMotion] = useState(getPrefersReducedMotion);
  const [phase, setPhase] = useState<Phase>(reduceMotion ? 'copy' : 'logo');
  const [typed, setTyped] = useState(reduceMotion ? PROMPT : '');
  const [cutIndex, setCutIndex] = useState(0);
  const [roleIndex, setRoleIndex] = useState(0);

  const navigate = useNavigate();
  const { startGitHubLogin, isLoading: isLoggingIn } = useGitHubLogin();
  const [isLoggedIn] = useIsLoggedIn();

  const showLogo = phase === 'logo' || phase === 'roll';
  const showDot = phase === 'dot' || phase === 'orbit' || phase === 'scatter';
  const showOrbit = phase === 'orbit' || phase === 'scatter';
  const showPill = phase === 'pill' || phase === 'type';
  const showCuts = phase === 'cuts';
  const showHeadline = phase === 'headline' || phase === 'copy';
  const showCopy = phase === 'copy';

  const handleAuth = useCallback(() => {
    if (isLoggingIn) return;
    if (isLoggedIn) {
      void navigate({ to: '/home' });
      return;
    }
    void startGitHubLogin();
  }, [isLoggedIn, isLoggingIn, navigate, startGitHubLogin]);

  useEffect(() => {
    if (reduceMotion) return;

    const timers = PHASE_AT.filter(([, at]) => at > 0).map(([nextPhase, at]) =>
      window.setTimeout(() => setPhase(nextPhase), at),
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [reduceMotion]);

  useEffect(() => {
    if (phase !== 'type' || reduceMotion) return;

    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setTyped(PROMPT.slice(0, index));
      if (index >= PROMPT.length) window.clearInterval(timer);
    }, 48);

    return () => window.clearInterval(timer);
  }, [phase, reduceMotion]);

  useEffect(() => {
    if (phase !== 'cuts' || reduceMotion) return;

    const timer = window.setInterval(() => {
      setCutIndex((current) => (current + 1) % CUT_WORDS.length);
    }, 620);

    return () => window.clearInterval(timer);
  }, [phase, reduceMotion]);

  useEffect(() => {
    if (!showHeadline) return;

    const timer = window.setInterval(() => {
      setRoleIndex((current) => (current + 1) % ROLES.length);
    }, 2200);

    return () => window.clearInterval(timer);
  }, [showHeadline]);

  return (
    <section className="relative h-screen w-full overflow-hidden bg-white text-[#111827]">
      <div className="relative z-10 flex h-full items-center justify-center">
        <div className="pointer-events-none absolute inset-0">
          <span
            className={cn(
              'absolute top-1/2 left-1/2 size-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.28)_0%,rgba(124,58,237,0)_70%)] transition-opacity duration-500',
              showDot || showPill ? 'hero-wave' : 'opacity-0',
            )}
          />
          <span
            className={cn(
              'absolute top-1/2 left-1/2 size-[120px] rounded-full border-2 border-[#7C3AED]/50 transition-opacity duration-500',
              showDot ? 'hero-ring' : 'opacity-0',
            )}
          />
          <span
            className={cn(
              'absolute top-1/2 left-1/2 size-[168px] rounded-full border border-[#7C3AED]/25 transition-opacity duration-500',
              showDot ? 'hero-ring [animation-delay:280ms]' : 'opacity-0',
            )}
          />
        </div>

        <div
          className={cn(
            'absolute flex items-end gap-2 transition-all duration-700',
            showLogo ? 'scale-100 opacity-100' : 'pointer-events-none scale-75 opacity-0',
          )}
        >
          <p className="flex overflow-hidden text-[64px] leading-none font-extrabold tracking-tight sm:text-[84px]">
            {LOGO_CHARS.map((char, index) => (
              <span
                key={`${char}-${index}`}
                className="hero-char inline-block text-[#7C3AED]"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                {char}
              </span>
            ))}
          </p>
          <div className="mb-1 h-10 w-[8.5rem] overflow-hidden text-[32px] font-bold sm:h-12 sm:w-[11rem] sm:text-[40px]">
            <div
              className={cn(
                'transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]',
                phase === 'roll' || !showLogo
                  ? '-translate-y-10 sm:-translate-y-12'
                  : 'translate-y-0',
              )}
            >
              <p className="flex h-10 items-center leading-none text-[#94A3B8] sm:h-12">AI</p>
              <p className="flex h-10 items-center leading-none text-[#7C3AED] sm:h-12">Agent</p>
            </div>
          </div>
        </div>

        <div
          className={cn(
            'hero-morph absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden',
            showDot &&
              'h-[88px] w-[88px] rounded-full bg-[#7C3AED] shadow-[0_0_40px_rgba(124,58,237,0.35)]',
            phase === 'pill' &&
              'h-16 w-[min(92vw,540px)] rounded-full bg-[#7C3AED] shadow-[0_0_36px_rgba(124,58,237,0.28)]',
            phase === 'type' &&
              'h-16 w-[min(92vw,540px)] rounded-full bg-white shadow-[0_0_28px_rgba(124,58,237,0.18)]',
            !showDot && !showPill && 'h-8 w-8 scale-50 rounded-full bg-[#7C3AED] opacity-0',
          )}
        >
          {showDot ? (
            <span className="text-[40px] leading-none font-bold text-white">Q</span>
          ) : null}
          {showPill ? (
            <p className="w-full px-7 text-left text-[18px] font-medium tracking-tight text-[#111827]">
              {typed}
              {phase === 'type' ? (
                <span className="hero-caret ml-0.5 inline-block h-[1.05em] w-px bg-[#7C3AED] align-[-2px]" />
              ) : null}
            </p>
          ) : null}
        </div>

        {showOrbit
          ? ORBIT_WORDS.map((item) => (
              <p
                key={item.word}
                className={cn(
                  'hero-orbit-word absolute text-[28px] font-semibold tracking-tight text-[#111827]',
                  item.slot === 'top' && 'top-[calc(50%-132px)] left-1/2 -translate-x-1/2',
                  item.slot === 'bottom' && 'bottom-[calc(50%-132px)] left-1/2 -translate-x-1/2',
                  item.slot === 'left' && 'top-1/2 left-[calc(50%-220px)] -translate-y-1/2',
                  item.slot === 'right' && 'top-1/2 right-[calc(50%-220px)] -translate-y-1/2',
                )}
              >
                {item.word.split('').map((char, index) => {
                  const offset = scatterOffset(item.word, index, item.slot);
                  const scattered = phase === 'scatter';
                  return (
                    <span
                      key={`${item.word}-${index}`}
                      className="inline-block transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                      style={{
                        transform: scattered
                          ? `translate(${offset.x}px, ${offset.y}px)`
                          : 'translate(0, 0)',
                        opacity: scattered ? 0.55 : 1,
                      }}
                    >
                      {char}
                    </span>
                  );
                })}
              </p>
            ))
          : null}

        {showCuts ? (
          <p
            key={CUT_WORDS[cutIndex]}
            className="hero-cut-word absolute text-[72px] font-extrabold tracking-tight sm:text-[104px]"
          >
            {CUT_WORDS[cutIndex]}
            <span className="ml-1 inline-block size-[0.18em] translate-y-[-0.12em] rounded-full bg-[#7C3AED]" />
          </p>
        ) : null}

        <div
          className={cn(
            'relative z-10 flex max-w-[760px] flex-col items-center text-center transition-all duration-700',
            showHeadline
              ? 'translate-y-0 opacity-100'
              : 'pointer-events-none translate-y-8 opacity-0',
          )}
        >
          <h1 className="text-[32px] leading-[1.18] font-extrabold tracking-tight sm:text-[52px]">
            당신의 아이디어는 오늘부터
            <br />
            <span key={ROLES[roleIndex]} className="hero-role-in inline-block text-[#7C3AED]">
              {ROLES[roleIndex]}
            </span>
            입니다
            <span className="ml-1 inline-block size-[0.18em] translate-y-[-0.18em] rounded-full bg-[#7C3AED]" />
          </h1>
          <p
            className={cn(
              'mt-5 text-[15px] leading-relaxed text-[#475569] transition-all delay-150 duration-700 sm:text-[17px]',
              showCopy ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
            )}
          >
            Qeploy를 연결하면 말로 설명한 서비스가
            <br />
            디자인되고, 개발되고, 배포까지 이어집니다.
          </p>
          <div
            className={cn(
              'pointer-events-auto mt-8 flex items-center gap-3 transition-all delay-200 duration-700',
              showCopy
                ? 'translate-y-0 opacity-100'
                : 'pointer-events-none translate-y-3 opacity-0',
            )}
          >
            <button
              type="button"
              onClick={() => scrollToSection('intro')}
              className="h-12 rounded-full border border-[#CBD5E1] px-6 text-[14px] font-bold text-[#334155] transition hover:-translate-y-0.5 hover:bg-slate-50"
            >
              자세히 보기
            </button>
            <button
              type="button"
              disabled={isLoggingIn}
              onClick={handleAuth}
              className="inline-flex h-12 items-center gap-1 rounded-full bg-[#7C3AED] px-6 text-[14px] font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#6D28D9] disabled:opacity-60"
            >
              무료로 시작하기
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => scrollToSection('showcase')}
        className="absolute bottom-10 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 text-[14px] font-semibold text-[#334155] transition hover:text-[#7C3AED]"
      >
        Qeploy로 만든 제작 사례 보기
        <ChevronDown className="size-4" />
      </button>
    </section>
  );
}

export default HeroSection;
