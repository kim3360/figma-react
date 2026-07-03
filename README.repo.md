# 프로젝트 개요

React 19 + Vite 8 + TypeScript 기반의 프론트엔드 프로젝트이며, Bun을 사용하여 의존성 설치 및 스크립트를 실행합니다.

---

# 실행 방법 (Bun 기준)

## 의존성 설치

bun install

## 개발 서버 실행

bun dev
기본 주소: http://localhost:5173

## 프로덕션 빌드

bun run build

## 빌드 결과 미리보기

bun run preview

---

# 폴더 / 파일 구조 (핵심)

src/ 앱 소스 (컴포넌트, 페이지, 로직)  
public/ 정적 자원  
index.html Vite 엔트리 HTML  
vite.config.ts Vite 설정  
tsconfig\*.json TypeScript 설정  
bun.lock Bun 락파일

---

# 코드 포매팅 (Prettier) 운영 방침

Prettier를 단일 포매터로 사용하여 코드 스타일을 자동으로 통일합니다.

## 운영 원칙

- 코드 스타일은 직접 맞추지 않고 Prettier가 자동으로 처리
- 스타일 관련 논쟁을 줄이고 협업 효율을 높임

## 권장 워크플로우

### 1. 저장 시 자동 포맷

- 에디터에서 format on save 활성화
- Prettier를 기본 formatter로 설정

### 2. 커밋 전 확인사항

전체 타입체크 실행:
bun typecheck
