// 사용자에게 안전하게 노출할 수 있는 에러 — 내부 스택트레이스 미노출
export class SafeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SafeError";
  }
}

// DB(Postgres/PostgREST) 작업 실패를 진단 가능하게 감싸는 에러.
// 사용자에게는 SafeError와 동일하게 안전한 message만 노출되고,
// dbStep/pgCode/pgDetails/pgHint/pgMessage는 서버 로그·개발용 응답 필드로만 사용한다.
export class DbOperationError extends SafeError {
  readonly dbStep: string;
  readonly code: string;
  readonly pgCode?: string;
  readonly pgDetails?: string;
  readonly pgHint?: string;
  readonly pgMessage?: string;

  constructor(
    dbStep: string,
    code: string,
    pgError: { message?: string; code?: string; details?: string; hint?: string } | null,
    userMessage: string,
  ) {
    super(userMessage);
    this.name = "DbOperationError";
    this.dbStep = dbStep;
    this.code = code;
    this.pgCode = pgError?.code;
    this.pgDetails = pgError?.details;
    this.pgHint = pgError?.hint;
    this.pgMessage = pgError?.message;
  }
}
