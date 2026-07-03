# Tasks: GitHub 로그인 연동

**Input**: Design documents from `specs/001-github-login/`  
**Prerequisites**: `plan.md` (required), `spec.md` (required), `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: 자동 테스트 러너는 현재 범위에서 필수가 아니므로, 본 태스크는 수동 검증 + 타입체크 기준으로 구성한다.

**Organization**: 사용자 스토리별 독립 구현/검증이 가능하도록 구성한다.

## Format: `[ID] [P?] [Story] Description`

- [P]: 병렬 가능(서로 다른 파일, 선행 의존성 없음)
- [Story]: 사용자 스토리 라벨 (`[US1]`, `[US2]`, `[US3]`)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 인증 기능 구현을 위한 공통 기반 정리

- [ ] T001 환경 변수 예시 문서 정리 in `README.repo.md`
- [ ] T002 [P] GitHub 로그인 계약(JSON) 최신화 검토 in `specs/001-github-login/contracts/github-auth.openapi.json`
- [ ] T003 [P] 기능 문서 간 참조 경로 일치화 in `specs/001-github-login/plan.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 모든 사용자 스토리의 공통 선행 기반 구현

- [ ] T004 API 인증 응답 공통 타입 정의 in `src/types/auth.ts`
- [ ] T005 [P] GitHub 인증 API 클라이언트 함수 생성 in `src/services/auth/githubAuthApi.ts`
- [ ] T006 [P] 인증 관련 에러 메시지 매퍼 구현 in `src/services/auth/githubAuthError.ts`
- [ ] T007 OAuth state 저장/검증 유틸 구현 in `src/services/auth/oauthState.ts`
- [ ] T008 공통 HTTP 클라이언트의 인증 예외 분기 정리(주석 포함) in `src/utils/httpClients.ts`

**Checkpoint**: 이후 사용자 스토리 구현 시작 가능

---

## Phase 3: User Story 1 - GitHub로 로그인 시작/완료 (Priority: P1) 🎯 MVP

**Goal**: 로그인 시작 URL 조회 및 callback 처리로 서비스 로그인 완료

**Independent Test**: `/auth/login`에서 GitHub 로그인 시작 후 `/auth/callback` 처리 뒤 로그인 상태 전환 확인

### Implementation for User Story 1

- [ ] T009 [US1] 로그인 페이지에서 GitHub 시작 API 연동 in `src/components/layout/login/Login.tsx`
- [ ] T010 [US1] 로그인 라우트에서 에러/로딩 상태 처리 연결 in `src/routes/auth/login.tsx`
- [ ] T011 [US1] callback 라우트에서 code/state 처리 및 서비스 세션 확정 구현 in `src/routes/auth/callback.tsx`
- [ ] T012 [US1] callback 완료 후 리다이렉트 정책 연결 in `src/router.tsx`
- [ ] T013 [US1] 로그인 플로우 수동 검증 절차 보강 in `specs/001-github-login/quickstart.md`

**Checkpoint**: US1 단독 동작 및 수동 검증 가능

---

## Phase 4: User Story 2 - GitHub 연동 상태 진단 (Priority: P2)

**Goal**: 연동 상태 API 결과를 정확히 조회하고 상태별 안내 제공

**Independent Test**: 상태 조회 API 결과가 `CONNECTED`/`TOKEN_INVALID`/`PERMISSION_MISMATCH`/`RECONNECT_REQUIRED`로 구분 노출

### Implementation for User Story 2

- [ ] T014 [US2] 연동 상태 조회 API 함수 및 타입 매핑 구현 in `src/services/auth/githubAuthApi.ts`
- [ ] T015 [P] [US2] 연동 상태 배지/메시지 매핑 유틸 구현 in `src/services/auth/githubConnectionStatus.ts`
- [ ] T016 [US2] 로그인 화면에 연동 상태 조회/표시 UI 연결 in `src/components/layout/login/Login.tsx`
- [ ] T017 [US2] 상태 조회 실패/재시도 안내 문구 처리 in `src/services/auth/githubAuthError.ts`
- [ ] T018 [US2] 연동 상태 수동 검증 시나리오 추가 in `specs/001-github-login/quickstart.md`

