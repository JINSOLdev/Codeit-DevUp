-- seed-mock-data.sql
-- userId=15 가 생성하는 챌린지 30개 + 프로젝트 30개 + HOST 멤버 + 댓글(각 10개)
-- 실행 전 User(id=15)가 존재해야 합니다.

BEGIN;

-- ============================================================
-- 1. 기존 시드 데이터 정리 (동일 hostId + title 기준)
-- ============================================================
DELETE FROM "Challenge"
WHERE "hostId" = 15
  AND title IN (
    '백엔드 코테 4주 완주 챌린지','프론트엔드 면접 대비 챌린지','NestJS API 설계 습관 만들기',
    'React 리팩토링 21일 챌린지','SQL 튜닝 기초 챌린지','Docker 실무 입문 챌린지',
    'TypeScript 타입 안정성 강화 챌린지','CS 스터디 기록 챌린지','코드리뷰 습관 형성 챌린지',
    '모의 기술면접 실전 챌린지','Node.js 비동기 패턴 챌린지','Git 협업 흐름 챌린지',
    '테스트 코드 2주 챌린지','Redis 캐시 적용 챌린지','프로젝트 문서화 챌린지',
    '알고리즘 중급 문제풀이 챌린지','백엔드 아키텍처 읽기 챌린지','프론트 성능 최적화 챌린지',
    '클린코드 실천 챌린지','취준 포트폴리오 점검 챌린지','Spring to Nest 전환 챌린지',
    '자료구조 복습 챌린지','프론트 디자인 시스템 챌린지','실무 로그 분석 챌린지',
    'CI/CD 파이프라인 챌린지','보안 기본기 챌린지','GraphQL API 입문 챌린지',
    '모바일 앱 구조 학습 챌린지','개발 회고 루틴 챌린지','커리어 전환 준비 챌린지'
  );

DELETE FROM "Project"
WHERE "hostId" = 15
  AND title IN (
    'React + NestJS 풀스택 포트폴리오 프로젝트','2026 서울 해커톤 AI 서비스 팀원 모집',
    '헬스케어 스타트업 MVP 개발 팀 모집','개발자 포트폴리오 리뷰 플랫폼 제작',
    '부동산 데이터 분석 공모전 팀 모집','대학생 연합 사이드프로젝트 스터디앱',
    '면접 일정 관리 SaaS 프로토타입','지역 행사 추천 서비스 해커톤 팀',
    'B2B 견적 자동화 스타트업 빌드','실시간 채팅 커뮤니티 공모전 프로젝트',
    '여행 일정 공유 포트폴리오 팀','스터디 모집 플랫폼 고도화 프로젝트',
    '음성 메모 AI 요약 해커톤 팀','로컬 상점 쿠폰 플랫폼 스타트업 팀',
    'AI 면접 피드백 서비스 공모전 팀','팀 협업 캘린더 포트폴리오 프로젝트',
    '병원 예약 최적화 스타트업 초기팀','개인 금융 가계부 해커톤 팀원 모집',
    '복지정보 통합검색 공모전 프로젝트','사내 지식관리 툴 포트폴리오 개발',
    '친환경 리워드 앱 스타트업 팀','모임 정산 서비스 해커톤 출전팀',
    '개발 학습 기록 서비스 공모전 팀','취준생 모의면접 매칭 플랫폼',
    '물류 추적 SaaS 스타트업 팀원 모집','대학생 일정관리 앱 해커톤 팀',
    '비영리 캠페인 페이지 공모전 개발','이커머스 운영툴 포트폴리오 프로젝트',
    '중고거래 신뢰지수 스타트업 팀','교육 콘텐츠 추천 서비스 팀 모집'
  );

