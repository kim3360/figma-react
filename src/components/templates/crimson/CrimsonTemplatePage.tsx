import { useEffect, useRef, useState, type ReactNode } from 'react';
import './crimson.css';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=2400&q=80';

const THEMES = ['전체', '힐링', '드라이브', '감성숙소', '미식', '액티비티'] as const;

const DESTINATIONS = [
  {
    title: '제주 동쪽 감성 3일',
    region: '제주',
    detail: '성산 · 우도 · 월정리',
    nights: '2박 3일',
    price: '289,000',
    rating: '4.9',
    reviews: '1,248',
    badge: '이번 주 인기',
    image:
      'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: '강릉 바다 드라이브',
    region: '강원',
    detail: '안목 · 경포 · 주문진',
    nights: '1박 2일',
    price: '159,000',
    rating: '4.8',
    reviews: '892',
    badge: '당일출발 가능',
    image:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: '여수 밤바다 낭만 코스',
    region: '전남',
    detail: '돌산 · 케이블카 · 낭만포차',
    nights: '2박 3일',
    price: '219,000',
    rating: '4.9',
    reviews: '2,015',
    badge: '커플 추천',
    image:
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: '부산 미식 투어',
    region: '부산',
    detail: '광안리 · 자갈치 · 남포동',
    nights: '2박 3일',
    price: '198,000',
    rating: '4.7',
    reviews: '1,560',
    badge: '먹방 필수',
    image:
      'https://images.unsplash.com/photo-1534270804882-6b50478b1a10?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: '속초 · 양양 서핑 힐링',
    region: '강원',
    detail: '설악 · 낙산사 · 서피비치',
    nights: '2박 3일',
    price: '249,000',
    rating: '4.8',
    reviews: '734',
    badge: '액티비티',
    image:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: '경주 한옥 야경 산책',
    region: '경북',
    detail: '황리단길 · 동궁과월지',
    nights: '1박 2일',
    price: '139,000',
    rating: '4.9',
    reviews: '980',
    badge: '가성비',
    image:
      'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1200&q=80',
  },
] as const;

const SERVICES = [
  {
    num: '01',
    title: '맞춤 일정 설계',
    desc: '가족·커플·친구 여행에 맞춰 이동 동선과 휴식 밸런스를 고려한 일정을 잡아 드립니다.',
  },
  {
    num: '02',
    title: '숙소 · 렌터카 예약',
    desc: '감성숙소부터 리조트까지 비교하고, 렌터카·주차까지 한 번에 연결해 드립니다.',
  },
  {
    num: '03',
    title: '현지 체험 연결',
    desc: '카약, 서핑, 한옥 스테이, 미식 투어 등 현지에서만 가능한 체험을 예약해 드립니다.',
  },
  {
    num: '04',
    title: '실시간 여행 케어',
    desc: '출발 전 체크리스트부터 현지 문의까지, 카카오톡으로 빠르게 도와드립니다.',
  },
] as const;

const PROCESS = [
  {
    num: '1',
    title: '여행 상담',
    desc: '가고 싶은 지역, 인원, 예산만 알려주세요. 전화·카톡 상담 모두 가능합니다.',
  },
  {
    num: '2',
    title: '일정 제안',
    desc: '1~2일 안에 추천 코스와 예상 견적을 보내드리고, 원하는 대로 수정합니다.',
  },
  {
    num: '3',
    title: '예약 확정',
    desc: '숙소·교통·입장권까지 대신 예약하고, 확정 일정을 모바일로 전달합니다.',
  },
  {
    num: '4',
    title: '여행 출발',
    desc: '출발 전 알림과 현지 가이드 팁으로 걱정 없이 다녀오실 수 있어요.',
  },
] as const;

const STATS = [
  { value: '32', suffix: '곳', label: '국내 여행지' },
  { value: '18', suffix: '만+', label: '누적 여행객' },
  { value: '4.9', suffix: '점', label: '평균 만족도' },
  { value: '24', suffix: 'h', label: '상담 응답' },
] as const;

function useScrolled(threshold = 16) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return scrolled;
}

function Reveal({
  children,
  className = '',
  delayClass = '',
}: {
  children: ReactNode;
  className?: string;
  delayClass?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(node);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`crimson-reveal ${delayClass} ${visible ? 'is-visible' : ''} ${className}`.trim()}
    >
      {children}
    </div>
  );
}

