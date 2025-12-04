# 개발 환경

Tag Flow 개발 환경 설정 및 개발 서버 실행 방법을 안내합니다.

## 개발 서버 실행

### 모든 서비스 한번에

```powershell
npm run dev
```

이 명령은 다음을 동시에 실행합니다:

- Backend (NestJS) - http://localhost:3001
- Frontend (Next.js) - http://localhost:3000
- NW.js 데스크톱 앱 (5초 후 자동 실행)

> **참고**: 패키지 모드에서는 Frontend가 포트 3002에서 HTTP 서버로 실행됩니다.

### 개별 서비스 실행

#### Backend만

```powershell
cd backend
npm run start:dev
```

- 포트: 3001
- 핫 리로드 지원 (파일 변경 시 자동 재시작)

#### Frontend만

```powershell
cd frontend
npm run dev
```

- 포트: 3000
- Fast Refresh 지원 (React Hot Reload)

#### NW.js만

```powershell
cd nwjs
npm run dev
```

- Backend와 Frontend가 먼저 실행 중이어야 함

## 개발 도구

### TypeScript 컴파일러

**Watch 모드** (파일 변경 시 자동 컴파일):

```powershell
# Backend
cd backend
npm run build -- --watch

# Shared
cd shared
npm run build -- --watch
```

### 코드 린팅

```powershell
# Backend
cd backend
npm run lint

# Frontend
cd frontend
npm run lint
```

**자동 수정**:

```powershell
npm run lint -- --fix
```

### 코드 포맷팅

```powershell
# Prettier (설정된 경우)
npm run format
```

## 데이터베이스

### 마이그레이션

**새 마이그레이션 생성**:

```powershell
cd backend
npm run migration:create -- CreateNewTable
```

**마이그레이션 실행**:

```powershell
npm run migrate
```

**롤백** (향후 지원):

```powershell
npm run migrate:rollback
```

### 데이터베이스 초기화

개발 중 DB를 깨끗하게 재설정:

```powershell
# 1. DB 파일 삭제
Remove-Item data\tagflow.db -Force

# 2. 마이그레이션 재실행
cd backend
npm run migrate

# 3. Seed 데이터 재생성
npm run seed
```

### SQLite CLI

DB를 직접 조회:

```powershell
sqlite3 data\tagflow.db

# SQLite 쉘에서
.tables               # 테이블 목록
.schema tag_events    # 스키마 보기
SELECT * FROM users;  # 쿼리 실행
.exit                 # 종료
```

## 디버깅

### Backend 디버깅 (VS Code)

`.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug NestJS",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "start:debug"],
      "cwd": "${workspaceFolder}/backend",
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

**디버그 모드 실행**:

```powershell
cd backend
npm run start:debug
```

브레이크포인트 설정 후 F5로 디버깅 시작

### Frontend 디버깅

**브라우저 DevTools**:

1. F12로 개발자 도구 열기
2. Sources 탭에서 브레이크포인트 설정
3. Console 탭에서 로그 확인

**React DevTools**:

- 브라우저 확장 프로그램 설치
- 컴포넌트 트리 및 Props 검사

### 로그 확인

**Backend 로그**:

```
터미널에 실시간 출력
로그 레벨: debug, info, warn, error
```

**Frontend 로그**:

```
브라우저 콘솔 (F12)
Network 탭에서 API 요청 확인
```

## 테스트

### 단위 테스트

```powershell
# Backend
cd backend
npm test

# Watch 모드
npm test -- --watch
```

### E2E 테스트

```powershell
cd backend
npm run test:e2e
```

### 커버리지

```powershell
npm test -- --coverage
```

## 핫 리로드

### 변경 사항 반영

**Backend**:

- TypeScript 파일 변경 → 자동 재컴파일 및 재시작
- 1~2초 소요

**Frontend**:

- React 컴포넌트 변경 → 즉시 반영 (Fast Refresh)
- 상태 유지

**Shared**:

- Shared 타입 변경 → 수동으로 재빌드 필요

```powershell
cd shared
npm run build
```

## API 테스트

### REST Client (VS Code)

`test.http` 파일 만들기:

```http
### 로그인
POST http://localhost:3001/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}

### 이벤트 조회
GET http://localhost:3001/events
Authorization: Bearer YOUR_TOKEN_HERE
```

### cURL

```powershell
# 로그인
curl -X POST http://localhost:3001/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"username\":\"admin\",\"password\":\"admin123\"}'

# 이벤트 조회
curl http://localhost:3001/events `
  -H "Authorization: Bearer TOKEN"
```

### Postman

1. Postman 다운로드 및 설치
2. 새 Collection 생성
3. 환경 변수 설정:
   ```
   base_url: http://localhost:3001
   access_token: (로그인 후 설정)
   ```
4. 요청 추가 및 테스트

## 문제 해결

### Backend가 재시작을 반복해요

**원인**: 파일 변경 감지 오류

**해결**:

```powershell
# node_modules 재설치
cd backend
Remove-Item node_modules -Recurse -Force
npm install
```

### Frontend가 빌드 오류

**원인**: 타입 오류 또는 의존성 문제

**해결**:

```powershell
cd frontend
npm run lint
npm run type-check  # (있는 경우)
```

### DB 잠금 오류

**원인**: 다중 백엔드 인스턴스

**해결**:

```powershell
# 모든 node 프로세스 종료
Stop-Process -Name node -Force

# 다시 시작
npm run dev
```

## 팁 및 트릭

### 빠른 재시작

```powershell
# Ctrl+C로 중지 후
npm run dev
```

### 로그 필터링

Backend 로그가 너무 많을 때:

```typescript
// main.ts
app.useLogger(["error", "warn"]); // debug, info 숨김
```

### 자동 코드 포맷팅

VS Code 설정:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

## 다음 단계

- **[API 레퍼런스](api-reference.md)** - API 엔드포인트 상세
- **[데이터베이스 스키마](database-schema.md)** - DB 구조
- **[테스트 및 디버깅](testing-debugging.md)** - 고급 디버깅

## 관련 문서

- [설치](installation.md)
- [아키텍처](architecture.md)
