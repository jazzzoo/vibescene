import { useState } from 'react';
import { Linking, Platform, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import { logEvent } from '../../services/analytics';
import { SafeError } from '../../services/errors';
import { createShareLink } from '../../services/playlist';
import Button from '../common/Button';
import type { Track } from '../../types/playlist';

interface ActionButtonsProps {
  tracks: Track[];
  playlistId?: string;
  onSaveToYouTube: () => void;
  youtubeLoading?: boolean;
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

// sharePath(/p/:shareId)로 최종 공유 URL을 만든다.
// 백엔드가 shareUrl을 반환하면 우선 사용, 없으면 현재 origin + sharePath로 빌드.
function buildFinalShareUrl(shareId: string, sharePath: string, shareUrl: string | null): string {
  if (shareUrl) return shareUrl;
  if (typeof window !== 'undefined') {
    return window.location.origin + sharePath;
  }
  return sharePath;
}

export default function ActionButtons({ tracks, playlistId, onSaveToYouTube, youtubeLoading }: ActionButtonsProps) {
  const [shareLoading, setShareLoading] = useState(false);
  const [shareMessage, setShareMessage] = useState<string | null>(null);

  const playOnYoutubeUrl = buildPlayOnYoutubeUrl(tracks);

  function handlePlayOnYoutube() {
    if (!playOnYoutubeUrl) return;
    void logEvent('playlist_link_opened', {
      playlist_id: playlistId,
      track_count: tracks.length,
    });

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

  async function handleSharePlaylist() {
    if (!playlistId || shareLoading) return;
    setShareLoading(true);
    setShareMessage(null);

    try {
      const { shareId, sharePath, shareUrl: rawShareUrl } = await createShareLink(playlistId);
      const finalUrl = buildFinalShareUrl(shareId, sharePath, rawShareUrl);

      // Web Share API — 가능하면 OS 네이티브 공유 시트 사용
      if (Platform.OS === 'web') {
        const nav = navigator as Navigator & { share?: (data: ShareData) => Promise<void> };
        if (nav.share) {
          try {
            // 카카오톡은 title/text가 포함되면 링크 카드와 별개로 텍스트 메시지를
            // 추가로 생성할 수 있으므로 url만 전달한다.
            await nav.share({
              url: finalUrl,
            });
            // 공유 성공 — OS 공유 시트가 피드백을 제공하므로 별도 메시지 불필요
            return;
          } catch (err) {
            // 사용자가 공유 시트를 취소한 경우 — 에러가 아님
            if (err instanceof Error && err.name === 'AbortError') return;
            // 그 외 공유 실패 → clipboard fallback으로 이동
          }
        }
      }

      // Clipboard fallback
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(finalUrl);
        setShareMessage('Playlist link copied.');
        return;
      }

      setShareMessage("Couldn't share the playlist. Please try again.");
    } catch (err) {
      const message =
        err instanceof SafeError ? err.message : "Couldn't share the playlist. Please try again.";
      setShareMessage(message);
    } finally {
      setShareLoading(false);
    }
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
        title="Share playlist"
        onPress={handleSharePlaylist}
        variant="secondary"
        fullWidth
        loading={shareLoading}
        disabled={shareLoading || !playlistId}
        accessibilityLabel="Share playlist"
      />

      <Text style={styles.shareDisclosure}>
        Anyone with this link can view this playlist and photo.
      </Text>

      {shareMessage !== null && (
        <Text style={styles.shareMessage} accessibilityLiveRegion="polite">
          {shareMessage}
        </Text>
      )}
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
  shareDisclosure: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 11,
    textAlign: 'center',
    marginTop: SPACING.BASE * 0.75,
  },
  shareMessage: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 12,
    textAlign: 'center',
    marginTop: SPACING.BASE,
  },
});
