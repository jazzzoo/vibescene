import { StyleSheet, Text } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';

interface PlaylistConceptProps {
  text: string;
}

export default function PlaylistConcept({ text }: PlaylistConceptProps) {
  return (
    <Text
      style={styles.text}
      accessibilityRole="header"
      numberOfLines={4}
      ellipsizeMode="tail"
    >
      {text}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 19,
    fontWeight: '700',
    lineHeight: 25,
    marginBottom: SPACING.BASE,
  },
});
