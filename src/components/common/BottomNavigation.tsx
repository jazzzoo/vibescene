import { useNavigation, useNavigationState } from '@react-navigation/native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';

type TabRoute = 'Home' | 'History';

interface TabItem {
  route: TabRoute;
  label: string;
  icon: string;
}

const TABS: TabItem[] = [
  { route: 'Home', label: '홈', icon: '⊙' },
  { route: 'History', label: '기록', icon: '◷' },
];

export default function BottomNavigation() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const currentRoute = useNavigationState(
    (state) => state.routes[state.index].name
  );

  function handleTabPress(route: TabRoute) {
    if (currentRoute === route) return;
    navigation.navigate(route as never);
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || SPACING.BASE }]}>
      {TABS.map(({ route, label, icon }) => {
        const isActive = currentRoute === route;
        return (
          <TouchableOpacity
            key={route}
            style={styles.tab}
            onPress={() => handleTabPress(route)}
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{ selected: isActive }}
            activeOpacity={0.7}
          >
            <Text style={[styles.icon, isActive && styles.iconActive]}>{icon}</Text>
            <Text style={[styles.label, isActive && styles.labelActive]}>{label}</Text>
            {isActive && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.BACKGROUND,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.TEXT_SECONDARY,
    paddingTop: SPACING.BASE,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.BASE,
    position: 'relative',
  },
  icon: {
    fontSize: 20,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 2,
  },
  iconActive: {
    color: COLORS.ACCENT,
  },
  label: {
    fontSize: 11,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '500',
  },
  labelActive: {
    color: COLORS.ACCENT,
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    width: 32,
    height: 2,
    backgroundColor: COLORS.ACCENT,
    borderRadius: 1,
  },
});
