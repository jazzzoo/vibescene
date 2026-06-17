type RateLimitEntry = {
  count: number;
  windowStart: number;
};

// 메모리 기반 저장소. Edge Function 인스턴스별로 독립 동작하므로
// 완벽한 전역 rate limit이 아니라 MVP용 1차 방어막이다.
// 추후 Redis/Upstash/DB 기반으로 교체할 때는 이 파일 내부 구현만 바꾸면 되고,
// checkRateLimit 시그니처를 그대로 유지하면 호출부(index.ts)는 수정할 필요가 없다.
const rateLimitStore = new Map<string, RateLimitEntry>();

export type RateLimitResult = {
  allowed: boolean;
};

export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now - entry.windowStart >= windowMs) {
    rateLimitStore.set(key, { count: 1, windowStart: now });
    return { allowed: true };
  }

  if (entry.count >= limit) {
    return { allowed: false };
  }

  entry.count += 1;
  return { allowed: true };
}

// x-forwarded-for의 첫 번째 IP를 우선 사용하고, 없으면 cf-connecting-ip, 둘 다 없으면 "unknown"
export function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }

  const cfConnectingIp = req.headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp;

  return "unknown";
}
