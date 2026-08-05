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

  // gpt.ts의 analyzeImage()가 내부적으로 남기는 "image_vector_validated" 진단 로그를
  // 잠시 가로채 normalized 여부만 관찰한다 — gpt.ts 자체는 전혀 수정하지 않는다.
  let observedNormalized: boolean | null = null;
  const originalLog = console.log;
  console.log = (...args: unknown[]) => {
    if (args[0] === "image_vector_validated" && args[1] && typeof args[1] === "object") {
      observedNormalized = (args[1] as { normalized?: boolean }).normalized ?? null;
    }
    originalLog(...args);
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
      },
      { status: 200, headers: CORS_HEADERS },
    );
  } catch (err) {
    const safeMessage = err instanceof SafeError ? err.message : "Evaluation analysis failed.";
    console.error("[evaluate-real-image] failed", { filename: filename ?? "(no filename provided)", errorMessage: safeMessage });
    return Response.json({ error: safeMessage, filename }, { status: 500, headers: CORS_HEADERS });
  } finally {
    console.log = originalLog;
  }
});
