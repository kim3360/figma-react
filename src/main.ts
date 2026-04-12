import "./landing.css";
import "./app.css";

function getAppRoot(): HTMLDivElement {
  const el = document.querySelector<HTMLDivElement>("#app");
  if (!el) throw new Error("Missing #app element");
  return el;
}

const root = getAppRoot();

const HASH_DASHBOARD = "#/app";
const HASH_MAIN_ALT = "#/main";
const HASH_PROJECTS = "#/app/projects";

function isAppRoute(): boolean {
  const h = window.location.hash;
  return h === HASH_DASHBOARD || h === HASH_MAIN_ALT || h.startsWith("#/app/");
}

type AppRoute =
  | { kind: "dashboard" }
  | { kind: "projects" }
  | { kind: "project"; slug: string };

function parseAppRoute(): AppRoute {
  const h = window.location.hash;
  if (h === HASH_PROJECTS || h === "#/app/projects/") {
    return { kind: "projects" };
  }
  const prefix = "#/app/projects/";
  if (h.startsWith(prefix)) {
    const rest = h.slice(prefix.length).replace(/\/$/, "");
    const slug = rest.split("/")[0];
    if (slug) {
      return { kind: "project", slug: decodeURIComponent(slug) };
    }
  }
  return { kind: "dashboard" };
}

function getAppLayoutHTML(
  active: "dashboard" | "projects",
  mainInnerHTML: string,
): string {
  const dashActive = active === "dashboard" ? " app-sidebar__link--active" : "";
  const projActive = active === "projects" ? " app-sidebar__link--active" : "";
  return `
  <div class="app-shell">
    <aside class="app-sidebar" aria-label="메인 메뉴">
      <div class="app-sidebar__brand">
        <span class="app-sidebar__mark" aria-hidden="true"></span>
        <div class="app-sidebar__brand-text">
          <span class="app-sidebar__title">Devely</span>
          <span class="app-sidebar__tagline">AI 웹 자동 생성</span>
        </div>
      </div>
      <nav class="app-sidebar__nav">
        <a class="app-sidebar__link${dashActive}" href="${HASH_DASHBOARD}">대시보드</a>
        <a class="app-sidebar__link${projActive}" href="${HASH_PROJECTS}">프로젝트</a>
        <a class="app-sidebar__link" href="${HASH_DASHBOARD}">템플릿</a>
        <a class="app-sidebar__link" href="${HASH_DASHBOARD}">분석</a>
        <a class="app-sidebar__link" href="${HASH_DASHBOARD}">설정</a>
      </nav>
      <div class="app-sidebar__section">
        <p class="app-sidebar__label">워크스페이스</p>
        <div class="app-sidebar__pill">데모 팀 · Pro</div>
      </div>
      <a class="app-sidebar__logout" href="#/">← 랜딩으로 나가기</a>
    </aside>
    <div class="app-main">
      ${mainInnerHTML}
    </div>
  </div>
`;
}

