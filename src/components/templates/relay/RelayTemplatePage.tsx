import { useState } from "react";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  Circle,
  Command,
  Folder,
  LayoutDashboard,
  LayoutGrid,
  List,
  Plus,
  Search,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import "./relay.css";

const initialTasks = [
  {
    id: 1,
    title: "브랜드 리서치 인사이트 정리",
    category: "Research",
    status: "todo",
    date: "오늘",
    person: "지",
    color: "peach",
    description: "레퍼런스 12개에서 발견한 공통점을 정리해요.",
    cover: false,
  },
  {
    id: 2,
    title: "랜딩페이지 카피 초안",
    category: "Content",
    status: "todo",
    date: "9월 18일",
    person: "수",
    color: "blue",
    description: "우리의 이야기를 한 문장으로 전달하기",
    cover: false,
  },
  {
    id: 3,
    title: "새로운 브랜드의 첫인상",
    category: "Design",
    status: "doing",
    date: "오늘",
    person: "민",
    color: "purple",
    description: "홈 화면 비주얼 콘셉트 · Version 02",
    cover: true,
  },
  {
    id: 4,
    title: "컴포넌트 라이브러리 구축",
    category: "System",
    status: "doing",
    date: "9월 19일",
    person: "준",
    color: "green",
    description: "버튼, 입력 폼, 카드의 기본 규칙",
    cover: false,
  },
  {
    id: 5,
    title: "프로젝트 킥오프 미팅",
    category: "Planning",
    status: "done",
    date: "완료",
    person: "지",
    color: "peach",
    description: "목표와 마일스톤을 함께 맞췄어요.",
    cover: false,
  },
];
const columns = [
  { id: "todo", label: "시작 전", color: "#a9a9ae" },
  { id: "doing", label: "진행 중", color: "#8773ca" },
  { id: "done", label: "완료", color: "#6e9a80" },
];

