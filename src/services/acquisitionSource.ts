const STORAGE_KEY = 'vs_acq_src';
const DEFAULT_SOURCE = 'direct';
const VALID_SOURCE = /^[a-z0-9_]{1,40}$/;

let cachedSource: string | null = null;

function sanitize(raw: string): string | null {
  const candidate = raw.trim().toLowerCase();
  return VALID_SOURCE.test(candidate) ? candidate : null;
}

/**
 * 첫 방문 시 ?src=를 읽어 localStorage에 고정한다 — 이후 내부 이동/재방문에서도
 * 값이 바뀌지 않는다(의도적인 attribution 시스템이 없는 한 first-touch를 덮어쓰지 않음).
 * native(window 없음)나 localStorage 접근 실패 시에도 절대 throw하지 않고 "direct"로 폴백한다.
 */
export function getAcquisitionSource(): string {
  if (cachedSource) return cachedSource;

  if (typeof window === 'undefined') {
    cachedSource = DEFAULT_SOURCE;
    return cachedSource;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      cachedSource = stored;
      return cachedSource;
    }

    const raw = new URLSearchParams(window.location.search).get('src');
    const resolved = (raw && sanitize(raw)) || DEFAULT_SOURCE;

    window.localStorage.setItem(STORAGE_KEY, resolved);
    cachedSource = resolved;
    return cachedSource;
  } catch {
    cachedSource = DEFAULT_SOURCE;
    return cachedSource;
  }
}
