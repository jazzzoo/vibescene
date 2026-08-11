import { analyzeImage } from "../analyze-and-search/services/gpt.ts";
import { SafeError } from "../analyze-and-search/errors.ts";

// Step 5-C: TEMPORARY evaluation-only Edge Function.
//
// Purpose: let the local read-only evaluation script (scripts/evaluate-real-image-music.mjs)
// invoke the REAL production analyzeImage() — including the real SYSTEM_PROMPT, real lane
// validation, real 17+13 vector validation/normalization, and real one-time correction retry —
// against local test images, without touching the production analyze-and-search endpoint and
// without any DB, Storage, playlist, track, or history writes.
//
// This function does not import db.ts, does not create a Supabase client, does not touch
// Storage, and performs no auth/user lookups beyond the custom evaluation-token header below.
//
// DELETE THIS FUNCTION AND ITS VIBESCENE_EVALUATION_TOKEN SECRET AFTER THE EVALUATION IS DONE.

const EVALUATION_TOKEN_HEADER = "x-vibescene-evaluation-token";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": `content-type, ${EVALUATION_TOKEN_HEADER}`,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405, headers: CORS_HEADERS });
  }

  // 평가 전용 가드 — Supabase 사용자 인증이 아니라 임시 고엔트로피 토큰만 확인한다.
  // production 인증/DB/Storage 로직은 전혀 사용하지 않는다.
  const expectedToken = Deno.env.get("VIBESCENE_EVALUATION_TOKEN");
  const providedToken = req.headers.get(EVALUATION_TOKEN_HEADER);
  if (!expectedToken || !providedToken || providedToken !== expectedToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401, headers: CORS_HEADERS });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400, headers: CORS_HEADERS });
  }

  const record = body !== null && typeof body === "object" ? (body as Record<string, unknown>) : null;
  const filename = record && typeof record.filename === "string" ? record.filename : null;
  const imageDataUrl = record && typeof record.imageDataUrl === "string" ? record.imageDataUrl : null;

  if (!imageDataUrl) {
    return Response.json({ error: "imageDataUrl is required" }, { status: 400, headers: CORS_HEADERS });
  }

  // gpt.ts는 전혀 수정하지 않는다 — analyzeImage()가 내부적으로 이미 남기는 진단 로그
  // ([gpt] invalid_primary_lane_id / image_vector_or_genre_invalid_retrying /
  // image_vector_or_genre_invalid_after_retry / image_vector_validated)를 evaluation-only로
  // 가로채서 어느 검증 단계에서 무엇이 있었는지만 안전하게 관찰한다. 이 로그들은 gpt.ts가 이미
  // 필드 이름/이슈 목록만 남기고(원본 이미지, signed URL, 전체 프롬프트, 전체 GPT 응답 원문은
  // 절대 포함하지 않음) 찍고 있던 것이므로, 여기서는 가로채기만 할 뿐 새로운 정보를 만들어내지
  // 않는다. OpenAI 자체의 HTTP status/error.type/error.code/request id는 gpt.ts의
  // requestChatCompletion()이 애초에 response를 버리고 있어 여기서도 복구 불가능 — 그 경우
  // diagnostics.openAiResponseDetailUnavailable=true로만 표시한다.
  //
  // primary_lane_id는 이제 무효/누락이어도 analyzeImage()를 실패시키지 않는다(gpt.ts의
  // applyCompatibilityValidation 참고 — null로 정규화만 하고 통과시킴). 그래서 lane 관련 신호는
  // 에러 진단이 아니라 성공 응답 쪽 evaluation 참고 정보로만 남긴다(예: GPT가 primary_lane_id
  // 자리에 canonical genre id를 잘못 넣는 빈도 관찰용) — invalid면 결과의 primary_lane_id 자체가
  // 이미 null이므로, 여기서는 GPT가 원래 무엇을 잘못 반환했는지만 추가로 보존한다.
  let observedNormalized: boolean | null = null;
  let correctionRetryOccurred = false;
  let correctionRetryAlsoFailed = false;
  let laneWasInvalid = false;
  let invalidLaneIdReceived: string | null = null;
  let lastVectorIssues: string[] | null = null;
  let lastGenreIssues: string[] | null = null;

  const originalLog = console.log;
  const originalError = console.error;
  console.log = (...args: unknown[]) => {
    if (args[0] === "image_vector_validated" && args[1] && typeof args[1] === "object") {
      observedNormalized = (args[1] as { normalized?: boolean }).normalized ?? null;
    }
    originalLog(...args);
  };
  console.error = (...args: unknown[]) => {
    if (args[0] === "[gpt] invalid_primary_lane_id" && args[1] && typeof args[1] === "object") {
      laneWasInvalid = true;
      const v = (args[1] as { primaryLaneId?: unknown }).primaryLaneId;
      invalidLaneIdReceived = typeof v === "string" ? v : v === undefined ? "(missing)" : String(v);
    }
    if (args[0] === "[gpt] image_vector_or_genre_invalid_retrying" && args[1] && typeof args[1] === "object") {
      correctionRetryOccurred = true;
      const d = args[1] as { vectorIssues?: string[]; genreIssues?: string[] };
      lastVectorIssues = d.vectorIssues ?? null;
      lastGenreIssues = d.genreIssues ?? null;
    }
    if (args[0] === "[gpt] image_vector_or_genre_invalid_after_retry" && args[1] && typeof args[1] === "object") {
      correctionRetryAlsoFailed = true;
      const d = args[1] as { vectorIssues?: string[]; genreIssues?: string[] };
      lastVectorIssues = d.vectorIssues ?? null;
      lastGenreIssues = d.genreIssues ?? null;
    }
    originalError(...args);
  };

  try {
    // 실제 production analyzeImage() 호출 — SYSTEM_PROMPT, 모델, 이미지 detail 설정,
    // 파싱, 호환성 검증, 17+13 벡터 검증/정규화, 1회 교정 재시도 정책 모두 동일하게 적용된다.
    const gptResult = await analyzeImage(imageDataUrl);

    // 이미지 원본, 전체 data URL, 전체 프롬프트, 전체 GPT 응답 원문은 로그에 남기지 않는다.
    console.log("[evaluate-real-image] analysis_completed", { filename: filename ?? "(no filename provided)" });

    return Response.json(
      {
        filename,
        image_type: gptResult.image_type,
        confidence: gptResult.confidence,
        analysis: gptResult.analysis,
        music_profile: gptResult.music_profile,
        playlist_concept: gptResult.playlist_concept,
        playlist_subtitle: gptResult.playlist_subtitle,
        primary_lane_id: gptResult.primary_lane_id,
        targetStats: gptResult.targetStats,
        contextAffinity: gptResult.contextAffinity,
        normalized: observedNormalized,
        diagnostics: {
          correctionRetryOccurred,
          correctionRetryAlsoFailed: false,
          laneWasInvalid,
          invalidLaneIdReceived,
        },
      },
      { status: 200, headers: CORS_HEADERS },
    );
  } catch (err) {
    const safeMessage = err instanceof SafeError ? err.message : "Evaluation analysis failed.";

    // primary_lane_id can no longer cause this catch to fire (gpt.ts normalizes an invalid/missing
    // lane to null and continues instead of throwing — see applyCompatibilityValidation), so a
    // "json_parse_failed"-shaped SafeError here can only mean parseGptJson() itself threw on
    // malformed/truncated/non-JSON content.
    const diagnostics = {
      correctionRetryOccurred,
      correctionRetryAlsoFailed,
      vectorIssues: lastVectorIssues,
      genreIssues: lastGenreIssues,
      // Set for any SafeError thrown out of requestChatCompletion() (both the generic
      // "request failed" and "empty response" messages) — gpt.ts discards the fetch Response
      // (status code, error.type/code, x-request-id, Retry-After) before throwing, so none of
      // that is recoverable here without a production gpt.ts change.
      openAiResponseDetailUnavailable:
        safeMessage === "이미지 분석 중 오류가 발생했습니다." || safeMessage === "이미지 분석 결과를 받지 못했습니다.",
    };

    console.error("[evaluate-real-image] failed", { filename: filename ?? "(no filename provided)", errorMessage: safeMessage, diagnostics });
    return Response.json({ error: safeMessage, filename, diagnostics }, { status: 500, headers: CORS_HEADERS });
  } finally {
    console.log = originalLog;
    console.error = originalError;
  }
});
