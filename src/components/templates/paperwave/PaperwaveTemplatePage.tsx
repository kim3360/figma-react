import { useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, Menu, X } from 'lucide-react';
import './paperwave.css';

type Genre = '전체' | '에세이' | '디자인';

const books = [
  {
    title: '느린 장면들',
    english: 'SLOW SCENES',
    author: '김하린',
    genre: '에세이',
    className: 'pw-cover-slow',
  },
  {
    title: '형태의 온도',
    english: 'THE SHAPE OF WARMTH',
    author: '문서율',
    genre: '디자인',
    className: 'pw-cover-shape',
  },
  {
    title: '작은 숲의 일기',
    english: 'A LITTLE FOREST',
    author: '이연주',
    genre: '에세이',
    className: 'pw-cover-forest',
  },
  {
    title: '보이지 않는 선',
    english: 'INVISIBLE LINES',
    author: '서지안',
    genre: '디자인',
    className: 'pw-cover-lines',
  },
] as const;

function PaperwaveTemplatePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [genre, setGenre] = useState<Genre>('전체');
  const visibleBooks =
    genre === '전체' ? books : books.filter((book) => book.genre === genre);

  return (
    <div id="paperwave-template">
      <header className="pw-header">
        <a
          className="pw-logo"
          href="#top"
          aria-label="PAPERWAVE 홈"
          onClick={() => setMenuOpen(false)}
        >
          PAPER<span>WAVE</span>
          <i>®</i>
        </a>
        <nav
          className={menuOpen ? 'pw-nav pw-nav-open' : 'pw-nav'}
          aria-label="주 메뉴"
        >
          <a href="#books" onClick={() => setMenuOpen(false)}>
            BOOKS
          </a>
          <a href="#story" onClick={() => setMenuOpen(false)}>
            OUR STORY
          </a>
          <a href="#journal" onClick={() => setMenuOpen(false)}>
            JOURNAL
          </a>
          <a
            href="#books"
            className="pw-nav-last"
            onClick={() => setMenuOpen(false)}
          >
            책 둘러보기 <ArrowUpRight size={16} />
          </a>
        </nav>
        <button
          className="pw-menu"
          type="button"
          aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      <main id="top">
        <section className="pw-hero" aria-labelledby="pw-hero-title">
          <div className="pw-hero-index">
            <span>독립 서점 & 큐레이션</span>
            <b>
              01
              <br />/ 04
            </b>
            <span>SEOUL · EST. 2026</span>
          </div>
          <div className="pw-hero-main">
            <p className="pw-kicker">
              <span className="pw-red-dot" /> THE ART OF READING / VOL. 01
            </p>
            <h1 id="pw-hero-title">
              읽는 순간,
              <br />
              <em>새로운 세계.</em>
            </h1>
            <p className="pw-hero-description">
              한 권의 책이 일상의 결을 바꿉니다.
              <br />
              오래 곁에 두고 싶은 이야기를 발견하세요.
            </p>
            <a className="pw-hero-link" href="#books">
              책장 들여다보기{' '}
              <span>
                <ArrowUpRight size={20} />
              </span>
            </a>
            <p className="pw-hero-bottom">
              <ArrowDown size={15} /> 아래로 내려 더 많은 이야기를 만나보세요
            </p>
          </div>
          <div className="pw-hero-art" aria-hidden="true">
            <span className="pw-art-type">
              WORDS
              <br />
              MAKE
              <br />
              WORLDS.
            </span>
            <div className="pw-art-shadow" />
            <div className="pw-book-back">
              <span>
                THE
                <br />
                QUIET
                <br />
                HOURS
              </span>
              <i>EDITION NO. 03</i>
            </div>
            <div className="pw-book-front">
              <span className="pw-front-top">PAPERWAVE EDITIONS 001</span>
              <span className="pw-front-sun" />
              <strong>
                나의
                <br />
                작은
                <br />
                우주
              </strong>
              <span className="pw-front-bottom">
                A LITTLE UNIVERSE
                <br />
                WRITTEN BY JIYOON KIM
              </span>
            </div>
            <span className="pw-art-stamp">
              좋은 문장을
              <br />
              모으는 공간 ✳
            </span>
          </div>
        </section>

        <div className="pw-strip">
          <span>
            GOOD BOOKS, GOOD DAYS <i>✳</i> 책이 있는 곳에 이야기가 있다 <i>✳</i>{' '}
            GOOD BOOKS, GOOD DAYS <i>✳</i> 책이 있는 곳에 이야기가 있다 <i>✳</i>
          </span>
        </div>

        <section
          className="pw-intro pw-section"
          id="story"
          aria-labelledby="pw-intro-title"
        >
          <p className="pw-section-tag">01 / OUR THOUGHT</p>
          <div className="pw-intro-grid">
            <h2 id="pw-intro-title">
              우리는 책의
              <br />
              <em>다음 페이지를</em>
              <br />
              믿습니다.
            </h2>
            <div className="pw-intro-text">
              <span className="pw-asterisk">✳</span>
              <p>
                책은 읽는 것으로 끝나지 않습니다. 밑줄 그은 문장이 하루의 대화가
                되고, 오래 접어둔 페이지가 새로운 생각의 시작이 되기도 하죠.
              </p>
              <p>
                PAPERWAVE는 지금의 나에게 꼭 필요한 이야기를 발견할 수 있도록,
                한 권 한 권 신중하게 고릅니다.
              </p>
              <a href="#books">
                우리가 고른 책 보기 <ArrowUpRight size={18} />
              </a>
            </div>
          </div>
        </section>

        <section
          className="pw-books pw-section"
          id="books"
          aria-labelledby="pw-books-title"
        >
          <div className="pw-section-top">
            <p className="pw-section-tag">02 / THE SHELF</p>
            <span>서가에서 지금 가장 사랑받는 이야기</span>
          </div>
          <h2 id="pw-books-title">
            오늘의 <em>책장.</em>
          </h2>
          <div className="pw-book-tabs" role="group" aria-label="책 분야 필터">
            {(['전체', '에세이', '디자인'] as const).map((option) => (
              <button
                key={option}
                type="button"
                className={genre === option ? 'pw-tab-active' : ''}
                aria-pressed={genre === option}
                onClick={() => setGenre(option)}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="pw-book-grid">
            {visibleBooks.map((book, index) => (
              <article className="pw-book-card" key={book.title}>
                <div
                  className={`pw-book-image ${book.className}`}
                  aria-hidden="true"
                >
                  <div className="pw-book-cover">
                    <small>
                      PAPERWAVE EDITIONS / {String(index + 1).padStart(2, '0')}
                    </small>
                    <span className="pw-cover-art" />
                    <strong>{book.english}</strong>
                    <small>{book.author.toUpperCase()}</small>
                  </div>
                </div>
                <div className="pw-book-meta">
                  <span>
                    {book.genre} / {book.author}
                  </span>
                  <ArrowUpRight size={19} />
                </div>
                <h3>{book.title}</h3>
              </article>
            ))}
          </div>
        </section>

        <section
          className="pw-feature"
          id="journal"
          aria-labelledby="pw-feature-title"
        >
          <div className="pw-feature-art" aria-hidden="true">
            <div className="pw-open-book">
              <div />
              <div />
            </div>
            <span>
              READ
              <br />
              BETWEEN
              <br />
              THE LINES.
            </span>
          </div>
          <div className="pw-feature-copy">
            <p className="pw-section-tag">03 / PAPER JOURNAL</p>
            <h2 id="pw-feature-title">
              조금 더 느리게,
              <br />
              <em>조금 더 깊게.</em>
            </h2>
            <p>
              한 페이지 앞에서 멈춰 서는 일. 그 여백에 나만의 생각을 적어
              내려가는 일. 우리가 사랑하는 독서의 순간들을 기록합니다.
            </p>
            <a href="#books">
              다음 읽을거리 찾기 <ArrowUpRight size={19} />
            </a>
            <span>VOL. 01 — THE QUIET MOMENTS</span>
          </div>
        </section>

        <section className="pw-end">
          <p>THE NEXT PAGE IS YOURS.</p>
          <h2>
            당신의 다음 이야기는
            <br />
            <em>어떤 책에서 시작될까요?</em>
          </h2>
          <a href="#books">
            나를 위한 책 만나기 <ArrowRight size={19} />
          </a>
          <span className="pw-end-star">✳</span>
        </section>
      </main>
      <footer className="pw-footer">
        <a className="pw-logo" href="#top">
          PAPER<span>WAVE</span>
          <i>®</i>
        </a>
        <span>책과 사람 사이, 작은 파도를 만듭니다.</span>
        <a href="#top">BACK TO TOP ↑</a>
        <small>© 2026 PAPERWAVE. ALL RIGHTS RESERVED.</small>
      </footer>
    </div>
  );
}

export default PaperwaveTemplatePage;
