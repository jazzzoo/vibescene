import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import type { PlaylistHistoryItem, PlaylistStatus } from '../../types/playlist';

const SCREEN_WIDTH = Dimensions.get('window').width;
const OUTER_PADDING = SPACING.CARD_PADDING;  // 24
const COL_GAP = SPACING.BASE;                // 8
const NUM_COLS = 3;

// 3열 그리드 카드 너비: 전체 너비 - 좌우 패딩 - 열 사이 간격 수
export const CARD_WIDTH =
  (SCREEN_WIDTH - OUTER_PADDING * 2 - COL_GAP * (NUM_COLS - 1)) / NUM_COLS;

type StatusBadge = { text: string; isFailed: boolean } | null;

function getStatusBadge(status: PlaylistStatus): StatusBadge {
  if (status === 'failed') return { text: 'Failed', isFailed: true };
  if (status !== 'created') return { text: 'Processing', isFailed: false };
  return null;
}

interface HistoryCardProps {
  item: PlaylistHistoryItem;
  onPress: () => void;
}

export default function HistoryCard({ item, onPress }: HistoryCardProps) {
  const badge = getStatusBadge(item.status);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`Open ${item.playlistConcept || 'playlist'}`}
    >
      {/* 이미지 영역 */}
      <View style={styles.imageContainer}>
        {item.imageUri ? (
          <Image
            source={{ uri: item.imageUri }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.imageFallback]} />
        )}

        {badge && (
          <View style={[styles.badge, badge.isFailed ? styles.badgeFailed : styles.badgeProcessing]}>
            <Text style={[styles.badgeText, badge.isFailed ? styles.badgeTextFailed : styles.badgeTextProcessing]}>
              {badge.text}
            </Text>
          </View>
        )}
      </View>

      {/* 타이틀 */}
      {item.playlistConcept ? (
        <Text style={styles.title} numberOfLines={2}>
          {item.playlistConcept}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
  },
  imageContainer: {
    width: CARD_WIDTH,
    height: CARD_WIDTH,  // 1:1 비율
    borderRadius: SPACING.BASE * 0.5,
    overflow: 'hidden',
    backgroundColor: COLORS.CARD_BACKGROUND,
  },
  imageFallback: {
    backgroundColor: COLORS.CARD_BACKGROUND,
  },
  badge: {
    position: 'absolute',
    top: SPACING.BASE * 0.5,
    left: SPACING.BASE * 0.5,
    borderRadius: SPACING.BASE * 0.5,
    paddingHorizontal: SPACING.BASE * 0.75,
    paddingVertical: 2,
  },
  badgeFailed: {
    backgroundColor: COLORS.ACCENT,
  },
  badgeProcessing: {
    backgroundColor: COLORS.CARD_BACKGROUND,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  badgeTextFailed: {
    color: COLORS.BUTTON_TEXT,
  },
  badgeTextProcessing: {
    color: COLORS.TEXT_SECONDARY,
  },
  title: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 11,
    lineHeight: 15,
    marginTop: SPACING.BASE * 0.5,
  },
});
