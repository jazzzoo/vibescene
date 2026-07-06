import { Linking, StyleSheet, View } from 'react-native';
import { SPACING } from '../../constants/spacing';
import { logEvent } from '../../services/analytics';
import Button from '../common/Button';
import type { Track } from '../../types/playlist';

interface ActionButtonsProps {
  tracks: Track[];
  playlistId?: string;
  onSaveToYouTube: () => void;
  youtubeLoading?: boolean;
  onShare: () => void;
}

// MVP 단계에서는 Google OAuth / YouTube 계정 저장 흐름을 숨긴다.
// 다시 켤 때는 이 상수만 true로 바꾸면 된다 — onSaveToYouTube 등 호출부 로직은 그대로 보존되어 있다.
const SAVE_TO_YOUTUBE_ENABLED = false;

// 로그인 없이도 YouTube에서 여러 곡이 이어지는 임시 재생 목록을 열기 위한 URL을 만든다.
function buildPlayOnYoutubeUrl(tracks: Track[]): string | null {
  const videoIds = [...new Set(tracks.map((track) => track.youtubeVideoId).filter((id): id is string => Boolean(id)))];

  if (videoIds.length === 0) return null;
  if (videoIds.length === 1) return `https://www.youtube.com/watch?v=${videoIds[0]}`;
  return `https://www.youtube.com/watch_videos?video_ids=${videoIds.join(',')}`;
}

export default function ActionButtons({ tracks, playlistId, onSaveToYouTube, youtubeLoading, onShare }: ActionButtonsProps) {
  const playOnYoutubeUrl = buildPlayOnYoutubeUrl(tracks);

  function handlePlayOnYoutube() {
    if (!playOnYoutubeUrl) return;
    void logEvent('playlist_link_opened', {
      playlist_id: playlistId,
      track_count: tracks.length,
    });
    Linking.openURL(playOnYoutubeUrl).catch(() => {});
  }

  return (
    <View style={styles.container}>
      {playOnYoutubeUrl && (
        <>
          <Button
            title="Play on YouTube"
            onPress={handlePlayOnYoutube}
            variant="primary"
            fullWidth
            accessibilityLabel="Play full playlist on YouTube"
          />
          <View style={styles.gap} />
        </>
      )}

      {SAVE_TO_YOUTUBE_ENABLED && (
        <>
          <Button
            title="Save to YouTube"
            onPress={onSaveToYouTube}
            variant="secondary"
            fullWidth
            loading={youtubeLoading}
            accessibilityLabel="Save as YouTube playlist"
          />
          <View style={styles.gap} />
        </>
      )}

      <Button
        title="Share"
        onPress={onShare}
        variant="secondary"
        fullWidth
        accessibilityLabel="Share playlist"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.CARD_PADDING,
    paddingTop: SPACING.SECTION_GAP,
  },
  gap: {
    height: SPACING.BASE,
  },
});
