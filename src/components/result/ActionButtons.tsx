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
  // 비활성 상태인 동안엔 실제로 동작하는 Share를 primary로, Coming soon 버튼은 secondary로 눌러서
  // 지금 누를 수 있는 핵심 행동(CTA)이 항상 더 눈에 띄도록 한다.
  return (
    <View style={styles.container}>
      <Button
        title={SAVE_TO_YOUTUBE_ENABLED ? 'Save to YouTube' : 'Save to YouTube (Coming soon)'}
        onPress={onSaveToYouTube}
        variant={SAVE_TO_YOUTUBE_ENABLED ? 'primary' : 'secondary'}
        fullWidth
        loading={youtubeLoading}
        disabled={!SAVE_TO_YOUTUBE_ENABLED}
        accessibilityLabel={
          SAVE_TO_YOUTUBE_ENABLED
            ? 'Save as YouTube playlist'
            : 'Save as YouTube playlist, coming soon'
        }
      />
      <View style={styles.gap} />
      <Button
        title="Share"
        onPress={onShare}
        variant={SAVE_TO_YOUTUBE_ENABLED ? 'secondary' : 'primary'}
        fullWidth
        accessibilityLabel="Share playlist"
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
