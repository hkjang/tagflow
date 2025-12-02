# 설치

TagFlow RFID 태그 관리 시스템의 개발 환경 설치 가이드입니다.

## 사전 요구사항

### 필수 소프트웨어

- **Node.js**: 18.0.0 이상
- **npm**: 9.0.0 이상
- **SQLite**: 3.x (Node.js sqlite3 패키지 포함)
- **Git**: 버전 관리용 (선택사항)

### 운영 체제

- Windows 10/11 (주요 타겟)
- macOS 10.15+
- Linux (Ubuntu 20.04+)

## 설치 단계

### 1. 저장소 클론

```powershell
git clone https://github.com/your-org/tagflow.git
cd tagflow
```

### 2. 의존성 설치

**root 디렉토리**:

```powershell
npm install
```

이 명령은 모든 workspace(backend, frontend, nwjs, shared)의 의존성을 설치합니다.

### 3. Shared 모듈 빌드

```powershell
cd shared
npm run build
cd ..
```

shared 모듈은 backend와 frontend가 공유하는 TypeScript 타입 정의를 포함합니다.

### 4. 백엔드 빌드

```powershell
cd backend
npm run build
```

### 5. 데이터베이스 초기화

**마이그레이션 실행**:

```powershell
npm run migrate
```

**초기 데이터 Seed**:

```powershell
npm run seed
```

기본 관리자 계정 생성:

- Username: `admin`
- Password: `admin123`

### 6. 프론트엔드 빌드 (선택사항)

개발 모드에서는 빌드하지 않아도 됩니다.

```powershell
cd ../frontend
npm run build
```

## 환경 변수 설정

### Backend 환경 변수

`backend/.env` 파일 생성:

```env
# JWT 설정
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRATION=1h
JWT_REFRESH_EXPIRATION=7d

# 서버 포트
PORT=3001

# 데이터베이스
DATABASE_PATH=../data/tagflow.db

# CORS
CORS_ORIGIN=http://localhost:3000

# 로깅
LOG_LEVEL=debug
```

## 디렉토리 구조

설치 후 프로젝트 구조:

```
tagflow/
├── backend/               # NestJS 백엔드
│   ├── dist/             # 빌드 출력
│   ├── src/              # 소스 코드
│   ├── node_modules/     # 의존성
│   └── package.json
├── frontend/             # Next.js 프론트엔드
│   ├── out/              # 빌드 출력 (정적)
│   ├── src/              # 소스 코드
│   ├── node_modules/
│   └── package.json
├── nwjs/                 # NW.js 데스크톱 앱
│   ├── resources/        # 앱 리소스
│   ├── main.js          # 메인 프로세스
│   └── package.json
├── shared/               # 공유 타입
│   ├── dist/            # 빌드된 타입
│   ├── src/
│   └── package.json
├── data/                 # SQLite DB (생성됨)
│   └── tagflow.db
├── node_modules/         # Root 의존성
└── package.json          # Workspace 설정
```

## 문제 해결

### Windows에서 node-gyp 오류

**증상**: sqlite3 또는 기타 네이티브 모듈 빌드 실패

**해결**:

```powershell
# Windows Build Tools 설치
npm install --global windows-build-tools

# 재시도
npm install
```

### 포트 충돌

**증상**: EADDRINUSE 오류

**해결**:

```powershell
# 사용 중인 프로세스 찾기
netstat -ano | findstr :3001

# 프로세스 종료
taskkill /PID <PID> /F
```

### SQLite 데이터베이스 권한 오류

**증상**: Cannot open database

**해결**:

```powershell
# data 디렉토리에 쓰기 권한 확인
icacls data /grant Users:F
```

## 다음 단계

설치 완료 후:

1. **[개발 환경](development-environment.md)** - 개발 서버 실행
2. **[데이터베이스 스키마](database-schema.md)** - DB 구조 이해
3. **[아키텍처](architecture.md)** - 시스템 구조 파악

## 관련 문서

- [QUICKSTART.md](../../QUICKSTART.md) - 빠른 시작 가이드
- [README.md](../../README.md) - 프로젝트 개요
