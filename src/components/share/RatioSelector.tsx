import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import type { CardRatio } from './ShareCardPreview';

type RatioOption = {
  value: CardRatio;
  label: string;
  sublabel: string;
};

const OPTIONS: RatioOption[] = [
  { value: 'story', label: 'Story', sublabel: '9:16' },
  { value: 'square', label: 'Square', sublabel: '1:1' },
];

interface RatioSelectorProps {
  selected: CardRatio;
  onChange: (ratio: CardRatio) => void;
}

export default function RatioSelector({ selected, onChange }: RatioSelectorProps) {
  return (
    <View style={styles.container}>
      {OPTIONS.map(({ value, label, sublabel }) => {
        const isSelected = selected === value;
        return (
          <TouchableOpacity
            key={value}
            style={[styles.option, isSelected && styles.optionSelected]}
            onPress={() => onChange(value)}
            activeOpacity={0.7}
            accessibilityRole="radio"
            accessibilityLabel={`${label} ${sublabel}`}
            accessibilityState={{ selected: isSelected }}
          >
            <Text style={[styles.label, isSelected && styles.labelSelected]}>
              {label}
            </Text>
            <Text style={[styles.sublabel, isSelected && styles.sublabelSelected]}>
              {sublabel}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: SPACING.BASE,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.BASE * 0.75,
    borderRadius: SPACING.BASE,
    borderWidth: 1,
    borderColor: COLORS.TEXT_SECONDARY,
  },
  optionSelected: {
    borderColor: COLORS.ACCENT,
  },
  label: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 14,
    fontWeight: '600',
  },
  labelSelected: {
    color: COLORS.ACCENT,
  },
  sublabel: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 11,
    marginTop: 2,
  },
  sublabelSelected: {
    color: COLORS.ACCENT,
  },
});
