import { toBlob } from 'html-to-image';
import { useEffect, useRef, useState } from 'react';
import { Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../common/Button';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import type { PlaylistResult } from '../../types/playlist';
import RatioSelector from './RatioSelector';
import ShareCardPreview from './ShareCardPreview';
import type { CardRatio } from './ShareCardPreview';

const SAVE_FILENAME = 'vibescene-playlist.png';
const GENERIC_SAVE_ERROR = "Couldn't save the image. Please try again.";

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
  const [saving, setSaving] = useState(false);
  // 패널 안에서 실제로 가용한 너비를 측정해 ShareCardPreview에 전달 (window 폭에 의존하지 않음)
  const [previewContainerWidth, setPreviewContainerWidth] = useState(0);
  const insets = useSafeAreaInsets();
  const cardRef = useRef<View>(null);

  // 모달이 닫히면 다음에 열었을 때 안내 메시지가 남아있지 않도록 초기화
  useEffect(() => {
    if (!visible) setSaveMessage(null);
  }, [visible]);

  async function handleSaveImage() {
    if (saving) return;

    // 캡처는 web(DOM) 전용 — native는 아직 미지원이라 조용히 안내만 표시.
    // Direct save to Photos is not reliably available on mobile web.
    // Native app support would require a native media-library path such as expo-media-library.
    // Current web implementation provides download/open-image fallback.
    if (!isWeb) {
      setSaveMessage('Saving images is currently available on the web app.');
      return;
    }

    // web에서 RN View의 ref는 실제 DOM 노드를 가리킨다 (react-native-web) — 카드 프리뷰만 캡처 대상으로 사용
    const node = cardRef.current as unknown as HTMLElement | null;
    if (!node) {
      setSaveMessage(GENERIC_SAVE_ERROR);
      return;
    }

    setSaving(true);
    setSaveMessage('Preparing image...');
    let objectUrl: string | null = null;
    try {
      // 카드 자체는 반투명 배경(overlay 위 이미지)이라, 캡처 시 backgroundColor로 불투명 블랙을 강제한다.
      const blob = await toBlob(node, {
        backgroundColor: '#000000',
        pixelRatio: 2,
      });
      if (!blob) throw new Error('empty_blob');

      objectUrl = URL.createObjectURL(blob);
      const isIOS = /iP(hone|od|ad)/.test(navigator.userAgent);

      if (isIOS) {
        // 1순위 (iOS web): 앵커 다운로드는 Safari에서 신뢰할 수 없고, Web Share API는 공유 시트를 먼저
        // 띄워 저장이 아닌 공유처럼 느껴지므로 지양한다. 새 탭으로 열어 길게 눌러 저장하도록 안내한다.
        window.open(objectUrl, '_blank');
        setSaveMessage('Image opened — long-press to save to Photos.');
        return;
      }

      // 1순위 (Android / Desktop): 앵커 다운로드가 가장 직접적인 저장 경로
      try {
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = SAVE_FILENAME;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setSaveMessage('Image downloaded.');
        return;
      } catch {
        // 앵커 다운로드 실패 시 새 탭 fallback으로 이동
      }

      // 2순위: 새 탭으로 열기
      const opened = window.open(objectUrl, '_blank');
      if (opened) {
        setSaveMessage('Image opened — long-press or save it from the browser.');
        return;
      }

      // 3순위 (최후): Web Share API — 저장이 아닌 공유 시트이므로 앞의 경로가 모두 실패했을 때만 사용
      const file = new File([blob], SAVE_FILENAME, { type: 'image/png' });
      const nav = navigator as Navigator & {
        canShare?: (data?: ShareData) => boolean;
        share?: (data: ShareData) => Promise<void>;
      };
      if (nav.share && nav.canShare?.({ files: [file] })) {
        await nav.share({ files: [file] });
        setSaveMessage('Image ready — save it from the browser.');
        return;
      }

      setSaveMessage(GENERIC_SAVE_ERROR);
    } catch (err) {
      // 사용자가 공유 시트를 취소한 경우는 실패가 아니므로 에러 메시지를 띄우지 않음
      const isUserCancel = err instanceof Error && err.name === 'AbortError';
      if (!isUserCancel) {
        console.error('[ShareCardModal] save_image_failed', err);
        setSaveMessage(GENERIC_SAVE_ERROR);
      }
    } finally {
      if (objectUrl) {
        const urlToRevoke = objectUrl;
        setTimeout(() => URL.revokeObjectURL(urlToRevoke), 30000);
      }
      setSaving(false);
    }
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
                ref={cardRef}
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
                loading={saving}
                disabled={saving}
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
