# 프론트엔드 폴더 구조

이 문서는 프론트엔드 레포의 초기 폴더 역할을 설명합니다.
현재 레포에는 실제 기능 코드가 없으며, 각 담당자가 작업을 시작할 수 있도록 빈 구조만 준비되어 있습니다.

## 전체 구조

```txt
frontend/
  src/
    api/
    assets/
    components/
      layout/
      common/
      document/
      archive/
      profile/
      mobile/
    pages/
    routes/
    types/
    utils/
    data/
    hooks/
    contexts/
    styles/
  public/
  docs/
    specs/
    diagrams/
    meeting-notes/
  index.html
  package.json
  vite.config.ts
  tailwind.config.ts
  postcss.config.js
  eslint.config.js
  .gitignore
  README.md
```

## src

- `src/api`: 백엔드 API 요청 함수 작성 위치
- `src/assets`: 이미지, 아이콘, 정적 리소스 저장 위치
- `src/components/layout`: Header, Sidebar, MobileNav 등 레이아웃 컴포넌트 위치
- `src/components/common`: Button, Card, Modal, Loading 등 공통 컴포넌트 위치
- `src/components/document`: 문서 업로드, 문서 편집기, AI 추천 패널 관련 컴포넌트 위치
- `src/components/archive`: 문서 아카이브, 폴더, 문서 목록 관련 컴포넌트 위치
- `src/components/profile`: 데모 사용자 프로필 입력/수정 컴포넌트 위치
- `src/components/mobile`: 모바일 OCR, 촬영, 음성 명령 관련 컴포넌트 위치
- `src/pages`: 페이지 단위 컴포넌트 작성 위치
- `src/routes`: 라우터 설정 위치
- `src/types`: TypeScript 타입 정의 위치
- `src/utils`: 파일 처리, 날짜 포맷, 텍스트 처리 유틸 함수 위치
- `src/data`: Mock 데이터 또는 초기 더미 데이터 위치
- `src/hooks`: 커스텀 훅 위치
- `src/contexts`: 전역 상태 Context 위치
- `src/styles`: 전역 스타일 또는 Tailwind 관련 스타일 위치
- `src/main.tsx`: React 앱 진입점
- `src/App.tsx`: 초기 앱 루트 컴포넌트. 실제 화면 구현 시 라우터와 페이지 구조로 확장 예정

## public

- `public`: 정적 파일 저장 위치

## docs

- `docs/specs`: 프론트엔드 화면 정의서, UI 명세, API 연동 메모 보관 위치
- `docs/diagrams`: 화면 흐름도, 컴포넌트 구조도 보관 위치
- `docs/meeting-notes`: 프론트엔드 회의록, 의사결정 기록 보관 위치

## 설정 파일

- `index.html`: Vite HTML 엔트리
- `package.json`: npm 스크립트와 프론트엔드 의존성 관리
- `vite.config.ts`: Vite 설정
- `tailwind.config.ts`: Tailwind CSS 설정
- `postcss.config.js`: PostCSS 설정
- `eslint.config.js`: ESLint 설정
