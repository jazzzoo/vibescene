import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, ListRenderItem, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HistoryCard from '../../components/history/HistoryCard';
import BottomNavigation from '../../components/common/BottomNavigation';
import ErrorView from '../../components/common/ErrorView';
import LoadingView from '../../components/common/LoadingView';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import { RootParamList } from '../../navigation/MainNavigator';
import { SafeError } from '../../services/errors';
import { getPlaylistHistory } from '../../services/playlist';
import type { PlaylistHistoryItem } from '../../types/playlist';

type HistoryNavigationProp = NativeStackNavigationProp<RootParamList, 'History'>;

const NUM_COLS = 3;

export default function HistoryScreen() {
  const navigation = useNavigation<HistoryNavigationProp>();
  const [items, setItems] = useState<PlaylistHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const history = await getPlaylistHistory();
      setItems(history);
    } catch (err) {
      const message =
        err instanceof SafeError
          ? err.message
          : "We couldn't load your history. Please try again.";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCardPress = useCallback(
    (playlistId: string) => {
      navigation.navigate('Result', { playlistId });
    },
    [navigation],
  );

  const renderItem: ListRenderItem<PlaylistHistoryItem> = useCallback(
    ({ item }) => (
      <HistoryCard item={item} onPress={() => handleCardPress(item.id)} />
    ),
    [handleCardPress],
  );

  const ListHeader = (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>History</Text>
    </View>
  );

  const ListEmpty = (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No playlists yet</Text>
      <Text style={styles.emptySubtitle}>Create your first playlist from a photo.</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {loading ? (
        <LoadingView message="Loading your history..." />
      ) : errorMessage ? (
        <ErrorView
          title="Something went wrong"
          message={errorMessage}
          onRetry={load}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={NUM_COLS}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={ListEmpty}
          contentContainerStyle={[
            styles.listContent,
            items.length === 0 && styles.listContentEmpty,
          ]}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
        />
      )}
      <BottomNavigation />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    paddingBottom: SPACING.BASE,
  },
  headerTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 22,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: SPACING.CARD_PADDING,
    paddingBottom: SPACING.SECTION_GAP,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  // numColumns=3 시 각 row에 적용 — 아이템 간 gap
  columnWrapper: {
    gap: SPACING.BASE,
    marginBottom: SPACING.BASE,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.SECTION_GAP,
  },
  emptyTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: SPACING.BASE,
  },
  emptySubtitle: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 14,
    textAlign: 'center',
  },
});
