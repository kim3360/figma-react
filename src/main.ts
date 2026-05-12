import "./landing.css"
import "./app.css"
import "./error-pages.css"
import { LANDING_PAGE_HTML } from "./landing-page-html"

function getAppRoot(): HTMLDivElement {
  const el = document.querySelector<HTMLDivElement>("#app")
  if (!el) throw new Error("Missing #app element")
  return el
}

const root = getAppRoot()

let projNewModalEscapeListenerAttached = false
let projTemplateSliderResizeListenerAttached = false

const HASH_DASHBOARD = "#/app"
const HASH_MAIN_ALT = "#/main"
const HASH_PROJECTS = "#/app/projects"
/** 프로젝트 목록에서 「새 프로젝트」모달 (프로젝트 slug로 `create`는 사용하지 않음) */
const HASH_PROJECTS_CREATE = "#/app/projects/create"

/** 설정 모달 탭 → URL 슬러그 매핑.  예) 계정 → `#/app/auth` */
const SETTINGS_TAB_SLUGS: Record<string, string> = {
  account: "auth",
  general: "general",
  billing: "billing",
  personalization: "personalization",
  mail: "mail",
  data: "data",
  computer: "computer",
  browser: "browser",
  skills: "skills",
  connectors: "connectors",
  integrations: "integrations",
}
const SETTINGS_SLUG_TO_TAB: Record<string, string> = Object.fromEntries(Object.entries(SETTINGS_TAB_SLUGS).map(([tab, slug]) => [slug, tab]))
const SETTINGS_DEFAULT_TAB = "general"
function getSettingsHashForTab(tab: string): string {
  const slug = SETTINGS_TAB_SLUGS[tab]
  return slug ? `${HASH_DASHBOARD}/${slug}` : HASH_DASHBOARD
}
function getSettingsTabForHash(hash: string): string | null {
  const m = hash.match(/^#\/app\/([^/]+)$/)
  if (!m) return null
  return SETTINGS_SLUG_TO_TAB[m[1]] ?? null
}

const STORAGE_KEY_SIDEBAR_COLLAPSED = "devely.sidebar.collapsed"
const SESSION_KEY_PENDING_PROMPT = "devely.pendingPrompt"

function readPendingPrompt(): string {
  try {
    return sessionStorage.getItem(SESSION_KEY_PENDING_PROMPT) ?? ""
  } catch {
    return ""
  }
}

function writePendingPrompt(text: string): void {
  try {
    if (text) sessionStorage.setItem(SESSION_KEY_PENDING_PROMPT, text)
    else sessionStorage.removeItem(SESSION_KEY_PENDING_PROMPT)
  } catch {
    /* ignore */
  }
}

function suggestProjectSlugFromPrompt(text: string): string {
  const ascii = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 40)
  if (ascii.length >= 3) return ascii
  return `task-${new Date().toISOString().slice(0, 10)}`
}

function readSidebarCollapsed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY_SIDEBAR_COLLAPSED) === "1"
  } catch {
    return false
  }
}

function writeSidebarCollapsed(collapsed: boolean): void {
  try {
    if (collapsed) localStorage.setItem(STORAGE_KEY_SIDEBAR_COLLAPSED, "1")
    else localStorage.removeItem(STORAGE_KEY_SIDEBAR_COLLAPSED)
  } catch {
    /* ignore */
  }
}

/** 데모용 전역 오류 화면 (예: 공유 링크 테스트) */
const HASH_ERROR_404 = "#/error/404"
const HASH_ERROR_400 = "#/error/400"

function replaceLocationHashNoNavigate(hash: string): void {
  const url = new URL(window.location.href)
  url.hash = hash
  history.replaceState(null, "", url.toString())
}

function dismissProjectsCreateModal(): void {
  const m = document.getElementById("projNewModal")
  if (!m || m.hidden) return
  m.hidden = true
  if (window.location.hash === HASH_PROJECTS_CREATE) {
    replaceLocationHashNoNavigate(HASH_PROJECTS)
  }
}

function getProjectHash(slug: string): string {
  return `${HASH_PROJECTS}/${encodeURIComponent(slug)}`
}

type AgentWorkspaceTab = "preview" | "code" | "pipeline"

function parseAgentWorkspaceTabSegment(seg: string | undefined): AgentWorkspaceTab {
  if (seg === "code" || seg === "pipeline" || seg === "preview") return seg
  return "preview"
}

function getProjectAgentHash(slug: string, tab: AgentWorkspaceTab = "preview"): string {
  const base = `${HASH_PROJECTS}/${encodeURIComponent(slug)}/agent`
  if (tab === "preview") return base
  return `${base}/${tab}`
}

function isAppRoute(): boolean {
  const h = window.location.hash
  return h === HASH_DASHBOARD || h === HASH_MAIN_ALT || h.startsWith("#/app/")
}

type AppRoute = { kind: "dashboard" } | { kind: "projects"; createModalOpen: boolean } | { kind: "project"; slug: string } | { kind: "projectAgent"; slug: string; tab: AgentWorkspaceTab } | { kind: "settings"; tab: string } | { kind: "notFound" }

function parseAppRoute(): AppRoute {
  const raw = window.location.hash
  const h = raw.replace(/\/+$/, "") || "#"

  if (h === HASH_MAIN_ALT || h === HASH_DASHBOARD) {
    return { kind: "dashboard" }
  }

  const settingsTab = getSettingsTabForHash(h)
  if (settingsTab) {
    return { kind: "settings", tab: settingsTab }
  }

  if (raw.startsWith("#/app/") && !raw.startsWith("#/app/projects")) {
    return { kind: "notFound" }
  }

  if (h === HASH_PROJECTS || h === "#/app/projects") {
    return { kind: "projects", createModalOpen: false }
  }
  const prefix = "#/app/projects/"
  if (h.startsWith(prefix)) {
    const rest = h.slice(prefix.length).replace(/\/$/, "")
    const segments = rest.split("/").filter(Boolean)
    if (segments.length === 0) {
      return { kind: "projects", createModalOpen: false }
    }
    if (segments.length === 1 && segments[0] === "create") {
      return { kind: "projects", createModalOpen: true }
    }
    const slug = decodeURIComponent(segments[0])
    if (segments[1] === "agent") {
      const tab = parseAgentWorkspaceTabSegment(segments[2])
      return { kind: "projectAgent", slug, tab }
    }
    return { kind: "project", slug }
  }
  return { kind: "dashboard" }
}

function parseStandaloneErrorRoute(): 404 | 400 | null {
  const h = window.location.hash.replace(/\/+$/, "") || "#"
  if (h === HASH_ERROR_404 || h === "#/404") return 404
  if (h === HASH_ERROR_400 || h === "#/400") return 400
  return null
}

/** 브랜드 404/400 히어로 — 브라우저 창 + 404 숫자 + 좌측 말풍선·우측 경고 (라인 일러스트) */
function getErrorHeroIllustrationSvg(code: 404 | 400): string {
  const num = String(code)
  const is404 = code === 404
  const leftExtra = is404
    ? `<g stroke="#0f172a" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" fill="none">
        <path d="M28 118h52l10-18h36l10 18h24" />
        <path d="M36 118v-8h64v8" />
        <circle cx="48" cy="128" r="5" fill="#0f172a" />
        <circle cx="100" cy="128" r="5" fill="#0f172a" />
        <ellipse cx="58" cy="68" rx="22" ry="16" />
        <path d="M52 80 L46 92" />
        <path d="M70 76h12M70 82h8" stroke-width="1.5" />
      </g>`
    : `<g stroke="#0f172a" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" fill="none">
        <rect x="34" y="88" width="72" height="40" rx="4" />
        <path d="M46 104h48M46 112h32" stroke-width="1.5" />
        <path d="M58 52 L82 88 H34 Z" />
        <circle cx="58" cy="62" r="2" fill="#0f172a" />
      </g>`
  const rightShape = is404
    ? `<path d="M352 52 L376 98 H328 Z" stroke="#0f172a" stroke-width="1.75" fill="none" stroke-linejoin="round" />
       <line x1="352" y1="72" x2="352" y2="82" stroke="#0f172a" stroke-width="1.75" stroke-linecap="round" />
       <circle cx="352" cy="90" r="2" fill="#0f172a" />`
    : `<rect x="318" y="56" width="56" height="44" rx="4" stroke="#0f172a" stroke-width="1.75" fill="none" />
       <path d="M330 68h32M330 76h24M330 84h28" stroke="#0f172a" stroke-width="1.5" stroke-linecap="round" />`
  return `<svg class="err-page__hero-svg" viewBox="0 0 420 168" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    ${leftExtra}
    <g stroke="#0f172a" stroke-width="1.75" fill="none">
      <rect x="118" y="36" width="184" height="112" rx="8" />
      <line x1="118" y1="56" x2="302" y2="56" />
      <circle cx="132" cy="46" r="3.5" fill="#0f172a" stroke="none" />
      <circle cx="146" cy="46" r="3.5" fill="#cbd5e1" stroke="none" />
      <circle cx="160" cy="46" r="3.5" fill="#cbd5e1" stroke="none" />
      <rect x="132" y="68" width="156" height="64" rx="2" stroke="#cbd5e1" stroke-width="1.25" />
    </g>
    <text x="210" y="118" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="800" fill="#0f172a" letter-spacing="-0.04em">${num}</text>
    ${rightShape}
  </svg>`
}

function getHttpErrorPageHTML(code: 404 | 400, embeddedInApp: boolean): string {
  const is404 = code === 404
  const line1 = is404 ? "현재 입력하신 주소의 페이지는 삭제되었거나, 다른 페이지로 변경되었습니다." : "보내신 요청을 처리할 수 없습니다. 입력값이나 형식이 서버에서 기대하는 것과 다를 수 있습니다."
  const line2 = is404 ? "주소를 다시 확인해 주세요." : "입력 내용을 다시 확인한 뒤, 잠시 후 다시 시도해 주세요."
  const hero = getErrorHeroIllustrationSvg(code)
  const pageTitle = is404 ? "페이지를 찾을 수 없습니다" : "잘못된 요청입니다"

  if (embeddedInApp) {
    return `
    <div class="err-page err-page--in-app">
      <div class="err-page__embed">
        <h1 class="err-page__embed-title visually-hidden">${pageTitle}</h1>
        <div class="err-page__embed-art">${hero}</div>
        <p class="err-page__lead err-page__lead--embed">${line1}<br />${line2}</p>
        <a class="err-page__cta-main" href="#/">메인 페이지로 이동</a>
        <a class="err-page__cta-sub" href="${HASH_DASHBOARD}">작업으로 이동</a>
      </div>
    </div>`
  }

  return `
    <div class="err-page err-page--site">
      <header class="err-page__site-header">
        <nav class="err-page__site-nav err-page__site-nav--left" aria-label="주요 메뉴">
          <a class="err-page__site-link" href="#/">서비스</a>
          <a class="err-page__site-link" href="${HASH_DASHBOARD}">워크스페이스</a>
          <a class="err-page__site-link" href="${HASH_PROJECTS}">프로젝트</a>
          <a class="err-page__site-link" href="#/">가이드</a>
        </nav>
        <a class="err-page__site-logo" href="#/">Devely</a>
        <nav class="err-page__site-nav err-page__site-nav--right" aria-label="유틸">
          <a class="err-page__site-link err-page__site-link--muted" href="#/">KR</a>
          <a class="err-page__site-link err-page__site-link--muted" href="#/">통합검색</a>
          <a class="err-page__site-link err-page__site-link--muted" href="${HASH_DASHBOARD}">로그인</a>
        </nav>
      </header>
      <main class="err-page__site-main">
        <h1 class="err-page__hero-heading visually-hidden">${pageTitle}</h1>
        <div class="err-page__hero-art">${hero}</div>
        <p class="err-page__lead">${line1}<br />${line2}</p>
        <a class="err-page__cta-main" href="#/">메인 페이지로 이동</a>
        <a class="err-page__cta-sub" href="${HASH_DASHBOARD}">작업으로 이동</a>
      </main>
      <footer class="err-page__site-footer">
        <nav class="err-page__footer-grid" aria-label="바로가기">
          <a class="err-page__footer-cell err-page__footer-cell--active" href="#/">랜딩</a>
          <a class="err-page__footer-cell" href="${HASH_DASHBOARD}">작업</a>
          <a class="err-page__footer-cell" href="${HASH_PROJECTS}">프로젝트</a>
          <a class="err-page__footer-cell" href="${HASH_DASHBOARD}">템플릿</a>
          <a class="err-page__footer-cell" href="#/">시작하기</a>
          <a class="err-page__footer-cell" href="#/">고객 지원</a>
          <a class="err-page__footer-cell" href="${HASH_DASHBOARD}">마이페이지</a>
          <a class="err-page__footer-cell" href="#/">Devely 소개</a>
        </nav>
      </footer>
    </div>`
}

function mountStandaloneHttpError(code: 404 | 400): void {
  document.body.classList.remove("app-view")
  document.body.classList.add("error-view")
  root.innerHTML = getHttpErrorPageHTML(code, false)
  document.title = code === 404 ? "404 — 페이지 없음 — Devely" : "400 — 잘못된 요청 — Devely"
}

function getAppLayoutHTML(active: "dashboard" | "projects" | "settings", mainInnerHTML: string, mainExtraClass = "", omitSidebar = false, sidebarCollapsed = false): string {
  const mainClasses = `app-main${mainExtraClass ? ` ${mainExtraClass}` : ""}${omitSidebar ? " app-main--full" : ""}`
  if (omitSidebar) {
    return `
  <div class="app-shell app-shell--no-sidebar">
    <div class="${mainClasses}">
      ${mainInnerHTML}
    </div>
  </div>`
  }
  const dashActive = active === "dashboard" ? " app-sidebar__link--active" : ""
  const projActive = active === "projects" ? " app-sidebar__link--active" : ""
  const settingsActive = active === "settings" ? " app-sidebar__link--active" : ""
  const shellCollapsedClass = sidebarCollapsed ? " app-shell--sidebar-collapsed" : ""
  const toggleExpanded = sidebarCollapsed ? "false" : "true"
  const toggleLabel = sidebarCollapsed ? "사이드바 열기" : "사이드바 닫기"
  return `
  <div class="app-shell${shellCollapsedClass}">
    <aside class="app-sidebar" aria-label="메인 메뉴">
      <div class="app-sidebar__header">
        <div class="app-sidebar__brand">
          <span class="app-sidebar__mark" aria-hidden="true"></span>
          <div class="app-sidebar__brand-text">
            <span class="app-sidebar__title">Devely</span>
            <span class="app-sidebar__tagline">AI 웹 자동 생성</span>
          </div>
        </div>
        <button type="button" class="app-sidebar__toggle" data-sidebar-toggle aria-expanded="${toggleExpanded}" title="${toggleLabel}" aria-label="${toggleLabel}">
          <svg class="app-sidebar__toggle-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="3" y="4" width="18" height="16" rx="2"/>
            <line x1="9" y1="4" x2="9" y2="20"/>
          </svg>
        </button>
      </div>
      <nav class="app-sidebar__nav">
        <a class="app-sidebar__link${dashActive}" href="${HASH_DASHBOARD}" title="작업">
          <span class="app-sidebar__icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
          </span>
          <span class="app-sidebar__label-text">작업</span>
        </a>
        <a class="app-sidebar__link${projActive}" href="${HASH_PROJECTS}" title="프로젝트">
          <span class="app-sidebar__icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          </span>
          <span class="app-sidebar__label-text">프로젝트</span>
        </a>
        <a class="app-sidebar__link" href="${HASH_DASHBOARD}" title="템플릿">
          <span class="app-sidebar__icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M10 13h4"/><path d="M10 17h4"/></svg>
          </span>
          <span class="app-sidebar__label-text">템플릿</span>
        </a>
        <a class="app-sidebar__link" href="${HASH_DASHBOARD}" title="분석">
          <span class="app-sidebar__icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 16l4-4 4 4 6-7"/></svg>
          </span>
          <span class="app-sidebar__label-text">분석</span>
        </a>
        <button type="button" class="app-sidebar__link app-sidebar__link--button${settingsActive}" data-action="open-settings" title="설정">
          <span class="app-sidebar__icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
          </span>
          <span class="app-sidebar__label-text">설정</span>
        </button>
      </nav>
      <div class="app-sidebar__section">
        <p class="app-sidebar__label">워크스페이스</p>
        <div class="app-sidebar__pill">데모 팀 · Pro</div>
      </div>
      <a class="app-sidebar__logout" href="#/" aria-label="랜딩으로 나가기" title="랜딩으로 나가기">
        <span class="app-sidebar__icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </span>
        <span class="app-sidebar__label-text">랜딩으로 나가기</span>
      </a>
    </aside>
    <div class="${mainClasses}">
      ${mainInnerHTML}
    </div>
    ${omitSidebar ? "" : getAppSettingsModalHTML()}
  </div>
`
}

function getAccountPanelHTML(): string {
  const icoSpark = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l1.6 4.5L18 9l-4.4 1.5L12 15l-1.6-4.5L6 9l4.4-1.5z"/><path d="M19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/></svg>`
  const icoCal = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="16" y1="3" x2="16" y2="7"/></svg>`
  const icoHelpDot = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 3.5"/><line x1="12" y1="17" x2="12" y2="17.01"/></svg>`

  return `
    <section class="settings-modal__panel" data-settings-panel="account" hidden>
      <header class="settings-modal__panel-head">
        <h2 class="settings-modal__title">계정</h2>
      </header>

      <div class="acc-panel__name-row">
        <span class="acc-panel__avatar acc-panel__avatar--lg" aria-hidden="true">t</span>
        <div class="acc-panel__name-field">
          <label class="acc-panel__label" for="accFullName">전체 이름</label>
          <div class="acc-panel__input-wrap">
            <input id="accFullName" class="acc-panel__input" type="text" value="taewoo kim" autocomplete="off" />
          </div>
        </div>
      </div>

      <div class="acc-panel__plan">
        <div class="acc-panel__plan-head">
          <span class="acc-panel__plan-tag">무료</span>
          <button type="button" class="acc-panel__upgrade" data-acc-upgrade>업그레이드</button>
        </div>
        <div class="acc-panel__plan-divider"></div>
        <div class="acc-panel__plan-rows">
          <div class="acc-panel__plan-row">
            <div class="acc-panel__plan-left">
              <span class="acc-panel__plan-icon" aria-hidden="true">${icoSpark}</span>
              <div class="acc-panel__plan-text">
                <p class="acc-panel__plan-name">크레딧<span class="acc-panel__help" title="현재 사용 가능한 크레딧 잔액입니다." aria-label="도움말">${icoHelpDot}</span></p>
                <p class="acc-panel__plan-sub">무료 크레딧</p>
              </div>
            </div>
            <div class="acc-panel__plan-right">
              <p class="acc-panel__plan-value">1,000</p>
              <p class="acc-panel__plan-value acc-panel__plan-value--sub">1,000</p>
            </div>
          </div>
          <div class="acc-panel__plan-row">
            <div class="acc-panel__plan-left">
              <span class="acc-panel__plan-icon" aria-hidden="true">${icoCal}</span>
              <div class="acc-panel__plan-text">
                <p class="acc-panel__plan-name">매일 리프레시 크레딧<span class="acc-panel__help" title="매일 00:00에 자동으로 충전되는 크레딧입니다." aria-label="도움말">${icoHelpDot}</span></p>
                <p class="acc-panel__plan-sub">매일 00:00에 300로 새로고침</p>
              </div>
            </div>
            <div class="acc-panel__plan-right">
              <p class="acc-panel__plan-value">300</p>
            </div>
          </div>
        </div>
      </div>

      <div class="acc-panel__section">
        <p class="acc-panel__section-title">개인 정보</p>
        <div class="acc-panel__info-row">
          <div class="acc-panel__info-block">
            <p class="acc-panel__info-key">이메일</p>
            <p class="acc-panel__info-val">b01023320838@gmail.com</p>
          </div>
        </div>
        <div class="acc-panel__info-row">
          <div class="acc-panel__info-block">
            <p class="acc-panel__info-key">사용자 ID</p>
            <p class="acc-panel__info-val" id="accUserId">310519663253788504</p>
          </div>
          <button type="button" class="acc-panel__copy" data-acc-copy="#accUserId">복사</button>
        </div>
      </div>

      <div class="acc-panel__section">
        <p class="acc-panel__section-title">계정 관리</p>
        <div class="acc-panel__info-row">
          <div class="acc-panel__info-block">
            <p class="acc-panel__info-key">이 장치에서 로그아웃</p>
          </div>
          <button type="button" class="acc-panel__btn" data-acc-logout>로그아웃</button>
        </div>
        <div class="acc-panel__info-row">
          <div class="acc-panel__info-block">
            <p class="acc-panel__info-key">계정 삭제</p>
            <p class="acc-panel__info-desc">이 작업은 계정 및 모든 데이터를 삭제합니다.</p>
          </div>
          <button type="button" class="acc-panel__btn acc-panel__btn--danger" data-acc-delete>계정 삭제</button>
        </div>
      </div>
    </section>`
}

