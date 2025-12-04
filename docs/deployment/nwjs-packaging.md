# NW.js 패키징

TagFlow를 NW.js 데스크톱 애플리케이션으로 패키징하는 방법을 안내합니다.

## 사전 준비

### 빌드 완료

패키징 전에 모든 컴포넌트를 빌드합니다:

```powershell
# Root에서 전체 빌드
npm run build

# 또는 개별 빌드
cd backend
npm run build

cd ../frontend
npm run build

cd ../shared
npm run build
```

## NW.js 다운로드

### 수동 다운로드

1. [NW.js 공식 사이트](https://nwjs.io/downloads/) 접속
2. **Windows x64** 버전 다운로드 (Normal build)
3. 압축 해제

### 자동 다운로드 (PowerShell)

```powershell
# Windows x64 NW.js 다운로드 스크립트
$version = "0.83.0"  # 현재 사용 버전
$url = "https://dl.nwjs.io/v$version/nwjs-v$version-win-x64.zip"
$output = "nwjs.zip"

Invoke-WebRequest -Uri $url -OutFile $output
Expand-Archive -Path $output -DestinationPath "nwjs-runtime"
```

## 패키징 방법

### 방법 1: 간단한 복사

#### 1. NW.js 디렉토리 준비

```powershell
# NW.js 압축 해제 경로
$nwjsDir = "nwjs-v0.83.0-win-x64"
```

#### 2. 애플리케이션 파일 복사

```powershell
# nwjs 폴더 내용 복사
Copy-Item nwjs\* -Destination $nwjsDir -Recurse -Force

# Backend 빌드 복사
Copy-Item backend\dist -Destination "$nwjsDir\resources\backend\" -Recurse
Copy-Item backend\node_modules -Destination "$nwjsDir\resources\backend\" -Recurse

# Frontend 빌드 복사
Copy-Item frontend\out -Destination "$nwjsDir\resources\frontend\" -Recurse
```

#### 3. 실행

```powershell
cd $nwjsDir
.\nw.exe
```

### 방법 2: PowerShell 스크립트

**package-app.ps1**:

```powershell
# 설정
$nwjsDir = "nwjs-v0.83.0-win-x64"
$outputDir = "TagFlow-Release"

# 준비
Write-Host "Preparing release directory..."
New-Item -Path $outputDir -ItemType Directory -Force

# NW.js 런타임 복사
Write-Host "Copying NW.js runtime..."
Copy-Item "$nwjsDir\*" -Destination $outputDir -Recurse -Force

# 애플리케이션 파일 복사
Write-Host "Copying application files..."

# nwjs 폴더
Copy-Item "nwjs\package.json" -Destination $outputDir
Copy-Item "nwjs\index.html" -Destination $outputDir
Copy-Item "nwjs\main.js" -Destination $outputDir
Copy-Item "nwjs\resources" -Destination "$outputDir\resources" -Recurse -Force

# Backend
Copy-Item "backend\dist" -Destination "$outputDir\resources\backend\dist" -Recurse -Force
Copy-Item "backend\node_modules" -Destination "$outputDir\resources\backend\node_modules" -Recurse -Force

# Frontend
Copy-Item "frontend\out" -Destination "$outputDir\resources\frontend" -Recurse -Force

Write-Host "Packaging complete! Output: $outputDir"
Write-Host "Run: cd $outputDir; .\nw.exe"
```

**실행**:

```powershell
.\nwjs\package-app.ps1
```

## 설정

### package.json

`nwjs/package.json`:

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
    "icon": "resources/icon.png",
    "position": "center",
    "resizable": true,
    "show": true,
    "frame": true
  },
  "chromium-args": "--disable-web-security --allow-file-access-from-files"
}
```

### main.js

백엔드 서버 시작 및 프론트엔드 HTTP 서버 로직:

```javascript
// NW.js 브라우저 컨텍스트에서는 nw.require 사용
const path = nw.require('path');
const fs = nw.require('fs');
const http = nw.require('http');
const { spawn } = nw.require('child_process');

// __dirname 수동 정의 (NW.js 브라우저 컨텍스트)
const __dirname = path.dirname(process.mainModule.filename);

const BACKEND_PORT = 3001;
const FRONTEND_PORT = 3002;  // 패키지 모드에서 프론트엔드 서버 포트

// 패키지 모드 확인
const isPackaged = fs.existsSync(path.join(__dirname, 'resources', 'backend', 'dist'));

// Backend 시작
function startBackend() {
  const backendEntry = path.join(__dirname, 'resources', 'backend', 'dist', 'main.js');
  const backendCwd = path.join(__dirname, 'resources', 'backend');
  
  return spawn('node', [backendEntry], {
    cwd: backendCwd,
    env: { ...process.env, PORT: BACKEND_PORT.toString() },
    shell: true
  });
}

// Frontend HTTP 서버 (정적 파일 서빙)
function startFrontendServer() {
  const frontendPath = path.join(__dirname, 'resources', 'frontend');
  // HTTP 서버 로직...
  // 포트 3002에서 frontend/out 폴더 서빙
}
```

> **중요**: NW.js 브라우저 컨텍스트에서는 `require()` 대신 `nw.require()`를 사용해야 합니다.

## 인스톨러 생성

### NSIS (권장)

**installer.nsi**:

```nsis
!define APP_NAME "TagFlow"
!define VERSION "1.0.0"

Name "${APP_NAME}"
OutFile "TagFlow-Setup-${VERSION}.exe"
InstallDir "$PROGRAMFILES64\${APP_NAME}"

Section "Install"
  SetOutPath "$INSTDIR"
  File /r "TagFlow-Release\*.*"

  CreateShortcut "$DESKTOP\${APP_NAME}.lnk" "$INSTDIR\nw.exe"
  CreateShortcut "$SMPROGRAMS\${APP_NAME}.lnk" "$INSTDIR\nw.exe"
SectionEnd

Section "Uninstall"
  Delete "$INSTDIR\*.*"
  Delete "$DESKTOP\${APP_NAME}.lnk"
  Delete "$SMPROGRAMS\${APP_NAME}.lnk"
  RMDir "$INSTDIR"
SectionEnd
```

**컴파일**:

```powershell
makensis installer.nsi
```

## 디버깅

### 개발자 도구 활성화

```javascript
// main.js
nw.Window.get().showDevTools();
```

### 로그 확인

```javascript
console.log("Backend starting...");
console.error("Error occurred:", error);
```

## 배포

### 배포 체크리스트

- [ ] 모든 의존성 포함 확인
- [ ] 데이터베이스 초기화 확인
- [ ] 환경 변수 프로덕션 설정
- [ ] 아이콘 및 브랜딩 적용
- [ ] 테스트 실행 (깨끗한 환경)
- [ ] 인스톨러 생성 및 테스트

### 배포 패키지 크기

예상 크기:

- NW.js 런타임: ~150MB
- Backend + Dependencies: ~100MB
- Frontend: ~10MB
- **총**: ~260MB

## 문제 해결

### 백엔드가 시작되지 않음

**확인**:

- node_modules 포함 여부
- 경로 설정 확인
- 권한 확인

### 프론트엔드가 로드되지 않음

**확인**:

- frontend/out 디렉토리 존재
- 포트 3000 사용 가능
- CORS 설정

## 관련 문서

- [PACKAGING.md](../../nwjs/PACKAGING.md)
- [프로덕션 배포](production-deployment.md)
- [문제 해결](troubleshooting.md)
