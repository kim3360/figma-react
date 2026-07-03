# Feature Specification: GitHub 로그인 연동

**Feature Branch**: `feature/mch`  
**Created**: 2026-05-05  
**Status**: Draft  
**Input**: User description: "GitHub OAuth 기반 로그인 및 연동 상태 확인 기능"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - GitHub로 로그인 시작/완료 (Priority: P1)

사용자가 GitHub 로그인 버튼을 눌러 인증을 완료하고 서비스에 로그인한다.

**Why this priority**: MVP의 기본 인증 방식이 GitHub 단일 로그인이라, 로그인 흐름이 없으면 서비스 진입 자체가 불가능하다.

**Independent Test**: 로그인 화면에서 GitHub 로그인 버튼을 눌러 인증 완료 후 서비스 세션이 생성되고 사용자 정보 조회가 가능한지 확인한다.

**Acceptance Scenarios**:

1. **Given** 사용자가 로그인 화면에 있는 상태, **When** GitHub 로그인 시작 요청을 하면, **Then** 시스템은 인증 URL을 제공한다.
2. **Given** 사용자가 GitHub 인증을 완료한 상태, **When** callback이 처리되면, **Then** 서비스 세션이 생성되고 로그인 상태가 된다.

---

### User Story 2 - GitHub 연동 상태 진단 (Priority: P2)

사용자가 현재 계정이 GitHub 작업을 수행 가능한 상태인지 확인한다.

**Why this priority**: 로그인 성공과 실제 GitHub 작업 가능 상태는 다를 수 있어, 연동 상태를 분리해 확인해야 이후 기능 실패를 줄일 수 있다.

**Independent Test**: 연동 상태 조회 API 호출 시 정상/토큰 무효/권한 부족 상태를 구분해 반환하는지 확인한다.

**Acceptance Scenarios**:

1. **Given** 토큰이 유효하고 권한이 충분한 상태, **When** 사용자가 연동 상태를 조회하면, **Then** 상태가 `CONNECTED`로 반환된다.
2. **Given** 토큰이 만료되었거나 권한이 부족한 상태, **When** 사용자가 연동 상태를 조회하면, **Then** 원인에 맞는 상태 코드와 재연동 필요 여부가 반환된다.

---

### User Story 3 - 연동 해제 및 재연결 준비 (Priority: P3)

사용자가 필요 시 GitHub 연동을 해제하고 재연결 가능한 상태로 전환한다.

**Why this priority**: 계정 교체, 권한 오류, 보안 이슈에 대응하려면 연동 해제 기능이 필수다.

**Independent Test**: 연동 해제 API 호출 후 토큰/연결 정보가 폐기되고, 상태 조회가 `NOT_CONNECTED`로 바뀌는지 확인한다.

**Acceptance Scenarios**:

1. **Given** 사용자가 로그인된 상태, **When** 연동 해제 요청을 하면, **Then** 시스템은 GitHub 토큰과 연결 상태를 폐기한다.
2. **Given** 연동 해제가 완료된 상태, **When** 사용자가 연동 상태를 조회하면, **Then** `NOT_CONNECTED` 상태가 반환된다.

---

### Edge Cases

