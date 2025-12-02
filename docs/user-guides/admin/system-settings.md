# 시스템 설정

TagFlow 시스템의 보안 및 환경 설정을 관리하는 방법을 안내합니다.

```
⚠️ 관리자 전용 기능
시스템 설정은 관리자(Admin) 역할만 변경할 수 있습니다.
```

## 설정 개요

TagFlow는 다양한 설정 옵션을 제공합니다:

- **보안 설정**: JWT, 세션, 비밀번호 정책
- **시스템 설정**: 데이터베이스, 로깅
- **환경 변수**: 프로덕션 환경 설정

## 보안 설정

### JWT (JSON Web Token) 설정

JWT는 사용자 인증에 사용되는 토큰입니다.

#### JWT Secret 설정

**기본값**: `your-secret-key` (개발 환경용)

```
⚠️ 보안 경고
프로덕션 환경에서는 반드시 강력한 Secret으로 변경하세요!
```

**변경 방법**:

1. **환경 변수 파일 생성**

   `backend/.env` 파일을 생성하거나 편집:

   ```env
   JWT_SECRET=your-super-secret-key-change-this-in-production
   JWT_EXPIRATION=1h
   JWT_REFRESH_EXPIRATION=7d
   ```

2. **강력한 Secret 생성**

   PowerShell에서 랜덤 Secret 생성:

   ```powershell
   # 32바이트 랜덤 문자열 생성
   -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | % {[char]$_})
   ```

3. **백엔드 재시작**

   ```bash
   cd backend
   npm run start:dev
   ```

#### JWT 만료 시간

**Access Token**:

- 기본값: `1h` (1시간)
- 권장값: `15m` ~ `1h`

**Refresh Token**:

- 기본값: `7d` (7일)
- 권장값: `7d` ~ `30d`

**설정 예시**:

```env
# 15분 access token, 14일 refresh token
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=14d
```

### 비밀번호 정책

현재 버전의 비밀번호 요구사항:

- **최소 길이**: 8자
- **권장 사항**:
  - 영문 대소문자 혼합
  - 숫자 포함
  - 특수문자 포함

```
💡 향후 업데이트
더 엄격한 비밀번호 정책 설정 기능이 추가될 예정입니다.
```

### 세션 보안

#### 세션 타임아웃

사용자 세션은 JWT 만료 시간에 의해 관리됩니다.

- **자동 로그아웃**: Access token 만료 시
- **갱신**: Refresh token으로 자동 갱신
- **완전 만료**: Refresh token 만료 시 재로그인 필요

#### 보안 헤더

백엔드는 다음 보안 헤더를 자동으로 설정합니다:

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
```

## 데이터베이스 설정

### SQLite 설정

TagFlow는 SQLite를 기본 데이터베이스로 사용합니다.

#### 데이터베이스 위치

**기본 경로**: `data/tagflow.db`

**변경 방법**:

`backend/.env` 파일:

```env
DATABASE_PATH=./custom/path/tagflow.db
```

#### 데이터베이스 백업 위치

백업 파일 저장 경로 설정:

```env
BACKUP_DIR=./backup
```

### 연결 풀 설정

SQLite는 경량 데이터베이스로 연결 풀 설정이 제한적입니다.

기본 설정으로 충분하지만, 필요시 코드 수준에서 조정 가능합니다.

## 로깅 설정

### 로그 레벨

백엔드 로그 레벨 설정:

```env
LOG_LEVEL=info
```

사용 가능한 레벨:

- `error`: 오류만 로깅
- `warn`: 경고 및 오류
- `info`: 정보, 경고, 오류 (기본값)
- `debug`: 디버그 정보 포함
- `verbose`: 모든 로그

**프로덕션**: `info` 또는 `warn` 권장  
**개발**: `debug` 또는 `verbose` 권장

### 로그 파일

현재는 콘솔 출력만 지원합니다.

향후 파일 로깅 기능이 추가될 예정입니다.

## 서버 설정

### 포트 설정

**백엔드 포트** (기본값: 3001):

```env
PORT=3001
```

**프론트엔드 포트** (기본값: 3000):
프론트엔드는 `frontend/package.json`에서 설정:

```json
{
  "scripts": {
    "dev": "next dev -p 3000"
  }
}
```

### CORS 설정

Cross-Origin Resource Sharing 설정:

```env
CORS_ORIGIN=http://localhost:3000
```

프로덕션에서 실제 프론트엔드 도메인으로 변경:

```env
CORS_ORIGIN=https://tagflow.yourcompany.com
```

## 프로덕션 환경 설정

### 환경 변수 체크리스트

프로덕션 배포 전 확인할 환경 변수:

```env
# 보안 - 필수 변경
JWT_SECRET=<strong-random-secret>

