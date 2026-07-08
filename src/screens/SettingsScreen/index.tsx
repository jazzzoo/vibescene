import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import appConfig from '../../../app.json';
import BottomNavigation from '../../components/common/BottomNavigation';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import { RootParamList } from '../../navigation/MainNavigator';

const SUPPORT_X_URL = 'https://x.com/jaejoolee_kr';

const APP_VERSION = appConfig.expo.version;

type SettingsNavigationProp = NativeStackNavigationProp<RootParamList, 'Settings'>;

export default function SettingsScreen() {
  const navigation = useNavigation<SettingsNavigationProp>();
  const [linkError, setLinkError] = useState<string | null>(null);

  function handleMessageOnX() {
    setLinkError(null);
    Linking.openURL(SUPPORT_X_URL).catch(() => {
      setLinkError("Couldn't open X. Please try again.");
    });
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.content}>
        <Text style={styles.header}>Settings</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <Text style={styles.sectionBody}>
            Found a bug or have feedback? Send me a DM on X.
          </Text>
          <TouchableOpacity
            style={styles.row}
            onPress={handleMessageOnX}
            accessibilityRole="button"
            accessibilityLabel="Message on X"
            activeOpacity={0.7}
          >
            <Text style={styles.rowLabelAccent}>Message on X</Text>
          </TouchableOpacity>
          {linkError && <Text style={styles.errorText}>{linkError}</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate('PrivacyPolicy')}
            accessibilityRole="button"
            accessibilityLabel="Privacy Policy"
            activeOpacity={0.7}
          >
            <Text style={styles.rowLabelAccent}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate('Terms')}
            accessibilityRole="button"
            accessibilityLabel="Terms of Service"
            activeOpacity={0.7}
          >
            <Text style={styles.rowLabelAccent}>Terms of Service</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About VibeScene</Text>
          <Text style={styles.sectionBody}>
            Turn a photo into a playlist that matches its mood.
          </Text>
          {APP_VERSION && <Text style={styles.version}>Version {APP_VERSION}</Text>}
        </View>
      </View>

      <BottomNavigation />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.CARD_PADDING,
    paddingTop: SPACING.SECTION_GAP * 0.5,
  },
  header: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: SPACING.SECTION_GAP,
  },
  section: {
    marginBottom: SPACING.SECTION_GAP,
  },
  sectionTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: SPACING.BASE,
  },
  sectionBody: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: SPACING.TRACK_GAP,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.BASE * 1.5,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.TEXT_SECONDARY,
  },
  rowLabelAccent: {
    color: COLORS.ACCENT,
    fontSize: 15,
    fontWeight: '600',
  },
  errorText: {
    color: COLORS.ACCENT,
    fontSize: 13,
    marginTop: SPACING.BASE,
  },
  version: {
    color: COLORS.MOOD_TAG,
    fontSize: 12,
    marginTop: SPACING.BASE * 0.5,
  },
});
