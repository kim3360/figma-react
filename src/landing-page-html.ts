/** Devely 마케팅 랜딩 (스위프 웹형 프로그램·일정 + 핫한형 히어로·쇼케이스 레퍼런스) */
export const LANDING_PAGE_HTML = `
<div class="ld-page">
  <header class="ld-topbar">
    <div class="container ld-topbar__inner">
      <a class="ld-brand" href="#">
        <span class="ld-brand__mark" aria-hidden="true"></span>
        <span class="ld-brand__text">Devely</span>
      </a>
      <nav class="ld-nav" aria-label="페이지 섹션">
        <a href="#program">프로그램</a>
        <a href="#concerns">고민</a>
        <a href="#audience">추천</a>
        <a href="#capabilities">기능</a>
        <a href="#benefit">혜택</a>
        <a href="#process">진행 과정</a>
        <a href="#showcase">결과물</a>
        <a href="#reviews">후기</a>
        <a href="#pricing">요금</a>
        <a href="#faq">FAQ</a>
      </nav>
      <div class="ld-topbar__actions">
        <button class="btn btn-ghost ld-topbar__ghost" type="button">도입 문의</button>
        <button class="btn btn-primary btn-github" type="button" id="btnLogin">무료로 시작</button>
      </div>
    </div>
  </header>

  <section class="ld-hero" aria-label="메인 히어로">
    <div class="ld-hero__bg" aria-hidden="true"></div>
    <div class="ld-hero__ribbon" aria-hidden="true">
      <div class="ld-silk ld-silk--hero">
        <span class="ld-silk__fold ld-silk__fold--a"></span>
        <span class="ld-silk__fold ld-silk__fold--b"></span>
        <span class="ld-silk__fold ld-silk__fold--c"></span>
        <span class="ld-silk__glow"></span>
      </div>
    </div>
    <div class="container ld-hero__grid">
      <div class="ld-hero__copy">
        <p class="ld-hero__kicker">AI 웹 제작 · 프롬프트부터 배포까지</p>
        <h1 class="ld-hero__title">
          <span class="ld-hero__line">기획서 없이도 괜찮아요,</span>
          <span class="ld-hero__line ld-hero__line--accent"
            ><span class="ld-hero__grad">말로 설명하면 사이트가 완성</span>됩니다</span
          >
        </h1>
        <p class="ld-hero__lead">
          디자인·카피·레이아웃을 AI가 한 번에 제안하고, 에이전트와 대화하며 계속 다듬을 수 있습니다.
          혼자 붙잡고 있던 랜딩·포트폴리오를 <strong>실제 URL까지</strong> 이어 보세요.
        </p>

        <form class="ld-prompt" id="promptForm">
          <div class="ld-prompt__field">
            <label class="ld-prompt__label" for="promptInput">무엇을 만들까요?</label>
            <input
              id="promptInput"
              name="prompt"
              type="text"
              placeholder="예: B2B SaaS 랜딩 · 다크모드 · 무료 체험 CTA 강조"
              autocomplete="off"
            />
          </div>
          <button class="btn btn-primary ld-prompt__submit" type="submit">
            <span class="ld-prompt__spark" aria-hidden="true"></span>
            AI로 생성하기
          </button>
        </form>
        <p class="ld-status status" id="status" aria-live="polite"></p>

        <div class="ld-hero__chips" aria-label="핵심 가치">
          <span class="ld-chip"><strong>에이전트</strong> 대화형 수정</span>
          <span class="ld-chip"><strong>ZIP·GitHub</strong> 가져오기</span>
          <span class="ld-chip"><strong>빌드·배포</strong> 한 흐름</span>
        </div>
      </div>

      <div class="ld-hero__visual" aria-hidden="true">
        <div class="ld-mock">
          <div class="ld-mock__chrome">
            <span class="ld-mock__dots"><i></i><i></i><i></i></span>
            <span class="ld-mock__url">preview.devely.app</span>
          </div>
          <div class="ld-mock__body">
            <aside class="ld-mock__side">
              <div class="ld-mock__thumb"></div>
              <div class="ld-mock__thumb"></div>
              <div class="ld-mock__pillrow">
                <span class="on">랜딩</span><span>블로그</span>
              </div>
            </aside>
            <div class="ld-mock__main">
              <div class="ld-mock__hero"></div>
              <div class="ld-mock__row"></div>
              <div class="ld-mock__row ld-mock__row--short"></div>
              <div class="ld-mock__cta">
                <span></span><span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="ld-vision" aria-labelledby="ldVisionHeading">
    <div class="ld-vision__bg" aria-hidden="true"></div>
    <div class="ld-vision__ribbon" aria-hidden="true">
      <div class="ld-silk ld-silk--vision">
        <span class="ld-silk__fold ld-silk__fold--a"></span>
        <span class="ld-silk__fold ld-silk__fold--b"></span>
        <span class="ld-silk__fold ld-silk__fold--c"></span>
        <span class="ld-silk__glow"></span>
      </div>
    </div>
    <div class="container ld-vision__inner">
      <p class="ld-vision__kicker">이제는 결과물로 증명할 시간입니다</p>
      <p class="ld-vision__accent">걱정하지 마세요.</p>
      <h2 id="ldVisionHeading" class="ld-vision__title">
        말로 설명한 만큼,<br />
        <span class="ld-vision__title-strong">웹이 따라옵니다</span>
      </h2>
      <p class="ld-vision__lead">
        AI 시대에 영업·마케팅만큼 중요한 건 <strong>첫인상을 만드는 웹 경험</strong>입니다. Devely는 그 첫 화면을 팀이 같은 속도로 만들 수 있게 돕습니다.
      </p>
    </div>
  </section>

  <section id="concerns" class="ld-section ld-concerns">
    <div class="container">
      <p class="ld-section__eyebrow">이런 고민 없으신가요?</p>
      <h2 class="ld-section__title">혼자 만들기엔 막막한 순간들</h2>
      <div class="ld-concern-grid">
        <article class="ld-concern">
          <h3 class="ld-concern__q">강의만 듣다가… 막상 랜딩을 만들려니 어디서부터 할지 모르겠어요</h3>
          <p class="ld-concern__a">프롬프트 한 줄이면 섹션 구조와 톤이 잡히고, 수정은 대화로 이어갑니다.</p>
        </article>
        <article class="ld-concern">
          <h3 class="ld-concern__q">디자인·개발이 따로 노는 팀… 결과물 하나로 묶기가 어려워요</h3>
          <p class="ld-concern__a">같은 워크스페이스에서 미리보기·코드·파이프라인까지 한 화면에 둡니다.</p>
        </article>
        <article class="ld-concern">
          <h3 class="ld-concern__q">포트폴리오에 올릴 만한 <strong>완성 URL</strong>이 없어요</h3>
          <p class="ld-concern__a">배포까지 연결하는 흐름을 데모로 경험하고, 실제 제품에 맞게 확장할 수 있습니다.</p>
        </article>
      </div>

      <div class="ld-concern-more">
        <p class="ld-concern-more__lead">
          외주 비용·일정 부담 없이 <strong>첫 버전</strong>을 빠르게 보고 싶은 분, 사내 PoC·해커톤·취업 포트폴리오까지
          <strong>한 흐름</strong>으로 정리하고 싶은 분께 특히 잘 맞습니다.
        </p>
        <ul class="ld-concern-more__list">
          <li>스타트업 마케터·PM — 랜딩 카피·구조를 반복 실험</li>
          <li>프론트엔드·디자이너 — 시안과 코드 미리보기를 바로 맞춤</li>
          <li>1인 창업·프리랜서 — 도메인 연결 전까지 데모로 검증</li>
        </ul>
      </div>
    </div>
  </section>

  <section id="audience" class="ld-section ld-audience">
    <div class="container">
      <p class="ld-section__eyebrow">이런 분들에게</p>
      <h2 class="ld-section__title">직군별로 이렇게 씁니다</h2>
      <p class="ld-audience__intro">
        팀 구성이 달라도 같은 워크스페이스에서 역할만 나누면 됩니다. 아래는 대표적인 사용 시나리오입니다.
      </p>
      <div class="ld-audience__grid">
        <article class="ld-audience-card">
          <h3 class="ld-audience-card__role">기획 · PM</h3>
          <p class="ld-audience-card__desc">
            IA 없이도 섹션 순서를 대화로 바꾸고, CTA 문구·가격 표현을 A/B 느낌으로 여러 번 뽑아 비교합니다.
          </p>
          <ul class="ld-audience-card__bullets">
            <li>요구사항을 프롬프트로 공유</li>
            <li>리뷰 코멘트를 에이전트에 그대로 전달</li>
          </ul>
        </article>
        <article class="ld-audience-card">
          <h3 class="ld-audience-card__role">UI/UX · 브랜드</h3>
          <p class="ld-audience-card__desc">
            랜딩 전용 테마(SaaS/로컬 등)로 톤을 맞추고, 미리보기에서 색·타이포 방향을 빠르게 맞춥니다.
          </p>
          <ul class="ld-audience-card__bullets">
            <li>세부 랜딩 테마 선택·미리보기</li>
            <li>카드·히어로 레이아웃 반복 시도</li>
          </ul>
        </article>
        <article class="ld-audience-card">
          <h3 class="ld-audience-card__role">개발</h3>
          <p class="ld-audience-card__desc">
            Code 탭에서 폴더 구조를 보고, GitHub·ZIP으로 기존 레포를 끌어온 뒤 파이프라인 로그로 빌드 상태를 확인합니다.
          </p>
          <ul class="ld-audience-card__bullets">
            <li>에이전트와 병행해 수동 수정도 가능(제품 로드맵)</li>
            <li>배포 실패 시 로그 기반으로 재시도</li>
          </ul>
        </article>
        <article class="ld-audience-card">
          <h3 class="ld-audience-card__role">취준 · 부트캠프</h3>
          <p class="ld-audience-card__desc">
            포트폴리오용 프로젝트 카드와 설명 문구를 정리하고, 배포 URL을 한 줄로 남깁니다.
          </p>
          <ul class="ld-audience-card__bullets">
            <li>템플릿별로 다른 스토리 연습</li>
            <li>기한 맞춰 데모 URL 제출</li>
          </ul>
        </article>
      </div>
    </div>
  </section>

  <section id="program" class="ld-section ld-program">
    <div class="container">
      <div class="ld-program__intro">
        <p class="ld-section__eyebrow">Devely란?</p>
        <h2 class="ld-section__title">아이디어부터 출시까지, AI와 함께하는 웹 제작</h2>
        <p class="ld-program__lede">
          짧은 주기로 초안을 만들고 검수·배포까지 잇는 도구입니다. 팀 단위 워크스페이스와 에이전트 대화를 기본으로 합니다.
        </p>
      </div>
      <div class="ld-program__tiles">
        <article class="ld-tile">
          <span class="ld-tile__tag">Launch</span>
          <h3 class="ld-tile__title">빠른 첫 화면</h3>
          <p class="ld-tile__desc">히어로·기능·후기·CTA까지 한 번에 구성해 바로 미리보기합니다.</p>
        </article>
        <article class="ld-tile">
          <span class="ld-tile__tag">Online</span>
          <h3 class="ld-tile__title">브라우저에서 끝까지</h3>
          <p class="ld-tile__desc">별도 툴 설치 없이 생성·수정·검수를 같은 탭에서 처리합니다.</p>
        </article>
        <article class="ld-tile">
          <span class="ld-tile__tag">Flow</span>
          <h3 class="ld-tile__title">가져오기 → 빌드</h3>
          <p class="ld-tile__desc">ZIP 업로드와 GitHub 연결 UI로 기존 소스도 워크스페이스로 끌어올 수 있습니다.</p>
        </article>
        <article class="ld-tile">
          <span class="ld-tile__tag">Portfolio</span>
          <h3 class="ld-tile__title">보여줄 결과물</h3>
          <p class="ld-tile__desc">프로젝트 카드·라이브 URL·배포 상태를 한눈에 정리합니다.</p>
        </article>
      </div>
      <div class="ld-program__note">
        <p>
          <strong>워크플로 예시:</strong> 새 프로젝트 생성 → 템플릿(랜딩·포트폴리오 등) 선택 → 세부 테마 지정 → 에이전트에서 문구·섹션 조정
          → 미리보기 확정 → (연동 시) 저장소 푸시 후 파이프라인 → 라이브 URL 연결. 데모 앱에서는 일부 단계가 알림으로 안내됩니다.
        </p>
      </div>
    </div>
  </section>

  <section id="capabilities" class="ld-section ld-capabilities">
    <div class="container">
      <p class="ld-section__eyebrow">제공 기능</p>
      <h2 class="ld-section__title">한 플랫폼에서 다루는 범위</h2>
      <p class="ld-capabilities__intro">
        생성만이 아니라 <strong>가져오기·검토·배포</strong>까지 같은 내비게이션으로 묶었습니다. 실제 권한·쿼터는 플랜에 따라 달라질 수 있습니다.
      </p>
      <div class="ld-cap-grid">
        <div class="ld-cap-item">
          <span class="ld-cap-item__icon" aria-hidden="true">◇</span>
          <h3 class="ld-cap-item__title">프로젝트 &amp; 템플릿</h3>
          <p class="ld-cap-item__desc">랜딩·포트폴리오·비즈니스·블로그 등 템플릿과 빈 프로젝트로 시작합니다.</p>
        </div>
        <div class="ld-cap-item">
          <span class="ld-cap-item__icon" aria-hidden="true">◇</span>
          <h3 class="ld-cap-item__title">에이전트 워크스페이스</h3>
          <p class="ld-cap-item__desc">채팅으로 수정 요청을 쌓고, 미리보기와 나란히 확인합니다.</p>
        </div>
        <div class="ld-cap-item">
          <span class="ld-cap-item__icon" aria-hidden="true">◇</span>
          <h3 class="ld-cap-item__title">Code 뷰</h3>
          <p class="ld-cap-item__desc">폴더 트리와 파일 목록으로 구조를 빠르게 파악합니다.</p>
        </div>
        <div class="ld-cap-item">
          <span class="ld-cap-item__icon" aria-hidden="true">◇</span>
          <h3 class="ld-cap-item__title">파이프라인</h3>
          <p class="ld-cap-item__desc">빌드·배포 단계를 로그 형태로 보여 줍니다.</p>
        </div>
        <div class="ld-cap-item">
          <span class="ld-cap-item__icon" aria-hidden="true">◇</span>
          <h3 class="ld-cap-item__title">ZIP 업로드</h3>
          <p class="ld-cap-item__desc">정적 자산을 올려 구조 분석·미리보기로 이어지는 흐름을 지원합니다.</p>
        </div>
        <div class="ld-cap-item">
          <span class="ld-cap-item__icon" aria-hidden="true">◇</span>
          <h3 class="ld-cap-item__title">GitHub 연동 UI</h3>
          <p class="ld-cap-item__desc">저장소 URL·브랜치·경로를 지정해 가져오기 단계까지 안내합니다.</p>
        </div>
      </div>
    </div>
  </section>

  <section id="benefit" class="ld-section ld-stats" aria-label="지표">
    <div class="container">
      <p class="ld-stats__headline">숫자로 보는 목표감</p>
      <p class="ld-stats__sub">
        아래 수치는 <strong>제품 도입 시 설정 가능한 목표 예시</strong>입니다. 팀 규모와 마일스톤에 맞게 조정하세요.
      </p>
    </div>
    <div class="container ld-stats__inner">
      <div class="ld-stat">
        <span class="ld-stat__num">6주</span>
        <span class="ld-stat__unit">이내 1차 런칭 목표(팀 기준 예시)</span>
      </div>
      <div class="ld-stat">
        <span class="ld-stat__num">100%</span>
        <span class="ld-stat__unit">온라인 워크스페이스</span>
      </div>
      <div class="ld-stat">
        <span class="ld-stat__num">3 in 1</span>
        <span class="ld-stat__unit">미리보기 · 코드 · 파이프라인</span>
      </div>
      <div class="ld-stat">
        <span class="ld-stat__num">∞</span>
        <span class="ld-stat__unit">대화 기반 반복 수정</span>
      </div>
    </div>
  </section>

  <section id="process" class="ld-section ld-process">
    <div class="ld-process__mesh" aria-hidden="true"></div>
    <div class="ld-process__texture" aria-hidden="true"></div>
    <div class="container ld-process__container">
      <p class="ld-section__eyebrow ld-process__eyebrow">프로그램 진행 과정</p>
      <h2 class="ld-section__title">이렇게 이어집니다</h2>
      <ol class="ld-steps">
        <li class="ld-step">
          <span class="ld-step__glass ld-step__glass--01" aria-hidden="true"></span>
          <span class="ld-step__n">01</span>
          <h3 class="ld-step__title">프롬프트 · 가져오기</h3>
          <p class="ld-step__desc">새 프로젝트 생성 또는 ZIP·GitHub로 소스를 불러옵니다.</p>
        </li>
        <li class="ld-step">
          <span class="ld-step__glass ld-step__glass--02" aria-hidden="true"></span>
          <span class="ld-step__n">02</span>
          <h3 class="ld-step__title">AI 에이전트와 다듬기</h3>
          <p class="ld-step__desc">브랜드 톤·섹션 순서·문구를 대화로 조정합니다.</p>
        </li>
        <li class="ld-step">
          <span class="ld-step__glass ld-step__glass--03" aria-hidden="true"></span>
          <span class="ld-step__n">03</span>
          <h3 class="ld-step__title">코드 · 구조 확인</h3>
          <p class="ld-step__desc">폴더 트리와 파일을 브라우저에서 확인합니다.</p>
        </li>
        <li class="ld-step">
          <span class="ld-step__glass ld-step__glass--04" aria-hidden="true"></span>
          <span class="ld-step__n">04</span>
          <h3 class="ld-step__title">빌드 · 파이프라인</h3>
          <p class="ld-step__desc">CI 로그 형태로 진행 상황을 추적합니다.</p>
        </li>
        <li class="ld-step">
          <span class="ld-step__glass ld-step__glass--05" aria-hidden="true"></span>
          <span class="ld-step__n">05</span>
          <h3 class="ld-step__title">배포 · URL</h3>
          <p class="ld-step__desc">라이브 URL을 프로젝트 카드에 연결합니다.</p>
        </li>
        <li class="ld-step">
          <span class="ld-step__glass ld-step__glass--06" aria-hidden="true"></span>
          <span class="ld-step__n">06</span>
          <h3 class="ld-step__title">유지보수 · 다음 스프린트</h3>
          <p class="ld-step__desc">추가 페이지·실험을 같은 워크스페이스에서 이어갑니다.</p>
        </li>
      </ol>
    </div>
  </section>

  <section id="showcase" class="ld-section ld-showcase">
    <div class="container">
      <div class="ld-showcase__head">
        <div>
          <p class="ld-section__eyebrow">만들 수 있는 결과물</p>
          <h2 class="ld-section__title">다양한 웹 서비스 유형</h2>
          <p class="ld-showcase__sub">아래는 스타일 레퍼런스용 목업입니다. 실제 생성물은 프롬프트와 템플릿에 따라 달라집니다.</p>
        </div>
        <a class="ld-showcase__link" href="#pricing">요금 보러가기 →</a>
      </div>
      <div class="ld-showcase__grid">
        <article class="ld-case ld-case--a"><span class="ld-case__label">SaaS 랜딩</span></article>
        <article class="ld-case ld-case--b"><span class="ld-case__label">포트폴리오</span></article>
        <article class="ld-case ld-case--c"><span class="ld-case__label">로컬 비즈니스</span></article>
        <article class="ld-case ld-case--d"><span class="ld-case__label">블로그 · 문서</span></article>
        <article class="ld-case ld-case--e"><span class="ld-case__label">대시보드형</span></article>
        <article class="ld-case ld-case--f"><span class="ld-case__label">이벤트 페이지</span></article>
      </div>
      <div class="ld-showcase__extra">
        <div class="ld-showcase__col">
          <h3 class="ld-showcase__h3">템플릿으로 시작하면</h3>
          <p class="ld-showcase__p">
            카페·스튜디오·SaaS 등 <strong>업종별 뼈대</strong>가 잡혀 있어 첫 프롬프트 부담이 줄어듭니다. 이후에는 섹션 추가·카피 교체만 반복하면 됩니다.
          </p>
        </div>
        <div class="ld-showcase__col">
          <h3 class="ld-showcase__h3">브랜드 톤 맞추기</h3>
          <p class="ld-showcase__p">
            다크/라이트, 미니멀/감성 등 키워드를 프롬프트에 섞으면 레이아웃 밀도와 여백 감각이 달라집니다. 에이전트에
            “톤만 살짝 더 딱딱하게”처럼 요청해 미세 조정할 수 있습니다.
          </p>
        </div>
        <div class="ld-showcase__col">
          <h3 class="ld-showcase__h3">배포 후에도</h3>
          <p class="ld-showcase__p">
            같은 프로젝트에서 버전·파이프라인 상태를 보고, 다음 스프린트에 맞춰 페이지를 덧붙이는 흐름을 가정했습니다.
          </p>
        </div>
      </div>
    </div>
  </section>

  <section id="reviews" class="ld-section ld-reviews">
    <div class="container">
      <p class="ld-section__eyebrow">이용 후기</p>
      <h2 class="ld-section__title">팀에서 남긴 한 줄 평가</h2>
      <p class="ld-reviews__disclaimer">아래 인용은 <strong>UI 데모용 가상 사례</strong>입니다.</p>
      <div class="ld-reviews__grid">
        <blockquote class="ld-review">
          <p class="ld-review__text">“기획서 없이 첫 랜딩 시안을 공유할 수 있어서 주간 회의가 빨라졌어요.”</p>
          <footer class="ld-review__meta">스타트업 PM · 김○○</footer>
        </blockquote>
        <blockquote class="ld-review">
          <p class="ld-review__text">“GitHub만 넣으면 파이프라인까지 한 화면에 있다는 게 설득 포인트였습니다.”</p>
          <footer class="ld-review__meta">프론트엔드 · 이○○</footer>
        </blockquote>
        <blockquote class="ld-review">
          <p class="ld-review__text">“에이전트에 문구만 던져도 섹션이 정리돼서 카피 실험이 수월했어요.”</p>
          <footer class="ld-review__meta">마케터 · 박○○</footer>
        </blockquote>
      </div>
    </div>
  </section>

  <section class="ld-section ld-mid-cta" aria-label="시작 유도">
    <div class="container">
      <div class="ld-mid-cta__inner">
        <div class="ld-mid-cta__copy">
          <h2 class="ld-mid-cta__title">지금 바로 워크스페이스에 들어가 보세요</h2>
          <p class="ld-mid-cta__lead">
            데모에서는 대시보드·프로젝트 목록·에이전트 화면까지 연결해 두었습니다. 로그인 없이 해시만으로 이동해 볼 수 있어요.
          </p>
        </div>
        <button class="btn btn-primary ld-mid-cta__btn" type="button" id="btnLoginMid">무료로 시작하기</button>
      </div>
    </div>
  </section>

  <section id="pricing" class="ld-section ld-pricing-wrap">
    <div class="container">
      <p class="ld-section__eyebrow">요금 안내</p>
      <h2 class="ld-section__title">팀 규모에 맞는 플랜</h2>
      <div class="pricing-shell" role="region" aria-label="요금 비교">
        <div class="pricing-top">
          <div class="pricing-intro">
            <div class="pricing-title">한눈에<br />비교해 보세요</div>
            <div class="pricing-sub">필요한 기능만 골라 시작할 수 있어요.</div>
          </div>
          <div class="pricing-plans" aria-label="플랜">
            <article class="plan-card">
              <div class="plan-name">Starter</div>
              <div class="plan-price">
                <span class="plan-amount">0원</span>
                <span class="plan-unit">/월</span>
              </div>
              <div class="plan-desc">개인·학습용. 기본 생성 크레딧과 공개 미리보기.</div>
              <ul class="plan-bullets">
                <li>프로젝트 3개</li>
                <li>월 생성 크레딧 소량</li>
              </ul>
              <button class="plan-button" type="button">Starter 시작</button>
            </article>
            <article class="plan-card plan-card--featured">
              <div class="plan-name">Pro</div>
              <div class="plan-price">
                <span class="plan-amount">33,000원</span>
                <span class="plan-unit">/월</span>
              </div>
              <div class="plan-desc">소규모 팀. 비공개 프로젝트·배포 파이프라인·우선 큐.</div>
              <ul class="plan-bullets">
                <li>무제한 프로젝트</li>
                <li>GitHub · ZIP 가져오기</li>
                <li>팀 워크스페이스</li>
              </ul>
              <button class="plan-button plan-button--featured" type="button">Pro 선택</button>
            </article>
            <article class="plan-card">
              <div class="plan-name">Enterprise</div>
              <div class="plan-price">
                <span class="plan-amount">별도</span>
                <span class="plan-unit">문의</span>
              </div>
              <div class="plan-desc">보안·SSO·전용 환경이 필요한 조직을 위한 맞춤 계약.</div>
              <ul class="plan-bullets">
                <li>SLA · 감사 로그</li>
                <li>온프레미스 옵션</li>
                <li>전담 CSM</li>
              </ul>
              <button class="plan-button" type="button">문의하기</button>
            </article>
          </div>
        </div>
        <div class="pricing-table" aria-label="기능 비교">
          <div class="pricing-table-grid pricing-table-grid--head">
            <div class="pricing-th pricing-td--label"></div>
            <div class="pricing-th">Starter</div>
            <div class="pricing-th">Pro</div>
            <div class="pricing-th">Enterprise</div>
          </div>
          <div class="pricing-table-grid">
            <div class="pricing-td pricing-td--label">에이전트 대화</div>
            <div class="pricing-td pricing-td--center">✓</div>
            <div class="pricing-td pricing-td--center">✓</div>
            <div class="pricing-td pricing-td--center">✓</div>
          </div>
          <div class="pricing-table-grid">
            <div class="pricing-td pricing-td--label">배포 파이프라인</div>
            <div class="pricing-td pricing-td--center">제한</div>
            <div class="pricing-td pricing-td--center">✓</div>
            <div class="pricing-td pricing-td--center">✓</div>
          </div>
          <div class="pricing-table-grid">
            <div class="pricing-td pricing-td--label">비공개 프로젝트</div>
            <div class="pricing-td pricing-td--center">—</div>
            <div class="pricing-td pricing-td--center">✓</div>
            <div class="pricing-td pricing-td--center">✓</div>
          </div>
          <div class="pricing-table-grid">
            <div class="pricing-td pricing-td--label">SSO · 감사</div>
            <div class="pricing-td pricing-td--center">—</div>
            <div class="pricing-td pricing-td--center">—</div>
            <div class="pricing-td pricing-td--center">✓</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section id="faq" class="ld-section ld-faq">
    <div class="container">
      <p class="ld-section__eyebrow">자주 묻는 질문</p>
      <h2 class="ld-section__title">시작 전에 궁금한 점</h2>
      <dl class="ld-faq__list">
        <div class="ld-faq__item">
          <dt class="ld-faq__q">코드를 몰라도 되나요?</dt>
          <dd class="ld-faq__a">프롬프트와 대화만으로 초안을 만들 수 있습니다. 필요하면 Code 탭에서 구조를 확인하세요.</dd>
        </div>
        <div class="ld-faq__item">
          <dt class="ld-faq__q">기존 사이트 ZIP이나 GitHub만 있어도 되나요?</dt>
          <dd class="ld-faq__a">프로젝트 목록에서 ZIP 업로드·GitHub 불러오기 흐름을 제공합니다. 실제 클론은 백엔드 연동 시 동작합니다.</dd>
        </div>
        <div class="ld-faq__item">
          <dt class="ld-faq__q">팀 단위로 쓰려면?</dt>
          <dd class="ld-faq__a">Pro 이상에서 워크스페이스와 권한을 나누는 방향으로 확장할 수 있습니다.</dd>
        </div>
        <div class="ld-faq__item">
          <dt class="ld-faq__q">생성된 페이지의 저작권은 누구에게 있나요?</dt>
          <dd class="ld-faq__a">실제 서비스 약관에 따릅니다. 일반적으로 사용자가 입력한 브랜드·문구에 대한 권리는 고객에게 귀속되도록 설계하는 것이 보통입니다.</dd>
        </div>
        <div class="ld-faq__item">
          <dt class="ld-faq__q">어떤 브라우저를 권장하나요?</dt>
          <dd class="ld-faq__a">최신 Chrome·Edge·Safari·Firefox를 권장합니다. 미리보기와 에이전트 패널이 넓을수록 편합니다.</dd>
        </div>
        <div class="ld-faq__item">
          <dt class="ld-faq__q">데이터는 어디에 저장되나요?</dt>
          <dd class="ld-faq__a">데모는 브라우저 세션·목업 데이터 중심입니다. 상용화 시 리전·암호화·백업 정책을 별도로 안내합니다.</dd>
        </div>
        <div class="ld-faq__item">
          <dt class="ld-faq__q">온보딩이나 교육 자료가 있나요?</dt>
          <dd class="ld-faq__a">가이드·샘플 프롬프트·템플릿 설명을 리소스 메뉴에서 제공하는 것을 목표로 합니다. (데모 링크는 준비 중일 수 있어요.)</dd>
        </div>
        <div class="ld-faq__item">
          <dt class="ld-faq__q">결제는 어떻게 하나요?</dt>
          <dd class="ld-faq__a">플랜별로 월 구독 또는 연 구독을 지원하는 것을 전제로 합니다. Enterprise는 견적·계약서 기반으로 진행합니다.</dd>
        </div>
      </dl>
    </div>
  </section>

  <footer class="site-footer ld-footer" aria-label="사이트 하단 정보">
    <div class="container site-footer__inner">
      <div class="site-footer__top">
        <a class="site-footer__logo" href="#">
          <span class="site-footer__logo-mark" aria-hidden="true"></span>
          <span class="site-footer__logo-text">Devely</span>
        </a>
        <div class="site-footer__quick-links" aria-label="빠른 링크">
          <a href="#program">프로그램</a>
          <a href="#audience">추천</a>
          <a href="#capabilities">기능</a>
          <a href="#reviews">후기</a>
          <a href="#pricing">요금</a>
          <a href="#faq">FAQ</a>
          <a href="#showcase">결과물</a>
        </div>
      </div>

      <div class="site-footer__grid">
        <nav class="footer-col" aria-label="제품">
          <h3 class="footer-col__title">제품</h3>
          <ul class="footer-col__list">
            <li><a href="#program">AI 생성</a></li>
            <li><a href="#">프로젝트</a></li>
            <li><a href="#showcase">템플릿·유형</a></li>
            <li><a href="#pricing">요금제</a></li>
          </ul>
        </nav>
        <nav class="footer-col" aria-label="리소스">
          <h3 class="footer-col__title">리소스</h3>
          <ul class="footer-col__list">
            <li><a href="#">가이드</a></li>
            <li><a href="#">블로그</a></li>
            <li><a href="#">업데이트</a></li>
            <li><a href="#">활용 사례</a></li>
          </ul>
        </nav>
        <nav class="footer-col" aria-label="회사">
          <h3 class="footer-col__title">회사</h3>
          <ul class="footer-col__list">
            <li><a href="#">채용</a></li>
            <li><a href="#">문의</a></li>
            <li><a href="#">보안</a></li>
            <li><a href="#">제휴</a></li>
          </ul>
        </nav>
        <nav class="footer-col" aria-label="약관">
          <h3 class="footer-col__title">약관</h3>
          <ul class="footer-col__list">
            <li><a href="#">이용약관</a></li>
            <li><a href="#">개인정보처리방침</a></li>
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
          </nav>
        </div>
      </div>

      <div class="site-footer__bottom">
        <p class="site-footer__copyright">© Devely Demo. All rights reserved.</p>
        <div class="site-footer__social site-footer__social--bottom" aria-label="소셜 미디어">
          <a href="#" aria-label="블로그"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 4h16v16H4V4zm2 2v12h12V6H6zm2 2h8v2H8V8zm0 4h8v2H8v-2zm0 4h5v2H8v-2z"/></svg></a>
          <a href="#" aria-label="YouTube"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></a>
          <a href="#" aria-label="Instagram"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></a>
        </div>
      </div>
    </div>
  </footer>
</div>
`;
