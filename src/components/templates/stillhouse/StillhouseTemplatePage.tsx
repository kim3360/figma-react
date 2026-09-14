import { useState } from 'react';
import { ArrowDown, ArrowUpRight, Menu, X } from 'lucide-react';
import './stillhouse.css';

const projects = [
  {
    number: '01',
    title: '여백의 집',
    location: '서울 · 주거 공간',
    year: '2026',
    className: 'sh-space-warm',
  },
  {
    number: '02',
    title: '오후의 서재',
    location: '경기 · 상업 공간',
    year: '2025',
    className: 'sh-space-library',
  },
  {
    number: '03',
    title: '숲을 닮은 방',
    location: '제주 · 스테이',
    year: '2025',
    className: 'sh-space-forest',
  },
] as const;

function StillhouseTemplatePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div id="stillhouse-template">
      <header className="sh-header">
        <a
          className="sh-logo"
          href="#top"
          aria-label="STILLHOUSE 홈"
          onClick={closeMenu}
        >
          STILL<span>HOUSE</span>
          <i>®</i>
        </a>
        <nav
          className={menuOpen ? 'sh-nav sh-nav-open' : 'sh-nav'}
          aria-label="주 메뉴"
        >
          <a href="#work" onClick={closeMenu}>
            PROJECTS
          </a>
          <a href="#about" onClick={closeMenu}>
            STUDIO
          </a>
          <a href="#process" onClick={closeMenu}>
            APPROACH
          </a>
          <a href="#contact" className="sh-nav-contact" onClick={closeMenu}>
            프로젝트 문의 <ArrowUpRight size={16} />
          </a>
        </nav>
        <button
          type="button"
          className="sh-menu"
          aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>
      </header>
      <main id="top">
        <section className="sh-hero" aria-labelledby="sh-hero-title">
          <div className="sh-hero-room" aria-hidden="true">
            <div className="sh-wall" />
            <div className="sh-floor" />
            <div className="sh-window">
              <div className="sh-window-landscape" />
            </div>
            <div className="sh-curtain" />
            <div className="sh-sofa">
              <span />
              <span />
            </div>
            <div className="sh-table" />
            <div className="sh-vase" />
            <div className="sh-lamp" />
          </div>
          <div className="sh-hero-shade" />
          <div className="sh-hero-copy">
            <p>SPACES TO SLOW DOWN · SEOUL, KOREA</p>
            <h1 id="sh-hero-title">
              공간은
              <br />
              <em>삶의 태도</em>가 된다.
            </h1>
            <span>
              우리는 머물고 싶은 순간을 설계합니다.
              <br />
              오래도록 편안한, 나다운 공간을 위해.
            </span>
            <a href="#work">
              우리의 작업 보기 <ArrowUpRight size={19} />
            </a>
          </div>
          <div className="sh-hero-footer">
            <span>01 / 03 — THE SPACE BETWEEN</span>
            <a href="#work">
              SCROLL TO EXPLORE <ArrowDown size={16} />
            </a>
            <span>© STILLHOUSE 2026</span>
          </div>
        </section>

        <section
          className="sh-intro"
          id="about"
          aria-labelledby="sh-intro-title"
        >
          <div className="sh-section-top">
            <span>01 / WHO WE ARE</span>
            <span>공간에 관한 우리의 생각</span>
          </div>
          <div className="sh-intro-grid">
            <h2 id="sh-intro-title">
              좋은 공간은
              <br />
              말없이 <em>마음을</em>
              <br />
              움직입니다.
            </h2>
            <div className="sh-intro-copy">
              <span className="sh-intro-mark">S/H.</span>
              <p>
                STILLHOUSE는 사람의 일상에 집중하는 공간 디자인 스튜디오입니다.
                빛이 머무는 시간, 손끝에 닿는 재료, 자연스럽게 이어지는
                동선까지.
              </p>
              <p>
                눈에 보이는 형태를 넘어, 그곳에서 살아갈 사람의 이야기를
                담습니다.
              </p>
              <div className="sh-intro-numbers">
                <span>
                  <b>12</b> YEARS OF PRACTICE
                </span>
                <span>
                  <b>48</b> SPACES COMPLETED
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="sh-work" id="work" aria-labelledby="sh-work-title">
          <div className="sh-section-top">
            <span>02 / SELECTED PROJECTS</span>
            <span>2025 — 2026</span>
          </div>
          <div className="sh-work-heading">
            <h2 id="sh-work-title">
              우리가 만든 <em>장소들.</em>
            </h2>
            <p>
              단순하지만 깊이 있는 공간.
              <br />
              일상에 스며드는 우리의 작업을 소개합니다.
            </p>
          </div>
          <div className="sh-project-grid">
            {projects.map((project) => (
              <article className="sh-project" key={project.number}>
                <div
                  className={`sh-project-art ${project.className}`}
                  aria-hidden="true"
                >
                  <span className="sh-space-wall" />
                  <span className="sh-space-window" />
                  <span className="sh-space-sill" />
                  <span className="sh-space-floor" />
                  <span className="sh-space-chair" />
                  <span className="sh-space-table" />
                  <span className="sh-space-vase" />
                  <span className="sh-space-shadow" />
                </div>
                <div className="sh-project-meta">
                  <span>
                    {project.number} / {project.location} / {project.year}
                  </span>
                  <ArrowUpRight size={21} />
                </div>
                <h3>{project.title}</h3>
              </article>
            ))}
          </div>
        </section>

        <section className="sh-quote" aria-label="스튜디오 철학">
          <span>“</span>
          <blockquote>
            우리가 그리는 것은
            <br />
            평면도가 아니라,
            <br />
            <em>그 안에서의 하루입니다.</em>
          </blockquote>
          <p>STILLHOUSE — SPACE WITH FEELING.</p>
        </section>

        <section
          className="sh-process"
          id="process"
          aria-labelledby="sh-process-title"
        >
          <div className="sh-section-top">
            <span>03 / OUR APPROACH</span>
            <span>천천히, 세심하게</span>
          </div>
          <div className="sh-process-head">
            <h2 id="sh-process-title">
              공간을 만드는
              <br />
              <em>우리의 방식.</em>
            </h2>
            <p>
              좋은 공간은 좋은 질문에서 시작됩니다.
              <br />
              당신의 이야기를 듣고 함께 답을 찾습니다.
            </p>
          </div>
          <div className="sh-process-steps">
            <article>
              <span>01 / LISTEN</span>
              <div className="sh-process-icon">◌</div>
              <h3>듣고, 이해하기</h3>
              <p>
                취향과 생활의 리듬, 공간에 바라는 작은 소망까지 귀 기울입니다.
              </p>
            </article>
            <article>
              <span>02 / SHAPE</span>
              <div className="sh-process-icon">▤</div>
              <h3>형태로 옮기기</h3>
              <p>빛과 재료, 비례와 동선을 하나의 이야기로 엮어냅니다.</p>
            </article>
            <article>
              <span>03 / LIVE</span>
              <div className="sh-process-icon">✳</div>
              <h3>삶으로 완성하기</h3>
              <p>아름다운 첫날보다, 오래도록 편안한 매일을 생각합니다.</p>
            </article>
          </div>
        </section>

        <section
          className="sh-contact"
          id="contact"
          aria-labelledby="sh-contact-title"
        >
          <p>04 / LET'S MAKE SPACE</p>
          <h2 id="sh-contact-title">
            새로운 공간의 시작을
            <br />
            <em>함께할까요?</em>
          </h2>
          <a href="mailto:hello@stillhouse.example?subject=STILLHOUSE%20프로젝트%20문의">
            프로젝트 이야기하기 <ArrowUpRight size={22} />
          </a>
          <span className="sh-contact-outline">S/H.</span>
        </section>
      </main>
      <footer className="sh-footer">
        <a className="sh-logo" href="#top">
          STILL<span>HOUSE</span>
          <i>®</i>
        </a>
        <span>공간의 고요한 가능성을 생각합니다.</span>
        <a href="#top">BACK TO TOP ↑</a>
        <small>© 2026 STILLHOUSE STUDIO. SEOUL.</small>
      </footer>
    </div>
  );
}

export default StillhouseTemplatePage;
