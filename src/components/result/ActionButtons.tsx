import { StyleSheet, View } from 'react-native';
import { SPACING } from '../../constants/spacing';
import Button from '../common/Button';

interface ActionButtonsProps {
  onSaveToYouTube: () => void;
  youtubeLoading?: boolean;
  onShare: () => void;
}

// MVP 단계에서는 Google OAuth / YouTube 계정 저장 흐름을 숨긴다.
// 다시 켤 때는 이 상수만 true로 바꾸면 된다 — onSaveToYouTube 등 호출부 로직은 그대로 보존되어 있다.
const SAVE_TO_YOUTUBE_ENABLED = false;

export default function ActionButtons({ onSaveToYouTube, youtubeLoading, onShare }: ActionButtonsProps) {
  return (
    <View style={styles.container}>
      <Button
        title={SAVE_TO_YOUTUBE_ENABLED ? 'YouTube에 저장' : 'YouTube에 저장 (Coming soon)'}
        onPress={onSaveToYouTube}
        variant="primary"
        fullWidth
        loading={youtubeLoading}
        disabled={!SAVE_TO_YOUTUBE_ENABLED}
        accessibilityLabel={
          SAVE_TO_YOUTUBE_ENABLED
            ? 'YouTube 플레이리스트로 저장'
            : 'YouTube 플레이리스트 저장, 출시 예정'
        }
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
