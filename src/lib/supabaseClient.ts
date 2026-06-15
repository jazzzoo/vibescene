import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

// expo-secure-store는 값 크기가 2048바이트로 제한되어 있어서,
// 작은 값(토큰 등)은 SecureStore에, 큰 값(세션 JSON 등)은 AsyncStorage에 저장한다.
const SECURE_STORE_MAX_BYTES = 2000;

const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    const secure = await SecureStore.getItemAsync(key);
    if (secure !== null) return secure;
    return AsyncStorage.getItem(key);
  },

  async setItem(key: string, value: string): Promise<void> {
    if (value.length <= SECURE_STORE_MAX_BYTES) {
      await SecureStore.setItemAsync(key, value);
      await AsyncStorage.removeItem(key);
    } else {
      await AsyncStorage.setItem(key, value);
      await SecureStore.deleteItemAsync(key).catch(() => {});
    }
  },

  async removeItem(key: string): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(key).catch(() => {}),
      AsyncStorage.removeItem(key),
    ]);
  },
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: secureStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