function getLandingHTML(): string {
  return `
  <div class="container">
    <header class="topbar">
      <div class="brand" aria-label="Brand">
        <div class="brand-mark" aria-hidden="true"></div>
        <div class="brand-title">
          <strong>Devely</strong>
        </div>
      </div>

      <nav class="nav" aria-label="Primary navigation">
        <a href="#features">기능</a>
        <a href="#content">사용 방법</a>
        <a href="#how">작동 방식</a>
        <a href="#pricing">요금</a>
      </nav>

      <div class="actions">
        <button class="btn btn-ghost" type="button">도입 문의</button>
        <button class="btn btn-primary btn-github" type="button" id="btnLogin">
          GitHub 로그인
        </button>
      </div>
    </header>

    <section class="hero" aria-label="Hero section">
      <div class="hero-copy">
        <div class="badge"><i aria-hidden="true"></i> AI 웹 빌더 · 프롬프트 → 완성 페이지</div>
        <h1>
          <span class="hero-line">말로 설명하면,</span>
          <span class="hero-line hero-line--accent"
            ><span class="hero-gradient">웹사이트가 완성</span>됩니다</span
          >
        </h1>
        <p class="lead">
          Devely는 디자인·레이아웃·문구까지 AI가 한 번에 짜 주는 자동 웹 제작 도구입니다.
          원하는 톤만 말로 더하면 섹션과 스타일이 바로 따라옵니다.
        </p>

        <form class="prompt prompt--hero" id="promptForm">
          <div class="prompt__field">
            <label class="prompt__label" for="promptInput">무엇을 만들까요?</label>
            <input
              id="promptInput"
              name="prompt"
              type="text"
              placeholder="예: 감성 카페 브랜드용 다크톤 랜딩, 예약 버튼 강조"
              autocomplete="off"
            />
          </div>
          <button class="btn btn-primary btn-generate" type="submit">
            <span class="btn-generate__spark" aria-hidden="true"></span>
            AI로 웹 만들기
          </button>
        </form>

        <p class="status" id="status" aria-live="polite"></p>

        <div class="hero-meta" aria-label="Highlights">
          <div class="chip"><strong>코드 없이</strong> 전체 페이지</div>
          <div class="chip"><strong>대화로</strong> 계속 수정</div>
          <div class="chip"><strong>반응형</strong> · 배포까지 한 흐름</div>
        </div>
      </div>

      <div class="mock-wrap">
        <div class="mock-window" aria-label="Preview mockup">
          <div class="mock-top">
            <div class="traffic" aria-hidden="true">
              <span class="dot red"></span>
              <span class="dot yellow"></span>
              <span class="dot green"></span>
            </div>
            <div class="mock-title">AI 생성 미리보기</div>
          </div>

          <div class="mock-body">
            <div class="mock-grid">
              <div class="mock-left">
                <h3>프로젝트</h3>
                <div class="mock-thumb-row">
                  <div class="thumb"></div>
                  <div class="thumb"></div>
                </div>
                <div class="mock-thumb-row" style="margin-top:10px;">
                  <div class="thumb"></div>
                  <div class="thumb"></div>
                </div>

                <div style="height:12px;"></div>
                <div class="pill-row">
                  <span class="pill active">웹</span>
                  <span class="pill">랜딩</span>
                </div>
              </div>

              <div class="mock-center">
                <div class="pill-row">
                  <span class="pill active">제작</span>
                  <span class="pill">검수</span>
                  <span class="pill">배포</span>
                </div>

                <div class="mock-panel">
                  <div class="mock-panel-left" aria-hidden="true">
                    <div class="mock-swatch purple"></div>
                    <div class="mock-swatch"></div>
                    <div class="mock-swatch"></div>
                  </div>
                  <div class="mock-panel-right">
                    <div class="mock-line mid"></div>
                    <div class="mock-line short"></div>
                    <div class="mock-line mid"></div>

                    <div class="mock-actions">
                      <button class="mini-btn primary" type="button">✦ AI 생성</button>
                      <button class="mini-btn" type="button">대화로 수정</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>

  <section id="content" class="section content">
    <div class="container">
      <div class="content-split">
        <div class="content-media" aria-label="콘텐츠 미리보기 목업">
          <div class="content-stack" aria-hidden="true">
            <div class="stack-card stack-1"></div>
            <div class="stack-card stack-2"></div>
            <div class="stack-card stack-3"></div>
            <div class="stack-badge">AI</div>
          </div>
        </div>

        <div class="content-panel">
          <div class="panel-block">
            <div class="panel-eyebrow">왜 Devely인가요</div>
            <h2>웹 제작의 대부분을 AI에 맡기세요</h2>
            <p>
              섹션 구조, 타이포·컬러, 버튼 문구까지 모델이 한 번에 제안합니다.
              “조금 더 미니멀하게”, “히어로에 영상 느낌”처럼 말로만 다시 요청하면 됩니다.
            </p>
          </div>

          <div class="panel-block">
            <div class="panel-eyebrow accent">프롬프트가 곧 기획서</div>
            <p>
              별도 디자인 툴 없이 초안부터 배포 파이프라인까지 같은 화면에서 이어집니다.
              팀은 검수와 도메인 연결에만 집중하면 됩니다.
            </p>
          </div>

          <div class="panel-block">
            <div class="panel-eyebrow">이렇게 씁니다</div>
            <ol class="usage-steps">
              <li>프롬프트에 “콘셉트 + 원하는 톤”을 한 문장으로 작성</li>
              <li>페이지 생성 후, 버튼 문구/섹션 구성/색감을 조정</li>
              <li>원하는 결과가 나오면 내보내기(배포) 단계로 진행</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section id="features" class="section">
    <div class="container">
      <div class="section-head">
        <div>
          <h2>AI가 챙기는 것들</h2>
          <p>반복 작업은 자동화하고, 당신은 메시지와 브랜드에만 집중하세요.</p>
        </div>
      </div>

      <div class="feature-grid">
        <article class="card card--feature">
          <div class="ic" aria-hidden="true">01</div>
          <h3>레이아웃 자동 조립</h3>
          <p>히어로·기능 소개·후기·CTA까지 콘셉트에 맞는 순서와 여백으로 구성합니다.</p>
        </article>
        <article class="card card--feature">
          <div class="ic" aria-hidden="true">02</div>
          <h3>브랜드 톤 맞춤</h3>
          <p>다크/라이트, 미니멀/감성 등 키워드만으로 타이포와 컬러 시스템을 맞춥니다.</p>
        </article>
        <article class="card card--feature">
          <div class="ic" aria-hidden="true">03</div>
          <h3>대화형 수정</h3>
          <p>문구·섹션 순서·컴포넌트 교체를 자연어로 요청하면 바로 반영된 초안을 받습니다.</p>
        </article>
      </div>
    </div>
  </section>

  <section id="how" class="section" style="padding-top:0;">
    <div class="container">
      <div class="section-head">
        <div>
          <h2>작동 방식</h2>
          <p>입력 → AI 생성 → 대화로 다듬기 → 빌드·배포까지 한 플로우로 이어집니다.</p>
        </div>
      </div>

      <div class="feature-grid">
        <article class="card card--feature">
          <div class="ic" aria-hidden="true">A</div>
          <h3>의도를 문장으로</h3>
          <p>누구를 위한 사이트인지, 어떤 행동을 유도할지, 분위기는 어떤지 적어 주세요.</p>
        </article>
        <article class="card card--feature">
          <div class="ic" aria-hidden="true">B</div>
          <h3>모델이 페이지 조립</h3>
          <p>구조·스타일·카피를 한 번에 생성해 브라우저에서 바로 미리볼 수 있습니다.</p>
        </article>
        <article class="card card--feature">
          <div class="ic" aria-hidden="true">C</div>
          <h3>피드백을 이어 붙이기</h3>
          <p>“여기 문구 짧게”, “네비 고정”처럼 추가 요청을 쌓아가며 완성도를 올립니다.</p>
        </article>
      </div>
    </div>
  </section>

  <section id="pricing" class="section">
    <div class="container">
      <div class="pricing-shell" role="region" aria-label="Pricing comparison">
        <div class="pricing-top">
          <div class="pricing-intro">
            <div class="pricing-title">
              한눈에
              <br />
              비교해 보세요
            </div>
            <div class="pricing-sub">솔루션 선택이 어려우신가요?</div>
          </div>

          <div class="pricing-plans" aria-label="Plans">
            <article class="plan-card">
              <div class="plan-name">고도물 basic</div>
              <div class="plan-price">
                <span class="plan-amount">0원</span>
                <span class="plan-unit">/월</span>
              </div>
              <div class="plan-desc">강력한 기능의 평생 무료 쇼핑몰. 외부 서비스 연동에 제한이 없어요.</div>
              <ul class="plan-bullets">
                <li>월 이용료 0원</li>
                <li>프로로 업그레이드 가능</li>
              </ul>
              <button class="plan-button" type="button">고도물 basic 시작하기</button>
            </article>

            <article class="plan-card plan-card--featured">
              <div class="plan-name">고도물 pro</div>
              <div class="plan-price">
                <span class="plan-amount">33,000원</span>
                <span class="plan-unit">/월</span>
              </div>
              <div class="plan-desc">커스터마이징 통합 양장 기능. 더 넓은 영역을 운영하고 싶은 팀에 적합해요.</div>
              <ul class="plan-bullets">
                <li>basic 모든 기능 포함</li>
                <li>DB 커스텀마이징 가능</li>
                <li>관리자 커스텀디자인 가능</li>
              </ul>
              <button class="plan-button plan-button--featured" type="button">고도물 pro 시작하기</button>
            </article>

            <article class="plan-card">
              <div class="plan-name">삼바이 enterprise</div>
              <div class="plan-price">
                <span class="plan-amount">99,000원</span>
                <span class="plan-unit">/월</span>
              </div>
              <div class="plan-desc">확장성과 안정성을 갖춘 풀패키지. 대규모 트래픽과 고급 기능이 필요할 때.</div>
              <ul class="plan-bullets">
                <li>헤드리스 플랫포</li>
                <li>웹사이트 지원</li>
                <li>기존 비즈니스 API 연동</li>
              </ul>
              <button class="plan-button" type="button">삼바이 enterprise 시작하기</button>
            </article>
          </div>
        </div>

        <div class="pricing-table" aria-label="Feature comparison table">
          <div class="pricing-table-grid pricing-table-grid--head">
            <div class="pricing-th pricing-td--label"></div>
            <div class="pricing-th">고도물 basic</div>
            <div class="pricing-th">고도물 pro</div>
            <div class="pricing-th">삼바이 enterprise</div>
          </div>

          <div class="pricing-table-grid">
            <div class="pricing-td pricing-td--label">트래픽</div>
            <div class="pricing-td pricing-td--center">✓</div>
            <div class="pricing-td pricing-td--center">✓</div>
            <div class="pricing-td pricing-td--center">✓</div>
          </div>
          <div class="pricing-table-grid">
            <div class="pricing-td pricing-td--label">스토리지</div>
            <div class="pricing-td pricing-td--center">4GB</div>
            <div class="pricing-td pricing-td--center">4GB(추가 가능)</div>
            <div class="pricing-td pricing-td--center">무제한</div>
          </div>
          <div class="pricing-table-grid">
            <div class="pricing-td pricing-td--label">공급사 관리</div>
            <div class="pricing-td pricing-td--center">✓</div>
            <div class="pricing-td pricing-td--center">✓</div>
            <div class="pricing-td pricing-td--center">✓</div>
          </div>
          <div class="pricing-table-grid">
            <div class="pricing-td pricing-td--label">모바일 앱 지원</div>
            <div class="pricing-td pricing-td--center">✓</div>
            <div class="pricing-td pricing-td--center">무료 &amp; 앱 푸시 유지</div>
            <div class="pricing-td pricing-td--center">무료 &amp; 앱 푸시 유지</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <footer class="site-footer" aria-label="사이트 하단 정보">
    <div class="container site-footer__inner">
      <div class="site-footer__top">
        <a class="site-footer__logo" href="#">
          <span class="site-footer__logo-mark" aria-hidden="true"></span>
          <span class="site-footer__logo-text">Devely</span>
        </a>
        <div class="site-footer__quick-links" aria-label="빠른 링크">
          <a href="#">회사 소개</a>
          <a href="#">요금</a>
          <a href="#">파트너십 문의</a>
          <a href="#">고객센터</a>
          <a href="#">보안</a>
        </div>
      </div>

      <div class="site-footer__grid">
        <nav class="footer-col" aria-label="제품">
          <h3 class="footer-col__title">제품</h3>
          <ul class="footer-col__list">
            <li><a href="#">랜딩 생성기</a></li>
            <li><a href="#">프로젝트 관리</a></li>
            <li><a href="#">템플릿</a></li>
            <li><a href="#">요금제</a></li>
          </ul>
        </nav>
        <nav class="footer-col" aria-label="솔루션">
          <h3 class="footer-col__title">솔루션</h3>
          <ul class="footer-col__list">
            <li><a href="#">에이전시</a></li>
            <li><a href="#">커머스</a></li>
            <li><a href="#">마케팅 팀</a></li>
            <li><a href="#">엔터프라이즈</a></li>
          </ul>
        </nav>
        <nav class="footer-col" aria-label="리소스">
          <h3 class="footer-col__title">리소스</h3>
          <ul class="footer-col__list">
            <li><a href="#">가이드</a></li>
            <li><a href="#">블로그</a></li>
            <li><a href="#">업데이트 노트</a></li>
            <li><a href="#">활용 사례</a></li>
          </ul>
        </nav>
        <nav class="footer-col" aria-label="회사">
          <h3 class="footer-col__title">회사</h3>
          <ul class="footer-col__list">
            <li><a href="#">채용</a></li>
            <li><a href="#">보도자료</a></li>
            <li><a href="#">브랜드</a></li>
            <li><a href="#">연락처</a></li>
          </ul>
        </nav>
      </div>

      <div class="site-footer__rule" role="presentation"></div>

      <div class="site-footer__company">
        <div class="site-footer__company-main">
          <p class="site-footer__legal">
            (주)데블리 · 대표이사 홍길동 · 개인정보보호책임자 privacy@devely.ai · 고객센터 1588-0000 · 서울특별시 강남구 테헤란로 000
          </p>
          <nav class="site-footer__legal-nav" aria-label="법적 고지">
            <a href="#">이용약관</a>
            <a href="#" class="site-footer__legal-nav--strong">개인정보처리방침</a>
            <a href="#">쿠키 정책</a>
            <a href="#">이용 정책</a>
            <a href="#">사이트맵</a>
          </nav>
        </div>
      </div>

      <div class="site-footer__bottom">
        <p class="site-footer__copyright">© DEMO STUDIO Corp. All rights reserved.</p>
        <div class="site-footer__social site-footer__social--bottom" aria-label="소셜 미디어">
          <a href="#" aria-label="블로그"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 4h16v16H4V4zm2 2v12h12V6H6zm2 2h8v2H8V8zm0 4h8v2H8v-2zm0 4h5v2H8v-2z"/></svg></a>
          <a href="#" aria-label="YouTube"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></a>
          <a href="#" aria-label="Facebook"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>
          <a href="#" aria-label="Instagram"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></a>
          <a href="#" aria-label="LinkedIn"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
        </div>
      </div>
    </div>
  </footer>
`;
}

