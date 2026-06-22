import { SafeAreaProvider } from 'react-native-safe-area-context';
import WebAppFrame from './src/components/common/WebAppFrame';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <WebAppFrame>
        <RootNavigator />
      </WebAppFrame>
    </SafeAreaProvider>
  );
}
