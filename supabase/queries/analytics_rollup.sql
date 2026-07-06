-- VibeScene 이벤트 분석 쿼리 모음
-- Supabase Dashboard > SQL Editor 또는 서비스 롤로 실행 (events 테이블 SELECT는 서비스 롤 전용)

-- ============================================================
-- 1. 일별 앱 오픈 수
-- ============================================================
select
  (created_at at time zone 'Asia/Seoul')::date as day,
  count(*)                                      as app_opens
from events
where event_name = 'app_opened'
group by 1
order by 1 desc;


-- ============================================================
-- 2. 일별 분석 완료 수
-- ============================================================
select
  (created_at at time zone 'Asia/Seoul')::date as day,
  count(*)                                      as analyses_completed
from events
where event_name = 'analysis_completed'
group by 1
order by 1 desc;


-- ============================================================
-- 3. lane별 선택 분포
--    (playlists.primary_lane_name 기준 — events 아닌 playlists 테이블)
-- ============================================================
select
  coalesce(primary_lane_name, '(미지정)') as lane,
  count(*)                                as playlists_created,
  round(
    count(*) * 100.0 / nullif(sum(count(*)) over (), 0),
    1
  )                                       as pct
from playlists
group by 1
order by 2 desc;


-- ============================================================
-- 4. 퍼널 전체 누적
-- ============================================================
select step, total from (
  select 1 as ord, 'app_opened'           as step, count(*) as total from events where event_name = 'app_opened'
  union all
  select 2,        'image_uploaded',       count(*)          from events where event_name = 'image_uploaded'
  union all
  select 3,        'analysis_completed',   count(*)          from events where event_name = 'analysis_completed'
  union all
  select 4,        'playlist_link_opened', count(*)          from events where event_name = 'playlist_link_opened'
) funnel
order by ord;


-- ============================================================
-- 5. Play on YouTube 클릭 수 (일별)
-- ============================================================
select
  (created_at at time zone 'Asia/Seoul')::date as day,
  count(*)                                      as youtube_link_opens
from events
where event_name = 'playlist_link_opened'
group by 1
order by 1 desc;
