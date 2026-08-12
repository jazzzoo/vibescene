import posthog from 'posthog-js';

let initialized = false;
let available = false;

/**
 * AnalyticsProvider.web.tsx에서 앱 시작 시 1회만 호출된다.
 * EXPO_PUBLIC_POSTHOG_KEY가 없거나 초기화가 실패해도 앱 동작에는 영향을 주지 않는다.
 */
export function initPostHog(): void {
  if (initialized) return;
  initialized = true;
  if (typeof window === 'undefined') return;

  const key = process.env.EXPO_PUBLIC_POSTHOG_KEY;
  if (!key) return;

  const host = process.env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com';

  try {
    posthog.init(key, {
      api_host: host,
      autocapture: false,
      capture_pageview: false,
      disable_session_recording: true,
      persistence: 'localStorage',
    });
    available = true;
  } catch {
    available = false;
  }
}

/**
 * 분석 실패가 앱을 절대 깨뜨리지 않도록 하는 안전한 fire-and-forget capture.
 * PostHog가 초기화되지 않았거나(key 없음, 초기화 실패) capture 자체가 실패해도 조용히 무시한다.
 */
export function capture(eventName: string, properties?: Record<string, unknown>): void {
  if (!available) return;
  try {
    posthog.capture(eventName, properties);
  } catch {
    // 분석 실패는 항상 조용히 무시
  }
}
