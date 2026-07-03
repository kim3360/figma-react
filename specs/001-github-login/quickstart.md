# Quickstart: GitHub 로그인 연동

## 1. 준비

1. 환경 변수에 API URL과 OAuth 관련 설정을 준비한다.
2. 의존성 설치 후 개발 서버를 실행한다.

```bash
bun install
bun run dev
```

## 2. 기본 검증 시나리오

1. `/auth/login` 진입 후 "GitHub 로그인" 버튼 클릭
2. 백엔드의 OAuth 시작 URL 응답 확인
3. GitHub 인증 완료 후 `/auth/callback` 처리 확인
4. 로그인 완료 상태에서 사용자 정보 조회 API 성공 확인

## 3. 연동 상태 검증

1. 연동 상태 조회 API 호출
2. 정상 계정: `CONNECTED`
3. 토큰 무효/권한 부족 계정: 원인별 상태(`TOKEN_INVALID`, `PERMISSION_MISMATCH`, `RECONNECT_REQUIRED`) 확인

## 4. 연동 해제 검증

1. 연동 해제 API 호출
2. 연동 상태 재조회 시 `NOT_CONNECTED` 확인

## 5. 작업 종료 공통 점검

```bash
bun run format
bun run typecheck
```
