import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import SongItem from '../components/SongItem';
import MiniPlayer from '../components/MiniPlayer';
import { getPlayHistory, clearPlayHistory } from '../database/db';

const PlayHistoryScreen = () => {
  const navigation = useNavigation();
  const { colors, layout, playSong } = useApp();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const playHistory = getPlayHistory(100);
    setHistory(playHistory);
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all play history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            clearPlayHistory();
            loadHistory();
          },
        },
      ],
    );
  };

  const handleSongPress = song => {
    playSong(song, history);
  };

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        Your last {history.length} played songs
      </Text>
      {history.length > 0 && (
        <TouchableOpacity
          style={[styles.clearButton, { backgroundColor: colors.primary }]}
          onPress={handleClearHistory}
        >
          <Icon name="trash-outline" size={18} color="#FFFFFF" />
          <Text style={styles.clearButtonText}>Clear History</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="time-outline" size={80} color={colors.iconInactive} />
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        No play history yet
      </Text>
      <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
        Start listening to see your history here
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="chevron-back" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Play History
        </Text>
        <View style={styles.placeholder} />
      </View>

      {history.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          ListHeaderComponent={renderHeader}
          renderItem={({ item }) => (
            <SongItem
              song={item}
              layout={layout}
              onPress={() => handleSongPress(item)}
            />
          )}
          contentContainerStyle={[
            styles.listContent,
            layout === 'grid' && styles.gridContent,
          ]}
          numColumns={layout === 'grid' ? 2 : 1}
          key={layout}
        />
      )}

      <MiniPlayer />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 36,
  },
  headerContent: {
    padding: 16,
  },
  description: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'center',
    gap: 8,
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 140,
  },
  gridContent: {
    paddingHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default PlayHistoryScreen;
