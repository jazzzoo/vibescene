import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import { RootParamList } from '../../navigation/MainNavigator';

type LegalNavigationProp = NativeStackNavigationProp<RootParamList>;

// 법적 문서 초안 — 최종 확정 전까지 자리표시자
const EFFECTIVE_DATE = 'July 8, 2026';

interface LegalLayoutProps {
  title: string;
  children: ReactNode;
}

export default function LegalLayout({ title, children }: LegalLayoutProps) {
  const navigation = useNavigation<LegalNavigationProp>();

  function handleBack() {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Text style={styles.backLabel}>{'‹ Back'}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.effectiveDate}>Effective Date: {EFFECTIVE_DATE}</Text>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.CARD_PADDING,
    paddingTop: SPACING.BASE,
  },
  backButton: {
    paddingVertical: SPACING.BASE * 0.5,
  },
  backLabel: {
    color: COLORS.ACCENT,
    fontSize: 15,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.CARD_PADDING,
    paddingBottom: SPACING.SECTION_GAP * 2,
  },
  title: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 24,
    fontWeight: '700',
    marginTop: SPACING.BASE,
    marginBottom: SPACING.BASE * 0.5,
  },
  effectiveDate: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 13,
  },
});