-- ============================================================
-- 2. 챌린지 INSERT + HOST 멤버 + 댓글
-- ============================================================
WITH inserted_challenges AS (
  INSERT INTO "Challenge" ("hostId", title, description, tags, "startDate", "endDate", "recruitDeadline", "verificationFrequency", "verificationMethod", "maxParticipants", "joinType", status, "viewCount")
  VALUES
    (15, '백엔드 코테 4주 완주 챌린지', '평일 저녁 알고리즘 1문제 풀이 후 풀이 노트를 공유합니다. 코드 리뷰 1회 포함.', ARRAY['코테','백엔드','취업'], '2026-04-06', '2026-04-24', '2026-04-05', 'ONCE_A_DAY', 'IMAGE_AND_TEXT', 6, 'INSTANT', 'RECRUITING', 0),
    (15, '프론트엔드 면접 대비 챌린지', 'CS/브라우저 핵심 질문을 정리하고 모의 면접 답변을 매일 업로드합니다.', ARRAY['면접','프론트','취준'], '2026-04-07', '2026-04-26', '2026-04-06', 'EVERY_WEEKDAY', 'TEXT', 7, 'APPROVAL', 'RECRUITING', 0),
    (15, 'NestJS API 설계 습관 만들기', 'REST 설계 원칙과 에러 처리 패턴을 실습하며 짧은 API를 매일 구현합니다.', ARRAY['학습','성장','기록'], '2026-04-08', '2026-04-28', '2026-04-07', 'ONCE_A_WEEK', 'IMAGE', 8, 'INSTANT', 'RECRUITING', 0),
    (15, 'React 리팩토링 21일 챌린지', '기존 컴포넌트를 개선하고 상태 구조를 정리한 before/after를 기록합니다.', ARRAY['스터디','실전','루틴'], '2026-04-09', '2026-04-30', '2026-04-08', 'THREE_TIMES_A_WEEK', 'IMAGE_AND_TEXT', 9, 'APPROVAL', 'RECRUITING', 0),
    (15, 'SQL 튜닝 기초 챌린지', '실행계획 확인, 인덱스 실험, 쿼리 개선 로그를 주 3회 공유합니다.', ARRAY['리뷰','협업','개발'], '2026-04-10', '2026-05-02', '2026-04-09', 'ONCE_A_DAY', 'TEXT', 10, 'INSTANT', 'RECRUITING', 0),
    (15, 'Docker 실무 입문 챌린지', '개발 환경 컨테이너화와 compose 운영을 단계별로 진행합니다.', ARRAY['코테','백엔드','취업'], '2026-04-11', '2026-05-04', '2026-04-10', 'EVERY_WEEKDAY', 'IMAGE', 11, 'APPROVAL', 'RECRUITING', 0),
    (15, 'TypeScript 타입 안정성 강화 챌린지', 'any 제거, 유틸 타입 적용, 오류 사례 정리를 반복 학습합니다.', ARRAY['면접','프론트','취준'], '2026-04-12', '2026-05-06', '2026-04-11', 'ONCE_A_WEEK', 'IMAGE_AND_TEXT', 12, 'INSTANT', 'RECRUITING', 0),
    (15, 'CS 스터디 기록 챌린지', '운영체제/네트워크 핵심 개념을 하루 1개씩 요약하고 질의응답합니다.', ARRAY['학습','성장','기록'], '2026-04-13', '2026-05-08', '2026-04-12', 'THREE_TIMES_A_WEEK', 'TEXT', 13, 'APPROVAL', 'RECRUITING', 0),
    (15, '코드리뷰 습관 형성 챌린지', '리뷰 코멘트 품질 기준을 맞추고 근거 중심 피드백을 연습합니다.', ARRAY['스터디','실전','루틴'], '2026-04-14', '2026-05-10', '2026-04-13', 'ONCE_A_DAY', 'IMAGE', 14, 'INSTANT', 'RECRUITING', 0),
    (15, '모의 기술면접 실전 챌린지', '질문은행 기반으로 답변 녹음/피드백을 주고받습니다.', ARRAY['리뷰','협업','개발'], '2026-04-15', '2026-05-12', '2026-04-14', 'EVERY_WEEKDAY', 'IMAGE_AND_TEXT', 15, 'APPROVAL', 'RECRUITING', 0),
    (15, 'Node.js 비동기 패턴 챌린지', 'Promise, stream, queue 처리 패턴을 예제로 검증합니다.', ARRAY['코테','백엔드','취업'], '2026-04-16', '2026-05-14', '2026-04-15', 'ONCE_A_WEEK', 'TEXT', 16, 'INSTANT', 'RECRUITING', 0),
    (15, 'Git 협업 흐름 챌린지', '브랜치 전략, PR 템플릿, 충돌 해결 과정을 실습합니다.', ARRAY['면접','프론트','취준'], '2026-04-17', '2026-05-16', '2026-04-16', 'THREE_TIMES_A_WEEK', 'IMAGE', 17, 'APPROVAL', 'RECRUITING', 0),
    (15, '테스트 코드 2주 챌린지', '단위/통합 테스트를 작성하고 커버리지보다 시나리오 품질에 집중합니다.', ARRAY['학습','성장','기록'], '2026-04-06', '2026-05-06', '2026-04-05', 'ONCE_A_DAY', 'IMAGE_AND_TEXT', 18, 'INSTANT', 'RECRUITING', 0),
    (15, 'Redis 캐시 적용 챌린지', '핫 데이터 캐싱, 만료 전략, 캐시 미스 대응을 구현합니다.', ARRAY['스터디','실전','루틴'], '2026-04-07', '2026-05-08', '2026-04-06', 'EVERY_WEEKDAY', 'TEXT', 19, 'APPROVAL', 'RECRUITING', 0),
    (15, '프로젝트 문서화 챌린지', '요구사항, API 스펙, 회고 문서를 템플릿 기반으로 작성합니다.', ARRAY['리뷰','협업','개발'], '2026-04-08', '2026-05-10', '2026-04-07', 'ONCE_A_WEEK', 'IMAGE', 20, 'INSTANT', 'RECRUITING', 0),
    (15, '알고리즘 중급 문제풀이 챌린지', '그래프/DP 중심으로 난이도 있는 문제를 함께 풉니다.', ARRAY['코테','백엔드','취업'], '2026-04-09', '2026-05-12', '2026-04-08', 'THREE_TIMES_A_WEEK', 'IMAGE_AND_TEXT', 6, 'APPROVAL', 'RECRUITING', 0),
    (15, '백엔드 아키텍처 읽기 챌린지', '레이어드 구조와 모듈 경계를 분석해 리팩토링 아이디어를 공유합니다.', ARRAY['면접','프론트','취준'], '2026-04-10', '2026-05-14', '2026-04-09', 'ONCE_A_DAY', 'TEXT', 7, 'INSTANT', 'RECRUITING', 0),
    (15, '프론트 성능 최적화 챌린지', '렌더링 병목, 번들 크기, 이미지 최적화를 체크리스트로 관리합니다.', ARRAY['학습','성장','기록'], '2026-04-11', '2026-05-16', '2026-04-10', 'EVERY_WEEKDAY', 'IMAGE', 8, 'APPROVAL', 'RECRUITING', 0),
    (15, '클린코드 실천 챌린지', '함수 분리, 네이밍, 에러 처리 기준을 매일 적용합니다.', ARRAY['스터디','실전','루틴'], '2026-04-12', '2026-05-18', '2026-04-11', 'ONCE_A_WEEK', 'IMAGE_AND_TEXT', 9, 'INSTANT', 'RECRUITING', 0),
    (15, '취준 포트폴리오 점검 챌린지', '이력서/프로젝트 소개 문구를 다듬고 주 2회 피드백합니다.', ARRAY['리뷰','협업','개발'], '2026-04-13', '2026-05-20', '2026-04-12', 'THREE_TIMES_A_WEEK', 'TEXT', 10, 'APPROVAL', 'RECRUITING', 0),
    (15, 'Spring to Nest 전환 챌린지', '개념 매핑과 실습 과제를 통해 백엔드 전환 학습을 진행합니다.', ARRAY['코테','백엔드','취업'], '2026-04-14', '2026-05-02', '2026-04-13', 'ONCE_A_DAY', 'IMAGE', 11, 'INSTANT', 'RECRUITING', 0),
    (15, '자료구조 복습 챌린지', '핵심 자료구조를 구현하고 시간복잡도 비교표를 작성합니다.', ARRAY['면접','프론트','취준'], '2026-04-15', '2026-05-04', '2026-04-14', 'EVERY_WEEKDAY', 'IMAGE_AND_TEXT', 12, 'APPROVAL', 'RECRUITING', 0),
    (15, '프론트 디자인 시스템 챌린지', '컴포넌트 규칙과 토큰 체계를 정의하고 샘플 화면을 구축합니다.', ARRAY['학습','성장','기록'], '2026-04-16', '2026-05-06', '2026-04-15', 'ONCE_A_WEEK', 'TEXT', 13, 'INSTANT', 'RECRUITING', 0),
    (15, '실무 로그 분석 챌린지', '에러 로그 패턴을 분류하고 재현/원인 분석 템플릿을 사용합니다.', ARRAY['스터디','실전','루틴'], '2026-04-17', '2026-05-08', '2026-04-16', 'THREE_TIMES_A_WEEK', 'IMAGE', 14, 'APPROVAL', 'RECRUITING', 0),
    (15, 'CI/CD 파이프라인 챌린지', '자동 테스트와 배포 단계를 간소화한 워크플로를 구성합니다.', ARRAY['리뷰','협업','개발'], '2026-04-06', '2026-04-28', '2026-04-05', 'ONCE_A_DAY', 'IMAGE_AND_TEXT', 15, 'INSTANT', 'RECRUITING', 0),
    (15, '보안 기본기 챌린지', '인증/인가, 입력 검증, 시크릿 관리 체크리스트를 점검합니다.', ARRAY['코테','백엔드','취업'], '2026-04-07', '2026-04-30', '2026-04-06', 'EVERY_WEEKDAY', 'TEXT', 16, 'APPROVAL', 'RECRUITING', 0),
    (15, 'GraphQL API 입문 챌린지', '스키마 설계와 resolver 최적화 기초를 학습합니다.', ARRAY['면접','프론트','취준'], '2026-04-08', '2026-05-02', '2026-04-07', 'ONCE_A_WEEK', 'IMAGE', 17, 'INSTANT', 'RECRUITING', 0),
    (15, '모바일 앱 구조 학습 챌린지', 'React Native 아키텍처와 상태 관리를 예제로 정리합니다.', ARRAY['학습','성장','기록'], '2026-04-09', '2026-05-04', '2026-04-08', 'THREE_TIMES_A_WEEK', 'IMAGE_AND_TEXT', 18, 'APPROVAL', 'RECRUITING', 0),
    (15, '개발 회고 루틴 챌린지', '매일 목표-실행-회고 3줄 기록으로 학습 흐름을 유지합니다.', ARRAY['스터디','실전','루틴'], '2026-04-10', '2026-05-06', '2026-04-09', 'ONCE_A_DAY', 'TEXT', 19, 'INSTANT', 'RECRUITING', 0),
    (15, '커리어 전환 준비 챌린지', '비전공/직무전환 관점에서 기본기 로드맵을 함께 실행합니다.', ARRAY['리뷰','협업','개발'], '2026-04-11', '2026-05-08', '2026-04-10', 'EVERY_WEEKDAY', 'IMAGE', 20, 'APPROVAL', 'RECRUITING', 0)
  RETURNING id
),

