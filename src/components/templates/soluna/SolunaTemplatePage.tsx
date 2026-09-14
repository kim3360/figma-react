import { useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Menu,
  Pause,
  Play,
  X,
} from 'lucide-react';
import './soluna.css';

const rituals = [
  {
    number: '01',
    name: '천천히 숨 쉬기',
    english: 'BREATHE',
    description: '마음의 속도를 낮추는 5분',
    className: 'sl-ritual-breathe',
  },
  {
    number: '02',
    name: '나를 기록하기',
    english: 'REFLECT',
    description: '오늘의 감정을 만나는 시간',
    className: 'sl-ritual-reflect',
  },
  {
    number: '03',
    name: '깊게 쉬어가기',
    english: 'REST',
    description: '온전히 나를 위한 작은 쉼',
    className: 'sl-ritual-rest',
  },
] as const;

function SolunaTemplatePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [breathing, setBreathing] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div id="soluna-template">
      <header className="sl-header">
        <a
          className="sl-logo"
          href="#top"
          onClick={closeMenu}
          aria-label="SOLUNA 홈"
        >
          <span className="sl-logo-symbol" aria-hidden="true">
            ✳
          </span>{' '}
          soluna<span className="sl-logo-dot">.</span>
        </a>
        <nav
          className={menuOpen ? 'sl-nav sl-nav-open' : 'sl-nav'}
          aria-label="주 메뉴"
        >
          <a href="#rituals" onClick={closeMenu}>
            우리의 리추얼
          </a>
          <a href="#story" onClick={closeMenu}>
            솔루나 이야기
          </a>
          <a href="#community" onClick={closeMenu}>
            커뮤니티
          </a>
          <a className="sl-nav-cta" href="#start" onClick={closeMenu}>
            나의 하루 시작하기 <ArrowUpRight size={16} />
          </a>
        </nav>
        <button
          type="button"
          className="sl-menu"
          aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      <main id="top">
        <section className="sl-hero" aria-labelledby="sl-hero-title">
          <div className="sl-hero-copy">
            <p className="sl-eyebrow">
              <span /> 작은 쉼이 만드는 커다란 변화
            </p>
            <h1 id="sl-hero-title">
              오늘은,
              <br />
              <em>나에게</em>
              <br />
              돌아오는 시간.
            </h1>
            <p className="sl-hero-text">
              바쁜 하루 속에서도 나를 잊지 않도록.
              <br />
              솔루나와 함께 마음의 빈 공간을 채워보세요.
            </p>
            <a className="sl-primary" href="#rituals">
              나를 위한 리추얼 찾기{' '}
              <span>
                <ArrowUpRight size={19} />
              </span>
            </a>
            <div className="sl-hero-proof">
              <span className="sl-proof-avatars">
                <i>지</i>
                <i>수</i>
                <i>하</i>
              </span>
              <p>
                <strong>12,000+</strong>명이 매일 함께하고 있어요
              </p>
            </div>
          </div>
          <div
            className="sl-hero-visual"
            aria-label="솔루나 호흡 리추얼 미리보기"
          >
            <div className="sl-sun-halo" />
            <div className="sl-sun" />
            <span className="sl-orbit sl-orbit-one" />
            <span className="sl-orbit sl-orbit-two" />
            <span className="sl-visual-star sl-star-one">✳</span>
            <span className="sl-visual-star sl-star-two">✦</span>
            <div className="sl-app-card">
              <div className="sl-app-top">
                <span>
                  soluna<span>.</span>
                </span>
                <span>☀ 24°</span>
              </div>
              <p className="sl-app-greeting">좋은 아침이에요, 지은님</p>
              <h2>
                잠깐 멈추고
                <br />
                숨을 고를까요?
              </h2>
              <div
                className={
                  breathing ? 'sl-breath-orb sl-breath-active' : 'sl-breath-orb'
                }
              >
                <span>{breathing ? '천천히 숨 쉬어요' : '나를 위한 5분'}</span>
              </div>
              <button
                type="button"
                className="sl-breath-button"
                onClick={() => setBreathing((active) => !active)}
                aria-pressed={breathing}
              >
                {breathing ? (
                  <Pause size={15} fill="currentColor" />
                ) : (
                  <Play size={15} fill="currentColor" />
                )}{' '}
                {breathing ? '잠시 멈추기' : '호흡 시작하기'}
              </button>
              <div className="sl-app-bottom">
                <span>오늘의 마음 날씨</span>
                <b>
                  맑음 <span>✳</span>
                </b>
              </div>
            </div>
            <span className="sl-visual-label">FEEL MORE, RUSH LESS. ©2026</span>
          </div>
          <a className="sl-scroll" href="#rituals">
            <ArrowDown size={16} /> SCROLL TO EXPLORE
          </a>
        </section>

        <section className="sl-marquee" aria-label="솔루나 메시지">
          <span>
            천천히, 나답게 <i>✳</i> SLOW DOWN, FEEL MORE <i>✳</i> 천천히, 나답게{' '}
            <i>✳</i> SLOW DOWN, FEEL MORE
          </span>
        </section>

        <section
          className="sl-rituals sl-section"
          id="rituals"
          aria-labelledby="sl-rituals-title"
        >
          <div className="sl-section-top">
            <p className="sl-kicker">01 / OUR RITUALS</p>
            <p>일상에 더하는 가장 다정한 습관</p>
          </div>
          <h2 id="sl-rituals-title">
            하루에 필요한 만큼,
            <br />
            <em>나를 돌보는 방법.</em>
          </h2>
          <div className="sl-ritual-grid">
            {rituals.map((ritual) => (
              <article
                className={`sl-ritual-card ${ritual.className}`}
                key={ritual.number}
              >
                <div className="sl-ritual-art" aria-hidden="true">
                  <span className="sl-ritual-shape" />
                  <span className="sl-ritual-extra" />
                  <b>{ritual.english}</b>
                </div>
                <div className="sl-ritual-info">
                  <span>
                    {ritual.number} / {ritual.english}
                  </span>
                  <ArrowUpRight size={19} />
                </div>
                <h3>{ritual.name}</h3>
                <p>{ritual.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          className="sl-story sl-section"
          id="story"
          aria-labelledby="sl-story-title"
        >
          <div className="sl-story-art" aria-hidden="true">
            <div className="sl-story-circle" />
            <div className="sl-story-vase">
              <span />
              <i />
            </div>
            <span className="sl-story-note">
              A MOMENT
              <br />
              TO BE YOU.
            </span>
          </div>
          <div className="sl-story-copy">
            <p className="sl-kicker">02 / OUR STORY</p>
            <h2 id="sl-story-title">
              쉼에도
              <br />
              <em>연습이 필요하니까.</em>
            </h2>
            <p>
              솔루나는 온전히 나에게 집중하는 시간을 믿습니다. 거창한 변화보다
              오늘 하루의 작은 쉼, 그것으로 충분해요.
            </p>
            <p>
              당신의 속도로, 당신만의 리듬으로.
              <br />
              매일 조금씩 더 편안한 나를 만나보세요.
            </p>
            <a href="#start">
              솔루나와 함께하기 <ArrowUpRight size={19} />
            </a>
          </div>
        </section>

        <section
          className="sl-community sl-section"
          id="community"
          aria-labelledby="sl-community-title"
        >
          <p className="sl-kicker">03 / LITTLE MOMENTS</p>
          <div className="sl-community-grid">
            <h2 id="sl-community-title">
              잘 쉬는 하루는
              <br />
              <em>함께</em> 자라나요.
            </h2>
            <div>
              <span className="sl-quote-mark">“</span>
              <blockquote>
                하루의 끝에 제 마음을 들여다보는 5분이 생겼어요. 그 작은 시간이
                생각보다 큰 힘이 됩니다.
              </blockquote>
              <p>— 솔루나와 함께한 지 187일, 수진</p>
            </div>
          </div>
          <div className="sl-community-stats">
            <span>
              <b>12K+</b> 함께하는 사람들
            </span>
            <span>
              <b>4.9/5</b> 마음에 남은 경험
            </span>
            <span>
              <b>5 MIN</b> 매일 나를 위한 시간
            </span>
          </div>
        </section>

        <section className="sl-cta" id="start">
          <span>✳</span>
          <p>YOU DESERVE A MOMENT.</p>
          <h2>
            오늘의 쉼을
            <br />
            <em>시작해볼까요?</em>
          </h2>
          <a href="#rituals">
            리추얼 둘러보기 <ArrowRight size={20} />
          </a>
        </section>
      </main>
      <footer className="sl-footer">
        <a className="sl-logo" href="#top">
          ✳ soluna<span className="sl-logo-dot">.</span>
        </a>
        <span>오늘도, 나에게 다정하게.</span>
        <a href="#top">맨 위로 ↑</a>
        <small>© 2026 SOLUNA. ALL RIGHTS RESERVED.</small>
      </footer>
    </div>
  );
}

export default SolunaTemplatePage;
