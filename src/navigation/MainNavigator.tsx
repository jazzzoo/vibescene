import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HistoryScreen from '../screens/HistoryScreen';
import HomeScreen from '../screens/HomeScreen';
import LoadingScreen from '../screens/LoadingScreen';
import LoginScreen from '../screens/LoginScreen';
import ResultScreen from '../screens/ResultScreen';
import SharedResultScreen from '../screens/SharedResultScreen';

export type RootParamList = {
  Home: undefined;
  History: undefined;
  Loading: { localImageUri: string };
  Result: { playlistId: string };
  Login: undefined;
  SharedResult: { shareId: string };
};

const Stack = createNativeStackNavigator<RootParamList>();

export default function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="History" component={HistoryScreen} />
      <Stack.Screen name="Loading" component={LoadingScreen} />
      <Stack.Screen name="Result" component={ResultScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SharedResult" component={SharedResultScreen} />
    </Stack.Navigator>
  );
}
