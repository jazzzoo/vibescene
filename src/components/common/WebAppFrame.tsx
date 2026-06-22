import { ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { COLORS } from '../../constants/colors';

// 웹 브라우저에서 모바일 앱처럼 보이도록 중앙 정렬된 고정 폭 프레임으로 제한한다.
// iPhone Pro Max 계열 논리 너비(430)를 기준으로 선택 — 480은 폰보다 작은 태블릿처럼 보여 제외.
const WEB_MAX_WIDTH = 430;

interface WebAppFrameProps {
  children: ReactNode;
}

export default function WebAppFrame({ children }: WebAppFrameProps) {
  // Native(iOS/Android)에서는 그대로 통과 — 레이아웃에 전혀 영향 없음
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  return (
    <View style={styles.outer}>
      <View style={styles.frame}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
  },
  frame: {
    flex: 1,
    width: '100%',
    maxWidth: WEB_MAX_WIDTH,
    backgroundColor: COLORS.BACKGROUND,
  },
});
