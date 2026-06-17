import { StyleSheet, Text } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';

interface PlaylistConceptProps {
  text: string;
}

export default function PlaylistConcept({ text }: PlaylistConceptProps) {
  return (
    <Text style={styles.text} accessibilityRole="header">
      {text}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    marginBottom: SPACING.TRACK_GAP,
  },
});
