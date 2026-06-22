import { Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import type { Track } from '../../types/playlist';

interface TrackItemProps {
  track: Track;
  isLast?: boolean;
}

export default function TrackItem({ track, isLast = false }: TrackItemProps) {
  const canOpenOnYoutube = Boolean(track.youtubeVideoId);

  function handlePress() {
    if (!track.youtubeVideoId) return;
    Linking.openURL(`https://www.youtube.com/watch?v=${track.youtubeVideoId}`).catch(() => {});
  }

  return (
    <TouchableOpacity
      style={[styles.container, !isLast && styles.divider]}
      onPress={handlePress}
      disabled={!canOpenOnYoutube}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${track.rank}. ${track.title} by ${track.artist}. Open on YouTube`}
    >
      <View style={styles.rank}>
        <Text style={styles.rankText}>{track.rank}</Text>
      </View>

      {track.thumbnailUrl ? (
        <Image
          source={{ uri: track.thumbnailUrl }}
          style={styles.thumbnail}
          resizeMode="cover"
          accessibilityLabel={`${track.title} thumbnail`}
        />
      ) : (
        <View style={[styles.thumbnail, styles.thumbnailFallback]} />
      )}

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{track.title}</Text>
        <Text style={styles.artist} numberOfLines={1}>{track.artist}</Text>
      </View>

      {canOpenOnYoutube && (
        <Text style={styles.chevron} accessibilityElementsHidden>›</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.BASE,
    gap: SPACING.TRACK_GAP,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.TEXT_SECONDARY,
  },
  rank: {
    width: 24,
    alignItems: 'center',
  },
  rankText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 13,
    fontWeight: '600',
  },
  thumbnail: {
    width: 52,
    height: 52,
    borderRadius: SPACING.BASE * 0.5,
  },
  thumbnailFallback: {
    backgroundColor: COLORS.CARD_BACKGROUND,
  },
  info: {
    flex: 1,
  },
  title: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  artist: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 13,
  },
  chevron: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 18,
    fontWeight: '600',
  },
});
