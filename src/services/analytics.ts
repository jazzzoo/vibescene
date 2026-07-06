import { supabase } from '../lib/supabaseClient';

/**
 * 이벤트를 events 테이블에 기록한다.
 * - user_id가 없으면(세션 미확보) 기록하지 않는다.
 * - 실패는 앱 동작에 영향을 주지 않도록 항상 조용히 무시한다.
 * - 호출부는 await 없이 void logEvent(...)로 호출한다.
 */
export async function logEvent(
  eventName: string,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user.id;
    if (!userId) return;

    await supabase.from('events').insert({
      user_id: userId,
      event_name: eventName,
      metadata,
    });
  } catch {
    // 로깅 실패는 조용히 무시
  }
}
