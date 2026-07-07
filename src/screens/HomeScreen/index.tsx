import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Image, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNavigation from '../../components/common/BottomNavigation';
import Button from '../../components/common/Button';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import useImagePicker from '../../hooks/useImagePicker';
import { RootParamList } from '../../navigation/MainNavigator';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootParamList, 'Home'>;

type PendingSource = 'camera' | 'library' | null;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { pickFromLibrary, takePhoto, loading, error, clearError } = useImagePicker();
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [pendingSource, setPendingSource] = useState<PendingSource>(null);

  async function handleTakePhoto() {
    setPendingSource('camera');
    clearError();
    const uri = await takePhoto();
    setPendingSource(null);
    if (uri) setSelectedImageUri(uri);
  }

  async function handleChooseFromLibrary() {
    setPendingSource('library');
    clearError();
    const uri = await pickFromLibrary();
    setPendingSource(null);
    if (uri) setSelectedImageUri(uri);
  }

  function handleContinue() {
    if (!selectedImageUri) return;
    navigation.navigate('Loading', { localImageUri: selectedImageUri });
  }

  const hasImage = selectedImageUri !== null;
  // 카메라는 web에서 지원되지 않으므로 "Take a photo" 버튼은 web에서 숨긴다 (native 동작은 그대로 유지).
  const isWeb = Platform.OS === 'web';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.content}>
        <View style={[styles.header, hasImage && styles.headerCompact]}>
          <Text style={styles.appName}>VibeScene</Text>
          {!hasImage && (
            <>
              <Text style={styles.tagline}>Turn your photos into playlists.</Text>
              <Text style={styles.description}>
                One photo. One mood. A playlist that fits.
              </Text>
            </>
          )}
        </View>

        {hasImage && (
          <View style={styles.previewWrapper}>
            <Image
              source={{ uri: selectedImageUri }}
              style={styles.preview}
              resizeMode="cover"
              accessibilityLabel="Selected photo preview"
            />
          </View>
        )}

        <View style={styles.actions}>
          {!hasImage ? (
            <>
              {!isWeb && (
                <>
                  <Button
                    title="Take a photo"
                    onPress={handleTakePhoto}
                    variant="primary"
                    fullWidth
                    loading={loading && pendingSource === 'camera'}
                    disabled={loading}
                    accessibilityLabel="Take a photo with camera"
                  />
                  <View style={styles.buttonGap} />
                </>
              )}
              <Button
                title="Choose from library"
                onPress={handleChooseFromLibrary}
                variant={isWeb ? 'primary' : 'secondary'}
                fullWidth
                loading={loading && pendingSource === 'library'}
                disabled={loading}
                accessibilityLabel="Choose an image from library"
              />
            </>
          ) : (
            <>
              <Button
                title="Continue"
                onPress={handleContinue}
                variant="primary"
                fullWidth
                accessibilityLabel="Continue to next step"
              />
              <View style={styles.buttonGap} />
              <Button
                title="Choose another photo"
                onPress={handleChooseFromLibrary}
                variant="ghost"
                fullWidth
                loading={loading && pendingSource === 'library'}
                disabled={loading}
                accessibilityLabel="Choose a different photo"
              />
            </>
          )}
        </View>

        {error !== null && (
          <Text style={styles.errorText} accessibilityLiveRegion="assertive">
            {error}
          </Text>
        )}
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
    justifyContent: 'center',
    paddingHorizontal: SPACING.CARD_PADDING,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.SECTION_GAP * 2,
  },
  headerCompact: {
    marginBottom: SPACING.TRACK_GAP,
  },
  appName: {
    color: COLORS.ACCENT,
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: SPACING.BASE,
  },
  tagline: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: SPACING.BASE,
  },
  description: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.BASE * 0.5,
  },
  previewWrapper: {
    width: '100%',
    height: 260,
    borderRadius: SPACING.BASE,
    overflow: 'hidden',
    marginBottom: SPACING.TRACK_GAP,
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  actions: {
    width: '100%',
  },
  buttonGap: {
    height: SPACING.BASE,
  },
  errorText: {
    color: COLORS.ACCENT,
    fontSize: 13,
    textAlign: 'center',
    marginTop: SPACING.TRACK_GAP,
  },
});
