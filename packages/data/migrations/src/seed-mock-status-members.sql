-- seed-mock-status-members.sql
-- userId=15 의 챌린지/프로젝트 상태를 다양하게 변경하고,
-- 다른 유저들을 랜덤 멤버로 추가합니다.
-- 실행 전: seed-mock-data.sql 이 먼저 실행되어 있어야 합니다.
-- User 테이블에 15번 외에 다른 유저가 존재해야 멤버가 추가됩니다.

BEGIN;

-- ============================================================
-- 0. 기존 멤버 정리 (HOST 제외, 이전 시드 멤버만)
-- ============================================================
DELETE FROM "ChallengeMember"
WHERE "challengeId" IN (SELECT id FROM "Challenge" WHERE "hostId" = 15)
  AND "memberType" = 'MEMBER'::"ChallengeMember_membertype_enum";

DELETE FROM "ProjectMember"
WHERE "projectId" IN (SELECT id FROM "Project" WHERE "hostId" = 15)
  AND "memberType" = 'MEMBER'::"ProjectMember_membertype_enum";

-- ============================================================
-- 1. 챌린지 상태 업데이트
--    30개를 다양한 상태로 분배:
--      RECRUITING (10) - 일부는 빈자리 많음, 일부는 거의 참
--      RECRUITMENT_CLOSED (8)
--      IN_PROGRESS (7)
--      COMPLETED (5)
-- ============================================================
WITH challenge_rows AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS rn
  FROM "Challenge"
  WHERE "hostId" = 15
)
UPDATE "Challenge" c
SET status = (CASE
  -- 1~10: RECRUITING
  WHEN cr.rn <= 10 THEN 'RECRUITING'
  -- 11~18: RECRUITMENT_CLOSED
  WHEN cr.rn <= 18 THEN 'RECRUITMENT_CLOSED'
  -- 19~25: IN_PROGRESS
  WHEN cr.rn <= 25 THEN 'IN_PROGRESS'
  -- 26~30: COMPLETED
  ELSE 'COMPLETED'
END)::"Challenge_status_enum"
FROM challenge_rows cr
WHERE c.id = cr.id;

-- ============================================================
-- 2. 프로젝트 상태 업데이트
--    30개를 분배:
--      recruiting (18)
--      recruitment_closed (12)
-- ============================================================
WITH project_rows AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS rn
  FROM "Project"
  WHERE "hostId" = 15
)
UPDATE "Project" p
SET status = (CASE
  WHEN pr.rn <= 18 THEN 'recruiting'
  ELSE 'recruitment_closed'
END)::"Project_status_enum"
FROM project_rows pr
WHERE p.id = pr.id;

-- ============================================================
-- 3. 챌린지 멤버 추가
--    - 사용 가능한 유저 풀에서 랜덤 선택 (15번 제외)
--    - 상태별 멤버 수:
--      RECRUITING: 0~(max-2)명 (빈자리 있음)
--      RECRUITMENT_CLOSED: max-1 명 (정원 꽉참)
--      IN_PROGRESS: max-1 명 (정원 꽉참)
--      COMPLETED: max-1 명 (정원 꽉참)
-- ============================================================
WITH
available_users AS (
  SELECT id AS uid, ROW_NUMBER() OVER (ORDER BY random()) AS shuffle_order
  FROM "User"
  WHERE id != 15
),
challenge_info AS (
  SELECT
    c.id AS challenge_id,
    c."maxParticipants",
    c.status,
    ROW_NUMBER() OVER (ORDER BY c.id) AS rn
  FROM "Challenge" c
  WHERE c."hostId" = 15
),
-- 각 챌린지에 넣을 멤버 수 결정
challenge_member_count AS (
  SELECT
    challenge_id,
    "maxParticipants",
    status,
    rn,
    CASE
      -- RECRUITING: 챌린지별로 1~(max-2) 정도 (빈자리 확보)
      WHEN status = 'RECRUITING'::"Challenge_status_enum" THEN
        CASE
          WHEN rn <= 3  THEN 0                        -- 3개는 아직 참여자 없음
          WHEN rn <= 6  THEN GREATEST(1, "maxParticipants" / 3)  -- 소수 참여
          WHEN rn <= 8  THEN GREATEST(2, "maxParticipants" / 2)  -- 절반 참여
          ELSE GREATEST(2, "maxParticipants" - 3)                -- 거의 참 (빈자리 2개)
        END
      -- 나머지 상태: 정원-1 (HOST 포함이므로 max-1 명 추가)
      ELSE GREATEST(1, "maxParticipants" - 1)
    END AS member_count
  FROM challenge_info
),
-- 시리즈 생성 (최대 20명까지 지원)
member_slots AS (
  SELECT generate_series(1, 20) AS slot_num
),
-- 챌린지별 멤버 슬롯 확장
challenge_member_assignments AS (
  SELECT
    cmc.challenge_id,
    cmc.rn,
    ms.slot_num,
    -- 각 챌린지마다 다른 유저 풀 오프셋 적용
    ((cmc.rn - 1) * 20 + ms.slot_num) AS user_pick_order
  FROM challenge_member_count cmc
  JOIN member_slots ms ON ms.slot_num <= cmc.member_count
),
-- 유저 매핑 (순환 할당: 유저가 부족하면 돌려쓰기)
user_count AS (
  SELECT COUNT(*) AS cnt FROM available_users
),
challenge_user_mapped AS (
  SELECT
    cma.challenge_id,
    au.uid AS user_id
  FROM challenge_member_assignments cma
  CROSS JOIN user_count uc
  JOIN available_users au ON au.shuffle_order = ((cma.user_pick_order - 1) % GREATEST(uc.cnt, 1)) + 1
)
INSERT INTO "ChallengeMember" ("challengeId", "userId", "memberType")
SELECT DISTINCT ON (challenge_id, user_id)
  challenge_id,
  user_id,
  'MEMBER'::"ChallengeMember_membertype_enum"
