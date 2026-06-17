import { NavigationContainer } from '@react-navigation/native';
import { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { supabase } from '../lib/supabaseClient';
import MainNavigator from './MainNavigator';

export default function RootNavigator() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      // 세션이 이미 있으면 익명 로그인을 다시 호출하지 않음
      if (session) {
        setSession(session);
        setLoading(false);
        return;
      }

      supabase.auth.signInAnonymously().then(({ data, error }) => {
        if (error) {
          // API 에러 원문을 그대로 노출하지 않고 일반화된 메시지만 표시
          setError('로그인에 실패했습니다. 다시 시도해 주세요.');
        } else {
          setSession(data.session);
        }
        setLoading(false);
      });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <MainNavigator />
    </NavigationContainer>
  );
}
