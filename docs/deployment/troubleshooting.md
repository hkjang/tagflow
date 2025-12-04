# 문제 해결

TagFlow 사용 중 발생할 수 있는 일반적인 문제와 해결 방법을 안내합니다.

## 일반 문제

### 애플리케이션이 시작되지 않음

#### Backend 시작 실패

**증상**: Backend 서버가 실행되지 않거나 즉시 종료됨

**확인 사항**:

1. **Node.js 버전**

   ```powershell
   node --version  # 18.0.0 이상 필요
   ```

2. **포트 충돌**

   ```powershell
   netstat -ano | findstr :3001
   taskkill /PID <PID> /F
   ```

3. **데이터베이스 파일**

   ```powershell
   # data\tagflow.db 존재 확인
   Test-Path data\tagflow.db

   # 없으면 마이그레이션 실행
   cd backend
   npm run migrate
   ```

4. **환경 변수**
   ```powershell
   # backend\.env 존재 확인
   Get-Content backend\.env
   ```

#### Frontend 시작 실패

**증상**: Frontend가 빌드되지 않거나 실행되지 않음

**해결**:

1. **의존성 재설치**

   ```powershell
   cd frontend
   Remove-Item node_modules -Recurse -Force
   npm install
   ```

2. **캐시 삭제**
   ```powershell
   Remove-Item .next -Recurse -Force
   npm run dev
   ```

## 인증 문제

### 로그인할 수 없음

**증상**: Username/password 입력해도 401 오류

**확인**:

1. **자격 증명 확인**

   - Username: `admin`
   - Password: `admin123` (기본값)
   - 대소문자 구분

2. **Seed 데이터 확인**

   ```powershell
   cd backend
   npm run seed
   ```

3. **데이터베이스 확인**
   ```powershell
   sqlite3 data\tagflow.db
   SELECT * FROM users WHERE username = 'admin';
   .exit
   ```

### Token 오류

**증상**: "Invalid token" 또는 401 오류

**해결**:

1. **로그아웃 후 재로그인**
2. **JWT Secret 확인**
   - Backend 재시작 시 Secret 변경되었는지 확인
3. **브라우저 캐시/쿠키 삭제**

## 데이터베이스 문제

### DB 잠금 오류

**증상**: `SQLITE_BUSY: database is locked`

**원인**: 여러 프로세스가 DB에 동시 접근

**해결**:

```powershell
# 모든 node 프로세스 종료
Stop-Process -Name node -Force

# 다시 시작
npm run dev
```

### DB 파일 손상

**증상**: `malformed database` 또는 읽기 오류

**해결**:

1. **백업에서 복원**

   ```powershell
   Copy-Item backup\tagflow.db -Destination data\tagflow.db -Force
   ```

2. **DB 재생성** (최후 수단)
   ```powershell
   Remove-Item data\tagflow.db
   cd backend
   npm run migrate
   npm run seed
   ```

### 디스크 공간 부족

**증상**: DB 쓰기 실패

**해결**:

1. **데이터 정리**

   - 관리자 로그인 (자동 정리)
   - 수동 정리 실행

2. **VACUUM 실행**
   ```sql
   sqlite3 data\tagflow.db "VACUUM;"
   ```

## 웹훅 문제

### 웹훅이 전송되지 않음

**증상**: 이벤트 생성되지만 웹훅 전송 안 됨

**확인**:

1. **웹훅 활성화 상태**

   - Admin > 웹훅에서 활성화 확인

2. **웹훅 로그 확인**

   - 웹훅 로그 페이지에서 오류 확인

3. **테스트 실행**
   - 웹훅 테스트 버튼 클릭
   - 결과 확인

### 웹훅 계속 실패

**증상**: 모든 웹훅 전송이 실패

**원인별 해결**:

**404 Not Found**:

```
URL 경로 확인
https://api.example.com/webhook (정확한 경로)
```

**401/403 Unauthorized**:

```
인증 헤더 및 토큰 재확인
Authorization: Bearer {올바른_토큰}
```

**500 Internal Server Error**:

```
- 페이로드 형식 확인
- 외부 시스템 로그 확인
- 필드 매핑 재검토
```

**Timeout**:

```
- 대상 서버 성능 확인
- 타임아웃 설정 증가 (코드 수준)
- 네트워크 지연 점검
```

## 성능 문제

### 애플리케이션이 느림

**증상**: 페이지 로딩이나 API 응답이 느림

**해결**:

1. **데이터베이스 최적화**

   ```sql
   VACUUM;
   ANALYZE;
   REINDEX;
   ```

2. **오래된 데이터 정리**

   - 관리자 로그인하여 자동 정리
   - 또는 수동 정리 실행

3. **로그 레벨 낮춤**
   ```env
   LOG_LEVEL=warn  # debug → warn
   ```

### 높은 메모리 사용

**증상**: 메모리 사용량 계속 증가

**해결**:

1. **애플리케이션 재시작**
2. **메모리 제한 설정**
   ```json
   {
     "scripts": {
       "start": "node --max-old-space-size=2048 dist/main.js"
     }
   }
   ```

## UI 문제

### 페이지가 표시되지 않음

**증상**: 빈 화면 또는 무한 로딩

**해결**:

1. **브라우저 콘솔 확인** (F12)

   - JavaScript 오류 확인

2. **Backend 연결 확인**

   ```javascript
   // 브라우저 콘솔에서
   fetch("http://localhost:3001/events")
     .then((r) => r.json())
     .then(console.log);
   ```

