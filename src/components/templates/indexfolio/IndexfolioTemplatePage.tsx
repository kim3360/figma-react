import { useState } from "react";
import { ArrowDown, ArrowUpRight, Asterisk } from "lucide-react";
import "./indexfolio.css";

const projects = [
  {
    id: "01",
    name: "FORMA",
    category: "Brand",
    type: "브랜드 전략 · 아이덴티티",
    year: "2026",
    color: "forma",
    description:
      "일상 속 작은 형태에서 출발한 리빙 브랜드. 조형적인 F 심볼과 절제된 컬러 시스템으로 사물의 본질에 집중했습니다.",
  },
  {
    id: "02",
    name: "a little pause",
    category: "Digital",
    type: "웹사이트 · 디지털 경험",
    year: "2026",
    color: "pause",
    description:
      "잠깐의 쉼을 위한 디지털 공간. 여유 있는 타이포그래피와 계절의 색으로 느린 탐색 경험을 디자인했습니다.",
  },
  {
    id: "03",
    name: "OBJECT / 07",
    category: "Editorial",
    type: "아트 디렉션 · 편집 디자인",
    year: "2025",
    color: "object",
    description:
      "평범한 물건의 새로운 시선을 기록하는 독립 매거진. 해체한 그리드와 강렬한 대비로 각 오브제의 개성을 담았습니다.",
  },
  {
    id: "04",
    name: "morrow",
    category: "Brand",
    type: "패키지 · 비주얼 시스템",
    year: "2025",
    color: "morrow",
    description:
      "내일을 생각하는 스킨케어 브랜드. 자연에서 발견한 부드러운 곡선과 재생지의 질감을 시각 언어로 연결했습니다.",
  },
];

