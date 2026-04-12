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

function getProjectHash(slug: string): string {
  return `${HASH_PROJECTS}/${encodeURIComponent(slug)}`;
}

type AgentWorkspaceTab = "preview" | "code" | "pipeline";

function parseAgentWorkspaceTabSegment(seg: string | undefined): AgentWorkspaceTab {
  if (seg === "code" || seg === "pipeline" || seg === "preview") return seg;
  return "preview";
}

function getProjectAgentHash(slug: string, tab: AgentWorkspaceTab = "preview"): string {
  const base = `${HASH_PROJECTS}/${encodeURIComponent(slug)}/agent`;
  if (tab === "preview") return base;
  return `${base}/${tab}`;
}

function isAppRoute(): boolean {
  const h = window.location.hash;
  return h === HASH_DASHBOARD || h === HASH_MAIN_ALT || h.startsWith("#/app/");
}

type AppRoute =
  | { kind: "dashboard" }
  | { kind: "projects" }
  | { kind: "project"; slug: string }
  | { kind: "projectAgent"; slug: string; tab: AgentWorkspaceTab };

function parseAppRoute(): AppRoute {
  const h = window.location.hash;
  if (h === HASH_PROJECTS || h === "#/app/projects/") {
    return { kind: "projects" };
  }
  const prefix = "#/app/projects/";
  if (h.startsWith(prefix)) {
    const rest = h.slice(prefix.length).replace(/\/$/, "");
    const segments = rest.split("/").filter(Boolean);
    if (segments.length === 0) {
      return { kind: "projects" };
    }
    const slug = decodeURIComponent(segments[0]);
    if (segments[1] === "agent") {
      const tab = parseAgentWorkspaceTabSegment(segments[2]);
      return { kind: "projectAgent", slug, tab };
    }
    return { kind: "project", slug };
  }
  return { kind: "dashboard" };
}

