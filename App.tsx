import { Component, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import WebAppFrame from './src/components/common/WebAppFrame';
import RootNavigator from './src/navigation/RootNavigator';

interface ErrorBoundaryState {
  hasError: boolean;
}

// KakaoTalk 인앱 브라우저 등에서 WebView 복원 중 JS 에러가 발생하면
// React 트리가 unmount되어 흰 화면이 노출된다.
// 최소한의 ErrorBoundary로 잡아서 검은 배경 + 안내 메시지를 보여준다.
class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    // 어떤 컴포넌트에서 어떤 에러가 발생했는지 진단하기 위한 로그
    console.error('[ErrorBoundary]', error.message, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Something went wrong. Please refresh.</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <WebAppFrame>
          <RootNavigator />
        </WebAppFrame>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    color: '#ffffff',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});
