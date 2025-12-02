# 프로덕션 배포

TagFlow를 프로덕션 환경에 배포하는 방법을 안내합니다.

## 배포 전 체크리스트

- [ ] **JWT Secret 변경**: 강력한 랜덤 키 설정
- [ ] **기본 비밀번호 변경**: admin 계정 비밀번호 변경
- [ ] **환경 변수 설정**: 프로덕션 설정 적용
- [ ] **데이터베이스 백업**: 초기 백업 설정
- [ ] **로그 레벨 조정**: info 또는 warn으로 설정
- [ ] **HTTPS 사용**: 웹훅 URL HTTPS 확인
- [ ] **방화벽 설정**: 필요한 포트만 허용
- [ ] **테스트 완료**: 모든 기능 테스트

## 환경 변수 설정

### Production 환경 변수

`backend/.env.production`:

```env
# 환경
NODE_ENV=production

# JWT (필수 변경!)
JWT_SECRET=YOUR-STRONG-RANDOM-SECRET-KEY-HERE
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# 서버
PORT=3001

# 데이터베이스
DATABASE_PATH=./data/tagflow.db

# CORS (실제 도메인으로 변경)
CORS_ORIGIN=https://your-domain.com

# 로깅
LOG_LEVEL=info
```

### JWT Secret 생성

```powershell
# PowerShell로 강력한 Secret 생성
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | % {[char]$_})
```

## 빌드

### 프로덕션 빌드

```powershell
# 전체 빌드
npm run build

# 개별 빌드
cd backend
npm run build

cd ../frontend
npm run build:export || npm run build

cd ../shared
npm run build
```

### 최적화

**Backend**:

- 불필요한 의존성 제거
- 프로덕션 모드로 실행

**Frontend**:

- 정적 빌드 (Next.js export)
- 이미지 최적화
- 코드 압축

## 배포 방법

### 옵션 1: NW.js 데스크톱 앱

```powershell
# 패키징
npm run build:exe

# 인스톨러 배포
# TagFlow-Setup-1.0.0.exe 배포
```

상세한 내용은 [NW.js 패키징](nwjs-packaging.md)을 참조하세요.

### 옵션 2: 독립 서버 배포

#### Backend 서버

```powershell
# 프로덕션 모드 실행
cd backend
npm run start:prod
```

#### Frontend 서버

```powershell
# Next.js 서버
cd frontend
npm run start

# 또는 Nginx/Apache로 정적 파일 서빙
```

## 보안 설정

### 비밀번호 정책

**관리자 조치**:

1. 첫 배포 후 즉시 로그인
2. 기본 admin 비밀번호 변경
3. 강력한 비밀번호 사용:
   - 최소 12자 이상
   - 대소문자, 숫자, 특수문자 혼합

### 데이터베이스 보안

**파일 권한**:

```powershell
# Windows: 관리자만 접근
icacls data\tagflow.db /grant Administrators:F /inheritance:r
```

**백업 암호화**:

- 백업 파일은 암호화하여 보관
- 안전한 위치에 저장

### 네트워크 보안

**방화벽 규칙**:

```powershell
# 로컬 네트워크만 허용 (Windows Firewall)
New-NetFirewallRule -DisplayName "TagFlow Backend" `
    -Direction Inbound -LocalPort 3001 -Protocol TCP `
    -Action Allow -RemoteAddress LocalSubnet
```

**HTTPS 사용**:

- 웹훅 URL은 HTTPS만 허용
- 필요시 리버스 프록시 (Nginx) 사용

## 모니터링

### 로그 모니터링

**로그 파일** (향후 지원):

```env
LOG_FILE=./logs/tagflow.log
```

**정기 검토**:

- 일일: 오류 로그
- 주간: 웹훅 성능
- 월간: 전체 시스템 상태

### 시스템 모니터링

**체크 항목**:

- CPU 사용률
- 메모리 사용량
- 디스크 공간
- 네트워크 트래픽

## 백업 전략

### 자동 백업

**daily-backup.ps1**:

```powershell
$timestamp = Get-Date -Format "yyyyMMdd"
$backupDir = "D:\Backups\TagFlow"
$dbPath = "data\tagflow.db"

# 백업 디렉토리 생성
New-Item -Path "$backupDir\$timestamp" -ItemType Directory -Force

# 데이터베이스 백업
Copy-Item $dbPath -Destination "$backupDir\$timestamp\tagflow.db"

# 설정 파일 백업
Copy-Item backend\.env -Destination "$backupDir\$timestamp\.env"

# 7일 이상 된 백업 삭제
Get-ChildItem $backupDir |
    Where-Object { $_.CreationTime -lt (Get-Date).AddDays(-7) } |
    Remove-Item -Recurse -Force

Write-Host "Backup completed: $backupDir\$timestamp"
```

**Windows 작업 스케줄러로 자동화**:

```powershell
$trigger = New-ScheduledTaskTrigger -Daily -At 2AM
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" `
    -Argument "-File C:\TagFlow\daily-backup.ps1"

Register-ScheduledTask -TaskName "TagFlow Daily Backup" `
    -Trigger $trigger -Action $action
```

###복원

```powershell
# 애플리케이션 중지
# ...

# 백업에서 복원
Copy-Item "D:\Backups\TagFlow\20251203\tagflow.db" `
    -Destination "data\tagflow.db" -Force

# 애플리케이션 재시작
```

## 업데이트

### 애플리케이션 업데이트

1. **백업 생성**

   ```powershell
   .\daily-backup.ps1
   ```

2. **애플리케이션 중지**

3. **파일 업데이트**

   ```powershell
   # 새 버전 파일 복사
   Copy-Item NewVersion\* -Destination TagFlow\ -Recurse -Force
   ```

4. **마이그레이션 실행** (필요시)

   ```powershell
   cd backend
   npm run migrate
   ```

5. **애플리케이션 재시작**

## 성능 튜닝

### 데이터베이스

**VACUUM 실행**:

```sql
VACUUM;
ANALYZE;
```

**인덱스 최적화**:

- 주기적으로 REINDEX 실행
- 쿼리 성능 모니터링

### Backend

**메모리 설정**:

```json
{
  "scripts": {
    "start:prod": "node --max-old-space-size=4096 dist/main.js"
  }
}
```

## 문제 해결

### 서버가 시작되지 않음

**확인**:

1. 환경 변수 설정
2. 데이터베이스 파일 존재
3. 포트 사용 가능 여부
4. 로그 확인

### 성능 저하

**조치**:

1. 데이터베이스 VACUUM
2. 오래된 데이터 정리
3. 로그 레벨 낮춤 (warn 이상)
4. 리소스 사용량 확인

## 관련 문서

- [NW.js 패키징](nwjs-packaging.md)
- [설정](configuration.md)
- [문제 해결](troubleshooting.md)
- [시스템 설정](../user-guides/admin/system-settings.md)
