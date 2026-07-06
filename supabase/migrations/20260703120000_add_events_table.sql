-- 최소 이벤트 로깅 테이블.
-- 퍼널 추적(app_opened → image_uploaded → analysis_completed → playlist_link_opened)과
-- YouTube API quota 신청 시 실사용 근거 데이터 확보용.
create table if not exists events (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  event_name  text        not null,
  metadata    jsonb       not null default '{}',
  created_at  timestamptz not null default now()
);

-- 집계 쿼리 성능용 인덱스
create index if not exists events_event_name_created_at_idx
  on events (event_name, created_at desc);

create index if not exists events_user_id_idx
  on events (user_id);

-- RLS: 인증된 사용자는 자신의 이벤트만 INSERT 가능.
-- SELECT는 서비스 롤(Dashboard / 분석 쿼리)에서만 허용.
alter table events enable row level security;

create policy "users_insert_own_events"
  on events
  for insert
  to authenticated
  with check (auth.uid() = user_id);
