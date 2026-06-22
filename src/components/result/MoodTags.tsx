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
      style={styles.scroll}
      contentContainerStyle={styles.container}
      accessibilityLabel="Mood tags"
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
  scroll: {
    marginBottom: SPACING.BASE,
  },
  container: {
    flexDirection: 'row',
    gap: SPACING.BASE * 0.75,
  },
  tag: {
    backgroundColor: COLORS.MOOD_TAG,
    borderRadius: SPACING.BASE * 1.5,
    paddingHorizontal: SPACING.BASE * 1.25,
    paddingVertical: SPACING.BASE * 0.5,
  },
  tagText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 11,
    fontWeight: '500',
  },
});