const DASHBOARD_INNER = `
      <div class="wb-topbar">
        <div class="wb-topbar__search">
          <span aria-hidden="true">⌕</span>
          <input type="search" placeholder="사이트, 프롬프트, 도메인 검색..." aria-label="검색" />
        </div>
        <div class="wb-topbar__actions">
          <button type="button" class="app-btn app-btn--ghost">템플릿 보기</button>
          <button type="button" class="app-btn app-btn--primary">+ 새 사이트 생성</button>
        </div>
      </div>

      <header class="wb-header">
        <h1>안녕하세요, Devely 팀</h1>
        <p>AI로 웹사이트를 생성하고, 수정하고, 배포까지 한 번에 관리하세요.</p>
      </header>

      <section class="wb-kpis">
        <article class="wb-kpi">
          <p class="wb-kpi__label">이번 주 생성</p>
          <p class="wb-kpi__value">18개</p>
          <p class="wb-kpi__meta">+5 지난주 대비</p>
        </article>
        <article class="wb-kpi">
          <p class="wb-kpi__label">배포 완료</p>
          <p class="wb-kpi__value">42개</p>
          <p class="wb-kpi__meta">성공률 97.8%</p>
        </article>
        <article class="wb-kpi">
          <p class="wb-kpi__label">활성 도메인</p>
          <p class="wb-kpi__value">27개</p>
          <p class="wb-kpi__meta">연결 필요 3개</p>
        </article>
        <article class="wb-kpi">
          <p class="wb-kpi__label">팀 크레딧</p>
          <p class="wb-kpi__value">1,240</p>
          <p class="wb-kpi__meta">이번 달 잔여</p>
        </article>
      </section>

      <div class="wb-grid wb-grid--hero">
        <section class="wb-card">
          <div class="wb-card__head">
            <h2>AI 생성 파이프라인</h2>
            <button type="button" class="app-btn app-btn--ghost app-btn--sm">상세</button>
          </div>
          <div class="wb-pipeline">
            <article><strong>프롬프트 분석</strong><span>자연어 의도 파싱 · 브랜드 톤 추출</span></article>
            <article><strong>레이아웃 조합</strong><span>섹션 자동 배치 · 반응형 컴포넌트</span></article>
            <article><strong>콘텐츠/스타일 생성</strong><span>카피라이팅 · 컬러/타이포 시스템</span></article>
            <article><strong>빌드/배포</strong><span>정적 빌드 · CDN 업로드 · 도메인 연결</span></article>
          </div>
        </section>

        <section class="wb-card">
          <div class="wb-card__head"><h2>생성 큐 상태</h2></div>
          <ul class="wb-queue">
            <li><span>브랜드 랜딩 리뉴얼</span><em class="is-run">빌드 중 72%</em></li>
            <li><span>신제품 소개 페이지</span><em class="is-wait">대기 중</em></li>
            <li><span>이벤트 캠페인 마이크로사이트</span><em class="is-ok">배포 완료</em></li>
          </ul>
        </section>
      </div>

      <div class="wb-grid wb-grid--main">
        <section class="wb-card">
          <div class="wb-card__head"><h2>최근 생성 사이트</h2></div>
          <div class="wb-table-wrap">
            <table class="wb-table">
              <thead>
                <tr><th>사이트</th><th>타입</th><th>상태</th><th>수정</th><th></th></tr>
              </thead>
              <tbody>
                <tr><td>cafe-launch-2026</td><td>랜딩</td><td><span class="wb-badge wb-badge--ok">배포됨</span></td><td>오늘 10:24</td><td><button type="button">열기</button></td></tr>
                <tr><td>portfolio-minimal</td><td>포트폴리오</td><td><span class="wb-badge wb-badge--run">생성 중</span></td><td>오늘 09:42</td><td><button type="button">보기</button></td></tr>
                <tr><td>saas-pricing-v3</td><td>비즈니스</td><td><span class="wb-badge wb-badge--wait">검수 대기</span></td><td>어제</td><td><button type="button">열기</button></td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="wb-card">
          <div class="wb-card__head"><h2>빠른 실행</h2></div>
          <div class="wb-actions">
            <button type="button">프롬프트로 랜딩 만들기</button>
            <button type="button">기존 URL 가져와 리디자인</button>
            <button type="button">AI 카피 자동 생성</button>
            <button type="button">도메인/SSL 연결</button>
          </div>
          <div class="wb-note">
            <strong>오늘 추천:</strong> "여름 프로모션용 카운트다운 랜딩" 템플릿으로 3분 내 초안 생성
          </div>
        </section>
      </div>
`;