function getBillingPanelHTML(): string {
  const icoSpark = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l1.6 4.5L18 9l-4.4 1.5L12 15l-1.6-4.5L6 9l4.4-1.5z"/></svg>`
  const icoMsg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`
  const icoTime = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`

  const progressRow = (icon: string, name: string, used: string, total: string, pct: number): string => `
    <div class="set-progress-row">
      <div class="set-progress-meta">
        <span class="set-progress-name"><span class="set-progress-ico" aria-hidden="true">${icon}</span>${name}</span>
        <span class="set-progress-value">${used} <span class="set-progress-total">/ ${total}</span></span>
      </div>
      <div class="set-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}">
        <div class="set-progress__bar" style="width: ${pct}%"></div>
      </div>
    </div>`

  const tableRow = (date: string, item: string, amount: string, status: "paid" | "pending"): string => `
    <tr>
      <td>${date}</td>
      <td>${item}</td>
      <td class="set-table__num">${amount}</td>
      <td><span class="set-badge ${status === "paid" ? "set-badge--ok" : "set-badge--warn"}">${status === "paid" ? "결제 완료" : "결제 예정"}</span></td>
    </tr>`

  return `
    <section class="settings-modal__panel" data-settings-panel="billing" hidden>
      <header class="settings-modal__panel-head">
        <h2 class="settings-modal__title">사용량 및 청구</h2>
      </header>

      <div class="settings-modal__section">
        <p class="settings-modal__section-title">현재 플랜</p>
        <div class="set-plan-card">
          <div class="set-plan-card__main">
            <p class="set-plan-card__tag">무료</p>
            <p class="set-plan-card__price">₩0<span>/월</span></p>
            <p class="set-plan-card__desc">월 1,000 크레딧 · 매일 300 리프레시 · 1개 프로젝트</p>
          </div>
          <button type="button" class="acc-panel__upgrade" data-acc-upgrade>Pro로 업그레이드</button>
        </div>
      </div>

      <div class="settings-modal__section">
        <p class="settings-modal__section-title">이번 달 사용량</p>
        <div class="set-progress-stack">
          ${progressRow(icoSpark, "크레딧", "640", "1,000", 64)}
          ${progressRow(icoMsg, "메시지", "182", "500", 36)}
          ${progressRow(icoTime, "에이전트 실행 시간", "1.2시간", "5시간", 24)}
        </div>
        <p class="set-progress-note">사용량은 매월 1일 00:00에 초기화됩니다.</p>
      </div>

      <div class="settings-modal__section">
        <p class="settings-modal__section-title">결제 내역</p>
        <div class="set-table-wrap">
          <table class="set-table">
            <thead>
              <tr>
                <th>날짜</th>
                <th>항목</th>
                <th>금액</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              ${tableRow("2026.05.01", "Free 플랜 갱신", "₩0", "paid")}
              ${tableRow("2026.04.01", "Free 플랜 갱신", "₩0", "paid")}
              ${tableRow("2026.03.18", "크레딧 추가 구매 (500)", "₩4,900", "paid")}
            </tbody>
          </table>
        </div>
      </div>
    </section>`
}

function getPersonalizationPanelHTML(): string {
  const chip = (group: string, value: string, label: string, active = false): string =>
    `<button type="button" class="set-chip${active ? " set-chip--active" : ""}" data-chip-group="${group}" data-chip-value="${value}">${label}</button>`

  const toolRow = (key: string, name: string, desc: string, on: boolean): string => `
    <label class="set-checkrow">
      <input type="checkbox" class="set-checkrow__input" data-pref-tool="${key}" ${on ? "checked" : ""} />
      <span class="set-checkrow__check" aria-hidden="true"></span>
      <span class="set-checkrow__meta">
        <span class="set-checkrow__name">${name}</span>
        <span class="set-checkrow__desc">${desc}</span>
      </span>
    </label>`

  return `
    <section class="settings-modal__panel" data-settings-panel="personalization" hidden>
      <header class="settings-modal__panel-head">
        <h2 class="settings-modal__title">개인화</h2>
      </header>

      <div class="settings-modal__section">
        <p class="settings-modal__section-title">표시 이름</p>
        <div class="settings-modal__field">
          <label class="settings-modal__label" for="prefDisplayName">에이전트가 사용자를 부를 때 사용할 이름</label>
          <input id="prefDisplayName" class="acc-panel__input" type="text" value="taewoo" autocomplete="off" style="max-width:320px" />
        </div>
      </div>

      <div class="settings-modal__section">
        <p class="settings-modal__section-title">응답 스타일</p>
        <div class="settings-modal__field">
          <span class="settings-modal__label">응답 길이</span>
          <div class="set-chips" data-chip-row="length">
            ${chip("length", "short", "짧게")}
            ${chip("length", "balanced", "보통", true)}
            ${chip("length", "long", "길게")}
          </div>
        </div>
        <div class="settings-modal__field">
          <span class="settings-modal__label">톤</span>
          <div class="set-chips" data-chip-row="tone">
            ${chip("tone", "polite", "정중", true)}
            ${chip("tone", "friendly", "친근")}
            ${chip("tone", "expert", "전문가")}
          </div>
        </div>
      </div>

      <div class="settings-modal__section">
        <p class="settings-modal__section-title">자주 사용하는 도구</p>
        <div class="set-checkrows">
          ${toolRow("preview", "미리보기", "프로젝트를 자동으로 렌더링하고 변경을 즉시 반영합니다.", true)}
          ${toolRow("code", "코드 편집기", "에이전트가 직접 코드를 수정할 수 있도록 허용합니다.", true)}
          ${toolRow("browser", "클라우드 브라우저", "외부 URL을 가져와 컨텍스트로 사용합니다.", false)}
          ${toolRow("shell", "셸 실행", "패키지 설치·빌드를 위한 셸을 실행합니다.", false)}
        </div>
      </div>
    </section>`
}

function getMailPanelHTML(): string {
  const icoG = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>`

  return `
    <section class="settings-modal__panel" data-settings-panel="mail" hidden>
      <header class="settings-modal__panel-head">
        <h2 class="settings-modal__title">Mail Manus</h2>
      </header>

      <div class="settings-modal__section">
        <p class="settings-modal__section-title">연결된 메일함</p>
        <div class="set-list">
          <div class="set-list__item">
            <span class="set-list__icon set-list__icon--google" aria-hidden="true">${icoG}</span>
            <div class="set-list__meta">
              <p class="set-list__name">b01023320838@gmail.com</p>
              <p class="set-list__desc">Gmail · 마지막 동기화 5분 전</p>
            </div>
            <button type="button" class="acc-panel__btn" data-mail-disconnect>연결 해제</button>
          </div>
        </div>
        <button type="button" class="acc-panel__btn set-add-btn" data-mail-connect>+ 메일 계정 추가</button>
      </div>

      <div class="settings-modal__section">
        <p class="settings-modal__section-title">자동 회신</p>
        ${getToggleRowHTML("mailAutoReply", "자동 회신 초안 생성", "받은 메일을 읽고 답장 초안을 자동으로 작성합니다.", true)}
        <div class="settings-modal__field">
          <label class="settings-modal__label" for="mailTone">회신 톤</label>
          <div class="settings-modal__select" style="max-width:240px">
            <select id="mailTone" class="settings-modal__select-input">
              <option>정중</option>
              <option>친근</option>
              <option>비즈니스</option>
            </select>
            <span class="settings-modal__select-chev" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></span>
          </div>
        </div>
      </div>

      <div class="settings-modal__section">
        <p class="settings-modal__section-title">서명</p>
        <textarea class="set-textarea" id="mailSignature" rows="3" placeholder="이메일 끝에 추가될 서명">감사합니다,
taewoo kim</textarea>
      </div>
    </section>`
}

function getDataPanelHTML(): string {
  const chip = (group: string, value: string, label: string, active = false): string =>
    `<button type="button" class="set-chip${active ? " set-chip--active" : ""}" data-chip-group="${group}" data-chip-value="${value}">${label}</button>`

  return `
    <section class="settings-modal__panel" data-settings-panel="data" hidden>
      <header class="settings-modal__panel-head">
        <h2 class="settings-modal__title">데이터 제어</h2>
      </header>

      <div class="settings-modal__section">
        <p class="settings-modal__section-title">학습 사용</p>
        ${getToggleRowHTML("dataTrain", "대화로 모델 개선", "내 대화·피드백을 익명화하여 Devely 모델 학습에 사용합니다.", false)}
        ${getToggleRowHTML("dataAnalytics", "익명 사용 통계", "버그 진단과 기능 개선을 위해 익명 이벤트를 수집합니다.", true)}
      </div>

      <div class="settings-modal__section">
        <p class="settings-modal__section-title">대화 보존</p>
        <div class="settings-modal__field">
          <span class="settings-modal__label">보존 기간</span>
          <div class="set-chips" data-chip-row="retention">
            ${chip("retention", "30", "30일")}
            ${chip("retention", "90", "90일", true)}
            ${chip("retention", "forever", "무기한")}
          </div>
        </div>
        <p class="set-progress-note">기간이 지나면 대화는 영구 삭제됩니다.</p>
      </div>

      <div class="settings-modal__section">
        <p class="settings-modal__section-title">내 데이터</p>
        <div class="set-list">
          <div class="set-list__item">
            <div class="set-list__meta">
              <p class="set-list__name">데이터 내보내기</p>
              <p class="set-list__desc">모든 대화·프로젝트·설정을 JSON으로 받습니다.</p>
            </div>
            <button type="button" class="acc-panel__btn" data-data-export>내보내기</button>
          </div>
          <div class="set-list__item set-list__item--danger">
            <div class="set-list__meta">
              <p class="set-list__name">모든 대화 삭제</p>
              <p class="set-list__desc">계정은 유지하고 대화 내역만 영구 삭제합니다.</p>
            </div>
            <button type="button" class="acc-panel__btn acc-panel__btn--danger" data-data-purge>모두 삭제</button>
          </div>
        </div>
      </div>
    </section>`
}

function getComputerPanelHTML(): string {
  const icoMac = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="2"/><line x1="8" y1="20" x2="16" y2="20"/><line x1="12" y1="16" x2="12" y2="20"/></svg>`
  const icoIpad = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="2"/><line x1="12" y1="18" x2="12" y2="18.01"/></svg>`
  const icoFolder = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`

  return `
    <section class="settings-modal__panel" data-settings-panel="computer" hidden>
      <header class="settings-modal__panel-head">
        <h2 class="settings-modal__title">My Computer</h2>
      </header>

      <div class="settings-modal__section">
        <p class="settings-modal__section-title">연결된 기기</p>
        <div class="set-list">
          <div class="set-list__item">
            <span class="set-list__icon" aria-hidden="true">${icoMac}</span>
            <div class="set-list__meta">
              <p class="set-list__name">gimtaeus-MacBook-Pro <span class="set-badge set-badge--ok">현재 기기</span></p>
              <p class="set-list__desc">macOS 24.6 · 마지막 활동 방금 전</p>
            </div>
            <button type="button" class="acc-panel__btn" data-comp-disconnect>해제</button>
          </div>
          <div class="set-list__item">
            <span class="set-list__icon" aria-hidden="true">${icoIpad}</span>
            <div class="set-list__meta">
              <p class="set-list__name">taewoo의 iPad</p>
              <p class="set-list__desc">iPadOS 18 · 마지막 활동 2일 전</p>
            </div>
            <button type="button" class="acc-panel__btn" data-comp-disconnect>해제</button>
          </div>
        </div>
      </div>

      <div class="settings-modal__section">
        <p class="settings-modal__section-title">파일 접근 권한</p>
        ${getToggleRowHTML("compDocs", "문서", "문서 폴더의 파일을 읽고 첨부합니다.", true)}
        ${getToggleRowHTML("compDownloads", "다운로드", "다운로드 폴더 접근을 허용합니다.", true)}
        ${getToggleRowHTML("compDesktop", "데스크톱", "데스크톱 폴더에 직접 파일을 저장합니다.", false)}
      </div>

      <div class="settings-modal__section">
        <p class="settings-modal__section-title">동기화 폴더</p>
        <div class="set-row">
          <span class="set-row__icon" aria-hidden="true">${icoFolder}</span>
          <code class="set-row__code">~/Documents/Devely</code>
          <button type="button" class="acc-panel__btn" data-comp-change-folder>변경</button>
        </div>
      </div>
    </section>`
}

function getBrowserPanelHTML(): string {
  const chip = (group: string, value: string, label: string, active = false): string =>
    `<button type="button" class="set-chip${active ? " set-chip--active" : ""}" data-chip-group="${group}" data-chip-value="${value}">${label}</button>`
  const icoGlobe = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M12 3a13 13 0 0 1 0 18M12 3a13 13 0 0 0 0 18"/></svg>`

  return `
    <section class="settings-modal__panel" data-settings-panel="browser" hidden>
      <header class="settings-modal__panel-head">
        <h2 class="settings-modal__title">클라우드 브라우저</h2>
      </header>

      <div class="settings-modal__section">
        <p class="settings-modal__section-title">활성 세션</p>
        <div class="set-list">
          <div class="set-list__item">
            <span class="set-list__icon" aria-hidden="true">${icoGlobe}</span>
            <div class="set-list__meta">
              <p class="set-list__name">vercel.com</p>
              <p class="set-list__desc">로그인 유지 · 마지막 활동 12분 전</p>
            </div>
            <button type="button" class="acc-panel__btn" data-browser-end>종료</button>
          </div>
          <div class="set-list__item">
            <span class="set-list__icon" aria-hidden="true">${icoGlobe}</span>
            <div class="set-list__meta">
              <p class="set-list__name">notion.so</p>
              <p class="set-list__desc">로그인 유지 · 마지막 활동 1시간 전</p>
            </div>
            <button type="button" class="acc-panel__btn" data-browser-end>종료</button>
          </div>
        </div>
      </div>

      <div class="settings-modal__section">
        <p class="settings-modal__section-title">쿠키 / 캐시</p>
        ${getToggleRowHTML("browserAutoClean", "세션 종료 시 자동 정리", "세션이 종료되면 쿠키·캐시를 모두 비웁니다.", true)}
        <div class="settings-modal__field">
          <label class="settings-modal__label" for="browserClean">정리 주기</label>
          <div class="settings-modal__select" style="max-width:200px">
            <select id="browserClean" class="settings-modal__select-input">
              <option>매일</option>
              <option>매주</option>
              <option>매월</option>
            </select>
            <span class="settings-modal__select-chev" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></span>
          </div>
        </div>
      </div>

      <div class="settings-modal__section">
        <p class="settings-modal__section-title">기본 엔진</p>
        <div class="set-chips" data-chip-row="engine">
          ${chip("engine", "chromium", "Chromium", true)}
          ${chip("engine", "firefox", "Firefox")}
          ${chip("engine", "webkit", "WebKit")}
        </div>
      </div>
    </section>`
}

function getSkillsPanelHTML(): string {
  const skillRow = (key: string, name: string, desc: string, on: boolean): string => `
    <div class="set-list__item">
      <div class="set-list__icon set-list__icon--accent" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <div class="set-list__meta">
        <p class="set-list__name">${name}</p>
        <p class="set-list__desc">${desc}</p>
      </div>
      <button type="button" class="settings-modal__switch${on ? " settings-modal__switch--on" : ""}" data-settings-toggle="skill_${key}" aria-pressed="${on ? "true" : "false"}" aria-label="${name} 사용">
        <span class="settings-modal__switch-thumb"></span>
      </button>
    </div>`

  return `
    <section class="settings-modal__panel" data-settings-panel="skills" hidden>
      <header class="settings-modal__panel-head">
        <h2 class="settings-modal__title">스킬</h2>
        <button type="button" class="acc-panel__upgrade" data-skill-new>+ 새 스킬</button>
      </header>

      <div class="settings-modal__section">
        <p class="settings-modal__section-title">활성화된 스킬</p>
        <div class="set-list">
          ${skillRow("vercelDeploy", "Vercel 배포", "main 브랜치 푸시를 감지해 자동으로 배포합니다.", true)}
          ${skillRow("a11yReview", "접근성 리뷰", "WCAG 기준에 따라 페이지를 점검하고 보고서를 만듭니다.", true)}
          ${skillRow("seoBrief", "SEO 브리프", "타깃 키워드 기반으로 메타데이터와 헤딩 트리를 추천합니다.", false)}
          ${skillRow("designToken", "디자인 토큰 동기화", "Figma 변수와 코드 토큰을 양방향 동기화합니다.", false)}
        </div>
      </div>
    </section>`
}

function getConnectorsPanelHTML(): string {
  const card = (key: string, name: string, desc: string, icon: string, connected: boolean): string => `
    <div class="set-card-tile${connected ? " set-card-tile--on" : ""}">
      <div class="set-card-tile__head">
        <span class="set-card-tile__icon" aria-hidden="true">${icon}</span>
        ${connected ? `<span class="set-badge set-badge--ok">연결됨</span>` : ""}
      </div>
      <p class="set-card-tile__name">${name}</p>
      <p class="set-card-tile__desc">${desc}</p>
      <button type="button" class="acc-panel__btn set-card-tile__btn" data-connector="${key}">${connected ? "관리" : "연결"}</button>
    </div>`

  const icoSlack = `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="3" y="10" width="6" height="2.5" rx="1.25"/><rect x="10" y="3" width="2.5" height="6" rx="1.25"/><rect x="15" y="11.5" width="6" height="2.5" rx="1.25"/><rect x="11.5" y="15" width="2.5" height="6" rx="1.25"/></svg>`
  const icoNotion = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9l6 6M9 15V9h6"/></svg>`
  const icoGh = `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.113.825-.258.825-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.09-.745.083-.729.083-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.835 2.807 1.305 3.492.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.225.694.825.576C20.565 21.795 24 17.31 24 12c0-6.63-5.37-12-12-12z"/></svg>`
  const icoLinear = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M5 9l10 10M3 13l8 8M9 5l10 10M13 3l8 8"/></svg>`
  const icoFigma = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M9 3h6v6H9z"/><path d="M9 9h6v6H9z"/><path d="M9 15h6"/><path d="M9 21h0a3 3 0 0 1 0-6h0"/></svg>`
  const icoVercel = `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 4l10 16H2L12 4z"/></svg>`

  return `
    <section class="settings-modal__panel" data-settings-panel="connectors" hidden>
      <header class="settings-modal__panel-head">
        <h2 class="settings-modal__title">커넥터</h2>
      </header>

      <div class="settings-modal__section">
        <p class="settings-modal__section-title">팀 협업</p>
        <div class="set-grid">
          ${card("slack", "Slack", "에이전트 상태와 배포 결과를 채널로 전달합니다.", icoSlack, true)}
          ${card("notion", "Notion", "워크스페이스의 페이지·DB를 컨텍스트로 사용합니다.", icoNotion, false)}
          ${card("linear", "Linear", "이슈·프로젝트 진행 상황을 자동으로 갱신합니다.", icoLinear, false)}
        </div>
      </div>

      <div class="settings-modal__section">
        <p class="settings-modal__section-title">개발 / 디자인</p>
        <div class="set-grid">
          ${card("github", "GitHub", "저장소를 클론·푸시하고 PR 코멘트에 응답합니다.", icoGh, true)}
          ${card("vercel", "Vercel", "프리뷰·프로덕션 배포 상태를 한 화면에서 봅니다.", icoVercel, true)}
          ${card("figma", "Figma", "디자인 파일을 가져와 토큰·컴포넌트와 동기화합니다.", icoFigma, false)}
        </div>
      </div>
    </section>`
}

