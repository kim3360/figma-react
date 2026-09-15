import { useState } from "react";
import { ArrowDown, ArrowUpRight, AudioLines } from "lucide-react";
import "./offgrid.css";

const programs = [
  [
    {
      time: "16:00",
      name: "wave to earth",
      genre: "INDIE / DREAM POP",
      stage: "FIELD STAGE",
    },
    {
      time: "17:30",
      name: "SE SO NEON",
      genre: "ALTERNATIVE ROCK",
      stage: "FIELD STAGE",
    },
    {
      time: "19:00",
      name: "FKJ",
      genre: "ELECTRONIC / SOUL",
      stage: "SUNSET STAGE",
    },
  ],
  [
    { time: "15:30", name: "ADOY", genre: "SYNTH POP", stage: "FIELD STAGE" },
    {
      time: "17:00",
      name: "HYUKOH",
      genre: "INDIE ROCK",
      stage: "FIELD STAGE",
    },
    {
      time: "19:30",
      name: "Jungle",
      genre: "FUNK / ELECTRONIC",
      stage: "SUNSET STAGE",
    },
  ],
];

export default function OffgridTemplatePage() {
  const [day, setDay] = useState(0);
  return (
    <div className="og-page">
      <header className="og-nav">
        <a href="#og-top" className="og-logo">
          <AudioLines size={25} /> OFFGRID®
        </a>
        <span>SEOUL · MUSIC & CULTURE WEEKEND</span>
        <a href="#og-lineup">
          라인업 보기 <ArrowUpRight size={17} />
        </a>
      </header>
      <main id="og-top">
        <section className="og-poster" aria-label="OFFGRID 페스티벌">
          <div className="og-poster-meta">
            <span>LESS SCROLL. MORE SOUL.</span>
            <span>VOL. 04 / 2027</span>
          </div>
          <h1>
            GO OFF<span>GRID.</span>
          </h1>
          <div className="og-poster-bottom">
            <div>
              <p>잠깐, 세상과 연결을 끊고.</p>
              <p>우리의 주파수로 만나는 이틀.</p>
              <a href="#og-lineup" className="og-round-link">
                <ArrowDown size={20} /> THE WEEKEND STARTS HERE
              </a>
            </div>
            <div className="og-record" aria-hidden="true">
              <div>
                OFF
                <br />
                GRID<span>33⅓ RPM · FEEL ALIVE</span>
              </div>
            </div>
            <div className="og-date">
              <strong>
                05.22
                <br />
                —23
              </strong>
              <span>
                노들섬 · SEOUL
                <br />
                SATURDAY — SUNDAY
              </span>
            </div>
          </div>
          <div className="og-sticker">
            NO FILTER.
            <br />
            JUST FEELING.
          </div>
        </section>
        <div className="og-ticker">
          <span>2 DAYS</span>
          <b>✳</b>
          <span>12 ARTISTS</span>
          <b>✳</b>
          <span>ONE FREQUENCY</span>
          <b>✳</b>
          <span>LET’S GET LOST TOGETHER</span>
        </div>
        <section className="og-lineup" id="og-lineup">
          <div className="og-section-head">
            <div>
              <span className="og-eyebrow">01 / THE SOUND</span>
              <h2>
                좋아하는 소리로
                <br />
                가득 채운 하루.
              </h2>
            </div>
            <div className="og-tabs" aria-label="공연 날짜">
              {["DAY 01 · SAT", "DAY 02 · SUN"].map((label, i) => (
                <button
                  key={label}
                  onClick={() => setDay(i)}
                  aria-pressed={day === i}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div aria-live="polite">
            {programs[day].map((artist, i) => (
              <article className="og-artist" key={artist.name}>
                <span className="og-time">
                  {artist.time}
                  <small>0{i + 1}</small>
                </span>
                <div>
                  <h3>{artist.name}</h3>
                  <p>{artist.genre}</p>
                </div>
                <span className="og-stage">{artist.stage}</span>
                <ArrowUpRight className="og-artist-arrow" size={36} />
              </article>
            ))}
          </div>
          <p className="og-note">
            ※ 실제 공연이 아닌 템플릿 미리보기용 프로그램입니다.
          </p>
        </section>
        <section className="og-location">
          <div className="og-map" aria-label="노들섬을 표현한 일러스트">
            <div className="og-river">H A N &nbsp; R I V E R</div>
            <div className="og-island">
              <span>✳</span>
              <b>
                MEET
                <br />
                YOU HERE.
              </b>
              <small>37.5176° N / 126.9580° E</small>
            </div>
          </div>
          <div className="og-location-copy">
            <span className="og-eyebrow">02 / THE PLACE</span>
            <h2>
              도시 한가운데,
              <br />
              우리만의 섬.
            </h2>
            <p>
              강바람을 따라 걷다가, 마음에 드는 소리 앞에 멈추세요. 음악과 로컬
              푸드, 그리고 느슨한 오후가 기다립니다.
            </p>
            <dl>
              <div>
                <dt>WHERE</dt>
                <dd>서울 용산구 양녕로 445, 노들섬</dd>
              </div>
              <div>
                <dt>OPEN</dt>
                <dd>13:00 — 22:00 · 양일 동일</dd>
              </div>
            </dl>
            <a
              href="https://map.naver.com/p/search/노들섬"
              target="_blank"
              rel="noreferrer"
            >
              오는 길 확인하기 <ArrowUpRight size={20} />
            </a>
          </div>
        </section>
        <section className="og-faq">
          <span className="og-eyebrow">03 / GOOD TO KNOW</span>
          <h2>오기 전에, 잠깐.</h2>
          {[
            [
              "입장은 몇 시부터 가능한가요?",
              "오후 1시부터 입장할 수 있습니다. 첫 공연 전에 잔디밭과 로컬 마켓을 여유롭게 즐겨보세요.",
            ],
            [
              "무엇을 챙겨오면 좋을까요?",
              "개인 텀블러, 가벼운 돗자리와 저녁 바람을 막아줄 겉옷을 추천합니다.",
            ],
            [
              "티켓은 어디에서 구매하나요?",
              "현재 페이지는 디자인 템플릿입니다. 실제 서비스에서는 이 영역에 티켓 예매 링크를 연결할 수 있습니다.",
            ],
          ].map(([q, a]) => (
            <details key={q}>
              <summary>
                {q}
                <span>+</span>
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </section>
      </main>
      <footer className="og-footer">
        <strong>
          SEE YOU
          <br />
          OFFLINE. ↗
        </strong>
        <div>
          <a href="#og-top">OFFGRID®</a>
          <p>
            음악으로 연결되는 우리.
            <br />© 2027 OFFGRID. CONCEPT TEMPLATE.
          </p>
        </div>
      </footer>
    </div>
  );
}