-- 2-1. 챌린지 HOST 멤버
challenge_members AS (
  INSERT INTO "ChallengeMember" ("challengeId", "userId", "memberType")
  SELECT id, 15, 'HOST' FROM inserted_challenges
  RETURNING id
),

-- 2-2. 챌린지 댓글 (각 챌린지당 10개)
challenge_comments AS (
  INSERT INTO "ChallengeComment" ("challengeId", "userId", content)
  SELECT c.id, 15, comment.text
  FROM inserted_challenges c
  CROSS JOIN (VALUES
    ('좋은 챌린지네요. 끝까지 같이 가요.'),
    ('인증 방식이 명확해서 참여하기 좋습니다.'),
    ('일정 확인했습니다. 성실히 참여하겠습니다.'),
    ('목표가 구체적이라 동기부여가 됩니다.'),
    ('주차별 진행 공지 기대하고 있습니다.'),
    ('회고 공유 문화가 있으면 더 좋을 것 같아요.'),
    ('질문 채널도 운영되면 좋겠습니다.'),
    ('이번에는 꼭 완주해보겠습니다.'),
    ('스터디 분위기가 좋아 보여요.'),
    ('중간 점검 일정도 있으면 좋겠습니다.')
  ) AS comment(text)
  RETURNING id
),

