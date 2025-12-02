# 데이터베이스 스키마

TagFlow의 SQLite 데이터베이스 스키마 문서입니다.

## 전체 스키마

### users

사용자 계정

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,  -- bcrypt 해시
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin', 'operator')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
```

### tag_events

RFID 태그 이벤트

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

CREATE INDEX idx_tag_events_tag_id ON tag_events(tag_id);
CREATE INDEX idx_tag_events_timestamp ON tag_events(timestamp);
CREATE INDEX idx_tag_events_device_id ON tag_events(device_id);
CREATE INDEX idx_tag_events_created_at ON tag_events(created_at);
```

### webhooks

웹훅 설정

```sql
CREATE TABLE webhooks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  method TEXT DEFAULT 'POST' CHECK(method IN ('POST', 'PUT')),
  is_active BOOLEAN DEFAULT 1,
  auth_header TEXT,
  auth_value TEXT,
  max_retries INTEGER DEFAULT 3,
  retry_interval INTEGER DEFAULT 60,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### webhook_mappings

웹훅 필드 매핑

```sql
CREATE TABLE webhook_mappings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  webhook_id INTEGER NOT NULL,
  source_field TEXT NOT NULL,
  target_field TEXT NOT NULL,
  FOREIGN KEY (webhook_id) REFERENCES webhooks(id) ON DELETE CASCADE
);

CREATE INDEX idx_webhook_mappings_webhook_id ON webhook_mappings(webhook_id);
```

### webhook_logs

웹훅 실행 로그

```sql
CREATE TABLE webhook_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  webhook_id INTEGER NOT NULL,
  event_id INTEGER NOT NULL,
  status_code INTEGER,
  response_time INTEGER,  -- 밀리초
  retries INTEGER DEFAULT 0,
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (webhook_id) REFERENCES webhooks(id),
  FOREIGN KEY (event_id) REFERENCES tag_events(id)
);

CREATE INDEX idx_webhook_logs_webhook_id ON webhook_logs(webhook_id);
CREATE INDEX idx_webhook_logs_event_id ON webhook_logs(event_id);
CREATE INDEX idx_webhook_logs_created_at ON webhook_logs(created_at);
```

### cleanup_logs

데이터 정리 로그

```sql
CREATE TABLE cleanup_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  deleted_events INTEGER DEFAULT 0,
  deleted_webhook_logs INTEGER DEFAULT 0,
  deleted_cleanup_logs INTEGER DEFAULT 0,
  total_deleted INTEGER DEFAULT 0,
  duration_ms INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### cleanup_fail_logs

데이터 정리 실패 로그

```sql
CREATE TABLE cleanup_fail_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  error_message TEXT,
  stack_trace TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 관계 다이어그램

```
users
  (사용자, 영구 보존)

tag_events ───┬─── webhook_logs
  (1년)       │     (90일)
              │
          webhooks ─── webhook_mappings
          (영구)        (영구)

cleanup_logs
  (2년)

cleanup_fail_logs
  (2년)
```

## 주요 쿼리

### 사용자 인증

```sql
SELECT id, username, password, name, role
FROM users
WHERE username = ?;
```

### 이벤트 조회 (페이지네이션)

```sql
SELECT *
FROM tag_events
ORDER BY timestamp DESC
LIMIT ? OFFSET ?;
```

### 웹훅과 매핑 조회

```sql
SELECT w.*, wm.source_field, wm.target_field
FROM webhooks w
LEFT JOIN webhook_mappings wm ON w.id = wm.webhook_id
WHERE w.is_active = 1;
```

### 웹훅 성능 통계

```sql
SELECT
  w.id,
  w.name,
  COUNT(*) as total_requests,
  SUM(CASE WHEN wl.status_code BETWEEN 200 AND 299 THEN 1 ELSE 0 END) as success_count,
  AVG(wl.response_time) as avg_response_time
FROM webhooks w
JOIN webhook_logs wl ON w.id = wl.webhook_id
WHERE wl.created_at >= ?
GROUP BY w.id;
```

## 마이그레이션

### 생성

```powershell
cd backend
npm run migration:create -- MigrationName
```

### 실행

```powershell
npm run migrate
```

## 백업

```powershell
# 파일 복사
Copy-Item data\tagflow.db -Destination backup\tagflow_backup.db

# SQL 덤프
sqlite3 data\tagflow.db ".dump" > backup\tagflow.sql
```

## 관련 문서

- [데이터 보존 정책](../feature-guides/data-retention.md)
- [API 레퍼런스](api-reference.md)
