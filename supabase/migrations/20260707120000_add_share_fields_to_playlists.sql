-- 플레이리스트 공개 공유 링크(/p/:shareId) 기능을 위한 컬럼 추가.
-- share_id는 공유 전 null, 공유 시 crypto.randomUUID() 값.
-- is_public은 기본 false — share_id가 있어도 false면 비공개.
-- shared_at은 최초 공유 시각 기록.
alter table playlists
  add column if not exists share_id text;

alter table playlists
  add column if not exists is_public boolean not null default false;

alter table playlists
  add column if not exists shared_at timestamptz;

-- share_id가 null이 아닌 경우에만 unique 보장 (partial unique index).
-- null은 여러 행에 존재할 수 있으므로 full unique constraint 대신 사용.
create unique index if not exists playlists_share_id_unique_idx
  on playlists(share_id)
  where share_id is not null;
