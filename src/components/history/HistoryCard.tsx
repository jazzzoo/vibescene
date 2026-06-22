import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import type { PlaylistHistoryItem, PlaylistStatus } from '../../types/playlist';

type StatusBadge = { text: string; isFailed: boolean } | null;

function getStatusBadge(status: PlaylistStatus): StatusBadge {
  if (status === 'failed') return { text: 'Failed', isFailed: true };
  if (status !== 'created') return { text: 'Processing', isFailed: false };
  return null;
}

interface HistoryCardProps {
  item: PlaylistHistoryItem;
  onPress: () => void;
  // HistoryScreen이 실제 레이아웃에서 측정해 전달하는 카드 폭 (window 폭에 의존하지 않음)
  width: number;
}

export default function HistoryCard({ item, onPress, width }: HistoryCardProps) {
  const badge = getStatusBadge(item.status);

  return (
    <TouchableOpacity
      style={[styles.container, { width }]}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`Open ${item.playlistConcept || 'playlist'}`}
    >
      {/* 이미지 영역 — gallery tile의 주인공 */}
      <View style={[styles.imageContainer, { width, height: width }]}>
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

      {/* 타이틀 — 최소화: 1줄, 넘치면 ellipsis */}
      {item.playlistConcept ? (
        <Text style={styles.title} numberOfLines={1}>
          {item.playlistConcept}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {},
  imageContainer: {
    // 1:1 비율 — width와 height를 항상 동일하게 받아 정사각형 유지
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
    paddingHorizontal: SPACING.BASE * 0.5,
    paddingVertical: 1,
  },
  badgeFailed: {
    backgroundColor: COLORS.ACCENT,
  },
  badgeProcessing: {
    backgroundColor: COLORS.CARD_BACKGROUND,
  },
  badgeText: {
    fontSize: 9,
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
