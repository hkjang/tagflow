# 리포팅 및 분석

TagFlow의 리포팅 시스템, 사용 가능한 지표, 데이터 분석 방법을 설명합니다.

## 리포트 종류

### 이벤트 통계

**제공 지표**:

- 총 이벤트 수 (기간별)
- 시간대별 분포
- 일별/주별/월별 트렌드
- 장치별 이벤트 수
- 위치별 이벤트 수
- TOP 태그 (가장 많이 스캔된)

### 웹훅 성능

**제공 지표**:

- 웹훅별 전송 횟수
- 성공률
- 평균 응답 시간
- 실패 횟수 및 원인
- 재시도 통계

## API 엔드포인트

### 이벤트 통계

**GET `/reports/events`**

**쿼리 파라미터**:

```
?startDate=2025-12-01&endDate=2025-12-03&groupBy=hour
```

**응답**:

```json
{
  "total": 2756,
  "byHour": [
    { "hour": 0, "count": 45 },
    { "hour": 1, "count": 23 },
    ...
  ],
  "byDevice": [
    { "deviceId": "READER_01", "count": 1234 },
    { "deviceId": "READER_02", "count": 890 }
  ],
  "topTags": [
    { "tagId": "TAG_001", "count": 56 },
    { "tagId": "TAG_002", "count": 42 }
  ]
}
```

### 웹훅 성능

**GET `/reports/webhooks`**

**쿼리 파라미터**:

```
?startDate=2025-12-01&endDate=2025-12-03
```

**응답**:

```json
{
  "webhooks": [
    {
      "id": 1,
      "name": "ERP 연동",
      "totalRequests": 1234,
      "successCount": 1215,
      "failureCount": 19,
      "successRate": 98.5,
      "avgResponseTime": 145
    }
  ]
}
```

## 데이터 집계

### 시간대별 집계

```sql
SELECT
  strftime('%H', timestamp) as hour,
  COUNT(*) as count
FROM tag_events
WHERE timestamp BETWEEN ? AND ?
GROUP BY hour
ORDER BY hour;
```

### 장치별 집계

```sql
SELECT
  device_id,
  COUNT(*) as count
FROM tag_events
WHERE timestamp BETWEEN ? AND ?
GROUP BY device_id
ORDER BY count DESC;
```

## 차트 및 시각화

### 프론트엔드 구현

**시간별 막대 그래프**:

```typescript
import { BarChart } from "recharts";

<BarChart data={data.byHour}>
  <XAxis dataKey="hour" />
  <YAxis />
  <Bar dataKey="count" fill="#8884d8" />
</BarChart>;
```

**웹훅 성공률 파이 차트**:

```typescript
import { PieChart, Pie } from "recharts";

const data = [
  { name: "성공", value: successCount },
  { name: "실패", value: failureCount },
];

<PieChart>
  <Pie data={data} dataKey="value" />
</PieChart>;
```

## 성능 고려사항

### 캐싱

리포트 데이터는 캐시 가능:

```typescript
@Cacheable({ ttl: 300 }) // 5분 캐시
async getEventStats(startDate: Date, endDate: Date) {
  return this.calculateStats(startDate, endDate);
}
```

### 대용량 데이터

수백만 건의 이벤트 처리 시:

- 인덱스 활용
- 집계 테이블 사용 (pre-aggregation)
- 페이지네이션

## 맞춤 리포트

### 기간 선택

```typescript
const report = await fetch(`/reports/events?startDate=${start}&endDate=${end}`);
```

### 필터 옵션

- 특정 장치만
- 특정 위치만
- 특정 태그만

## 데이터 내보내기

### CSV 내보내기 (향후 지원)

```typescript
async exportToCSV(startDate: Date, endDate: Date) {
  const events = await this.getEvents(startDate, endDate);
  const csv = this.convertToCSV(events);
  return csv;
}
```

## 관련 문서

- [리포트 보기](../user-guides/operator/viewing-reports.md)
- [이벤트 추적](rfid-event-tracking.md)
- [API 레퍼런스](../developer-guides/api-reference.md)
