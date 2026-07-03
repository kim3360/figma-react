# Spec Kit 사용 가이드 (Dvely_FE)

이 문서는 이 프로젝트에서 Spec Kit을 사용할 때의 **실전 기준**을 정리합니다.

---

## 1) Spec Kit 문서의 역할

- `.specify/memory/constitution.md`
  - 팀 공통 개발 원칙(품질, 검증, UX, 보안, 정합성)
- `specs/<번호-기능명>/spec.md`
  - 기능 요구사항(WHAT/WHY)
- `specs/<번호-기능명>/plan.md`
  - 구현 설계(HOW)
- `specs/<번호-기능명>/tasks.md`
  - 실행 가능한 작업 단위
- `specs/<번호-기능명>/contracts/*`
  - API/인터페이스 계약
- `specs/<번호-기능명>/checklists/*`
  - 스펙 품질 점검표

> 핵심: `README.md`는 프로젝트 소개, `spec.md`는 기능 명세입니다.

---

## 2) 권장 실행 순서

1. `/speckit-constitution` (초기 1회 또는 규칙 변경 시)
2. `/speckit-specify <기능 설명>`
3. `/speckit-plan`
4. `/speckit-tasks`
5. `/speckit-implement` 또는 수동 구현

각 단계는 이전 산출물을 입력으로 사용합니다.

---

## 3) 이 프로젝트의 운영 정책

### 브랜치 정책

- 팀 브랜치 정책: 개인 브랜치(`feature/mch`) 사용
- Spec Kit 문서 폴더는 기능 단위로 관리:
  - 예) `specs/001-github-login/`

### before_specify 브랜치 자동생성 훅

- 현재 `before_specify`의 `speckit.git.feature`는 비활성화 상태
- 설정 파일: `.specify/extensions.yml`

---

## 4) 자주 쓰는 명령

```bash
/speckit-specify <기능 설명>
/speckit-plan
/speckit-tasks
```

예시:

```bash
/speckit-specify GitHub OAuth 로그인 연동 기능
```

---

## 5) 문서 작성 원칙 (실무)

- `spec.md`는 기능 단위로 작성(여러 기능이면 여러 spec 폴더)
- `plan.md`는 실제 기술 스택 기준으로 작성 (`package.json` 참고)
- `tasks.md`는 체크박스 기반으로 진행 상태 관리
- 작업 중 사용자 결정이 필요한 항목은 먼저 확인 후 진행

---

## 6) 완료 기준 (이 프로젝트 공통)

AI 수정 작업의 완료 기준:

1. 코드/문서 변경 반영
2. 에러 확인 및 수정
3. `bun run format`
4. `bun run typecheck`
5. `tasks.md` 체크박스 반영

---

## 7) 현재 GitHub 로그인 기능 예시

- 경로: `specs/001-github-login/`
- 주요 파일:
  - `spec.md`
  - `plan.md`
  - `tasks.md`
  - `contracts/github-auth.openapi.json`
  - `quickstart.md`

---

## 8) 자주 하는 실수

- `spec-template.md`에 기능 내용을 직접 작성
  - 템플릿은 공통 양식, 실제 기능 내용은 `specs/.../spec.md`에 작성
- `spec.md`를 프로젝트 소개 문서처럼 사용
  - 프로젝트 소개는 `README.md`, 기능 명세는 `spec.md`
- 문서 경로명 불일치
  - 폴더명 변경 시 `.specify/feature.json` 포함 참조 경로 동기화 필요

---

## 9) 참고 파일

- `.specify/extensions.yml` (훅 설정)
- `.specify/templates/*.md` (문서 템플릿)
- `.cursor/rules/specify-rules.mdc` (에이전트 컨텍스트 규칙)
