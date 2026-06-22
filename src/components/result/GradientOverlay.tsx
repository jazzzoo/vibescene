import { StyleSheet, View } from 'react-native';

// expo-linear-gradient 미사용 — 단순 반투명 오버레이로 텍스트 가독성 확보
export default function GradientOverlay() {
  return <View style={styles.overlay} pointerEvents="none" />;
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
});
