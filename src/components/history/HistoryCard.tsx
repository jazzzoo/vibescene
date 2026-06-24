import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import type { PlaylistHistoryItem, PlaylistStatus } from '../../types/playlist';

type StatusBadge = { text: string; isFailed: boolean } | null;

// MVP에서는 YouTube 저장(Edge Function 2)이 비활성화되어 있어 status가 'searching' 이후로
// 올라가지 않는다. 트랙 저장까지 끝난 'searching' 이후 단계는 사용자 입장에서 이미 완료된
// 상태이므로, 트랙이 아직 없는 'pending'/'analyzing'일 때만 Processing 배지를 보여준다.
function getStatusBadge(status: PlaylistStatus): StatusBadge {
  if (status === 'failed') return { text: 'Failed', isFailed: true };
  if (status === 'pending' || status === 'analyzing') return { text: 'Processing', isFailed: false };
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

  // thumbnail 로딩 실패 시(생성 실패로 신호 URL이 비었거나, signed URL은 받았지만 실제
  // 객체가 없어 이미지 로드가 실패하는 경우 모두) main image로 교체한다.
  const [imageSrc, setImageSrc] = useState(item.imageUri);
  useEffect(() => {
    setImageSrc(item.imageUri);
  }, [item.imageUri]);

  function handleImageError() {
    if (item.fallbackImageUri && imageSrc !== item.fallbackImageUri) {
      setImageSrc(item.fallbackImageUri);
    }
  }

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
        {imageSrc ? (
          <Image
            source={{ uri: imageSrc }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
            onError={handleImageError}
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
