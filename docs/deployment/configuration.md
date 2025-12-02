# 설정

TagFlow의 환경 설정, 설정 항목, 최적화 방법을 안내합니다.

## 환경 변수

### Backend 환경 변수

**파일**: `backend/.env`

#### 필수 설정

```env
# JWT 인증
JWT_SECRET=your-secret-key
JWT_EXPIRATION=1h
JWT_REFRESH_EXPIRATION=7d

# 서버
PORT=3001
NODE_ENV=development

# 데이터베이스
DATABASE_PATH=../data/tagflow.db

# CORS
CORS_ORIGIN=http://localhost:3000
```

#### 선택적 설정

```env
# 로깅
LOG_LEVEL=debug  # debug, info, warn, error

# 백업 (향후 지원)
BACKUP_DIR=./backup
AUTO_BACKUP=true

# 데이터 보존 (향후 지원)
EVENT_RETENTION_DAYS=365
WEBHOOK_LOG_RETENTION_DAYS=90
```

### Frontend 환경 변수

**파일**: `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## NW.js 설정

### package.json

**파일**: `nwjs/package.json`

```json
{
  "name": "tagflow",
  "version": "1.0.0",
  "main": "index.html",
  "window": {
    "title": "TagFlow",
    "width": 1280,
    "height": 800,
    "min_width": 1024,
    "min_height": 768,
    "max_width": 1920,
    "max_height": 1080,
    "position": "center",
    "resizable": true,
    "show": true,
    "frame": true,
    "toolbar": false,
    "icon": "resources/icon.png"
  },
  "chromium-args": "--disable-web-security --allow-file-access-from-files"
}
```

### 창 설정

**크기**:

- `width`, `height`: 기본 창 크기
- `min_width`, `min_height`: 최소 크기
- `max_width`, `max_height`: 최대 크기

**위치**:

- `position`: "center", "mouse", null

**스타일**:

- `resizable`: 크기 조절 가능 여부
- `frame`: 창 프레임 표시 여부
- `toolbar`: 도구 모음 표시 여부

## 데이터베이스 설정

### SQLite 설정

현재는 파일 경로만 설정 가능:

```env
DATABASE_PATH=./data/tagflow.db
```

### 성능 튜닝

**pragma 설정** (코드 수준):

```typescript
// database.service.ts
db.pragma("journal_mode = WAL"); // Write-Ahead Logging
db.pragma("synchronous = NORMAL"); // 성능 향상
db.pragma("cache_size = 10000"); // 캐시 크기
```

## 보존 정책 설정

### 현재 설정 (코드 수준)

**파일**: `backend/src/cleanup/cleanup.service.ts`

```typescript
export class CleanupService {
  private readonly EVENT_RETENTION_DAYS = 365; // 태그 이벤트: 1년
  private readonly WEBHOOK_LOG_RETENTION_DAYS = 90; // 웹훅 로그: 90일
  private readonly CLEANUP_LOG_RETENTION_DAYS = 730; // 정리 로그: 2년
}
```

### 변경 방법

1. 코드 수정
2. 백엔드 재빌드
3. 재시작

### 향후 지원 (환경 변수)

```env
EVENT_RETENTION_DAYS=365
WEBHOOK_LOG_RETENTION_DAYS=90
CLEANUP_LOG_RETENTION_DAYS=730
```

## 로깅 설정

### 로그 레벨

```env
LOG_LEVEL=debug
```

**레벨**:

- `error`: 오류만
- `warn`: 경고 + 오류
- `info`: 정보 + 경고 + 오류 (프로덕션 권장)
- `debug`: 디버그 + 정보 + 경고 + 오류 (개발 권장)
- `verbose`: 모든 로그

### 로그 출력

현재는 콘솔 출력만 지원:

```typescript
// main.ts
app.useLogger(["error", "warn", "info"]);
```

## CORS 설정

### 개발 환경

```env
CORS_ORIGIN=http://localhost:3000
```

### 프로덕션

```env
CORS_ORIGIN=https://your-domain.com
```

### 다중 도메인 (코드 수준)

```typescript
// main.ts
app.enableCors({
  origin: ["http://localhost:3000", "https://your-domain.com"],
  credentials: true,
});
```

## 네트워크 설정

### 포트 설정

**Backend**:

```env
PORT=3001
```

**Frontend** (Next.js):

```json
{
  "scripts": {
    "dev": "next dev -p 3000"
  }
}
```

### 방화벽 설정

**Windows Firewall**:

```powershell
# Backend 포트 허용
New-NetFirewallRule -DisplayName "TagFlow Backend" `
    -Direction Inbound -LocalPort 3001 -Protocol TCP `
    -Action Allow -RemoteAddress LocalSubnet