type DemoProjectStatus = "pre" | "deploying" | "done";
type DemoProjectKind = "landing" | "portfolio" | "business";

interface DemoProject {
  slug: string;
  status: DemoProjectStatus;
  kind: DemoProjectKind;
  subtitle: string;
  updated: string;
}

const DEMO_PROJECTS: readonly DemoProject[] = [
  {
    slug: "cafe-landing-page",
    status: "pre",
    kind: "landing",
    subtitle: "배포되지 않음",
    updated: "Mar 5 04:25",
  },
  {
    slug: "portfolio-2024",
    status: "deploying",
    kind: "portfolio",
    subtitle: "프로덕션 배포 진행 중",
    updated: "Jun 23 14:31",
  },
  {
    slug: "saas-intro-site",
    status: "done",
    kind: "business",
    subtitle: "https://intro.example.com",
    updated: "Apr 11 18:30",
  },
  {
    slug: "event-spring-sale",
    status: "pre",
    kind: "landing",
    subtitle: "배포되지 않음",
    updated: "Feb 2 09:15",
  },
  {
    slug: "designer-showcase",
    status: "done",
    kind: "portfolio",
    subtitle: "https://folio.example.com",
    updated: "Jan 19 22:08",
  },
  {
    slug: "corp-pr-page",
    status: "deploying",
    kind: "business",
    subtitle: "스테이징 검증 중",
    updated: "Mar 28 11:42",
  },
  {
    slug: "newsletter-signup",
    status: "done",
    kind: "landing",
    subtitle: "https://nl.example.com",
    updated: "Dec 8 16:55",
  },
  {
    slug: "photo-studio-booking",
    status: "pre",
    kind: "portfolio",
    subtitle: "초안만 존재",
    updated: "Nov 30 07:20",
  },
  {
    slug: "recruit-2026",
    status: "deploying",
    kind: "landing",
    subtitle: "DNS 전파 대기",
    updated: "Apr 1 13:07",
  },
];

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const STATUS_BADGE: Record<
  DemoProjectStatus,
  { className: string; label: string }
