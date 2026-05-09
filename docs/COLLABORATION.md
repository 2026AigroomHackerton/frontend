# 프론트엔드 협업 규칙

## 1. 기본 원칙

이 레포는 AI Mobile Document Assistant의 프론트엔드 작업 공간입니다.
현재는 Vite + React + TypeScript + Tailwind CSS 환경과 초기 폴더 구조가 준비되어 있습니다.

## 2. 담당 영역 예시

- `src/pages`: 페이지 단위 화면
- `src/components/layout`: Header, Sidebar, MobileNav 등 레이아웃 컴포넌트
- `src/components/common`: Button, Card, Modal, Loading 등 공통 컴포넌트
- `src/components/document`: 문서 업로드, 문서 편집기, AI 추천 패널 관련 컴포넌트
- `src/components/archive`: 문서 아카이브, 폴더, 문서 목록 관련 컴포넌트
- `src/components/profile`: 데모 사용자 프로필 입력/수정 컴포넌트
- `src/components/mobile`: 모바일 OCR, 촬영, 음성 명령 관련 컴포넌트
- `src/api`: 백엔드 API 요청 함수
- `src/types`: TypeScript 타입 정의

## 3. 브랜치 규칙

브랜치명 예시:

- `feature/frontend-editor`
- `feature/mobile-ocr`
- `feature/archive-ui`
- `feature/profile-form`
- `docs/frontend-spec-update`

## 4. 커밋 메시지 규칙

예시:

- `chore: 프론트엔드 초기 폴더 구조 추가`
- `feat: 문서 업로드 UI 추가`
- `feat: OCR 화면 추가`
- `feat: 아카이브 목록 화면 추가`
- `fix: 타입 오류 수정`
- `docs: 프론트엔드 명세 업데이트`

## 5. 충돌 방지 규칙

- 같은 컴포넌트 파일을 여러 명이 동시에 수정하지 않는다.
- 공통 컴포넌트 수정 전 팀원에게 공유한다.
- `src/types` 수정 전 백엔드 응답 구조와 맞는지 확인한다.
- API 요청 함수 변경 시 백엔드 담당자에게 공유한다.
- Pull 전에 항상 최신 main을 가져온다.
- Merge 전 화면 실행 확인을 한다.

## 6. AI 활용 주의사항

- AI가 만든 파일이 기존 폴더 역할과 맞는지 확인한다.
- 같은 역할의 컴포넌트를 중복 생성하지 않는다.
- API 경로를 임의로 바꾸지 않는다.
- 명세서와 다른 화면 흐름을 만들 경우 반드시 공유한다.