function getIntegrationsPanelHTML(): string {
  const card = (key: string, name: string, desc: string, status: "live" | "draft" | "off"): string => {
    const badge =
      status === "live" ? `<span class="set-badge set-badge--ok">실행 중</span>` : status === "draft" ? `<span class="set-badge set-badge--warn">초안</span>` : `<span class="set-badge set-badge--muted">중지</span>`
    return `
      <div class="set-list__item">
        <div class="set-list__icon set-list__icon--accent" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a3 3 0 0 0 4.2 0l3-3a3 3 0 0 0-4.2-4.2l-1 1"/><path d="M14 11a3 3 0 0 0-4.2 0l-3 3a3 3 0 0 0 4.2 4.2l1-1"/></svg>
        </div>
        <div class="set-list__meta">
          <p class="set-list__name">${name} ${badge}</p>
          <p class="set-list__desc">${desc}</p>
        </div>
        <button type="button" class="acc-panel__btn" data-integration="${key}">관리</button>
      </div>`
  }

  return `
    <section class="settings-modal__panel" data-settings-panel="integrations" hidden>
      <header class="settings-modal__panel-head">
        <h2 class="settings-modal__title">통합</h2>
        <button type="button" class="acc-panel__upgrade" data-integration-new>+ 새 워크플로</button>
      </header>

      <div class="settings-modal__section">
        <p class="settings-modal__section-title">자동화</p>
        <div class="set-list">
          ${card("zapier-deploy", "Zapier · 배포 알림", "main 브랜치 머지 시 Slack과 메일로 알립니다.", "live")}
          ${card("make-leads", "Make · 신규 리드 → Notion", "런딩에서 들어오는 폼 응답을 DB에 적재합니다.", "live")}
          ${card("n8n-billing", "n8n · 청구서 정리", "결제 결과를 분류해 Google Sheet에 저장합니다.", "draft")}
          ${card("pipedream-crm", "Pipedream · CRM 동기화", "고객 활동을 Salesforce에 동기화합니다.", "off")}
        </div>
      </div>

      <div class="settings-modal__section">
        <p class="settings-modal__section-title">웹훅</p>
        <div class="set-row">
          <code class="set-row__code">https://devely.app/hooks/u_310519...</code>
          <button type="button" class="acc-panel__btn" data-int-rotate>키 재발급</button>
        </div>
      </div>
    </section>`
}

function getToggleRowHTML(key: string, name: string, desc: string, on: boolean): string {
  return `
    <div class="settings-modal__toggle-row">
      <div class="settings-modal__toggle-copy">
        <p class="settings-modal__toggle-name">${name}</p>
        <p class="settings-modal__toggle-desc">${desc}</p>
      </div>
      <button type="button" class="settings-modal__switch${on ? " settings-modal__switch--on" : ""}" data-settings-toggle="${key}" aria-pressed="${on ? "true" : "false"}" aria-label="${name}">
        <span class="settings-modal__switch-thumb"></span>
      </button>
    </div>`
}

function getAppSettingsModalHTML(): string {
  const navItem = (tab: string, label: string, icon: string, active = false): string => `
    <button type="button" class="settings-modal__nav-item${active ? " settings-modal__nav-item--active" : ""}" data-settings-tab="${tab}">
      <span class="settings-modal__nav-icon" aria-hidden="true">${icon}</span>
      <span class="settings-modal__nav-text">${label}</span>
    </button>`

  const icoUser = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
  const icoGeneral = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="6" x2="13" y2="6"/><circle cx="17" cy="6" r="2"/><line x1="4" y1="12" x2="9" y2="12"/><circle cx="13" cy="12" r="2"/><line x1="17" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="15" y2="18"/><circle cx="19" cy="18" r="2"/></svg>`
  const icoBilling = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l1.6 4.5L18 8l-3.4 3 1 5L12 13.8 8.4 16l1-5L6 8l4.4-1.5L12 2z"/></svg>`
  const icoPersonal = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="7" height="7" rx="1"/><rect x="14" y="4" width="7" height="7" rx="1"/><rect x="3" y="13" width="7" height="7" rx="1"/><rect x="14" y="13" width="7" height="7" rx="1"/></svg>`
  const icoMail = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>`
  const icoData = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></svg>`
  const icoMyComputer = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="12" rx="2"/><line x1="8" y1="20" x2="16" y2="20"/><line x1="12" y1="16" x2="12" y2="20"/></svg>`
  const icoCloud = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><circle cx="6.5" cy="7" r="0.6" fill="currentColor"/><circle cx="8.5" cy="7" r="0.6" fill="currentColor"/></svg>`
  const icoSkills = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="18" r="2.5"/><line x1="8.5" y1="6" x2="15.5" y2="6"/><line x1="8.5" y1="18" x2="15.5" y2="18"/><line x1="6" y1="8.5" x2="6" y2="15.5"/><line x1="18" y1="8.5" x2="18" y2="15.5"/></svg>`
  const icoConnectors = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7h4v4H7zM13 13h4v4h-4z"/><path d="M11 9h2v4"/><circle cx="5" cy="9" r="1.5"/><circle cx="19" cy="15" r="1.5"/></svg>`
  const icoIntegration = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a3 3 0 0 0 4.2 0l3-3a3 3 0 0 0-4.2-4.2l-1 1"/><path d="M14 11a3 3 0 0 0-4.2 0l-3 3a3 3 0 0 0 4.2 4.2l1-1"/></svg>`
  const icoHelp = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 3.5"/><line x1="12" y1="17" x2="12" y2="17.01"/></svg>`
  const icoExt = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7"/><path d="M9 7h8v8"/></svg>`
  const icoChevDown = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`
  const icoSwap = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 4 18 9"/><polyline points="6 15 12 20 18 15"/></svg>`
  const icoSun = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><line x1="12" y1="3" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="21"/><line x1="3" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="21" y2="12"/><line x1="5.5" y1="5.5" x2="6.9" y2="6.9"/><line x1="17.1" y1="17.1" x2="18.5" y2="18.5"/><line x1="5.5" y1="18.5" x2="6.9" y2="17.1"/><line x1="17.1" y1="6.9" x2="18.5" y2="5.5"/></svg>`
  const icoMoon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`
  const icoAuto = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 3v18"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" stroke="none"/></svg>`
  const icoClose = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>`

  const toggleRow = (key: string, name: string, desc: string, on: boolean): string => `
    <div class="settings-modal__toggle-row">
      <div class="settings-modal__toggle-copy">
        <p class="settings-modal__toggle-name">${name}</p>
        <p class="settings-modal__toggle-desc">${desc}</p>
      </div>
      <button type="button" class="settings-modal__switch${on ? " settings-modal__switch--on" : ""}" data-settings-toggle="${key}" aria-pressed="${on ? "true" : "false"}" aria-label="${name}">
        <span class="settings-modal__switch-thumb"></span>
      </button>
    </div>`

  return `
  <div id="appSettingsModal" class="settings-modal" hidden aria-hidden="true">
    <div class="settings-modal__backdrop" data-settings-close tabindex="-1"></div>
    <div class="settings-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="settingsModalTitle">
      <button type="button" class="settings-modal__close" data-settings-close aria-label="설정 닫기" title="닫기">${icoClose}</button>
      <aside class="settings-modal__nav-col">
        <div class="settings-modal__profile">
          <span class="settings-modal__avatar" aria-hidden="true">t</span>
          <div class="settings-modal__profile-text">
            <p class="settings-modal__profile-name">taewoo kim</p>
            <p class="settings-modal__profile-plan">개인</p>
          </div>
          <button type="button" class="settings-modal__profile-switch" aria-label="계정 전환">${icoSwap}</button>
        </div>
        <nav class="settings-modal__nav-list" aria-label="설정 탭">
          <p class="settings-modal__nav-heading">계정</p>
          ${navItem("account", "계정", icoUser)}
          ${navItem("general", "일반", icoGeneral, true)}
          ${navItem("billing", "사용량 및 청구", icoBilling)}
          ${navItem("personalization", "개인화", icoPersonal)}
          <p class="settings-modal__nav-heading">기능</p>
          ${navItem("mail", "Mail Manus", icoMail)}
          ${navItem("data", "데이터 제어", icoData)}
          ${navItem("computer", "My Computer", icoMyComputer)}
          ${navItem("browser", "클라우드 브라우저", icoCloud)}
          ${navItem("skills", "스킬", icoSkills)}
          ${navItem("connectors", "커넥터", icoConnectors)}
          ${navItem("integrations", "통합", icoIntegration)}
        </nav>
        <a class="settings-modal__help" href="#" data-settings-help>
          <span class="settings-modal__nav-icon" aria-hidden="true">${icoHelp}</span>
          <span class="settings-modal__nav-text">도움 받기</span>
          <span class="settings-modal__help-ext" aria-hidden="true">${icoExt}</span>
        </a>
      </aside>
      <main class="settings-modal__content">
        <section class="settings-modal__panel settings-modal__panel--active" data-settings-panel="general">
          <header class="settings-modal__panel-head">
            <h2 id="settingsModalTitle" class="settings-modal__title">일반</h2>
          </header>
          <div class="settings-modal__section">
            <p class="settings-modal__section-title">외관</p>
            <div class="settings-modal__field">
              <label class="settings-modal__label" for="settingsLang">언어</label>
              <div class="settings-modal__select">
                <select id="settingsLang" class="settings-modal__select-input">
                  <option>한국어</option>
                  <option>English</option>
                  <option>日本語</option>
                </select>
                <span class="settings-modal__select-chev" aria-hidden="true">${icoChevDown}</span>
              </div>
            </div>
            <div class="settings-modal__field">
              <span class="settings-modal__label">테마</span>
              <div class="settings-modal__themes" role="radiogroup" aria-label="테마">
                <button type="button" class="settings-modal__theme-btn settings-modal__theme-btn--active" data-settings-theme="light" aria-pressed="true">
                  <span class="settings-modal__theme-icon" aria-hidden="true">${icoSun}</span>
                  <span>라이트</span>
                </button>
                <button type="button" class="settings-modal__theme-btn" data-settings-theme="dark" aria-pressed="false">
                  <span class="settings-modal__theme-icon" aria-hidden="true">${icoMoon}</span>
                  <span>다크</span>
                </button>
                <button type="button" class="settings-modal__theme-btn" data-settings-theme="auto" aria-pressed="false">
                  <span class="settings-modal__theme-icon" aria-hidden="true">${icoAuto}</span>
                  <span>자동</span>
                </button>
              </div>
            </div>
          </div>
          <div class="settings-modal__divider"></div>
          <div class="settings-modal__section">
            <p class="settings-modal__section-title">통신 설정</p>
            ${toggleRow("productUpdates", "제품 업데이트 받기", "기능 릴리스와 성공 사례를 먼저 접하고 워크플로를 최적화하세요.", true)}
            ${toggleRow("queueStartEmail", "내 대기 중인 작업이 시작되면 이메일을 보내주세요", "이 옵션을 활성화하면, 작업이 대기 상태를 마치고 처리 시작 시점에 이메일을 적시에 보내드립니다.", true)}
            ${toggleRow("marketingShare", "Devely에 대한 광고", "활성화되면, 우리는 귀하의 개인 정보를 수집하여 Devely에 대한 광고를 다른 앱, 웹사이트 및 플랫폼에서 표시하기 위해 마케팅 업체와 공유할 수 있습니다.", true)}
          </div>
        </section>
        ${getAccountPanelHTML()}
        ${getBillingPanelHTML()}
        ${getPersonalizationPanelHTML()}
        ${getMailPanelHTML()}
        ${getDataPanelHTML()}
        ${getComputerPanelHTML()}
        ${getBrowserPanelHTML()}
        ${getSkillsPanelHTML()}
        ${getConnectorsPanelHTML()}
        ${getIntegrationsPanelHTML()}
      </main>
    </div>
  </div>`
}

function getLandingHTML(): string {
  return LANDING_PAGE_HTML
}

function getDashboardInnerHTML(): string {
  const ic = (path: string, label: string, extra = "") => `<button type="button" class="db__icon-btn${extra ? ` ${extra}` : ""}" title="${label}" aria-label="${label}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg></button>`

  const quick = (path: string, label: string) => `<button type="button" class="db__quick-btn" data-db-quick="${escapeHtml(label)}"><span class="db__quick-icon" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${path}</svg></span>${escapeHtml(label)}</button>`

  return `
      <div class="db">
        <header class="db__topbar">
          <button type="button" class="db__brand" id="dbBrandBtn">
            <span class="db__brand-name">Devely 1.0 Lite</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <div class="db__topbar-end">
            ${ic('<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>', "알림")}
            <span class="db__credits" title="잔여 크레딧">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 15 8.5 22 9.3 17 14 18.5 21 12 17.5 5.5 21 7 14 2 9.3 9 8.5 12 2"/></svg>
              <span class="db__credits-num">1,273</span>
            </span>
            <span class="db__avatar" aria-label="내 계정">T</span>
          </div>
        </header>

        <main class="db__stage">
          <div class="db__plan-toggle" role="tablist" aria-label="플랜 선택">
            <button type="button" class="db__plan-tab" role="tab" aria-selected="false" data-db-plan="free">무료 플랜</button>
            <span class="db__plan-divider" aria-hidden="true"></span>
            <button type="button" class="db__plan-tab db__plan-tab--active" role="tab" aria-selected="true" data-db-plan="trial">무료 체험 시작</button>
          </div>

          <h1 class="db__title">무엇을 도와드릴까요?</h1>

          <form class="db__compose" id="dbComposeForm" autocomplete="off">
            <label class="agent-visually-hidden" for="dbComposeInput">프롬프트 입력</label>
            <textarea id="dbComposeInput" class="db__compose-input" rows="2" placeholder="작업을 할당하거나 무엇이든 질문하세요"></textarea>
            <div class="db__compose-bar">
              <div class="db__compose-bar-side">
                ${ic('<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>', "추가", "db__icon-btn--ghost")}
                ${ic('<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>', "도구", "db__icon-btn--ghost")}
                <button type="button" class="db__compose-pill" data-db-pill="cloud">
                  <span class="db__compose-pill-icon" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg></span>
                  <span>클라우드 컴퓨터</span>
                  <span class="db__compose-pill-badge">새로운</span>
                </button>
              </div>
              <div class="db__compose-bar-side db__compose-bar-side--end">
                ${ic('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>', "대화 이력", "db__icon-btn--ghost")}
                ${ic('<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>', "음성 입력", "db__icon-btn--ghost")}
                <button type="submit" class="db__compose-send" id="dbComposeSend" aria-label="보내기">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
                </button>
              </div>
            </div>
          </form>

          <div class="db__quick">
            ${quick('<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>', "슬라이드 제작")}
            ${quick('<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>', "웹사이트 구축")}
            ${quick('<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="2" y1="20" x2="22" y2="20"/>', "데스크톱 앱 개발")}
            ${quick('<circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-4.97-4.5-9-10-9z"/>', "디자인")}
            <button type="button" class="db__quick-btn db__quick-btn--more">더보기</button>
          </div>

          <p class="db__hint">데모 입력입니다. 실제 채팅과 작업 큐는 GitHub·호스팅 연동 후 활성화됩니다.</p>
        </main>
      </div>
`
}

function bindDashboardPage(): void {
  const form = document.getElementById("dbComposeForm") as HTMLFormElement | null
  const input = document.getElementById("dbComposeInput") as HTMLTextAreaElement | null
  if (!form || !input) return

  const autosize = (): void => {
    input.style.height = "auto"
    input.style.height = `${Math.min(input.scrollHeight, 200)}px`
  }
  input.addEventListener("input", autosize)

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      form.requestSubmit()
    }
  })

  form.addEventListener("submit", (e) => {
    e.preventDefault()
    const v = input.value.trim()
    writePendingPrompt(v)
    window.location.hash = HASH_PROJECTS_CREATE
  })

  document.querySelectorAll<HTMLButtonElement>("[data-db-quick]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const label = btn.dataset.dbQuick
      if (!label) return
      input.value = `${label}: `
      autosize()
      input.focus()
      input.setSelectionRange(input.value.length, input.value.length)
    })
  })

  document.querySelectorAll<HTMLButtonElement>("[data-db-plan]").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll<HTMLButtonElement>("[data-db-plan]").forEach((t) => {
        const on = t === tab
        t.classList.toggle("db__plan-tab--active", on)
        t.setAttribute("aria-selected", String(on))
      })
    })
  })
}

type DemoProjectStatus = "pre" | "deploying" | "done" | "failed"
type DemoProjectKind = "landing" | "portfolio" | "business"

interface DemoProject {
  slug: string
  status: DemoProjectStatus
  kind: DemoProjectKind
  /** 라이브 시 공개 URL, 그 외에는 내부 메모·오류 메시지 */
  subtitle: string
  /** 카드·로그용 절대 시각 표기 */
  updated: string
  /** FR-1: GitHub 스타일 상대 시각 (목록) */
  updatedRelative: string
  /** 목록 정렬: 최근 수정순 */
  updatedSort: number
  /** merge 기준 배포 버전 (PRD FR-12-1) */
  deployVersion: number
}

const DEMO_PROJECTS: readonly DemoProject[] = [
  {
    slug: "cafe-landing-page",
    status: "pre",
    kind: "landing",
    subtitle: "",
    updated: "Mar 5 04:25",
    updatedRelative: "5주 전",
    updatedSort: 50,
    deployVersion: 0,
  },
  {
    slug: "portfolio-2024",
    status: "deploying",
    kind: "portfolio",
    subtitle: "프로덕션 배포 진행 중",
    updated: "Jun 23 14:31",
    updatedRelative: "어제",
    updatedSort: 92,
    deployVersion: 2,
  },
  {
    slug: "saas-intro-site",
    status: "done",
    kind: "business",
    subtitle: "https://intro.example.com",
    updated: "Apr 11 18:30",
    updatedRelative: "3일 전",
    updatedSort: 88,
    deployVersion: 4,
  },
  {
    slug: "event-spring-sale",
    status: "pre",
    kind: "landing",
    subtitle: "",
    updated: "Feb 2 09:15",
    updatedRelative: "2월 2일",
    updatedSort: 30,
    deployVersion: 0,
  },
  {
    slug: "designer-showcase",
    status: "done",
    kind: "portfolio",
    subtitle: "https://folio.example.com",
    updated: "Jan 19 22:08",
    updatedRelative: "1월 19일",
    updatedSort: 40,
    deployVersion: 3,
  },
  {
    slug: "corp-pr-page",
    status: "deploying",
    kind: "business",
    subtitle: "스테이징 검증 중",
    updated: "Mar 28 11:42",
    updatedRelative: "2주 전",
    updatedSort: 55,
    deployVersion: 1,
  },
  {
    slug: "newsletter-signup",
    status: "done",
    kind: "landing",
    subtitle: "https://nl.example.com",
    updated: "Dec 8 16:55",
    updatedRelative: "12월 8일",
    updatedSort: 35,
    deployVersion: 2,
  },
  {
    slug: "photo-studio-booking",
    status: "failed",
    kind: "portfolio",
    subtitle: "빌드 단계 오류: 패키지 의존성 해석 실패",
    updated: "Nov 30 07:20",
    updatedRelative: "2주 전",
    updatedSort: 45,
    deployVersion: 1,
  },
  {
    slug: "recruit-2026",
    status: "deploying",
    kind: "landing",
    subtitle: "DNS 전파 대기",
    updated: "Apr 1 13:07",
    updatedRelative: "11일 전",
    updatedSort: 85,
    deployVersion: 2,
  },
]

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

/** PRD §10.1 FR-1 · 화면1 — Draft / Pending / Live / Failed */
const STATUS_BADGE: Record<DemoProjectStatus, { className: string; label: string }> = {
  pre: { className: "proj-badge proj-badge--prd-draft", label: "초안" },
  deploying: {
    className: "proj-badge proj-badge--prd-pending",
    label: "배포 대기",
  },
  done: { className: "proj-badge proj-badge--prd-live", label: "라이브" },
  failed: { className: "proj-badge proj-badge--prd-failed", label: "실패" },
}

const KIND_BADGE: Record<DemoProjectKind, { className: string; label: string }> = {
  landing: {
    className: "proj-badge proj-badge--type-landing",
    label: "랜딩 페이지",
  },
  portfolio: {
    className: "proj-badge proj-badge--type-portfolio",
    label: "포트폴리오 페이지",
  },
  business: {
    className: "proj-badge proj-badge--type-business",
    label: "비즈니스 페이지",
  },
}

