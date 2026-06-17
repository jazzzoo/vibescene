import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';

interface MoodTagsProps {
  tags: string[];
}

export default function MoodTags({ tags }: MoodTagsProps) {
  if (tags.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      accessibilityLabel="분위기 태그"
    >
      {tags.map((tag) => (
        <View key={tag} style={styles.tag}>
          <Text style={styles.tagText}>{tag}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: SPACING.BASE,
  },
  tag: {
    backgroundColor: COLORS.MOOD_TAG,
    borderRadius: SPACING.BASE * 2,
    paddingHorizontal: SPACING.BASE * 1.5,
    paddingVertical: SPACING.BASE * 0.5,
  },
  tagText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 12,
    fontWeight: '500',
  },
});
