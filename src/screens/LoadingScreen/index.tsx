import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useRef, useState } from 'react';
import ErrorView from '../../components/common/ErrorView';
import LoadingView from '../../components/common/LoadingView';
import { RootParamList } from '../../navigation/MainNavigator';
import { SafeError } from '../../services/errors';
import { analyzeAndSearchPlaylist } from '../../services/playlist';
import { uploadUserImage } from '../../services/storage';

type LoadingScreenNavigationProp = NativeStackNavigationProp<RootParamList, 'Loading'>;
type LoadingScreenRouteProp = RouteProp<RootParamList, 'Loading'>;

type Step = 'uploading' | 'analyzing' | 'finalizing';

const STEP_MESSAGES: Record<Step, string> = {
  uploading: '분위기 감상 중...',
  analyzing: '어울리는 음악 찾는 중...',
  finalizing: '앨범 순서 고민 중...',
};

export default function LoadingScreen() {
  const navigation = useNavigation<LoadingScreenNavigationProp>();
  const route = useRoute<LoadingScreenRouteProp>();
  const { localImageUri } = route.params;

  const [step, setStep] = useState<Step>('uploading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 컴포넌트가 언마운트된 후 비동기 작업이 완료돼도 setState/navigate를 호출하지 않기 위한 ref
  const isMounted = useRef(true);
  // React Strict Mode 이중 실행 방지 및 초기 1회 실행 보장
  const hasStarted = useRef(false);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const runGeneration = useCallback(async () => {
    if (!isMounted.current) return;
    setStep('uploading');
    setErrorMessage(null);

    try {
      // 1단계: Storage 업로드
      const storagePath = await uploadUserImage(localImageUri);

      if (!isMounted.current) return;

      // 2단계: Edge Function 1 호출 (이미지 분석 + YouTube 검색)
      setStep('analyzing');
      const { playlistId } = await analyzeAndSearchPlaylist(storagePath);

      if (!isMounted.current) return;

      // 3단계: 완료 직전 UX 피드백
      setStep('finalizing');

      // replace: LoadingScreen을 스택에서 제거하고 ResultScreen으로 이동
      navigation.replace('Result', { playlistId });
    } catch (err) {
      if (!isMounted.current) return;
      const message =
        err instanceof SafeError
          ? err.message
          : '플레이리스트 생성 중 오류가 발생했습니다. 다시 시도해 주세요.';
      setErrorMessage(message);
    }
  }, [localImageUri, navigation]);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    runGeneration();
  }, [runGeneration]);

  if (errorMessage !== null) {
    return (
      <ErrorView
        title="생성 실패"
        message={errorMessage}
        onRetry={runGeneration}
      />
    );
  }

  return <LoadingView message={STEP_MESSAGES[step]} />;
}
