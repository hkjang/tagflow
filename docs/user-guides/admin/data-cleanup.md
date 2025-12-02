# 데이터 정리

TagFlow의 자동 데이터 정리 시스템과 수동 정리 방법을 안내합니다.

```
⚠️ 관리자 전용 기능
데이터 정리 로그 조회 및 수동 정리는 관리자(Admin) 역할만 사용할 수 있습니다.
```

## 데이터 보존 정책 개요

TagFlow는 자동 데이터 정리 시스템을 통해 디스크 공간을 관리하고 시스템 성능을 유지합니다.

### 기본 보존 정책

| 데이터 유형        | 보존 기간   | 정리 시점        |
| ------------------ | ----------- | ---------------- |
| **태그 이벤트**    | 1년 (365일) | 관리자 로그인 시 |
| **웹훅 로그**      | 90일        | 관리자 로그인 시 |
| **정리 로그**      | 2년 (730일) | 관리자 로그인 시 |
| **정리 실패 로그** | 2년 (730일) | 관리자 로그인 시 |

```
💡 중요
보존 기간은 데이터 생성일(created_at)을 기준으로 계산됩니다.
```

## 자동 데이터 정리

### 정리 트리거

자동 데이터 정리는 다음 시점에 실행됩니다:

1. **관리자 로그인 시**
   - 관리자가 로그인하면 자동으로 정리 작업 실행
   - 백그라운드에서 비동기로 실행되어 로그인 속도에 영향 없음

### 정리 프로세스

로그인 시 다음 순서로 정리 작업이 진행됩니다:

#### 1단계: 태그 이벤트 정리

```
대상: 1년(365일) 이상 된 태그 이벤트
작업: 오래된 이벤트 레코드 삭제
```

#### 2단계: 웹훅 로그 정리

```
대상: 90일 이상 된 웹훅 실행 로그
작업: 오래된 웹훅 로그 삭제
```

#### 3단계: 정리 로그 정리

```
대상: 2년(730일) 이상 된 정리 로그
작업: 오래된 정리 기록 삭제
```

### 정리 알림

정리 작업 완료 시:

- 대시보드에 알림 메시지 표시
- 정리된 레코드 수 표시
- 정리 로그에 기록

```
✅ 데이터 정리 완료
- 태그 이벤트: 1,234건 삭제
- 웹훅 로그: 567건 삭제
- 정리 로그: 0건 삭제
```

## 정리 로그 조회

### 정리 로그 페이지 접근

1. 관리자 계정으로 로그인
2. 사이드바에서 **관리 > 정리 로그** 클릭
3. 과거 정리 작업 이력이 표시됩니다

### 정리 로그 정보

각 정리 로그에는 다음 정보가 포함됩니다:

| 필드                 | 설명                  |
| -------------------- | --------------------- |
| **실행 시간**        | 정리 작업 실행 일시   |
| **삭제된 이벤트**    | 삭제된 태그 이벤트 수 |
| **삭제된 웹훅 로그** | 삭제된 웹훅 로그 수   |
| **삭제된 정리 로그** | 삭제된 정리 로그 수   |
| **총 삭제 건수**     | 전체 삭제된 레코드 수 |
| **실행 시간**        | 정리 작업 소요 시간   |
| **상태**             | 성공/실패             |

### 성공 로그 예시

```
실행 시간: 2025-12-03 09:30:15
삭제된 이벤트: 2,450건
삭제된 웹훅 로그: 890건
삭제된 정리 로그: 12건
총 삭제 건수: 3,352건
실행 시간: 2.3초
상태: ✅ 성공
```

### 실패 로그 조회

정리 작업이 실패한 경우 실패 로그에 기록됩니다.

**실패 로그 정보**:

- 실패 시간
- 오류 메시지
- 스택 트레이스 (디버깅용)

**일반적인 실패 원인**:

1. 데이터베이스 잠금
2. 디스크 공간 부족
3. 권한 오류

## 수동 데이터 정리

### 수동 정리가 필요한 경우

자동 정리 외에 수동으로 데이터를 정리해야 하는 상황:

1. **긴급 디스크 공간 확보**

   - 디스크 공간이 부족할 때
   - 즉시 정리 필요

2. **맞춤 정리 기간 적용**

   - 기본 보존 기간과 다른 조건으로 정리
   - 특정 기간의 데이터만 삭제

