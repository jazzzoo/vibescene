import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import Button from './Button';

interface ErrorViewProps {
  title: string;
  message: string;
  onRetry?: () => void;
}

export default function ErrorView({ title, message, onRetry }: ErrorViewProps) {
  return (
    <View style={styles.container} accessibilityRole="alert">
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <View style={styles.retryWrapper}>
          <Button
            title="Try again"
            onPress={onRetry}
            variant="secondary"
            accessibilityLabel="An error occurred. Try again."
          />
        </View>
      ) : null}
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
  title: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: SPACING.BASE,
  },
  message: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryWrapper: {
    marginTop: SPACING.SECTION_GAP,
    width: '100%',
  },
});
