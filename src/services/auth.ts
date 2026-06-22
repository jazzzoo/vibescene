import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { SafeError } from './errors';

// 인증 플로우 도중 열린 브라우저를 정상적으로 닫기 위해 모듈 로드 시 1회 호출 (Expo 권장 패턴)
WebBrowser.maybeCompleteAuthSession();

const GOOGLE_AUTHORIZATION_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_DISCOVERY = { authorizationEndpoint: GOOGLE_AUTHORIZATION_ENDPOINT };

const GOOGLE_SCOPES = [
  'openid',
  'profile',
  'email',
  'https://www.googleapis.com/auth/youtube',
];

/**
 * 현재 세션이 있으면 그대로 반환하고, 없으면 익명 로그인을 수행한다.
 * 이미 세션이 있는데 재호출되지 않도록 getSession()을 먼저 확인한다.
 */
export async function signInAnonymouslyIfNeeded(): Promise<Session | null> {
  try {
    const { data: existing } = await supabase.auth.getSession();
    if (existing.session) return existing.session;

    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) throw new SafeError('Sign-in failed. Please try again.');

    return data.session;
  } catch (err) {
    if (err instanceof SafeError) throw err;
    throw new SafeError('Sign-in failed. Please try again.');
  }
}

/**
 * Google OAuth Authorization Code Flow + PKCE로 로그인하고,
 * 발급된 code/code_verifier를 exchange-google-code Edge Function에 전달해
 * 현재(익명) 사용자에 Google 프로필/토큰 정보를 연결한다.
 *
 * iOS/Android Google OAuth client는 client_secret이 발급되지 않으며,
 * authorization code는 발급받은 client_id와 동일한 client_id로만 교환할 수 있다.
 * 따라서 Edge Function도 플랫폼별 client_id로 동일하게 교환하도록 구성되어 있다.
 */
export async function signInWithGoogle(): Promise<void> {
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
    throw new SafeError("Google sign-in isn't supported on this platform.");
  }

  const clientId = Platform.OS === 'ios'
    ? process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
    : process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
  if (!clientId) {
    throw new SafeError("Google sign-in isn't configured.");
  }

  const redirectUri = AuthSession.makeRedirectUri({ scheme: 'vibescene' });

  const request = new AuthSession.AuthRequest({
    clientId,
    redirectUri,
    scopes: GOOGLE_SCOPES,
    usePKCE: true,
    extraParams: {
      access_type: 'offline',
      prompt: 'consent',
    },
  });

  const result = await request.promptAsync(GOOGLE_DISCOVERY);

  if (result.type === 'cancel' || result.type === 'dismiss') {
    throw new SafeError('Google sign-in was canceled.');
  }
  if (result.type !== 'success') {
    throw new SafeError('Google sign-in failed. Please try again.');
  }

  const code = result.params.code;
  const codeVerifier = request.codeVerifier;
  if (!code || !codeVerifier) {
    throw new SafeError('Google sign-in response was invalid.');
  }

  const { data, error } = await supabase.functions.invoke('exchange-google-code', {
    body: {
      code,
      code_verifier: codeVerifier,
      redirect_uri: redirectUri,
      platform: Platform.OS,
    },
  });

  if (error) {
    const serverMessage = (data as { error?: string } | null)?.error;
    throw new SafeError(serverMessage ?? 'Something went wrong during Google sign-in.');
  }

  const success = (data as { success?: boolean } | null)?.success;
  if (!success) {
    throw new SafeError('Something went wrong during Google sign-in.');
  }
}

/**
 * 로그아웃 후 익명 로그인을 다시 수행해 앱이 항상 세션을 갖도록 한다.
 */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw new SafeError('Sign-out failed. Please try again.');

  await signInAnonymouslyIfNeeded();
}

export async function getCurrentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}

export async function isAnonymousUser(): Promise<boolean> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user.is_anonymous ?? false;
}
