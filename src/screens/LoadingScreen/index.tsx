import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ErrorView from '../../components/common/ErrorView';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import {
  LANE_SPOTLIGHTS,
  PROCESSING_MESSAGE_POOL,
  PROCESSING_MESSAGE_SEQUENCE,
  SHAPING_PHASE_START_INDEX,
  shuffle,
  shuffleAvoidingRepeatStart,
  type LaneSpotlightEntry,
} from '../../data/loadingContent';
import { RootParamList } from '../../navigation/MainNavigator';
import { logEvent } from '../../services/analytics';
import { SafeError } from '../../services/errors';
import { analyzeAndSearchPlaylist } from '../../services/playlist';
import { uploadUserImage } from '../../services/storage';

type LoadingScreenNavigationProp = NativeStackNavigationProp<RootParamList, 'Loading'>;
type LoadingScreenRouteProp = RouteProp<RootParamList, 'Loading'>;

// 실제 백엔드 파이프라인 단계 — 에러 처리 / 재시도 / 네비게이션 로직에만 쓰이는 "진짜" 상태.
// 화면에 이 값 자체를 문구로 노출하지 않는다. 대신 finalizing으로 넘어갔다는 사실만
// 아래 시간 기반 내러티브(processingMessage)를 마무리 구간으로 자연스럽게 당기는 신호로 쓴다.
type Step = 'uploading' | 'analyzing' | 'finalizing';

const PROCESSING_INTERVAL_MIN_MS = 2800;
const PROCESSING_INTERVAL_MAX_MS = 3500;
const LANE_SPOTLIGHT_INTERVAL_MS = 4500;
const CROSSFADE_DURATION_MS = 280;

function randomProcessingDelay(): number {
  return PROCESSING_INTERVAL_MIN_MS + Math.random() * (PROCESSING_INTERVAL_MAX_MS - PROCESSING_INTERVAL_MIN_MS);
}

// opacity를 0으로 낮춘 뒤 내용을 바꾸고 다시 1로 올리는 단순 크로스페이드.
// 언마운트 이후 호출 방지는 호출부의 isMounted 체크가 담당한다.
function crossfade(animatedValue: Animated.Value, applyChange: () => void): void {
  Animated.timing(animatedValue, {
    toValue: 0,
    duration: CROSSFADE_DURATION_MS,
    useNativeDriver: true,
  }).start(() => {
    applyChange();
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: CROSSFADE_DURATION_MS,
      useNativeDriver: true,
    }).start();
  });
}

