import { supabase } from '../lib/supabaseClient';

/**
 * 이벤트를 events 테이블에 기록한다.
 * - user_id가 없으면(세션 미확보) 기록하지 않는다.
 * - 실패는 앱 동작에 영향을 주지 않도록 항상 조용히 무시한다.
 * - 대부분의 호출부는 await 없이 void logEvent(...)로 호출한다.
 * - 반환값(성공 여부)이 필요한 경우에만(예: FeedbackModal) await로 확인한다.
 */
export async function logEvent(
  eventName: string,
  metadata: Record<string, unknown> = {},
): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user.id;
    if (!userId) return false;

    await supabase.from('events').insert({
      user_id: userId,
      event_name: eventName,
      metadata,
    });
    return true;
  } catch {
    // 로깅 실패는 조용히 무시
    return false;
  }
}
