import { Image, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import type { PlaylistResult } from '../../types/playlist';

export type CardRatio = 'story' | 'square';

// width / height — story(9:16)는 세로로 길고, square(1:1)는 정사각형
const ASPECT_RATIO: Record<CardRatio, number> = {
  story: 9 / 16,
  square: 1,
};

// 카드 높이 상한 — story가 모달 폭(containerWidth)을 그대로 채우면 너무 길어지므로,
// 이 상한에 맞춰 폭을 줄여서라도 비율은 정확히 유지한 채 화면에 다 보이게 한다.
const MAX_PREVIEW_HEIGHT = 420;

// poster에는 mood tag 없이 전체 트랙 리스트를 보여준다 (최대 10개)
const MAX_TRACKS = 10;

interface ShareCardPreviewProps {
  ratio: CardRatio;
  result: PlaylistResult;
  // ShareCardModal이 실제 패널 레이아웃에서 측정해 전달하는 가용 너비
  containerWidth: number;
}

export default function ShareCardPreview({ ratio, result, containerWidth }: ShareCardPreviewProps) {
  const aspect = ASPECT_RATIO[ratio];
  const widthForHeightCap = MAX_PREVIEW_HEIGHT * aspect;
  const width = Math.min(containerWidth, widthForHeightCap);
  const height = width / aspect;
  const tracks = result.tracks.slice(0, MAX_TRACKS);

  return (
    <View style={[styles.card, { width, height }]}>
      {/* 배경 이미지 */}
      {result.imageUri ? (
        <Image
          source={{ uri: result.imageUri }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          accessibilityLabel="Share card background image"
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.imageFallback]} />
      )}

      {/* 어두운 오버레이 — 전체를 약하게 + 텍스트가 올라가는 하단을 한 번 더 어둡게 (의사 그라데이션) */}
      <View style={[StyleSheet.absoluteFill, styles.overlay]} />
      <View style={styles.bottomShade} />

      {/* 콘텐츠 — 포스터 타이틀 + 하단 정렬된 전체 트랙 리스트 */}
      <View style={styles.content}>
        <View style={styles.spacer} />

        {/* playlist_concept — 영화 포스터 타이틀처럼 크게 */}
        <Text style={styles.concept} numberOfLines={3}>
          {result.playlistConcept}
        </Text>

        {/* 구분선 */}
        <View style={styles.divider} />

        {/* 전체 트랙 리스트 — 번호 + title · artist 한 줄로 간결하게 */}
        {tracks.map((track) => (
          <View key={track.rank} style={styles.track}>
            <Text style={styles.trackRank}>{track.rank}</Text>
            <Text style={styles.trackLine} numberOfLines={1}>
              <Text style={styles.trackTitle}>{track.title}</Text>
              <Text style={styles.trackArtist}>  {track.artist}</Text>
            </Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  // 텍스트가 올라가는 하단부만 한 번 더 어둡게 — linear-gradient 없이 흉내내는 의사 그라데이션
  bottomShade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '65%',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  content: {
    flex: 1,
    // story 비율은 폭이 좁아지므로 CARD_PADDING보다 좁게 둬서 텍스트 공간을 확보
    padding: SPACING.BASE * 2,
    justifyContent: 'flex-end',
  },
  spacer: {
    flex: 1,
  },
  concept: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 31,
    letterSpacing: 0.2,
    marginBottom: SPACING.BASE,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.BASE * 0.75,
  },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.BASE * 0.35,
  },
  trackRank: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 10,
    fontWeight: '600',
    width: 16,
  },
  trackLine: {
    flex: 1,
    marginLeft: SPACING.BASE * 0.5,
  },
  trackTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 11,
    fontWeight: '600',
  },
  trackArtist: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 10,
    fontWeight: '400',
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