-- ============================================================
-- 3. 프로젝트 INSERT + HOST 멤버 + 댓글
-- ============================================================
inserted_projects AS (
  INSERT INTO "Project" ("hostId", title, description, "projectType", "techStacks", positions, "maxMembers", "recruitEndDate", "projectStartDate", "projectEndDate", "contactMethod", "contactLink", status, "viewCount")
  VALUES
    (15, 'React + NestJS 풀스택 포트폴리오 프로젝트', '취업 준비생 대상 커뮤니티 서비스를 함께 만듭니다. 인증, 게시판, 알림까지 MVP 구현이 목표입니다.', 'portfolio', ARRAY['react','typescript','nestjs','postgresql','docker'], ARRAY['fe','be','designer'], 4, '2026-04-09', '2026-04-12', '2026-05-27', 'discord', 'https://example.com/contact/project-1', 'recruiting', 0),
    (15, '2026 서울 해커톤 AI 서비스 팀원 모집', '해커톤 본선 진출을 목표로 AI 기반 생활 편의 서비스를 빠르게 구현합니다.', 'hackathon', ARRAY['python','react','nextjs','firebase','figma'], ARRAY['fe','be','pm','designer'], 5, '2026-04-10', '2026-04-14', '2026-05-30', 'kakao_open_chat', 'https://example.com/contact/project-2', 'recruiting', 0),
    (15, '헬스케어 스타트업 MVP 개발 팀 모집', '운동 루틴/트레이너 매칭 서비스 초기 MVP를 개발합니다. 장기 운영 의지가 있는 분을 찾습니다.', 'startup', ARRAY['react','nodejs','postgresql','aws','figma'], ARRAY['fe','be','ios','android','designer'], 6, '2026-04-11', '2026-04-16', '2026-06-02', 'email', 'mailto:mock-team-3@example.com', 'recruiting', 0),
    (15, '개발자 포트폴리오 리뷰 플랫폼 제작', '프로젝트 리뷰와 피드백 기록 기능을 갖춘 웹 플랫폼을 제작합니다.', 'portfolio', ARRAY['nextjs','typescript','nestjs','postgresql','docker'], ARRAY['fe','be','designer'], 7, '2026-04-12', '2026-04-18', '2026-06-05', 'google_form', 'https://example.com/contact/project-4', 'recruiting', 0),
    (15, '부동산 데이터 분석 공모전 팀 모집', '공공데이터 기반 예측 모델과 시각화 대시보드를 제작해 공모전에 제출합니다.', 'contest', ARRAY['python','react','postgresql','aws','figma'], ARRAY['pm','be','fe','designer'], 4, '2026-04-13', '2026-04-20', '2026-06-08', 'discord', 'https://example.com/contact/project-5', 'recruiting', 0),
    (15, '대학생 연합 사이드프로젝트 스터디앱', '과제/일정 공유와 집중 타이머를 제공하는 모바일 앱 MVP를 개발합니다.', 'other', ARRAY['flutter','nodejs','postgresql','docker','firebase'], ARRAY['be','android','ios','designer'], 5, '2026-04-14', '2026-04-17', '2026-06-06', 'kakao_open_chat', 'https://example.com/contact/project-6', 'recruiting', 0),
    (15, '면접 일정 관리 SaaS 프로토타입', '취준생용 일정/알림/회고 기능을 제공하는 SaaS형 서비스를 구현합니다.', 'portfolio', ARRAY['react','typescript','nestjs','redis','docker'], ARRAY['fe','be','pm'], 6, '2026-04-15', '2026-04-19', '2026-06-09', 'email', 'mailto:mock-team-7@example.com', 'recruiting', 0),
    (15, '지역 행사 추천 서비스 해커톤 팀', '위치 기반 이벤트 추천과 저장 기능을 갖춘 서비스로 해커톤 출전을 준비합니다.', 'hackathon', ARRAY['nextjs','typescript','nodejs','mongodb','aws'], ARRAY['fe','be','designer'], 7, '2026-04-16', '2026-04-21', '2026-06-12', 'google_form', 'https://example.com/contact/project-8', 'recruiting', 0),
    (15, 'B2B 견적 자동화 스타트업 빌드', '중소기업 견적 요청-응답 프로세스를 자동화하는 초기 제품을 함께 만듭니다.', 'startup', ARRAY['react','nestjs','postgresql','redis','docker'], ARRAY['be','fe','pm','designer'], 4, '2026-04-17', '2026-04-23', '2026-06-15', 'discord', 'https://example.com/contact/project-9', 'recruiting', 0),
    (15, '실시간 채팅 커뮤니티 공모전 프로젝트', '웹소켓 기반 채팅/알림 기능을 포함한 커뮤니티 앱을 공모전에 맞춰 개발합니다.', 'contest', ARRAY['react','nodejs','postgresql','docker','aws'], ARRAY['fe','be','devops'], 5, '2026-04-18', '2026-04-25', '2026-06-18', 'kakao_open_chat', 'https://example.com/contact/project-10', 'recruiting', 0),
    (15, '여행 일정 공유 포트폴리오 팀', '여행 코스 작성, 지도 표시, 댓글 기능이 있는 서비스를 구현합니다.', 'portfolio', ARRAY['nextjs','typescript','nestjs','postgresql','aws'], ARRAY['fe','be','designer'], 6, '2026-04-19', '2026-04-22', '2026-06-16', 'email', 'mailto:mock-team-11@example.com', 'recruiting', 0),
    (15, '스터디 모집 플랫폼 고도화 프로젝트', '기존 스터디 모집 서비스에 추천/검색 성능 개선을 적용합니다.', 'other', ARRAY['react','typescript','nestjs','postgresql','redis'], ARRAY['fe','be','pm'], 7, '2026-04-20', '2026-04-24', '2026-06-19', 'google_form', 'https://example.com/contact/project-12', 'recruiting', 0),
    (15, '음성 메모 AI 요약 해커톤 팀', '음성 인식 결과를 요약/태깅하는 기능을 단기간 구현합니다.', 'hackathon', ARRAY['python','react','firebase','docker','figma'], ARRAY['be','fe','designer'], 4, '2026-04-21', '2026-04-26', '2026-06-22', 'discord', 'https://example.com/contact/project-13', 'recruiting', 0),
    (15, '로컬 상점 쿠폰 플랫폼 스타트업 팀', '사장님용 쿠폰 발행/통계와 사용자 앱을 포함한 MVP를 만듭니다.', 'startup', ARRAY['nodejs','react','postgresql','aws','redis'], ARRAY['be','fe','android','designer'], 5, '2026-04-22', '2026-04-28', '2026-06-25', 'kakao_open_chat', 'https://example.com/contact/project-14', 'recruiting', 0),
    (15, 'AI 면접 피드백 서비스 공모전 팀', '답변 녹음 분석과 피드백 리포트를 제공하는 서비스로 공모전에 참여합니다.', 'contest', ARRAY['python','nextjs','postgresql','docker','aws'], ARRAY['be','fe','pm'], 6, '2026-04-23', '2026-04-30', '2026-06-28', 'email', 'mailto:mock-team-15@example.com', 'recruiting', 0),
    (15, '팀 협업 캘린더 포트폴리오 프로젝트', '칸반/캘린더/알림을 결합한 협업 웹앱을 제작합니다.', 'portfolio', ARRAY['react','typescript','nestjs','postgresql','docker'], ARRAY['fe','be','designer'], 7, '2026-04-24', '2026-04-27', '2026-06-26', 'google_form', 'https://example.com/contact/project-16', 'recruiting', 0),
    (15, '병원 예약 최적화 스타트업 초기팀', '예약 슬롯 최적화와 대기열 관리를 포함한 의료 예약 MVP를 개발합니다.', 'startup', ARRAY['java','spring','postgresql','redis','aws'], ARRAY['be','fe','pm'], 4, '2026-04-25', '2026-04-29', '2026-06-29', 'discord', 'https://example.com/contact/project-17', 'recruiting', 0),
    (15, '개인 금융 가계부 해커톤 팀원 모집', '지출 분류와 소비 패턴 분석 기능을 중심으로 단기 개발합니다.', 'hackathon', ARRAY['react','nodejs','postgresql','docker','figma'], ARRAY['fe','be','designer'], 5, '2026-04-26', '2026-05-01', '2026-07-02', 'kakao_open_chat', 'https://example.com/contact/project-18', 'recruiting', 0),
    (15, '복지정보 통합검색 공모전 프로젝트', '분산된 복지 정보를 통합 탐색하는 검색 UX를 구현합니다.', 'contest', ARRAY['nextjs','typescript','nestjs','postgresql','aws'], ARRAY['fe','be','designer'], 6, '2026-04-27', '2026-05-03', '2026-07-05', 'email', 'mailto:mock-team-19@example.com', 'recruiting', 0),
    (15, '사내 지식관리 툴 포트폴리오 개발', '문서 검색/질문/답변 흐름을 지원하는 팀 위키 서비스를 구축합니다.', 'portfolio', ARRAY['react','typescript','nodejs','mongodb','docker'], ARRAY['fe','be','pm'], 7, '2026-04-28', '2026-05-05', '2026-07-08', 'google_form', 'https://example.com/contact/project-20', 'recruiting', 0),
    (15, '친환경 리워드 앱 스타트업 팀', '친환경 행동 기록과 보상 포인트 기능을 갖춘 앱 MVP를 만듭니다.', 'startup', ARRAY['flutter','nodejs','postgresql','aws','firebase'], ARRAY['android','ios','be','designer'], 4, '2026-04-09', '2026-04-12', '2026-06-16', 'discord', 'https://example.com/contact/project-21', 'recruiting', 0),
    (15, '모임 정산 서비스 해커톤 출전팀', '송금내역 기반 자동 정산 기능을 구현해 해커톤에서 데모합니다.', 'hackathon', ARRAY['react','typescript','nestjs','postgresql','docker'], ARRAY['fe','be','pm'], 5, '2026-04-10', '2026-04-14', '2026-06-19', 'kakao_open_chat', 'https://example.com/contact/project-22', 'recruiting', 0),
    (15, '개발 학습 기록 서비스 공모전 팀', '학습 인증/회고/통계 시각화 기능을 중심으로 제품을 개발합니다.', 'contest', ARRAY['nextjs','typescript','nestjs','postgresql','redis'], ARRAY['fe','be','designer'], 6, '2026-04-11', '2026-04-16', '2026-06-22', 'email', 'mailto:mock-team-23@example.com', 'recruiting', 0),
    (15, '취준생 모의면접 매칭 플랫폼', '직무별 모의면접 매칭과 피드백 저장 기능을 구현합니다.', 'portfolio', ARRAY['react','typescript','nodejs','postgresql','aws'], ARRAY['fe','be','designer'], 7, '2026-04-12', '2026-04-18', '2026-06-25', 'google_form', 'https://example.com/contact/project-24', 'recruiting', 0),
    (15, '물류 추적 SaaS 스타트업 팀원 모집', '배송 현황 추적과 알림 자동화를 제공하는 B2B SaaS를 개발합니다.', 'startup', ARRAY['java','spring','postgresql','redis','docker'], ARRAY['be','fe','devops'], 4, '2026-04-13', '2026-04-20', '2026-06-28', 'discord', 'https://example.com/contact/project-25', 'recruiting', 0),
    (15, '대학생 일정관리 앱 해커톤 팀', '캘린더 공유와 과제 리마인더 중심의 앱을 48시간 내 구현합니다.', 'hackathon', ARRAY['flutter','firebase','figma','nodejs','typescript'], ARRAY['android','ios','be','designer'], 5, '2026-04-14', '2026-04-17', '2026-06-26', 'kakao_open_chat', 'https://example.com/contact/project-26', 'recruiting', 0),
    (15, '비영리 캠페인 페이지 공모전 개발', '캠페인 소개/후원/성과 리포트를 포함한 웹페이지를 제작합니다.', 'contest', ARRAY['nextjs','typescript','aws','figma','firebase'], ARRAY['fe','designer','pm'], 6, '2026-04-15', '2026-04-19', '2026-06-29', 'email', 'mailto:mock-team-27@example.com', 'recruiting', 0),
    (15, '이커머스 운영툴 포트폴리오 프로젝트', '상품/주문/재고 관리 기능을 제공하는 운영툴을 구축합니다.', 'portfolio', ARRAY['react','typescript','nestjs','postgresql','docker'], ARRAY['fe','be','designer'], 7, '2026-04-16', '2026-04-21', '2026-07-02', 'google_form', 'https://example.com/contact/project-28', 'recruiting', 0),
    (15, '중고거래 신뢰지수 스타트업 팀', '거래 이력 기반 신뢰 점수와 분쟁 대응 기능을 설계합니다.', 'startup', ARRAY['react','nodejs','postgresql','redis','aws'], ARRAY['be','fe','pm','designer'], 4, '2026-04-17', '2026-04-23', '2026-07-05', 'discord', 'https://example.com/contact/project-29', 'recruiting', 0),
    (15, '교육 콘텐츠 추천 서비스 팀 모집', '학습 이력 기반 추천과 큐레이션 기능을 포함한 서비스를 개발합니다.', 'other', ARRAY['python','nextjs','postgresql','docker','aws'], ARRAY['be','fe','designer'], 5, '2026-04-18', '2026-04-25', '2026-07-08', 'kakao_open_chat', 'https://example.com/contact/project-30', 'recruiting', 0)
  RETURNING id
),

