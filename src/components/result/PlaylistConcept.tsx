import { StyleSheet, Text } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';

interface PlaylistConceptProps {
  text: string;
}

export default function PlaylistConcept({ text }: PlaylistConceptProps) {
  return (
    <Text
      style={styles.text}
      accessibilityRole="header"
      numberOfLines={2}
      ellipsizeMode="tail"
    >
      {text}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 34,
    marginBottom: SPACING.BASE * 0.75,
    // 이미지 위에 얹히는 텍스트라 밝은 배경에서도 가독성을 확보하기 위한 그림자
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
});
