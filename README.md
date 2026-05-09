# AI Mobile Document Assistant Frontend

## Kakao Share Checklist

- Kakao Developers > JavaScript SDK domain: `http://localhost:5173`
- Kakao Developers > JavaScript SDK domain: `https://frontend-pnyn.onrender.com`
- Kakao Developers > Product link management > Web domain: `http://localhost:5173`
- Kakao Developers > Product link management > Web domain: `https://frontend-pnyn.onrender.com`
- `.env`: `VITE_KAKAO_JS_KEY=JavaScript key`
- Restart `npm run dev` after changing `.env`.
- Local test URL: `http://localhost:5173`
- Deployed URL: `https://frontend-pnyn.onrender.com`

문서를 찍고, 말로 수정하는 AI 기반 모바일 문서 비서 프로젝트의 프론트엔드 레포입니다.

## 프로젝트 개요

이 레포는 해커톤 MVP의 사용자 화면을 담당합니다.
추후 React + TypeScript + Tailwind CSS 기반으로 모바일 반응형 UI, 문서 업로드 흐름, OCR 흐름, 음성 명령 입력 UI, AI 문서 수정 화면을 구현할 예정입니다.

현재 레포는 Vite + React + TypeScript + Tailwind CSS 기반의 최소 실행 환경과 협업용 폴더 구조를 포함합니다.

## 주요 구현 예정 범위

- 모바일 반응형 UI
- 이미지 문서 촬영 및 OCR 화면
- 음성 명령 입력 UI
- AI 문서 수정 흐름
- 문서 아카이브 화면
- 데모 사용자 프로필 입력/수정 화면

## 프로젝트 구조

- `src/api`: 백엔드 API 요청 함수 작성 위치
- `src/assets`: 이미지, 아이콘, 정적 리소스 저장 위치
- `src/components`: 역할별 UI 컴포넌트 작성 위치
- `src/pages`: 페이지 단위 컴포넌트 작성 위치
- `src/routes`: 라우터 설정 위치
- `src/types`: TypeScript 타입 정의 위치
- `src/utils`: 파일 처리, 날짜 포맷, 텍스트 처리 유틸 함수 위치
- `src/data`: Mock 데이터 또는 초기 더미 데이터 위치
- `src/hooks`: 커스텀 훅 위치
- `src/contexts`: 전역 상태 Context 위치
- `src/styles`: 전역 스타일 또는 Tailwind 관련 스타일 위치
- `public`: 정적 파일 저장 위치
- `docs`: 프론트엔드 관련 명세, 다이어그램, 회의록 관리 위치

자세한 구조는 `docs/STRUCTURE.md`를 확인합니다.

## 환경 세팅

필요 환경:
- Node.js 22 이상 권장
- npm 10 이상 권장

설치:

```bash
npm install
```

개발 서버 실행:

```bash
npm run dev
```

빌드 확인:

```bash
npm run build
```

## 작업 방법

프론트엔드 담당자는 이 레포 안에서 작업합니다.
공통 컴포넌트, 타입, API 요청 구조를 바꿀 때는 백엔드 담당자와 먼저 공유합니다.

## 주의사항

- 같은 역할의 컴포넌트를 중복 생성하지 않습니다.
- API 응답 타입을 임의로 바꾸지 않습니다.
- 백엔드 API 경로 변경이 필요하면 백엔드 담당자와 먼저 맞춥니다.
- 구현 전 담당 폴더와 파일명을 먼저 정합니다.
