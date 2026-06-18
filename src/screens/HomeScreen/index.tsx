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
                Upload a photo and let AI create a playlist that matches the mood.
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
              accessibilityLabel="선택된 사진 미리보기"
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
                    accessibilityLabel="카메라로 사진 촬영"
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
                accessibilityLabel="사진첩에서 이미지 선택"
              />
            </>
          ) : (
            <>
              <Button
                title="Continue"
                onPress={handleContinue}
                variant="primary"
                fullWidth
                accessibilityLabel="다음 단계로 계속"
              />
              <View style={styles.buttonGap} />
              <Button
                title="Choose another photo"
                onPress={handleChooseFromLibrary}
                variant="ghost"
                fullWidth
                loading={loading && pendingSource === 'library'}
                disabled={loading}
                accessibilityLabel="다른 사진 선택"
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
