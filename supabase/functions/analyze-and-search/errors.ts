// 사용자에게 안전하게 노출할 수 있는 에러 — 내부 스택트레이스 미노출
export class SafeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SafeError";
  }
}