> = {
  pre: { className: "proj-badge proj-badge--status-pre", label: "배포 전" },
  deploying: {
    className: "proj-badge proj-badge--status-deploying",
    label: "배포 중",
  },
  done: { className: "proj-badge proj-badge--status-done", label: "배포 완료" },
};

const KIND_BADGE: Record<
  DemoProjectKind,
  { className: string; label: string }
> = {
  landing: {
    className: "proj-badge proj-badge--type-landing",
    label: "랜딩 페이지",
  },
  portfolio: {
    className: "proj-badge proj-badge--type-portfolio",
    label: "포트폴리오 페이지",
  },
  business: {
    className: "proj-badge proj-badge--type-business",
    label: "비즈니스 페이지",
  },
};

function renderProjectThumb(p: DemoProject, index: number): string {
  const tone = (index % 3) + 1;
  const url =
    p.slug.length > 22
      ? `${escapeHtml(p.slug.slice(0, 22))}…`
      : escapeHtml(p.slug);
  const bar = `<div class="proj-thumb__bar"><span class="proj-thumb__dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="proj-thumb__fake-url">${url}</span></div>`;

  let body = "";
  if (p.kind === "landing") {
    body = `<div class="proj-thumb__body proj-thumb__body--landing">
            <div class="proj-thumb__hero"></div>
            <div class="proj-thumb__lines">
              <span class="proj-thumb__line proj-thumb__line--lg"></span>
              <span class="proj-thumb__line"></span>
              <span class="proj-thumb__line proj-thumb__line--short"></span>
            </div>
            <div class="proj-thumb__cta">
              <span class="proj-thumb__pill"></span>
              <span class="proj-thumb__pill proj-thumb__pill--ghost"></span>
            </div>
          </div>`;
  } else if (p.kind === "portfolio") {
    body = `<div class="proj-thumb__body proj-thumb__body--portfolio">
            <div class="proj-thumb__gallery">
              <div class="proj-thumb__shot proj-thumb__shot--hero"></div>
              <div class="proj-thumb__shot"></div>
              <div class="proj-thumb__shot"></div>
              <div class="proj-thumb__shot"></div>
            </div>
          </div>`;
  } else {
    body = `<div class="proj-thumb__body proj-thumb__body--business">
            <div class="proj-thumb__nav"></div>
            <div class="proj-thumb__biz">
              <div class="proj-thumb__biz-row"></div>
              <div class="proj-thumb__biz-grid"><span></span><span></span><span></span></div>
            </div>
          </div>`;
  }

  return `<div class="proj-card__preview">
          <div class="proj-thumb proj-thumb--${p.kind} proj-thumb--tone${tone}" aria-hidden="true">
            ${bar}
            ${body}
          </div>
        </div>`;
}

function renderProjectCard(p: DemoProject, index: number): string {
  const st = STATUS_BADGE[p.status];
  const kd = KIND_BADGE[p.kind];
  const slug = escapeHtml(p.slug);
  const sub = escapeHtml(p.subtitle);
  const time = escapeHtml(p.updated);
  const thumb = renderProjectThumb(p, index);
  const href = `${HASH_PROJECTS}/${encodeURIComponent(p.slug)}`;
  return `
        <a class="proj-card proj-card--link" href="${href}">
          ${thumb}
          <div class="proj-card__body">
            <div class="proj-card__badges">
              <span class="${st.className}">${st.label}</span>
              <span class="${kd.className}">${kd.label}</span>
            </div>
            <h2 class="proj-card__title">${slug}</h2>
            <p class="proj-card__desc">${sub}</p>
          </div>
          <footer class="proj-card__foot">
            <span class="proj-card__time">${time}</span>
          </footer>
        </a>`;
}

