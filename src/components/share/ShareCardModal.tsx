import { useEffect, useState } from 'react';
import { Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../common/Button';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import type { PlaylistResult } from '../../types/playlist';
import RatioSelector from './RatioSelector';
import ShareCardPreview from './ShareCardPreview';
import type { CardRatio } from './ShareCardPreview';

// RN Web에서 Modal은 WebAppFrame 트리 밖, document.body에 렌더링되어
// 앱의 430px 프레임 제한을 그대로 물려받지 못한다 — 여기서 동일한 값으로 다시 제한한다.
const WEB_MODAL_MAX_WIDTH = 430;
const isWeb = Platform.OS === 'web';

interface ShareCardModalProps {
  visible: boolean;
  onClose: () => void;
  result: PlaylistResult;
}

export default function ShareCardModal({ visible, onClose, result }: ShareCardModalProps) {
  const [ratio, setRatio] = useState<CardRatio>('story');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  // 패널 안에서 실제로 가용한 너비를 측정해 ShareCardPreview에 전달 (window 폭에 의존하지 않음)
  const [previewContainerWidth, setPreviewContainerWidth] = useState(0);
  const insets = useSafeAreaInsets();

  // 모달이 닫히면 다음에 열었을 때 안내 메시지가 남아있지 않도록 초기화
  useEffect(() => {
    if (!visible) setSaveMessage(null);
  }, [visible]);

  function handleSaveImage() {
    // 실제 이미지 캡처/저장은 추후 구현 예정 — 지금은 안내 메시지만 표시
    setSaveMessage('Image saving will be connected later.');
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* 전체 컨테이너 — 하단 정렬, 딤 처리 (웹에서는 패널을 가운데로 모음) */}
      <View style={[styles.container, isWeb && styles.containerWeb]}>
        {/* 딤 영역 터치 시 닫힘 — 패널보다 먼저 렌더하여 뒤에 위치 */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          activeOpacity={1}
          accessibilityLabel="Close modal"
        />

        {/* 바텀 시트 패널 */}
        <View
          style={[
            styles.panel,
            isWeb && styles.panelWeb,
            { paddingBottom: insets.bottom + SPACING.BASE },
          ]}
        >
          {/* 비율 선택 */}
          <RatioSelector selected={ratio} onChange={setRatio} />

          {/* 카드 프리뷰 — story 비율은 스크롤로 전체 확인 */}
          <ScrollView
            style={styles.previewScroll}
            contentContainerStyle={styles.previewContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
            onLayout={(e) => setPreviewContainerWidth(e.nativeEvent.layout.width)}
          >
            {previewContainerWidth > 0 && (
              <ShareCardPreview
                ratio={ratio}
                result={result}
                containerWidth={previewContainerWidth}
              />
            )}
          </ScrollView>

          {/* 하단 버튼 */}
          <View style={styles.actions}>
            <View style={styles.actionItem}>
              <Button
                title="Close"
                onPress={onClose}
                variant="secondary"
                fullWidth
              />
            </View>
            <View style={styles.actionItem}>
              <Button
                title="Save image"
                onPress={handleSaveImage}
                variant="primary"
                fullWidth
              />
            </View>
          </View>

          {saveMessage !== null && (
            <Text style={styles.saveMessage} accessibilityLiveRegion="polite">
              {saveMessage}
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  // 웹에서만 적용 — 딤 영역은 전체 화면 그대로 두고 패널만 가운데로 모음
  containerWeb: {
    alignItems: 'center',
  },
  panel: {
    backgroundColor: COLORS.BACKGROUND,
    borderTopLeftRadius: SPACING.TRACK_GAP,
    borderTopRightRadius: SPACING.TRACK_GAP,
    paddingTop: SPACING.TRACK_GAP,
    paddingHorizontal: SPACING.CARD_PADDING,
    // 스크롤 영역 포함 최대 높이 제한
    maxHeight: '88%',
  },
  // 웹에서만 적용 — WebAppFrame과 동일한 430px로 패널 폭을 제한
  panelWeb: {
    width: '100%',
    maxWidth: WEB_MODAL_MAX_WIDTH,
    alignSelf: 'center',
  },
  previewScroll: {
    marginTop: SPACING.TRACK_GAP,
    // 카드 자체 높이를 ShareCardPreview에서 상한선까지 줄여 보여주므로 약간의 여유만 둔다
    maxHeight: 440,
  },
  previewContent: {
    alignItems: 'center',
    paddingBottom: SPACING.BASE,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.BASE,
    marginTop: SPACING.TRACK_GAP,
  },
  actionItem: {
    flex: 1,
  },
  saveMessage: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 12,
    textAlign: 'center',
    marginTop: SPACING.BASE,
  },
});