export default function LoadingScreen() {
  const navigation = useNavigation<LoadingScreenNavigationProp>();
  const route = useRoute<LoadingScreenRouteProp>();
  const { localImageUri } = route.params;

  const [step, setStep] = useState<Step>('uploading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 컴포넌트가 언마운트된 후 비동기 작업/타이머가 완료돼도 setState/navigate를 호출하지 않기 위한 ref
  const isMounted = useRef(true);
  // React Strict Mode 이중 실행 방지 및 초기 1회 실행 보장
  const hasStarted = useRef(false);

  // ── Processing narrative — 시간 기반 진행 서사, 실제 백엔드 진행률이 아니다 ──────────
  const [processingMessage, setProcessingMessage] = useState<string>(PROCESSING_MESSAGE_SEQUENCE[0]);
  const processingOpacity = useRef(new Animated.Value(1)).current;
  // 최초 사이클은 정해진 순서(읽기 → 비교 → 정리)를 그대로 따라간다.
  const processingQueueRef = useRef<string[]>([...PROCESSING_MESSAGE_SEQUENCE]);
  const processingIndexRef = useRef(0);
  // 최초 순서가 아직 유지되고 있는지 — finalizing 신호로 인덱스를 강제 점프시켜도 되는 조건 판단용.
  const isCuratedSequenceRef = useRef(true);
  const hasNudgedToShapingRef = useRef(false);

  // ── Lane spotlight — 세션당 1회 셔플, 사이클이 끝나면 재셔플 ─────────────────────────
  const initialLaneOrder = useMemo(() => shuffle(LANE_SPOTLIGHTS), []);
  const [laneSpotlight, setLaneSpotlight] = useState<LaneSpotlightEntry>(initialLaneOrder[0]);
  const laneOpacity = useRef(new Animated.Value(1)).current;
  const laneQueueRef = useRef<LaneSpotlightEntry[]>(initialLaneOrder);
  const laneIndexRef = useRef(0);

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
      void logEvent('image_uploaded');

      if (!isMounted.current) return;

      // 2단계: Edge Function 1 호출 (이미지 분석 + YouTube 검색)
      setStep('analyzing');
      const { playlistId } = await analyzeAndSearchPlaylist(storagePath);
      void logEvent('analysis_completed', { playlist_id: playlistId });

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
          : "We couldn't create your playlist. Please try again.";
      setErrorMessage(message);
    }
  }, [localImageUri, navigation]);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    runGeneration();
  }, [runGeneration]);

  // 처리 문구 회전 — 2.8~3.5초 간격의 재귀 setTimeout. 큐가 끝나면 전체 풀을 셔플해 재사용한다.
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    function advance() {
      processingIndexRef.current += 1;

      if (processingIndexRef.current >= processingQueueRef.current.length) {
        const previousLast = processingQueueRef.current[processingQueueRef.current.length - 1] ?? null;
        processingQueueRef.current = shuffleAvoidingRepeatStart(PROCESSING_MESSAGE_POOL, previousLast);
        processingIndexRef.current = 0;
        isCuratedSequenceRef.current = false;
      }

      const next = processingQueueRef.current[processingIndexRef.current];
      crossfade(processingOpacity, () => {
        if (isMounted.current) setProcessingMessage(next);
      });
    }

    function schedule() {
      timer = setTimeout(() => {
        if (cancelled) return;
        advance();
        schedule();
      }, randomProcessingDelay());
    }

    schedule();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 레인 스포트라이트 회전 — 고정 4.5초 간격. 사이클이 끝나면 재셔플(직전 항목과 연속 반복 방지).
  useEffect(() => {
    const timer = setInterval(() => {
      laneIndexRef.current += 1;

      if (laneIndexRef.current >= laneQueueRef.current.length) {
        const previousLast = laneQueueRef.current[laneQueueRef.current.length - 1] ?? null;
        laneQueueRef.current = shuffleAvoidingRepeatStart(LANE_SPOTLIGHTS, previousLast);
        laneIndexRef.current = 0;
      }

      const next = laneQueueRef.current[laneIndexRef.current];
      crossfade(laneOpacity, () => {
        if (isMounted.current) setLaneSpotlight(next);
      });
    }, LANE_SPOTLIGHT_INTERVAL_MS);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 실제 상태(step) 기반 신호 — finalizing에 들어섰다는 사실을 알고 있을 때만,
  // 아직 최초 순서(읽기→비교→정리) 안에 있고 정리 구간 전이라면 그쪽으로 한 번 당겨온다.
  // 이미 셔플된 재사용 풀로 넘어간 뒤라면(오래 걸린 경우) 손대지 않는다 — 그 풀에도 정리 문구가 고르게 섞여 있다.
  useEffect(() => {
    if (step !== 'finalizing' || hasNudgedToShapingRef.current) return;
    hasNudgedToShapingRef.current = true;

    if (isCuratedSequenceRef.current && processingIndexRef.current < SHAPING_PHASE_START_INDEX) {
      processingIndexRef.current = SHAPING_PHASE_START_INDEX;
      const next = processingQueueRef.current[SHAPING_PHASE_START_INDEX];
      if (next) {
        crossfade(processingOpacity, () => {
          if (isMounted.current) setProcessingMessage(next);
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  if (errorMessage !== null) {
    return (
      <ErrorView
        title="Something went wrong"
        message={errorMessage}
        onRetry={runGeneration}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container} accessibilityLiveRegion="polite">
        <Text style={styles.heading}>Creating your soundtrack</Text>

        <View style={styles.messageArea}>
          <Animated.Text
            style={[styles.processingMessage, { opacity: processingOpacity }]}
            numberOfLines={2}
          >
            {processingMessage}
          </Animated.Text>
        </View>

        <ActivityIndicator size="large" color={COLORS.ACCENT} style={styles.indicator} />

        <View style={styles.spotlightCard}>
          <Text style={styles.spotlightLabel}>LANE SPOTLIGHT</Text>
          <Animated.View style={{ opacity: laneOpacity }}>
            <Text style={styles.spotlightName} numberOfLines={1} ellipsizeMode="tail">
              {laneSpotlight.displayName}
            </Text>
            <Text style={styles.spotlightDescription} numberOfLines={2}>
              {laneSpotlight.description}
            </Text>
          </Animated.View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.CARD_PADDING,
  },
  heading: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: SPACING.TRACK_GAP,
  },
  // 문구가 1줄↔2줄로 바뀌어도 주변 요소가 튀지 않도록 최소 높이를 확보한다.
  messageArea: {
    minHeight: 44,
    justifyContent: 'center',
    marginBottom: SPACING.TRACK_GAP,
  },
  processingMessage: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
  },
  indicator: {
    marginBottom: SPACING.SECTION_GAP,
  },
  spotlightCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderRadius: 16,
    paddingVertical: SPACING.TRACK_GAP,
    paddingHorizontal: SPACING.CARD_PADDING,
    // 메인 로딩 상태보다 시각적으로 한 단계 낮은 "작은 발견" 톤을 위한 최소 높이 고정.
    minHeight: 96,
  },
  spotlightLabel: {
    color: COLORS.MOOD_TAG,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: SPACING.BASE,
  },
  spotlightName: {
    color: COLORS.ACCENT,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: SPACING.BASE * 0.5,
  },
  spotlightDescription: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 13,
    lineHeight: 18,
  },
});