function getProjectsInnerHTML(): string {
  const cards = DEMO_PROJECTS.map((p, i) => renderProjectCard(p, i)).join("");
  return `
      <header class="app-header app-header--row proj-page-head">
        <div>
          <h1 class="app-header__title">프로젝트</h1>
          <p class="app-header__sub">워크스페이스의 프로젝트를 한눈에 확인하세요.</p>
        </div>
        <button type="button" class="app-btn app-btn--primary">+ 새 프로젝트</button>
      </header>

      <div class="proj-grid">
        ${cards}
      </div>`;
}

function getProjectDetailStatusRow(p: DemoProject): string {
  if (p.status === "pre") {
    return `<span class="proj-detail-pill proj-detail-pill--draft" title="초안">
      <span class="proj-detail-pill__clock" aria-hidden="true"></span>
      Draft
    </span>
    <span class="proj-detail-pill proj-detail-pill--version">Version: v1</span>`;
  }
  if (p.status === "deploying") {
    return `<span class="proj-detail-pill proj-detail-pill--progress">${STATUS_BADGE.deploying.label}</span>
    <span class="proj-detail-pill proj-detail-pill--version">Version: v1</span>`;
  }
  return `<span class="proj-detail-pill proj-detail-pill--live">${STATUS_BADGE.done.label}</span>
    <span class="proj-detail-pill proj-detail-pill--version">Version: v1</span>`;
}

function getProjectDetailMainBlock(p: DemoProject): string {
  if (p.status === "pre") {
    return `<div class="proj-detail-empty proj-detail-empty--rich" role="status">
      <div class="proj-detail-empty__visual" aria-hidden="true">
        <div class="proj-detail-empty__orb"></div>
        <span class="proj-detail-spark proj-detail-spark--1"></span>
        <span class="proj-detail-spark proj-detail-spark--2"></span>
        <span class="proj-detail-spark proj-detail-spark--3"></span>
      </div>
      <div class="proj-detail-empty__copy">
        <p class="proj-detail-empty__title">아직 배포되지 않은 프로젝트입니다</p>
        <p class="proj-detail-empty__sub">AI 에이전트와 대화하며 페이지를 만들고, 한 번에 배포까지 이어가 보세요.</p>
      </div>
      <ol class="proj-detail-steps" aria-label="시작하기">
        <li class="proj-detail-steps__item">
          <span class="proj-detail-steps__n">1</span>
          <span class="proj-detail-steps__text"><strong>Open AI Agent</strong>로 브랜드와 톤을 설명</span>
        </li>
        <li class="proj-detail-steps__item">
          <span class="proj-detail-steps__n">2</span>
          <span class="proj-detail-steps__text">생성된 초안을 대화로 다듬기</span>
        </li>
        <li class="proj-detail-steps__item">
          <span class="proj-detail-steps__n">3</span>
          <span class="proj-detail-steps__text">검수 후 배포 · 도메인 연결</span>
        </li>
      </ol>
    </div>`;
  }
  if (p.status === "deploying") {
    return `<div class="proj-detail-empty proj-detail-empty--deploy" role="status">
      <div class="proj-detail-empty__visual proj-detail-empty__visual--sm" aria-hidden="true">
        <div class="proj-detail-empty__orb proj-detail-empty__orb--pulse"></div>
        <span class="proj-detail-spark proj-detail-spark--2"></span>
      </div>
      <div class="proj-detail-empty__copy">
        <p class="proj-detail-empty__title">배포가 진행 중입니다</p>
        <p class="proj-detail-empty__sub">잠시 후 다시 확인해 주세요. 완료되면 미리보기 URL이 여기 표시됩니다.</p>
      </div>
    </div>`;
  }
  const url = escapeHtml(p.subtitle);
  return `<div class="proj-detail-live">
      <div class="proj-detail-live__icon" aria-hidden="true"></div>
      <div class="proj-detail-live__content">
        <p class="proj-detail-live__label">프로덕션 URL</p>
        <span class="proj-detail-live__url">${url}</span>
        <p class="proj-detail-live__hint">AI로 생성·배포된 사이트가 연결되어 있습니다.</p>
      </div>
    </div>`;
}

function demoAiCreditsUsed(slug: string): number {
  return 12 + (slug.length * 17) % 48;
}

function demoAiCreditsLeft(slug: string): number {
  return 180 + (slug.length * 23) % 420;
}

function getDeployEnvBlock(p: DemoProject): { label: string; detail: string } {
  if (p.status === "pre") {
    return { label: "미배포", detail: "프리뷰만 · AI 에이전트 초안" };
  }
  if (p.status === "deploying") {
    return { label: "스테이징", detail: p.subtitle };
  }
  return { label: "프로덕션", detail: "CDN · SSL · 자동 빌드" };
}

