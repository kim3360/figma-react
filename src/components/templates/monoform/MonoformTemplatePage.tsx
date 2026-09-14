import { useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, Menu, X } from 'lucide-react';
import './monoform.css';

const projects = [
  {
    number: '01',
    title: 'NOON',
    category: '브랜드 아이덴티티 · 2026',
    className: 'mf-art-noon',
  },
  {
    number: '02',
    title: 'FORM / 02',
    category: '디지털 경험 · 2026',
    className: 'mf-art-form',
  },
  {
    number: '03',
    title: 'SOMA',
    category: '아트 디렉션 · 2025',
    className: 'mf-art-soma',
  },
] as const;

const services = [
  {
    number: '01',
    title: '브랜드의 언어',
    detail: '리서치부터 로고, 타이포그래피와 비주얼 시스템까지.',
  },
  {
    number: '02',
    title: '디지털의 형태',
    detail: '기억에 남는 웹사이트와 몰입감 있는 제품 경험.',
  },
  {
    number: '03',
    title: '움직이는 아이디어',
    detail: '브랜드에 생동감을 더하는 캠페인과 모션 디자인.',
  },
] as const;

function MonoformTemplatePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div id="monoform-template">
      <header className="mf-header">
        <a
          className="mf-logo"
          href="#top"
          aria-label="MONOFORM 홈"
          onClick={closeMenu}
        >
          <span className="mf-logo-mark" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
          <span>
            MONOFORM<span className="mf-logo-period">.</span>
          </span>
        </a>
        <nav
          className={menuOpen ? 'mf-nav mf-nav-open' : 'mf-nav'}
          aria-label="주 메뉴"
        >
          <a href="#work" onClick={closeMenu}>
            작업
          </a>
          <a href="#about" onClick={closeMenu}>
            소개
          </a>
          <a href="#services" onClick={closeMenu}>
            서비스
          </a>
          <a className="mf-nav-contact" href="#contact" onClick={closeMenu}>
            함께 시작하기 <ArrowUpRight size={15} strokeWidth={2} />
          </a>
        </nav>
        <button
          type="button"
          className="mf-menu-button"
          aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      <main id="top">
        <section className="mf-hero" aria-labelledby="mf-hero-title">
          <div className="mf-hero-copy">
            <p className="mf-eyebrow">
              <span className="mf-signal" /> 독립 크리에이티브 스튜디오 / 서울
            </p>
            <h1 id="mf-hero-title">
              좋은 생각은
              <br />
              <em>형태</em>가 된다<span className="mf-hero-period">.</span>
            </h1>
            <p className="mf-hero-description">
              우리는 브랜드의 본질을 발견하고,
              <br />
              사람의 마음에 오래 남는 경험을 만듭니다.
            </p>
            <a className="mf-primary-link" href="#work">
              작업 살펴보기{' '}
              <span>
                <ArrowUpRight size={19} strokeWidth={1.8} />
              </span>
            </a>
          </div>
          <div className="mf-hero-art" aria-hidden="true">
            <span className="mf-art-grid" />
            <span className="mf-art-circle mf-art-circle-back" />
            <span className="mf-art-ring" />
            <span className="mf-art-slab">
              <span>
                FORM
                <br />
                FOLLOWS
                <br />
                FEELING.
              </span>
              <b>01 / 03</b>
            </span>
            <span className="mf-art-circle mf-art-circle-front" />
            <span className="mf-art-cross">✳</span>
            <span className="mf-art-coordinate">
              37° 33′ N<br />
              126° 58′ E
            </span>
          </div>
          <a className="mf-scroll-note" href="#work">
            <ArrowDown size={15} /> 아래로 스크롤
          </a>
          <span className="mf-hero-index">© MF — 2026</span>
        </section>

        <section
          className="mf-work mf-section"
          id="work"
          aria-labelledby="mf-work-title"
        >
          <div className="mf-section-heading">
            <div>
              <p className="mf-kicker">01 / SELECTED WORK</p>
              <h2 id="mf-work-title">
                우리가 만든 <em>장면들.</em>
              </h2>
            </div>
            <p>
              관찰에서 시작해, 새로운 시선으로 완성한
              <br />
              작업들을 소개합니다.
            </p>
          </div>
          <div className="mf-project-grid">
            {projects.map((project) => (
              <article className="mf-project" key={project.number}>
                <div
                  className={`mf-project-art ${project.className}`}
                  aria-hidden="true"
                >
                  {project.number === '01' && (
                    <>
                      <span className="mf-noon-orbit" />
                      <strong>
                        n<span>o</span>on<span className="mf-noon-dot">.</span>
                      </strong>
                      <small>THE SPACE BETWEEN</small>
                    </>
                  )}
                  {project.number === '02' && (
                    <>
                      <span className="mf-form-panel" />
                      <strong>
                        FORM
                        <br />
                        /02
                      </strong>
                      <span className="mf-form-sphere" />
                    </>
                  )}
                  {project.number === '03' && (
                    <>
                      <span className="mf-soma-flower">✳</span>
                      <strong>SOMA</strong>
                      <small>OBJECTS FOR LIVING</small>
                    </>
                  )}
                </div>
                <div className="mf-project-meta">
                  <span>
                    {project.number} / {project.category}
                  </span>
                  <ArrowUpRight size={20} strokeWidth={1.5} />
                </div>
                <h3>{project.title}</h3>
              </article>
            ))}
          </div>
        </section>

        <section
          className="mf-about mf-section"
          id="about"
          aria-labelledby="mf-about-title"
        >
          <p className="mf-kicker">02 / ABOUT US</p>
          <div className="mf-about-grid">
            <h2 id="mf-about-title">
              우리는
              <br />
              <em>다르게</em> 봅니다.
            </h2>
            <div className="mf-about-copy">
              <span className="mf-about-symbol" aria-hidden="true">
                ✳
              </span>
              <p>
                MONOFORM은 전략과 감각 사이의 균형을 찾는 작은 스튜디오입니다.
                익숙한 것에 질문을 던지고, 복잡한 것을 명료하게 만들며, 오랫동안
                사랑받을 디자인을 지향합니다.
              </p>
              <span>
                좋은 디자인은 보여주는 것에서 끝나지 않습니다.
                <br />
                무언가를 느끼게 합니다.
              </span>
            </div>
          </div>
          <div className="mf-about-stats">
            <span>
              <b>28</b> 함께한 브랜드
            </span>
            <span>
              <b>12</b> 디자인 어워드
            </span>
            <span>
              <b>06</b> 창작의 해
            </span>
          </div>
        </section>

        <section
          className="mf-services mf-section"
          id="services"
          aria-labelledby="mf-services-title"
        >
          <div className="mf-section-heading">
            <div>
              <p className="mf-kicker">03 / WHAT WE DO</p>
              <h2 id="mf-services-title">
                아이디어에서 <em>경험까지.</em>
              </h2>
            </div>
          </div>
          <div className="mf-service-list">
            {services.map((service) => (
              <div className="mf-service-row" key={service.number}>
                <span>{service.number}</span>
                <h3>{service.title}</h3>
                <p>{service.detail}</p>
                <ArrowUpRight size={24} strokeWidth={1.4} />
              </div>
            ))}
          </div>
        </section>

        <section
          className="mf-contact"
          id="contact"
          aria-labelledby="mf-contact-title"
        >
          <p className="mf-kicker">04 / LET'S TALK</p>
          <h2 id="mf-contact-title">
            다음 이야기는
            <br />
            <em>함께</em> 만들어요<span>.</span>
          </h2>
          <a
            href="mailto:hello@monoform.studio?subject=MONOFORM%20프로젝트%20문의"
            className="mf-contact-link"
          >
            프로젝트 이야기하기 <ArrowUpRight size={28} strokeWidth={1.4} />
          </a>
          <div className="mf-contact-star" aria-hidden="true">
            ✳
          </div>
        </section>
      </main>

      <footer className="mf-footer">
        <a className="mf-logo" href="#top">
          MONOFORM<span className="mf-logo-period">.</span>
        </a>
        <span>서울에서 생각하고, 어디에서나 만듭니다.</span>
        <a href="#top">
          맨 위로 <ArrowRight size={14} />
        </a>
        <small>© 2026 MONOFORM STUDIO</small>
      </footer>
    </div>
  );
}

export default MonoformTemplatePage;