export default function IndexfolioTemplatePage() {
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState<string | null>(null);
  const visible = projects.filter(
    (project) => filter === "All" || project.category === filter,
  );
  return (
    <div className="ix-page">
      <aside className="ix-sidebar">
        <a className="ix-logo" href="#ix-top">
          INDEX<span>®</span>
        </a>
        <div className="ix-identity">
          <span className="ix-status">
            <i /> AVAILABLE FOR SELECT PROJECTS
          </span>
          <h1>
            서연.
            <br />
            생각을 형태로
            <br />
            만드는 디자이너.
          </h1>
          <p>
            브랜드의 첫인상부터
            <br />
            화면 속 작은 경험까지.
            <br />
            오래 남을 디자인을 만듭니다.
          </p>
        </div>
        <nav>
          <a href="#ix-work">
            Selected work <span>04</span>
          </a>
          <a href="#ix-about">
            A little about me <ArrowUpRight size={15} />
          </a>
          <a href="mailto:hello@example.com">
            Let’s talk <ArrowUpRight size={15} />
          </a>
        </nav>
        <div className="ix-sidebar-bottom">
          <Asterisk size={52} strokeWidth={1} />
          <p>
            INDEPENDENT DESIGNER
            <br />
            BASED IN SEOUL, KR
            <br />
            <span>© 2026 INDEX STUDIO</span>
          </p>
        </div>
      </aside>
      <main id="ix-top" className="ix-main">
        <header className="ix-topbar">
          <span>PORTFOLIO — VOL. 026</span>
          <span>GOOD DESIGN, WITH A POINT OF VIEW.</span>
        </header>
        <section id="ix-work">
          <div className="ix-work-heading">
            <div>
              <span className="ix-label">
                A COLLECTION OF THOUGHTFUL THINGS
              </span>
              <h2>
                Selected
                <br />
                <em>work.</em>
                <sup>(04)</sup>
              </h2>
            </div>
            <ArrowDown size={34} strokeWidth={1} />
          </div>
          <div className="ix-filter" aria-label="프로젝트 분류">
            {["All", "Brand", "Digital", "Editorial"].map((item) => (
              <button
                key={item}
                aria-pressed={filter === item}
                onClick={() => {
                  setFilter(item);
                  setSelected(null);
                }}
              >
                {item}
                {item === "All" && <sup>04</sup>}
              </button>
            ))}
            <span>2025 — 2026</span>
          </div>
          <div className="ix-projects" aria-live="polite">
            {visible.map((project) => (
              <article
                key={project.id}
                className={`ix-project ix-${project.color}`}
              >
                <button
                  className="ix-project-trigger"
                  onClick={() =>
                    setSelected(selected === project.id ? null : project.id)
                  }
                  aria-expanded={selected === project.id}
                  aria-controls={`ix-detail-${project.id}`}
                >
                  <div className="ix-project-info">
                    <span className="ix-project-number">
                      {project.id} / {project.category.toUpperCase()}
                    </span>
                    <div>
                      <h3>{project.name}</h3>
                      <p>{project.type}</p>
                    </div>
                    <span className="ix-project-year">
                      {project.year}
                      <ArrowUpRight size={25} strokeWidth={1} />
                    </span>
                  </div>
                  <div className="ix-art" aria-hidden="true">
                    {project.color === "forma" ? (
                      <div className="ix-forma-card">
                        <div className="ix-f-symbol">
                          <i />
                          <i />
                          <i />
                        </div>
                        <b>FORMA</b>
                        <small>SHAPES FOR EVERYDAY LIVING</small>
                      </div>
                    ) : project.color === "pause" ? (
                      <div className="ix-pause-screen">
                        <span>
                          a little pause <i>MENU +</i>
                        </span>
                        <b>
                          Find your
                          <br />
                          <em>slow.</em>
                        </b>
                        <div className="ix-flower">✳</div>
                        <small>LESS NOISE. MORE ROOM TO BREATHE.</small>
                      </div>
                    ) : project.color === "object" ? (
                      <div className="ix-magazine">
                        <span>A JOURNAL OF ORDINARY THINGS</span>
                        <b>
                          OBJECT
                          <br />/ 07
                        </b>
                        <div className="ix-object-ring" />
                        <small>THE NEW PERSPECTIVE ISSUE — 2025</small>
                      </div>
                    ) : (
                      <div className="ix-bottles">
                        <div className="ix-bottle">
                          <b>morrow</b>
                          <span>
                            DAILY
                            <br />
                            ESSENTIALS
                          </span>
                          <small>01 / CLEANSE</small>
                        </div>
                        <div className="ix-bottle ix-bottle-small">
                          <b>morrow</b>
                          <span>
                            GOOD THINGS
                            <br />
                            TAKE TIME.
                          </span>
                          <small>02 / RENEW</small>
                        </div>
                      </div>
                    )}
                  </div>
                </button>
                {selected === project.id && (
                  <div
                    id={`ix-detail-${project.id}`}
                    className="ix-project-detail"
                  >
                    <span>THE IDEA</span>
                    <p>{project.description}</p>
                    <span>CONCEPT PROJECT / {project.year}</span>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
        <section className="ix-about" id="ix-about">
          <span className="ix-label">BEHIND THE WORK</span>
          <div>
            <h2>
              좋은 질문이
              <br />
              좋은 디자인을 만듭니다.
            </h2>
            <p>
              왜 이 브랜드여야 할까요? 사람들에게 어떤 순간으로 기억될까요? 저는
              그 질문에서 시작해, 명확하고 감각적인 답을 함께 찾아갑니다.
            </p>
            <div className="ix-services">
              <span>Brand identity</span>
              <span>Digital experience</span>
              <span>Art direction</span>
            </div>
          </div>
        </section>
        <footer className="ix-footer">
          <span>HAVE SOMETHING IN MIND?</span>
          <a href="mailto:hello@example.com">
            함께 만들어요.
            <ArrowUpRight size={48} strokeWidth={1} />
          </a>
          <small>hello@example.com · 템플릿 데모 연락처</small>
        </footer>
      </main>
    </div>
  );
}