function renderProjectThumb(p: DemoProject, index: number): string {
  const tone = (index % 3) + 1
  const url = p.slug.length > 22 ? `${escapeHtml(p.slug.slice(0, 22))}…` : escapeHtml(p.slug)
  const bar = `<div class="proj-thumb__bar"><span class="proj-thumb__dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="proj-thumb__fake-url">${url}</span></div>`

  let body = ""
  if (p.kind === "landing") {
    body = `<div class="proj-thumb__body proj-thumb__body--landing">
            <div class="proj-thumb__hero"></div>
            <div class="proj-thumb__lines">
              <span class="proj-thumb__line proj-thumb__line--lg"></span>
              <span class="proj-thumb__line"></span>
              <span class="proj-thumb__line proj-thumb__line--short"></span>
            </div>
            <div class="proj-thumb__cta">
              <span class="proj-thumb__pill"></span>
              <span class="proj-thumb__pill proj-thumb__pill--ghost"></span>
            </div>
          </div>`
  } else if (p.kind === "portfolio") {
    body = `<div class="proj-thumb__body proj-thumb__body--portfolio">
            <div class="proj-thumb__gallery">
              <div class="proj-thumb__shot proj-thumb__shot--hero"></div>
              <div class="proj-thumb__shot"></div>
              <div class="proj-thumb__shot"></div>
              <div class="proj-thumb__shot"></div>
            </div>
          </div>`
  } else {
    body = `<div class="proj-thumb__body proj-thumb__body--business">
            <div class="proj-thumb__nav"></div>
            <div class="proj-thumb__biz">
              <div class="proj-thumb__biz-row"></div>
              <div class="proj-thumb__biz-grid"><span></span><span></span><span></span></div>
            </div>
          </div>`
  }

  return `<div class="proj-card__preview">
          <div class="proj-thumb proj-thumb--${p.kind} proj-thumb--tone${tone}" aria-hidden="true">
            ${bar}
            ${body}
          </div>
        </div>`
}

function isProjectLiveUrl(p: DemoProject): boolean {
  return p.status === "done" && /^https?:\/\//i.test(p.subtitle)
}

