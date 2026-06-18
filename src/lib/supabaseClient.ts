import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// createClient의 auth.storage가 기대하는 모양과 구조적으로 동일한 인터페이스
// (supabase-js가 이 타입을 공개로 export하지 않아 직접 정의함, any 미사용)
interface AuthStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

// expo-secure-store는 값 크기가 2048바이트로 제한되어 있어서,
// 작은 값(토큰 등)은 SecureStore에, 큰 값(세션 JSON 등)은 AsyncStorage에 저장한다.
const SECURE_STORE_MAX_BYTES = 2000;

// iOS/Android: expo-secure-store + AsyncStorage 하이브리드 (기존 방식 유지)
const nativeStorage: AuthStorage = {
  async getItem(key) {
    const secure = await SecureStore.getItemAsync(key);
    if (secure !== null) return secure;
    return AsyncStorage.getItem(key);
  },

  async setItem(key, value) {
    if (value.length <= SECURE_STORE_MAX_BYTES) {
      await SecureStore.setItemAsync(key, value);
      await AsyncStorage.removeItem(key);
    } else {
      await AsyncStorage.setItem(key, value);
      await SecureStore.deleteItemAsync(key).catch(() => {});
    }
  },

  async removeItem(key) {
    await Promise.all([
      SecureStore.deleteItemAsync(key).catch(() => {}),
      AsyncStorage.removeItem(key),
    ]);
  },
};

// web: expo-secure-store 네이티브 모듈이 없어 브라우저 localStorage를 사용한다.
// window가 없는 환경(SSR 등)에서 죽지 않도록 가드한다.
const webStorage: AuthStorage = {
  async getItem(key) {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(key);
  },

  async setItem(key, value) {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(key, value);
  },

  async removeItem(key) {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(key);
  },
};

const storage: AuthStorage = Platform.OS === 'web' ? webStorage : nativeStorage;

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