**Checkpoint**: US2 단독 동작 및 상태별 안내 확인 가능

---

## Phase 5: User Story 3 - 연동 해제 및 재연결 준비 (Priority: P3)

**Goal**: 연동 해제 후 `NOT_CONNECTED` 전환 및 재로그인 유도

**Independent Test**: 연동 해제 호출 후 상태 재조회에서 `NOT_CONNECTED` 표시 및 재로그인 버튼 노출

### Implementation for User Story 3

- [ ] T019 [US3] 연동 해제 API 함수 구현 in `src/services/auth/githubAuthApi.ts`
- [ ] T020 [US3] 로그인 화면에 연동 해제 액션 및 확인 UI 추가 in `src/components/layout/login/Login.tsx`
- [ ] T021 [US3] 해제 직후 상태 재조회 및 로컬 인증 정보 정리 처리 in `src/routes/auth/login.tsx`
- [ ] T022 [US3] 재연동 유도 메시지/행동 버튼 연결 in `src/components/layout/login/Login.tsx`
- [ ] T023 [US3] 연동 해제 수동 검증 시나리오 추가 in `specs/001-github-login/quickstart.md`

**Checkpoint**: US3 단독 동작 및 해제-재연결 흐름 검증 가능

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 전 스토리 공통 완성도 점검

- [ ] T024 [P] OpenAPI 계약과 구현 필드 불일치 최종 점검 in `specs/001-github-login/contracts/github-auth.openapi.json`
- [ ] T025 사용자 안내 문구(한국어 우선) 최종 점검 in `src/components/layout/login/Login.tsx`
- [ ] T026 quickstart 전체 시나리오 실행 결과 기록 in `specs/001-github-login/quickstart.md`
- [ ] T027 작업 종료 포맷/타입체크 실행 및 결과 기록 in `specs/001-github-login/plan.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- Phase 1 완료 후 Phase 2 진행
- Phase 2 완료 후 US1/US2/US3 진행 가능
- 우선순위 기반 권장 순서: US1 → US2 → US3
- Phase 6은 모든 사용자 스토리 완료 후 진행

### User Story Dependencies

- **US1 (P1)**: 선행 의존성 없음(Foundational 완료 후 즉시 시작)
- **US2 (P2)**: US1 로그인 성공 흐름이 준비되어야 검증 효율이 높음
- **US3 (P3)**: US2 상태 조회 기능이 있어야 해제 결과 검증이 명확함

---

## Parallel Opportunities

- T002, T003 (문서/계약 정리 병렬 가능)
- T005, T006, T007 (서비스/유틸 파일 분리로 병렬 가능)
- T015 (상태 매핑 유틸)와 T014 (API 함수)는 병렬 가능
- T024, T025는 구현 마감 단계에서 병렬 점검 가능

---

## Parallel Example: User Story 2

```bash
Task: "T014 [US2] 연동 상태 조회 API 함수 및 타입 매핑 구현 in src/services/auth/githubAuthApi.ts"
Task: "T015 [P] [US2] 연동 상태 배지/메시지 매핑 유틸 구현 in src/services/auth/githubConnectionStatus.ts"
```

---

## Implementation Strategy

### MVP First (US1)

1. Phase 1~2 완료
2. US1 구현 완료 후 로그인/callback 독립 검증
3. 로그인 성공률 기준 확인 후 다음 스토리 진행

### Incremental Delivery

1. US1: 로그인 완료 플로우 안정화
2. US2: 연동 상태 진단 추가
3. US3: 연동 해제/재연결 준비 추가
4. 마지막에 공통 점검 및 계약 정합성 확인

### Format Validation

모든 태스크는 `- [ ] Txxx [P?] [US?] 설명 + 파일 경로` 형식을 따른다.