# Frontend 포트 허용 (개발)
New-NetFirewallRule -DisplayName "TagFlow Frontend" `
    -Direction Inbound -LocalPort 3000 -Protocol TCP `
    -Action Allow -RemoteAddress LocalSubnet
```

## 성능 설정

### Node.js 메모리

```json
{
  "scripts": {
    "start:prod": "node --max-old-space-size=4096 dist/main.js"
  }
}
```

### NW.js 메모리

```json
{
  "chromium-args": "--max-old-space-size=4096"
}
```

## 환경별 설정

### 개발 환경

```env
NODE_ENV=development
LOG_LEVEL=debug
JWT_SECRET=dev-secret-key
DATABASE_PATH=./data/tagflow-dev.db
```

### 테스트 환경

```env
NODE_ENV=test
LOG_LEVEL=warn
DATABASE_PATH=:memory:
```

### 프로덕션 환경

```env
NODE_ENV=production
LOG_LEVEL=info
JWT_SECRET=STRONG-RANDOM-SECRET
DATABASE_PATH=./data/tagflow.db
```

## 설정 우선순위

1. 환경 변수 (`.env` 파일)
2. 코드 내 기본값
3. 시스템 환경 변수

## 설정 검증

### 검증 스크립트

**check-config.ps1**:

```powershell
Write-Host "=== TagFlow 설정 검증 ===" -ForegroundColor Cyan

# .env 파일 확인
if (Test-Path "backend\.env") {
    Write-Host "[OK] .env 파일 존재" -ForegroundColor Green

    $env = Get-Content "backend\.env"

    # JWT_SECRET 검증
    if ($env -match "JWT_SECRET=(.+)") {
        if ($matches[1] -eq "your-secret-key") {
            Write-Host "[경고] JWT_SECRET이 기본값입니다!" -ForegroundColor Red
        } else {
            Write-Host "[OK] JWT_SECRET 설정됨" -ForegroundColor Green
        }
    }

    # PORT 확인
    if ($env -match "PORT=(\d+)") {
        Write-Host "[OK] PORT: $($matches[1])" -ForegroundColor Green
    }
} else {
    Write-Host "[경고] .env 파일이 없습니다" -ForegroundColor Yellow
}

# 데이터베이스 파일 확인
if (Test-Path "data\tagflow.db") {
    $size = (Get-Item "data\tagflow.db").Length / 1MB
    Write-Host "[OK] DB 크기: $([math]::Round($size, 2)) MB" -ForegroundColor Green
} else {
    Write-Host "[경고] 데이터베이스 파일 없음" -ForegroundColor Yellow
}
```

## 문제 해결

### 설정이 적용되지 않음

**확인**:

1. `.env` 파일 위치 확인 (backend 폴더 내)
2. 파일명 정확히 `.env`
3. 서버 재시작
4. 환경 변수 구문 확인 (`KEY=value`, 따옴표 불필요)

### 포트 충돌

**변경**:

```env
# 다른 포트로 변경
PORT=3002
```

```json
// frontend
{
  "scripts": {
    "dev": "next dev -p 3001"
  }
}
```

## 관련 문서

- [시스템 설정](../user-guides/admin/system-settings.md)
- [프로덕션 배포](production-deployment.md)
- [문제 해결](troubleshooting.md)
