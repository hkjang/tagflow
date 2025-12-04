# NW.js 패키징 가이드

TagFlow 애플리케이션을 NW.js 데스크톱 앱으로 패키징하는 간단한 가이드입니다.

## 요구 사항

- Node.js 18+
- NW.js 0.83.0 (Windows x64)

## 빠른 시작

### 1. 빌드

```powershell
# 루트 디렉토리에서
npm run build
```

### 2. 패키징 스크립트 실행

```powershell
cd nwjs
.\package-app.ps1 -nwjsPath "C:\nwjs"
```

> NW.js SDK가 `C:\nwjs`에 압축 해제되어 있어야 합니다.

### 3. 실행

```powershell
cd C:\nwjs
.\nw.exe
```

## 수동 패키징

### NW.js SDK 다운로드

[NW.js 다운로드 페이지](https://nwjs.io/downloads/)에서 Windows x64 Normal build를 다운로드합니다.

### 파일 복사

```powershell
# Backend 파일
Copy-Item backend\dist -Destination nwjs\resources\backend\dist -Recurse
robocopy node_modules nwjs\resources\backend\node_modules /E /XD "@tagflow"

# Frontend 파일
Copy-Item frontend\out -Destination nwjs\resources\frontend -Recurse
```

> **참고**: npm workspaces를 사용하므로 `node_modules`는 루트에서 복사하고 `@tagflow` 심볼릭 링크는 제외합니다.

## 아키텍처 참고

- **Backend 포트**: 3001
- **Frontend 포트**: 3002 (패키지 모드에서 HTTP 서버)
- **모듈 로딩**: NW.js 브라우저 컨텍스트에서 `nw.require()` 사용

## 상세 문서

자세한 패키징 정보는 [NW.js 패키징 가이드](../docs/deployment/nwjs-packaging.md)를 참조하세요.
