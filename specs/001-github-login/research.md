# Research: GitHub 로그인 연동

## Decision 1: OAuth Authorization Code + state 검증 사용

- **Decision**: GitHub OAuth는 authorization code 플로우를 사용하고 callback에서 `state`를 검증한다.
- **Rationale**: CSRF 방지와 로그인 요청-응답 상관관계 확인이 가능하다.
- **Alternatives considered**:
  - state 미검증: 구현은 단순하지만 보안 리스크가 커서 제외.

## Decision 2: GitHub 토큰과 서비스 세션 분리

- **Decision**: GitHub access token은 GitHub API 호출 전용으로 사용하고, 서비스 인증은 별도 세션/JWT를 사용한다.
- **Rationale**: 권한 분리와 보안 경계가 명확해지고, 서비스 내부 권한 제어가 단순해진다.
- **Alternatives considered**:
  - GitHub token을 서비스 인증에 직접 사용: 구현은 빠르지만 토큰 노출/권한 과다 문제로 제외.

## Decision 3: 연동 상태 모델을 다중 상태로 관리

- **Decision**: `NOT_CONNECTED`, `CONNECTED`, `TOKEN_INVALID`, `TOKEN_EXPIRED`, `PERMISSION_MISMATCH`, `RECONNECT_REQUIRED` 상태를 사용한다.
- **Rationale**: "연결됨/안됨" 2값만으로는 복구 액션을 안내하기 어렵다.
- **Alternatives considered**:
  - Boolean connected만 제공: 간단하지만 오류 원인 파악 및 UX 복구 흐름이 부족해 제외.

## Decision 4: 프론트엔드 API 계층에서 에러 표준화

- **Decision**: Axios 계층에서 인증 관련 에러를 공통 포맷으로 가공해 라우트/컴포넌트에 전달한다.
- **Rationale**: 화면별 중복 분기 감소, 한국어 안내 메시지 일관성 확보.
- **Alternatives considered**:
  - 화면별 개별 처리: 빠르게 시작 가능하지만 유지보수 비용 증가로 제외.
