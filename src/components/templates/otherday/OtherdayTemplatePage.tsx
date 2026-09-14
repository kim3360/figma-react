import { useState } from 'react';
import { ArrowDown, ArrowUpRight, Menu, X } from 'lucide-react';
import './otherday.css';

const coffees = [
  {
    number: '01',
    name: 'DAYBREAK BLEND',
    korean: '데이브레이크 블렌드',
    notes: '다크 초콜릿 · 캐러멜 · 오렌지',
    className: 'od-coffee-daybreak',
  },
  {
    number: '02',
    name: 'SLOW SUNDAY',
    korean: '슬로우 선데이',
    notes: '자스민 · 복숭아 · 꿀',
    className: 'od-coffee-sunday',
  },
  {
    number: '03',
    name: 'NIGHT SHIFT',
    korean: '나이트 시프트',
    notes: '헤이즐넛 · 코코아 · 브라운 슈가',
    className: 'od-coffee-night',
  },
] as const;

function OtherdayTemplatePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div id="otherday-template">
      <header className="od-header">
        <a
          className="od-logo"
          href="#top"
          aria-label="OTHERDAY 홈"
          onClick={closeMenu}
        >
          OTHER<span>DAY</span>
          <b>®</b>
        </a>
        <nav
          className={menuOpen ? 'od-nav od-nav-open' : 'od-nav'}
          aria-label="주 메뉴"
        >
          <a href="#coffee" onClick={closeMenu}>
            OUR COFFEE
          </a>
          <a href="#story" onClick={closeMenu}>
            OUR STORY
          </a>
          <a href="#visit" onClick={closeMenu}>
            VISIT US
          </a>
          <a className="od-nav-shop" href="#coffee" onClick={closeMenu}>
            커피 둘러보기 <ArrowUpRight size={16} />
          </a>
        </nav>
        <button
          type="button"
          className="od-menu"
          aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>
      </header>

      <main id="top">
        <section className="od-hero" aria-labelledby="od-hero-title">
          <div className="od-hero-copy">
            <p className="od-eyebrow">
              <span>EST. 2026 / SEOUL</span>
              <span>COFFEE FOR A BETTER DAY</span>
            </p>
            <h1 id="od-hero-title">
              평범한 하루를
              <br />
              <em>다르게.</em>
            </h1>
            <p className="od-hero-description">
              한 잔의 커피가 바꾸는 하루의 온도.
              <br />
              OTHERDAY는 매일을 조금 더 근사하게 만듭니다.
            </p>
            <a className="od-hero-button" href="#coffee">
              우리의 커피 만나기{' '}
              <span>
                <ArrowUpRight size={21} />
              </span>
            </a>
          </div>
          <div className="od-hero-art" aria-hidden="true">
            <div className="od-hero-disc">
              <span>MAKE TODAY AN OTHER DAY · MAKE TODAY AN OTHER DAY ·</span>
            </div>
            <div className="od-cup-shadow" />
            <div className="od-cup-handle" />
            <div className="od-cup">
              <div className="od-coffee-surface">
                <div className="od-latte-art" />
              </div>
            </div>
            <span className="od-hero-stamp">
              GOOD COFFEE.
              <br />
              GOOD DAYS.
              <br />
              ALWAYS.
            </span>
            <span className="od-hero-cross">✳</span>
          </div>
          <div className="od-hero-bottom">
            <a href="#coffee">
              <ArrowDown size={17} /> SCROLL TO EXPLORE
            </a>
            <span>SMALL MOMENTS, BIG FLAVOR.</span>
          </div>
        </section>

        <div className="od-ticker">
          <span>
            BREW BETTER DAYS <i>✳</i> 좋은 커피는 좋은 하루를 만든다 <i>✳</i>{' '}
            BREW BETTER DAYS <i>✳</i> 좋은 커피는 좋은 하루를 만든다 <i>✳</i>
          </span>
        </div>

        <section
          className="od-coffees od-section"
          id="coffee"
          aria-labelledby="od-coffee-title"
        >
          <div className="od-section-label">
            <span>01 / THE GOOD STUFF</span>
            <span>고르는 즐거움, 마시는 기쁨</span>
          </div>
          <div className="od-coffee-heading">
            <h2 id="od-coffee-title">
              매일의 <em>취향을</em> 찾다.
            </h2>
            <p>
              취향이 다른 만큼 좋은 커피의 모양도 다양하니까.
              <br />
              당신의 하루에 꼭 맞는 한 잔을 찾아보세요.
            </p>
          </div>
          <div className="od-coffee-grid">
            {coffees.map((coffee) => (
              <article
                className={`od-coffee-card ${coffee.className}`}
                key={coffee.number}
              >
                <div className="od-coffee-art" aria-hidden="true">
                  <span className="od-product-shadow" />
                  <div className="od-product-bag">
                    <span className="od-bag-seal" />
                    <b>
                      OTHER
                      <br />
                      DAY<span>®</span>
                    </b>
                    <small>
                      {coffee.name}
                      <br />
                      FRESHLY ROASTED IN SEOUL
                    </small>
                  </div>
                  <span className="od-product-deco">✳</span>
                </div>
                <div className="od-coffee-meta">
                  <span>{coffee.number} / WHOLE BEAN COFFEE</span>
                  <ArrowUpRight size={19} />
                </div>
                <h3>{coffee.name}</h3>
                <p>
                  {coffee.korean} <span>— {coffee.notes}</span>
                </p>
              </article>
            ))}
          </div>
        </section>

        <section
          className="od-story"
          id="story"
          aria-labelledby="od-story-title"
        >
          <div className="od-story-visual" aria-hidden="true">
            <div className="od-story-sun" />
            <span className="od-story-beans od-bean-one" />
            <span className="od-story-beans od-bean-two" />
            <span className="od-story-beans od-bean-three" />
            <strong>
              GOOD
              <br />
              THINGS
              <br />
              TAKE
              <br />
              TIME.
            </strong>
            <small>ROASTED WITH CARE / SEOUL, KOREA</small>
          </div>
          <div className="od-story-copy">
            <p className="od-kicker">02 / WHY OTHERDAY</p>
            <h2 id="od-story-title">
              우리는
              <br />
              좋은 하루를
              <br />
              <em>볶습니다.</em>
            </h2>
            <p>
              커피는 맛있는 것 이상이어야 한다고 믿어요. 분주한 아침의 작은
              여유, 오후의 새로운 영감, 누군가와 나누는 따뜻한 대화까지.
            </p>
            <p>
              OTHERDAY는 좋은 원두와 정직한 로스팅으로 그 순간들에 함께합니다.
            </p>
            <a href="#visit">
              우리의 공간 만나기 <ArrowUpRight size={20} />
            </a>
          </div>
        </section>

        <section
          className="od-values od-section"
          aria-labelledby="od-values-title"
        >
          <p className="od-kicker">03 / WHAT WE BELIEVE</p>
          <h2 id="od-values-title">
            우리답게, <em>한 잔 한 잔.</em>
          </h2>
          <div className="od-values-grid">
            <div>
              <span>
                01 <i>✳</i>
              </span>
              <h3>좋은 재료에서 시작해요</h3>
              <p>생산자의 시간과 노력이 담긴 좋은 원두만 고릅니다.</p>
            </div>
            <div>
              <span>
                02 <i>◒</i>
              </span>
              <h3>매일 신선하게 볶아요</h3>
              <p>가장 맛있는 순간에 커피가 당신에게 닿도록.</p>
            </div>
            <div>
              <span>
                03 <i>↗</i>
              </span>
              <h3>일상의 재미를 더해요</h3>
              <p>어제와 다른 오늘을 만드는 작은 즐거움.</p>
            </div>
          </div>
        </section>

        <section
          className="od-visit"
          id="visit"
          aria-labelledby="od-visit-title"
        >
          <div className="od-visit-copy">
            <p className="od-kicker">04 / COME SAY HELLO</p>
            <h2 id="od-visit-title">
              커피 마시러
              <br />
              <em>오실래요?</em>
            </h2>
            <p>
              좋은 커피가 있는 곳에는 좋은 이야기가 시작되니까.
              <br />
              가까운 곳에서, 느긋하게 만나요.
            </p>
            <div className="od-visit-details">
              <span>OTHERDAY SEONGSU</span>
              <span>
                서울 성동구 성수이로 00길 00 <small>※ 예시 주소</small>
              </span>
              <span>매일 10:00 — 19:00</span>
            </div>
            <a href="#top">
              다시 위로 가기 <ArrowUpRight size={19} />
            </a>
          </div>
          <div className="od-visit-art" aria-hidden="true">
            <div className="od-visit-window" />
            <div className="od-visit-table" />
            <div className="od-visit-cup" />
            <span>YOU'RE ALWAYS WELCOME.</span>
          </div>
        </section>
      </main>
      <footer className="od-footer">
        <a className="od-logo" href="#top">
          OTHER<span>DAY</span>
          <b>®</b>
        </a>
        <p>EVERY DAY DESERVES GOOD COFFEE.</p>
        <a href="#top">BACK TO TOP ↑</a>
        <small>© 2026 OTHERDAY COFFEE. MADE WITH LOVE IN SEOUL.</small>
      </footer>
    </div>
  );
}

export default OtherdayTemplatePage;
