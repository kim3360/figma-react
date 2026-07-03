# Implementation Plan: GitHub 로그인 연동

**Branch**: `feature/mch` | **Date**: 2026-05-05 | **Spec**: `specs/001-github-login/spec.md`  
**Input**: Feature specification from `specs/001-github-login/spec.md`

## Summary

GitHub OAuth 로그인 시작/콜백 처리/로그아웃과 연동 상태 진단 기능을 구현한다.
프론트는 React(TanStack Router)에서 인증 화면과 콜백 처리 흐름을 제공하고, 백엔드 API와 통신해
서비스 세션과 GitHub 연동 상태를 분리 관리한다.

## Technical Context

**Language/Version**: TypeScript 5.9, React 19  
**Primary Dependencies**: TanStack Router, Axios, Vite, ESLint, Prettier  
**Storage**: 브라우저 저장소(localStorage; 기존 토큰 처리 구조), 서버 세션 저장소(백엔드 책임)  
**Testing**: 수동 시나리오 검증 + `bun run typecheck` (현재 자동 테스트 러너는 미도입)  
**Target Platform**: 웹 브라우저(SPA), 백엔드 REST API 연동  
**Project Type**: 단일 프론트엔드 웹 애플리케이션  
**Performance Goals**: 로그인 시작 URL 조회/콜백 후 라우팅 체감 2초 이내  
**Constraints**: OAuth `state` 무결성 검증, 한국어 우선 안내, 연동 상태 오탐 방지  
**Scale/Scope**: MVP 로그인/연동 상태/연동 해제 API 소비 흐름 1차 구현

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **코드 품질**: 타입 안전한 API 응답 모델과 라우트 단위 책임 분리를 유지한다.
- **포맷/타입체크**: 작업 종료 시 `bun run format` 및 `bun run typecheck`를 실행한다.
- **주석 규칙**: OAuth 콜백 분기(`state` 불일치, 토큰 무효)에는 짧은 의도 주석을 추가한다.
- **정합성**: 스펙의 FR-001~FR-012를 화면/클라이언트 API 계층에 1:1 매핑한다.

**Gate Result (Pre-Design)**: PASS  
**Gate Result (Post-Design)**: PASS

## Project Structure

### Documentation (this feature)

```text
specs/001-github-login/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── github-auth.openapi.json
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── routes/
│   └── auth/
│       ├── login.tsx
│       └── callback.tsx
├── components/
│   └── layout/
│       └── login/
│           └── Login.tsx
├── utils/
│   ├── httpClients.ts
│   └── response.ts
└── router.tsx
```

**Structure Decision**: 기존 단일 프론트엔드 구조를 유지하고 `routes/auth` + `utils` 계층 중심으로 인증 플로우를 구현한다.

## Phase 0: Research Decisions

1. OAuth authorization code + `state` 검증을 기본 흐름으로 채택
2. GitHub access token과 서비스 세션 토큰을 분리 관리
3. 연동 상태 API는 `CONNECTED` 여부뿐 아니라 무효/권한 부족/재연동 필요를 구분

## Phase 1: Design Outputs

- `data-model.md`: User Account, OAuth Session, GitHub Connection, Service Session 모델 정의
- `contracts/github-auth.openapi.json`: 인증/연동 상태/해제 API 계약 정의
- `quickstart.md`: 로컬 확인 순서와 검증 시나리오 정의

## Complexity Tracking

해당 없음
