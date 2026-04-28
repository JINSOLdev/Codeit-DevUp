# DevUp Backend
> 2026.03 ~ 2026.04
> 데브업은 사용자들이 다양한 챌린지와 프로젝트를 통해 꾸준한 성장을 이룰 수 있도록 돕는 웹 플랫폼 입니다. </br>
> 사용자들은 챌린지와 프로젝트를 생성하고 참여하며, 인증을 통해 성장 과정을 기록하고 공유할 수 있습니다. </br>

---

## 주요 기능
- 챌린지 생성 및 관리 : 자유롭게 챌린지를 생성하고 참여자를 모집
- 인증 시스템 : 정기적인 인증을 통해 성장 과정을 기록
- 소셜 기능 : 댓글, 북마크를 통해 커뮤니티 활성화
- 알림 시스템 : 중요한 활동에 대한 실시간 알림 제공
- 소셜 로그인 : 편리한 가입 및 로그인 경험 제공

---

## 유저 플로우

[![영상 제목](http://img.youtube.com/vi/BJmJVUgNvqQ/0.jpg)](https://www.youtube.com/watch?v=BJmJVUgNvqQ)

1. 회원가입/로그인: 이메일 또는 소셜 계정으로 가입 및 인증
2. 챌린지 탐색: 다양한 챌린지 목록을 탐색하고 관심 있는 챌린지 발견
3. 챌린지 참여: 참여 신청 → 호스트 승인 → 챌린지 참여 시작
4. 챌린지 인증: 정해진 기간 동안 인증 글 작성 및 댓글 소통
5. 챌린지 승인/거절 : 챌린지에 참여 원하는 유저의 신청을 호스트가 승인 혹은 거절
6. 알림 확인: 챌린지 관련 알림 실시간 수신 및 확인

---

## 기술 스택

### Backend
- **Framework**: NestJS + Fastify
- **Database**: PostgreSQL (TypeORM)
- **Cache**: Redis
- **Authentication**: JWT (RSA)
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest, Cucumber (E2E)

### DevOps & Infrastructure
- **Containerization**: Docker, Docker Compose
- **Web Server**: Nginx
- **Package Manager**: pnpm (Monorepo)
- **CI/CD**: GitHub Actions
- **Environment**: Environment Variables (Joi validation)

### Architecture Pattern
- **Monorepo Structure**: Turbo + pnpm workspaces
- **Layered Architecture**: Controller → Service → Repository
- **Domain-Driven Design**: 패키지별 도메인 분리
- **Event-Driven**: NestJS Event Emitter

---

## 프로젝트 아키텍처

<img width="923" height="557" alt="Image" src="https://github.com/user-attachments/assets/b5c87636-117d-4b8e-be07-e9180019034a" />


---

## 백엔드 아키텍처

```
                        ┌─────────────────┐    
                        │     Frontend    │       
                        └─────────┬───────┘        
                                  │                      
                                  ┼
                                  │
                    ┌─────────────▼─────────────┐
                    │      API Gateway          │
                    │    (NestJS Gateway)       │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │                           │ 
                    │                           │                      
            ┌───────▼─────────┐       ┌─────────▼─────────┐  
            │    User API     │       │     Batch API     │  
            │      (유저)      │       │     (배치 처리)     │   
            └─────────────────┘       └───────────────────┘  
                    │                            │                      
                    └────────────┼───────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │     Shared Packages       │
                    │  ┌─────────────────────┐  │
                    │  │ data (도메인/엔티티)   │  │
                    │  │ infra (외부 연동)     │  │
                    │  │ system (공통 유틸)    │  │
                    │  └─────────────────────┘  │
                    └─────────────┬─────────────┘
                                  │
          ┌───────────────────────┼──────────────────────┐
          │                       │                      │
┌─────────▼─────────┐  ┌──────────▼─────────┐  ┌─────────▼─────────┐
│   PostgreSQL      │  │     Redis          │  │   External APIs   │
│   (주 데이터)       │  │   (캐시/세션)        │  │  (소셜/OAuth)       │
└───────────────────┘  └────────────────────┘  └───────────────────┘
```

## 프로젝트 구조

```
backend-api/
├── apps/
│   ├── user-api/          # 사용자 API 서버 
│   └── batch/             # 배치 처리 서버
├── packages/
│   ├── data/              # 도메인 모델 및 비즈니스 로직
│   │   ├── domain/
│   │   │   ├── challenge/        # 챌린지 관련 
│   │   │   ├── user/             # 사용자 관련 
│   │   │   ├── notification/     # 알림 시스템 
│   │   │   └── project/          # 프로젝트 관련
│   │   └── ...
│   ├── infra/             # 외부 서비스 연동
│   │   ├── aws/           # AWS 서비스 연동
│   │   └── social/        # 소셜 로그인
│   └── system/            # 공통 시스템 유틸리티
├── docker/                # Docker 설정
└── scripts/               # 빌드/배포 스크립트
```

---

## 담당 업무

### 1. 인증 시스템
- 회원가입/로그인 : 이메일 기반 인증 시스템 구현
- JWT 토큰 관리 : 액세스 토큰 및 리프레시 토큰 발급/검증
- 소셜 로그인 : Google, Kakao, GitHub OAuth 2.0 연동 
- 보안 강화 : 비밀번호 해싱, 토큰 만료 관리, 보안 미들웨어 구현

### 2. 챌린지 시스템
- 챌린지 CRUD: 생성, 조회, 수정, 삭제 기능 구현
- 참여 관리: 
  - 챌린지 참여 신청/승인/거절 시스템
  - 참여자 목록 조회 및 관리
- 인증 시스템 : 
  - 챌린지 인증 글 CRUD
  - 인증 상태 관리 (승인/거절/대기)
- 소통 기능 :
  - 챌린지 댓글 CRUD
  - 찜하기/취소하기 기능
- 이벤트 기반 알림 : 챌린지 관련 이벤트 발생 시 알림 자동 발송

### 3. 알림 시스템
- 알림 목록 조회 : 사용자별 알림 목록 페이징 처리
- 읽음 처리 : 개별 알림 및 전체 알림 읽음 상태 관리
- 알림 타입 관리 : 챌린지, 댓글, 참여 등 다양한 알림 타입 지원
- 자동 정리 : 30일 이상 된 알림 자동 정리 기능

--- 

## 기술적 도전 과제 및 해결 방법

### 1. 복잡한 챌린지 참여 상태 관리
문제 
챌린지 참여 상태(신청, 승인, 거절, 참여 중, 완료 등)의 효율적 관리

해결
- 상태 패턴(State Pattern)을 적용하여 각 상태별 비즈니스 로직 분리
- TypeORM의 Enum 타입을 활용하여 데이터베이스 레벨에서 상태 무결성 보장
- 상태 변경 시 이벤트를 발생시켜 관련 알림 자동 발송

```typescript
// 챌린지 참여 상태 Enum
export enum ChallengeParticipationStatus {
  PENDING = 'pending',         // 참여 신청 대기
  APPROVED = 'approved',       // 참여 승인됨
  REJECTED = 'rejected',       // 참여 거절됨
  IN_PROGRESS = 'in_progress', // 참여 진행 중
  COMPLETED = 'completed',     // 챌린지 완료
}
```

### 2. 소셜 로그인 OAuth 2.0 구현의 복잡성
문제
각 소셜 플랫폼(Google, Kakao, GitHub)별로 다른 OAuth 2.0 구현 방식과 데이터 형식의 통합 필요

해결
- 전략 패턴(Strategy Pattern)을 적용하여 각 소셜 플랫폼별 전략 클래스 구현
- 공통 인터페이스를 정의하여 플랫폼 간 일관된 API 제공
- 에러 핸들링을 통합하여 소셜 로그인 실패 시 사용자 친화적인 에러 메시지 제공

```typescript
// 소셜 로그인 전략 인터페이스
interface SocialAuthStrategy {
  authenticate(code: string): Promise<SocialUserProfile>;
  getRedirectUrl(): string;
}

// 각 플랫폼별 구현
class GoogleAuthStrategy implements SocialAuthStrategy { ... }
class KakaoAuthStrategy implements SocialAuthStrategy { ... }
class GitHubAuthStrategy implements SocialAuthStrategy { ... }
```

### 3. 대용량 알림 시스템의 성능 최적화
문제
많은 사용자에게 실시간 알림을 발송할 때 데이터베이스 부하와 응답 속도 저하 문제 발생

해결
- Redis를 활용한 알림 큐 구현으로 비동기 처리
- 데이터베이스 인덱스 최적화로 조회 성능 개선
- 30일 이상 된 알림 자동 정리 기능으로 데이터베이스 부하 감소
- 페이징 처리와 커서 기반 페이지네이션으로 대용량 데이터 효율적 처리

```typescript
// 알림 조회 최적화
async findAll(
  recipientId: number,
  recipientType: RecipientType,
  params: GetNotificationsReqDto
): Promise<GetNotificationsResDto> {
  const queryBuilder = this.notificationRepository
    .createQueryBuilder('notification')
    .where('notification.recipientId = :recipientId', { recipientId })
    .andWhere('notification.createdAt >= :thirtyDaysAgo', {
      thirtyDaysAgo: dayjs().subtract(30, 'day').toDate()
    })
    .orderBy('notification.createdAt', 'DESC')
    .skip(params.start)
    .take(params.perPage);
  
  return queryBuilder.getManyAndCount();
}
```

### 4. 이벤트 기반 아키텍처 구현
문제
챌린지 관련 다양한 이벤트(참여 신청, 인증, 댓글 등)가 발생할 때 관련 시스템에 일관된 방식으로 알림 보내야할 필요성 발생

해결
- NestJS의 EventEmitter2를 활용한 이벤트 기반 아키텍처 구현
- 각 도메인별 이벤트 타입 정의 및 이벤트 발행자/구독자 패턴 적용
- 이벤트 처리 실패 시 재시도 메커니즘 및 에러 로깅 구현

```typescript
// 챌린지 이벤트 발행
@Injectable()
export class ChallengeEventPublisher {
  constructor(@Inject(EVENT_EMITTER) private readonly eventEmitter: EventEmitter2) {}

  publishChallengeApplicationEvent(challengeId: number, applicantId: number) {
    this.eventEmitter.emit('challenge.applied', {
      challengeId,
      applicantId,
      timestamp: new Date()
    });
  }
}

// 이벤트 구독
@EventPattern('challenge.applied')
async handleChallengeApplication(payload: ChallengeApplicationEvent) {
  await this.notificationService.sendNotification({
    recipientId: payload.challengeId,
    type: NotificationType.CHALLENGE_APPLICATION,
    data: payload
  });
}
```

### 5. 타임존 처리의 복잡성
문제 
타임존 처리 복잡함

해결
- dayjs 라이브러리를 활용한 타임존 처리 통일
- 데이터베이스에는 UTC 시간으로 저장, API 응답 시 사용자 타임존으로 변환
- 챌린지 시작/종료 시간 계산 시 타임존 고려한 비즈니스 로직 구현

```typescript
// 타임존 처리
dayjs.extend(utc);
dayjs.extend(timezone);

const today = dayjs().tz('Asia/Seoul').format('YYYY-MM-DD')
```

---

## 개선점 및 향후 계획

### 1. 성능 최적화
- 캐싱 전략 개선 : Redis 클러스터링을 통한 확장성 확보
- 데이터베이스 파티셔닝 : 대용량 알림 데이터 효율적 관리
- API 응답 최적화 : GraphQL 도입을 통한 over-fetching 방지

### 2. 보안 강화
- Rate Limiting : API 요청 제한으로 무분별한 요청 방어
- 감사 로그 : 중요 작업별 로깅 시스템 강화
- 토큰 관리 개선 : Refresh Token Rotation 도입

### 3. 모니터링 및 로깅
- APM 도입 : New Relic 또는 Datadog을 통한 성능 모니터링
- 구조화된 로깅 : Winston을 활용한 체계적인 로그 관리
- 헬스체크 API : 시스템 상태 모니터링을 위한 헬스체크 엔드포인트 구현

### 4. 테스트 커버리지 확대
- E2E 테스트 : Cypress를 활용한 통합 테스트 자동화
- 부하 테스트 : K6를 활용한 시스템 부하 테스트
- 모킹 전략 : 외부 API 호출 모킹으로 테스트 안정성 확보

### 5. 기능 확장
- 실시간 알림 : WebSocket을 활용한 실시간 알림 기능
- 푸시 알림 : FCM을 활용한 모바일 푸시 알림
- 다국어 지원 : i18n을 통한 다국어 알림 지원

---

## 회고
**이 프로젝트를 통해 복잡한 도메인 로직을 어떻게 체계적으로 설계하고 구현하는지, 그리고 대용량 트래픽을 처리하는 백엔드 시스템의 핵심 원리를 깊이 있게 이해하게 되었습니다.**