# 토큰 만료 시간
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# 데이터베이스
DATABASE_PATH=./data/tagflow.db

# 서버
PORT=3001
NODE_ENV=production

# CORS
CORS_ORIGIN=https://your-frontend-domain.com

# 로깅
LOG_LEVEL=info
```

### 환경별 설정 파일

#### 개발 환경 (backend/.env.development)

```env
NODE_ENV=development
LOG_LEVEL=debug
JWT_SECRET=dev-secret-key
CORS_ORIGIN=http://localhost:3000
```

#### 프로덕션 환경 (backend/.env.production)

```env
NODE_ENV=production
LOG_LEVEL=info
JWT_SECRET=<strong-production-secret>
CORS_ORIGIN=https://tagflow.production.com
```

사용:

```bash
# 개발
npm run start:dev

# 프로덕션
npm run start:prod
```

## NW.js 애플리케이션 설정

### NW.js 설정 파일

`nwjs/package.json`:

```json
{
  "name": "tagflow",
  "main": "index.html",
  "window": {
    "title": "TagFlow",
    "width": 1280,
    "height": 800,
    "min_width": 1024,
    "min_height": 768,
    "position": "center",
    "resizable": true,
    "show": true,
    "frame": true,
    "toolbar": false
  }
}
```

### 창 크기 설정

**기본 크기**:

- 너비: 1280px
- 높이: 800px

**최소 크기**:

- 최소 너비: 1024px
- 최소 높이: 768px

### 아이콘 설정

애플리케이션 아이콘:

- Windows: `nwjs/resources/icon.ico`
- macOS: `nwjs/resources/icon.icns`
- Linux: `nwjs/resources/icon.png`

## 백업 및 복원 설정

### 자동 백업 설정

현재 버전은 자동 백업을 지원하지 않습니다.

수동 백업 스크립트를 사용하세요:

```powershell
# Windows 작업 스케줄러로 자동화
# backup-schedule.ps1

$trigger = New-ScheduledTaskTrigger -Daily -At 2AM
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" `
    -Argument "-File C:\path\to\backup-db.ps1"
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable

Register-ScheduledTask -TaskName "TagFlow DB Backup" `
    -Trigger $trigger -Action $action -Settings $settings
```

### 백업 보존 정책

백업 파일 보존:

- **일일 백업**: 7일 보관
- **주간 백업**: 4주 보관
- **월간 백업**: 12개월 보관

## 성능 튜닝

### 데이터베이스 최적화

주기적으로 실행:

```sql
-- 데이터베이스 압축 및 최적화
VACUUM;

-- 통계 업데이트
ANALYZE;

-- 인덱스 재구축
REINDEX;
```

PowerShell 스크립트:

```powershell
sqlite3 data\tagflow.db "VACUUM; ANALYZE; REINDEX;"
```

### 메모리 설정

NW.js 메모리 제한 조정 (고급):

`nwjs/package.json`에 Chromium 플래그 추가:

```json
{
  "chromium-args": "--max-old-space-size=4096"
}
```

## 보안 강화

### 프로덕션 보안 체크리스트

- [ ] **JWT Secret 변경**: 강력한 랜덤 키 사용
- [ ] **HTTPS 사용**: 웹훅은 HTTPS URL만 허용
- [ ] **CORS 제한**: 신뢰할 수 있는 도메인만 허용
- [ ] **기본 비밀번호 변경**: admin 계정 비밀번호 즉시 변경
- [ ] **최소 권한원칙**: 관리자 계정 최소화
- [ ] **정기 백업**: 자동화된 백업 설정
- [ ] **로그 모니터링**: 정기적인 로그 검토
- [ ] **업데이트**: 의존성 패키지 정기 업데이트

