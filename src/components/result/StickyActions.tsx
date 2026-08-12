import { useState } from 'react';
import { Linking, Platform, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import { getAcquisitionSource } from '../../services/acquisitionSource';
import { logEvent } from '../../services/analytics';
import { createShareLink } from '../../services/playlist';
import { capture } from '../../services/posthog';
import Button from '../common/Button';
import type { Track } from '../../types/playlist';

interface StickyActionsProps {
  tracks: Track[];
  playlistId?: string;
}

// ActionButtons.tsx와 동일한 URL 빌드 로직 — sticky 버전 전용 독립 함수
function buildPlayOnYoutubeUrl(tracks: Track[]): string | null {
  const ids = [
    ...new Set(tracks.map((t) => t.youtubeVideoId).filter((id): id is string => Boolean(id))),
  ];
  if (ids.length === 0) return null;
  if (ids.length === 1) return `https://www.youtube.com/watch?v=${ids[0]}`;
  return `https://www.youtube.com/watch_videos?video_ids=${ids.join(',')}`;
}

function buildFinalShareUrl(shareId: string, sharePath: string, shareUrl: string | null): string {
  if (shareUrl) return shareUrl;
  if (typeof window !== 'undefined') return window.location.origin + sharePath;
  return sharePath;
}

export default function StickyActions({ tracks, playlistId }: StickyActionsProps) {
  const [shareLoading, setShareLoading] = useState(false);
  const playOnYoutubeUrl = buildPlayOnYoutubeUrl(tracks);

  function handlePlayOnYoutube() {
    if (!playOnYoutubeUrl) return;
    void logEvent('playlist_link_opened', { playlist_id: playlistId, track_count: tracks.length });
    capture('playlist_play', {
      source: getAcquisitionSource(),
      playlist_id: playlistId,
      surface: 'sticky',
    });
    if (Platform.OS === 'web') {
      const w = window.open(playOnYoutubeUrl, '_blank', 'noopener,noreferrer');
      if (!w) Linking.openURL(playOnYoutubeUrl).catch(() => {});
      return;
    }
    Linking.openURL(playOnYoutubeUrl).catch(() => {});
  }

  async function handleSharePlaylist() {
    if (!playlistId || shareLoading) return;
    capture('share_click', {
      source: getAcquisitionSource(),
      playlist_id: playlistId,
      surface: 'sticky',
    });
    setShareLoading(true);
    try {
      const { shareId, sharePath, shareUrl: raw } = await createShareLink(playlistId);
      const finalUrl = buildFinalShareUrl(shareId, sharePath, raw);
      if (Platform.OS === 'web') {
        const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
        if (nav.share) {
          try {
            await nav.share({ url: finalUrl });
            return;
          } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') return;
          }
        }
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(finalUrl);
        }
      } else {
        Linking.openURL(finalUrl).catch(() => {});
      }
    } catch {
      // sticky 바는 메시지 표시 영역이 없어 실패 시 조용히 무시
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
      <Button
        title="Share playlist"
        onPress={handleSharePlaylist}
        variant="secondary"
        fullWidth
        loading={shareLoading}
        disabled={shareLoading || !playlistId}
        accessibilityLabel="Share playlist"
      />
      <Text style={styles.disclosure}>
        Anyone with this link can view this playlist and photo.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.BACKGROUND,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: SPACING.CARD_PADDING,
    paddingTop: SPACING.BASE * 2,
    paddingBottom: SPACING.BASE,
  },
  gap: {
    height: SPACING.BASE,
  },
  disclosure: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 11,
    textAlign: 'center',
    marginTop: SPACING.BASE * 0.75,
    marginBottom: SPACING.BASE * 0.5,
  },
});
