import type { ImagePickerAsset } from 'expo-image-picker';
import { useCallback, useState } from 'react';
import { generatePlaylist } from '../services/playlist';
import { uploadImageToStorage } from '../services/storage';

export type GenerationStep = 'idle' | 'uploading' | 'analyzing' | 'searching' | 'done' | 'failed';

type State = {
  step: GenerationStep;
  playlistId: string | null;
  error: string | null;
};

const INITIAL_STATE: State = { step: 'idle', playlistId: null, error: null };

export default function usePlaylistGeneration() {
  const [state, setState] = useState<State>(INITIAL_STATE);

  const generate = useCallback(async (imageAsset: ImagePickerAsset): Promise<string> => {
    setState({ step: 'uploading', playlistId: null, error: null });

    try {
      // 1. 이미지를 Supabase Storage에 업로드 (base64 전송 금지)
      const { storagePath } = await uploadImageToStorage(imageAsset);

      // 2. Edge Function 호출 — path만 전달, user_id 미포함
      setState((prev) => ({ ...prev, step: 'analyzing' }));
      const playlistId = await generatePlaylist(storagePath);

      // 3. Edge Function이 'searching' 상태까지 처리 완료
      setState({ step: 'done', playlistId, error: null });
      return playlistId;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : '플레이리스트 생성 중 오류가 발생했습니다.';
      setState({ step: 'failed', playlistId: null, error: message });
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  return {
    step: state.step,
    playlistId: state.playlistId,
    error: state.error,
    isLoading: state.step !== 'idle' && state.step !== 'done' && state.step !== 'failed',
    generate,
    reset,
  };
}
