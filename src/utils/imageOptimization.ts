import { Image } from 'react-native';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

export type OptimizedImage = {
  uri: string;
  mimeType: 'image/jpeg';
};

const MAIN_MAX_DIMENSION = 1600;
const MAIN_JPEG_QUALITY = 0.85;
const THUMBNAIL_MAX_DIMENSION = 480;
const THUMBNAIL_JPEG_QUALITY = 0.75;

function getImageSize(uri: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    Image.getSize(uri, (width, height) => resolve({ width, height }), reject);
  });
}

// 긴 쪽이 maxDimension을 넘을 때만 축소하고(업스케일 금지), 항상 JPEG로 재인코딩한다.
async function resizeAndCompress(
  uri: string,
  maxDimension: number,
  quality: number,
): Promise<OptimizedImage> {
  const { width, height } = await getImageSize(uri);

  let context = ImageManipulator.manipulate(uri);
  if (Math.max(width, height) > maxDimension) {
    context = width >= height
      ? context.resize({ width: maxDimension })
      : context.resize({ height: maxDimension });
  }

  const rendered = await context.renderAsync();
  const saved = await rendered.saveAsync({ compress: quality, format: SaveFormat.JPEG });

  return { uri: saved.uri, mimeType: 'image/jpeg' };
}

/**
 * GPT 분석 / ResultScreen / Share card에 쓰이는 main 이미지를 만든다.
 * 실패 시 null — 호출부는 원본 이미지 업로드로 fallback해야 한다.
 */
export async function createMainImage(uri: string): Promise<OptimizedImage | null> {
  try {
    return await resizeAndCompress(uri, MAIN_MAX_DIMENSION, MAIN_JPEG_QUALITY);
  } catch {
    return null;
  }
}

/**
 * HistoryScreen grid thumbnail용 이미지를 만든다.
 * 실패 시 null — 호출부는 thumbnail 업로드를 생략해야 한다.
 */
export async function createThumbnailImage(uri: string): Promise<OptimizedImage | null> {
  try {
    return await resizeAndCompress(uri, THUMBNAIL_MAX_DIMENSION, THUMBNAIL_JPEG_QUALITY);
  } catch {
    return null;
  }
}
