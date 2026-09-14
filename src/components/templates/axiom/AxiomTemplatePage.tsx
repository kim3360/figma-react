import { useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  ChevronDown,
  Menu,
  MoveUpRight,
  Sparkles,
  X,
} from 'lucide-react';
import './axiom.css';

const weeklyBars = [28, 39, 31, 52, 47, 62, 57, 72, 66, 82, 74, 93];
const monthlyBars = [23, 29, 41, 36, 56, 48, 64, 58, 72, 68, 86, 98];

function AxiomTemplatePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [period, setPeriod] = useState<'7일' | '30일'>('7일');
  const bars = period === '7일' ? weeklyBars : monthlyBars;

  return (
    <div id="axiom-template">
      <header className="ax-header">
        <a
          className="ax-logo"
          href="#top"
          aria-label="AXIOM 홈"
          onClick={() => setMenuOpen(false)}
        >
          <span className="ax-logo-glyph">
            a<span>✳</span>
          </span>{' '}
          axiom<span className="ax-logo-dot">.</span>
        </a>
        <nav
          className={menuOpen ? 'ax-nav ax-nav-open' : 'ax-nav'}
          aria-label="주 메뉴"
        >
          <a href="#features" onClick={() => setMenuOpen(false)}>
            기능
          </a>
          <a href="#workflow" onClick={() => setMenuOpen(false)}>
            작동 방식
          </a>
          <a href="#insights" onClick={() => setMenuOpen(false)}>
            인사이트
          </a>
          <a
            className="ax-nav-login"
            href="#start"
            onClick={() => setMenuOpen(false)}
          >
            시작하기 <ArrowUpRight size={16} />
          </a>
        </nav>
        <button
          type="button"
          className="ax-menu"
          aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      <main id="top">
        <section className="ax-hero" aria-labelledby="ax-hero-title">
          <div className="ax-glow ax-glow-left" />
          <div className="ax-glow ax-glow-right" />
          <p className="ax-announcement">
            <Sparkles size={14} /> 더 명확한 결정을 위한 새로운 기준{' '}
            <ArrowRight size={15} />
          </p>
          <h1 id="ax-hero-title">
            데이터가 답이 되는
            <br />
            <em>바로 그 순간.</em>
          </h1>
          <p className="ax-hero-subtitle">
            흩어진 숫자를 하나의 방향으로. AXIOM은 팀의 모든 데이터를 연결하고,
            <br />
            복잡한 분석을 누구나 이해할 수 있는 인사이트로 바꿉니다.
          </p>
          <div className="ax-hero-actions">
            <a className="ax-primary" href="#features">
              AXIOM 살펴보기 <ArrowUpRight size={18} />
            </a>
            <a className="ax-secondary" href="#workflow">
              어떻게 작동하나요? <ArrowRight size={17} />
            </a>
          </div>
          <div className="ax-dashboard" aria-label="AXIOM 분석 대시보드 예시">
            <aside className="ax-dash-sidebar">
              <div className="ax-dash-mini-logo">a✳</div>
              <span className="ax-dash-side-active">▦</span>
              <span>▤</span>
              <span>◴</span>
              <span>⚙</span>
            </aside>
            <div className="ax-dash-content">
              <div className="ax-dash-toolbar">
                <span>
                  Overview <ChevronDown size={13} />
                </span>
                <span>
                  MONDAY, SEP 14, 2026 <i>●</i> JS
                </span>
              </div>
              <div className="ax-dash-heading">
                <div>
                  <p>PERFORMANCE OVERVIEW</p>
                  <h2>
                    더 선명해진 오늘의 성과<span>.</span>
                  </h2>
                </div>
                <div
                  className="ax-dash-period"
                  role="group"
                  aria-label="데이터 기간 선택"
                >
                  {(['7일', '30일'] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={period === option}
                      className={period === option ? 'ax-period-active' : ''}
                      onClick={() => setPeriod(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
              <div className="ax-metric-grid">
                <div>
                  <span>
                    총 방문자 <MoveUpRight size={15} />
                  </span>
                  <strong>{period === '7일' ? '128.4K' : '542.8K'}</strong>
                  <small>↗ 24.8% 지난 기간 대비</small>
                </div>
                <div>
                  <span>
                    전환율 <MoveUpRight size={15} />
                  </span>
                  <strong>{period === '7일' ? '8.42%' : '9.16%'}</strong>
                  <small>↗ 12.6% 지난 기간 대비</small>
                </div>
                <div>
                  <span>
                    활성 사용자 <MoveUpRight size={15} />
                  </span>
                  <strong>{period === '7일' ? '32,891' : '141,206'}</strong>
                  <small>↗ 18.3% 지난 기간 대비</small>
                </div>
              </div>
              <div className="ax-chart-row">
                <div className="ax-chart-main">
                  <div className="ax-chart-title">
                    <div>
                      <span>트래픽 성장</span>
                      <strong>+32.6%</strong>
                    </div>
                    <span>
                      이번 달 성과 <ChevronDown size={12} />
                    </span>
                  </div>
                  <div className="ax-chart-bars">
                    {bars.map((height, index) => (
                      <span key={index} style={{ height: `${height}%` }} />
                    ))}
                  </div>
                  <div className="ax-chart-axis">
                    <span>MON</span>
                    <span>TUE</span>
                    <span>WED</span>
                    <span>THU</span>
                    <span>FRI</span>
                    <span>SAT</span>
                    <span>SUN</span>
                  </div>
                </div>
                <div className="ax-chart-side">
                  <span>
                    AI INSIGHT <Sparkles size={14} />
                  </span>
                  <div className="ax-insight-orb">✳</div>
                  <strong>좋은 흐름이에요!</strong>
                  <p>
                    이번 주 유입이 지난 기간보다 24.8% 증가했어요. 지금 캠페인의
                    흐름을 이어가세요.
                  </p>
                  <a href="#insights">
                    자세히 보기 <ArrowUpRight size={13} />
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="ax-hero-foot">
            <span>SCROLL TO EXPLORE ↓</span>
            <span>CLARITY IN EVERY NUMBER — © 2026</span>
          </div>
        </section>

        <section className="ax-trust" aria-label="함께하는 팀">
          <p>더 나은 결정을 내리는 팀들이 선택했습니다</p>
          <div>
            <span>⟡ orbit</span>
            <span>MONO</span>
            <span>
              velocity<span>✳</span>
            </span>
            <span>HYPERION</span>
            <span>◎ parallel</span>
          </div>
        </section>

        <section
          className="ax-features ax-section"
          id="features"
          aria-labelledby="ax-features-title"
        >
          <div className="ax-section-heading">
            <p className="ax-kicker">01 / WHY AXIOM</p>
            <h2 id="ax-features-title">
              복잡한 데이터도
              <br />
              <em>명쾌한 이야기로.</em>
            </h2>
            <p>
              수집부터 분석, 공유까지. 팀이 정말 중요한 일에 집중할 수 있도록
              모든 흐름을 매끄럽게 연결합니다.
            </p>
          </div>
          <div className="ax-bento">
            <article className="ax-bento-large">
              <div>
                <span className="ax-bento-icon">
                  <BarChart3 size={21} />
                </span>
                <p>01 / UNIFIED ANALYTICS</p>
                <h3>
                  모든 데이터가
                  <br />
                  한눈에 보이도록.
                </h3>
                <span>
                  여러 도구를 오갈 필요 없이, 중요한 지표를 한곳에서 확인하세요.
                </span>
              </div>
              <div className="ax-bento-visual" aria-hidden="true">
                <span className="ax-bento-grid" />
                <div className="ax-bento-visual-card">
                  <small>GROWTH RATE</small>
                  <strong>
                    +248<span>%</span>
                  </strong>
                  <i>↗ KEEP GROWING</i>
                </div>
                <span className="ax-bento-ray" />
              </div>
            </article>
            <article className="ax-bento-small ax-bento-purple">
              <span className="ax-bento-icon">✳</span>
              <p>02 / AI INSIGHTS</p>
              <h3>
                숫자 너머의
                <br />
                이유까지.
              </h3>
              <span>
                데이터 속 패턴을 AI가 먼저 발견하고, 다음 행동을 제안합니다.
              </span>
              <div className="ax-bento-small-art">
                INSIGHT
                <br />
                <em>FOUND.</em>
              </div>
            </article>
            <article className="ax-bento-small ax-bento-cream">
              <span className="ax-bento-icon">↗</span>
              <p>03 / SHARE TOGETHER</p>
              <h3>
                좋은 인사이트는
                <br />
                함께 볼 때 더 커져요.
              </h3>
              <span>
                팀원 누구나 같은 숫자와 맥락을 보고, 더 빠르게 결정합니다.
              </span>
              <div className="ax-avatar-stack">
                <i>J</i>
                <i>M</i>
                <i>S</i>
                <b>+8</b>
              </div>
            </article>
          </div>
        </section>

        <section
          className="ax-workflow ax-section"
          id="workflow"
          aria-labelledby="ax-workflow-title"
        >
          <p className="ax-kicker">02 / HOW IT WORKS</p>
          <div className="ax-workflow-top">
            <h2 id="ax-workflow-title">
              연결하고. 이해하고.
              <br />
              <em>앞서갑니다.</em>
            </h2>
            <p>
              시작은 놀랄 만큼 간단합니다.
              <br />
              나머지는 AXIOM이 돕겠습니다.
            </p>
          </div>
          <div className="ax-steps">
            <article>
              <span>01</span>
              <div className="ax-step-icon">⌁</div>
              <h3>데이터 연결</h3>
              <p>사용 중인 도구를 몇 번의 클릭으로 연결하세요.</p>
            </article>
            <article>
              <span>02</span>
              <div className="ax-step-icon">◉</div>
              <h3>흐름 발견</h3>
              <p>실시간 대시보드와 AI가 중요한 변화를 알려줍니다.</p>
            </article>
            <article>
              <span>03</span>
              <div className="ax-step-icon">↗</div>
              <h3>좋은 결정</h3>
              <p>근거 있는 인사이트로 다음 단계를 선택하세요.</p>
            </article>
          </div>
        </section>

        <section
          className="ax-insights ax-section"
          id="insights"
          aria-labelledby="ax-insights-title"
        >
          <div className="ax-insights-quote">
            <p className="ax-kicker">03 / BUILT FOR MOMENTUM</p>
            <h2 id="ax-insights-title">
              숫자가 많아질수록,
              <br />
              답은 <em>더 선명해져야 하니까.</em>
            </h2>
            <p>
              “AXIOM 덕분에 매주 월요일의 보고서가 아니라, 매일의 기회를 보게
              됐어요.”
            </p>
            <span>— 데이터와 함께 성장하는 어느 팀의 이야기</span>
          </div>
          <div className="ax-insights-ring" aria-hidden="true">
            <span>ONE CLEAR DIRECTION</span>
            <strong>✳</strong>
          </div>
        </section>

        <section className="ax-cta" id="start">
          <p>THE FUTURE IS CLEARER WITH AXIOM.</p>
          <h2>
            더 좋은 결정은
            <br />
            <em>여기서 시작됩니다.</em>
          </h2>
          <a href="#features">
            기능 다시 살펴보기 <ArrowUpRight size={21} />
          </a>
          <span>AXIOM / 2026 ✳</span>
        </section>
      </main>
      <footer className="ax-footer">
        <a className="ax-logo" href="#top">
          axiom<span className="ax-logo-dot">.</span>
        </a>
        <span>Clarity in every number.</span>
        <a href="#top">맨 위로 ↑</a>
        <small>© 2026 AXIOM. ALL RIGHTS RESERVED.</small>
      </footer>
    </div>
  );
}

export default AxiomTemplatePage;
