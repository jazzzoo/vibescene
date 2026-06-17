import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import type { Track } from '../../types/playlist';
import TrackItem from './TrackItem';

interface TrackListProps {
  tracks: Track[];
}

export default function TrackList({ tracks }: TrackListProps) {
  if (tracks.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Tracks</Text>
      {tracks.map((track) => (
        <TrackItem key={track.rank} track={track} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.CARD_PADDING,
    paddingTop: SPACING.SECTION_GAP,
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
