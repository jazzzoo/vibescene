-- refresh_token은 발급된 OAuth client_id(플랫폼별 native client)에 귀속되므로,
-- 토큰 갱신 시 올바른 client_id를 선택하기 위해 platform 정보를 저장한다.
alter table oauth_tokens
  add column if not exists platform text;

alter table oauth_tokens
  add constraint oauth_tokens_platform_check
  check (platform is null or platform in ('ios', 'android'));
