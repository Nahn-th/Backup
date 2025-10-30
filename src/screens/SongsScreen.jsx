import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import RNFS from 'react-native-fs';
import { useApp } from '../context/AppContext';
import SearchBar from '../components/SearchBar';
import SettingsIcon from '../components/SettingsIcon';
import SongItem from '../components/SongItem';
import MiniPlayer from '../components/MiniPlayer';
import {
  getAllSongs,
  searchSongs,
  insertSong,
  deleteSong,
} from '../database/db';

const SongsScreen = () => {
  const { colors, layout, playSong, playShuffled } = useApp();
  const [songs, setSongs] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    loadSongs();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredSongs(songs);
    } else {
      const results = searchSongs(searchQuery);
      setFilteredSongs(results);
    }
  }, [searchQuery, songs]);

  const loadSongs = () => {
    const allSongs = getAllSongs();
    setSongs(allSongs);
    setFilteredSongs(allSongs);
  };

  const requestStoragePermission = async () => {
    if (Platform.OS !== 'android') return true;

    try {
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (err) {
      console.error('Permission error:', err);
      return false;
    }
  };

  const scanMusic = async () => {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Denied',
        'Storage permission is required to scan music files.',
      );
      return;
    }

    setIsScanning(true);

    try {
      const musicPaths = [
        `${RNFS.ExternalStorageDirectoryPath}/Music`,
        `${RNFS.ExternalStorageDirectoryPath}/Download`,
        `${RNFS.DownloadDirectoryPath}`,
      ];

      let foundFiles = [];

      for (const path of musicPaths) {
        try {
          const exists = await RNFS.exists(path);
          if (exists) {
            const files = await RNFS.readDir(path);
            const musicFiles = files.filter(
              file =>
                file.isFile() &&
                (file.name.endsWith('.mp3') ||
                  file.name.endsWith('.m4a') ||
                  file.name.endsWith('.wav')),
            );
            foundFiles = [...foundFiles, ...musicFiles];
          }
        } catch (error) {
          console.log(`Error scanning ${path}:`, error);
        }
      }

      if (foundFiles.length === 0) {
        Alert.alert(
          'No Music Found',
          'No music files found in Music or Download folders.',
        );
        setIsScanning(false);
        return;
      }

      // Insert songs into database
      let insertedCount = 0;
      for (const file of foundFiles) {
        try {
          const title = file.name.replace(/\.(mp3|m4a|wav)$/i, '');
          const song = {
            title,
            path: file.path,
            duration: 0,
            artist_name_string: 'Unknown Artist',
            genre_string: '',
          };
          const id = insertSong(song);
          if (id) insertedCount++;
        } catch (error) {
          console.log(`Error inserting ${file.name}:`, error);
        }
      }

      loadSongs();
      Alert.alert('Scan Complete', `Found and added ${insertedCount} songs.`);
    } catch (error) {
      console.error('Scan error:', error);
      Alert.alert('Scan Error', 'An error occurred while scanning for music.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleSongPress = song => {
    playSong(song, filteredSongs);
  };

  const handlePlayAll = () => {
    if (filteredSongs.length > 0) {
      playSong(filteredSongs[0], filteredSongs);
    }
  };

  const handleShuffle = () => {
    if (filteredSongs.length > 0) {
      playShuffled(filteredSongs);
    }
  };

  const handleLongPress = song => {
    Alert.alert(song.title, 'Choose an action', [
      {
        text: 'Add to Playlist',
        onPress: () => console.log('Add to playlist'),
      },
      { text: 'Add to Genre', onPress: () => console.log('Add to genre') },
      { text: 'Edit Song Info', onPress: () => console.log('Edit song') },
      {
        text: 'Delete',
        onPress: () => {
          Alert.alert(
            'Delete Song',
            'Are you sure you want to delete this song?',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: () => {
                  deleteSong(song.id);
                  loadSongs();
                },
              },
            ],
          );
        },
        style: 'destructive',
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const renderHeader = () => (
    <View>
      <SearchBar
        placeholder="Find in songs"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {songs.length > 0 && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={handlePlayAll}
          >
            <Icon name="play" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Play</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={handleShuffle}
          >
            <Icon name="shuffle" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Shuffle</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon
        name="musical-notes-outline"
        size={80}
        color={colors.iconInactive}
      />
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        No songs found
      </Text>
      <TouchableOpacity
        style={[styles.scanButton, { backgroundColor: colors.primary }]}
        onPress={scanMusic}
        disabled={isScanning}
      >
        <Icon name="scan" size={20} color="#FFFFFF" />
        <Text style={styles.scanButtonText}>
          {isScanning ? 'Scanning...' : 'Scan Music'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Songs
        </Text>
        <SettingsIcon />
      </View>

      {songs.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredSongs}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => (
            <SongItem
              song={item}
              layout={layout}
              onPress={() => handleSongPress(item)}
              onLongPress={() => handleLongPress(item)}
            />
          )}
          ListHeaderComponent={renderHeader}
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
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 140,
  },
  gridContent: {
    paddingHorizontal: 16,
    justifyContent: 'space-between',
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
    marginBottom: 24,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SongsScreen;
