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

const CANCEL_MESSAGE = 'Google sign-in was canceled.';

// 소프트 프리뷰 기간 동안 Google OAuth 비활성화 (oauth_tokens 평문 저장 이슈 해소 전까지)
// 다시 켤 때는 이 상수만 true로 바꾸면 된다 — 아래 로그인 로직은 그대로 보존되어 있다.
const GOOGLE_LOGIN_ENABLED = false;

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
          : 'Something went wrong while signing in. Please try again.';
      setErrorMessage(message);
      setScreenState('error');
    }
  }

  if (!GOOGLE_LOGIN_ENABLED) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.appName}>VibeScene</Text>
          <Text style={styles.tagline}>Turn your photos into playlists.</Text>
        </View>
        <Text style={styles.disclaimer}>YouTube playlist saving is coming soon.</Text>
        <Text style={[styles.disclaimer, styles.disclaimerSpacing]}>
          For now, you can still generate playlists and open them on YouTube.
        </Text>
      </View>
    );
  }

  if (screenState === 'loading') {
    return <LoadingView message="Signing in with Google..." />;
  }

  if (screenState === 'error') {
    return (
      <ErrorView
        title="Sign-in failed"
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
          title="Continue with Google"
          onPress={handleGoogleLogin}
          variant="secondary"
          fullWidth
          icon={<GoogleIcon />}
          accessibilityLabel="Sign in with Google"
        />
      </View>

      <Text style={styles.disclaimer}>
        By continuing, you agree to connect your Google account to save playlists to YouTube.
      </Text>
      <Text style={[styles.disclaimer, styles.disclaimerSpacing]}>
        By using YouTube features, you also agree to YouTube's Terms of Service and Google's
        Privacy Policy.
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
  disclaimerSpacing: {
    marginTop: SPACING.BASE,
  },
});