- OAuth callback 요청에서 인증 코드가 누락되거나 만료된 경우, 로그인 실패 이유가 사용자에게 명확히 안내되어야 한다.
- OAuth callback의 `state` 값이 로그인 시작 시 저장한 값과 다르면, 요청을 거부하고 보안 경고를 남겨야 한다.
- 토큰은 존재하지만 필수 권한이 부족한 경우, 상태가 `CONNECTED`로 오인되지 않아야 한다.
- 한 번 발급된 토큰이 사용자 또는 GitHub 정책에 의해 revoke된 경우, 연동 상태를 유효하지 않음으로 전환하고 재로그인을 유도해야 한다.
- 사용자가 연동 해제 직후 상태 조회를 요청한 경우, 캐시 지연 없이 `NOT_CONNECTED`가 반영되어야 한다.
- GitHub API 일시 장애 시, 상태를 단순 실패가 아닌 재시도 가능한 상태로 구분할 수 있어야 한다.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: 시스템은 GitHub OAuth 시작 URL을 제공해야 하며, `client_id`, `redirect_uri`, `state`를 포함해 인증 시작 요청의 무결성을 보장해야 한다.
- **FR-002**: 시스템은 OAuth callback에서 전달된 authorization code를 사용해 access token 교환 절차를 수행해야 한다.
- **FR-003**: 시스템은 access token 발급 후 GitHub 사용자 정보 조회를 통해 로그인 사용자를 식별하고 서비스 계정에 매핑해야 한다.
- **FR-004**: 시스템은 현재 GitHub 연동 상태를 `NOT_CONNECTED`, `CONNECTED`, `TOKEN_INVALID`, `TOKEN_EXPIRED`, `PERMISSION_MISMATCH`, `RECONNECT_REQUIRED` 중 하나로 반환해야 한다.
- **FR-005**: 시스템은 연동 상태 조회 시 토큰 존재 여부, 토큰 유효성, 필수 권한 충족 여부, 재연동 필요 여부를 포함해야 한다.
- **FR-006**: 시스템은 사용자가 GitHub 연동 해제를 요청하면 서비스 측 토큰 및 연결 정보를 폐기해야 한다.
- **FR-007**: 시스템은 GitHub 연동 상태와 프로젝트별 저장소 상태를 구분해 관리해야 하며, 본 기능에서는 전역 연동 상태만 다룬다.
- **FR-008**: 시스템은 인증/연동 실패 시 사용자에게 이해 가능한 오류 메시지와 다음 행동(재시도 또는 재연동)을 제공해야 한다.
- **FR-009**: 시스템은 기본 UI/안내/AI 응답을 한국어 우선으로 제공해야 한다.
- **FR-010**: 시스템은 로그아웃 요청 시 서비스 세션을 종료해야 한다.
- **FR-011**: 시스템은 GitHub access token과 서비스 로그인 세션(자체 JWT 또는 세션)을 분리 관리해야 하며, 서비스 API 인증에는 서비스 세션만 사용해야 한다.
- **FR-012**: 시스템은 GitHub API 호출에서 토큰 무효/폐기 응답이 감지되면 연동 상태를 `RECONNECT_REQUIRED`로 전환해야 한다.

### Key Entities _(include if feature involves data)_

- **User Account**: 서비스 사용자 계정 단위. 로그인 식별자, 프로필 정보, 가입 상태를 가진다.
- **OAuth Session**: GitHub 인증 과정의 임시 세션 단위. 시작 요청, callback 처리, 세션 생성 상태를 가진다.
- **GitHub Connection**: 사용자의 GitHub 연동 상태 단위. 토큰 보유 여부, 유효성, 권한 충족, 재연동 필요 여부를 가진다.
- **Service Session**: 로그인 후 서비스 접근을 위한 세션 단위. 사용자 식별자, 만료 시각, 로그아웃 상태를 가진다.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 로그인 시작 사용자의 90% 이상이 2분 이내 GitHub 인증을 완료해 로그인 상태에 도달한다.
- **SC-002**: 정상 연동 계정의 상태 조회 요청 95% 이상이 `CONNECTED`를 정확히 반환한다.
- **SC-003**: 무효 토큰 또는 권한 부족 계정의 상태 조회 요청 95% 이상에서 원인에 맞는 상태를 반환한다.
- **SC-004**: 연동 해제 요청 후 1분 이내 상태 조회 시 99% 이상이 `NOT_CONNECTED`를 반환한다.
- **SC-005**: 인증/연동 실패 사례의 90% 이상에서 사용자가 다음 행동을 이해할 수 있는 안내 메시지가 제공된다.

## Assumptions

- MVP 인증은 GitHub 단일 로그인으로 제한한다.
- 사용자는 GitHub 계정을 보유하고 있으며 OAuth 인증을 완료할 수 있다.
- 프로젝트별 저장소 헬스체크는 별도 기능에서 다루며 본 기능 범위에는 포함하지 않는다.
- 한국어 우선 안내 정책은 인증/연동 관련 메시지에도 동일하게 적용한다.
