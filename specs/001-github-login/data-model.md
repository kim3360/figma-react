# Data Model: GitHub 로그인 연동

## 1) UserAccount

- **Purpose**: 서비스 사용자 식별 및 기본 프로필 표현
- **Fields**:
  - `userId` (string, required)
  - `githubLogin` (string, optional)
  - `displayName` (string, optional)
  - `createdAt` (datetime, required)
  - `updatedAt` (datetime, required)

## 2) OAuthSession

- **Purpose**: 로그인 시작 요청과 callback 무결성(`state`) 추적
- **Fields**:
  - `oauthSessionId` (string, required)
  - `state` (string, required, unique)
  - `provider` (enum: `github`)
  - `status` (enum: `INITIATED`, `CALLBACK_RECEIVED`, `COMPLETED`, `FAILED`)
  - `expiresAt` (datetime, required)
  - `createdAt` (datetime, required)

## 3) GitHubConnection

- **Purpose**: GitHub 연동 가능 여부 및 복구 필요 상태 표현
- **Fields**:
  - `connectionId` (string, required)
  - `userId` (string, required)
  - `provider` (enum: `github`)
  - `status` (enum: `NOT_CONNECTED`, `CONNECTED`, `TOKEN_INVALID`, `TOKEN_EXPIRED`, `PERMISSION_MISMATCH`, `RECONNECT_REQUIRED`)
  - `tokenPresent` (boolean, required)
  - `tokenValid` (boolean, required)
  - `requiredPermissionsSatisfied` (boolean, required)
  - `reconnectRequired` (boolean, required)
  - `lastValidatedAt` (datetime, optional)

## 4) ServiceSession

- **Purpose**: 서비스 API 인증 세션 관리
- **Fields**:
  - `sessionId` (string, required)
  - `userId` (string, required)
  - `issuedAt` (datetime, required)
  - `expiresAt` (datetime, required)
  - `revokedAt` (datetime, optional)

## Relationships

- `UserAccount` 1 : N `ServiceSession`
- `UserAccount` 1 : 1 `GitHubConnection`
- `OAuthSession`은 callback 성공 시 `UserAccount`와 연결되어 로그인 완료를 만든다.

## Validation Rules

- callback 처리 시 `OAuthSession.state`가 일치하지 않으면 실패 처리
- `GitHubConnection.status=CONNECTED`일 때는 `tokenPresent=true` 및 `requiredPermissionsSatisfied=true`를 만족해야 함
- 연동 해제 시 `GitHubConnection.status=NOT_CONNECTED`, `tokenPresent=false`로 전환
