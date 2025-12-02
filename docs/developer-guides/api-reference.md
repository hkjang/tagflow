# API 레퍼런스

TagFlow REST API의 전체 엔드포인트 문서입니다.

## Base URL

```
http://localhost:3001
```

## 인증

대부분의 엔드포인트는 JWT 인증이 필요합니다.

**헤더**:

```
Authorization: Bearer {access_token}
```

## 엔드포인트

### 인증 (Auth)

#### POST /auth/login

사용자 로그인

**요청**:

```json
{
  "username": "admin",
  "password": "admin123  "
}
```

**응답** (200):

```json
{
  "access_token": "eyJhbGci...",
  "refresh_token": "eyJhbGci...",
  "user": {
    "id": 1,
    "username": "admin",
    "name": "관리자",
    "role": "admin"
  }
}
```

#### POST /auth/refresh

토큰 갱신

**헤더**: `Authorization: Bearer {refresh_token}`

**응답** (200):

```json
{
  "access_token": "eyJhbGci..."
}
```

### 이벤트 (Events)

#### GET /events

이벤트 목록 조회

**인증**: 필요

**쿼리 파라미터**:

- `limit` (number): 결과 개수 (기본: 100)
- `offset` (number): 오프셋
- `tagId` (string): 태그 ID 필터
- `deviceId` (string): 장치 ID 필터
- `startDate` (string): 시작 날짜 (ISO 8601)
- `endDate` (string): 종료 날짜

**응답** (200):

```json
[
  {
    "id": 1,
    "tagId": "TAG_AB123456",
    "timestamp": "2025-12-03T14:30:25Z",
    "deviceId": "READER_01",
    "location": "창고 A동",
    "createdAt": "2025-12-03T14:30:25.123Z"
  }
]
```

#### POST /events

이벤트 생성

**인증**: 필요

**요청**:

```json
{
  "tagId": "TAG_AB123456",
  "timestamp": "2025-12-03T14:30:25Z",
  "deviceId": "READER_01",
  "location": "창고 A동"
}
```

**응답** (201):

```json
{
  "id": 1,
  "tagId": "TAG_AB123456",
  "timestamp": "2025-12-03T14:30:25Z",
  "deviceId": "READER_01",
  "location": "창고 A동",
  "createdAt": "2025-12-03T14:30:25.123Z"
}
```

### 웹훅 (Webhooks)

#### GET /webhooks

웹훅 목록 조회

**인증**: 필요 (Admin)

**응답** (200):

```json
[
  {
    "id": 1,
    "name": "ERP 연동",
    "url": "https://api.example.com/webhook",
    "method": "POST",
    "isActive": true,
    "maxRetries": 3,
    "retryInterval": 60
  }
]
```

#### POST /webhooks

웹훅 생성

**인증**: 필요 (Admin)

**요청**:

```json
{
  "name": "ERP 연동",
  "url": "https://api.example.com/webhook",
  "method": "POST",
  "isActive": true,
  "authHeader": "Authorization",
  "authValue": "Bearer token123",
  "mappings": [
    {
      "sourceField": "tagId",
      "targetField": "rfid_uid"
    }
  ],
  "maxRetries": 3,
  "retryInterval": 60
}
```

**응답** (201):

```json
{
  "id": 1,
  "name": "ERP 연동",
  "url": "https://api.example.com/webhook",
  "method": "POST",
  "isActive": true
}
```

#### POST /webhooks/:id/test

웹훅 테스트

**인증**: 필요 (Admin)

**응답** (200):

```json
{
  "success": true,
  "statusCode": 200,
  "responseTime": 145
}
```

#### DELETE /webhooks/:id

웹훅 삭제

**인증**: 필요 (Admin)

**응답** (200):

```json
{
  "message": "삭제됨"
}
```

### 리포트 (Reports)

#### GET /reports/events

이벤트 통계

**인증**: 필요

**쿼리 파라미터**:

- `startDate` (string): 시작 날짜
- `endDate` (string): 종료 날짜

**응답** (200):

```json
{
  "total": 2756,
  "byHour": [...],
  "byDevice": [...],
  "topTags": [...]
}
```

#### GET /reports/webhooks

웹훅 성능

**인증**: 필요

**응답** (200):

```json
{
  "webhooks": [
    {
      "id": 1,
      "name": "ERP 연동",
      "totalRequests": 1234,
      "successCount": 1215,
      "successRate": 98.5
    }
  ]
}
```

## 오류 응답

모든 오류는 다음 형식:

```json
{
  "statusCode": 400,
  "message": "오류 메시지",
  "error": "Bad Request"
}
```

### 일반 오류 코드

- `400` Bad Request - 잘못된 요청
- `401` Unauthorized - 인증 실패
- `403` Forbidden - 권한 없음
- `404` Not Found - 리소스 없음
- `500` Internal Server Error - 서버 오류

## 예제

### cURL

```bash
# 로그인
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 이벤트 조회
curl http://localhost:3001/events \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### JavaScript

```javascript
// 로그인
const response = await fetch("http://localhost:3001/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    username: "admin",
    password: "admin123",
  }),
});

const { access_token } = await response.json();

// 이벤트 조회
const events = await fetch("http://localhost:3001/events", {
  headers: {
    Authorization: `Bearer ${access_token}`,
  },
});
```

## 관련 문서

- [인증 시스템](../feature-guides/authentication.md)
- [웹훅 시스템](../feature-guides/webhook-system.md)