3. **캐시 삭제**
   - Ctrl + Shift + Delete
   - 브라우저 캐시 지우기

### 실시간 업데이트 안 됨

**증상**: 새 이벤트가 자동으로 표시되지 않음

**해결**:

1. **페이지 새로고침** (F5)
2. **Backend 서버 확인**
3. **네트워크 탭 확인** (F12)

## NW.js 문제

### NW.js 앱이 시작되지 않음

**증상**: NW.js 실행 시 에러 또는 즉시 종료

**확인**:

1. **Backend 자동 시작 확인**

   ```javascript
   // main.js 로그 확인
   console.log("Backend starting...");
   ```

2. **경로 확인**

   ```javascript
   // resources 폴더 경로 확인
   console.log(__dirname);
   ```

3. **개발자 도구 활성화**
   ```javascript
   nw.Window.get().showDevTools();
   ```

### __dirname 또는 require 오류

**증상**: `__dirname is not defined` 또는 `require is not defined`

**원인**: NW.js 브라우저 컨텍스트에서는 Node.js 전역 변수 사용 불가

**해결**:

```javascript
// nw.require 사용
const path = nw.require("path");
const fs = nw.require("fs");
const { spawn } = nw.require("child_process");

// __dirname 수동 정의
const __dirname = path.dirname(process.mainModule.filename);
```

### Frontend 로드 오류 (CORS)

**증상**: `Access-Control-Allow-Origin` 오류, 프론트엔드 로드 실패

**원인**: 패키지 모드에서 `file://` 프로토콜로 Next.js 정적 파일 로드 시 CORS 오류

**해결**: HTTP 서버로 프론트엔드 서빙 (포트 3002)

```javascript
// main.js에서 HTTP 서버 시작
const http = nw.require("http");
const FRONTEND_PORT = 3002;

// HTTP 서버로 frontend/out 폴더 서빙
// 그 후 iframe.src = `http://localhost:${FRONTEND_PORT}`
```

### node_modules 복사 오류

**증상**: 패키징 시 심볼릭 링크 오류 또는 무한 루프

**원인**: npm workspaces의 `@tagflow` 심볼릭 링크

**해결**: robocopy로 심볼릭 링크 제외

```powershell
# @tagflow 폴더 제외하고 복사
robocopy node_modules nwjs\resources\backend\node_modules /E /XD "@tagflow"
```

### 앱이 먼저 뜨고 내용이 나중에 로드됨

**증상**: 창은 표시되지만 내용이 늦게 로드

**해결**:

```javascript
// main.js - Backend 준비 상태 확인 후 Frontend 로드
function checkBackendReady(resolve, reject, attempts) {
  if (attempts > 30) {
    reject(new Error("Backend failed to start"));
    return;
  }

  http
    .get(`http://localhost:${BACKEND_PORT}`, (res) => {
      resolve();
    })
    .on("error", () => {
      setTimeout(() => checkBackendReady(resolve, reject, attempts + 1), 1000);
    });
}
```

## 일반적인 오류 메시지

### "EADDRINUSE"

**의미**: 포트가 이미 사용 중

**해결**:

```powershell
# 포트 사용 프로세스 종료
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### "MODULE_NOT_FOUND"

**의미**: 모듈을 찾을 수 없음

**해결**:

```powershell
npm install
```

### "SQLITE_CANTOPEN"

**의미**: DB 파일 열기 실패

**해결**:

```powershell
# data 디렉토리 생성
New-Item -Path "data" -ItemType Directory -Force

# 마이그레이션 실행
cd backend
npm run migrate
```

## 진단 도구

### 시스템 상태 확인

```powershell
# system-check.ps1
Write-Host "=== TagFlow 시스템 진단 ===" -ForegroundColor Cyan

# Node.js 버전
$nodeVersion = node --version
Write-Host "Node.js: $nodeVersion" -ForegroundColor Green

# Backend 프로세스
$backend = Get-Process -Name node -ErrorAction SilentlyContinue |
    Where-Object { $_.Path -like "*tagflow\backend*" }
if ($backend) {
    Write-Host "Backend: 실행 중" -ForegroundColor Green
} else {
    Write-Host "Backend: 중지됨" -ForegroundColor Red
}

# DB 파일
if (Test-Path "data\tagflow.db") {
    $size = (Get-Item "data\tagflow.db").Length / 1MB
    Write-Host "DB: $([math]::Round($size, 2)) MB" -ForegroundColor Green
} else {
    Write-Host "DB: 없음" -ForegroundColor Red
}

# 포트 3001 확인
$port = Test-NetConnection -ComputerName localhost -Port 3001 -WarningAction SilentlyContinue
if ($port.TcpTestSucceeded) {
    Write-Host "Port 3001: 사용 중" -ForegroundColor Green
} else {
    Write-Host "Port 3001: 사용 안 됨" -ForegroundColor Red
}
```

## 지원 받기

### 정보 수집

문제 보고 시 다음 정보 포함:

- OS 버전
- Node.js 버전
- TagFlow 버전
- 오류 메시지 (전체)
- 재현 단계
- 로그 (backend 콘솔)

### 로그 파일

Backend 로그 확인:

```powershell
# 콘솔 출력 저장
npm run dev > tagflow.log 2>&1
```

## 관련 문서

- [설정](configuration.md)
- [프로덕션 배포](production-deployment.md)
- [테스트 및 디버깅](../developer-guides/testing-debugging.md)