function getAppLayoutHTML(
  active: "dashboard" | "projects",
  mainInnerHTML: string,
  mainExtraClass = "",
  omitSidebar = false,
): string {
  const mainClasses = `app-main${mainExtraClass ? ` ${mainExtraClass}` : ""}${omitSidebar ? " app-main--full" : ""}`;
  if (omitSidebar) {
    return `
  <div class="app-shell app-shell--no-sidebar">
    <div class="${mainClasses}">
      ${mainInnerHTML}
    </div>
  </div>`;
  }
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
    <div class="${mainClasses}">
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

type DemoProjectStatus = "pre" | "deploying" | "done" | "failed";
type DemoProjectKind = "landing" | "portfolio" | "business";

interface DemoProject {
  slug: string;
  status: DemoProjectStatus;
  kind: DemoProjectKind;
  /** 라이브 시 공개 URL, 그 외에는 내부 메모·오류 메시지 */
  subtitle: string;
  /** 카드·로그용 절대 시각 표기 */
  updated: string;
  /** FR-1: GitHub 스타일 상대 시각 (목록) */
  updatedRelative: string;
  /** 목록 정렬: 최근 수정순 */
  updatedSort: number;
  /** merge 기준 배포 버전 (PRD FR-12-1) */
  deployVersion: number;
}

const DEMO_PROJECTS: readonly DemoProject[] = [
  {
    slug: "cafe-landing-page",
    status: "pre",
    kind: "landing",
    subtitle: "",
    updated: "Mar 5 04:25",
    updatedRelative: "5주 전",
    updatedSort: 50,
    deployVersion: 0,
  },
  {
    slug: "portfolio-2024",
    status: "deploying",
    kind: "portfolio",
    subtitle: "프로덕션 배포 진행 중",
    updated: "Jun 23 14:31",
    updatedRelative: "어제",
    updatedSort: 92,
    deployVersion: 2,
  },
  {
    slug: "saas-intro-site",
    status: "done",
    kind: "business",
    subtitle: "https://intro.example.com",
    updated: "Apr 11 18:30",
    updatedRelative: "3일 전",
    updatedSort: 88,
    deployVersion: 4,
  },
  {
    slug: "event-spring-sale",
    status: "pre",
    kind: "landing",
    subtitle: "",
    updated: "Feb 2 09:15",
    updatedRelative: "2월 2일",
    updatedSort: 30,
    deployVersion: 0,
  },
  {
    slug: "designer-showcase",
    status: "done",
    kind: "portfolio",
    subtitle: "https://folio.example.com",
    updated: "Jan 19 22:08",
    updatedRelative: "1월 19일",
    updatedSort: 40,
    deployVersion: 3,
  },
  {
    slug: "corp-pr-page",
    status: "deploying",
    kind: "business",
    subtitle: "스테이징 검증 중",
    updated: "Mar 28 11:42",
    updatedRelative: "2주 전",
    updatedSort: 55,
    deployVersion: 1,
  },
  {
    slug: "newsletter-signup",
    status: "done",
    kind: "landing",
    subtitle: "https://nl.example.com",
    updated: "Dec 8 16:55",
    updatedRelative: "12월 8일",
    updatedSort: 35,
    deployVersion: 2,
  },
  {
    slug: "photo-studio-booking",
    status: "failed",
    kind: "portfolio",
    subtitle: "빌드 단계 오류: 패키지 의존성 해석 실패",
    updated: "Nov 30 07:20",
    updatedRelative: "2주 전",
    updatedSort: 45,
    deployVersion: 1,
  },
  {
    slug: "recruit-2026",
    status: "deploying",
    kind: "landing",
    subtitle: "DNS 전파 대기",
    updated: "Apr 1 13:07",
    updatedRelative: "11일 전",
    updatedSort: 85,
    deployVersion: 2,
  },
];

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** PRD §10.1 FR-1 · 화면1 — Draft / Pending / Live / Failed */
const STATUS_BADGE: Record<
  DemoProjectStatus,
  { className: string; label: string }
> = {
  pre: { className: "proj-badge proj-badge--prd-draft", label: "초안" },
  deploying: {
    className: "proj-badge proj-badge--prd-pending",
    label: "배포 대기",
  },
  done: { className: "proj-badge proj-badge--prd-live", label: "라이브" },
  failed: { className: "proj-badge proj-badge--prd-failed", label: "실패" },
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

function isProjectLiveUrl(p: DemoProject): boolean {
  return p.status === "done" && /^https?:\/\//i.test(p.subtitle);
}

function renderProjectCard(p: DemoProject, index: number): string {
  const st = STATUS_BADGE[p.status];
  const kd = KIND_BADGE[p.kind];
  const slug = escapeHtml(p.slug);
  const rel = escapeHtml(p.updatedRelative);
  const thumb = renderProjectThumb(p, index);
  const navHash = getProjectHash(p.slug);
  const showUrl = isProjectLiveUrl(p);
  const rawUrl = showUrl ? p.subtitle : "";
  const href = escapeHtml(rawUrl);
  const urlDisplay = escapeHtml(rawUrl.replace(/^https?:\/\//i, ""));
  const urlBlock = showUrl
    ? `<a class="proj-card__live-url" href="${href}" target="_blank" rel="noopener noreferrer">${urlDisplay}</a>`
    : "";

  return `
        <article class="proj-card">
          <div class="proj-card__hit" data-project-nav="${navHash}" role="link" tabindex="0" aria-label="${slug} 프로젝트 개요">
            ${thumb}
            <div class="proj-card__body">
              <div class="proj-card__badges">
                <span class="${st.className}">${st.label}</span>
                <span class="${kd.className}">${kd.label}</span>
              </div>
              <h2 class="proj-card__title">${slug}</h2>
            </div>
            ${urlBlock}
            <footer class="proj-card__foot">
              <span class="proj-card__time">Updated ${rel}</span>
            </footer>
          </div>
        </article>`;
}

const PROJECT_LIST_PAGE_COUNT = 8;

function getProjectListPaginationHTML(): string {
  const pages = Array.from(
    { length: PROJECT_LIST_PAGE_COUNT },
    (_, i) => i + 1,
  );
  const items = pages
    .map((n) => {
      const cur = n === 1 ? " proj-pagination__btn--current" : "";
      const aria = n === 1 ? ' aria-current="page"' : "";
      return `<li class="proj-pagination__item">
          <button type="button" class="proj-pagination__btn${cur}" data-proj-page="${n}" aria-label="${n}페이지"${aria}>${n}</button>
        </li>`;
    })
    .join("");
  return `<nav id="projPagination" class="proj-pagination" aria-label="프로젝트 목록 페이지">
        <div class="proj-pagination__shell">
          <div class="proj-pagination__head">
            <span class="proj-pagination__title">페이지 탐색</span>
            <span id="projPaginationStatus" class="proj-pagination__status" aria-live="polite"><strong>1</strong> / ${PROJECT_LIST_PAGE_COUNT}</span>
          </div>
          <div class="proj-pagination__controls">
            <button type="button" class="proj-pagination__edge" id="projPaginationPrev" aria-label="이전 페이지" disabled>
              <span class="proj-pagination__chev proj-pagination__chev--prev" aria-hidden="true"></span>
            </button>
            <ol class="proj-pagination__list">${items}</ol>
            <button type="button" class="proj-pagination__edge" id="projPaginationNext" aria-label="다음 페이지">
              <span class="proj-pagination__chev proj-pagination__chev--next" aria-hidden="true"></span>
            </button>
          </div>
          <p class="proj-pagination__note">목록은 데모 데이터입니다. 번호는 UI 예시용입니다.</p>
        </div>
      </nav>`;
}

function getProjectsInnerHTML(): string {
  const sorted = [...DEMO_PROJECTS].sort(
    (a, b) => b.updatedSort - a.updatedSort,
  );
  const cards = sorted.map((p, i) => renderProjectCard(p, i)).join("");
  const pagination = getProjectListPaginationHTML();
  return `
      <header class="app-header app-header--row proj-page-head">
        <div>
          <h1 class="app-header__title">프로젝트</h1>
          <p class="app-header__sub">AI로 만든 사이트를 수정·미리보기·배포까지 이어갑니다. (PRD MVP 흐름 반영 데모)</p>
        </div>
        <div class="proj-page-actions">
          <button type="button" class="app-btn app-btn--primary" id="projBtnNew">+ 새 프로젝트</button>
          <button type="button" class="app-btn app-btn--ghost" id="projBtnZip">ZIP 업로드</button>
          <button type="button" class="app-btn app-btn--ghost" id="projBtnGh">GitHub에서 불러오기</button>
        </div>
      </header>

      <div class="proj-list-body">
        <div class="proj-grid" id="projGrid">
          ${cards}
        </div>
        ${pagination}
      </div>`;
}

function getProjectDetailStatusRow(p: DemoProject): string {
  const st = STATUS_BADGE[p.status];
  const ver =
    p.deployVersion > 0
      ? `현재 버전: v${p.deployVersion}`
      : "현재 버전: — (미배포)";
  return `<span class="proj-detail-pill proj-detail-pill--${p.status === "pre" ? "draft" : p.status === "deploying" ? "progress" : p.status === "failed" ? "failed" : "live"}">${st.label}</span>
    <span class="proj-detail-pill proj-detail-pill--version">${escapeHtml(ver)}</span>`;
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
  if (p.status === "failed") {
    const err = escapeHtml(p.subtitle);
    return `<div class="proj-detail-failed" role="alert">
      <p class="proj-detail-failed__title">빌드에 실패했습니다</p>
      <p class="proj-detail-failed__msg">${err}</p>
      <p class="proj-detail-failed__hint">Open AI Agent에서 원인 설명과 수정 제안을 요청한 뒤, 미리보기를 다시 받을 수 있습니다.</p>
    </div>`;
  }
  return `<div class="proj-detail-workspace-hint">
      <p><strong>라이브 URL</strong>은 위 개요에서 확인하세요. 실제 코드 빌드 미리보기·승인·배포는 AI 에이전트 작업 화면에서 이어집니다.</p>
    </div>`;
}

function demoCommitHash(slug: string): string {
  let h = 2166136261;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).slice(0, 7);
}

function getRecentMergeRows(p: DemoProject): string {
  const rows: { sum: string; when: string; deployed: boolean }[] = [];
  if (p.status === "done") {
    rows.push({
      sum: "히어로 카피·메타 태그 반영",
      when: p.updated,
      deployed: true,
    });
    rows.push({
      sum: "문의 CTA 섹션 추가",
      when: "2일 전",
      deployed: true,
    });
    rows.push({ sum: "스타일 토큰 정리", when: "1주 전", deployed: false });
  } else if (p.status === "deploying") {
    rows.push({
      sum: "프리뷰 브랜치 빌드 성공",
      when: "10분 전",
      deployed: false,
    });
    rows.push({
      sum: "배포 승인 대기 (main merge 전)",
      when: "방금",
      deployed: false,
    });
    rows.push({
      sum: "DNS 레코드 안내 발송",
      when: "1시간 전",
      deployed: false,
    });
  } else if (p.status === "failed") {
    rows.push({
      sum: "npm ci 단계에서 종료",
      when: p.updated,
      deployed: false,
    });
    rows.push({
      sum: "이전 성공 빌드: v" + Math.max(0, p.deployVersion - 1),
      when: "3일 전",
      deployed: true,
    });
    rows.push({
      sum: "preview 브랜치 커밋 적재",
      when: "같은 세션",
      deployed: false,
    });
  } else {
    rows.push({
      sum: "프로젝트 생성 및 템플릿 연결",
      when: p.updated,
      deployed: false,
    });
    rows.push({
      sum: "아직 승인된 merge 없음",
      when: "—",
      deployed: false,
    });
    rows.push({
      sum: "다음: 초안 생성 후 미리보기",
      when: "—",
      deployed: false,
    });
  }
  return rows
    .map(
      (r) => `<li class="proj-prd-merge__row">
      <span class="proj-prd-merge__sum">${escapeHtml(r.sum)}</span>
      <span class="proj-prd-merge__when">${escapeHtml(r.when)}</span>
      <span class="proj-prd-merge__tag${r.deployed ? " proj-prd-merge__tag--ok" : ""}">${r.deployed ? "배포됨" : "미배포"}</span>
    </li>`,
    )
    .join("");
}

function getProjectDetailOverviewHTML(p: DemoProject): string {
  const title = escapeHtml(p.slug);
  const badges = getProjectDetailStatusRow(p);
  const live = isProjectLiveUrl(p);
  const url = live ? escapeHtml(p.subtitle) : "";
  const urlRow = live
    ? `<div class="proj-prd-url-row">
        <a class="proj-prd-url" href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>
        <button type="button" class="proj-prd-copy" id="projCopyUrl">복사</button>
      </div>`
    : `<p class="proj-prd-url-empty">라이브 URL은 <strong>라이브</strong> 상태에서만 표시됩니다. GitHub Pages 등 배포 완료 후 확인하세요.</p>`;

  const traffic = `<div class="proj-prd-traffic">
      <p class="proj-prd-traffic__label">트래픽 현황</p>
      <p class="proj-prd-traffic__off">GA4 미연동 · 연결하면 방문 요약이 이 영역에 표시됩니다.</p>
    </div>`;

  const mergeList = getRecentMergeRows(p);
  const hash = demoCommitHash(p.slug);

  return `<section class="proj-prd-overview" aria-labelledby="proj-prd-overview-title">
      <h1 id="proj-prd-overview-title" class="proj-prd-overview__title">${title}</h1>
      <div class="proj-prd-overview__badges">${badges}</div>
      <div class="proj-prd-overview__block">
        <h2 class="proj-prd-overview__h">현재 URL</h2>
        ${urlRow}
      </div>
      <div class="proj-prd-overview__grid">
        <div class="proj-prd-overview__block">
          <h2 class="proj-prd-overview__h">최근 반영 이력</h2>
          <ol class="proj-prd-merge">${mergeList}</ol>
        </div>
        <div class="proj-prd-overview__block">
          <h2 class="proj-prd-overview__h">가장 최근 커밋 (preview)</h2>
          <p class="proj-prd-commit"><code>${escapeHtml(hash)}</code> · ${escapeHtml(p.updatedRelative)}에 푸시됨</p>
          <p class="proj-prd-commit__sub">요청별 커밋은 preview 브랜치에 기록됩니다. (PRD FR-12-1)</p>
        </div>
      </div>
      ${traffic}
    </section>`;
}

function demoAiCreditsUsed(slug: string): number {
  return 12 + ((slug.length * 17) % 48);
}

function demoAiCreditsLeft(slug: string): number {
  return 180 + ((slug.length * 23) % 420);
}

function getDeployEnvBlock(p: DemoProject): { label: string; detail: string } {
  if (p.status === "pre") {
    return { label: "미배포", detail: "프리뷰만 · AI 에이전트 초안" };
  }
  if (p.status === "deploying") {
    return { label: "스테이징", detail: p.subtitle };
  }
  if (p.status === "failed") {
    return { label: "빌드 실패", detail: "미리보기 재시도 전" };
  }
  return { label: "프로덕션", detail: "CDN · SSL · 자동 빌드" };
}

function getTimelineEntries(p: DemoProject): {
  msg: string;
  meta: string;
  tone: "violet" | "slate" | "green" | "amber";
}[] {
  const u = escapeHtml(p.updated);
  const kindLine =
    p.kind === "landing"
      ? "히어로·기능 소개 섹션 자동 배치"
      : p.kind === "portfolio"
        ? "갤러리 그리드·프로필 블록 생성"
        : "네비·가격표 레이아웃 적용";
  const common: {
    msg: string;
    meta: string;
    tone: "violet" | "slate" | "green" | "amber";
  }[] = [
    { msg: "프로젝트 설정 저장됨", meta: u, tone: "slate" },
    { msg: kindLine, meta: "AI 생성", tone: "violet" },
    { msg: "프롬프트로 카피 2회 수정", meta: "대화 기록", tone: "violet" },
  ];
  if (p.status === "pre") {
    return [
      { msg: "워크스페이스에 프로젝트 생성", meta: u, tone: "slate" },
      ...common.slice(1, 3),
      {
        msg: "배포 파이프라인 대기 중",
        meta: "다음: Open AI Agent",
        tone: "amber",
      },
    ];
  }
  if (p.status === "deploying") {
    return [
      ...common,
      { msg: "프로덕션 빌드 큐 등록", meta: "진행 중", tone: "amber" },
      { msg: p.subtitle, meta: "배포", tone: "amber" },
    ];
  }
  if (p.status === "failed") {
    return [
      ...common.slice(0, 2),
      { msg: p.subtitle, meta: "빌드 로그", tone: "amber" },
      {
        msg: "수정 제안: 의존성 버전 고정 후 재빌드",
        meta: "AI 제안",
        tone: "violet",
      },
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
  if (p.status === "failed") {
    return `<ul class="proj-detail-checklist">
        <li class="proj-detail-checklist__row"><span class="proj-detail-check proj-detail-check--todo" aria-hidden="true"></span><span>오류 로그 확인 후 AI에 재빌드 요청</span></li>
        <li class="proj-detail-checklist__row"><span class="proj-detail-check proj-detail-check--todo" aria-hidden="true"></span><span>제안된 수정안 승인 → 미리보기 재검증</span></li>
        <li class="proj-detail-checklist__row"><span class="proj-detail-check proj-detail-check--todo" aria-hidden="true"></span><span>성공 시 변경 반영 승인 → 배포 단계</span></li>
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
      (
        e,
      ) => `<li class="proj-detail-timeline__item proj-detail-timeline__item--${e.tone}">
      <span class="proj-detail-timeline__dot" aria-hidden="true"></span>
      <div class="proj-detail-timeline__body">
        <p class="proj-detail-timeline__msg">${escapeHtml(e.msg)}</p>
        <p class="proj-detail-timeline__meta">${escapeHtml(e.meta)}</p>
      </div>
    </li>`,
    )
    .join("");
  const slugShort = escapeHtml(
    p.slug.slice(0, 18) + (p.slug.length > 18 ? "…" : ""),
  );
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
  const overview = getProjectDetailOverviewHTML(p);
  const main = getProjectDetailMainBlock(p);
  const extras = getProjectDetailExtrasHTML(p);
  return `
      <div class="proj-detail-page">
        <div class="proj-detail">
          <a class="proj-detail-back" href="${HASH_PROJECTS}">
            <span class="proj-detail-back__arrow" aria-hidden="true"></span>
            프로젝트 목록으로 돌아가기
          </a>

          ${overview}

          <div class="proj-detail-toolbar">
            <button type="button" class="proj-detail-agent" id="projOpenAgent">
              <span class="proj-detail-agent__shine" aria-hidden="true"></span>
              <span class="proj-detail-agent__inner">
                <span class="proj-detail-agent__play" aria-hidden="true"></span>
                Open AI Agent
              </span>
            </button>
            <button type="button" class="proj-detail-settings" id="projSettings" disabled>
              프로젝트 설정
            </button>
          </div>
          <p class="proj-detail-settings__hint">프로젝트 설정은 MVP 이후 폼·체크박스 기반으로 확장 예정입니다. (PRD FR-14-2)</p>

          <section class="proj-detail-card" aria-labelledby="proj-work-title">
            <div class="proj-detail-card__accent" aria-hidden="true"></div>
            <h2 id="proj-work-title" class="proj-detail-card__section-title">작업 요약</h2>
            <div class="proj-detail-card__body proj-detail-card__body--flush">
              ${main}
            </div>
          </section>

          ${extras}

          <section class="proj-detail-danger" aria-labelledby="proj-detail-danger-title">
            <div class="proj-detail-danger__inner">
              <div class="proj-detail-danger__copy">
                <h2 id="proj-detail-danger-title" class="proj-detail-danger__title">프로젝트 제거</h2>
                <p class="proj-detail-danger__desc">목록에서만 제거됩니다. 대화 세션은 휴지통으로 이동하며, GitHub 레포는 삭제되지 않습니다.</p>
              </div>
              <button type="button" class="proj-detail-danger__btn" id="projRemoveOpen">
                <span class="proj-detail-danger__trash" aria-hidden="true"></span>
                워크스페이스에서 제거
              </button>
            </div>
          </section>
        </div>

        <div id="projRemoveModal" class="proj-modal" hidden>
          <div class="proj-modal__backdrop" id="projRemoveBackdrop"></div>
          <div class="proj-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="projRemoveModalTitle">
            <h2 id="projRemoveModalTitle" class="proj-modal__title">워크스페이스에서 제거할까요?</h2>
            <p class="proj-modal__body">프로젝트 목록에서만 삭제되고, 실제 GitHub 레포는 삭제되지 않습니다. 연결된 대화 세션은 휴지통으로 옮겨집니다.</p>
            <div class="proj-modal__actions">
              <button type="button" class="app-btn app-btn--ghost" id="projRemoveCancel">취소</button>
              <button type="button" class="proj-modal__confirm" id="projRemoveConfirm">워크스페이스에서 제거</button>
            </div>
          </div>
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

/** 에이전트 화면 미리보기 탭 — 참고 UI와 동일한 데모 랜딩 */
function getAgentWorkspacePreviewIframeHTML(): string {
  const doc = `<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Preview</title><style>
*{box-sizing:border-box}
body{margin:0;min-height:100%;font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;background:#f8fafc;color:#0f172a;}
.hero{min-height:100%;display:flex;align-items:center;justify-content:center;padding:3rem 1.5rem;text-align:center;}
h1{font-size:clamp(1.35rem,3vw,1.85rem);font-weight:700;margin:0 0 1rem;letter-spacing:-.03em;line-height:1.3;}
p{margin:0 auto 1.75rem;max-width:26rem;font-size:.9375rem;line-height:1.65;color:#64748b;}
.cta{display:inline-block;padding:.7rem 1.5rem;border-radius:999px;background:#2563eb;color:#fff;font-weight:600;font-size:.9rem;box-shadow:0 4px 14px rgba(37,99,235,.22);}
</style></head><body><div class="hero"><div><h1>비즈니스를 위한 완벽한 공간</h1><p>자연어로 요청한 수정사항이 실시간으로 여기에 반영됩니다.</p><span class="cta">자세히 알아보기</span></div></div></body></html>`;
  const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(doc)}`;
  return `<iframe class="agent-preview__iframe" title="미리보기" src="${escapeHtml(dataUrl)}" sandbox="allow-scripts"></iframe>`;
}

interface AgentCodeFileEntry {
  path: string;
  diff: string;
}

function buildAgentCodeFileMap(slug: string): Record<string, AgentCodeFileEntry> {
  return {
    index: {
      path: `sites/${slug}/index.html`,
      diff: [
        "-    <section class=\"hero\">",
        "-      <h1>이전 헤드라인</h1>",
        "-      <p>이전 설명 문구</p>",
        "+    <section class=\"hero hero--biz\">",
        "+      <h1>비즈니스를 위한 완벽한 공간</h1>",
        "+      <p>자연어로 요청한 수정사항이 실시간으로 여기에 반영됩니다.</p>",
      ].join("\n"),
    },
    layout: {
      path: `sites/${slug}/layout.tsx`,
      diff: [
        "- export default function Root(props: { children: unknown }) {",
        '-   return <html lang="ko">{props.children}</html>',
        "+ export default function Root(props: { children: unknown }) {",
        '+   return <html lang="ko" className="scroll-smooth">{props.children}</html>',
      ].join("\n"),
    },
    globals: {
      path: "styles/globals.css",
      diff: [
        "-  --brand: #6366f1;",
        "-  --surface: #f8fafc;",
        "+  --brand: #2563eb;",
        "+  --surface: #f1f5f9;",
        "+  --radius-card: 12px;",
      ].join("\n"),
    },
    meta: {
      path: "public/og-meta.json",
      diff: [
        "-  \"title\": \"Draft page\",",
        "-  \"description\": \"\",",
        "+  \"title\": \"" + slug + " · preview\",",
        "+  \"description\": \"AI 생성 데모 메타\"",
      ].join("\n"),
    },
  };
}

function agentDiffToHtml(diff: string): string {
  return diff
    .split("\n")
    .map((line) => {
      if (line.startsWith("+")) {
        return `<span class="agent-diff__line agent-diff__line--add">${escapeHtml(line)}</span>`;
      }
      if (line.startsWith("-")) {
        return `<span class="agent-diff__line agent-diff__line--del">${escapeHtml(line)}</span>`;
      }
      return `<span class="agent-diff__line agent-diff__line--ctx">${escapeHtml(line)}</span>`;
    })
    .join("");
}

const AGENT_TREE_SVG_FOLDER =
  '<span class="agent-tree__icon agent-tree__icon--folder" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"><path d="M3 7a2 2 0 012-2h4l2 2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/></svg></span>';

const AGENT_TREE_SVG_FILE =
  '<span class="agent-tree__icon agent-tree__icon--file" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/></svg></span>';

function getAgentCodeTreeFoldersHTML(slugLabel: string): string {
  return `<ul class="agent-tree" role="tree">
      <li class="agent-tree__node" role="treeitem" aria-expanded="true">
        <div class="agent-tree__row agent-tree__row--folder">
          ${AGENT_TREE_SVG_FOLDER}
          <span class="agent-tree__label">sites</span>
          <span class="agent-tree__badge">3</span>
        </div>
        <ul class="agent-tree__subs" role="group">
          <li class="agent-tree__node" role="treeitem" aria-expanded="true">
            <div class="agent-tree__row agent-tree__row--folder">
              ${AGENT_TREE_SVG_FOLDER}
              <span class="agent-tree__label">${slugLabel}</span>
              <span class="agent-tree__badge">2</span>
            </div>
            <ul class="agent-tree__subs" role="group">
              <li role="none">
                <button type="button" class="agent-tree__row agent-tree__row--file agent-tree__row--active" data-agent-file="index" role="treeitem">
                  ${AGENT_TREE_SVG_FILE}
                  <span class="agent-tree__label">index.html</span>
                  <span class="agent-tree__badge">2</span>
                </button>
              </li>
              <li role="none">
                <button type="button" class="agent-tree__row agent-tree__row--file" data-agent-file="layout" role="treeitem">
                  ${AGENT_TREE_SVG_FILE}
                  <span class="agent-tree__label">layout.tsx</span>
                  <span class="agent-tree__badge">1</span>
                </button>
              </li>
            </ul>
          </li>
        </ul>
      </li>
      <li class="agent-tree__node" role="treeitem" aria-expanded="true">
        <div class="agent-tree__row agent-tree__row--folder">
          ${AGENT_TREE_SVG_FOLDER}
          <span class="agent-tree__label">styles</span>
          <span class="agent-tree__badge">1</span>
        </div>
        <ul class="agent-tree__subs" role="group">
          <li role="none">
            <button type="button" class="agent-tree__row agent-tree__row--file" data-agent-file="globals" role="treeitem">
              ${AGENT_TREE_SVG_FILE}
              <span class="agent-tree__label">globals.css</span>
              <span class="agent-tree__badge">1</span>
            </button>
          </li>
        </ul>
      </li>
      <li class="agent-tree__node" role="treeitem" aria-expanded="true">
        <div class="agent-tree__row agent-tree__row--folder">
          ${AGENT_TREE_SVG_FOLDER}
          <span class="agent-tree__label">public</span>
          <span class="agent-tree__badge">1</span>
        </div>
        <ul class="agent-tree__subs" role="group">
          <li role="none">
            <button type="button" class="agent-tree__row agent-tree__row--file" data-agent-file="meta" role="treeitem">
              ${AGENT_TREE_SVG_FILE}
              <span class="agent-tree__label">og-meta.json</span>
              <span class="agent-tree__badge">1</span>
            </button>
          </li>
        </ul>
      </li>
    </ul>`;
}

function getAgentCodeTreeTagsHTML(): string {
  return `<div class="agent-tree-tags">
      <p class="agent-tree-tags__hint">태그로 묶인 변경 파일입니다. 항목을 누르면 같은 diff가 열립니다. (데모)</p>
      <ul class="agent-tree-tags__list">
        <li>
          <button type="button" class="agent-tree-tag agent-tree-tag--active" data-agent-file="index">
            <span class="agent-tree-tag__text">페이지 · 히어로</span>
            <span class="agent-tree-tag__badge">2</span>
          </button>
        </li>
        <li>
          <button type="button" class="agent-tree-tag" data-agent-file="layout">
            <span class="agent-tree-tag__text">레이아웃 / 루트</span>
            <span class="agent-tree-tag__badge">1</span>
          </button>
        </li>
        <li>
          <button type="button" class="agent-tree-tag" data-agent-file="globals">
            <span class="agent-tree-tag__text">디자인 토큰</span>
            <span class="agent-tree-tag__badge">1</span>
          </button>
        </li>
        <li>
          <button type="button" class="agent-tree-tag" data-agent-file="meta">
            <span class="agent-tree-tag__text">SEO · 메타</span>
            <span class="agent-tree-tag__badge">1</span>
          </button>
        </li>
      </ul>
    </div>`;
}

function getAgentCodeWorkspaceHTML(p: DemoProject): string {
  const map = buildAgentCodeFileMap(p.slug);
  const first = map.index;
  const slugEsc = escapeHtml(p.slug);
  const foldersTree = getAgentCodeTreeFoldersHTML(slugEsc);
  const tagsPane = getAgentCodeTreeTagsHTML();
  return `<div class="agent-code-workspace">
      <aside class="agent-tree-panel" aria-label="코드 탐색">
        <div class="agent-tree-tabs" role="tablist" aria-label="탐색기 모드">
          <button type="button" class="agent-tree-tabs__btn agent-tree-tabs__btn--active" role="tab" aria-selected="true" id="agentCodeTreeTabFolders" data-agent-code-tree-tab="folders">Folders</button>
          <button type="button" class="agent-tree-tabs__btn" role="tab" aria-selected="false" id="agentCodeTreeTabTags" data-agent-code-tree-tab="tags">Tags</button>
        </div>
        <div class="agent-tree-panel__body">
          <div class="agent-tree-panel__pane" role="tabpanel" aria-labelledby="agentCodeTreeTabFolders" data-agent-code-tree-pane="folders" id="agentCodeTreePaneFolders">
            ${foldersTree}
          </div>
          <div class="agent-tree-panel__pane" role="tabpanel" aria-labelledby="agentCodeTreeTabTags" data-agent-code-tree-pane="tags" id="agentCodeTreePaneTags" hidden>
            ${tagsPane}
          </div>
        </div>
      </aside>
      <div class="agent-code-viewer">
        <p class="agent-code-panel__meta" id="agentCodeFileMeta"><code>${escapeHtml(first.path)}</code><span> · 데모 diff</span></p>
        <div class="agent-code-panel__diff" id="agentCodeDiffBody" tabindex="0">${agentDiffToHtml(first.diff)}</div>
      </div>
    </div>`;
}

type AgentPipelineStepState =
  | "done"
  | "running"
  | "pending"
  | "failed"
  | "skipped";

interface AgentPipelineStep {
  title: string;
  detail: string;
  state: AgentPipelineStepState;
}

function getAgentPipelineSteps(p: DemoProject): AgentPipelineStep[] {
  const ver = p.deployVersion > 0 ? `아티팩트 v${p.deployVersion}` : "아티팩트 없음";
  if (p.status === "done") {
    return [
      { title: "Lint · 타입체크", detail: "통과 · ~14s", state: "done" },
      { title: "의존성 설치 · 빌드", detail: `성공 · ${ver}`, state: "done" },
      { title: "Preview 배포", detail: "preview 브랜치 반영 완료", state: "done" },
      { title: "승인 · main 병합", detail: "승인됨 · CI 통과", state: "done" },
      { title: "Production 배포", detail: "GitHub Pages · 라이브", state: "done" },
      { title: "배포 후 스모크", detail: "HTTP 200 · 엣지 캐시", state: "done" },
    ];
  }
  if (p.status === "deploying") {
    return [
      { title: "Lint · 타입체크", detail: "통과", state: "done" },
      { title: "의존성 설치 · 빌드", detail: "성공", state: "done" },
      { title: "Preview 배포", detail: "진행 중 · DNS·SSL 전파", state: "running" },
      { title: "승인 · main 병합", detail: "대기 중", state: "pending" },
      { title: "Production 배포", detail: "대기 중", state: "pending" },
      { title: "배포 후 스모크", detail: "—", state: "pending" },
    ];
  }
  if (p.status === "failed") {
    const err = p.subtitle.trim() || "빌드 단계에서 종료";
    return [
      { title: "Lint · 타입체크", detail: "통과", state: "done" },
      { title: "의존성 설치 · 빌드", detail: err, state: "failed" },
      { title: "Preview 배포", detail: "스킵", state: "skipped" },
      { title: "승인 · main 병합", detail: "—", state: "skipped" },
      { title: "Production 배포", detail: "—", state: "skipped" },
      { title: "배포 후 스모크", detail: "—", state: "skipped" },
    ];
  }
  return [
    { title: "Lint · 타입체크", detail: "저장소 훅 연결 후 실행", state: "pending" },
    { title: "의존성 설치 · 빌드", detail: "첫 유효 커밋 필요", state: "pending" },
    { title: "Preview 배포", detail: "—", state: "pending" },
    { title: "승인 · main 병합", detail: "—", state: "pending" },
    { title: "Production 배포", detail: "—", state: "pending" },
    { title: "배포 후 스모크", detail: "—", state: "pending" },
  ];
}

function getAgentPipelineSectionHTML(p: DemoProject): string {
  const steps = getAgentPipelineSteps(p);
  const rows = steps
    .map(
      (s) => `<li class="agent-pipeline__step agent-pipeline__step--${s.state}">
      <div class="agent-pipeline__track">
        <span class="agent-pipeline__mark"></span>
      </div>
      <div class="agent-pipeline__step-body">
        <span class="agent-pipeline__step-title">${escapeHtml(s.title)}</span>
        <span class="agent-pipeline__step-detail">${escapeHtml(s.detail)}</span>
      </div>
    </li>`,
    )
    .join("");
  const runLabel =
    p.status === "done"
      ? `최근 실행 · 성공 (${escapeHtml(p.updated)})`
      : p.status === "deploying"
        ? "실행 중 · Preview 배포 단계"
        : p.status === "failed"
          ? "최근 실행 · 실패 (로그 확인)"
          : "파이프라인 대기 중";
  return `<section class="agent-pipeline agent-pipeline--embed" aria-labelledby="agent-pipeline-title">
      <div class="agent-pipeline__head">
        <div class="agent-pipeline__head-text">
          <h2 id="agent-pipeline-title" class="agent-pipeline__title">코드 배포 파이프라인</h2>
          <p class="agent-pipeline__run">${runLabel}</p>
        </div>
        <button type="button" class="agent-pipeline__log-btn" id="agentPipelineLog">워크플로 로그</button>
      </div>
      <ol class="agent-pipeline__steps">${rows}</ol>
      <p class="agent-pipeline__hint">CI(GitHub Actions 등)와 연동하면 동일한 단계가 자동으로 갱신됩니다. 지금은 프로젝트 상태 기준 데모입니다.</p>
    </section>`;
}

function getProjectAgentInnerHTML(p: DemoProject, activeTab: AgentWorkspaceTab): string {
  const slugSafe = escapeHtml(p.slug);
  const backHref = getProjectHash(p.slug);
  const previewIframe = getAgentWorkspacePreviewIframeHTML();
  const codePanel = getAgentCodeWorkspaceHTML(p);
  const pipeline = getAgentPipelineSectionHTML(p);
  const liveExtra = isProjectLiveUrl(p)
    ? `<p class="agent-live-link"><a href="${escapeHtml(p.subtitle.trim())}" target="_blank" rel="noopener noreferrer">실제 라이브 URL 열기 ↗</a></p>`
    : "";
  const onPreview = activeTab === "preview";
  const onCode = activeTab === "code";
  const onPipeline = activeTab === "pipeline";

  return `
      <div class="agent-page">
        <div class="agent-shell">
          <div class="agent-main-col">
            <div class="agent-toolbar">
              <a class="agent-exit" href="${backHref}">
                <span class="agent-exit__chev" aria-hidden="true">‹</span>
                나가기
              </a>
              <div class="agent-tabs" role="tablist" aria-label="작업 영역">
                <button type="button" class="agent-tab${onPreview ? " agent-tab--active" : ""}" role="tab" aria-selected="${onPreview}" aria-controls="agentPanelPreview" id="agentTabPreview" data-agent-tab="preview">미리보기</button>
                <button type="button" class="agent-tab${onCode ? " agent-tab--active" : ""}" role="tab" aria-selected="${onCode}" aria-controls="agentPanelCode" id="agentTabCode" data-agent-tab="code">Code (Diff)</button>
                <button type="button" class="agent-tab${onPipeline ? " agent-tab--active" : ""}" role="tab" aria-selected="${onPipeline}" aria-controls="agentPanelPipeline" id="agentTabPipeline" data-agent-tab="pipeline">Pipeline</button>
              </div>
              <span class="agent-branch-pill">preview branch</span>
            </div>

            <div class="agent-panels">
              <div class="agent-panel" id="agentPanelPreview" role="tabpanel" aria-labelledby="agentTabPreview" data-agent-panel="preview"${onPreview ? "" : " hidden"}>
                <div class="agent-browser-chrome">
                  <div class="agent-browser-chrome__dots" aria-hidden="true">
                    <span></span><span></span><span></span>
                  </div>
                  <div class="agent-browser-chrome__url" title="프리뷰 환경 (데모)">sys-ai-preview-env.local</div>
                </div>
                <div class="agent-preview__frame agent-preview__frame--panel">
                  ${previewIframe}
                </div>
                ${liveExtra}
              </div>
              <div class="agent-panel" id="agentPanelCode" role="tabpanel" aria-labelledby="agentTabCode" data-agent-panel="code"${onCode ? "" : " hidden"}>
                ${codePanel}
              </div>
              <div class="agent-panel agent-panel--scroll" id="agentPanelPipeline" role="tabpanel" aria-labelledby="agentTabPipeline" data-agent-panel="pipeline"${onPipeline ? "" : " hidden"}>
                <div class="agent-panel__inner">
                  ${pipeline}
                </div>
              </div>
            </div>
          </div>

          <aside class="agent-sidebar" aria-label="SYS.AI Agent">
            <header class="agent-sidebar__head">
              <h2 class="agent-sidebar__title">SYS.AI Agent</h2>
              <button type="button" class="agent-sidebar__help" id="agentHelpBtn">도움말 보기</button>
            </header>
            <div id="agentChatThread" class="agent-sidebar__thread">
              <div class="agent-bubble agent-bubble--ai">
                <div class="agent-bubble__body">안녕하세요! <strong>${slugSafe}</strong> 워크스페이스입니다. 추천 프롬프트를 눌러 보면 수정과 배포가 어떻게 이어지는지 데모로 확인할 수 있어요.</div>
              </div>
            </div>
            <form id="agentChatForm" class="agent-sidebar__composer">
              <div class="agent-suggestions">
                <button type="button" class="agent-suggestion" data-agent-chip="UI 수정 요청: 히어로 섹션을 더 미니멀하게 바꿔 주세요">UI 수정 요청</button>
                <button type="button" class="agent-suggestion" data-agent-chip="도메인 연결과 프로덕션 배포 일정을 알려 주세요">도메인 &amp; 배포 요청</button>
              </div>
              <label class="agent-visually-hidden" for="agentChatInput">메시지 입력</label>
              <div class="agent-compose-row">
                <textarea id="agentChatInput" class="agent-compose__input" rows="2" placeholder="직접 입력하거나 위 추천 버튼을 누르세요" autocomplete="off"></textarea>
                <button type="submit" class="agent-compose__send" id="agentChatSend" aria-label="보내기">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                </button>
              </div>
            </form>
          </aside>
        </div>
      </div>`;
}

function bindProjectAgentPage(p: DemoProject): void {
  const form = document.getElementById("agentChatForm");
  const input = document.getElementById("agentChatInput") as HTMLTextAreaElement | null;
  const thread = document.getElementById("agentChatThread");
  if (!form || !input || !thread) return;

  const codeFileMap = buildAgentCodeFileMap(p.slug);
  const codeMetaEl = document.getElementById("agentCodeFileMeta");
  const codeDiffEl = document.getElementById("agentCodeDiffBody");
  const codePanelEl = document.getElementById("agentPanelCode");

  const showAgentCodeFile = (fileId: string): void => {
    const entry = codeFileMap[fileId];
    if (!entry || !codeMetaEl || !codeDiffEl) return;
    codeMetaEl.innerHTML = `<code>${escapeHtml(entry.path)}</code><span> · 데모 diff</span>`;
    codeDiffEl.innerHTML = agentDiffToHtml(entry.diff);
    codePanelEl?.querySelectorAll<HTMLElement>(".agent-tree__row--file[data-agent-file]").forEach((row) => {
      row.classList.toggle("agent-tree__row--active", row.dataset.agentFile === fileId);
    });
    codePanelEl?.querySelectorAll<HTMLButtonElement>(".agent-tree-tag[data-agent-file]").forEach((tag) => {
      tag.classList.toggle("agent-tree-tag--active", tag.dataset.agentFile === fileId);
    });
  };

  codePanelEl?.addEventListener("click", (e) => {
    const hit = (e.target as HTMLElement).closest("[data-agent-file]");
    if (hit instanceof HTMLButtonElement) {
      const fid = hit.dataset.agentFile;
      if (fid) showAgentCodeFile(fid);
    }
  });

  const treeTabButtons = codePanelEl?.querySelectorAll<HTMLButtonElement>("[data-agent-code-tree-tab]");
  treeTabButtons?.forEach((tab) => {
    tab.addEventListener("click", () => {
      const id = tab.dataset.agentCodeTreeTab;
      const root = codePanelEl;
      if (!id || !root) return;
      root.querySelectorAll<HTMLButtonElement>("[data-agent-code-tree-tab]").forEach((t) => {
        const on = t.dataset.agentCodeTreeTab === id;
        t.classList.toggle("agent-tree-tabs__btn--active", on);
        t.setAttribute("aria-selected", String(on));
      });
      root.querySelectorAll<HTMLElement>("[data-agent-code-tree-pane]").forEach((pane) => {
        const on = pane.dataset.agentCodeTreePane === id;
        pane.toggleAttribute("hidden", !on);
      });
    });
  });

  const applyAgentWorkspaceTab = (tab: AgentWorkspaceTab): void => {
    document.querySelectorAll<HTMLButtonElement>("[data-agent-tab]").forEach((t) => {
      const on = t.dataset.agentTab === tab;
      t.classList.toggle("agent-tab--active", on);
      t.setAttribute("aria-selected", String(on));
    });
    document.querySelectorAll<HTMLElement>("[data-agent-panel]").forEach((panel) => {
      const on = panel.dataset.agentPanel === tab;
      panel.toggleAttribute("hidden", !on);
    });
  };

  document.querySelectorAll<HTMLButtonElement>("[data-agent-tab]").forEach((tabBtn) => {
    tabBtn.addEventListener("click", () => {
      const id = tabBtn.dataset.agentTab as AgentWorkspaceTab | undefined;
      if (id !== "preview" && id !== "code" && id !== "pipeline") return;
      applyAgentWorkspaceTab(id);
      const nextHash = getProjectAgentHash(p.slug, id);
      if (window.location.hash !== nextHash) {
        history.pushState(null, "", nextHash);
      }
    });
  });

  document.querySelectorAll<HTMLButtonElement>(".agent-suggestion").forEach((chip) => {
    chip.addEventListener("click", () => {
      const v = chip.getAttribute("data-agent-chip");
      if (v) {
        input.value = v;
        input.focus();
      }
    });
  });

  document.getElementById("agentHelpBtn")?.addEventListener("click", () => {
    window.alert(
      "SYS.AI Agent에서는 자연어로 UI·카피·배포를 요청할 수 있습니다.\n\n미리보기: 생성 페이지 확인\nCode (Diff): 변경 파일 데모\nPipeline: CI/CD 단계 확인\n\n실제 제품에서는 이 화면이 저장소·호스팅과 실시간으로 연동됩니다.",
    );
  });

  const demoReply = (userText: string): string => {
    const short = userText.length > 160 ? `${userText.slice(0, 160)}…` : userText;
    return `「${short}」 반영해 볼게요. ${p.slug} 기준으로 (1) 미리보기 HTML을 고치고 (2) Code 탭에 diff를 쌓은 뒤 (3) Pipeline에서 빌드·배포 단계로 넘깁니다. 데모라 이 브라우저 안에서만 메시지가 쌓입니다.`;
  };

  const appendUser = (text: string): void => {
    const wrap = document.createElement("div");
    wrap.className = "agent-bubble agent-bubble--user";
    wrap.innerHTML = `<div class="agent-bubble__body"></div>`;
    wrap.querySelector(".agent-bubble__body")!.textContent = text;
    thread.appendChild(wrap);
  };

  const appendAssistant = (text: string): void => {
    const wrap = document.createElement("div");
    wrap.className = "agent-bubble agent-bubble--ai";
    wrap.innerHTML = `<div class="agent-bubble__body"></div>`;
    wrap.querySelector(".agent-bubble__body")!.textContent = text;
    thread.appendChild(wrap);
  };

  const scrollThread = (): void => {
    thread.scrollTop = thread.scrollHeight;
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    appendUser(text);
    scrollThread();
    window.setTimeout(() => {
      appendAssistant(demoReply(text));
      scrollThread();
    }, 400);
  });

  document.getElementById("agentPipelineLog")?.addEventListener("click", () => {
    const slugLine = `workflow: ${p.slug} · preview-ci.yml (데모)`;
    let body: string;
    if (p.status === "failed") {
      body = `[00:08] checkout ref=preview\n[00:12] npm ci — 184 packages\n[00:41] npm run build\n[00:42] ✖ ${p.subtitle || "Exit code 1"}\n[00:42] 빌드 단계 실패 · 아티팩트 미생성`;
    } else if (p.status === "done") {
      body = `[00:07] checkout\n[00:11] npm ci\n[00:38] npm run build — ok\n[00:39] upload artifact ${p.deployVersion > 0 ? `v${p.deployVersion}` : "build/"}\n[00:55] deploy pages — production\n[00:58] smoke https://… — 200 OK`;
    } else if (p.status === "deploying") {
      body = `[00:06] checkout preview\n[00:10] npm ci\n[00:35] npm run build — ok\n[00:36] deploy preview — running\n[00:36] … Waiting for DNS propagation`;
    } else {
      body = `[—] 워크플로가 아직 트리거되지 않았습니다.\n[—] 첫 푸시 또는 “Open AI Agent”에서 생성된 커밋이 들어오면 파이프라인이 시작됩니다.`;
    }
    window.alert(`${slugLine}\n\n${body}`);
  });
}

function bindProjectListPage(): void {
  document.getElementById("projBtnZip")?.addEventListener("click", () => {
    window.alert(
      "ZIP 업로드 후 구조 분석·미리보기 생성까지 연결됩니다. (PRD FR-3)",
    );
  });
  document.getElementById("projBtnGh")?.addEventListener("click", () => {
    window.alert(
      "GitHub 연동 후 저장소 목록에서 선택·가져오기 확인 단계로 진입합니다. (PRD FR-4)",
    );
  });
  document.getElementById("projBtnNew")?.addEventListener("click", () => {
    window.alert(
      "빠른 초안 / 고완성도 초안 모드 선택 후 작업이 시작됩니다. (PRD FR-2)",
    );
  });
  const grid = document.getElementById("projGrid");
  grid?.addEventListener("click", (e) => {
    const el = e.target as HTMLElement;
    if (el.closest(".proj-card__live-url")) return;
    const hit = el.closest(".proj-card__hit") as HTMLElement | null;
    const nav = hit?.dataset.projectNav;
    if (nav) window.location.hash = nav;
  });
  grid?.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const hit = (e.target as HTMLElement).closest(
      ".proj-card__hit",
    ) as HTMLElement | null;
    const nav = hit?.dataset.projectNav;
    if (nav) {
      e.preventDefault();
      window.location.hash = nav;
    }
  });

  const setProjectListPage = (page: number): void => {
    const nav = document.getElementById("projPagination");
    if (!nav) return;
    const clamped = Math.max(
      1,
      Math.min(PROJECT_LIST_PAGE_COUNT, Math.floor(page)),
    );
    nav.querySelectorAll<HTMLButtonElement>("[data-proj-page]").forEach((b) => {
      const n = Number(b.dataset.projPage);
      const on = n === clamped;
      b.classList.toggle("proj-pagination__btn--current", on);
      if (on) b.setAttribute("aria-current", "page");
      else b.removeAttribute("aria-current");
    });
    document
      .getElementById("projPaginationPrev")
      ?.toggleAttribute("disabled", clamped <= 1);
    document
      .getElementById("projPaginationNext")
      ?.toggleAttribute("disabled", clamped >= PROJECT_LIST_PAGE_COUNT);
    const st = document.getElementById("projPaginationStatus");
    if (st) {
      st.innerHTML = `<strong>${clamped}</strong> / ${PROJECT_LIST_PAGE_COUNT}`;
    }
  };

  document.getElementById("projPagination")?.addEventListener("click", (e) => {
    const el = e.target as HTMLElement;
    if (el.closest("#projPaginationPrev")) {
      const cur =
        document.querySelector<HTMLButtonElement>(
          ".proj-pagination__btn--current[data-proj-page]",
        )?.dataset.projPage ?? "1";
      setProjectListPage(Number(cur) - 1);
      return;
    }
    if (el.closest("#projPaginationNext")) {
      const cur =
        document.querySelector<HTMLButtonElement>(
          ".proj-pagination__btn--current[data-proj-page]",
        )?.dataset.projPage ?? "1";
      setProjectListPage(Number(cur) + 1);
      return;
    }
    const t = el.closest("[data-proj-page]");
    if (t instanceof HTMLButtonElement) {
      setProjectListPage(Number(t.dataset.projPage));
    }
  });
}

function bindProjectDetailPage(p: DemoProject): void {
  const copyBtn = document.getElementById("projCopyUrl");
  copyBtn?.addEventListener("click", async () => {
    if (!isProjectLiveUrl(p)) return;
    try {
      await navigator.clipboard.writeText(p.subtitle);
      copyBtn.textContent = "복사됨";
      window.setTimeout(() => {
        copyBtn.textContent = "복사";
      }, 2000);
    } catch {
      window.alert("클립보드 복사에 실패했습니다.");
    }
  });

  document.getElementById("projOpenAgent")?.addEventListener("click", () => {
    window.location.hash = getProjectAgentHash(p.slug);
  });

  const modal = document.getElementById("projRemoveModal");
  const showModal = (show: boolean): void => {
    if (modal) modal.hidden = !show;
  };

  document
    .getElementById("projRemoveOpen")
    ?.addEventListener("click", () => showModal(true));
  document
    .getElementById("projRemoveBackdrop")
    ?.addEventListener("click", () => showModal(false));
  document
    .getElementById("projRemoveCancel")
    ?.addEventListener("click", () => showModal(false));
  document
    .getElementById("projRemoveConfirm")
    ?.addEventListener("click", () => {
      showModal(false);
      window.location.hash = HASH_PROJECTS;
    });
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
  let mainExtraClass = "";
  let omitSidebar = false;

  if (route.kind === "projects") {
    sidebar = "projects";
    inner = getProjectsInnerHTML();
    title = "프로젝트 — AI Web Builder";
  } else if (route.kind === "projectAgent") {
    sidebar = "projects";
    const p = DEMO_PROJECTS.find((x) => x.slug === route.slug);
    inner = p ? getProjectAgentInnerHTML(p, route.tab) : getProjectNotFoundInnerHTML();
    title = p ? `${p.slug} · 에이전트 — AI Web Builder` : "프로젝트 — AI Web Builder";
    if (p) {
      mainExtraClass = "app-main--agent";
      omitSidebar = true;
    }
  } else if (route.kind === "project") {
    sidebar = "projects";
    const p = DEMO_PROJECTS.find((x) => x.slug === route.slug);
    inner = p ? getProjectDetailInnerHTML(p) : getProjectNotFoundInnerHTML();
    title = p ? `${p.slug} — AI Web Builder` : "프로젝트 — AI Web Builder";
  } else {
    inner = DASHBOARD_INNER;
    title = "대시보드 — AI Web Builder";
  }

  root.innerHTML = getAppLayoutHTML(sidebar, inner, mainExtraClass, omitSidebar);
  document.title = title;

  if (route.kind === "projects") {
    bindProjectListPage();
  } else if (route.kind === "projectAgent") {
    const proj = DEMO_PROJECTS.find((x) => x.slug === route.slug);
    if (proj) bindProjectAgentPage(proj);
  } else if (route.kind === "project") {
    const proj = DEMO_PROJECTS.find((x) => x.slug === route.slug);
    if (proj) bindProjectDetailPage(proj);
  }
}

function renderRoute(): void {
  if (isAppRoute()) {
    mountApp();
  } else {
    mountLanding();
  }
}

window.addEventListener("hashchange", renderRoute);
window.addEventListener("popstate", renderRoute);
renderRoute();