function renderProjectCard(p: DemoProject, index: number): string {
  const st = STATUS_BADGE[p.status]
  const kd = KIND_BADGE[p.kind]
  const slug = escapeHtml(p.slug)
  const rel = escapeHtml(p.updatedRelative)
  const thumb = renderProjectThumb(p, index)
  const navHash = getProjectHash(p.slug)
  const showUrl = isProjectLiveUrl(p)
  const rawUrl = showUrl ? p.subtitle : ""
  const href = escapeHtml(rawUrl)
  const urlDisplay = escapeHtml(rawUrl.replace(/^https?:\/\//i, ""))
  const urlBlock = showUrl ? `<a class="proj-card__live-url" href="${href}" target="_blank" rel="noopener noreferrer">${urlDisplay}</a>` : ""

  return `
        <article class="proj-card">
          <div class="proj-card__hit" data-project-nav="${navHash}" role="link" tabindex="0" aria-label="${slug} 프로젝트 개요">
            ${thumb}
            <div class="proj-card__body">
              <div class="proj-card__badges">
                <span class="${st.className}">${st.label}</span>
                <span class="${kd.className}">${kd.label}</span>
              </div>
              <h2 class="proj-card__title">${slug}</h2>
            </div>
            ${urlBlock}
            <footer class="proj-card__foot">
              <span class="proj-card__time">Updated ${rel}</span>
            </footer>
          </div>
        </article>`
}

const PROJECT_LIST_PAGE_COUNT = 8

function getProjectListPaginationHTML(): string {
  const pages = Array.from({ length: PROJECT_LIST_PAGE_COUNT }, (_, i) => i + 1)
  const items = pages
    .map((n) => {
      const cur = n === 1 ? " proj-pagination__btn--current" : ""
      const aria = n === 1 ? ' aria-current="page"' : ""
      return `<li class="proj-pagination__item">
          <button type="button" class="proj-pagination__btn${cur}" data-proj-page="${n}" aria-label="${n}페이지"${aria}>${n}</button>
        </li>`
    })
    .join("")
  return `<nav id="projPagination" class="proj-pagination" aria-label="프로젝트 목록 페이지">
        <div class="proj-pagination__shell">
          <div class="proj-pagination__head">
            <span class="proj-pagination__title">페이지 탐색</span>
            <span id="projPaginationStatus" class="proj-pagination__status" aria-live="polite"><strong>1</strong> / ${PROJECT_LIST_PAGE_COUNT}</span>
          </div>
          <div class="proj-pagination__controls">
            <button type="button" class="proj-pagination__edge" id="projPaginationPrev" aria-label="이전 페이지" disabled>
              <span class="proj-pagination__chev proj-pagination__chev--prev" aria-hidden="true"></span>
            </button>
            <ol class="proj-pagination__list">${items}</ol>
            <button type="button" class="proj-pagination__edge" id="projPaginationNext" aria-label="다음 페이지">
              <span class="proj-pagination__chev proj-pagination__chev--next" aria-hidden="true"></span>
            </button>
          </div>
          <p class="proj-pagination__note">목록은 데모 데이터입니다. 번호는 UI 예시용입니다.</p>
        </div>
      </nav>`
}

function getProjectsInnerHTML(): string {
  const sorted = [...DEMO_PROJECTS].sort((a, b) => b.updatedSort - a.updatedSort)
  const cards = sorted.map((p, i) => renderProjectCard(p, i)).join("")
  const pagination = getProjectListPaginationHTML()
  return `
      <header class="app-header app-header--row proj-page-head">
        <div>
          <h1 class="app-header__title">프로젝트</h1>
          <p class="app-header__sub">AI로 만든 사이트를 수정·미리보기·배포까지 이어갑니다. (PRD MVP 흐름 반영 데모)</p>
        </div>
        <div class="proj-page-actions">
          <button type="button" class="app-btn app-btn--primary" id="projBtnNew">+ 새 프로젝트</button>
          <button type="button" class="app-btn app-btn--ghost" id="projBtnZip">ZIP 업로드</button>
          <button type="button" class="app-btn app-btn--ghost" id="projBtnGh">GitHub에서 불러오기</button>
        </div>
      </header>

      <div class="proj-list-body">
        <div class="proj-grid" id="projGrid">
          ${cards}
        </div>
        ${pagination}
      </div>

      <div id="projNewModal" class="proj-modal proj-modal--create" hidden>
        <div class="proj-modal__backdrop" id="projNewBackdrop" tabindex="-1"></div>
        <div class="proj-modal__dialog proj-modal__dialog--new" role="dialog" aria-modal="true" aria-labelledby="projNewModalTitle">
          <div class="proj-modal__accent-bar" aria-hidden="true"></div>
          <div class="proj-modal__head proj-modal__head--new">
            <div class="proj-modal__title-block">
              <p class="proj-modal__eyebrow">워크스페이스</p>
              <h2 id="projNewModalTitle" class="proj-modal__title proj-modal__title--new">새 프로젝트 생성</h2>
              <p class="proj-modal__lede">템플릿을 고르면 미리보기와 에이전트 대화까지 한 흐름으로 이어집니다.</p>
              <div class="proj-modal__prompt" id="projNewPromptHint" hidden>
                <span class="proj-modal__prompt-label" aria-hidden="true">프롬프트</span>
                <span class="proj-modal__prompt-text" id="projNewPromptHintText"></span>
              </div>
            </div>
            <button type="button" class="proj-modal__close" id="projNewClose" aria-label="닫기">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <form id="projNewForm" class="proj-new-form">
            <div class="proj-new-field proj-new-field--name">
              <label class="proj-new-label" for="projNewName">프로젝트 이름</label>
              <div class="proj-new-input-wrap">
                <span class="proj-new-input__prefix" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"><path d="M3 7a2 2 0 012-2h4l2 2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/></svg>
                </span>
                <input
                  id="projNewName"
                  name="name"
                  class="proj-new-input proj-new-input--with-prefix"
                  type="text"
                  autocomplete="off"
                  maxlength="80"
                  placeholder="예: my-awesome-project"
                  aria-describedby="projNewNameHint"
                  required
                />
              </div>
              <p class="proj-new-hint" id="projNewNameHint">영문·숫자·하이픈을 권장합니다. 나중에 언제든 바꿀 수 있어요.</p>
            </div>
            <fieldset class="proj-new-fieldset">
              <legend class="proj-new-label">템플릿 선택 <span class="proj-new-label__muted">(기본: 빈 프로젝트)</span></legend>
              <p class="proj-template-slider__hint">총 5종 · 기본으로 3개가 보이며, 좌우 화살표나 스와이프로 나머지를 볼 수 있어요.</p>
              <div class="proj-template-slider" id="projTemplateSlider">
                <button type="button" class="proj-template-slider__nav proj-template-slider__nav--prev" id="projTemplatePrev" aria-label="이전 템플릿">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>
                </button>
                <div class="proj-template-slider__viewport" id="projTemplateViewport" tabindex="0" role="region" aria-label="템플릿 목록, 좌우로 스크롤">
                  <div class="proj-template-slider__track" id="projTemplateTrack">
                    <label class="proj-template-card">
                      <input class="proj-template-card__input" type="radio" name="template" value="empty" />
                      <span class="proj-template-card__check" aria-hidden="true">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                      </span>
                      <span class="proj-template-card__icon proj-template-card__icon--empty" aria-hidden="true"><span class="proj-template-card__plus">+</span></span>
                      <span class="proj-template-card__title">빈 프로젝트</span>
                      <span class="proj-template-card__desc">구조만 만들고 에이전트로 채우기</span>
                    </label>
                    <label class="proj-template-card">
                      <input class="proj-template-card__input" type="radio" name="template" value="landing" checked />
                      <span class="proj-template-card__check" aria-hidden="true">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                      </span>
                      <span class="proj-template-card__icon" aria-hidden="true"></span>
                      <span class="proj-template-card__title">랜딩 페이지</span>
                      <span class="proj-template-card__desc">히어로 · CTA 중심 단일 페이지</span>
                    </label>
                    <label class="proj-template-card">
                      <input class="proj-template-card__input" type="radio" name="template" value="portfolio" />
                      <span class="proj-template-card__check" aria-hidden="true">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                      </span>
                      <span class="proj-template-card__icon proj-template-card__icon--portfolio" aria-hidden="true"></span>
                      <span class="proj-template-card__title">포트폴리오</span>
                      <span class="proj-template-card__desc">갤러리 · 작품 그리드 레이아웃</span>
                    </label>
                    <label class="proj-template-card">
                      <input class="proj-template-card__input" type="radio" name="template" value="business" />
                      <span class="proj-template-card__check" aria-hidden="true">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                      </span>
                      <span class="proj-template-card__icon proj-template-card__icon--biz" aria-hidden="true"></span>
                      <span class="proj-template-card__title">비즈니스</span>
                      <span class="proj-template-card__desc">네비 · 서비스 소개형 멀티 페이지</span>
                    </label>
                    <label class="proj-template-card">
                      <input class="proj-template-card__input" type="radio" name="template" value="blog" />
                      <span class="proj-template-card__check" aria-hidden="true">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                      </span>
                      <span class="proj-template-card__icon proj-template-card__icon--blog" aria-hidden="true"></span>
                      <span class="proj-template-card__title">블로그 · 문서</span>
                      <span class="proj-template-card__desc">글 목록 · 사이드바 · 검색</span>
                    </label>
                  </div>
                </div>
                <button type="button" class="proj-template-slider__nav proj-template-slider__nav--next" id="projTemplateNext" aria-label="다음 템플릿">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
                </button>
              </div>
            </fieldset>
            <div id="projNewLandingThemes" class="proj-new-field proj-new-landing-themes">
              <span class="proj-new-label" id="projNewLandingThemeLegend">
                <span class="proj-new-label__dot" aria-hidden="true"></span>
                세부 랜딩 테마
              </span>
              <div class="proj-theme-landing-stack">
                <div class="proj-theme-grid" id="projThemeGrid" role="group" aria-labelledby="projNewLandingThemeLegend">
                  <label class="proj-theme-card">
                    <input class="proj-theme-card__input" type="radio" name="landingTheme" value="saas" checked />
                    <span class="proj-theme-card__check" aria-hidden="true">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                    </span>
                    <span class="proj-theme-card__preview proj-theme-card__preview--saas" aria-hidden="true"></span>
                    <span class="proj-theme-card__copy">
                      <span class="proj-theme-card__title">SaaS 프로덕트</span>
                      <span class="proj-theme-card__desc">소프트웨어/앱 중심 모던 다크 테마</span>
                    </span>
                  </label>
                  <label class="proj-theme-card">
                    <input class="proj-theme-card__input" type="radio" name="landingTheme" value="local" />
                    <span class="proj-theme-card__check" aria-hidden="true">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                    </span>
                    <span class="proj-theme-card__preview proj-theme-card__preview--local" aria-hidden="true"></span>
                    <span class="proj-theme-card__copy">
                      <span class="proj-theme-card__title">로컬 비즈니스</span>
                      <span class="proj-theme-card__desc">카페, 식당용 이미지 위주의 테마</span>
                    </span>
                  </label>
                </div>
                <div
                  class="proj-theme-preview-stage"
                  id="projThemePreviewStage"
                  data-active-preview="saas"
                  role="region"
                  aria-label="랜딩 테마 미리보기"
                >
                  <p class="proj-theme-preview-live agent-visually-hidden" id="projThemePreviewLive" aria-live="polite"></p>
                  <div class="proj-theme-preview-stage__bar">
                    <span class="proj-theme-preview-stage__bar-title">미리보기</span>
                    <span class="proj-theme-preview-stage__bar-hint">카드에 포인터를 올리면 해당 테마를 크게 볼 수 있어요.</span>
                  </div>
                  <div class="proj-theme-preview-stage__body">
                    <div class="proj-theme-preview-mock proj-theme-preview-mock--saas" aria-hidden="true">
                      <div class="proj-tpm-chrome">
                        <span class="proj-tpm-chrome__dots" aria-hidden="true"><span></span><span></span><span></span></span>
                        <span class="proj-tpm-chrome__url">app.example.com</span>
                      </div>
                      <div class="proj-tpm-saas">
                        <div class="proj-tpm-saas__nav">
                          <span class="proj-tpm-saas__logo"></span>
                          <span class="proj-tpm-saas__navlinks"></span>
                          <span class="proj-tpm-saas__navbtn"></span>
                        </div>
                        <div class="proj-tpm-saas__hero">
                          <div class="proj-tpm-saas__kicker"></div>
                          <div class="proj-tpm-saas__headline"></div>
                          <div class="proj-tpm-saas__sub"></div>
                          <div class="proj-tpm-saas__cta">
                            <span></span><span></span>
                          </div>
                        </div>
                        <div class="proj-tpm-saas__cards">
                          <span></span><span></span><span></span>
                        </div>
                      </div>
                    </div>
                    <div class="proj-theme-preview-mock proj-theme-preview-mock--local" aria-hidden="true">
                      <div class="proj-tpm-chrome proj-tpm-chrome--warm">
                        <span class="proj-tpm-chrome__dots" aria-hidden="true"><span></span><span></span><span></span></span>
                        <span class="proj-tpm-chrome__url">cafe.local</span>
                      </div>
                      <div class="proj-tpm-local">
                        <div class="proj-tpm-local__photo"></div>
                        <div class="proj-tpm-local__hero">
                          <div class="proj-tpm-local__title"></div>
                          <div class="proj-tpm-local__sub"></div>
                        </div>
                        <div class="proj-tpm-local__chips">
                          <span></span><span></span><span></span>
                        </div>
                        <div class="proj-tpm-local__grid">
                          <span></span><span></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="proj-new-banner" role="note">
              <div class="proj-new-banner__glow" aria-hidden="true"></div>
              <span class="proj-new-banner__icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v2M12 19v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M3 12h2M19 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/><circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.15"/></svg>
              </span>
              <p class="proj-new-banner__text">디자인 완성도 및 기능 추가는 생성 후 <strong>AI 에이전트</strong>와 대화하며 자유롭게 수정할 수 있습니다.</p>
            </div>
            <div class="proj-modal__actions proj-modal__actions--form">
              <button type="button" class="app-btn app-btn--ghost proj-new-btn-cancel" id="projNewCancel">취소</button>
              <button type="submit" class="app-btn app-btn--primary proj-new-submit" id="projNewSubmit">템플릿으로 생성</button>
            </div>
          </form>
        </div>
      </div>

      <div id="projZipModal" class="proj-modal proj-modal--import" hidden>
        <div class="proj-modal__backdrop" id="projZipBackdrop" tabindex="-1"></div>
        <div
          class="proj-modal__dialog proj-modal__dialog--import"
          role="dialog"
          aria-modal="true"
          aria-labelledby="projZipModalTitle"
        >
          <div class="proj-modal__head proj-modal__head--import">
            <div class="proj-modal__title-block">
              <p class="proj-modal__eyebrow">가져오기</p>
              <h2 id="projZipModalTitle" class="proj-modal__title proj-modal__title--import">ZIP 업로드</h2>
              <p class="proj-modal__lede proj-modal__lede--import">
                정적 사이트 소스(ZIP)를 올리면 디렉터리 구조를 분석하고 미리보기·에이전트 컨텍스트까지 이어집니다.
              </p>
            </div>
            <button type="button" class="proj-modal__close" id="projZipClose" aria-label="닫기">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <div class="proj-import-zip">
            <input
              type="file"
              id="projZipFile"
              class="proj-import-zip__file"
              accept=".zip,application/zip,application/x-zip-compressed"
              tabindex="-1"
              aria-hidden="true"
            />
            <label for="projZipFile" class="proj-import-dropzone" id="projZipDropzone" tabindex="0">
              <span class="proj-import-dropzone__icon" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
              </span>
              <span class="proj-import-dropzone__title">ZIP을 끌어다 놓거나 클릭하여 선택</span>
              <span class="proj-import-dropzone__hint">정적 HTML/CSS/JS · 최대 100MB (제품 연동 시 적용)</span>
            </label>
            <p id="projZipFileName" class="proj-import-zip__picked" hidden></p>
            <ul class="proj-import-zip__bullets">
              <li>루트에 <code>index.html</code>이 있으면 바로 미리보기에 맞춥니다.</li>
              <li>압축 해제 후 트리는 Code 탭에서 확인할 수 있습니다.</li>
            </ul>
          </div>
          <div class="proj-modal__actions proj-modal__actions--import">
            <button type="button" class="app-btn app-btn--ghost" id="projZipCancel">취소</button>
            <button type="button" class="app-btn app-btn--primary" id="projZipSubmit" disabled>분석 시작</button>
          </div>
        </div>
      </div>

      <div id="projGhModal" class="proj-modal proj-modal--import" hidden>
        <div class="proj-modal__backdrop" id="projGhBackdrop" tabindex="-1"></div>
        <div
          class="proj-modal__dialog proj-modal__dialog--import"
          role="dialog"
          aria-modal="true"
          aria-labelledby="projGhModalTitle"
        >
          <div class="proj-modal__head proj-modal__head--import">
            <div class="proj-modal__title-block">
              <p class="proj-modal__eyebrow">가져오기</p>
              <h2 id="projGhModalTitle" class="proj-modal__title proj-modal__title--import">GitHub에서 불러오기</h2>
              <p class="proj-modal__lede proj-modal__lede--import">
                저장소를 연결한 뒤 브랜치·경로를 지정하면 클론·빌드·미리보기까지 한 흐름으로 이어집니다.
              </p>
            </div>
            <button type="button" class="proj-modal__close" id="projGhClose" aria-label="닫기">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <form id="projGhForm" class="proj-import-gh">
            <div class="proj-import-gh__oauth">
              <div class="proj-import-gh__oauth-copy">
                <p class="proj-import-gh__oauth-title">GitHub 계정</p>
                <p class="proj-import-gh__oauth-desc">연결하면 조직·비공개 저장소 권한을 불러옵니다.</p>
              </div>
              <div class="proj-import-gh__oauth-actions">
                <button type="button" class="app-btn app-btn--ghost proj-import-gh__connect" id="projGhConnect">
                  <span class="proj-import-gh__gh-mark" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path
                        d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.113.825-.258.825-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.09-.745.083-.729.083-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.835 2.807 1.305 3.492.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.225.694.825.576C20.565 21.795 24 17.31 24 12c0-6.63-5.37-12-12-12z"
                      />
                    </svg>
                  </span>
                  GitHub 연결
                </button>
                <span id="projGhConnectBadge" class="proj-import-gh__badge" hidden>연결됨 · 데모</span>
              </div>
            </div>
            <div class="proj-import-field">
              <label class="proj-import-label" for="projGhRepo">저장소 URL</label>
              <input
                id="projGhRepo"
                name="repo"
                class="proj-import-input"
                type="url"
                autocomplete="off"
                placeholder="https://github.com/owner/repository"
                required
              />
            </div>
            <div class="proj-import-field-row">
              <div class="proj-import-field">
                <label class="proj-import-label" for="projGhBranch">브랜치</label>
                <input id="projGhBranch" name="branch" class="proj-import-input" type="text" value="main" autocomplete="off" />
              </div>
              <div class="proj-import-field">
                <label class="proj-import-label" for="projGhPath">루트 경로 <span class="proj-import-label__opt">(선택)</span></label>
                <input
                  id="projGhPath"
                  name="path"
                  class="proj-import-input"
                  type="text"
                  placeholder="예: apps/web"
                  autocomplete="off"
                />
              </div>
            </div>
            <p class="proj-import-gh__note">데모에서는 입력값만 검증합니다. 실제 OAuth·클론은 백엔드 연동 후 동작합니다.</p>
          </form>
          <div class="proj-modal__actions proj-modal__actions--import">
            <button type="button" class="app-btn app-btn--ghost" id="projGhCancel">취소</button>
            <button type="submit" class="app-btn app-btn--primary" id="projGhSubmit" form="projGhForm">저장소 가져오기</button>
          </div>
        </div>
      </div>`
}

function getProjectDetailStatusRow(p: DemoProject): string {
  const st = STATUS_BADGE[p.status]
  const ver = p.deployVersion > 0 ? `현재 버전: v${p.deployVersion}` : "현재 버전: — (미배포)"
  return `<span class="proj-detail-pill proj-detail-pill--${p.status === "pre" ? "draft" : p.status === "deploying" ? "progress" : p.status === "failed" ? "failed" : "live"}">${st.label}</span>
    <span class="proj-detail-pill proj-detail-pill--version">${escapeHtml(ver)}</span>`
}

function getProjectDetailMainBlock(p: DemoProject): string {
  if (p.status === "pre") {
    return `<div class="proj-detail-empty proj-detail-empty--rich" role="status">
      <div class="proj-detail-empty__visual" aria-hidden="true">
        <div class="proj-detail-empty__orb"></div>
        <span class="proj-detail-spark proj-detail-spark--1"></span>
        <span class="proj-detail-spark proj-detail-spark--2"></span>
        <span class="proj-detail-spark proj-detail-spark--3"></span>
      </div>
      <div class="proj-detail-empty__copy">
        <p class="proj-detail-empty__title">아직 배포되지 않은 프로젝트입니다</p>
        <p class="proj-detail-empty__sub">AI 에이전트와 대화하며 페이지를 만들고, 한 번에 배포까지 이어가 보세요.</p>
      </div>
      <ol class="proj-detail-steps" aria-label="시작하기">
        <li class="proj-detail-steps__item">
          <span class="proj-detail-steps__n">1</span>
          <span class="proj-detail-steps__text"><strong>Open AI Agent</strong>로 브랜드와 톤을 설명</span>
        </li>
        <li class="proj-detail-steps__item">
          <span class="proj-detail-steps__n">2</span>
          <span class="proj-detail-steps__text">생성된 초안을 대화로 다듬기</span>
        </li>
        <li class="proj-detail-steps__item">
          <span class="proj-detail-steps__n">3</span>
          <span class="proj-detail-steps__text">검수 후 배포 · 도메인 연결</span>
        </li>
      </ol>
    </div>`
  }
  if (p.status === "deploying") {
    return `<div class="proj-detail-empty proj-detail-empty--deploy" role="status">
      <div class="proj-detail-empty__visual proj-detail-empty__visual--sm" aria-hidden="true">
        <div class="proj-detail-empty__orb proj-detail-empty__orb--pulse"></div>
        <span class="proj-detail-spark proj-detail-spark--2"></span>
      </div>
      <div class="proj-detail-empty__copy">
        <p class="proj-detail-empty__title">배포가 진행 중입니다</p>
        <p class="proj-detail-empty__sub">잠시 후 다시 확인해 주세요. 완료되면 미리보기 URL이 여기 표시됩니다.</p>
      </div>
    </div>`
  }
  if (p.status === "failed") {
    const err = escapeHtml(p.subtitle)
    return `<div class="proj-detail-failed" role="alert">
      <p class="proj-detail-failed__title">빌드에 실패했습니다</p>
      <p class="proj-detail-failed__msg">${err}</p>
      <p class="proj-detail-failed__hint">Open AI Agent에서 원인 설명과 수정 제안을 요청한 뒤, 미리보기를 다시 받을 수 있습니다.</p>
    </div>`
  }
  return `<div class="proj-detail-workspace-hint">
      <p><strong>라이브 URL</strong>은 위 개요에서 확인하세요. 실제 코드 빌드 미리보기·승인·배포는 AI 에이전트 작업 화면에서 이어집니다.</p>
    </div>`
}

function demoCommitHash(slug: string): string {
  let h = 2166136261
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0).toString(16).slice(0, 7)
}

function getRecentMergeRows(p: DemoProject): string {
  const rows: { sum: string; when: string; deployed: boolean }[] = []
  if (p.status === "done") {
    rows.push({
      sum: "히어로 카피·메타 태그 반영",
      when: p.updated,
      deployed: true,
    })
    rows.push({
      sum: "문의 CTA 섹션 추가",
      when: "2일 전",
      deployed: true,
    })
    rows.push({ sum: "스타일 토큰 정리", when: "1주 전", deployed: false })
  } else if (p.status === "deploying") {
    rows.push({
      sum: "프리뷰 브랜치 빌드 성공",
      when: "10분 전",
      deployed: false,
    })
    rows.push({
      sum: "배포 승인 대기 (main merge 전)",
      when: "방금",
      deployed: false,
    })
    rows.push({
      sum: "DNS 레코드 안내 발송",
      when: "1시간 전",
      deployed: false,
    })
  } else if (p.status === "failed") {
    rows.push({
      sum: "npm ci 단계에서 종료",
      when: p.updated,
      deployed: false,
    })
    rows.push({
      sum: "이전 성공 빌드: v" + Math.max(0, p.deployVersion - 1),
      when: "3일 전",
      deployed: true,
    })
    rows.push({
      sum: "preview 브랜치 커밋 적재",
      when: "같은 세션",
      deployed: false,
    })
  } else {
    rows.push({
      sum: "프로젝트 생성 및 템플릿 연결",
      when: p.updated,
      deployed: false,
    })
    rows.push({
      sum: "아직 승인된 merge 없음",
      when: "—",
      deployed: false,
    })
    rows.push({
      sum: "다음: 초안 생성 후 미리보기",
      when: "—",
      deployed: false,
    })
  }
  return rows
    .map(
      (r) => `<li class="proj-prd-merge__row">
      <span class="proj-prd-merge__sum">${escapeHtml(r.sum)}</span>
      <span class="proj-prd-merge__when">${escapeHtml(r.when)}</span>
      <span class="proj-prd-merge__tag${r.deployed ? " proj-prd-merge__tag--ok" : ""}">${r.deployed ? "배포됨" : "미배포"}</span>
    </li>`,
    )
    .join("")
}

function getProjectDetailOverviewHTML(p: DemoProject): string {
  const title = escapeHtml(p.slug)
  const badges = getProjectDetailStatusRow(p)
  const live = isProjectLiveUrl(p)
  const url = live ? escapeHtml(p.subtitle) : ""
  const urlRow = live
    ? `<div class="proj-prd-url-row">
        <a class="proj-prd-url" href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>
        <button type="button" class="proj-prd-copy" id="projCopyUrl">복사</button>
      </div>`
    : `<p class="proj-prd-url-empty">라이브 URL은 <strong>라이브</strong> 상태에서만 표시됩니다. GitHub Pages 등 배포 완료 후 확인하세요.</p>`

  const traffic = `<div class="proj-prd-traffic">
      <p class="proj-prd-traffic__label">트래픽 현황</p>
      <p class="proj-prd-traffic__off">GA4 미연동 · 연결하면 방문 요약이 이 영역에 표시됩니다.</p>
    </div>`

  const mergeList = getRecentMergeRows(p)
  const hash = demoCommitHash(p.slug)

  return `<section class="proj-prd-overview" aria-labelledby="proj-prd-overview-title">
      <h1 id="proj-prd-overview-title" class="proj-prd-overview__title">${title}</h1>
      <div class="proj-prd-overview__badges">${badges}</div>
      <div class="proj-prd-overview__block">
        <h2 class="proj-prd-overview__h">현재 URL</h2>
        ${urlRow}
      </div>
      <div class="proj-prd-overview__grid">
        <div class="proj-prd-overview__block">
          <h2 class="proj-prd-overview__h">최근 반영 이력</h2>
          <ol class="proj-prd-merge">${mergeList}</ol>
        </div>
        <div class="proj-prd-overview__block">
          <h2 class="proj-prd-overview__h">가장 최근 커밋 (preview)</h2>
          <p class="proj-prd-commit"><code>${escapeHtml(hash)}</code> · ${escapeHtml(p.updatedRelative)}에 푸시됨</p>
          <p class="proj-prd-commit__sub">요청별 커밋은 preview 브랜치에 기록됩니다. (PRD FR-12-1)</p>
        </div>
      </div>
      ${traffic}
    </section>`
}

function demoAiCreditsUsed(slug: string): number {
  return 12 + ((slug.length * 17) % 48)
}

function demoAiCreditsLeft(slug: string): number {
  return 180 + ((slug.length * 23) % 420)
}

function getDeployEnvBlock(p: DemoProject): { label: string; detail: string } {
  if (p.status === "pre") {
    return { label: "미배포", detail: "프리뷰만 · AI 에이전트 초안" }
  }
  if (p.status === "deploying") {
    return { label: "스테이징", detail: p.subtitle }
  }
  if (p.status === "failed") {
    return { label: "빌드 실패", detail: "미리보기 재시도 전" }
  }
  return { label: "프로덕션", detail: "CDN · SSL · 자동 빌드" }
}

function getTimelineEntries(p: DemoProject): {
  msg: string
  meta: string
  tone: "violet" | "slate" | "green" | "amber"
}[] {
  const u = escapeHtml(p.updated)
  const kindLine = p.kind === "landing" ? "히어로·기능 소개 섹션 자동 배치" : p.kind === "portfolio" ? "갤러리 그리드·프로필 블록 생성" : "네비·가격표 레이아웃 적용"
  const common: {
    msg: string
    meta: string
    tone: "violet" | "slate" | "green" | "amber"
  }[] = [
    { msg: "프로젝트 설정 저장됨", meta: u, tone: "slate" },
    { msg: kindLine, meta: "AI 생성", tone: "violet" },
    { msg: "프롬프트로 카피 2회 수정", meta: "대화 기록", tone: "violet" },
  ]
  if (p.status === "pre") {
    return [
      { msg: "워크스페이스에 프로젝트 생성", meta: u, tone: "slate" },
      ...common.slice(1, 3),
      {
        msg: "배포 파이프라인 대기 중",
        meta: "다음: Open AI Agent",
        tone: "amber",
      },
    ]
  }
  if (p.status === "deploying") {
    return [...common, { msg: "프로덕션 빌드 큐 등록", meta: "진행 중", tone: "amber" }, { msg: p.subtitle, meta: "배포", tone: "amber" }]
  }
  if (p.status === "failed") {
    return [
      ...common.slice(0, 2),
      { msg: p.subtitle, meta: "빌드 로그", tone: "amber" },
      {
        msg: "수정 제안: 의존성 버전 고정 후 재빌드",
        meta: "AI 제안",
        tone: "violet",
      },
    ]
  }
  return [...common, { msg: "프로덕션 배포 성공", meta: "라이브", tone: "green" }, { msg: "엣지 캐시 워밍 완료", meta: "CDN", tone: "green" }]
}

function getNextActionsHTML(p: DemoProject): string {
  if (p.status === "pre") {
    return `<ul class="proj-detail-checklist">
        <li class="proj-detail-checklist__row"><span class="proj-detail-check proj-detail-check--todo" aria-hidden="true"></span><span>브랜드 톤·타깃을 AI에 설명하고 초안 생성</span></li>
        <li class="proj-detail-checklist__row"><span class="proj-detail-check proj-detail-check--todo" aria-hidden="true"></span><span>모바일·데스크톱 프리뷰로 레이아웃 확인</span></li>
        <li class="proj-detail-checklist__row"><span class="proj-detail-check proj-detail-check--todo" aria-hidden="true"></span><span>메타 설명·OG 이미지 채우기</span></li>
        <li class="proj-detail-checklist__row"><span class="proj-detail-check proj-detail-check--todo" aria-hidden="true"></span><span>첫 배포 및 도메인 연결</span></li>
      </ul>`
  }
  if (p.status === "deploying") {
    return `<ul class="proj-detail-checklist">
        <li class="proj-detail-checklist__row"><span class="proj-detail-check proj-detail-check--done" aria-hidden="true"></span><span>빌드 아티팩트 업로드</span></li>
        <li class="proj-detail-checklist__row"><span class="proj-detail-check proj-detail-check--run" aria-hidden="true"></span><span>DNS·SSL 전파 대기</span></li>
        <li class="proj-detail-checklist__row"><span class="proj-detail-check proj-detail-check--todo" aria-hidden="true"></span><span>배포 완료 후 스모크 테스트</span></li>
      </ul>`
  }
  if (p.status === "failed") {
    return `<ul class="proj-detail-checklist">
        <li class="proj-detail-checklist__row"><span class="proj-detail-check proj-detail-check--todo" aria-hidden="true"></span><span>오류 로그 확인 후 AI에 재빌드 요청</span></li>
        <li class="proj-detail-checklist__row"><span class="proj-detail-check proj-detail-check--todo" aria-hidden="true"></span><span>제안된 수정안 승인 → 미리보기 재검증</span></li>
        <li class="proj-detail-checklist__row"><span class="proj-detail-check proj-detail-check--todo" aria-hidden="true"></span><span>성공 시 변경 반영 승인 → 배포 단계</span></li>
      </ul>`
  }
  return `<ul class="proj-detail-checklist">
        <li class="proj-detail-checklist__row"><span class="proj-detail-check proj-detail-check--done" aria-hidden="true"></span><span>프로덕션 URL 라이브</span></li>
        <li class="proj-detail-checklist__row"><span class="proj-detail-check proj-detail-check--todo" aria-hidden="true"></span><span>분석 스크립트·전환 목표 연결</span></li>
        <li class="proj-detail-checklist__row"><span class="proj-detail-check proj-detail-check--todo" aria-hidden="true"></span><span>다음 분기용 A/B 카피 실험</span></li>
      </ul>`
}

function getProjectDetailExtrasHTML(p: DemoProject): string {
  const env = getDeployEnvBlock(p)
  const used = demoAiCreditsUsed(p.slug)
  const left = demoAiCreditsLeft(p.slug)
  const total = used + left
  const pct = Math.round((used / total) * 100)
  const timeline = getTimelineEntries(p)
  const timelineHtml = timeline
    .map(
      (e) => `<li class="proj-detail-timeline__item proj-detail-timeline__item--${e.tone}">
      <span class="proj-detail-timeline__dot" aria-hidden="true"></span>
      <div class="proj-detail-timeline__body">
        <p class="proj-detail-timeline__msg">${escapeHtml(e.msg)}</p>
        <p class="proj-detail-timeline__meta">${escapeHtml(e.meta)}</p>
      </div>
    </li>`,
    )
    .join("")
  const slugShort = escapeHtml(p.slug.slice(0, 18) + (p.slug.length > 18 ? "…" : ""))
  const next = getNextActionsHTML(p)

  return `
          <div class="proj-detail-extra" aria-label="프로젝트 부가 정보">
            <div class="proj-detail-stats">
              <div class="proj-detail-stat">
                <p class="proj-detail-stat__label">마지막 활동</p>
                <p class="proj-detail-stat__value">${escapeHtml(p.updated)}</p>
                <p class="proj-detail-stat__hint">에디터 · AI 세션 기준</p>
              </div>
              <div class="proj-detail-stat">
                <p class="proj-detail-stat__label">배포 환경</p>
                <p class="proj-detail-stat__value">${escapeHtml(env.label)}</p>
                <p class="proj-detail-stat__hint">${escapeHtml(env.detail)}</p>
              </div>
              <div class="proj-detail-stat">
                <p class="proj-detail-stat__label">이번 달 AI 사용</p>
                <p class="proj-detail-stat__value">${used}회 <span class="proj-detail-stat__sub">/ 잔여 ${left}</span></p>
                <div class="proj-detail-meter" role="presentation" aria-hidden="true">
                  <div class="proj-detail-meter__fill" style="width:${pct}%"></div>
                </div>
              </div>
            </div>

            <div class="proj-detail-extra__grid">
              <section class="proj-detail-panel" aria-labelledby="proj-timeline-heading">
                <h2 id="proj-timeline-heading" class="proj-detail-panel__head">활동 타임라인</h2>
                <ul class="proj-detail-timeline">${timelineHtml}</ul>
              </section>
              <div class="proj-detail-extra__col">
                <section class="proj-detail-panel" aria-labelledby="proj-next-heading">
                  <h2 id="proj-next-heading" class="proj-detail-panel__head">다음 할 일</h2>
                  ${next}
                </section>
                <section class="proj-detail-panel" aria-labelledby="proj-res-heading">
                  <h2 id="proj-res-heading" class="proj-detail-panel__head">연결된 리소스</h2>
                  <p class="proj-detail-panel__sub">기획·디자인 링크를 팀과 공유해 두면 AI 맥락에 반영하기 쉬워요.</p>
                  <div class="proj-detail-resources">
                    <button type="button" class="proj-detail-resource">Figma · ${slugShort}</button>
                    <button type="button" class="proj-detail-resource">Notion 브리프</button>
                    <button type="button" class="proj-detail-resource">GitHub 저장소</button>
                  </div>
                </section>
              </div>
            </div>
          </div>`
}

function getProjectDetailInnerHTML(p: DemoProject): string {
  const overview = getProjectDetailOverviewHTML(p)
  const main = getProjectDetailMainBlock(p)
  const extras = getProjectDetailExtrasHTML(p)
  return `
      <div class="proj-detail-page">
        <div class="proj-detail">
          <a class="proj-detail-back" href="${HASH_PROJECTS}">
            <span class="proj-detail-back__arrow" aria-hidden="true"></span>
            프로젝트 목록으로 돌아가기
          </a>

          ${overview}

          <div class="proj-detail-toolbar">
            <button type="button" class="proj-detail-agent" id="projOpenAgent">
              <span class="proj-detail-agent__shine" aria-hidden="true"></span>
              <span class="proj-detail-agent__inner">
                <span class="proj-detail-agent__play" aria-hidden="true"></span>
                Open AI Agent
              </span>
            </button>
            <button type="button" class="proj-detail-settings" id="projSettings" disabled>
              프로젝트 설정
            </button>
          </div>
          <p class="proj-detail-settings__hint">프로젝트 설정은 MVP 이후 폼·체크박스 기반으로 확장 예정입니다. (PRD FR-14-2)</p>

          <section class="proj-detail-card" aria-labelledby="proj-work-title">
            <div class="proj-detail-card__accent" aria-hidden="true"></div>
            <h2 id="proj-work-title" class="proj-detail-card__section-title">작업 요약</h2>
            <div class="proj-detail-card__body proj-detail-card__body--flush">
              ${main}
            </div>
          </section>

          ${extras}

          <section class="proj-detail-danger" aria-labelledby="proj-detail-danger-title">
            <div class="proj-detail-danger__inner">
              <div class="proj-detail-danger__copy">
                <h2 id="proj-detail-danger-title" class="proj-detail-danger__title">프로젝트 제거</h2>
                <p class="proj-detail-danger__desc">목록에서만 제거됩니다. 대화 세션은 휴지통으로 이동하며, GitHub 레포는 삭제되지 않습니다.</p>
              </div>
              <button type="button" class="proj-detail-danger__btn" id="projRemoveOpen">
                <span class="proj-detail-danger__trash" aria-hidden="true"></span>
                워크스페이스에서 제거
              </button>
            </div>
          </section>
        </div>

        <div id="projRemoveModal" class="proj-modal" hidden>
          <div class="proj-modal__backdrop" id="projRemoveBackdrop"></div>
          <div class="proj-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="projRemoveModalTitle">
            <h2 id="projRemoveModalTitle" class="proj-modal__title">워크스페이스에서 제거할까요?</h2>
            <p class="proj-modal__body">프로젝트 목록에서만 삭제되고, 실제 GitHub 레포는 삭제되지 않습니다. 연결된 대화 세션은 휴지통으로 옮겨집니다.</p>
            <div class="proj-modal__actions">
              <button type="button" class="app-btn app-btn--ghost" id="projRemoveCancel">취소</button>
              <button type="button" class="proj-modal__confirm" id="projRemoveConfirm">워크스페이스에서 제거</button>
            </div>
          </div>
        </div>
      </div>`
}

function getProjectNotFoundInnerHTML(): string {
  return `
      <div class="proj-detail-page">
        <div class="proj-detail">
          <a class="proj-detail-back" href="${HASH_PROJECTS}">
            <span class="proj-detail-back__arrow" aria-hidden="true"></span>
            프로젝트 목록으로 돌아가기
          </a>
          <section class="proj-detail-card">
            <div class="proj-detail-card__accent" aria-hidden="true"></div>
            <h1 class="proj-detail-card__title">프로젝트를 찾을 수 없습니다</h1>
            <p class="proj-detail-muted">주소가 잘못되었거나 삭제된 프로젝트일 수 있습니다.</p>
          </section>
        </div>
      </div>`
}

/** 에이전트 미리보기 iframe — 구축 중 화면(흰 배경 · 라인 일러스트) */
function getAgentWorkspacePreviewIframeHTML(): string {
  const doc = `<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Preview</title><style>
*{box-sizing:border-box}
body{margin:0;min-height:100%;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#fff;color:#111827;}
main{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2.5rem 1.25rem 2rem;text-align:center;}
.art{display:block;margin:0 auto 1.75rem;color:#cbd5e1}
h1{font-size:clamp(1rem,2.5vw,1.2rem);font-weight:700;margin:0 0 .65rem;letter-spacing:-.02em;line-height:1.45;color:#111827;}
p{margin:0 auto;max-width:22rem;font-size:.8125rem;line-height:1.65;color:#6b7280;}
footer{margin-top:2.35rem;font-size:.75rem;color:#9ca3af;letter-spacing:.02em}
footer strong{color:#374151;font-weight:600}
</style></head><body><main>
<svg class="art" width="132" height="108" viewBox="0 0 132 108" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<rect x="6" y="10" width="120" height="88" rx="8" stroke="currentColor" stroke-width="1.75"/>
<path d="M6 26h120" stroke="currentColor" stroke-width="1.5"/>
<circle cx="18" cy="18" r="2.25" fill="currentColor" opacity=".35"/>
<circle cx="28" cy="18" r="2.25" fill="currentColor" opacity=".35"/>
<circle cx="38" cy="18" r="2.25" fill="currentColor" opacity=".35"/>
<rect x="22" y="40" width="88" height="9" rx="2" stroke="currentColor" stroke-width="1.25" fill="none" opacity=".55"/>
<rect x="22" y="56" width="60" height="9" rx="2" stroke="currentColor" stroke-width="1.25" fill="none" opacity=".4"/>
<rect x="22" y="72" width="76" height="9" rx="2" stroke="currentColor" stroke-width="1.25" fill="none" opacity=".35"/>
</svg>
<h1>Devely가 사이트를 구축 중입니다. 잠시 기다려 주세요!</h1>
<p>앱을 다운로드하면 준비가 완료될 때 알림을 받을 수 있어요.</p>
<footer>from <strong>Devely</strong></footer>
</main></body></html>`
  const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(doc)}`
  return `<iframe class="agent-preview__iframe" title="미리보기" src="${escapeHtml(dataUrl)}" sandbox="allow-scripts"></iframe>`
}

function getAgentPreviewDeviceHTML(iframeHtml: string): string {
  const ic = (path: string, label: string) => `<button type="button" class="agent-preview-device__icon" title="${label}" aria-label="${label}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg></button>`
  return `<div class="agent-preview-device">
      <div class="agent-preview-device__bar agent-preview-device__bar--main">
        <div class="agent-preview-device__cluster">
          <span class="agent-preview-device__dots" aria-hidden="true"><span></span><span></span><span></span></span>
          <button type="button" class="agent-preview-device__seg agent-preview-device__seg--on">미리보기</button>
          ${ic('<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>', "코드 보기")}
          ${ic('<path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>', "새로 고침")}
          <span class="agent-preview-device__navpair">
            ${ic('<path d="M15 18l-6-6 6-6"/>', "뒤로")}
            ${ic('<path d="M9 18l6-6-6-6"/>', "앞으로")}
          </span>
        </div>
        <div class="agent-preview-device__url" title="프리뷰 (데모)">
          <span class="agent-preview-device__url-home" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></span>
          <span class="agent-preview-device__url-text">/</span>
        </div>
        <div class="agent-preview-device__cluster agent-preview-device__cluster--end">
          ${ic('<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>', "메뉴")}
          ${ic('<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>', "GitHub")}
          <button type="button" class="agent-preview-device__ghost">Share</button>
          <button type="button" class="agent-preview-device__publish">게시 <span aria-hidden="true">↑</span></button>
        </div>
      </div>
      <div class="agent-preview-device__bar agent-preview-device__bar--sub">
        <div class="agent-preview-device__cluster">
          ${ic('<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/>', "데스크톱")}
          ${ic('<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>', "모바일")}
        </div>
        <div class="agent-preview-device__cluster agent-preview-device__cluster--end">
          <button type="button" class="agent-preview-device__ghost">편집</button>
          ${ic('<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>', "전체 화면")}
        </div>
      </div>
      <div class="agent-preview-device__viewport">
        ${iframeHtml}
      </div>
    </div>`
}

