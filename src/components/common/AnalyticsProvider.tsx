// 네이티브(iOS/Android)에서는 Vercel Analytics를 사용하지 않는다.
// 웹 빌드는 AnalyticsProvider.web.tsx가 우선 사용된다.
export default function AnalyticsProvider() {
  return null;
}
