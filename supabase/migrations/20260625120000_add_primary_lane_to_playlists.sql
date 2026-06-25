-- GPT가 선택한 primary curation lane을 추적하기 위한 컬럼 추가.
-- lane별 선택 빈도/성공률 분석 및 향후 sub-lane 분리 판단에 사용한다.
-- 기존 row는 모두 null이 되므로 backward compatible.
alter table playlists
  add column if not exists primary_lane_id text;

alter table playlists
  add column if not exists primary_lane_name text;

-- catalog/youtube_fallback 구분은 이번 범위에서 사용하지 않음 — 컬럼만 미리 추가.
alter table playlists
  add column if not exists track_source text default null;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'playlists_track_source_check'
  ) then
    alter table playlists
      add constraint playlists_track_source_check
      check (track_source is null or track_source in ('catalog', 'youtube_fallback', 'mixed'));
  end if;
end $$;