interface AgentCodeFileEntry {
  path: string
  diff: string
}

function buildAgentCodeFileMap(slug: string): Record<string, AgentCodeFileEntry> {
  return {
    index: {
      path: `sites/${slug}/index.html`,
      diff: ['-    <section class="hero">', "-      <h1>이전 헤드라인</h1>", "-      <p>이전 설명 문구</p>", '+    <section class="hero hero--biz">', "+      <h1>비즈니스를 위한 완벽한 공간</h1>", "+      <p>자연어로 요청한 수정사항이 실시간으로 여기에 반영됩니다.</p>"].join("\n"),
    },
    layout: {
      path: `sites/${slug}/layout.tsx`,
      diff: ["- export default function Root(props: { children: unknown }) {", '-   return <html lang="ko">{props.children}</html>', "+ export default function Root(props: { children: unknown }) {", '+   return <html lang="ko" className="scroll-smooth">{props.children}</html>'].join("\n"),
    },
    globals: {
      path: "styles/globals.css",
      diff: ["-  --brand: #6366f1;", "-  --surface: #f8fafc;", "+  --brand: #2563eb;", "+  --surface: #f1f5f9;", "+  --radius-card: 12px;"].join("\n"),
    },
    meta: {
      path: "public/og-meta.json",
      diff: ['-  "title": "Draft page",', '-  "description": "",', '+  "title": "' + slug + ' · preview",', '+  "description": "AI 생성 데모 메타"'].join("\n"),
    },
  }
}

function agentDiffToHtml(diff: string): string {
  return diff
    .split("\n")
    .map((line) => {
      if (line.startsWith("+")) {
        return `<span class="agent-diff__line agent-diff__line--add">${escapeHtml(line)}</span>`
      }
      if (line.startsWith("-")) {
        return `<span class="agent-diff__line agent-diff__line--del">${escapeHtml(line)}</span>`
      }
      return `<span class="agent-diff__line agent-diff__line--ctx">${escapeHtml(line)}</span>`
    })
    .join("")
}

const AGENT_TREE_SVG_FOLDER = '<span class="agent-tree__icon agent-tree__icon--folder" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"><path d="M3 7a2 2 0 012-2h4l2 2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/></svg></span>'

const AGENT_TREE_SVG_FILE = '<span class="agent-tree__icon agent-tree__icon--file" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/></svg></span>'

function getAgentCodeTreeFoldersHTML(slugLabel: string): string {
  return `<ul class="agent-tree" role="tree">
      <li class="agent-tree__node" role="treeitem" aria-expanded="true">
        <div class="agent-tree__row agent-tree__row--folder">
          ${AGENT_TREE_SVG_FOLDER}
          <span class="agent-tree__label">sites</span>
          <span class="agent-tree__badge">3</span>
        </div>
        <ul class="agent-tree__subs" role="group">
          <li class="agent-tree__node" role="treeitem" aria-expanded="true">
            <div class="agent-tree__row agent-tree__row--folder">
              ${AGENT_TREE_SVG_FOLDER}
              <span class="agent-tree__label">${slugLabel}</span>
              <span class="agent-tree__badge">2</span>
            </div>
            <ul class="agent-tree__subs" role="group">
              <li role="none">
                <button type="button" class="agent-tree__row agent-tree__row--file agent-tree__row--active" data-agent-file="index" role="treeitem">
                  ${AGENT_TREE_SVG_FILE}
                  <span class="agent-tree__label">index.html</span>
                  <span class="agent-tree__badge">2</span>
                </button>
              </li>
              <li role="none">
                <button type="button" class="agent-tree__row agent-tree__row--file" data-agent-file="layout" role="treeitem">
                  ${AGENT_TREE_SVG_FILE}
                  <span class="agent-tree__label">layout.tsx</span>
                  <span class="agent-tree__badge">1</span>
                </button>
              </li>
            </ul>
          </li>
        </ul>
      </li>
      <li class="agent-tree__node" role="treeitem" aria-expanded="true">
        <div class="agent-tree__row agent-tree__row--folder">
          ${AGENT_TREE_SVG_FOLDER}
          <span class="agent-tree__label">styles</span>
          <span class="agent-tree__badge">1</span>
        </div>
        <ul class="agent-tree__subs" role="group">
          <li role="none">
            <button type="button" class="agent-tree__row agent-tree__row--file" data-agent-file="globals" role="treeitem">
              ${AGENT_TREE_SVG_FILE}
              <span class="agent-tree__label">globals.css</span>
              <span class="agent-tree__badge">1</span>
            </button>
          </li>
        </ul>
      </li>
      <li class="agent-tree__node" role="treeitem" aria-expanded="true">
        <div class="agent-tree__row agent-tree__row--folder">
          ${AGENT_TREE_SVG_FOLDER}
          <span class="agent-tree__label">public</span>
          <span class="agent-tree__badge">1</span>
        </div>
        <ul class="agent-tree__subs" role="group">
          <li role="none">
            <button type="button" class="agent-tree__row agent-tree__row--file" data-agent-file="meta" role="treeitem">
              ${AGENT_TREE_SVG_FILE}
              <span class="agent-tree__label">og-meta.json</span>
              <span class="agent-tree__badge">1</span>
            </button>
          </li>
        </ul>
      </li>
    </ul>`
}

function getAgentCodeTreeTagsHTML(): string {
  return `<div class="agent-tree-tags">
      <p class="agent-tree-tags__hint">태그로 묶인 변경 파일입니다. 항목을 누르면 같은 diff가 열립니다. (데모)</p>
      <ul class="agent-tree-tags__list">
        <li>
          <button type="button" class="agent-tree-tag agent-tree-tag--active" data-agent-file="index">
            <span class="agent-tree-tag__text">페이지 · 히어로</span>
            <span class="agent-tree-tag__badge">2</span>
          </button>
        </li>
        <li>
          <button type="button" class="agent-tree-tag" data-agent-file="layout">
            <span class="agent-tree-tag__text">레이아웃 / 루트</span>
            <span class="agent-tree-tag__badge">1</span>
          </button>
        </li>
        <li>
          <button type="button" class="agent-tree-tag" data-agent-file="globals">
            <span class="agent-tree-tag__text">디자인 토큰</span>
            <span class="agent-tree-tag__badge">1</span>
          </button>
        </li>
        <li>
          <button type="button" class="agent-tree-tag" data-agent-file="meta">
            <span class="agent-tree-tag__text">SEO · 메타</span>
            <span class="agent-tree-tag__badge">1</span>
          </button>
        </li>
      </ul>
    </div>`
}

function getAgentCodeWorkspaceHTML(p: DemoProject): string {
  const map = buildAgentCodeFileMap(p.slug)
  const first = map.index
  const slugEsc = escapeHtml(p.slug)
  const foldersTree = getAgentCodeTreeFoldersHTML(slugEsc)
  const tagsPane = getAgentCodeTreeTagsHTML()
  return `<div class="agent-code-workspace">
      <aside class="agent-tree-panel" aria-label="코드 탐색">
        <div class="agent-tree-tabs" role="tablist" aria-label="탐색기 모드">
          <button type="button" class="agent-tree-tabs__btn agent-tree-tabs__btn--active" role="tab" aria-selected="true" id="agentCodeTreeTabFolders" data-agent-code-tree-tab="folders">Folders</button>
          <button type="button" class="agent-tree-tabs__btn" role="tab" aria-selected="false" id="agentCodeTreeTabTags" data-agent-code-tree-tab="tags">Tags</button>
        </div>
        <div class="agent-tree-panel__body">
          <div class="agent-tree-panel__pane" role="tabpanel" aria-labelledby="agentCodeTreeTabFolders" data-agent-code-tree-pane="folders" id="agentCodeTreePaneFolders">
            ${foldersTree}
          </div>
          <div class="agent-tree-panel__pane" role="tabpanel" aria-labelledby="agentCodeTreeTabTags" data-agent-code-tree-pane="tags" id="agentCodeTreePaneTags" hidden>
            ${tagsPane}
          </div>
        </div>
      </aside>
      <div class="agent-code-viewer">
        <p class="agent-code-panel__meta" id="agentCodeFileMeta"><code>${escapeHtml(first.path)}</code><span> · 데모 diff</span></p>
        <div class="agent-code-panel__diff" id="agentCodeDiffBody" tabindex="0">${agentDiffToHtml(first.diff)}</div>
      </div>
    </div>`
}

type AgentPipelineStepState = "done" | "running" | "pending" | "failed" | "skipped"

interface AgentPipelineStep {
  title: string
  detail: string
  state: AgentPipelineStepState
}

function getAgentPipelineSteps(p: DemoProject): AgentPipelineStep[] {
  const ver = p.deployVersion > 0 ? `아티팩트 v${p.deployVersion}` : "아티팩트 없음"
  if (p.status === "done") {
    return [
      { title: "Lint · 타입체크", detail: "통과 · ~14s", state: "done" },
      { title: "의존성 설치 · 빌드", detail: `성공 · ${ver}`, state: "done" },
      { title: "Preview 배포", detail: "preview 브랜치 반영 완료", state: "done" },
      { title: "승인 · main 병합", detail: "승인됨 · CI 통과", state: "done" },
      { title: "Production 배포", detail: "GitHub Pages · 라이브", state: "done" },
      { title: "배포 후 스모크", detail: "HTTP 200 · 엣지 캐시", state: "done" },
    ]
  }
  if (p.status === "deploying") {
    return [
      { title: "Lint · 타입체크", detail: "통과", state: "done" },
      { title: "의존성 설치 · 빌드", detail: "성공", state: "done" },
      { title: "Preview 배포", detail: "진행 중 · DNS·SSL 전파", state: "running" },
      { title: "승인 · main 병합", detail: "대기 중", state: "pending" },
      { title: "Production 배포", detail: "대기 중", state: "pending" },
      { title: "배포 후 스모크", detail: "—", state: "pending" },
    ]
  }
  if (p.status === "failed") {
    const err = p.subtitle.trim() || "빌드 단계에서 종료"
    return [
      { title: "Lint · 타입체크", detail: "통과", state: "done" },
      { title: "의존성 설치 · 빌드", detail: err, state: "failed" },
      { title: "Preview 배포", detail: "스킵", state: "skipped" },
      { title: "승인 · main 병합", detail: "—", state: "skipped" },
      { title: "Production 배포", detail: "—", state: "skipped" },
      { title: "배포 후 스모크", detail: "—", state: "skipped" },
    ]
  }
  return [
    { title: "Lint · 타입체크", detail: "저장소 훅 연결 후 실행", state: "pending" },
    { title: "의존성 설치 · 빌드", detail: "첫 유효 커밋 필요", state: "pending" },
    { title: "Preview 배포", detail: "—", state: "pending" },
    { title: "승인 · main 병합", detail: "—", state: "pending" },
    { title: "Production 배포", detail: "—", state: "pending" },
    { title: "배포 후 스모크", detail: "—", state: "pending" },
  ]
}

function getAgentPipelineSectionHTML(p: DemoProject): string {
  const steps = getAgentPipelineSteps(p)
  const rows = steps
    .map(
      (s) => `<li class="agent-pipeline__step agent-pipeline__step--${s.state}">
      <div class="agent-pipeline__track">
        <span class="agent-pipeline__mark"></span>
      </div>
      <div class="agent-pipeline__step-body">
        <span class="agent-pipeline__step-title">${escapeHtml(s.title)}</span>
        <span class="agent-pipeline__step-detail">${escapeHtml(s.detail)}</span>
      </div>
    </li>`,
    )
    .join("")
  const runLabel = p.status === "done" ? `최근 실행 · 성공 (${escapeHtml(p.updated)})` : p.status === "deploying" ? "실행 중 · Preview 배포 단계" : p.status === "failed" ? "최근 실행 · 실패 (로그 확인)" : "파이프라인 대기 중"
  return `<section class="agent-pipeline agent-pipeline--embed" aria-labelledby="agent-pipeline-title">
      <div class="agent-pipeline__head">
        <div class="agent-pipeline__head-text">
          <h2 id="agent-pipeline-title" class="agent-pipeline__title">코드 배포 파이프라인</h2>
          <p class="agent-pipeline__run">${runLabel}</p>
        </div>
        <button type="button" class="agent-pipeline__log-btn" id="agentPipelineLog">워크플로 로그</button>
      </div>
      <ol class="agent-pipeline__steps">${rows}</ol>
      <p class="agent-pipeline__hint">CI(GitHub Actions 등)와 연동하면 동일한 단계가 자동으로 갱신됩니다. 지금은 프로젝트 상태 기준 데모입니다.</p>
    </section>`
}

function getProjectAgentInnerHTML(p: DemoProject, activeTab: AgentWorkspaceTab): string {
  const slugSafe = escapeHtml(p.slug)
  const backHref = getProjectHash(p.slug)
  const previewIframe = getAgentWorkspacePreviewIframeHTML()
  const previewDevice = getAgentPreviewDeviceHTML(previewIframe)
  const codePanel = getAgentCodeWorkspaceHTML(p)
  const pipeline = getAgentPipelineSectionHTML(p)
  const liveExtra = isProjectLiveUrl(p) ? `<p class="agent-live-link"><a href="${escapeHtml(p.subtitle.trim())}" target="_blank" rel="noopener noreferrer">실제 라이브 URL 열기 ↗</a></p>` : ""
  const onPreview = activeTab === "preview"
  const onCode = activeTab === "code"
  const onPipeline = activeTab === "pipeline"

  const railSvg = (inner: string) => `<svg class="agent-rail__svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`

  return `
      <div class="agent-page">
        <div class="agent-shell">
          <nav class="agent-rail" aria-label="작업 영역">
            <a class="agent-rail__link" href="${backHref}" title="프로젝트로 나가기" aria-label="프로젝트로 나가기">
              ${railSvg('<path d="M19 12H5M12 19l-7-7 7-7"/>')}
            </a>
            <div class="agent-rail__stack" role="tablist" aria-label="미리보기 · 코드 · 파이프라인">
              <button type="button" class="agent-rail__btn${onPreview ? " agent-rail__btn--active" : ""}" role="tab" aria-selected="${onPreview}" aria-controls="agentPanelPreview" id="agentTabPreview" data-agent-tab="preview" title="미리보기">
                ${railSvg('<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/>')}
              </button>
              <button type="button" class="agent-rail__btn${onCode ? " agent-rail__btn--active" : ""}" role="tab" aria-selected="${onCode}" aria-controls="agentPanelCode" id="agentTabCode" data-agent-tab="code" title="Code (Diff)">
                ${railSvg('<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>')}
              </button>
              <button type="button" class="agent-rail__btn${onPipeline ? " agent-rail__btn--active" : ""}" role="tab" aria-selected="${onPipeline}" aria-controls="agentPanelPipeline" id="agentTabPipeline" data-agent-tab="pipeline" title="Pipeline">
                ${railSvg('<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>')}
              </button>
              <button type="button" class="agent-rail__btn" id="agentRailFocusChat" title="메시지 입력으로 이동" aria-label="메시지 입력으로 이동">
                ${railSvg('<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>')}
              </button>
              <a class="agent-rail__link" href="${backHref}" title="프로젝트 개요" aria-label="프로젝트 개요">
                ${railSvg('<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>')}
              </a>
            </div>
            <div class="agent-rail__bottom">
              <a class="agent-rail__link" href="${HASH_DASHBOARD}" title="작업" aria-label="작업">
                ${railSvg('<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>')}
              </a>
              <button type="button" class="agent-rail__btn" id="agentRailHelpBtn" title="도움말" aria-label="도움말">
                ${railSvg('<circle cx="12" cy="12" r="3"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>')}
              </button>
            </div>
          </nav>

          <aside class="agent-sidebar" aria-label="SYS.AI Agent">
            <header class="agent-sidebar__head">
              <h2 class="agent-sidebar__title">SYS.AI Agent</h2>
              <button type="button" class="agent-sidebar__help" id="agentHelpBtn">도움말 보기</button>
            </header>
            <div id="agentChatThread" class="agent-sidebar__thread">
              <div class="agent-bubble agent-bubble--ai">
                <div class="agent-bubble__body">안녕하세요! <strong>${slugSafe}</strong> 워크스페이스입니다. 추천 프롬프트를 눌러 보면 수정과 배포가 어떻게 이어지는지 데모로 확인할 수 있어요.</div>
              </div>
            </div>
            <form id="agentChatForm" class="agent-sidebar__composer">
              <div class="agent-suggestions">
                <button type="button" class="agent-suggestion" data-agent-chip="UI 수정 요청: 히어로 섹션을 더 미니멀하게 바꿔 주세요">UI 수정 요청</button>
                <button type="button" class="agent-suggestion" data-agent-chip="도메인 연결과 프로덕션 배포 일정을 알려 주세요">도메인 &amp; 배포 요청</button>
              </div>
              <label class="agent-visually-hidden" for="agentChatInput">메시지 입력</label>
              <div class="agent-compose-row">
                <textarea id="agentChatInput" class="agent-compose__input" rows="2" placeholder="직접 입력하거나 위 추천 버튼을 누르세요" autocomplete="off"></textarea>
                <button type="submit" class="agent-compose__send" id="agentChatSend" aria-label="보내기">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                </button>
              </div>
            </form>
          </aside>

          <div class="agent-stage">
            <div class="agent-stage__meta">
              <span class="agent-branch-pill">preview branch</span>
            </div>
            <div class="agent-panels">
              <div class="agent-panel" id="agentPanelPreview" role="tabpanel" aria-labelledby="agentTabPreview" data-agent-panel="preview"${onPreview ? "" : " hidden"}>
                <div class="agent-preview__frame agent-preview__frame--panel">
                  ${previewDevice}
                </div>
                ${liveExtra}
              </div>
              <div class="agent-panel" id="agentPanelCode" role="tabpanel" aria-labelledby="agentTabCode" data-agent-panel="code"${onCode ? "" : " hidden"}>
                ${codePanel}
              </div>
              <div class="agent-panel agent-panel--scroll" id="agentPanelPipeline" role="tabpanel" aria-labelledby="agentTabPipeline" data-agent-panel="pipeline"${onPipeline ? "" : " hidden"}>
                <div class="agent-panel__inner">
                  ${pipeline}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>`
}

