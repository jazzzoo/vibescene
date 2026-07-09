import { NavigationContainer } from '@react-navigation/native';
import { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/colors';
import { supabase } from '../lib/supabaseClient';
import { logEvent } from '../services/analytics';
import MainNavigator from './MainNavigator';

// /p/:shareId 브라우저 직접 진입을 지원하기 위한 React Navigation 딥링크 설정.
// Vercel은 모든 경로를 index.html로 리다이렉트하므로, 클라이언트에서 경로를 파싱한다.
// prefixes는 네이티브 딥링크용 — 웹에서는 path 패턴만 사용됨.
const linking = {
  prefixes: [
    // Vercel 고정 alias (배포별 랜덤 URL 제외 — 매 배포마다 변경됨)
    'https://vibescene.vercel.app',
    'https://vibescene-dingai.vercel.app',
    'https://vibescene-git-main-dingai.vercel.app',
    // 미래 커스텀 도메인
    'https://vibescene.com',
    // 네이티브 딥링크 scheme
    'vibescene://',
  ],
  config: {
    screens: {
      Home: '',
      SharedResult: 'p/:shareId',
      PrivacyPolicy: 'privacy',
      Terms: 'terms',
    },
  },
};

export default function RootNavigator() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        // 세션이 이미 있으면 익명 로그인을 다시 호출하지 않음
        if (session) {
          setSession(session);
          void logEvent('app_opened');
          return;
        }
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) {
          // API 에러 원문을 그대로 노출하지 않고 일반화된 메시지만 표시
          setError('Sign-in failed. Please try again.');
        } else {
          setSession(data.session);
          void logEvent('app_opened');
        }
      } catch {
        // localStorage 차단(KakaoTalk 등 제한된 WebView)이나 네트워크 오류로
        // getSession/signInAnonymously가 reject되면 loading이 영원히 true로 남는 버그 방지
        setError('Sign-in failed. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    void initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.fullscreen}>
        <ActivityIndicator color={COLORS.ACCENT} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.fullscreen}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <NavigationContainer linking={linking}>
      <MainNavigator />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 14,
    textAlign: 'center',
  },
});
