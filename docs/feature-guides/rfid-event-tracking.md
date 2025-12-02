# RFID 이벤트 추적

RFID 태그 스캔 이벤트의 캡처, 저장, 처리 아키텍처를 설명합니다.

## 이벤트 흐름

```
[RFID 리더] → [TagFlow Backend] → [SQLite DB]
                    ↓
              [웹훅 시스템]
```

## 이벤트 모델

### 데이터베이스 스키마

```sql
CREATE TABLE tag_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tag_id TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  device_id TEXT,
  location TEXT,
  metadata JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 이벤트 필드

| 필드         | 타입     | 설명            | 필수 |
| ------------ | -------- | --------------- | ---- |
| `id`         | INTEGER  | 자동 증가 ID    | ✓    |
| `tag_id`     | TEXT     | RFID 태그 UID   | ✓    |
| `timestamp`  | DATETIME | 스캔 시각       | ✓    |
| `device_id`  | TEXT     | 리더 장치 ID    | -    |
| `location`   | TEXT     | 스캔 위치       | -    |
| `metadata`   | JSON     | 추가 메타데이터 | -    |
| `created_at` | DATETIME | DB 저장 시각    | ✓    |

## 이벤트 생성

### API 엔드포인트

**POST `/events`**

```json
{
  "tagId": "TAG_AB123456",
  "timestamp": "2025-12-03T14:30:25Z",
  "deviceId": "READER_01",
  "location": "창고 A동",
  "metadata": {
    "rssi": -45,
    "antenna": 1
  }
}
```

### 백엔드 처리

```typescript
@Post()
async createEvent(@Body() createEventDto: CreateEventDto) {
  // 1. 이벤트 검증
  this.validateEvent(createEventDto);

  // 2. 데이터베이스에 저장
  const event = await this.eventsService.create(createEventDto);

  // 3. 웹훅 트리거 (비동기)
  this.webhookService.trigger Event(event);

  return event;
}
```

## 실시간 처리

### 이벤트 스트림

프론트엔드는 실시간 업데이트를 위해 폴링 또는 WebSocket 사용:

**폴링 (현재 구현)**:

```typescript
setInterval(async () => {
  const events = await fetch("/events?limit=10");
  updateEventList(events);
}, 5000); // 5초마다
```

**WebSocket (향후 지원 예정)**:

```typescript
const ws = new WebSocket("ws://localhost:3001/events");
ws.onmessage = (event) => {
  addNewEvent(JSON.parse(event.data));
};
```

## 이벤트 조회

### 목록 조회

**GET `/events`**

**쿼리 파라미터**:

- `limit`: 결과 개수 (기본: 100)
- `offset`: 오프셋 (페이지네이션)
- `tagId`: 특정 태그 필터
- `deviceId`: 특정 장치 필터
- `startDate`: 시작 날짜
- `endDate`: 종료 날짜

**예시**:

```
GET /events?limit=50&tagId=TAG_AB123456&startDate=2025-12-01
```

### 단일 이벤트 조회

**GET `/events/:id`**

```json
{
  "id": 1234,
  "tagId": "TAG_AB123456",
  "timestamp": "2025-12-03T14:30:25Z",
  "deviceId": "READER_01",
  "location": "창고 A동",
  "metadata": {
    "rssi": -45,
    "antenna": 1
  },
  "createdAt": "2025-12-03T14:30:25.123Z"
}
```

## 데이터 보존

### 보존 정책

- **기간**: 1년 (365일)
- **정리**: 관리자 로그인 시 자동 실행
- **기준**: `created_at` 필드

### 수동 정리

관리자는 수동으로 오래된 이벤트 삭제 가능:

```sql
DELETE FROM tag_events
WHERE created_at < datetime('now', '-365 days');
```

## 성능 최적화

### 인덱스

```sql
CREATE INDEX idx_tag_events_tag_id ON tag_events(tag_id);
CREATE INDEX idx_tag_events_timestamp ON tag_events(timestamp);
CREATE INDEX idx_tag_events_created_at ON tag_events(created_at);
CREATE INDEX idx_tag_events_device_id ON tag_events(device_id);
```

### 배치 삽입

대량 이벤트 처리 시:

```typescript
async createBatch(events: CreateEventDto[]) {
  return this.db.transaction(async (trx) => {
    return Promise.all(
      events.map(event => trx.insert(event))
    );
  });
}
```

## 통합 시나리오

### RFID 리더 통합

**시나리오 1: HTTP Push**

```
리더 → POST /events → TagFlow
```

**시나리오 2: 미들웨어**

```
리더 → 미들웨어 → POST /events → TagFlow
```

**시나리오 3: 수동 입력** (테스트용)

```
웹 UI → POST /events → TagFlow
```

## 관련 문서

- [웹훅 시스템](webhook-system.md)
- [데이터 보존 정책](data-retention.md)
- [API 레퍼런스](../developer-guides/api-reference.md)
