import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';

interface UseImagePickerReturn {
  pickFromLibrary: () => Promise<string | null>;
  takePhoto: () => Promise<string | null>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export default function useImagePicker(): UseImagePickerReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function clearError() {
    setError(null);
  }

  async function pickFromLibrary(): Promise<string | null> {
    setLoading(true);
    setError(null);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== ImagePicker.PermissionStatus.GRANTED) {
        setError('사진첩 접근 권한이 필요합니다. 설정에서 권한을 허용해 주세요.');
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: false,
        quality: 0.8,
      });

      if (result.canceled) return null;

      return result.assets[0].uri;
    } catch {
      setError('사진을 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요.');
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function takePhoto(): Promise<string | null> {
    setLoading(true);
    setError(null);
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (permission.status !== ImagePicker.PermissionStatus.GRANTED) {
        setError('카메라 접근 권한이 필요합니다. 설정에서 권한을 허용해 주세요.');
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        allowsEditing: false,
        quality: 0.8,
      });

      if (result.canceled) return null;

      return result.assets[0].uri;
    } catch {
      setError('카메라를 실행하는 중 오류가 발생했습니다. 다시 시도해 주세요.');
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { pickFromLibrary, takePhoto, loading, error, clearError };
}
