import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';

interface TextChildrenProps {
  children: ReactNode;
}

export function SectionTitle({ children }: TextChildrenProps) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

export function SubHeading({ children }: TextChildrenProps) {
  return <Text style={styles.subHeading}>{children}</Text>;
}

export function Paragraph({ children }: TextChildrenProps) {
  return <Text style={styles.paragraph}>{children}</Text>;
}

export function Bullet({ children }: TextChildrenProps) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bulletDot}>{'•'}</Text>
      <Text style={styles.bulletText}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 17,
    fontWeight: '700',
    marginTop: SPACING.SECTION_GAP,
    marginBottom: SPACING.BASE,
  },
  subHeading: {
    color: COLORS.ACCENT,
    fontSize: 14,
    fontWeight: '600',
    marginTop: SPACING.TRACK_GAP,
    marginBottom: SPACING.BASE * 0.5,
  },
  paragraph: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: SPACING.BASE,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: SPACING.BASE * 0.5,
    paddingLeft: SPACING.BASE * 0.5,
  },
  bulletDot: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 14,
    marginRight: SPACING.BASE * 0.75,
    lineHeight: 21,
  },
  bulletText: {
    flex: 1,
    color: COLORS.TEXT_SECONDARY,
    fontSize: 14,
    lineHeight: 21,
  },
});
