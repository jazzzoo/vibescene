import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import type { PlaylistResult } from '../../types/playlist';

export type CardRatio = 'story' | 'square';

const SCREEN_WIDTH = Dimensions.get('window').width;
// 모달 좌우 패딩(CARD_PADDING * 2)을 뺀 프리뷰 가용 너비
const PREVIEW_WIDTH = SCREEN_WIDTH - SPACING.CARD_PADDING * 4;

const PREVIEW_HEIGHT: Record<CardRatio, number> = {
  story: PREVIEW_WIDTH * (16 / 9),
  square: PREVIEW_WIDTH,
};

const MAX_MOOD_TAGS = 3;
const MAX_TRACKS = 3;

interface ShareCardPreviewProps {
  ratio: CardRatio;
  result: PlaylistResult;
}

export default function ShareCardPreview({ ratio, result }: ShareCardPreviewProps) {
  const height = PREVIEW_HEIGHT[ratio];
  const moodTags = (result.analysis.moodKeywords ?? []).slice(0, MAX_MOOD_TAGS);
  const topTracks = result.tracks.slice(0, MAX_TRACKS);

  return (
    <View style={[styles.card, { width: PREVIEW_WIDTH, height }]}>
      {/* 배경 이미지 */}
      {result.imageUri ? (
        <Image
          source={{ uri: result.imageUri }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          accessibilityLabel="공유 카드 배경 이미지"
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.imageFallback]} />
      )}

      {/* 어두운 오버레이 */}
      <View style={[StyleSheet.absoluteFill, styles.overlay]} />

      {/* 콘텐츠 — 하단 정렬 */}
      <View style={styles.content}>
        <View style={styles.spacer} />

        {/* playlist_concept */}
        <Text style={styles.concept} numberOfLines={3}>
          {result.playlistConcept}
        </Text>

        {/* mood tags 최대 3개 */}
        {moodTags.length > 0 && (
          <View style={styles.tagsRow}>
            {moodTags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* 구분선 */}
        <View style={styles.divider} />

        {/* 상위 3곡 */}
        {topTracks.map((track) => (
          <View key={track.rank} style={styles.track}>
            <Text style={styles.trackRank}>{track.rank}</Text>
            <View style={styles.trackInfo}>
              <Text style={styles.trackTitle} numberOfLines={1}>
                {track.title}
              </Text>
              <Text style={styles.trackArtist} numberOfLines={1}>
                {track.artist}
              </Text>
            </View>
          </View>
        ))}

        {/* 브랜드 텍스트 */}
        <Text style={styles.brand}>VibeScene</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: SPACING.BASE,
    overflow: 'hidden',
    backgroundColor: COLORS.CARD_BACKGROUND,
  },
  imageFallback: {
    backgroundColor: COLORS.CARD_BACKGROUND,
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.52)',
  },
  content: {
    flex: 1,
    padding: SPACING.CARD_PADDING,
    justifyContent: 'flex-end',
  },
  spacer: {
    flex: 1,
  },
  concept: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
    marginBottom: SPACING.BASE,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.BASE * 0.5,
    marginBottom: SPACING.TRACK_GAP,
  },
  tag: {
    backgroundColor: COLORS.MOOD_TAG,
    borderRadius: SPACING.BASE * 2,
    paddingHorizontal: SPACING.BASE,
    paddingVertical: 3,
  },
  tagText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 11,
    fontWeight: '500',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.BASE,
  },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.BASE * 0.75,
  },
  trackRank: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 12,
    fontWeight: '600',
    width: 18,
  },
  trackInfo: {
    flex: 1,
    marginLeft: SPACING.BASE * 0.75,
  },
  trackTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 12,
    fontWeight: '600',
  },
  trackArtist: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 11,
  },
  brand: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: SPACING.BASE,
  },
});
