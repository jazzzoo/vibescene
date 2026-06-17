import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../common/Button';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import type { PlaylistResult } from '../../types/playlist';
import RatioSelector from './RatioSelector';
import ShareCardPreview from './ShareCardPreview';
import type { CardRatio } from './ShareCardPreview';

interface ShareCardModalProps {
  visible: boolean;
  onClose: () => void;
  result: PlaylistResult;
}

export default function ShareCardModal({ visible, onClose, result }: ShareCardModalProps) {
  const [ratio, setRatio] = useState<CardRatio>('story');
  const insets = useSafeAreaInsets();

  function handleSaveImage() {
    // TODO: 실제 이미지 캡처 및 저장 구현 예정
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* 전체 컨테이너 — 하단 정렬, 딤 처리 */}
      <View style={styles.container}>
        {/* 딤 영역 터치 시 닫힘 — 패널보다 먼저 렌더하여 뒤에 위치 */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          activeOpacity={1}
          accessibilityLabel="모달 닫기"
        />

        {/* 바텀 시트 패널 */}
        <View style={[styles.panel, { paddingBottom: insets.bottom + SPACING.BASE }]}>
          {/* 비율 선택 */}
          <RatioSelector selected={ratio} onChange={setRatio} />

          {/* 카드 프리뷰 — story 비율은 스크롤로 전체 확인 */}
          <ScrollView
            style={styles.previewScroll}
            contentContainerStyle={styles.previewContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <ShareCardPreview ratio={ratio} result={result} />
          </ScrollView>

          {/* 하단 버튼 */}
          <View style={styles.actions}>
            <View style={styles.actionItem}>
              <Button
                title="닫기"
                onPress={onClose}
                variant="secondary"
                fullWidth
              />
            </View>
            <View style={styles.actionItem}>
              <Button
                title="이미지 저장"
                onPress={handleSaveImage}
                variant="primary"
                fullWidth
              />
            </View>
          </View>
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
  panel: {
    backgroundColor: COLORS.BACKGROUND,
    borderTopLeftRadius: SPACING.TRACK_GAP,
    borderTopRightRadius: SPACING.TRACK_GAP,
    paddingTop: SPACING.TRACK_GAP,
    paddingHorizontal: SPACING.CARD_PADDING,
    // 스크롤 영역 포함 최대 높이 제한
    maxHeight: '88%',
  },
  previewScroll: {
    marginTop: SPACING.TRACK_GAP,
    // story(9:16) 는 길어서 스크롤, square(1:1)는 딱 맞거나 작음
    maxHeight: 420,
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
});
