-- tracks.rank CHECK 제약을 10에서 20으로 확장.
-- analyze-and-search v52부터 FINAL_TRACK_COUNT=20으로 변경되었으나
-- 기존 제약이 rank <= 10만 허용하여 11~20번 트랙 INSERT가 실패하는 버그 수정.

alter table tracks drop constraint tracks_rank_check;

alter table tracks add constraint tracks_rank_check
  check (rank >= 1 and rank <= 20);