3. **테스트 데이터 정리**
   - 개발/테스트 환경에서 생성된 데이터 제거

### 수동 정리 실행 방법

```
⚠️ 주의
수동 정리는 삭제된 데이터를 복구할 수 없습니다!
반드시 백업 후 실행하세요.
```

#### 웹 UI를 통한 수동 정리

1. **정리 로그 페이지**로 이동
2. **"수동 정리 실행"** 버튼 클릭
3. 정리 확인 대화상자에서 조건 확인:

   ```
   다음 데이터가 삭제됩니다:
   - 1년 이상 된 태그 이벤트
   - 90일 이상 된 웹훅 로그
   - 2년 이상 된 정리 로그

   계속하시겠습니까?
   ```

4. **"실행"** 버튼으로 확인
5. 정리 작업 완료 후 결과 표시

#### API를 통한 수동 정리

```bash
POST /cleanup/manual
Authorization: Bearer {access_token}
```

응답 예시:

```json
{
  "success": true,
  "deletedEvents": 1234,
  "deletedWebhookLogs": 567,
  "deletedCleanupLogs": 0,
  "totalDeleted": 1801,
  "duration": "2.3s"
}
```

## 보존 기간 변경

현재 버전에서는 보존 기간을 UI에서 변경할 수 없습니다. 기본값을 사용합니다.

### 커스텀 보존 기간 설정 (개발자)

개발자는 백엔드 코드에서 보존 기간을 수정할 수 있습니다:

**파일**: `backend/src/cleanup/cleanup.service.ts`

```typescript
// 보존 기간 상수
private readonly EVENT_RETENTION_DAYS = 365;      // 태그 이벤트
private readonly WEBHOOK_LOG_RETENTION_DAYS = 90; // 웹훅 로그
private readonly CLEANUP_LOG_RETENTION_DAYS = 730; // 정리 로그
```

수정 후 백엔드를 다시 빌드하고 재시작해야 합니다.

```bash
cd backend
npm run build
npm run start:dev
```

## 데이터 백업

정리 작업 전 데이터를 백업하는 것이 좋습니다.

### SQLite 데이터베이스 백업

#### 방법 1: 파일 복사

```powershell
# 백업 디렉토리 생성
New-Item -Path "backup" -ItemType Directory -Force

# 데이터베이스 파일 복사
Copy-Item "data\tagflow.db" -Destination "backup\tagflow_$(Get-Date -Format 'yyyyMMdd_HHmmss').db"
```

#### 방법 2: SQLite 내보내기

```powershell
# SQLite CLI 사용
sqlite3 data\tagflow.db ".dump" > backup\tagflow_dump.sql
```

### 자동 백업 스크립트

정기적인 백업을 위한 PowerShell 스크립트:

```powershell
# backup-db.ps1
$backupDir = "backup"
$dbPath = "data\tagflow.db"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupPath = "$backupDir\tagflow_$timestamp.db"

# 백업 디렉토리 생성
if (-not (Test-Path $backupDir)) {
    New-Item -Path $backupDir -ItemType Directory
}

# 데이터베이스 복사
Copy-Item $dbPath -Destination $backupPath

# 7일 이상 된 백업 삭제
Get-ChildItem $backupDir -Filter "tagflow_*.db" |
    Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-7) } |
    Remove-Item

Write-Host "백업 완료: $backupPath"
```

실행:

```powershell
.\backup-db.ps1
```

### 백업 복원

백업 파일로 복원하려면:

```powershell
# 1. 애플리케이션 중지
# 2. 현재 DB 백업 (안전장치)
Copy-Item "data\tagflow.db" -Destination "data\tagflow.db.old"

# 3. 백업 파일로 복원
Copy-Item "backup\tagflow_20251203_093000.db" -Destination "data\tagflow.db" -Force

# 4. 애플리케이션 재시작
```

## 디스크 공간 모니터링

### 데이터베이스 크기 확인

#### Windows PowerShell

```powershell
# 데이터베이스 파일 크기 확인
Get-Item "data\tagflow.db" | Select-Object Name,
    @{Name="Size(MB)";Expression={[math]::Round($_.Length/1MB,2)}}
```

#### SQLite 쿼리