function getTimelineEntries(p: DemoProject): { msg: string; meta: string; tone: "violet" | "slate" | "green" | "amber" }[] {
  const u = escapeHtml(p.updated);
  const kindLine =
    p.kind === "landing"
      ? "히어로·기능 소개 섹션 자동 배치"
      : p.kind === "portfolio"
        ? "갤러리 그리드·프로필 블록 생성"
        : "네비·가격표 레이아웃 적용";
  const common: { msg: string; meta: string; tone: "violet" | "slate" | "green" | "amber" }[] = [
    { msg: "프로젝트 설정 저장됨", meta: u, tone: "slate" },
    { msg: kindLine, meta: "AI 생성", tone: "violet" },
    { msg: "프롬프트로 카피 2회 수정", meta: "대화 기록", tone: "violet" },
  ];
  if (p.status === "pre") {
    return [
      { msg: "워크스페이스에 프로젝트 생성", meta: u, tone: "slate" },
      ...common.slice(1, 3),
      { msg: "배포 파이프라인 대기 중", meta: "다음: Open AI Agent", tone: "amber" },
    ];
  }
  if (p.status === "deploying") {
    return [
      ...common,
      { msg: "프로덕션 빌드 큐 등록", meta: "진행 중", tone: "amber" },
      { msg: p.subtitle, meta: "배포", tone: "amber" },
    ];
  }
  return [
    ...common,
    { msg: "프로덕션 배포 성공", meta: "라이브", tone: "green" },
    { msg: "엣지 캐시 워밍 완료", meta: "CDN", tone: "green" },
  ];
}

function getNextActionsHTML(p: DemoProject): string {
  if (p.status === "pre") {
    return `<ul class="proj-detail-checklist">
        <li class="proj-detail-checklist__row"><span class="proj-detail-check proj-detail-check--todo" aria-hidden="true"></span><span>브랜드 톤·타깃을 AI에 설명하고 초안 생성</span></li>
        <li class="proj-detail-checklist__row"><span class="proj-detail-check proj-detail-check--todo" aria-hidden="true"></span><span>모바일·데스크톱 프리뷰로 레이아웃 확인</span></li>
        <li class="proj-detail-checklist__row"><span class="proj-detail-check proj-detail-check--todo" aria-hidden="true"></span><span>메타 설명·OG 이미지 채우기</span></li>
        <li class="proj-detail-checklist__row"><span class="proj-detail-check proj-detail-check--todo" aria-hidden="true"></span><span>첫 배포 및 도메인 연결</span></li>
      </ul>`;
  }
  if (p.status === "deploying") {
    return `<ul class="proj-detail-checklist">
        <li class="proj-detail-checklist__row"><span class="proj-detail-check proj-detail-check--done" aria-hidden="true"></span><span>빌드 아티팩트 업로드</span></li>
        <li class="proj-detail-checklist__row"><span class="proj-detail-check proj-detail-check--run" aria-hidden="true"></span><span>DNS·SSL 전파 대기</span></li>
        <li class="proj-detail-checklist__row"><span class="proj-detail-check proj-detail-check--todo" aria-hidden="true"></span><span>배포 완료 후 스모크 테스트</span></li>
      </ul>`;
  }
  return `<ul class="proj-detail-checklist">
        <li class="proj-detail-checklist__row"><span class="proj-detail-check proj-detail-check--done" aria-hidden="true"></span><span>프로덕션 URL 라이브</span></li>
        <li class="proj-detail-checklist__row"><span class="proj-detail-check proj-detail-check--todo" aria-hidden="true"></span><span>분석 스크립트·전환 목표 연결</span></li>
        <li class="proj-detail-checklist__row"><span class="proj-detail-check proj-detail-check--todo" aria-hidden="true"></span><span>다음 분기용 A/B 카피 실험</span></li>
      </ul>`;
}

function getProjectDetailExtrasHTML(p: DemoProject): string {
  const env = getDeployEnvBlock(p);
  const used = demoAiCreditsUsed(p.slug);
  const left = demoAiCreditsLeft(p.slug);
  const total = used + left;
  const pct = Math.round((used / total) * 100);
  const timeline = getTimelineEntries(p);
  const timelineHtml = timeline
    .map(
      (e) => `<li class="proj-detail-timeline__item proj-detail-timeline__item--${e.tone}">
      <span class="proj-detail-timeline__dot" aria-hidden="true"></span>
      <div class="proj-detail-timeline__body">
        <p class="proj-detail-timeline__msg">${escapeHtml(e.msg)}</p>
        <p class="proj-detail-timeline__meta">${escapeHtml(e.meta)}</p>
      </div>
    </li>`,
    )
    .join("");
  const slugShort = escapeHtml(p.slug.slice(0, 18) + (p.slug.length > 18 ? "…" : ""));
  const next = getNextActionsHTML(p);

  return `
          <div class="proj-detail-extra" aria-label="프로젝트 부가 정보">
            <div class="proj-detail-stats">
              <div class="proj-detail-stat">
                <p class="proj-detail-stat__label">마지막 활동</p>
                <p class="proj-detail-stat__value">${escapeHtml(p.updated)}</p>
                <p class="proj-detail-stat__hint">에디터 · AI 세션 기준</p>
              </div>
              <div class="proj-detail-stat">
                <p class="proj-detail-stat__label">배포 환경</p>
                <p class="proj-detail-stat__value">${escapeHtml(env.label)}</p>
                <p class="proj-detail-stat__hint">${escapeHtml(env.detail)}</p>
              </div>
              <div class="proj-detail-stat">
                <p class="proj-detail-stat__label">이번 달 AI 사용</p>
                <p class="proj-detail-stat__value">${used}회 <span class="proj-detail-stat__sub">/ 잔여 ${left}</span></p>
                <div class="proj-detail-meter" role="presentation" aria-hidden="true">
                  <div class="proj-detail-meter__fill" style="width:${pct}%"></div>
                </div>
              </div>
            </div>

            <div class="proj-detail-extra__grid">
              <section class="proj-detail-panel" aria-labelledby="proj-timeline-heading">
                <h2 id="proj-timeline-heading" class="proj-detail-panel__head">활동 타임라인</h2>
                <ul class="proj-detail-timeline">${timelineHtml}</ul>
              </section>
              <div class="proj-detail-extra__col">
                <section class="proj-detail-panel" aria-labelledby="proj-next-heading">
                  <h2 id="proj-next-heading" class="proj-detail-panel__head">다음 할 일</h2>
                  ${next}
                </section>
                <section class="proj-detail-panel" aria-labelledby="proj-res-heading">
                  <h2 id="proj-res-heading" class="proj-detail-panel__head">연결된 리소스</h2>
                  <p class="proj-detail-panel__sub">기획·디자인 링크를 팀과 공유해 두면 AI 맥락에 반영하기 쉬워요.</p>
                  <div class="proj-detail-resources">
                    <button type="button" class="proj-detail-resource">Figma · ${slugShort}</button>
                    <button type="button" class="proj-detail-resource">Notion 브리프</button>
                    <button type="button" class="proj-detail-resource">GitHub 저장소</button>
                  </div>
                </section>
              </div>
            </div>
          </div>`;
}

