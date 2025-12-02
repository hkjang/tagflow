# 웹훅 시스템

TagFlow의 웹훅 아키텍처, 필드 매핑, 재시도 메커니즘을 설명합니다.

## 웹훅 개요

웹훅은 RFID 태그 이벤트를 외부 시스템으로 실시간 전송하는 메커니즘입니다.

### 아키텍처

```
[태그 이벤트] → [웹훅 서비스] → [필드 매핑] → [HTTP 요청] → [외부 시스템]
                      ↓ (실패 시)
                 [재시도 큐]
```

## 웹훅 모델

### 데이터베이스 스키마

```sql
CREATE TABLE webhooks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  method TEXT DEFAULT 'POST',
  is_active BOOLEAN DEFAULT 1,
  auth_header TEXT,
  auth_value TEXT,
  max_retries INTEGER DEFAULT 3,
  retry_interval INTEGER DEFAULT 60,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE webhook_mappings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  webhook_id INTEGER NOT NULL,
  source_field TEXT NOT NULL,
  target_field TEXT NOT NULL,
  FOREIGN KEY (webhook_id) REFERENCES webhooks(id)
);
```

## 필드 매핑

### 매핑 프로세스

```typescript
// 이벤트 데이터
const event = {
  tagId: "TAG_AB123456",
  timestamp: "2025-12-03T14:30:25Z",
  deviceId: "READER_01",
};

// 매핑 규칙
const mappings = [
  { sourceField: "tagId", targetField: "rfid_uid" },
  { sourceField: "timestamp", targetField: "scan_time" },
  { sourceField: "deviceId", targetField: "reader_id" },
];

// 결과 페이로드
const payload = {
  rfid_uid: "TAG_AB123456",
  scan_time: "2025-12-03T14:30:25Z",
  reader_id: "READER_01",
};
```

### 매핑 규칙

- **1:1 매핑**: 한 필드를 한 필드로
- **선택적 매핑**: 일부 필드만 전송
- **필드명 변환**: 외부 시스템 스키마에 맞춤

## 웹훅 실행

### 트리거

이벤트 생성 시 모든 활성 웹훅이 자동 실행:

```typescript
async triggerWebhooks(event: Event) {
  const webhooks = await this.getActiveWebhooks();

  for (const webhook of webhooks) {
    await this.executeWebhook(webhook, event);
  }
}
```

### HTTP 요청

```typescript
async executeWebhook(webhook: Webhook, event: Event) {
  // 필드 매핑 적용
  const payload = this.applyMappings(webhook.mappings, event);

  // HTTP 요청
  const response = await fetch(webhook.url, {
    method: webhook.method,
    headers: {
      'Content-Type': 'application/json',
      [webhook.authHeader]: webhook.authValue
    },
    body: JSON.stringify(payload)
  });

  // 로그 기록
  await this.logWebhook(webhook.id, event.id, response);

  return response;
}
```

## 재시도 메커니즘

### 재시도 정책

**재시도 조건**:

- HTTP 5xx 오류
- 네트워크 오류
- 타임아웃

**재시도하지 않는 경우**:

- HTTP 2xx (성공)
- HTTP 4xx (클라이언트 오류)

### 재시도 큐

```typescript
class RetryQueue {
  private queue: Map<string, RetryItem> = new Map();

  async enqueue(webhook: Webhook, event: Event, attempt: number) {
    const key = `${webhook.id}_${event.id}`;
    const retryItem = {
      webhook,
      event,
      attempt,
      nextRetryAt: Date.now() + webhook.retryInterval * 1000,
    };

    this.queue.set(key, retryItem);
  }

  async process() {
    for (const [key, item] of this.queue) {
      if (Date.now() >= item.nextRetryAt) {
        await this.retry(item);
        this.queue.delete(key);
      }
    }
  }
}
```

### 백오프 전략

현재: **고정 간격**

```
재시도 1: 60초 후
재시도 2: 120초 후 (60초 + 60초)
재시도 3: 180초 후 (120초 + 60초)
```

향후: **지수 백오프** (선택적)

```
재시도 1: 60초 후
재시도 2: 120초 후 (2^1 × 60초)
재시도 3: 240초 후 (2^2 × 60초)
```

## 웹훅 로그

### 로그 스키마

```sql
CREATE TABLE webhook_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  webhook_id INTEGER NOT NULL,
  event_id INTEGER NOT NULL,
  status_code INTEGER,
  response_time INTEGER,
  retries INTEGER DEFAULT 0,
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (webhook_id) REFERENCES webhooks(id),
  FOREIGN KEY (event_id) REFERENCES tag_events(id)
);
```

### 로그 기록

```typescript
async logWebhook(webhookId: number, eventId: number, response: Response) {
  await this.db.insert('webhook_logs', {
    webhook_id: webhookId,
    event_id: eventId,
    status_code: response.status,
    response_time: response.responseTime,
     error_message: response.error || null
  });
}
```

## 성능 최적화

### 비동기 처리

웹훅은 이벤트 생성과 독립적으로 처리:

```typescript
@Post()
async createEvent(@Body() dto: CreateEventDto) {
  const event = await this.save(dto);

  // 비동기로 웹훅 실행 (이벤트 응답 블로킹 안 함)
  this.webhookService.trigger(event).catch(console.error);

  return event;
}
```

### 타임아웃

```typescript
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 10000); // 10초

fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timeout));
```

## 보안

### HTTPS만 허용

```typescript
validateWebhookUrl(url: string) {
  if (!url.startsWith('https://')) {
    throw new Error('HTTPS URL만 허용됩니다');
  }
}
```

### 인증 헤더

외부 시스템 인증:

- Bearer Token
- API Key
- Basic Auth

**예시**:

```
Authorization: Bearer abc123xyz
X-API-Key: your-api-key
```

## 테스트

### 웹훅 테스트 API

**POST `/webhooks/:id/test`**

샘플 데이터로 웹훅 실행:

```json
{
  "tagId": "TEST_12345678",
  "timestamp": "2025-12-03T14:30:25Z",
  "deviceId": "TEST_DEVICE"
}
```

## 문제 해결

### 일반적인 오류

**404 Not Found**:

- URL 경로 확인
- 대상 엔드포인트 존재 여부 확인

**401/403 Unauthorized/Forbidden**:

- 인증 헤더와 토큰 확인
- 권한 설정 검토

**500 Internal Server Error**:

- 페이로드 형식 확인
- 외부 시스템 로그 확인

**Timeout**:

- 대상 서버 성능 점검
- 타임아웃 설정 조정

## 관련 문서

- [웹훅 설정](../user-guides/admin/webhook-configuration.md)
- [RFID 이벤트 추적](rfid-event-tracking.md)
- [API 레퍼런스](../developer-guides/api-reference.md)
