import { StyleSheet, View } from 'react-native';
import { SPACING } from '../../constants/spacing';
import Button from '../common/Button';

interface ActionButtonsProps {
  onSaveToYouTube: () => void;
  youtubeLoading?: boolean;
  onShare: () => void;
}

export default function ActionButtons({ onSaveToYouTube, youtubeLoading, onShare }: ActionButtonsProps) {
  return (
    <View style={styles.container}>
      <Button
        title="YouTube에 저장"
        onPress={onSaveToYouTube}
        variant="primary"
        fullWidth
        loading={youtubeLoading}
        accessibilityLabel="YouTube 플레이리스트로 저장"
      />
      <View style={styles.gap} />
      <Button
        title="공유"
        onPress={onShare}
        variant="secondary"
        fullWidth
        accessibilityLabel="플레이리스트 공유"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.CARD_PADDING,
    paddingTop: SPACING.SECTION_GAP,
  },
  gap: {
    height: SPACING.BASE,
  },
});
