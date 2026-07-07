import { StyleSheet, View } from 'react-native';

// expo-linear-gradient 미사용 — 동일 높이의 반투명 밴드를 위(투명)에서 아래(불투명 블랙)로
// 쌓아 리니어 그라디언트를 흉내낸다. 마지막 밴드는 완전 불투명이라 hero 하단이
// 페이지의 블랙 배경과 자연스럽게 이어진다.
const BAND_OPACITIES = [0, 0.02, 0.06, 0.14, 0.26, 0.42, 0.6, 0.78, 0.92, 1];

export default function GradientOverlay() {
  return (
    <View style={styles.container} pointerEvents="none">
      {BAND_OPACITIES.map((opacity, index) => (
        <View key={index} style={[styles.band, { backgroundColor: `rgba(0, 0, 0, ${opacity})` }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    flexDirection: 'column',
  },
  band: {
    flex: 1,
  },
});
