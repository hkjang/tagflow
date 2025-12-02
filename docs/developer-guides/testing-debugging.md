# 테스트 및 디버깅

TagFlow의 테스트 전략, 디버깅 도구, 일반적인 문제 해결 방법을 안내합니다.

## 테스트 전략

### 단위 테스트

**Backend (Jest)**:

```typescript
// events.service.spec.ts
describe("EventsService", () => {
  let service: EventsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [EventsService, DatabaseService],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  it("should create an event", async () => {
    const dto = {
      tagId: "TEST_TAG",
      timestamp: new Date(),
      deviceId: "TEST_DEVICE",
    };

    const result = await service.create(dto);
    expect(result).toHaveProperty("id");
  });
});
```

**실행**:

```powershell
cd backend
npm test
```

### E2E 테스트

```typescript
// events.e2e-spec.ts
describe("Events (e2e)", () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    // 앱 초기화
    // 로그인하여 토큰 획득
  });

  it("/events (POST)", () => {
    return request(app.getHttpServer())
      .post("/events")
      .set("Authorization", `Bearer ${token}`)
      .send({ tagId: "TEST", timestamp: new Date() })
      .expect(201);
  });
});
```

**실행**:

```powershell
npm run test:e2e
```

## 디버깅

### VS Code 디버깅

**.vscode/launch.json**:

```json
{
  "configurations": [
    {
      "name": "Debug Backend",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "start:debug"],
      "cwd": "${workspaceFolder}/backend",
      "console": "integratedTerminal"
    },
    {
      "name": "Debug Frontend",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "cwd": "${workspaceFolder}/frontend",
      "port": 9229
    }
  ]
}
```

### 로깅

**백엔드 로깅**:

```typescript
import { Logger } from "@nestjs/common";

export class MyService {
  private readonly logger = new Logger(MyService.name);

  async doSomething() {
    this.logger.debug("디버그 메시지");
    this.logger.log("정보 메시지");
    this.logger.warn("경고 메시지");
    this.logger.error("오류 메시지");
  }
}
```

### 브레이크포인트

1. 코드에 브레이크포인트 설정 (F9)
2. 디버그 모드로 실행 (F5)
3. 요청 실행하여 브레이크포인트 도달
4. 변수 검사, 스텝 실행

## 일반적인 문제

### 로그인 실패

**증상**: 401 Unauthorized

**디버깅**:

```typescript
// auth.service.ts에 로깅 추가
async validateUser(username: string, password: string) {
  this.logger.debug(`Validating user: ${username}`);
  const user = await this.findByUsername(username);

  if (!user) {
    this.logger.warn(`User not found: ${username}`);
    return null;
  }

  const isValid = await bcrypt.compare(password, user.password);
  this.logger.debug(`Password valid: ${isValid}`);

  return isValid ? user : null;
}
```

### 웹훅 전송 실패

**디버깅**:

```typescript
// webhooks.service.ts
async executeWebhook(webhook, event) {
  try {
    this.logger.debug(`Executing webhook: ${webhook.name}`);
    this.logger.debug(`Payload: ${JSON.stringify(payload)}`);

    const response = await fetch(webhook.url, {...});

    this.logger.debug(`Response: ${response.status}`);
    return response;
  } catch (error) {
    this.logger.error(`Webhook error: ${error.message}`);
    this.logger.error(error.stack);
    throw error;
  }
}
```

### DB 잠금

**증상**: SQLITE_BUSY

**해결**:

1. 다중 백엔드 인스턴스 확인
2. 트랜잭션 타임아웃 설정

```typescript
const db = new Database("tagflow.db", {
  timeout: 5000, // 5초
});
```

## 성능 분석

### API 응답 시간

```typescript
// interceptor
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    return next.handle().pipe(
      tap(() => {
        const elapsed = Date.now() - now;
        console.log(`Request took ${elapsed}ms`);
      })
    );
  }
}
```

### 데이터베이스 쿼리

```sql
-- SQLite Query Plan
EXPLAIN QUERY PLAN
SELECT * FROM tag_events WHERE tag_id = 'TAG_001';
```

## 테스트 데이터

### 시드 데이터 생성

```typescript
// seed.ts
async function seedTestData() {
  // 테스트 사용자
  await createUser({
    username: "test_operator",
    password: "test123",
    name: "테스트 운영자",
    role: "operator",
  });

  // 테스트 이벤트
  for (let i = 0; i < 100; i++) {
    await createEvent({
      tagId: `TEST_TAG_${i}`,
      timestamp: new Date(),
      deviceId: "TEST_DEVICE",
    });
  }
}
```

## 문제 해결 체크리스트

### 백엔드가 시작되지 않음

- [ ] Node.js 버전 확인 (18+)
- [ ] 의존성 설치 확인
- [ ] 포트 충돌 확인 (3001)
- [ ] 데이터베이스 파일 권한
- [ ] 환경 변수 설정

### 프론트엔드가 백엔드에 연결되지 않음

- [ ] 백엔드 실행 중인지 확인
- [ ] CORS 설정 확인
- [ ] API URL 확인 (http://localhost:3001)
- [ ] 네트워크 탭에서 요청/응답 확인

### 웹훅이 작동하지 않음

- [ ] 웹훅 활성화 상태
- [ ] URL 유효성
- [ ] 인증 헤더
- [ ] 네트워크 접근성
- [ ] 웹훅 로그 확인

## 관련 문서

- [개발 환경](development-environment.md)
- [API 레퍼런스](api-reference.md)
- [아키텍처](architecture.md)