export default function RelayTemplatePage() {
  const [tasks, setTasks] = useState(initialTasks);
  const [view, setView] = useState("board");
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [mine, setMine] = useState(false);
  const filtered = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(query.toLowerCase()) &&
      (!mine || task.person === "지"),
  );
  const done = tasks.filter((task) => task.status === "done").length;
  const toggle = (id: number) =>
    setTasks(
      tasks.map((task) =>
        task.id === id
          ? { ...task, status: task.status === "done" ? "todo" : "done" }
          : task,
      ),
    );
  return (
    <div className="rl-page">
      <aside className="rl-sidebar">
        <a className="rl-logo" href="#rl-board">
          <Command size={25} /> relay<span>®</span>
        </a>
        <div className="rl-workspace">
          <span className="rl-workspace-icon">S</span>
          <div>
            Studio workspace<small>PRO PLAN · 4 MEMBERS</small>
          </div>
        </div>
        <p className="rl-nav-label">WORKSPACE</p>
        <nav>
          <a href="#rl-overview">
            <LayoutDashboard size={17} />
            개요
          </a>
          <a
            href="#rl-board"
            className={!mine ? "rl-active" : ""}
            onClick={() => setMine(false)}
          >
            <Folder size={17} />
            프로젝트<span>01</span>
          </a>
          <button
            className={mine ? "rl-active" : ""}
            onClick={() => setMine(!mine)}
          >
            <Check size={17} />내 작업
            <span>{tasks.filter((task) => task.person === "지").length}</span>
          </button>
          <a href="#rl-team">
            <Users size={17} />팀 멤버
          </a>
        </nav>
        <div className="rl-project-nav">
          <p className="rl-nav-label">YOUR PROJECTS</p>
          <a href="#rl-board">
            <i />
            브랜드 리뉴얼
          </a>
        </div>
        <div className="rl-side-note">
          <Sparkles size={20} />
          <strong>
            작은 진전이,
            <br />큰 차이를 만드니까.
          </strong>
          <p>
            오늘의 한 걸음을
            <br />
            팀과 함께 나눠보세요.
          </p>
        </div>
        <div className="rl-profile">
          <span className="rl-avatar rl-peach">지</span>
          <div>
            김지윤<small>Product designer</small>
          </div>
          <ChevronDown size={15} />
        </div>
      </aside>
      <div className="rl-content">
        <header className="rl-topbar">
          <span>
            Workspace <b>/</b> 프로젝트 <b>/</b>
            <strong> 브랜드 리뉴얼</strong>
          </span>
          <span className="rl-demo">INTERACTIVE DEMO</span>
        </header>
        <main>
          <section id="rl-overview" className="rl-greeting">
            <div>
              <p>MONDAY, SEPTEMBER 14</p>
              <h1>
                좋은 아침이에요, 지윤님 <span>✳</span>
              </h1>
              <span>
                생각은 자유롭게, 협업은 가볍게. 오늘도 함께 만들어봐요.
              </span>
            </div>
            <div className="rl-team-stack" id="rl-team">
              {["지", "수", "민", "준"].map((name, i) => (
                <span
                  key={name}
                  title={["김지윤", "이수아", "박민서", "최준호"][i]}
                  className={`rl-avatar rl-${["peach", "blue", "purple", "green"][i]}`}
                >
                  {name}
                </span>
              ))}
              <small>우리 팀, 4명</small>
            </div>
          </section>
          <div className="rl-overview-grid">
            <section className="rl-feature">
              <div>
                <span>PROJECT SPOTLIGHT</span>
                <h2>
                  A new chapter
                  <br />
                  for our brand.
                </h2>
                <p>브랜드 리뉴얼 프로젝트</p>
                <a href="#rl-board">
                  이어서 작업하기 <ArrowUpRight size={16} />
                </a>
              </div>
              <div className="rl-orbit" aria-hidden="true">
                <i />
                <i />
                <i />
                <b>r.</b>
              </div>
              <small>SPRINT 04 / SEPTEMBER 2026</small>
            </section>
            <section className="rl-progress">
              <div>
                <span>프로젝트 진행률</span>
                <ArrowUpRight size={17} />
              </div>
              <strong>
                {Math.round((done / tasks.length) * 100)}
                <small>%</small>
              </strong>
              <div className="rl-progress-track">
                <i style={{ width: `${(done / tasks.length) * 100}%` }} />
              </div>
              <p>
                전체 {tasks.length}개 중 <b>{done}개 완료</b>
              </p>
              <footer>
                <span className="rl-progress-dot" />한 걸음씩, 순조롭게 진행 중
              </footer>
            </section>
            <section className="rl-meeting">
              <span>UP NEXT</span>
              <div className="rl-meeting-date">
                <b>14</b>
                <span>
                  MON
                  <br />
                  SEPTEMBER
                </span>
              </div>
              <h3>위클리 디자인 싱크</h3>
              <p>14:00 – 14:30 · 팀 라운지</p>
              <div>
                <span className="rl-avatar rl-purple">민</span>
                <span className="rl-avatar rl-blue">수</span>
                <small>+2명이 함께해요</small>
              </div>
            </section>
          </div>
          <section className="rl-board-section" id="rl-board">
            <div className="rl-board-title">
              <div>
                <h2>
                  {mine ? "내 작업" : "브랜드 리뉴얼"}
                  <span>진행 중</span>
                </h2>
                <p>새로운 가능성을 함께 디자인하는 곳</p>
              </div>
              <button className="rl-add" onClick={() => setAdding(true)}>
                <Plus size={16} />새 작업
              </button>
            </div>
            <div className="rl-toolbar">
              <div className="rl-view-switch" aria-label="작업 보기 방식">
                <button
                  aria-pressed={view === "board"}
                  onClick={() => setView("board")}
                >
                  <LayoutGrid size={15} />
                  보드
                </button>
                <button
                  aria-pressed={view === "list"}
                  onClick={() => setView("list")}
                >
                  <List size={16} />
                  리스트
                </button>
              </div>
              <label className="rl-search">
                <Search size={15} />
                <input
                  aria-label="작업 검색"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="작업 검색..."
                />
              </label>
            </div>
            {adding && (
              <form
                className="rl-add-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!title.trim()) return;
                  setTasks([
                    ...tasks,
                    {
                      id: Math.max(...tasks.map((task) => task.id)) + 1,
                      title: title.trim(),
                      category: "Planning",
                      status: "todo",
                      date: "오늘",
                      person: "지",
                      color: "peach",
                      description: "새롭게 시작하는 팀의 작업",
                      cover: false,
                    },
                  ]);
                  setTitle("");
                  setAdding(false);
                  setQuery("");
                }}
              >
                <label htmlFor="rl-new-task">새 작업 제목</label>
                <input
                  id="rl-new-task"
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="어떤 일을 함께 할까요?"
                  maxLength={100}
                  required
                />
                <button type="submit">추가</button>
                <button
                  type="button"
                  aria-label="새 작업 취소"
                  onClick={() => setAdding(false)}
                >
                  <X size={17} />
                </button>
              </form>
            )}
            <div className={`rl-tasks rl-${view}`} aria-live="polite">
              {columns.map((column) => (
                <section key={column.id} className="rl-column">
                  <h3>
                    <i style={{ background: column.color }} />
                    {column.label}
                    <span>
                      {
                        filtered.filter((task) => task.status === column.id)
                          .length
                      }
                    </span>
                  </h3>
                  {filtered
                    .filter((task) => task.status === column.id)
                    .map((task) => (
                      <article className="rl-task" key={task.id}>
                        {task.cover && (
                          <div className="rl-task-cover" aria-hidden="true">
                            <span>
                              MAKE
                              <br />
                              ROOM.
                            </span>
                            <i>✳</i>
                            <small>FOR SOMETHING NEW</small>
                          </div>
                        )}
                        <div className="rl-task-body">
                          <span className={`rl-tag rl-${task.color}`}>
                            {task.category}
                          </span>
                          <h4>
                            <button
                              onClick={() => toggle(task.id)}
                              aria-label={`${task.title} ${task.status === "done" ? "다시 시작" : "완료 처리"}`}
                            >
                              {task.status === "done" ? (
                                <Check size={16} />
                              ) : (
                                <Circle size={16} />
                              )}
                            </button>
                            {task.title}
                          </h4>
                          <p>{task.description}</p>
                          <div className="rl-task-footer">
                            <span>
                              {task.status === "done" ? "✓ 완료" : task.date}
                            </span>
                            <span className={`rl-avatar rl-${task.color}`}>
                              {task.person}
                            </span>
                          </div>
                        </div>
                      </article>
                    ))}
                  {filtered.filter((task) => task.status === column.id)
                    .length === 0 && (
                    <p className="rl-empty">
                      {query ? "검색 결과가 없어요." : "아직 작업이 없어요."}
                    </p>
                  )}
                </section>
              ))}
            </div>
          </section>
          <footer className="rl-page-footer">
            <span>
              <i />
              All changes live in this preview
            </span>
            <span>RELAY · 함께 만드는 좋은 흐름</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
