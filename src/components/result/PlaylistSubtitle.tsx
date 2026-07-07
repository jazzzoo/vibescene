import { StyleSheet, Text } from 'react-native';
import { COLORS } from '../../constants/colors';

interface PlaylistSubtitleProps {
  text?: string;
}

export default function PlaylistSubtitle({ text }: PlaylistSubtitleProps) {
  if (!text) return null;

  return (
    <Text style={styles.text} numberOfLines={2} ellipsizeMode="tail">
      {text}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 14,
    lineHeight: 19,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
