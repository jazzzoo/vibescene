import type { ImagePickerAsset } from 'expo-image-picker';
import { supabase } from '../lib/supabaseClient';
import { SafeError } from './errors';
import { createMainImage, createThumbnailImage } from '../utils/imageOptimization';

const IMAGE_BUCKET = 'user-images';
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
];

export type UploadedImage = {
  storagePath: string;
  localUri: string;
};

export async function uploadImageToStorage(
  imageAsset: ImagePickerAsset,
): Promise<UploadedImage> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Please sign in.');

  // 파일 크기 검증
  if (imageAsset.fileSize && imageAsset.fileSize > MAX_FILE_SIZE_BYTES) {
    throw new Error('File size must be 10MB or less.');
  }

  // MIME Type 검증
  const mimeType = (imageAsset.mimeType ?? 'image/jpeg').toLowerCase();
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new Error('Unsupported image format. (JPEG, PNG, or WebP only)');
  }

  // Storage 경로: {user_id}/{timestamp}-{random}.{ext}
  const ext = mimeTypeToExtension(mimeType);
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const storagePath = `${user.id}/${fileName}`;

  // 로컬 URI → Blob 변환 후 업로드
  const fetchResponse = await fetch(imageAsset.uri);
  if (!fetchResponse.ok) throw new Error("We couldn't read your image.");
  const blob = await fetchResponse.blob();

  const { error } = await supabase.storage
    .from(IMAGE_BUCKET)
    .upload(storagePath, blob, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) throw new Error("We couldn't upload your image.");

  return { storagePath, localUri: imageAsset.uri };
}

/**
 * main image storage path에서 thumbnail storage path를 deterministic하게 만든다.
 * 예: userId/123-abc.jpg → userId/123-abc_thumb.jpg
 * DB 컬럼 없이도 main path만으로 thumbnail 위치를 항상 다시 계산할 수 있다.
 */
export function getThumbnailStoragePath(mainPath: string): string {
  const lastDotIndex = mainPath.lastIndexOf('.');
  if (lastDotIndex === -1) return `${mainPath}_thumb`;
  return `${mainPath.slice(0, lastDotIndex)}_thumb${mainPath.slice(lastDotIndex)}`;
}

async function uriToBlob(uri: string): Promise<Blob | null> {
  const response = await fetch(uri).catch(() => null);
  if (!response || !response.ok) return null;
  return response.blob().catch(() => null);
}

/**
 * local URI → Supabase Storage `user-images` 업로드.
 * user_id는 JWT 세션에서 추출하며, 클라이언트 입력을 신뢰하지 않는다.
 * 업로드 전 main(<=1600px, q0.85)과 thumbnail(<=480px, q0.75) 버전을 만들어 각각 저장한다.
 * - main 최적화 실패 시 원본 이미지를 그대로 업로드한다 (앱이 죽지 않도록 fallback).
 * - thumbnail 생성/업로드 실패는 main 업로드에 영향을 주지 않고 조용히 건너뛴다
 *   (HistoryScreen은 thumbnail이 없으면 main image로 fallback한다).
 * 반환값: main image storage path (Edge Function에 전달용, 기존 계약 유지)
 */
export async function uploadUserImage(localUri: string): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new SafeError('Please sign in.');

  const mainImage = await createMainImage(localUri);
  const mainUri = mainImage?.uri ?? localUri;

  const mainBlob = await uriToBlob(mainUri);
  if (!mainBlob) {
    throw new SafeError("We couldn't read your image. Please try again.");
  }

  if (mainBlob.size > MAX_FILE_SIZE_BYTES) {
    throw new SafeError('File size must be 10MB or less.');
  }

  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  const storagePath = `${session.user.id}/${fileName}`;

  const { error } = await supabase.storage
    .from(IMAGE_BUCKET)
    .upload(storagePath, mainBlob, {
      contentType: 'image/jpeg',
      upsert: false,
    });

  if (error) throw new SafeError("We couldn't upload your image. Please try again.");

  // thumbnail은 best-effort: main 업로드 결과(storagePath)와 무관하게 실패해도 무시한다.
  const thumbnailImage = await createThumbnailImage(mainUri);
  if (thumbnailImage) {
    const thumbnailBlob = await uriToBlob(thumbnailImage.uri);
    if (thumbnailBlob) {
      await supabase.storage
        .from(IMAGE_BUCKET)
        .upload(getThumbnailStoragePath(storagePath), thumbnailBlob, {
          contentType: 'image/jpeg',
          upsert: false,
        })
        .catch(() => null);
    }
  }

  return storagePath;
}

const SIGNED_URL_TTL_SECONDS = 3600; // 1시간

/**
 * private bucket의 이미지 경로로 Signed URL을 발급한다.
 * 만료 시간: 1시간. 실패 시 null 반환 (이미지가 없어도 나머지 UI는 표시 가능).
 */
export async function createSignedImageUrl(path: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(IMAGE_BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

function mimeTypeToExtension(mimeType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/heic': 'heic',
    'image/heif': 'heif',
  };
  return map[mimeType] ?? 'jpg';
}
