import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import type { Track } from '../../types/playlist';
import TrackItem from './TrackItem';

interface TrackListProps {
  tracks: Track[];
  playlistId?: string;
}

export default function TrackList({ tracks, playlistId }: TrackListProps) {
  if (tracks.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Tracks</Text>
      {tracks.map((track, index) => (
        <TrackItem
          key={track.rank}
          track={track}
          isLast={index === tracks.length - 1}
          playlistId={playlistId}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.CARD_PADDING,
    // hero 영역이 줄어든 만큼, 첫 화면에 트랙이 더 보이도록 상단 여백을 좁게 유지
    paddingTop: SPACING.TRACK_GAP,
  },
  sectionTitle: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: SPACING.BASE,
  },
});
