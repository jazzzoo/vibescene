import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeError } from '../../services/errors';
import { signInWithGoogle } from '../../services/auth';
import Button from '../../components/common/Button';
import ErrorView from '../../components/common/ErrorView';
import LoadingView from '../../components/common/LoadingView';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import { RootParamList } from '../../navigation/MainNavigator';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootParamList, 'Login'>;

type ScreenState = 'idle' | 'loading' | 'error';

const CANCEL_MESSAGE = 'Google 로그인이 취소되었습니다.';

function GoogleIcon() {
  return <Text style={styles.googleIcon}>G</Text>;
}

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [screenState, setScreenState] = useState<ScreenState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleGoogleLogin() {
    setScreenState('loading');
    try {
      await signInWithGoogle();
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('Home');
      }
    } catch (err) {
      if (err instanceof SafeError && err.message === CANCEL_MESSAGE) {
        // 취소는 에러로 처리하지 않음
        setScreenState('idle');
        return;
      }
      const message =
        err instanceof SafeError
          ? err.message
          : '로그인 중 오류가 발생했습니다. 다시 시도해 주세요.';
      setErrorMessage(message);
      setScreenState('error');
    }
  }

  if (screenState === 'loading') {
    return <LoadingView message="Google 로그인 중..." />;
  }

  if (screenState === 'error') {
    return (
      <ErrorView
        title="로그인 실패"
        message={errorMessage}
        onRetry={() => setScreenState('idle')}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.appName}>VibeScene</Text>
        <Text style={styles.tagline}>Turn your photos into playlists.</Text>
      </View>

      <View style={styles.actions}>
        <Button
          title="Google로 계속하기"
          onPress={handleGoogleLogin}
          variant="secondary"
          fullWidth
          icon={<GoogleIcon />}
          accessibilityLabel="Google 계정으로 로그인"
        />
      </View>

      <Text style={styles.disclaimer}>
        By continuing, you agree to connect your Google account to save playlists to YouTube.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    paddingHorizontal: SPACING.CARD_PADDING,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.SECTION_GAP * 2,
  },
  appName: {
    color: COLORS.ACCENT,
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: SPACING.BASE,
  },
  tagline: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 16,
    textAlign: 'center',
  },
  actions: {
    marginBottom: SPACING.SECTION_GAP,
  },
  googleIcon: {
    color: COLORS.ACCENT,
    fontSize: 16,
    fontWeight: '700',
  },
  disclaimer: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
