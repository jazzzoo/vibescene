import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ActionButtons from '../../components/result/ActionButtons';
import ShareCardModal from '../../components/share/ShareCardModal';
import GradientOverlay from '../../components/result/GradientOverlay';
import MoodTags from '../../components/result/MoodTags';
import PlaylistConcept from '../../components/result/PlaylistConcept';
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

// 첫 화면에서 트랙이 4~5개 보이도록 hero 높이를 모바일 프레임(maxWidth 430) 기준으로 축소
const HERO_HEIGHT = 220;

export default function ResultScreen() {
  const navigation = useNavigation<ResultScreenNavigationProp>();
  const route = useRoute<ResultScreenRouteProp>();
  const { playlistId } = route.params;

  const [result, setResult] = useState<PlaylistResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionHint, setActionHint] = useState<string | null>(null);
  const [youtubeLoading, setYoutubeLoading] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);

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

  return (
    <>
    <ShareCardModal
      visible={shareModalVisible}
      onClose={() => setShareModalVisible(false)}
      result={result}
    />
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 히어로 영역: 이미지 + 오버레이 + 컨셉 + 무드 태그 */}
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
            {result.analysis.moodKeywords && result.analysis.moodKeywords.length > 0 && (
              <MoodTags tags={result.analysis.moodKeywords} />
            )}
            <PlaylistConcept text={result.playlistConcept} />
          </View>
        </View>

        {/* 트랙 목록 */}
        <TrackList tracks={result.tracks} />

        {/* 액션 버튼 */}
        <ActionButtons
          onSaveToYouTube={handleSaveToYouTube}
          youtubeLoading={youtubeLoading}
          onShare={() => setShareModalVisible(true)}
        />

        {actionHint !== null && (
          <Text style={styles.actionHint} accessibilityLiveRegion="polite">
            {actionHint}
          </Text>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      <BottomNavigation />
    </SafeAreaView>
    </>
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
  actionHint: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 13,
    textAlign: 'center',
    marginTop: SPACING.TRACK_GAP,
    paddingHorizontal: SPACING.CARD_PADDING,
  },
  bottomPadding: {
    // 마지막 액션 버튼과 BottomNavigation 사이 여백을 넉넉하게 확보
    height: SPACING.SECTION_GAP * 1.5,
  },
});
