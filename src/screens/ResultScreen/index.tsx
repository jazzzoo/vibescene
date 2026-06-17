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

const HERO_HEIGHT = 380;

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
          : '결과를 불러오는 데 실패했습니다. 다시 시도해 주세요.';
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
      setActionHint('YouTube 플레이리스트가 생성되었습니다!');
    } catch (err) {
      const message =
        err instanceof SafeError
          ? err.message
          : 'YouTube 플레이리스트 생성에 실패했습니다. 다시 시도해 주세요.';
      setActionHint(message);
    } finally {
      setYoutubeLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [playlistId]);

  if (loading) {
    return <LoadingView message="결과 불러오는 중..." />;
  }

  if (errorMessage || !result) {
    return (
      <ErrorView
        title="불러오기 실패"
        message={errorMessage ?? '결과를 불러오는 데 실패했습니다.'}
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
              accessibilityLabel="플레이리스트 생성에 사용된 사진"
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.heroFallback]} />
          )}
          <GradientOverlay />
          <View style={styles.heroContent}>
            <PlaylistConcept text={result.playlistConcept} />
            {result.analysis.moodKeywords && result.analysis.moodKeywords.length > 0 && (
              <MoodTags tags={result.analysis.moodKeywords} />
            )}
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
    height: SPACING.SECTION_GAP,
  },
});
