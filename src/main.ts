import "./landing.css";
import "./app.css";
import typescriptLogo from "./assets/typescript.svg";
import viteLogo from "./assets/vite.svg";

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

function getAppSubroute(): "dashboard" | "projects" {
  return window.location.hash === HASH_PROJECTS ? "projects" : "dashboard";
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
        <span class="app-sidebar__title">AI Web Builder</span>
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

function getLandingHTML(viteLogo: string, typescriptLogo: string): string {
  return `
  <div class="container">
    <header class="topbar">
      <div class="brand" aria-label="Brand">
        <div class="brand-mark" aria-hidden="true"></div>
        <div class="brand-title">
          <strong>AI Web Builder</strong>
          <span>프롬프트로 랜딩을 생성</span>
        </div>
      </div>

      <nav class="nav" aria-label="Primary navigation">
        <a href="#features">기능</a>
        <a href="#content">사용 방법</a>
        <a href="#how">작동 방식</a>
        <a href="#pricing">요금</a>
      </nav>

      <div class="actions">
        <button class="btn btn-ghost" type="button" id="btnLogin">로그인</button>
        <button class="btn btn-primary" type="button">무료 시작</button>
      </div>
    </header>

    <section class="hero" aria-label="Hero section">
      <div>
        <div class="badge"><i aria-hidden="true"></i> 이미지처럼 빠르게, 깔끔하게</div>
        <h1>빠르게 만들고, 더 빠르게 수정하세요</h1>
        <p class="lead">
          한 문장으로 콘셉트를 입력하면, 보기 좋은 랜딩 페이지를 자동 생성합니다.
          버튼/섹션/레이아웃을 조정해서 원하는 톤으로 바로 맞춰보세요.
        </p>

        <form class="prompt" id="promptForm">
          <input
            id="promptInput"
            name="prompt"
            type="text"
            placeholder="예: '카페 브랜드'의 따뜻한 다크 랜딩 페이지 만들어줘"
            autocomplete="off"
          />
          <button class="btn btn-primary" type="submit">생성하기</button>
        </form>

        <p class="status" id="status" aria-live="polite"></p>

        <div class="hero-meta" aria-label="Highlights">
          <div class="chip"><strong>3분</strong> 안에 초안</div>
          <div class="chip"><strong>반응형</strong> 기본 제공</div>
          <div class="chip"><strong>UI 톤</strong> 커스터마이즈</div>
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
            <div class="mock-title">렌더링 미리보기</div>
          </div>

          <div class="mock-body">
            <div class="mock-grid">
              <div class="mock-left">
                <h3>채널</h3>
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
                      <button class="mini-btn primary" type="button">
                        <span style="display:inline-flex;gap:8px;align-items:center;">
                          <img src="${viteLogo}" alt="Vite logo" width="16" height="16" />
                          생성
                        </span>
                      </button>
                      <button class="mini-btn" type="button">
                        <span style="display:inline-flex;gap:8px;align-items:center;">
                          <img src="${typescriptLogo}" alt="TypeScript logo" width="16" height="16" />
                          수정
                        </span>
                      </button>
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
            <div class="stack-badge">code</div>
          </div>
        </div>

        <div class="content-panel">
          <div class="panel-block">
            <div class="panel-eyebrow">쉽게 시작하는 basic</div>
            <h2>콘텐츠를 만들고, 바로 붙여넣으세요</h2>
            <p>
              이미지/문구/구조를 “한 화면에 보기 좋게” 정리하는 방식으로 랜딩 초안을 빠르게 만들어줍니다.
              톤을 바꿔도 레이아웃이 무너지지 않도록 구성돼요.
            </p>
          </div>

          <div class="panel-block">
            <div class="panel-eyebrow accent">월 사용료 0원!</div>
            <p>먼저 데모 UI로 확인하고, 이후 AI 연동만 연결하면 실서비스로 확장할 수 있어요.</p>
          </div>

          <div class="panel-block">
            <div class="panel-eyebrow">사용 방법</div>
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
          <h2>필요한 UI를 바로</h2>
          <p>랜딩 페이지에 자주 쓰는 구조를 “정리된 카드” 형태로 제공합니다.</p>
        </div>
      </div>

      <div class="feature-grid">
        <article class="card">
          <div class="ic" aria-hidden="true">01</div>
          <h3>섹션 자동 구성</h3>
          <p>히어로, 기능, 후기, CTA까지. 콘셉트에 맞는 순서로 묶어드립니다.</p>
        </article>
        <article class="card">
          <div class="ic" aria-hidden="true">02</div>
          <h3>톤 매칭</h3>
          <p>다크/라이트, 미니멀/화려한 톤 등 스타일 가이드를 기반으로 UI를 조정합니다.</p>
        </article>
        <article class="card">
          <div class="ic" aria-hidden="true">03</div>
          <h3>빠른 수정</h3>
          <p>버튼 문구, 컬러, 레이아웃 변경을 프롬프트로 반복해서 다듬을 수 있어요.</p>
        </article>
      </div>
    </div>
  </section>

  <section id="how" class="section" style="padding-top:0;">
    <div class="container">
      <div class="section-head">
        <div>
          <h2>작동 방식</h2>
          <p>프롬프트 -> 레이아웃 생성 -> 편집 -> 배포 순서로 진행됩니다.</p>
        </div>
      </div>

      <div class="feature-grid">
        <article class="card">
          <div class="ic" aria-hidden="true">A</div>
          <h3>프롬프트 입력</h3>
          <p>대상/목표/톤을 한 문장으로 적어보세요.</p>
        </article>
        <article class="card">
          <div class="ic" aria-hidden="true">B</div>
          <h3>초안 생성</h3>
          <p>레이아웃과 컴포넌트를 조합해 바로 확인합니다.</p>
        </article>
        <article class="card">
          <div class="ic" aria-hidden="true">C</div>
          <h3>다듬기</h3>
          <p>원하는 방향으로 “이렇게 바꿔줘”를 추가로 입력합니다.</p>
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
      <div class="site-footer__quick" aria-label="빠른 링크">
        <div class="site-footer__quick-row">
          <span class="site-footer__quick-label">AI WEB BUILDER</span>
          <div class="site-footer__quick-links">
            <a href="#">회사 소개</a>
            <a href="#">파트너십 문의</a>
            <a href="#">보도자료</a>
          </div>
        </div>
        <div class="site-footer__quick-row">
          <span class="site-footer__quick-label">파트너</span>
          <div class="site-footer__quick-links">
            <a href="#">디자인 · 파트너 어드민</a>
            <a href="#">판매자 어드민</a>
            <a href="#">쇼핑몰 제작 제휴</a>
          </div>
        </div>
        <div class="site-footer__quick-row">
          <span class="site-footer__quick-label">개발자</span>
          <div class="site-footer__quick-links">
            <a href="#">개발자 센터</a>
            <a href="#">워크스페이스</a>
          </div>
        </div>
        <div class="site-footer__quick-row site-footer__quick-row--last">
          <span class="site-footer__quick-label">고객센터</span>
          <div class="site-footer__quick-links">
            <a href="#">쇼핑몰 제작 문의</a>
            <a href="#">뉴스</a>
            <a href="#">가이드</a>
            <a href="#">온라인 교육</a>
            <a href="#">보안</a>
          </div>
        </div>
      </div>

      <div class="site-footer__rule" role="presentation"></div>

      <div class="site-footer__grid">
        <nav class="footer-col" aria-label="제품">
          <h3 class="footer-col__title">제품</h3>
          <ul class="footer-col__list">
            <li><a href="#">Claude</a></li>
            <li><a href="#">Claude Code</a></li>
            <li><a href="#">Claude Code for Enterprise</a></li>
            <li><a href="#">협업</a></li>
            <li><a href="#">맥스 플랜</a></li>
            <li><a href="#">Team 요금제</a></li>
            <li><a href="#">Enterprise 요금제</a></li>
            <li><a href="#">앱 다운로드</a></li>
            <li><a href="#">요금제</a></li>
            <li><a href="#">로그인</a></li>
          </ul>
        </nav>
        <nav class="footer-col" aria-label="기능">
          <h3 class="footer-col__title">기능</h3>
          <ul class="footer-col__list">
            <li><a href="#">Chrome용 Claude</a></li>
            <li><a href="#">Claude for Excel</a></li>
            <li><a href="#">PowerPoint용 Claude</a></li>
            <li><a href="#">Claude for Slack</a></li>
            <li><a href="#">스킬</a></li>
          </ul>
        </nav>
        <nav class="footer-col" aria-label="모델">
          <h3 class="footer-col__title">모델</h3>
          <ul class="footer-col__list">
            <li><a href="#">Opus</a></li>
            <li><a href="#">Sonnet</a></li>
            <li><a href="#">Haiku</a></li>
          </ul>
        </nav>
        <nav class="footer-col" aria-label="솔루션">
          <h3 class="footer-col__title">솔루션</h3>
          <ul class="footer-col__list">
            <li><a href="#">AI 에이전트</a></li>
            <li><a href="#">Claude Code 보안</a></li>
            <li><a href="#">코드 현대화</a></li>
            <li><a href="#">코딩</a></li>
            <li><a href="#">고객 지원</a></li>
            <li><a href="#">교육</a></li>
            <li><a href="#">금융 서비스</a></li>
            <li><a href="#">정부</a></li>
            <li><a href="#">의료</a></li>
            <li><a href="#">생명과학</a></li>
            <li><a href="#">비영리 단체</a></li>
          </ul>
        </nav>
        <nav class="footer-col" aria-label="Claude Platform">
          <h3 class="footer-col__title">Claude Platform</h3>
          <ul class="footer-col__list">
            <li><a href="#">개요</a></li>
            <li><a href="#">개발자 문서</a></li>
            <li><a href="#">요금제</a></li>
            <li><a href="#">마켓플레이스</a></li>
            <li><a href="#">Amazon Bedrock</a></li>
            <li><a href="#">Google Cloud's Vertex AI</a></li>
            <li><a href="#">Microsoft Foundry</a></li>
            <li><a href="#">지역 규정 준수</a></li>
            <li><a href="#">콘솔 로그인</a></li>
          </ul>
        </nav>
        <nav class="footer-col" aria-label="리소스">
          <h3 class="footer-col__title">리소스</h3>
          <ul class="footer-col__list">
            <li><a href="#">블로그</a></li>
            <li><a href="#">Claude 파트너 네트워크</a></li>
            <li><a href="#">커넥터</a></li>
            <li><a href="#">강의</a></li>
            <li><a href="#">고객 사례</a></li>
            <li><a href="#">Anthropic 엔지니어링</a></li>
            <li><a href="#">이벤트</a></li>
            <li><a href="#">플러그인</a></li>
            <li><a href="#">Powered by Claude</a></li>
            <li><a href="#">서비스 파트너</a></li>
            <li><a href="#">커뮤니티</a></li>
            <li><a href="#">Campus Program</a></li>
            <li><a href="#">스타트업 프로그램</a></li>
            <li><a href="#">튜토리얼</a></li>
            <li><a href="#">활용 사례</a></li>
          </ul>
        </nav>
        <nav class="footer-col" aria-label="회사">
          <h3 class="footer-col__title">회사</h3>
          <ul class="footer-col__list">
            <li><a href="#">Anthropic</a></li>
            <li><a href="#">채용 정보</a></li>
            <li><a href="#">경제 전망</a></li>
            <li><a href="#">연구</a></li>
            <li><a href="#">Anthropic 소식</a></li>
            <li><a href="#">책임감 있는 확장 정책</a></li>
            <li><a href="#">보안 및 컴플라이언스</a></li>
            <li><a href="#">투명성</a></li>
          </ul>
        </nav>
        <nav class="footer-col" aria-label="도움말 및 보안">
          <h3 class="footer-col__title">도움말 및 보안</h3>
          <ul class="footer-col__list">
            <li><a href="#">서비스 지역</a></li>
            <li><a href="#">상태</a></li>
            <li><a href="#">지원 센터</a></li>
          </ul>
        </nav>
        <nav class="footer-col" aria-label="약관 및 정책">
          <h3 class="footer-col__title">약관 및 정책</h3>
          <ul class="footer-col__list">
            <li><a href="#">개인정보 선택</a></li>
            <li><a href="#">개인정보 처리방침</a></li>
            <li><a href="#">책임감 있는 공개 정책</a></li>
            <li><a href="#">서비스 약관: 상업용</a></li>
            <li><a href="#">서비스 약관: 개인용</a></li>
            <li><a href="#">이용 정책</a></li>
          </ul>
        </nav>
      </div>

      <div class="site-footer__rule" role="presentation"></div>

      <div class="site-footer__company">
        <div class="site-footer__company-main">
          <a class="site-footer__logo site-footer__logo--inline" href="#">
            <span class="site-footer__logo-mark" aria-hidden="true"></span>
            <span class="site-footer__logo-text">AI Web Builder</span>
          </a>
          <p class="site-footer__legal">
            (주)데모스튜디오 · 대표이사 홍길동, 김철수 · 개인정보보호책임자 privacy@demo.studio · 고객센터 1588-0000 ·
            팩스 02-0000-0000 · 서울특별시 강남구 테헤란로 000 · 사업자등록번호 000-00-00000 · 통신판매업 신고
            제0000-서울강남-0000호
          </p>
          <nav class="site-footer__legal-nav" aria-label="법적 고지">
            <a href="#">이용약관</a>
            <a href="#" class="site-footer__legal-nav--strong">개인정보처리방침</a>
            <a href="#">네임서버</a>
            <a href="#">사이트맵</a>
            <a href="#">브랜드 사이트</a>
          </nav>
        </div>
        <div class="site-footer__company-aside">
          <button type="button" class="site-footer__lang" aria-haspopup="listbox" aria-expanded="false">
            <svg class="site-footer__lang-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            한국어
            <span class="site-footer__lang-chevron" aria-hidden="true">▾</span>
          </button>
          <div class="site-footer__awards" aria-label="수상 및 인증">
            <div class="site-footer__award" role="img" aria-label="웹어워드 수상">WEB<br />AWARD</div>
            <div class="site-footer__award" role="img" aria-label="고객만족 우수기업">CS<br />2025</div>
            <div class="site-footer__award" role="img" aria-label="정보보호 인증">ISMS</div>
          </div>
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
      <div class="app-toolbar">
        <div class="app-toolbar__search-wrap">
          <span class="app-toolbar__search-icon" aria-hidden="true">⌕</span>
          <input type="search" class="app-toolbar__search" placeholder="프로젝트, 페이지 검색…" aria-label="검색" />
        </div>
        <div class="app-toolbar__actions">
          <span class="app-toolbar__date">2026년 4월 3일 · 금요일</span>
          <button type="button" class="app-btn app-btn--ghost">보내기</button>
          <button type="button" class="app-btn app-btn--primary">+ 새 프로젝트</button>
        </div>
      </div>

      <header class="app-header app-header--row">
        <div>
          <h1 class="app-header__title">대시보드</h1>
          <p class="app-header__sub">이번 주 활동 요약과 배포 현황을 한눈에 확인하세요.</p>
        </div>
      </header>

      <section class="app-kpis" aria-label="주요 지표">
        <article class="app-kpi">
          <p class="app-kpi__label">총 페이지 뷰</p>
          <p class="app-kpi__value">48.2k</p>
          <p class="app-kpi__delta app-kpi__delta--up">+12.4% 지난주 대비</p>
        </article>
        <article class="app-kpi">
          <p class="app-kpi__label">AI 생성 횟수</p>
          <p class="app-kpi__value">127</p>
          <p class="app-kpi__delta app-kpi__delta--up">+8 이번 주</p>
        </article>
        <article class="app-kpi">
          <p class="app-kpi__label">배포 완료</p>
          <p class="app-kpi__value">23</p>
          <p class="app-kpi__delta app-kpi__delta--neutral">변동 없음</p>
        </article>
        <article class="app-kpi">
          <p class="app-kpi__label">스토리지</p>
          <p class="app-kpi__value">2.1 GB</p>
          <p class="app-kpi__delta app-kpi__delta--down">71% 사용 중</p>
        </article>
      </section>

      <div class="app-grid-2">
        <section class="app-card app-card--stretch" aria-labelledby="chart-title">
          <div class="app-card__head">
            <h2 id="chart-title" class="app-card__title">트래픽 추이</h2>
            <div class="app-seg" role="tablist">
              <button type="button" class="app-seg__btn app-seg__btn--on">7일</button>
              <button type="button" class="app-seg__btn">30일</button>
              <button type="button" class="app-seg__btn">분기</button>
            </div>
          </div>
          <div class="app-chart" role="img" aria-label="지난 7일 방문 추이 막대 그래프">
            <div class="app-chart__bar-wrap"><div class="app-chart__bar" style="height:42%"></div><span class="app-chart__lbl">월</span></div>
            <div class="app-chart__bar-wrap"><div class="app-chart__bar" style="height:58%"></div><span class="app-chart__lbl">화</span></div>
            <div class="app-chart__bar-wrap"><div class="app-chart__bar" style="height:35%"></div><span class="app-chart__lbl">수</span></div>
            <div class="app-chart__bar-wrap"><div class="app-chart__bar" style="height:72%"></div><span class="app-chart__lbl">목</span></div>
            <div class="app-chart__bar-wrap"><div class="app-chart__bar" style="height:64%"></div><span class="app-chart__lbl">금</span></div>
            <div class="app-chart__bar-wrap"><div class="app-chart__bar" style="height:88%"></div><span class="app-chart__lbl">토</span></div>
            <div class="app-chart__bar-wrap"><div class="app-chart__bar" style="height:55%"></div><span class="app-chart__lbl">일</span></div>
          </div>
        </section>

        <div class="app-stack">
          <section class="app-card" aria-labelledby="activity-title">
            <h2 id="activity-title" class="app-card__title">최근 활동</h2>
            <ul class="app-timeline">
              <li class="app-timeline__item">
                <span class="app-timeline__dot app-timeline__dot--violet"></span>
                <div>
                  <p class="app-timeline__text"><strong>카페 랜딩</strong> 배포됨</p>
                  <p class="app-timeline__meta">32분 전 · 김OO</p>
                </div>
              </li>
              <li class="app-timeline__item">
                <span class="app-timeline__dot app-timeline__dot--slate"></span>
                <div>
                  <p class="app-timeline__text"><strong>SaaS 소개</strong> 프롬프트 수정</p>
                  <p class="app-timeline__meta">2시간 전</p>
                </div>
              </li>
              <li class="app-timeline__item">
                <span class="app-timeline__dot app-timeline__dot--green"></span>
                <div>
                  <p class="app-timeline__text">팀 초대 수락</p>
                  <p class="app-timeline__meta">어제</p>
                </div>
              </li>
            </ul>
          </section>
          <section class="app-card" aria-labelledby="quick-title">
            <h2 id="quick-title" class="app-card__title">빠른 작업</h2>
            <div class="app-quick">
              <button type="button" class="app-quick__btn">프롬프트로 생성</button>
              <button type="button" class="app-quick__btn">템플릿 복제</button>
              <button type="button" class="app-quick__btn">도메인 연결</button>
              <button type="button" class="app-quick__btn">API 키 관리</button>
            </div>
          </section>
        </div>
      </div>

      <section class="app-card app-card--table" aria-labelledby="table-title">
        <div class="app-card__head">
          <h2 id="table-title" class="app-card__title">모든 페이지</h2>
          <button type="button" class="app-btn app-btn--ghost app-btn--sm">필터</button>
        </div>
        <div class="app-table-wrap">
          <table class="app-table">
            <thead>
              <tr>
                <th>이름</th>
                <th>상태</th>
                <th>최종 수정</th>
                <th class="app-table__right">작업</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span class="app-table__strong">브랜드 랜딩 2026</span></td>
                <td><span class="app-pill app-pill--live">배포됨</span></td>
                <td class="app-table__muted">오늘 09:12</td>
                <td class="app-table__right"><button type="button" class="app-link-btn">열기</button></td>
              </tr>
              <tr>
                <td><span class="app-table__strong">이벤트 프로모션</span></td>
                <td><span class="app-pill app-pill--draft">초안</span></td>
                <td class="app-table__muted">어제</td>
                <td class="app-table__right"><button type="button" class="app-link-btn">편집</button></td>
              </tr>
              <tr>
                <td><span class="app-table__strong">채용 페이지</span></td>
                <td><span class="app-pill app-pill--review">검수</span></td>
                <td class="app-table__muted">3일 전</td>
                <td class="app-table__right"><button type="button" class="app-link-btn">편집</button></td>
              </tr>
              <tr>
                <td><span class="app-table__strong">뉴스레터 구독</span></td>
                <td><span class="app-pill app-pill--live">배포됨</span></td>
                <td class="app-table__muted">1주 전</td>
                <td class="app-table__right"><button type="button" class="app-link-btn">열기</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <div class="app-dashboard">
        <div class="app-card">
          <h2 class="app-card__title">즐겨찾는 프로젝트</h2>
          <p class="app-card__desc">자주 열어보는 페이지를 고정해 두었습니다.</p>
          <ul class="app-card__list">
            <li>샘플 랜딩 A <span class="app-tag">초안</span></li>
            <li>샘플 랜딩 B <span class="app-tag app-tag--ok">배포됨</span></li>
            <li>포트폴리오 v2 <span class="app-tag app-tag--review">검수</span></li>
          </ul>
        </div>
        <div class="app-card">
          <h2 class="app-card__title">알림</h2>
          <ul class="app-notify">
            <li><span class="app-notify__icon">!</span> SSL 인증서 30일 후 갱신</li>
            <li><span class="app-notify__icon app-notify__icon--info">i</span> Pro 플랜 한도 80% 사용</li>
          </ul>
        </div>
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
  { slug: "cafe-landing-page", status: "pre", kind: "landing", subtitle: "배포되지 않음", updated: "Mar 5 04:25" },
  { slug: "portfolio-2024", status: "deploying", kind: "portfolio", subtitle: "프로덕션 배포 진행 중", updated: "Jun 23 14:31" },
  { slug: "saas-intro-site", status: "done", kind: "business", subtitle: "https://intro.example.com", updated: "Apr 11 18:30" },
  { slug: "event-spring-sale", status: "pre", kind: "landing", subtitle: "배포되지 않음", updated: "Feb 2 09:15" },
  { slug: "designer-showcase", status: "done", kind: "portfolio", subtitle: "https://folio.example.com", updated: "Jan 19 22:08" },
  { slug: "corp-pr-page", status: "deploying", kind: "business", subtitle: "스테이징 검증 중", updated: "Mar 28 11:42" },
  { slug: "newsletter-signup", status: "done", kind: "landing", subtitle: "https://nl.example.com", updated: "Dec 8 16:55" },
  { slug: "photo-studio-booking", status: "pre", kind: "portfolio", subtitle: "초안만 존재", updated: "Nov 30 07:20" },
  { slug: "recruit-2026", status: "deploying", kind: "landing", subtitle: "DNS 전파 대기", updated: "Apr 1 13:07" },
];

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const STATUS_BADGE: Record<DemoProjectStatus, { className: string; label: string }> = {
  pre: { className: "proj-badge proj-badge--status-pre", label: "배포 전" },
  deploying: { className: "proj-badge proj-badge--status-deploying", label: "배포 중" },
  done: { className: "proj-badge proj-badge--status-done", label: "배포 완료" },
};

const KIND_BADGE: Record<DemoProjectKind, { className: string; label: string }> = {
  landing: { className: "proj-badge proj-badge--type-landing", label: "랜딩 페이지" },
  portfolio: { className: "proj-badge proj-badge--type-portfolio", label: "포트폴리오 페이지" },
  business: { className: "proj-badge proj-badge--type-business", label: "비즈니스 페이지" },
};

function renderProjectThumb(p: DemoProject, index: number): string {
  const tone = (index % 3) + 1;
  const url =
    p.slug.length > 22 ? `${escapeHtml(p.slug.slice(0, 22))}…` : escapeHtml(p.slug);
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
  return `
        <article class="proj-card">
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
        </article>`;
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

function mountLanding(): void {
  document.body.classList.remove("app-view");
  root.innerHTML = getLandingHTML(viteLogo, typescriptLogo);
  document.title = "AI Web Builder";

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
  const sub = getAppSubroute();
  const inner = sub === "projects" ? getProjectsInnerHTML() : DASHBOARD_INNER;
  root.innerHTML = getAppLayoutHTML(sub, inner);
  document.title =
    sub === "projects" ? "프로젝트 — AI Web Builder" : "대시보드 — AI Web Builder";
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
