import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';

interface LoadingViewProps {
  message: string;
  subMessage?: string;
}

export default function LoadingView({ message, subMessage }: LoadingViewProps) {
  return (
    <View
      style={styles.container}
      accessibilityLiveRegion="polite"
      accessibilityLabel={subMessage ? `${message}. ${subMessage}` : message}
    >
      <ActivityIndicator size="large" color={COLORS.ACCENT} style={styles.indicator} />
      <Text style={styles.message}>{message}</Text>
      {subMessage ? <Text style={styles.subMessage}>{subMessage}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.CARD_PADDING,
  },
  indicator: {
    marginBottom: SPACING.TRACK_GAP,
  },
  message: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  subMessage: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 14,
    textAlign: 'center',
    marginTop: SPACING.BASE,
  },
});