FROM challenge_user_mapped
ON CONFLICT ("challengeId", "userId") DO NOTHING;

-- ============================================================
-- 4. 프로젝트 멤버 추가
--    - recruiting: 0~(max-2)명 (빈자리 있음)
--    - recruitment_closed: max-1 명 (정원 꽉참)
-- ============================================================
WITH
available_users AS (
  SELECT id AS uid, ROW_NUMBER() OVER (ORDER BY random()) AS shuffle_order
  FROM "User"
  WHERE id != 15
),
project_info AS (
  SELECT
    p.id AS project_id,
    p."maxMembers",
    p.status,
    ROW_NUMBER() OVER (ORDER BY p.id) AS rn
  FROM "Project" p
  WHERE p."hostId" = 15
),
project_member_count AS (
  SELECT
    project_id,
    "maxMembers",
    status,
    rn,
    CASE
      WHEN status = 'recruiting'::"Project_status_enum" THEN
        CASE
          WHEN rn <= 4  THEN 0                                  -- 참여자 없음
          WHEN rn <= 8  THEN GREATEST(1, "maxMembers" / 3)     -- 소수 참여
          WHEN rn <= 13 THEN GREATEST(2, "maxMembers" / 2)     -- 절반 참여
          ELSE GREATEST(2, "maxMembers" - 2)                    -- 거의 참
        END
      -- recruitment_closed: 정원-1 (HOST 포함)
      ELSE GREATEST(1, "maxMembers" - 1)
    END AS member_count
  FROM project_info
),
member_slots AS (
  SELECT generate_series(1, 20) AS slot_num
),
project_member_assignments AS (
  SELECT
    pmc.project_id,
    pmc.rn,
    ms.slot_num,
    ((pmc.rn - 1) * 20 + ms.slot_num + 600) AS user_pick_order  -- offset 600 to avoid same users as challenges
  FROM project_member_count pmc
  JOIN member_slots ms ON ms.slot_num <= pmc.member_count
),
user_count AS (
  SELECT COUNT(*) AS cnt FROM available_users
),
project_user_mapped AS (
  SELECT
    pma.project_id,
    au.uid AS user_id
  FROM project_member_assignments pma
  CROSS JOIN user_count uc
  JOIN available_users au ON au.shuffle_order = ((pma.user_pick_order - 1) % GREATEST(uc.cnt, 1)) + 1
)
INSERT INTO "ProjectMember" ("projectId", "userId", "memberType")
SELECT DISTINCT ON (project_id, user_id)
  project_id,
  user_id,
  'MEMBER'::"ProjectMember_membertype_enum"
FROM project_user_mapped
ON CONFLICT ("projectId", "userId") DO NOTHING;

-- ============================================================
-- 5. viewCount도 상태에 맞게 현실적으로 설정
-- ============================================================
WITH challenge_rows AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS rn, status
  FROM "Challenge"
  WHERE "hostId" = 15
)
UPDATE "Challenge" c
SET "viewCount" = CASE
  WHEN cr.status = 'RECRUITING'::"Challenge_status_enum"          THEN (cr.rn * 7 + 3)
  WHEN cr.status = 'RECRUITMENT_CLOSED'::"Challenge_status_enum"  THEN (cr.rn * 12 + 50)
  WHEN cr.status = 'IN_PROGRESS'::"Challenge_status_enum"         THEN (cr.rn * 15 + 80)
  WHEN cr.status = 'COMPLETED'::"Challenge_status_enum"           THEN (cr.rn * 20 + 120)
  ELSE 0
END
FROM challenge_rows cr
WHERE c.id = cr.id;

WITH project_rows AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS rn, status
  FROM "Project"
  WHERE "hostId" = 15
)
UPDATE "Project" p
SET "viewCount" = CASE
  WHEN pr.status = 'recruiting'::"Project_status_enum"          THEN (pr.rn * 9 + 5)
  WHEN pr.status = 'recruitment_closed'::"Project_status_enum"  THEN (pr.rn * 14 + 60)
  ELSE 0
END
FROM project_rows pr
WHERE p.id = pr.id;

-- ============================================================
-- 6. 결과 확인 쿼리
-- ============================================================
-- 챌린지 상태별 요약
SELECT
  c.status,
  COUNT(*) AS count,
  SUM((SELECT COUNT(*) FROM "ChallengeMember" cm WHERE cm."challengeId" = c.id)) AS total_members
FROM "Challenge" c
WHERE c."hostId" = 15
GROUP BY c.status
ORDER BY c.status;

-- 프로젝트 상태별 요약
SELECT
  p.status,
  COUNT(*) AS count,
  SUM((SELECT COUNT(*) FROM "ProjectMember" pm WHERE pm."projectId" = p.id)) AS total_members
FROM "Project" p
WHERE p."hostId" = 15
GROUP BY p.status
ORDER BY p.status;

COMMIT;
