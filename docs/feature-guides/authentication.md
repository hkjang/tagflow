# 인증 시스템

TagFlow의 사용자 인증 및 권한 관리 시스템을 설명합니다.

## 인증 개요

TagFlow는 JWT(JSON Web Token) 기반 인증을 사용합니다.

### 인증 흐름

```
1. 사용자 로그인 (username + password)
2. 서버가 자격 증명 검증
3. Access Token + Refresh Token 발급
4. 클라이언트가 Token 저장
5. API 요청 시 Access Token 포함
6. Token 만료 시 Refresh Token으로 갱신
```

## JWT 토큰

### Access Token

**목적**: API 요청 인증  
**만료**: 1시간 (기본값)  
**저장**: 메모리 또는 SessionStorage

**구조**:

```json
{
  "sub": "1",
  "username": "admin",
  "role": "admin",
  "iat": 1701619200,
  "exp": 1701622800
}
```

### Refresh Token

**목적**: Access Token 갱신  
**만료**: 7일 (기본값)  
**저장**: HttpOnly Cookie (권장) 또는 LocalStorage

## 역할 기반 접근 제어 (RBAC)

### 역할 정의

#### Admin (관리자)

- 모든 API 엔드포인트 접근
- 사용자 관리
- 웹훅 관리
- 시스템 설정

#### Operator (운영자)

- 읽기 전용 API
  - 태그 이벤트 조회
  - 리포트 조회
  - 웹훅 로그 조회 (읽기만)

### 권한 검증

백엔드는 요청마다 권한을 검증합니다:

```typescript
// 관리자 전용 엔드포인트
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Get('admin/users')
getUsers() { ... }

// 모든 인증된 사용자
@UseGuards(JwtAuthGuard)
@Get('events')
getEvents() { ... }
```

## API 인증

### 로그인

**엔드포인트**: `POST /auth/login`

**요청**:

```json
{
  "username": "admin",
  "password": "admin123"
}
```

**응답**:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "admin",
    "name": "관리자",
    "role": "admin"
  }
}
```

### 토큰 갱신

**엔드포인트**: `POST /auth/refresh`

**요청 헤더**:

```
Authorization: Bearer {refresh_token}
```

**응답**:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 인증된 요청

**헤더에 Access Token 포함**:

```
GET /events
Authorization: Bearer {access_token}
```

## 보안 기능

### 비밀번호 해싱

- **알고리즘**: bcrypt
- **Salt Rounds**: 10
- 비밀번호는 절대 평문 저장 안 됨

### JWT Secret

- 환경 변수로 설정: `JWT_SECRET`
- 프로덕션에서는 강력한 랜덤 키 필수
- Secret 변경 시 모든 토큰 무효화

### 세션 관리

- Stateless 인증 (서버에 세션 저장 안 함)
- Token 기반으로 상태 관리
- 로그아웃 = 클라이언트에서 Token 삭제

## 프론트엔드 통합

### 로그인 흐름

```typescript
// 로그인
const response = await fetch("/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username, password }),
});

const { access_token, refresh_token, user } = await response.json();

// Token 저장
localStorage.setItem("access_token", access_token);
localStorage.setItem("refresh_token", refresh_token);
```

### API 요청

```typescript
// 인증된 요청
const response = await fetch("/events", {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  },
});
```

### 자동 갱신

```typescript
// Token 만료 시 자동 갱신
async function refreshToken() {
  const refresh_token = localStorage.getItem("refresh_token");
  const response = await fetch("/auth/refresh", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${refresh_token}`,
    },
  });

  const { access_token } = await response.json();
  localStorage.setItem("access_token", access_token);
}
```

## 보안 모범 사례

### Token 저장

**권장**:

- Access Token: SessionStorage 또는 메모리
- Refresh Token: HttpOnly Cookie

**비권장**:

- LocalStorage (XSS 공격에 취약)

### HTTPS 사용

프로덕션에서는 항상 HTTPS 사용:

- Token 가로채기 방지
- 중간자 공격 방지

### Token 만료 시간

**보안과 편의성 균형**:

- Access Token: 짧게 (15분~1시간)
- Refresh Token: 길게 (7~30일)

## 문제 해결

### 401 Unauthorized

**원인**:

- Token 만료
- 잘못된 Token
- Token 없음

**해결**:

- Refresh Token으로 갱신
- 재로그인

### 403 Forbidden

**원인**:

- 권한 부족 (예: 운영자가 관리자 API 호출)

**해결**:

- 올바른 권한의 계정 사용
- 관리자에게 권한 요청

## 관련 문서

- [사용자 관리](../user-guides/admin/user-management.md)
- [시스템 설정](../user-guides/admin/system-settings.md)
- [API 레퍼런스](../developer-guides/api-reference.md)