-- 3-1. 프로젝트 HOST 멤버
project_members AS (
  INSERT INTO "ProjectMember" ("projectId", "userId", "memberType")
  SELECT id, 15, 'HOST' FROM inserted_projects
  RETURNING id
)

-- 3-2. 프로젝트 댓글 (각 프로젝트당 10개)
INSERT INTO "ProjectComment" ("projectId", "userId", content)
SELECT p.id, 15, comment.text
FROM inserted_projects p
CROSS JOIN (VALUES
  ('주제와 방향성이 명확해서 좋습니다.'),
  ('역할 분담이 잘 되면 빠르게 진행될 것 같아요.'),
  ('기술 스택 구성이 실무적이네요.'),
  ('일정만 잘 맞추면 완성도 높게 나올 것 같습니다.'),
  ('요구사항 문서도 같이 정리하면 좋겠습니다.'),
  ('데모데이 목표가 분명해서 참여 의지가 생깁니다.'),
  ('초기 아키텍처 논의부터 함께하고 싶어요.'),
  ('커뮤니케이션 룰 정하면 더 안정적일 것 같습니다.'),
  ('MVP 범위가 현실적이라 좋아 보입니다.'),
  ('회고 문화까지 있으면 팀 성장에 도움이 될 것 같아요.')
) AS comment(text);

COMMIT;