### 방화벽 설정

**인바운드 규칙**:

- 포트 3001 (백엔드): 로컬 네트워크만 허용
- 포트 3000 (프론트엔드): NW.js만 접근

**외부 접근 차단**:

```powershell
# Windows 방화벽 규칙 (로컬 네트워크만 허용)
New-NetFirewallRule -DisplayName "TagFlow Backend" `
    -Direction Inbound -LocalPort 3001 -Protocol TCP `
    -Action Allow -RemoteAddress LocalSubnet
```

## 설정 백업

### 설정 파일 백업

중요한 설정 파일:

- `backend/.env`
- `backend/.env.production`
- `nwjs/package.json`
- `package.json`

백업 스크립트:

```powershell
# config-backup.ps1
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = "config-backup\$timestamp"

New-Item -Path $backupDir -ItemType Directory -Force

Copy-Item "backend\.env*" -Destination $backupDir
Copy-Item "nwjs\package.json" -Destination "$backupDir\nwjs-package.json"
Copy-Item "package.json" -Destination "$backupDir\root-package.json"

Write-Host "설정 백업 완료: $backupDir"
```

## 문제 해결

### JWT 토큰 오류

**증상**: "Invalid token" 오류가 발생합니다.

**원인**:

- JWT Secret이 변경됨
- 토큰이 만료됨

**해결**:

1. 모든 사용자 로그아웃
2. 새로 로그인
3. Secret 변경 시 서버 재시작

### CORS 오류

**증상**: 프론트엔드에서 API 호출 시 CORS 오류

**해결**:

1. `CORS_ORIGIN` 환경 변수 확인
2. 프론트엔드 도메인과 일치하는지 검증
3. 백엔드 재시작

### 데이터베이스 잠금

**증상**: "database is locked" 오류

**해결**:

1. 다른 프로세스가 DB를 사용 중인지 확인
2. 백엔드 인스턴스 중복 실행 확인
3. DB 파일 권한 확인

## 관리자 도구

### 환경 변수 확인 스크립트

```powershell
# check-env.ps1
Write-Host "=== TagFlow 환경 변수 점검 ==="

$envFile = "backend\.env"

if (Test-Path $envFile) {
    $content = Get-Content $envFile

    # JWT Secret 확인
    if ($content -match "JWT_SECRET=(.+)") {
        if ($matches[1] -eq "your-secret-key") {
            Write-Host "[경고] JWT_SECRET이 기본값입니다!" -ForegroundColor Red
        } else {
            Write-Host "[OK] JWT_SECRET 설정됨" -ForegroundColor Green
        }
    } else {
        Write-Host "[경고] JWT_SECRET 미설정" -ForegroundColor Yellow
    }

    # PORT 확인
    if ($content -match "PORT=(.+)") {
        Write-Host "[OK] PORT: $($matches[1])" -ForegroundColor Green
    }

} else {
    Write-Host "[경고] .env 파일이 없습니다" -ForegroundColor Red
}
```

### 시스템 상태 확인

```powershell
# system-status.ps1
Write-Host "=== TagFlow 시스템 상태 ==="

# 데이터베이스 크기
$dbSize = (Get-Item "data\tagflow.db").Length / 1MB
Write-Host "DB 크기: $([math]::Round($dbSize, 2)) MB"

# 프로세스 확인
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
Write-Host "Node 프로세스: $($nodeProcesses.Count)개 실행 중"

# 포트 사용 확인
$port3001 = Test-NetConnection -ComputerName localhost -Port 3001 -WarningAction SilentlyContinue
if ($port3001.TcpTestSucceeded) {
    Write-Host "백엔드 (3001): 실행 중" -ForegroundColor Green
} else {
    Write-Host "백엔드 (3001): 중지됨" -ForegroundColor Red
}
```

## 관련 문서

- [프로덕션 배포](../../deployment/production-deployment.md)
- [설정 가이드](../../deployment/configuration.md)
- [보안 모범 사례](../../deployment/production-deployment.md#보안)
- [문제 해결](../../deployment/troubleshooting.md)
