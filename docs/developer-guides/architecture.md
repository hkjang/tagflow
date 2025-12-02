# 아키텍처

TagFlow 시스템의 전체 아키텍처와 기술 스택을 설명합니다.

## 시스템 구조

```
┌─────────────────────────────────────────┐
│           NW.js Desktop App             │
│  ┌─────────────────────────────────┐   │
│  │   Next.js Frontend (React)      │   │
│  │   http://localhost:3000         │   │
│  └────────────┬────────────────────┘   │
│               │ HTTP/REST API           │
│  ┌────────────▼────────────────────┐   │
│  │   NestJS Backend                │   │
│  │   http://localhost:3001         │   │
│  └────────────┬────────────────────┘   │
│               │ SQLite                  │
│  ┌────────────▼────────────────────┐   │
│  │ tagflow.db (SQLite)             │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

## 기술 스택

### Desktop Application

- **NW.js**: Chromium + Node.js
- 크로스 플랫폼 데스크톱 앱

### Frontend

- **Next.js 14**: React 프레임워크
- **React**: UI 라이브러리
- **TypeScript**: 타입 안전성
- **CSS Modules**: 스타일링

### Backend

- **NestJS**: Node.js 프레임워크
- **TypeScript**: 타입 안전성
- **Express**: HTTP 서버
- **bcrypt**: 비밀번호 해싱
- **jsonwebtoken**: JWT 인증

### Database

- **SQLite**: 내장 데이터베이스
- **better-sqlite3**: Node.js SQLite 드라이버

### Shared

- **TypeScript**: 공유 타입 정의

## 컴포넌트 상호작용

### 인증 흐름

```
[Frontend] → POST /auth/login → [Backend]
                                      ↓
                                 [Validate]
                                      ↓
                                  [SQLite]
                                      ↓
                            [Generate JWT]
                                      ↓
[Frontend] ← Access Token ← [Backend]
```

### 이벤트 생성 및 웹훅

```
[RFID Reader] → POST /events → [NestJS Backend]
                                      ↓
                                 [Save Event]
                                      ↓
                                  [SQLite]
                                      ↓
                              [Trigger Webhooks]
                                      ↓
                            [External Systems]
```

## 디렉토리 구조

```
tagflow/
├── nwjs/                   # NW.js 데스크톱 앱
│   ├── main.js            # 메인 프로세스
│   ├── index.html         # 엔트리 포인트
│   └── resources/         # 앱 리소스
├── backend/               # NestJS 백엔드
│   ├── src/
│   │   ├── auth/         # 인증 모듈
│   │   ├── events/       # 이벤트 모듈
│   │   ├── webhooks/     # 웹훅 모듈
│   │   ├── reports/      # 리포트 모듈
│   │   ├── cleanup/      # 정리 모듈
│   │   └── database/     # DB 모듈
│   └── dist/             # 빌드 출력
├── frontend/              # Next.js 프론트엔드
│   ├── src/
│   │   └── app/          # App Router
│   │       ├── events/   # 이벤트 페이지
│   │       ├── reports/  # 리포트 페이지
│   │       └── admin/    # 관리 페이지
│   └── out/              # 정적 빌드
├── shared/                # 공유 타입
│   └── src/
│       └── types/        # TypeScript 타입
└── data/                  # SQLite DB
    └── tagflow.db
```

## 모듈 구조

### Backend Modules

```
AppModule
├── AuthModule
│   ├── AuthController
│   ├── AuthService
│   └── JwtStrategy
├── EventsModule
│   ├── EventsController
│   └── EventsService
├── WebhooksModule
│   ├── WebhooksController
│   ├── WebhooksService
│   └── RetryQueueService
├── ReportsModule
│   ├── ReportsController
│   └── ReportsService
├── CleanupModule
│   └── CleanupService
└── DatabaseModule
```

## 데이터 흐름

### 읽기 (Read)

```
[Frontend Component]
    ↓ fetch('/events')
[Next.js API Route] (선택적)
    ↓ HTTP GET
[NestJS Controller]
    ↓ call service
[NestJS Service]
    ↓ query
[SQLite Database]
    ↓ return data
[Frontend Component] (render)
```

### 쓰기 (Write)

```
[Frontend Form]
    ↓ submit
[NestJS Controller]
    ↓ validate DTO
[NestJS Service]
    ↓ business logic
[SQLite Database]
    ↓ insert/update
[Webhook Service] (async)
    ↓ HTTP POST
[External System]
```

## 보안 구조

### 인증 계층

```
[Request]
    ↓
[JWT Guard] → Verify Token
    ↓ (authenticated)
[Roles Guard] → Check Role
    ↓ (authorized)
[Controller Handler]
```

### 비밀번호 보안

```
[Plain Password]
    ↓ bcrypt.hash (salt rounds: 10)
[Hashed Password]
    ↓ store in DB
[Database]
```

## 성능 고려사항

### Frontend

- Next.js Static Export (빠른 로딩)
- React Memoization
- 코드 스플리팅

### Backend

- 비동기 웹훅 처리 (non-blocking)
- SQLite 인덱스 활용
- 연결 풀링

### Database

- 적절한 인덱스 설계
- 정기적인 VACUUM
- 쿼리 최적화

## 확장성

### 수평 확장 (향후)

- 다중 백엔드 인스턴스
- 로드 밸런서
- Redis 캐싱

### 수직 확장

- SQLite → PostgreSQL 마이그레이션
- 메모리 증설
- SSD 사용

## 관련 문서

- [설치](installation.md)
- [개발 환경](development-environment.md)
- [API 레퍼런스](api-reference.md)
