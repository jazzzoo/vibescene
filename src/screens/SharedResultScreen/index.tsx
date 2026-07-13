import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useRef, useState } from 'react';
import { Image, Linking, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/common/Button';
import ErrorView from '../../components/common/ErrorView';
import LoadingView from '../../components/common/LoadingView';
import GradientOverlay from '../../components/result/GradientOverlay';
import PlaylistConcept from '../../components/result/PlaylistConcept';
import PlaylistSubtitle from '../../components/result/PlaylistSubtitle';
import TrackList from '../../components/result/TrackList';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import type { RootParamList } from '../../navigation/MainNavigator';
import { SafeError } from '../../services/errors';
import { getSharedPlaylist } from '../../services/playlist';
import type { SharedPlaylistResult, Track } from '../../types/playlist';

type SharedResultRouteProp = RouteProp<RootParamList, 'SharedResult'>;
type SharedResultNavigationProp = NativeStackNavigationProp<RootParamList, 'SharedResult'>;

const HERO_HEIGHT = 340;

function buildPlayOnYoutubeUrl(tracks: Track[]): string | null {
  const videoIds = [
    ...new Set(
      tracks.map((t) => t.youtubeVideoId).filter((id): id is string => Boolean(id)),
    ),
  ];
  if (videoIds.length === 0) return null;
  if (videoIds.length === 1) return `https://www.youtube.com/watch?v=${videoIds[0]}`;
  return `https://www.youtube.com/watch_videos?video_ids=${videoIds.join(',')}`;
}

export default function SharedResultScreen() {
  const navigation = useNavigation<SharedResultNavigationProp>();
  const route = useRoute<SharedResultRouteProp>();
  const { shareId } = route.params;

  const [result, setResult] = useState<SharedPlaylistResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await getSharedPlaylist(shareId);
      setResult(data);
    } catch (err) {
      setErrorMessage(
        err instanceof SafeError ? err.message : 'This shared playlist is unavailable.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [shareId]);

  // 카카오톡 인앱 WebView에서 YouTube로 갔다가 돌아왔을 때, 복원 과정에서
  // 로딩 상태가 그대로 멈춰버리는 경우에 대비한 최소한의 복구 가드.
  // 화면을 강제로 리로드하지 않고, 로딩이 멈춰 있을 때만 재조회한다.
  const loadingRef = useRef(loading);
  loadingRef.current = loading;

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    function handleVisible(source: string) {
      if (document.visibilityState !== 'visible') return;
      console.log('[SharedResultScreen] resumed visibility', { source, stuckLoading: loadingRef.current });
      if (loadingRef.current) {
        void load();
      }
    }

    function onVisibilityChange() {
      handleVisible('visibilitychange');
    }
    function onPageShow() {
      handleVisible('pageshow');
    }

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pageshow', onPageShow);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pageshow', onPageShow);
    };
  }, [shareId]);

  if (loading) {
    return <LoadingView message="Loading playlist..." />;
  }

  if (errorMessage || !result) {
    return (
      <ErrorView
        title="Playlist unavailable"
        message={errorMessage ?? 'This shared playlist is unavailable.'}
        onRetry={load}
      />
    );
  }

  const playOnYoutubeUrl = buildPlayOnYoutubeUrl(result.tracks);

  function handlePlayOnYoutube() {
    if (!playOnYoutubeUrl) return;

    // 웹에서는 window.open으로 새 탭/창을 열어 카카오톡 인앱 WebView의
    // 현재 문서가 YouTube로 교체되지 않도록 한다. 팝업이 차단되면 Linking으로 폴백.
    if (Platform.OS === 'web') {
      const newWindow = window.open(playOnYoutubeUrl, '_blank', 'noopener,noreferrer');
      if (!newWindow) {
        Linking.openURL(playOnYoutubeUrl).catch(() => {});
      }
      return;
    }

    Linking.openURL(playOnYoutubeUrl).catch(() => {});
  }

  function handleTryYourPhoto() {
    navigation.navigate('Home');
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 히어로 영역 — owner ResultScreen과 동일한 레이아웃 */}
        <View style={styles.hero}>
          {result.imageUrl ? (
            <Image
              source={{ uri: result.imageUrl }}
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

        {/* 트랙 목록 — playlistId 미전달 (수신자 화면) */}
        <TrackList tracks={result.tracks} />

        {/* 액션 영역 */}
        <View style={styles.actions}>
          {playOnYoutubeUrl && (
            <Button
              title="Play on YouTube"
              onPress={handlePlayOnYoutube}
              variant="primary"
              fullWidth
              accessibilityLabel="Play full playlist on YouTube"
            />
          )}
          <View style={styles.ctaWrapper}>
            <Button
              title="Try your photo"
              onPress={handleTryYourPhoto}
              variant="secondary"
              fullWidth
              accessibilityLabel="Make your own playlist from your photo"
            />
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
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
  actions: {
    paddingHorizontal: SPACING.CARD_PADDING,
    paddingTop: SPACING.SECTION_GAP,
  },
  ctaWrapper: {
    marginTop: SPACING.BASE,
  },
  bottomPadding: {
    height: SPACING.SECTION_GAP * 1.5,
  },
});
