# 데이터 보존 정책

TagFlow의 데이터 보존 정책, 자동 정리 시스템, 아카이빙 전략을 설명합니다.

## 보존 정책 개요

| 데이터 유형     | 보존 기간   | 자동 정리 | 관련 테이블    |
| --------------- | ----------- | --------- | -------------- |
| **태그 이벤트** | 1년 (365일) | ✅        | `tag_events`   |
| **웹훅 로그**   | 90일        | ✅        | `webhook_logs` |
| **정리 로그**   | 2년 (730일) | ✅        | `cleanup_logs` |
| **사용자**      | 영구        | ❌        | `users`        |
| **웹훅 설정**   | 영구        | ❌        | `webhooks`     |

## 자동 정리 시스템

### 트리거

관리자 로그인 시 자동 실행:

```typescript
@Post('login')
async login(@Body() loginDto: LoginDto) {
  const user = await this.authService.validateUser(loginDto);

  // 관리자인 경우 정리 작업 실행
  if (user.role === 'admin') {
    this.cleanupService.performCleanup().catch(console.error);
  }

  return this.authService.login(user);
}
```

### 정리 프로세스

```typescript
async performCleanup() {
  const results = {
    deletedEvents: 0,
    deletedWebhookLogs: 0,
    deletedCleanupLogs: 0
  };

  // 1. 태그 이벤트 정리 (1년 이상)
  results.deletedEvents = await this.cleanupEvents(365);

  // 2. 웹훅 로그 정리 (90일 이상)
  results.deletedWebhookLogs = await this.cleanupWebhookLogs(90);

  // 3. 정리 로그 정리 (2년 이상)
  results.deletedCleanupLogs = await this.cleanupCleanupLogs(730);

  // 4. 정리 로그 기록
  await this.logCleanup(results);

  return results;
}
```

### SQL 쿼리

**태그 이벤트 삭제**:

```sql
DELETE FROM tag_events
WHERE created_at < datetime('now', '-365 days');
```

**웹훅 로그 삭제**:

```sql
DELETE FROM webhook_logs
WHERE created_at < datetime('now', '-90 days');
```

**정리 로그 삭제**:

```sql
DELETE FROM cleanup_logs
WHERE created_at < datetime('now', '-730 days');
```

## 정리 로그

### 로그 스키마

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

### 실패 로그

```sql
CREATE TABLE cleanup_fail_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  error_message TEXT,
  stack_trace TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 수동 정리

### API 엔드포인트

**POST `/cleanup/manual`** (관리자 전용)

```typescript
@Post('manual')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
async manualCleanup() {
  return this.cleanupService.performCleanup();
}
```

## 데이터 보존 best practices

### 백업 before 정리

```powershell
# 백업 스크립트
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
Copy-Item "data\tagflow.db" -Destination "backup\tagflow_$timestamp.db"

# 정리 실행 (관리자 로그인)

# 백업 보존 (7일)
Get-ChildItem "backup" -Filter "tagflow_*.db" |
  Where-Object { $  _.LastWriteTime -lt (Get-Date).AddDays(-7) } |
  Remove-Item
```

### 아카이빙

장기 보존이 필요한 데이터:

```sql
-- 아카이브 테이블로 이동
CREATE TABLE tag_events_archive AS
SELECT * FROM tag_events
WHERE created_at < datetime('now', '-365 days');

-- 원본에서 삭제
DELETE FROM tag_events
WHERE id IN (SELECT id FROM tag_events_archive);
```

## 커스텀 보존 기간

### 코드 수정

`backend/src/cleanup/cleanup.service.ts`:

```typescript
export class CleanupService {
  private readonly EVENT_RETENTION_DAYS = 365; // 태그 이벤트
  private readonly WEBHOOK_LOG_RETENTION_DAYS = 90; // 웹훅 로그
  private readonly CLEANUP_LOG_RETENTION_DAYS = 730; // 정리 로그

  // 값 변경 후 재빌드
}
```

### 환경 변수 (향후 지원)

```env
EVENT_RETENTION_DAYS=365
WEBHOOK_LOG_RETENTION_DAYS=90
CLEANUP_LOG_RETENTION_DAYS=730
```

## 디스크 공간 관리

### 공간 모니터링

```sql
-- 각 테이블 레코드 수
SELECT
  (SELECT COUNT(*) FROM tag_events) as events,
  (SELECT COUNT(*) FROM webhook_logs) as webhook_logs,
  (SELECT COUNT(*) FROM cleanup_logs) as cleanup_logs;
```

### VACUUM

정리 후 디스크 공간 회수:

```sql
VACUUM;
```

```powershell
# PowerShell
sqlite3 data\tagflow.db "VACUUM;"
```

## 성능 영향

### 배치 삭제

대량 데이터 삭제 시 배치 처리:

```typescript
async cleanupEvents(retentionDays: number, batchSize = 1000) {
  let deletedCount = 0;
  let hasMore = true;

  while (hasMore) {
    const result = await this.db.run(`
      DELETE FROM tag_events
      WHERE id IN (
        SELECT id FROM tag_events
        WHERE created_at < datetime('now', '-${retentionDays} days')
        LIMIT ${batchSize}
      )
    `);

    deletedCount += result.changes;
    hasMore = result.changes === batchSize;
  }

  return deletedCount;
}
```

## 관련 문서

- [데이터 정리](../user-guides/admin/data-cleanup.md)
- [데이터베이스 스키마](../developer-guides/database-schema.md)
- [시스템 설정](../user-guides/admin/system-settings.md)