```sql
-- 각 테이블의 레코드 수 확인
SELECT 'tag_events' as table_name, COUNT(*) as count FROM tag_events
UNION ALL
SELECT 'webhook_logs', COUNT(*) FROM webhook_logs
UNION ALL
SELECT 'webhooks', COUNT(*) FROM webhooks
UNION ALL
SELECT 'users', COUNT(*) FROM users;
```

### 공간 확보 권장사항

| DB 크기   | 권장 조치                           |
| --------- | ----------------------------------- |
| < 100MB   | 정상 - 조치 불필요                  |
| 100-500MB | 주의 - 정기적인 모니터링            |
| 500MB-1GB | 경고 - 수동 정리 고려               |
| > 1GB     | 위험 - 즉시 정리 또는 보존기간 단축 |

## 성능 최적화

### 대량 데이터 정리 시 고려사항

수십만 건 이상의 레코드를 정리할 때:

1. **배치 삭제**

   - 한 번에 모두 삭제하지 말고 배치로 나누어 삭제
   - 현재 시스템은 자동으로 배치 처리

2. **오프피크 시간 실행**

   - 사용자가 적은 시간대에 수동 실행
   - 예: 새벽 시간, 주말

3. **VACUUM 실행**
   - 정리 후 데이터베이스 최적화
   ```sql
   VACUUM;
   ```

### 정리 후 최적화

정리 작업 후 성능 개선을 위해:

```bash
# SQLite VACUUM 실행 (데이터베이스 최적화)
sqlite3 data\tagflow.db "VACUUM;"

# 인덱스 재구축
sqlite3 data\tagflow.db "REINDEX;"
```

## 문제 해결

### 정리 작업이 실행되지 않아요

**증상**: 관리자로 로그인해도 정리 작업이 실행되지 않습니다.

**해결책**:

1. **백엔드 로그 확인**

   ```
   backend 콘솔에서 정리 관련 로그 확인
   ```

2. **수동 정리 시도**

   - 정리 로그 페이지에서 수동 실행

3. **데이터베이스 권한 확인**
   - 백엔드가 데이터베이스 쓰기 권한을 가지고 있는지 확인

### 정리 작업이 너무 오래 걸려요

**증상**: 정리 작업이 수 분 이상 소요됩니다.

**원인**:

- 대량의 오래된 데이터
- 데이터베이스 인덱스 부족
- 디스크 I/O 병목

**해결책**:

1. **인덱스 추가** (개발자)

   ```sql
   CREATE INDEX IF NOT EXISTS idx_events_created
   ON tag_events(created_at);

   CREATE INDEX IF NOT EXISTS idx_webhook_logs_created
   ON webhook_logs(created_at);
   ```

2. **배치 크기 조정** (개발자)
   - 코드에서 배치 크기를 줄여 DB 잠금 시간 단축

### 정리 후에도 공간이 확보되지 않아요

**증상**: 데이터를 삭제했는데 DB 파일 크기가 줄지 않습니다.

**원인**:

- SQLite는 DELETE 후 자동으로 공간을 반환하지 않음

**해결책**:

```bash
# VACUUM 명령으로 공간 회수
sqlite3 data\tagflow.db "VACUUM;"
```

VACUUM 실행 후 DB 파일 크기가 줄어듭니다.

## 모범 사례

### 정기 점검 체크리스트

**월 1회**:

- [ ] 정리 로그 검토
- [ ] 데이터베이스 크기 확인
- [ ] 실패 로그 확인 및 해결

**분기 1회**:

- [ ] 데이터베이스 백업
- [ ] VACUUM 실행
- [ ] 보존 정책 적정성 검토

**연 1회**:

- [ ] 전체 데이터 백업 및 아카이빙
- [ ] 보존 정책 재평가
- [ ] 시스템 용량 계획 수립

### 데이터 보존 전략

1. **중요 데이터 별도 보관**

   - 장기 보존이 필요한 데이터는 정기적으로 내보내기
   - 외부 스토리지 또는 클라우드에 아카이빙

2. **정리 전 알림**

   - 정리 예정 데이터를 미리 검토
   - stakeholder에게 사전 공지

3. **테스트 환경 활용**
   - 프로덕션 정리 전 테스트 환경에서 검증

## 관련 문서

- [데이터 보존 정책](../../feature-guides/data-retention.md)
- [데이터베이스 스키마](../../developer-guides/database-schema.md)
- [시스템 설정](system-settings.md)
- [문제 해결](../../deployment/troubleshooting.md)