function bindProjectAgentPage(p: DemoProject): void {
  const form = document.getElementById("agentChatForm")
  const input = document.getElementById("agentChatInput") as HTMLTextAreaElement | null
  const thread = document.getElementById("agentChatThread")
  if (!form || !input || !thread) return

  const codeFileMap = buildAgentCodeFileMap(p.slug)
  const codeMetaEl = document.getElementById("agentCodeFileMeta")
  const codeDiffEl = document.getElementById("agentCodeDiffBody")
  const codePanelEl = document.getElementById("agentPanelCode")

  const showAgentCodeFile = (fileId: string): void => {
    const entry = codeFileMap[fileId]
    if (!entry || !codeMetaEl || !codeDiffEl) return
    codeMetaEl.innerHTML = `<code>${escapeHtml(entry.path)}</code><span> · 데모 diff</span>`
    codeDiffEl.innerHTML = agentDiffToHtml(entry.diff)
    codePanelEl?.querySelectorAll<HTMLElement>(".agent-tree__row--file[data-agent-file]").forEach((row) => {
      row.classList.toggle("agent-tree__row--active", row.dataset.agentFile === fileId)
    })
    codePanelEl?.querySelectorAll<HTMLButtonElement>(".agent-tree-tag[data-agent-file]").forEach((tag) => {
      tag.classList.toggle("agent-tree-tag--active", tag.dataset.agentFile === fileId)
    })
  }

  codePanelEl?.addEventListener("click", (e) => {
    const hit = (e.target as HTMLElement).closest("[data-agent-file]")
    if (hit instanceof HTMLButtonElement) {
      const fid = hit.dataset.agentFile
      if (fid) showAgentCodeFile(fid)
    }
  })

  const treeTabButtons = codePanelEl?.querySelectorAll<HTMLButtonElement>("[data-agent-code-tree-tab]")
  treeTabButtons?.forEach((tab) => {
    tab.addEventListener("click", () => {
      const id = tab.dataset.agentCodeTreeTab
      const root = codePanelEl
      if (!id || !root) return
      root.querySelectorAll<HTMLButtonElement>("[data-agent-code-tree-tab]").forEach((t) => {
        const on = t.dataset.agentCodeTreeTab === id
        t.classList.toggle("agent-tree-tabs__btn--active", on)
        t.setAttribute("aria-selected", String(on))
      })
      root.querySelectorAll<HTMLElement>("[data-agent-code-tree-pane]").forEach((pane) => {
        const on = pane.dataset.agentCodeTreePane === id
        pane.toggleAttribute("hidden", !on)
      })
    })
  })

  const applyAgentWorkspaceTab = (tab: AgentWorkspaceTab): void => {
    document.querySelectorAll<HTMLButtonElement>("[data-agent-tab]").forEach((t) => {
      const on = t.dataset.agentTab === tab
      t.classList.toggle("agent-rail__btn--active", on)
      t.setAttribute("aria-selected", String(on))
    })
    document.querySelectorAll<HTMLElement>("[data-agent-panel]").forEach((panel) => {
      const on = panel.dataset.agentPanel === tab
      panel.toggleAttribute("hidden", !on)
    })
  }

  document.querySelectorAll<HTMLButtonElement>("[data-agent-tab]").forEach((tabBtn) => {
    tabBtn.addEventListener("click", () => {
      const id = tabBtn.dataset.agentTab as AgentWorkspaceTab | undefined
      if (id !== "preview" && id !== "code" && id !== "pipeline") return
      applyAgentWorkspaceTab(id)
      const nextHash = getProjectAgentHash(p.slug, id)
      if (window.location.hash !== nextHash) {
        history.pushState(null, "", nextHash)
      }
    })
  })

  document.querySelectorAll<HTMLButtonElement>(".agent-suggestion").forEach((chip) => {
    chip.addEventListener("click", () => {
      const v = chip.getAttribute("data-agent-chip")
      if (v) {
        input.value = v
        input.focus()
      }
    })
  })

  const showAgentHelp = (): void => {
    window.alert("SYS.AI Agent에서는 자연어로 UI·카피·배포를 요청할 수 있습니다.\n\n미리보기: 생성 페이지 확인\nCode (Diff): 변경 파일 데모\nPipeline: CI/CD 단계 확인\n\n실제 제품에서는 이 화면이 저장소·호스팅과 실시간으로 연동됩니다.")
  }

  document.getElementById("agentHelpBtn")?.addEventListener("click", showAgentHelp)
  document.getElementById("agentRailHelpBtn")?.addEventListener("click", showAgentHelp)

  document.getElementById("agentRailFocusChat")?.addEventListener("click", () => {
    input.focus()
  })

  const demoReply = (userText: string): string => {
    const short = userText.length > 160 ? `${userText.slice(0, 160)}…` : userText
    return `「${short}」 반영해 볼게요. ${p.slug} 기준으로 (1) 미리보기 HTML을 고치고 (2) Code 탭에 diff를 쌓은 뒤 (3) Pipeline에서 빌드·배포 단계로 넘깁니다. 데모라 이 브라우저 안에서만 메시지가 쌓입니다.`
  }

  const appendUser = (text: string): void => {
    const wrap = document.createElement("div")
    wrap.className = "agent-bubble agent-bubble--user"
    wrap.innerHTML = `<div class="agent-bubble__body"></div>`
    wrap.querySelector(".agent-bubble__body")!.textContent = text
    thread.appendChild(wrap)
  }

  const appendAssistant = (text: string): void => {
    const wrap = document.createElement("div")
    wrap.className = "agent-bubble agent-bubble--ai"
    wrap.innerHTML = `<div class="agent-bubble__body"></div>`
    wrap.querySelector(".agent-bubble__body")!.textContent = text
    thread.appendChild(wrap)
  }

  const scrollThread = (): void => {
    thread.scrollTop = thread.scrollHeight
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault()
    const text = input.value.trim()
    if (!text) return
    input.value = ""
    appendUser(text)
    scrollThread()
    window.setTimeout(() => {
      appendAssistant(demoReply(text))
      scrollThread()
    }, 400)
  })

  document.getElementById("agentPipelineLog")?.addEventListener("click", () => {
    const slugLine = `workflow: ${p.slug} · preview-ci.yml (데모)`
    let body: string
    if (p.status === "failed") {
      body = `[00:08] checkout ref=preview\n[00:12] npm ci — 184 packages\n[00:41] npm run build\n[00:42] ✖ ${p.subtitle || "Exit code 1"}\n[00:42] 빌드 단계 실패 · 아티팩트 미생성`
    } else if (p.status === "done") {
      body = `[00:07] checkout\n[00:11] npm ci\n[00:38] npm run build — ok\n[00:39] upload artifact ${p.deployVersion > 0 ? `v${p.deployVersion}` : "build/"}\n[00:55] deploy pages — production\n[00:58] smoke https://… — 200 OK`
    } else if (p.status === "deploying") {
      body = `[00:06] checkout preview\n[00:10] npm ci\n[00:35] npm run build — ok\n[00:36] deploy preview — running\n[00:36] … Waiting for DNS propagation`
    } else {
      body = `[—] 워크플로가 아직 트리거되지 않았습니다.\n[—] 첫 푸시 또는 “Open AI Agent”에서 생성된 커밋이 들어오면 파이프라인이 시작됩니다.`
    }
    window.alert(`${slugLine}\n\n${body}`)
  })
}

function bindProjectListPage(openCreateFromRoute = false): void {
  const zipModal = document.getElementById("projZipModal")
  const zipFile = document.getElementById("projZipFile") as HTMLInputElement | null
  const zipFileName = document.getElementById("projZipFileName")
  const zipDropzone = document.getElementById("projZipDropzone")
  const zipSubmit = document.getElementById("projZipSubmit") as HTMLButtonElement | null
  let projZipPick: File | null = null

  const formatImportBytes = (n: number): string => {
    if (n < 1024) return `${n} B`
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
    return `${(n / (1024 * 1024)).toFixed(1)} MB`
  }

  const isZipFile = (f: File): boolean => f.name.toLowerCase().endsWith(".zip") || f.type === "application/zip" || f.type === "application/x-zip-compressed"

  const setZipPick = (file: File | null): void => {
    projZipPick = file
    if (zipFile && !file) zipFile.value = ""
    if (zipFileName) {
      if (file) {
        zipFileName.textContent = `선택됨: ${file.name} (${formatImportBytes(file.size)})`
        zipFileName.hidden = false
      } else {
        zipFileName.textContent = ""
        zipFileName.hidden = true
      }
    }
    if (zipSubmit) {
      if (file) zipSubmit.removeAttribute("disabled")
      else zipSubmit.setAttribute("disabled", "")
    }
    zipDropzone?.classList.toggle("proj-import-dropzone--has-file", Boolean(file))
  }

  const openProjZipModal = (): void => {
    projZipPick = null
    if (zipFile) zipFile.value = ""
    setZipPick(null)
    if (zipModal) zipModal.hidden = false
  }

  const closeProjZipModal = (): void => {
    if (zipModal) zipModal.hidden = true
    projZipPick = null
    if (zipFile) zipFile.value = ""
    setZipPick(null)
  }

  zipFile?.addEventListener("change", () => {
    const f = zipFile.files?.[0] ?? null
    if (f && !isZipFile(f)) {
      window.alert("ZIP 파일만 선택할 수 있습니다.")
      zipFile.value = ""
      setZipPick(null)
      return
    }
    setZipPick(f)
  })

  zipDropzone?.addEventListener("dragover", (e) => {
    e.preventDefault()
    e.stopPropagation()
    zipDropzone.classList.add("proj-import-dropzone--drag")
  })
  zipDropzone?.addEventListener("dragleave", (e) => {
    e.preventDefault()
    zipDropzone.classList.remove("proj-import-dropzone--drag")
  })
  zipDropzone?.addEventListener("drop", (e) => {
    e.preventDefault()
    e.stopPropagation()
    zipDropzone.classList.remove("proj-import-dropzone--drag")
    const f = e.dataTransfer?.files?.[0]
    if (!f) return
    if (!isZipFile(f)) {
      window.alert("ZIP 파일만 놓을 수 있습니다.")
      return
    }
    setZipPick(f)
    if (zipFile) {
      const dt = new DataTransfer()
      dt.items.add(f)
      zipFile.files = dt.files
    }
  })

  document.getElementById("projBtnZip")?.addEventListener("click", openProjZipModal)
  document.getElementById("projZipBackdrop")?.addEventListener("click", closeProjZipModal)
  document.getElementById("projZipClose")?.addEventListener("click", closeProjZipModal)
  document.getElementById("projZipCancel")?.addEventListener("click", closeProjZipModal)
  document.getElementById("projZipSubmit")?.addEventListener("click", () => {
    if (!projZipPick) return
    window.alert(`「${projZipPick.name}」 분석을 시작합니다. (데모)\n\n실제 제품에서는 업로드 → 트리 분석 → 미리보기 생성까지 서버에서 처리합니다.`)
    closeProjZipModal()
  })

  const ghModal = document.getElementById("projGhModal")
  const ghForm = document.getElementById("projGhForm") as HTMLFormElement | null
  const ghConnect = document.getElementById("projGhConnect")
  const ghConnectBadge = document.getElementById("projGhConnectBadge")

  const resetProjGhModal = (): void => {
    ghForm?.reset()
    const branchEl = document.getElementById("projGhBranch") as HTMLInputElement | null
    if (branchEl) branchEl.value = "main"
    ghConnect?.removeAttribute("hidden")
    ghConnectBadge?.setAttribute("hidden", "")
  }

  const openProjGhModal = (): void => {
    resetProjGhModal()
    if (ghModal) ghModal.hidden = false
  }

  const closeProjGhModal = (): void => {
    if (ghModal) ghModal.hidden = true
    resetProjGhModal()
  }

  document.getElementById("projBtnGh")?.addEventListener("click", openProjGhModal)
  document.getElementById("projGhBackdrop")?.addEventListener("click", closeProjGhModal)
  document.getElementById("projGhClose")?.addEventListener("click", closeProjGhModal)
  document.getElementById("projGhCancel")?.addEventListener("click", closeProjGhModal)
  ghConnect?.addEventListener("click", () => {
    ghConnect.setAttribute("hidden", "")
    ghConnectBadge?.removeAttribute("hidden")
  })
  ghForm?.addEventListener("submit", (e) => {
    e.preventDefault()
    if (!ghForm) return
    const fd = new FormData(ghForm)
    const repo = String(fd.get("repo") ?? "").trim()
    const branch = String(fd.get("branch") ?? "").trim() || "main"
    const path = String(fd.get("path") ?? "").trim()
    try {
      const u = new URL(repo)
      if (!/github\.com$/i.test(u.hostname)) {
        window.alert("github.com 저장소 URL만 지원합니다.")
        return
      }
    } catch {
      window.alert("올바른 저장소 URL을 입력해 주세요.")
      return
    }
    const pathLine = path ? `\n경로: ${path}` : ""
    window.alert(`저장소를 가져옵니다. (데모)\n\n${repo}\n브랜치: ${branch}${pathLine}\n\n실제 제품에서는 OAuth·클론·파이프라인이 이어집니다.`)
    closeProjGhModal()
  })

  const newModal = document.getElementById("projNewModal")
  const newForm = document.getElementById("projNewForm") as HTMLFormElement | null
  const newNameInput = document.getElementById("projNewName") as HTMLInputElement | null
  const landingThemesEl = document.getElementById("projNewLandingThemes")
  const themePreviewStage = document.getElementById("projThemePreviewStage")
  const themePreviewLive = document.getElementById("projThemePreviewLive")
  const projThemeGrid = document.getElementById("projThemeGrid")

  let landingThemePreviewHover: string | null = null

  const landingThemePreviewLiveLabels: Record<string, string> = {
    saas: "SaaS 프로덕트 테마 미리보기",
    local: "로컬 비즈니스 테마 미리보기",
  }

  const refreshLandingThemePreview = (): void => {
    if (!themePreviewStage || !newForm) return
    const checked = newForm.querySelector<HTMLInputElement>('input[name="landingTheme"]:checked')?.value ?? "saas"
    const show = landingThemePreviewHover ?? checked
    themePreviewStage.dataset.activePreview = show
    if (themePreviewLive) {
      themePreviewLive.textContent = landingThemePreviewLiveLabels[show] ?? ""
    }
  }

  const syncProjNewLandingThemes = (): void => {
    const checked = newForm?.querySelector<HTMLInputElement>('input[name="template"]:checked')
    const show = checked?.value === "landing"
    landingThemesEl?.toggleAttribute("hidden", !show)
    if (!show) landingThemePreviewHover = null
    if (show) refreshLandingThemePreview()
  }

  const getTemplateScrollStride = (): number => {
    const first = document.querySelector<HTMLElement>("#projTemplateTrack .proj-template-card")
    if (!first) return 172
    return first.offsetWidth + 12
  }

  const updateTemplateSliderNav = (): void => {
    const vp = document.getElementById("projTemplateViewport")
    const prev = document.getElementById("projTemplatePrev")
    const next = document.getElementById("projTemplateNext")
    if (!vp || !prev || !next) return
    const max = vp.scrollWidth - vp.clientWidth
    const left = vp.scrollLeft
    prev.toggleAttribute("disabled", left <= 1)
    next.toggleAttribute("disabled", max <= 1 || left >= max - 1)
  }

  const scrollTemplateCardIntoView = (smooth: boolean): void => {
    const checked = newForm?.querySelector<HTMLInputElement>('input[name="template"]:checked')
    const card = checked?.closest(".proj-template-card") as HTMLElement | undefined
    if (!card) return
    card.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
      inline: "center",
      block: "nearest",
    })
    window.setTimeout(updateTemplateSliderNav, smooth ? 320 : 40)
  }

  const applyPendingPromptToModal = (): void => {
    const hint = document.getElementById("projNewPromptHint")
    const hintText = document.getElementById("projNewPromptHintText")
    const prompt = readPendingPrompt()
    if (hint && hintText) {
      if (prompt) {
        hintText.textContent = prompt
        hint.hidden = false
      } else {
        hintText.textContent = ""
        hint.hidden = true
      }
    }
    if (prompt && newNameInput && !newNameInput.value) {
      newNameInput.value = suggestProjectSlugFromPrompt(prompt)
    }
  }

  const openNewModal = (): void => {
    if (!newModal || !newForm) return
    landingThemePreviewHover = null
    newModal.hidden = false
    newForm.reset()
    syncProjNewLandingThemes()
    applyPendingPromptToModal()
    window.setTimeout(() => {
      scrollTemplateCardIntoView(false)
      newNameInput?.focus()
      newNameInput?.select()
    }, 30)
  }
  const closeNewModal = (): void => {
    dismissProjectsCreateModal()
  }

  const pushCreateModalHash = (): void => {
    const url = new URL(window.location.href)
    if (url.hash !== HASH_PROJECTS_CREATE) {
      url.hash = HASH_PROJECTS_CREATE
      history.pushState(null, "", url.toString())
    }
  }

  document.getElementById("projBtnNew")?.addEventListener("click", () => {
    pushCreateModalHash()
    openNewModal()
  })
  const dismissCreateModal = (): void => {
    writePendingPrompt("")
    closeNewModal()
  }
  document.getElementById("projNewCancel")?.addEventListener("click", dismissCreateModal)
  document.getElementById("projNewClose")?.addEventListener("click", dismissCreateModal)
  document.getElementById("projNewBackdrop")?.addEventListener("click", dismissCreateModal)
  newForm?.addEventListener("change", (e) => {
    const t = e.target as HTMLElement
    if (t.matches('input[name="template"]')) {
      syncProjNewLandingThemes()
      scrollTemplateCardIntoView(true)
    }
    if (t.matches('input[name="landingTheme"]')) {
      landingThemePreviewHover = null
      refreshLandingThemePreview()
    }
  })

  projThemeGrid?.addEventListener("mouseleave", () => {
    landingThemePreviewHover = null
    refreshLandingThemePreview()
  })
  projThemeGrid?.querySelectorAll(".proj-theme-card").forEach((card) => {
    card.addEventListener("mouseenter", () => {
      const v = card.querySelector<HTMLInputElement>('input[name="landingTheme"]')?.value
      if (v) {
        landingThemePreviewHover = v
        refreshLandingThemePreview()
      }
    })
  })
  projThemeGrid?.addEventListener("focusin", (ev) => {
    const el = ev.target as HTMLElement
    const c = el.closest(".proj-theme-card")
    if (!c) return
    const v = c.querySelector<HTMLInputElement>('input[name="landingTheme"]')?.value
    if (v) {
      landingThemePreviewHover = v
      refreshLandingThemePreview()
    }
  })
  projThemeGrid?.addEventListener("focusout", (ev) => {
    const next = ev.relatedTarget as HTMLElement | null
    if (!projThemeGrid?.contains(next)) {
      landingThemePreviewHover = null
      refreshLandingThemePreview()
    }
  })

  document.getElementById("projTemplatePrev")?.addEventListener("click", () => {
    document.getElementById("projTemplateViewport")?.scrollBy({
      left: -getTemplateScrollStride(),
      behavior: "smooth",
    })
  })
  document.getElementById("projTemplateNext")?.addEventListener("click", () => {
    document.getElementById("projTemplateViewport")?.scrollBy({
      left: getTemplateScrollStride(),
      behavior: "smooth",
    })
  })
  document.getElementById("projTemplateViewport")?.addEventListener("scroll", updateTemplateSliderNav)
  document.getElementById("projTemplateViewport")?.addEventListener("keydown", (e) => {
    const vp = document.getElementById("projTemplateViewport")
    if (!vp) return
    if (e.key === "ArrowLeft") {
      e.preventDefault()
      vp.scrollBy({ left: -getTemplateScrollStride(), behavior: "smooth" })
    } else if (e.key === "ArrowRight") {
      e.preventDefault()
      vp.scrollBy({ left: getTemplateScrollStride(), behavior: "smooth" })
    }
  })
  if (!projTemplateSliderResizeListenerAttached) {
    projTemplateSliderResizeListenerAttached = true
    window.addEventListener("resize", updateTemplateSliderNav)
  }
  newForm?.addEventListener("submit", (e) => {
    e.preventDefault()
    if (!newForm) return
    const fd = new FormData(newForm)
    const name = String(fd.get("name") ?? "").trim()
    const template = String(fd.get("template") ?? "landing")
    const landingTheme = String(fd.get("landingTheme") ?? "saas")
    if (!name) {
      window.alert("프로젝트 이름을 입력해 주세요.")
      newNameInput?.focus()
      return
    }
    const templateLabel = template === "portfolio" ? "포트폴리오" : template === "landing" ? "랜딩 페이지" : template === "business" ? "비즈니스" : template === "blog" ? "블로그 · 문서" : "빈 프로젝트"
    const themeLine = template === "landing" ? `\n랜딩 테마: ${landingTheme === "local" ? "로컬 비즈니스" : "SaaS 프로덕트"}` : ""
    const prompt = readPendingPrompt()
    const promptLine = prompt ? `\n프롬프트: ${prompt}` : ""
    window.alert(`「${name}」 프로젝트를 템플릿으로 생성합니다. (데모)\n\n템플릿: ${templateLabel}${themeLine}${promptLine}\n\n실제 제품에서는 저장소 생성 후 에이전트 화면으로 이동합니다.`)
    writePendingPrompt("")
    closeNewModal()
  })

  if (!projNewModalEscapeListenerAttached) {
    projNewModalEscapeListenerAttached = true
    document.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      const mNew = document.getElementById("projNewModal")
      if (mNew && !mNew.hidden) {
        e.preventDefault()
        dismissProjectsCreateModal()
        return
      }
      const mZip = document.getElementById("projZipModal")
      if (mZip && !mZip.hidden) {
        e.preventDefault()
        closeProjZipModal()
        return
      }
      const mGh = document.getElementById("projGhModal")
      if (mGh && !mGh.hidden) {
        e.preventDefault()
        closeProjGhModal()
        return
      }
    })
  }

  syncProjNewLandingThemes()
  refreshLandingThemePreview()

  if (openCreateFromRoute) {
    window.setTimeout(() => {
      openNewModal()
    }, 0)
  }

  const grid = document.getElementById("projGrid")
  grid?.addEventListener("click", (e) => {
    const el = e.target as HTMLElement
    if (el.closest(".proj-card__live-url")) return
    const hit = el.closest(".proj-card__hit") as HTMLElement | null
    const nav = hit?.dataset.projectNav
    if (nav) window.location.hash = nav
  })
  grid?.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return
    const hit = (e.target as HTMLElement).closest(".proj-card__hit") as HTMLElement | null
    const nav = hit?.dataset.projectNav
    if (nav) {
      e.preventDefault()
      window.location.hash = nav
    }
  })

  const setProjectListPage = (page: number): void => {
    const nav = document.getElementById("projPagination")
    if (!nav) return
    const clamped = Math.max(1, Math.min(PROJECT_LIST_PAGE_COUNT, Math.floor(page)))
    nav.querySelectorAll<HTMLButtonElement>("[data-proj-page]").forEach((b) => {
      const n = Number(b.dataset.projPage)
      const on = n === clamped
      b.classList.toggle("proj-pagination__btn--current", on)
      if (on) b.setAttribute("aria-current", "page")
      else b.removeAttribute("aria-current")
    })
    document.getElementById("projPaginationPrev")?.toggleAttribute("disabled", clamped <= 1)
    document.getElementById("projPaginationNext")?.toggleAttribute("disabled", clamped >= PROJECT_LIST_PAGE_COUNT)
    const st = document.getElementById("projPaginationStatus")
    if (st) {
      st.innerHTML = `<strong>${clamped}</strong> / ${PROJECT_LIST_PAGE_COUNT}`
    }
  }

  document.getElementById("projPagination")?.addEventListener("click", (e) => {
    const el = e.target as HTMLElement
    if (el.closest("#projPaginationPrev")) {
      const cur = document.querySelector<HTMLButtonElement>(".proj-pagination__btn--current[data-proj-page]")?.dataset.projPage ?? "1"
      setProjectListPage(Number(cur) - 1)
      return
    }
    if (el.closest("#projPaginationNext")) {
      const cur = document.querySelector<HTMLButtonElement>(".proj-pagination__btn--current[data-proj-page]")?.dataset.projPage ?? "1"
      setProjectListPage(Number(cur) + 1)
      return
    }
    const t = el.closest("[data-proj-page]")
    if (t instanceof HTMLButtonElement) {
      setProjectListPage(Number(t.dataset.projPage))
    }
  })
}

