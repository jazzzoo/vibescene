import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useRef, useState } from 'react';
import {
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ActionButtons from '../../components/result/ActionButtons';
import FeedbackModal from '../../components/result/FeedbackModal';
import GradientOverlay from '../../components/result/GradientOverlay';
import PlaylistConcept from '../../components/result/PlaylistConcept';
import PlaylistSubtitle from '../../components/result/PlaylistSubtitle';
import StickyActions from '../../components/result/StickyActions';
import TrackList from '../../components/result/TrackList';
import BottomNavigation from '../../components/common/BottomNavigation';
import ErrorView from '../../components/common/ErrorView';
import LoadingView from '../../components/common/LoadingView';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import { RootParamList } from '../../navigation/MainNavigator';
import { isAnonymousUser } from '../../services/auth';
import { SafeError } from '../../services/errors';
import { createYouTubePlaylist, getPlaylistResult } from '../../services/playlist';
import type { PlaylistResult } from '../../types/playlist';

type ResultScreenNavigationProp = NativeStackNavigationProp<RootParamList, 'Result'>;
type ResultScreenRouteProp = RouteProp<RootParamList, 'Result'>;

const HERO_HEIGHT = 340;
const MOBILE_WIDTH_THRESHOLD = 640;
const BOTTOM_DETECTION_THRESHOLD = 50;
const FEEDBACK_DELAY_MS = 2000;

// StickyActions가 onLayout을 보고하기 전까지 사용하는 초기 추정 높이
const STICKY_HEIGHT_INITIAL = 160;

export default function ResultScreen() {
  const navigation = useNavigation<ResultScreenNavigationProp>();
  const route = useRoute<ResultScreenRouteProp>();
  const { playlistId } = route.params;

  const { width } = useWindowDimensions();
  const isMobile = width < MOBILE_WIDTH_THRESHOLD;

  const [result, setResult] = useState<PlaylistResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionHint, setActionHint] = useState<string | null>(null);
  const [youtubeLoading, setYoutubeLoading] = useState(false);

  // sticky 가시성 — 인페이지 ActionButtons가 뷰포트 하단에 닿으면 false
  const [stickyVisible, setStickyVisible] = useState(true);
  // StickyActions 실측 높이 — ScrollView contentPadding 계산에 사용
  const [stickyHeight, setStickyHeight] = useState(STICKY_HEIGHT_INITIAL);
  // 스크롤 컨텐츠 내 인페이지 ActionButtons의 Y 좌표
  const inPageActionsY = useRef(0);

  // 피드백
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const feedbackDoneRef = useRef(false);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    feedbackDoneRef.current = false;
    setFeedbackVisible(false);
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
  }, [playlistId]);

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  async function load() {
    setLoading(true);
    setErrorMessage(null);
    setActionHint(null);
    try {
      const data = await getPlaylistResult(playlistId);
      setResult(data);
    } catch (err) {
      const message =
        err instanceof SafeError
          ? err.message
          : "We couldn't load your results. Please try again.";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveToYouTube() {
    const anonymous = await isAnonymousUser();
    if (anonymous) {
      navigation.navigate('Login');
      return;
    }

    if (youtubeLoading) return;
    setYoutubeLoading(true);
    setActionHint(null);

    try {
      const ytResult = await createYouTubePlaylist(playlistId);
      setResult((prev) =>
        prev
          ? {
              ...prev,
              youtubePlaylistId: ytResult.youtubePlaylistId,
              youtubePlaylistUrl: ytResult.youtubePlaylistUrl,
            }
          : prev,
      );
      setActionHint('Your YouTube playlist is ready!');
    } catch (err) {
      const message =
        err instanceof SafeError
          ? err.message
          : "We couldn't create your YouTube playlist. Please try again.";
      setActionHint(message);
    } finally {
      setYoutubeLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [playlistId]);

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const scrollY = contentOffset.y;
    const viewportH = layoutMeasurement.height;
    const totalH = contentSize.height;

    // sticky 가시성: 인페이지 ActionButtons 상단이 뷰포트 하단에 닿는 순간 sticky 숨김
    if (isMobile) {
      const inPageReached = scrollY + viewportH >= inPageActionsY.current;
      setStickyVisible(!inPageReached);
    }

    // 피드백 타이머: 하단에서 50px 이내에 머무르면 2초 후 피드백 표시
    const atBottom = scrollY + viewportH >= totalH - BOTTOM_DETECTION_THRESHOLD;
    if (atBottom && !feedbackDoneRef.current) {
      if (!feedbackTimerRef.current) {
        feedbackTimerRef.current = setTimeout(() => {
          feedbackTimerRef.current = null;
          setFeedbackVisible(true);
        }, FEEDBACK_DELAY_MS);
      }
    } else if (!atBottom && feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
  }

  function handleFeedbackDone() {
    feedbackDoneRef.current = true;
    setFeedbackVisible(false);
  }

  if (loading) {
    return <LoadingView message="Loading your results..." />;
  }

  if (errorMessage || !result) {
    return (
      <ErrorView
        title="Something went wrong"
        message={errorMessage ?? "We couldn't load your results."}
        onRetry={load}
      />
    );
  }

  // sticky 오버레이가 ScrollView 컨텐츠 하단을 가리는 만큼 paddingBottom으로 보상.
  // sticky가 숨겨지면 padding도 제거되어 인페이지 액션 바로 아래 BottomNavigation이 붙는다.
  const scrollPaddingBottom = isMobile && stickyVisible ? stickyHeight : 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* position:relative 컨테이너 — StickyActions 절대 위치의 containing block */}
      <View style={styles.scrollContainer}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            scrollPaddingBottom > 0 && { paddingBottom: scrollPaddingBottom },
          ]}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {/* 히어로 영역 */}
          <View style={styles.hero}>
            {result.imageUri ? (
              <Image
                source={{ uri: result.imageUri }}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
                accessibilityLabel="Photo used to create this playlist"
              />
            ) : (
              <View style={[StyleSheet.absoluteFill, styles.heroFallback]} />
            )}
            <GradientOverlay />
            <View style={styles.heroContent}>
              <PlaylistConcept text={result.playlistConcept} />
              <PlaylistSubtitle text={result.analysis.playlistSubtitle} />
            </View>
          </View>

          {/* 트랙 목록 */}
          <TrackList tracks={result.tracks} playlistId={playlistId} />

          {/* 인페이지 액션 버튼 — sticky가 숨겨질 때 자연스럽게 이어받는 위치 */}
          <View
            onLayout={(e) => {
              inPageActionsY.current = e.nativeEvent.layout.y;
            }}
          >
            <ActionButtons
              tracks={result.tracks}
              playlistId={playlistId}
              onSaveToYouTube={handleSaveToYouTube}
              youtubeLoading={youtubeLoading}
            />

            {actionHint !== null && (
              <Text style={styles.actionHint} accessibilityLiveRegion="polite">
                {actionHint}
              </Text>
            )}
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>

        {/* Sticky 오버레이 — 모바일 전용, position:absolute bottom:0
            레이아웃 공간을 차지하지 않으므로 숨겨도 빈 블록이 생기지 않음.
            인페이지가 뷰포트에 들어오면 opacity:0 + pointerEvents:none으로 전환 */}
        {isMobile && (
          <View
            style={[styles.stickyOverlay, { opacity: stickyVisible ? 1 : 0 }]}
            pointerEvents={stickyVisible ? 'auto' : 'none'}
            onLayout={(e) => setStickyHeight(e.nativeEvent.layout.height)}
          >
            <StickyActions tracks={result.tracks} playlistId={playlistId} />
          </View>
        )}
      </View>

      <BottomNavigation />

      <FeedbackModal
        visible={feedbackVisible}
        playlistId={playlistId}
        onDismiss={handleFeedbackDone}
        onSubmitted={handleFeedbackDone}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  scrollContainer: {
    flex: 1,
    position: 'relative',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  hero: {
    height: HERO_HEIGHT,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  heroFallback: {
    backgroundColor: COLORS.CARD_BACKGROUND,
  },
  heroContent: {
    padding: SPACING.CARD_PADDING,
  },
  actionHint: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 13,
    textAlign: 'center',
    marginTop: SPACING.TRACK_GAP,
    paddingHorizontal: SPACING.CARD_PADDING,
  },
  bottomPadding: {
    height: SPACING.SECTION_GAP * 1.5,
  },
  // StickyActions가 ScrollView 위에 떠 있는 오버레이 — 레이아웃 공간 0
  stickyOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});
