import './landing.css'
import typescriptLogo from './assets/typescript.svg'
import viteLogo from './assets/vite.svg'

const app = document.querySelector<HTMLDivElement>('#app')
if (!app) throw new Error('Missing #app element')

app.innerHTML = `
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
        <button class="btn btn-ghost" type="button">로그인</button>
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

  <footer class="footer">
    <div class="container">
      <div class="row">
        <div>
          <strong style="color:var(--text-strong);">AI Web Builder</strong>
          <div style="margin-top:6px;">프롬프트 기반 랜딩 페이지 생성 데모</div>
        </div>
        <div style="display:flex;gap:14px;align-items:center;">
          <a href="#features">기능</a>
          <a href="#how">작동 방식</a>
          <a href="#pricing">요금</a>
        </div>
      </div>
    </div>
  </footer>
`

const form = app.querySelector<HTMLFormElement>('#promptForm')
const input = app.querySelector<HTMLInputElement>('#promptInput')
const statusEl = app.querySelector<HTMLParagraphElement>('#status')

if (form && input && statusEl) {
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const prompt = input.value.trim()

    if (!prompt) {
      statusEl.textContent = '프롬프트를 입력해 주세요.'
      return
    }

    statusEl.textContent = `“${prompt}”에 맞춰 생성 중... (데모)`
    // TODO: 실제 AI API 연동 로직을 이 자리에서 연결하세요.
  })
}