function CrimsonTemplatePage() {
  const scrolled = useScrolled();
  const [activeTheme, setActiveTheme] = useState<(typeof THEMES)[number]>('전체');

  const filtered =
    activeTheme === '전체'
      ? DESTINATIONS
      : DESTINATIONS.filter((item) => {
          if (activeTheme === '힐링') return ['제주', '강원'].includes(item.region);
          if (activeTheme === '드라이브') return item.title.includes('드라이브') || item.region === '강원';
          if (activeTheme === '감성숙소') return ['제주', '경북'].includes(item.region);
          if (activeTheme === '미식') return item.title.includes('미식') || item.region === '부산';
          if (activeTheme === '액티비티') return item.badge.includes('액티비티') || item.title.includes('서핑');
          return true;
        });

  return (
    <div className="crimson-template crimson-template--kr">
      <header className={`crimson-nav crimson-nav--kr ${scrolled ? 'is-scrolled' : ''}`}>
        <a href="#top" className="crimson-nav__brand crimson-nav__brand--kr">
          크림슨트래블
        </a>
        <nav className="crimson-nav__links crimson-nav__links--kr" aria-label="주요 메뉴">
          <a href="#destinations">추천여행</a>
          <a href="#services">이용안내</a>
          <a href="#process">예약절차</a>
          <a href="#contact" className="crimson-nav__cta">
            여행상담
          </a>
        </nav>
      </header>

      <main id="top">
        <section className="crimson-hero crimson-hero--kr">
          <div className="crimson-hero__media" aria-hidden="true">
            <img src={HERO_IMAGE} alt="" />
            <div className="crimson-hero__veil" />
          </div>

          <div className="crimson-shell crimson-hero__content">
            <p className="crimson-hero__eyebrow crimson-hero__eyebrow--kr">국내 자유여행 · 맞춤 일정</p>
            <h1 className="crimson-hero__title crimson-hero__title--kr">
              <span>이번 주말,</span>
              <span>어디로 떠나볼까요?</span>
            </h1>
            <p className="crimson-hero__lead">
              제주부터 강릉·여수까지. 숙소·렌터카·체험까지 한 번에 잡아드려요.
            </p>

            <form
              className="crimson-search"
              onSubmit={(event) => {
                event.preventDefault();
                document.getElementById('destinations')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <label className="crimson-search__field">
                <span>여행지</span>
                <select defaultValue="제주">
                  <option>제주</option>
                  <option>강릉</option>
                  <option>여수</option>
                  <option>부산</option>
                  <option>속초</option>
                  <option>경주</option>
                </select>
              </label>
              <label className="crimson-search__field">
                <span>출발일</span>
                <input type="date" defaultValue="2026-09-19" />
              </label>
              <label className="crimson-search__field">
                <span>인원</span>
                <select defaultValue="2명">
                  <option>1명</option>
                  <option>2명</option>
                  <option>3명</option>
                  <option>4명+</option>
                </select>
              </label>
              <button type="submit" className="crimson-search__submit">
                검색하기
              </button>
            </form>
          </div>
        </section>

        <section className="crimson-quick">
          <div className="crimson-shell crimson-quick__grid">
            {[
              { title: '당일예약', desc: '오늘 출발도 OK' },
              { title: '카톡상담', desc: '평균 10분 응답' },
              { title: '일정수정', desc: '출발 전 무료' },
              { title: '후기보장', desc: '만족도 4.9' },
            ].map((item) => (
              <div key={item.title} className="crimson-quick__item">
                <strong>{item.title}</strong>
                <span>{item.desc}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="destinations" className="crimson-work crimson-work--kr">
          <div className="crimson-shell">
            <Reveal>
              <div className="crimson-work__header crimson-work__header--kr">
                <div>
                  <p className="crimson-section-label">이번 달 추천</p>
                  <h2 className="crimson-section-title crimson-section-title--kr">인기 국내 여행</h2>
                </div>
                <p className="crimson-services__lead">실제 예약이 많은 코스만 모았어요</p>
              </div>
            </Reveal>

            <div className="crimson-themes" role="tablist" aria-label="여행 테마">
              {THEMES.map((theme) => (
                <button
                  key={theme}
                  type="button"
                  role="tab"
                  aria-selected={activeTheme === theme}
                  className={`crimson-themes__chip ${activeTheme === theme ? 'is-active' : ''}`}
                  onClick={() => setActiveTheme(theme)}
                >
                  {theme}
                </button>
              ))}
            </div>

            <div className="crimson-cards">
              {filtered.map((place, index) => (
                <Reveal key={place.title} delayClass={`crimson-reveal-delay-${Math.min((index % 4) + 1, 4)}`}>
                  <article className="crimson-card">
                    <div className="crimson-card__media">
                      <img src={place.image} alt={place.title} loading="lazy" />
                      <span className="crimson-card__badge">{place.badge}</span>
                    </div>
                    <div className="crimson-card__body">
                      <div className="crimson-card__top">
                        <span className="crimson-card__region">{place.region}</span>
                        <span className="crimson-card__rating">
                          ★ {place.rating} <em>({place.reviews})</em>
                        </span>
                      </div>
                      <h3>{place.title}</h3>
                      <p className="crimson-card__detail">{place.detail}</p>
                      <div className="crimson-card__bottom">
                        <span className="crimson-card__nights">{place.nights}</span>
                        <strong>
                          {place.price}
                          <span>원~</span>
                        </strong>
                      </div>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="services" className="crimson-services crimson-services--kr">
          <div className="crimson-shell">
            <Reveal>
              <div className="crimson-services__header">
                <div>
                  <p className="crimson-section-label">이런 점이 달라요</p>
                  <h2 className="crimson-section-title crimson-section-title--kr">크림슨이 도와주는 일</h2>
                </div>
                <p className="crimson-services__lead">검색만 하다 지치지 않게, 필요한 예약만 깔끔하게</p>
              </div>
            </Reveal>

            <div className="crimson-service-grid">
              {SERVICES.map((service, index) => (
                <Reveal key={service.num} delayClass={`crimson-reveal-delay-${Math.min(index + 1, 4)}`}>
                  <article className="crimson-service-tile">
                    <span>{service.num}</span>
                    <h3>{service.title}</h3>
                    <p>{service.desc}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="process" className="crimson-process crimson-process--kr">
          <div className="crimson-shell">
            <Reveal>
              <div className="crimson-process__header">
                <div>
                  <p className="crimson-section-label">이용 방법</p>
                  <h2 className="crimson-section-title crimson-section-title--kr">예약은 이렇게 진행돼요</h2>
                  <p className="crimson-process__lead">상담부터 출발까지 평균 2일이면 일정이 확정됩니다</p>
                </div>
                <a href="#contact" className="crimson-btn">
                  지금 상담하기
                </a>
              </div>
            </Reveal>

            <div className="crimson-process__grid">
              {PROCESS.map((step, index) => (
                <Reveal key={step.num} delayClass={`crimson-reveal-delay-${Math.min(index + 1, 4)}`}>
                  <article className="crimson-process__card">
                    <span>STEP {step.num}</span>
                    <h3>{step.title}</h3>
                    <p>{step.desc}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="crimson-stats crimson-stats--kr">
          <div className="crimson-shell crimson-stats__grid">
            {STATS.map((stat, index) => (
              <Reveal key={stat.label} delayClass={`crimson-reveal-delay-${Math.min(index + 1, 4)}`}>
                <div className="crimson-stats__item">
                  <div className="crimson-stats__num">
                    {stat.value}
                    <em>{stat.suffix}</em>
                  </div>
                  <div className="crimson-stats__label">{stat.label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="crimson-quote crimson-quote--kr">
          <div className="crimson-shell">
            <Reveal>
              <div className="crimson-quote__inner">
                <p className="crimson-section-label">실제 후기</p>
                <blockquote>
                  “강릉 일정 짜느라 밤샘할 뻔했는데, 카톡으로 코스 받고 숙소만 고르니까 하루 만에
                  끝났어요. 현지 식당 추천도 진짜 맛있었습니다.”
                </blockquote>
                <div className="crimson-quote__author">
                  <strong>박지현</strong>
                  <span>강릉 1박 2일 · 커플 여행</span>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section id="contact" className="crimson-contact crimson-contact--kr">
          <div className="crimson-shell">
            <div className="crimson-contact__grid">
              <Reveal>
                <div>
                  <p className="crimson-contact__label">여행 상담</p>
                  <h2>가고 싶은 지역만 말씀해 주세요.</h2>
                  <p className="crimson-contact__copy">
                    인원·날짜·예산이 아직 확실하지 않아도 괜찮아요. 추천 코스와 대략 견적을 먼저
                    보내드립니다.
                  </p>
                  <div className="crimson-contact__actions">
                    <a href="mailto:hello@crimson.travel" className="crimson-btn">
                      카톡으로 상담하기
                    </a>
                    <a href="tel:15881234" className="crimson-btn crimson-btn--ghost">
                      1588-1234 전화상담
                    </a>
                  </div>
                </div>
              </Reveal>

              <Reveal delayClass="crimson-reveal-delay-2">
                <dl className="crimson-contact__meta">
                  <div>
                    <dt>고객센터</dt>
                    <dd>
                      <a href="tel:15881234">1588-1234</a>
                    </dd>
                  </div>
                  <div>
                    <dt>이메일</dt>
                    <dd>
                      <a href="mailto:hello@crimson.travel">hello@crimson.travel</a>
                    </dd>
                  </div>
                  <div>
                    <dt>운영시간</dt>
                    <dd>평일 09:30 - 18:30 · 주말 10:00 - 17:00</dd>
                  </div>
                  <div>
                    <dt>오시는 길</dt>
                    <dd>서울 중구 을지로 100, 크림슨트래블 라운지</dd>
                  </div>
                </dl>
              </Reveal>
            </div>

            <div className="crimson-footer">
              <div className="crimson-footer__brand">크림슨트래블</div>
              <div className="crimson-footer__social">
                <a href="#">인스타그램</a>
                <a href="#">네이버블로그</a>
                <a href="#">카카오채널</a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default CrimsonTemplatePage;