function getProjectDetailInnerHTML(p: DemoProject): string {
  const title = escapeHtml(p.slug);
  const badges = getProjectDetailStatusRow(p);
  const main = getProjectDetailMainBlock(p);
  const extras = getProjectDetailExtrasHTML(p);
  return `
      <div class="proj-detail-page">
        <div class="proj-detail">
          <a class="proj-detail-back" href="${HASH_PROJECTS}">
            <span class="proj-detail-back__arrow" aria-hidden="true"></span>
            프로젝트 목록으로 돌아가기
          </a>

          <section class="proj-detail-card" aria-labelledby="proj-detail-title">
            <div class="proj-detail-card__accent" aria-hidden="true"></div>
            <div class="proj-detail-card__head">
              <div class="proj-detail-card__titles">
                <h1 id="proj-detail-title" class="proj-detail-card__title">${title}</h1>
                <div class="proj-detail-card__badges">${badges}</div>
              </div>
              <button type="button" class="proj-detail-agent">
                <span class="proj-detail-agent__shine" aria-hidden="true"></span>
                <span class="proj-detail-agent__inner">
                  <span class="proj-detail-agent__play" aria-hidden="true"></span>
                  Open AI Agent
                </span>
              </button>
            </div>
            <div class="proj-detail-card__body">
              ${main}
            </div>
          </section>

          ${extras}

          <section class="proj-detail-danger" aria-labelledby="proj-detail-danger-title">
            <div class="proj-detail-danger__inner">
              <div class="proj-detail-danger__copy">
                <h2 id="proj-detail-danger-title" class="proj-detail-danger__title">Danger Zone</h2>
                <p class="proj-detail-danger__desc">되돌릴 수 없는 작업입니다. 워크스페이스에서 제거 시 복구가 어려울 수 있어요.</p>
              </div>
              <button type="button" class="proj-detail-danger__btn">
                <span class="proj-detail-danger__trash" aria-hidden="true"></span>
                워크스페이스에서 제거
              </button>
            </div>
          </section>
        </div>
      </div>`;
}

function getProjectNotFoundInnerHTML(): string {
  return `
      <div class="proj-detail-page">
        <div class="proj-detail">
          <a class="proj-detail-back" href="${HASH_PROJECTS}">
            <span class="proj-detail-back__arrow" aria-hidden="true"></span>
            프로젝트 목록으로 돌아가기
          </a>
          <section class="proj-detail-card">
            <div class="proj-detail-card__accent" aria-hidden="true"></div>
            <h1 class="proj-detail-card__title">프로젝트를 찾을 수 없습니다</h1>
            <p class="proj-detail-muted">주소가 잘못되었거나 삭제된 프로젝트일 수 있습니다.</p>
          </section>
        </div>
      </div>`;
}

function mountLanding(): void {
  document.body.classList.remove("app-view");
  root.innerHTML = getLandingHTML();
  document.title = "Devely — AI 웹사이트 자동 생성";

  document.getElementById("btnLogin")?.addEventListener("click", () => {
    window.location.hash = HASH_DASHBOARD;
  });

  const form = root.querySelector<HTMLFormElement>("#promptForm");
  const input = root.querySelector<HTMLInputElement>("#promptInput");
  const statusEl = root.querySelector<HTMLParagraphElement>("#status");

  if (form && input && statusEl) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const prompt = input.value.trim();

      if (!prompt) {
        statusEl.textContent = "프롬프트를 입력해 주세요.";
        return;
      }

      statusEl.textContent = `“${prompt}”에 맞춰 생성 중... (데모)`;
    });
  }
}

function mountApp(): void {
  document.body.classList.add("app-view");
  const route = parseAppRoute();
  let inner: string;
  let title: string;
  let sidebar: "dashboard" | "projects" = "dashboard";

  if (route.kind === "projects") {
    sidebar = "projects";
    inner = getProjectsInnerHTML();
    title = "프로젝트 — AI Web Builder";
  } else if (route.kind === "project") {
    sidebar = "projects";
    const p = DEMO_PROJECTS.find((x) => x.slug === route.slug);
    inner = p ? getProjectDetailInnerHTML(p) : getProjectNotFoundInnerHTML();
    title = p ? `${p.slug} — AI Web Builder` : "프로젝트 — AI Web Builder";
  } else {
    inner = DASHBOARD_INNER;
    title = "대시보드 — AI Web Builder";
  }

  root.innerHTML = getAppLayoutHTML(sidebar, inner);
  document.title = title;
}

function renderRoute(): void {
  if (isAppRoute()) {
    mountApp();
  } else {
    mountLanding();
  }
}

window.addEventListener("hashchange", renderRoute);
renderRoute();