function bindProjectDetailPage(p: DemoProject): void {
  const copyBtn = document.getElementById("projCopyUrl")
  copyBtn?.addEventListener("click", async () => {
    if (!isProjectLiveUrl(p)) return
    try {
      await navigator.clipboard.writeText(p.subtitle)
      copyBtn.textContent = "복사됨"
      window.setTimeout(() => {
        copyBtn.textContent = "복사"
      }, 2000)
    } catch {
      window.alert("클립보드 복사에 실패했습니다.")
    }
  })

  document.getElementById("projOpenAgent")?.addEventListener("click", () => {
    window.location.hash = getProjectAgentHash(p.slug)
  })

  const modal = document.getElementById("projRemoveModal")
  const showModal = (show: boolean): void => {
    if (modal) modal.hidden = !show
  }

  document.getElementById("projRemoveOpen")?.addEventListener("click", () => showModal(true))
  document.getElementById("projRemoveBackdrop")?.addEventListener("click", () => showModal(false))
  document.getElementById("projRemoveCancel")?.addEventListener("click", () => showModal(false))
  document.getElementById("projRemoveConfirm")?.addEventListener("click", () => {
    showModal(false)
    window.location.hash = HASH_PROJECTS
  })
}

function mountLanding(): void {
  document.body.classList.remove("app-view")
  document.body.classList.remove("error-view")
  root.innerHTML = getLandingHTML()
  document.title = "Devely — AI 웹 제작 · 프롬프트부터 배포까지"

  const goDashboard = (): void => {
    window.location.hash = HASH_DASHBOARD
  }
  document.getElementById("btnLogin")?.addEventListener("click", goDashboard)
  document.getElementById("btnLoginMid")?.addEventListener("click", goDashboard)

  const form = root.querySelector<HTMLFormElement>("#promptForm")
  const input = root.querySelector<HTMLInputElement>("#promptInput")
  const statusEl = root.querySelector<HTMLParagraphElement>("#status")

  if (form && input && statusEl) {
    form.addEventListener("submit", (e) => {
      e.preventDefault()
      const prompt = input.value.trim()

      if (!prompt) {
        statusEl.textContent = "프롬프트를 입력해 주세요."
        return
      }

      statusEl.textContent = `“${prompt}”에 맞춰 생성 중... (데모)`
    })
  }
}

function bindAppSidebarCollapse(): void {
  const shell = root.querySelector<HTMLElement>(".app-shell:not(.app-shell--no-sidebar)")
  const btn = shell?.querySelector<HTMLButtonElement>("[data-sidebar-toggle]")
  if (!shell || !btn) return

  btn.addEventListener("click", () => {
    const collapsed = !shell.classList.contains("app-shell--sidebar-collapsed")
    shell.classList.toggle("app-shell--sidebar-collapsed", collapsed)
    writeSidebarCollapsed(collapsed)
    const label = collapsed ? "사이드바 열기" : "사이드바 닫기"
    btn.setAttribute("aria-expanded", collapsed ? "false" : "true")
    btn.title = label
    btn.setAttribute("aria-label", label)
  })
}

function bindAppSettingsModal(initialTab: string | null = null): void {
  const modal = document.getElementById("appSettingsModal")
  const opener = root.querySelector<HTMLButtonElement>('[data-action="open-settings"]')
  if (!modal || !opener) return

  const dialog = modal.querySelector<HTMLElement>(".settings-modal__dialog")
  const focusables = (): HTMLElement[] => Array.from(modal.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), select, [tabindex]:not([tabindex="-1"])')).filter((el) => !el.hasAttribute("hidden") && el.offsetParent !== null)

  let lastFocus: HTMLElement | null = null
  let preOpenHash = ""

  const setTab = (tab: string, opts: { syncHash?: boolean } = {}): void => {
    const targetTab = SETTINGS_TAB_SLUGS[tab] ? tab : SETTINGS_DEFAULT_TAB
    modal.querySelectorAll<HTMLButtonElement>("[data-settings-tab]").forEach((b) => {
      const isActive = b.dataset.settingsTab === targetTab
      b.classList.toggle("settings-modal__nav-item--active", isActive)
    })
    modal.querySelectorAll<HTMLElement>("[data-settings-panel]").forEach((p) => {
      const isActive = p.dataset.settingsPanel === targetTab
      p.classList.toggle("settings-modal__panel--active", isActive)
      if (isActive) p.removeAttribute("hidden")
      else p.setAttribute("hidden", "")
    })
    if (opts.syncHash !== false) {
      const nextHash = getSettingsHashForTab(targetTab)
      if (window.location.hash !== nextHash) {
        replaceLocationHashNoNavigate(nextHash)
      }
    }
  }

  const openModal = (tab: string = SETTINGS_DEFAULT_TAB, opts: { syncHash?: boolean } = {}): void => {
    if (modal.hidden) {
      lastFocus = (document.activeElement as HTMLElement) ?? null
      const curHash = window.location.hash
      preOpenHash = getSettingsTabForHash(curHash) ? HASH_DASHBOARD : curHash || HASH_DASHBOARD
    }
    modal.hidden = false
    modal.setAttribute("aria-hidden", "false")
    document.body.classList.add("settings-modal-open")
    setTab(tab, opts)
    requestAnimationFrame(() => {
      const first = dialog?.querySelector<HTMLElement>(".settings-modal__nav-item--active")
      first?.focus()
    })
  }

  const closeModal = (): void => {
    modal.hidden = true
    modal.setAttribute("aria-hidden", "true")
    document.body.classList.remove("settings-modal-open")
    const target = preOpenHash || HASH_DASHBOARD
    if (window.location.hash !== target) {
      replaceLocationHashNoNavigate(target)
    }
    lastFocus?.focus?.()
    lastFocus = null
  }

  opener.addEventListener("click", (e) => {
    e.preventDefault()
    const currentTab = getSettingsTabForHash(window.location.hash)
    openModal(currentTab ?? SETTINGS_DEFAULT_TAB)
  })

  modal.querySelectorAll<HTMLElement>("[data-settings-close]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault()
      closeModal()
    })
  })

  modal.querySelectorAll<HTMLButtonElement>("[data-settings-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.settingsTab
      if (tab) setTab(tab)
    })
  })

  modal.querySelectorAll<HTMLButtonElement>("[data-settings-theme]").forEach((btn) => {
    btn.addEventListener("click", () => {
      modal.querySelectorAll<HTMLButtonElement>("[data-settings-theme]").forEach((b) => {
        const on = b === btn
        b.classList.toggle("settings-modal__theme-btn--active", on)
        b.setAttribute("aria-pressed", on ? "true" : "false")
      })
    })
  })

  modal.querySelectorAll<HTMLButtonElement>("[data-settings-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const on = !btn.classList.contains("settings-modal__switch--on")
      btn.classList.toggle("settings-modal__switch--on", on)
      btn.setAttribute("aria-pressed", on ? "true" : "false")
    })
  })

  modal.querySelectorAll<HTMLButtonElement>("[data-chip-group]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const group = btn.dataset.chipGroup
      if (!group) return
      modal.querySelectorAll<HTMLButtonElement>(`[data-chip-group="${group}"]`).forEach((b) => {
        b.classList.toggle("set-chip--active", b === btn)
      })
    })
  })

  modal.querySelectorAll<HTMLInputElement>(".set-checkrow__input").forEach((input) => {
    const sync = (): void => {
      input.closest(".set-checkrow")?.classList.toggle("set-checkrow--on", input.checked)
    }
    sync()
    input.addEventListener("change", sync)
  })

  const wireDemo = (selector: string, msg: string): void => {
    modal.querySelectorAll<HTMLButtonElement>(selector).forEach((b) => {
      b.addEventListener("click", () => window.alert(msg))
    })
  }
  wireDemo("[data-mail-connect]", "메일 계정 연결 흐름은 곧 제공됩니다. (데모)")
  wireDemo("[data-mail-disconnect]", "이 메일 계정 연결을 해제했습니다. (데모)")
  wireDemo("[data-data-export]", "데이터 내보내기를 준비합니다. 완료 시 메일로 알려드립니다. (데모)")
  wireDemo("[data-comp-disconnect]", "이 기기 연결을 해제했습니다. (데모)")
  wireDemo("[data-comp-change-folder]", "폴더 선택 다이얼로그는 곧 제공됩니다. (데모)")
  wireDemo("[data-browser-end]", "이 세션을 종료했습니다. (데모)")
  wireDemo("[data-skill-new]", "새 스킬 작성 화면은 곧 제공됩니다. (데모)")
  wireDemo("[data-connector]", "이 커넥터의 상세 화면은 곧 제공됩니다. (데모)")
  wireDemo("[data-integration]", "이 워크플로의 상세 화면은 곧 제공됩니다. (데모)")
  wireDemo("[data-integration-new]", "새 워크플로 작성 화면은 곧 제공됩니다. (데모)")
  wireDemo("[data-int-rotate]", "웹훅 키를 재발급했습니다. (데모)")

  modal.querySelector<HTMLButtonElement>("[data-data-purge]")?.addEventListener("click", () => {
    const ok = window.confirm("모든 대화 내역을 영구 삭제합니다. 계속하시겠습니까?")
    if (!ok) return
    window.alert("실제 제품에서는 비동기 잡으로 처리되며, 완료 시 알림이 전송됩니다. (데모)")
  })

  modal.querySelectorAll<HTMLButtonElement>("[data-acc-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const sel = btn.dataset.accCopy
      if (!sel) return
      const target = modal.querySelector(sel)
      const text = target?.textContent?.trim() ?? ""
      if (!text) return
      const original = btn.textContent ?? "복사"
      try {
        await navigator.clipboard.writeText(text)
        btn.textContent = "복사됨"
      } catch {
        btn.textContent = "실패"
      }
      window.setTimeout(() => {
        btn.textContent = original
      }, 1500)
    })
  })

  modal.querySelector<HTMLButtonElement>("[data-acc-upgrade]")?.addEventListener("click", () => {
    window.alert("Pro 플랜 업그레이드 흐름은 곧 제공됩니다. (데모)")
  })
  modal.querySelector<HTMLButtonElement>("[data-acc-logout]")?.addEventListener("click", () => {
    const ok = window.confirm("이 장치에서 로그아웃하시겠습니까?")
    if (!ok) return
    closeModal()
    window.location.hash = "#/"
  })
  modal.querySelector<HTMLButtonElement>("[data-acc-delete]")?.addEventListener("click", () => {
    const ok = window.confirm("계정을 삭제하면 모든 데이터가 영구 삭제됩니다. 계속하시겠습니까?")
    if (!ok) return
    window.alert("실제 제품에서는 추가 인증 후 처리됩니다. (데모)")
  })

  const helpLink = modal.querySelector<HTMLAnchorElement>("[data-settings-help]")
  helpLink?.addEventListener("click", (e) => {
    e.preventDefault()
    window.alert("도움말 센터는 곧 연결됩니다. (데모)")
  })

  document.addEventListener("keydown", (e) => {
    if (modal.hidden) return
    if (e.key === "Escape") {
      e.preventDefault()
      closeModal()
      return
    }
    if (e.key === "Tab") {
      const items = focusables()
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement as HTMLElement | null
      if (e.shiftKey && active === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }
  })

  if (initialTab) {
    openModal(initialTab, { syncHash: false })
  }
}

function mountApp(): void {
  document.body.classList.remove("error-view")
  document.body.classList.add("app-view")
  const route = parseAppRoute()
  let inner: string
  let title: string
  let sidebar: "dashboard" | "projects" | "settings" = "dashboard"
  let mainExtraClass = ""
  let omitSidebar = false

  if (route.kind === "notFound") {
    omitSidebar = true
    mainExtraClass = "app-main--error"
    inner = getHttpErrorPageHTML(404, true)
    title = "404 — AI Web Builder"
    sidebar = "dashboard"
  } else if (route.kind === "projects") {
    sidebar = "projects"
    inner = getProjectsInnerHTML()
    title = route.createModalOpen ? "새 프로젝트 — AI Web Builder" : "프로젝트 — AI Web Builder"
  } else if (route.kind === "projectAgent") {
    sidebar = "projects"
    const p = DEMO_PROJECTS.find((x) => x.slug === route.slug)
    inner = p ? getProjectAgentInnerHTML(p, route.tab) : getProjectNotFoundInnerHTML()
    title = p ? `${p.slug} · 에이전트 — AI Web Builder` : "프로젝트 — AI Web Builder"
    if (p) {
      mainExtraClass = "app-main--agent"
      omitSidebar = true
    }
  } else if (route.kind === "project") {
    sidebar = "projects"
    const p = DEMO_PROJECTS.find((x) => x.slug === route.slug)
    inner = p ? getProjectDetailInnerHTML(p) : getProjectNotFoundInnerHTML()
    title = p ? `${p.slug} — AI Web Builder` : "프로젝트 — AI Web Builder"
  } else if (route.kind === "settings") {
    sidebar = "settings"
    inner = getDashboardInnerHTML()
    mainExtraClass = "app-main--dashboard"
    title = "설정 — AI Web Builder"
  } else {
    inner = getDashboardInnerHTML()
    mainExtraClass = "app-main--dashboard"
    title = "작업 — AI Web Builder"
  }

  root.innerHTML = getAppLayoutHTML(sidebar, inner, mainExtraClass, omitSidebar, omitSidebar ? false : readSidebarCollapsed())
  document.title = title

  if (!omitSidebar) {
    bindAppSidebarCollapse()
    bindAppSettingsModal(route.kind === "settings" ? route.tab : null)
  }

  if (route.kind === "notFound") {
    /* no-op */
  } else if (route.kind === "projects") {
    bindProjectListPage(route.createModalOpen)
  } else if (route.kind === "projectAgent") {
    const proj = DEMO_PROJECTS.find((x) => x.slug === route.slug)
    if (proj) bindProjectAgentPage(proj)
  } else if (route.kind === "project") {
    const proj = DEMO_PROJECTS.find((x) => x.slug === route.slug)
    if (proj) bindProjectDetailPage(proj)
  } else if (route.kind === "dashboard" || route.kind === "settings") {
    bindDashboardPage()
  }
}

function renderRoute(): void {
  document.body.classList.remove("error-view")
  const standaloneErr = parseStandaloneErrorRoute()
  if (standaloneErr) {
    mountStandaloneHttpError(standaloneErr)
    return
  }
  if (isAppRoute()) {
    mountApp()
  } else {
    mountLanding()
  }
}

window.addEventListener("hashchange", renderRoute)
window.addEventListener("popstate", renderRoute)
renderRoute()
