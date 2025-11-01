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
import TextInputModal from '../components/TextInputModal';
import {
  getAllSongs,
  searchSongs,
  insertSong,
  deleteSong,
  updateSong,
  getAllPlaylists,
  addSongToPlaylist,
  getAllGenres,
  linkSongGenre,
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
      // Quét nhiều thư mục hơn
      const musicPaths = [
        // `${RNFS.ExternalStorageDirectoryPath}/Music`,
        `${RNFS.ExternalStorageDirectoryPath}/Download/Music`,
        // `${RNFS.DownloadDirectoryPath}`,
        // `${RNFS.ExternalStorageDirectoryPath}/Downloads`,
        // `${RNFS.ExternalStorageDirectoryPath}`,
      ];

      let foundFiles = [];

      // Hàm đệ quy để scan tất cả subfolders
      const scanDirectory = async (dirPath, depth = 0) => {
        if (depth > 3) return; // Giới hạn độ sâu để tránh scan quá lâu

        try {
          const exists = await RNFS.exists(dirPath);
          if (!exists) return;

          const items = await RNFS.readDir(dirPath);

          for (const item of items) {
            if (item.isFile()) {
              const fileName = item.name.toLowerCase();
              if (
                fileName.endsWith('.mp3') ||
                fileName.endsWith('.m4a') ||
                fileName.endsWith('.wav') ||
                fileName.endsWith('.flac') ||
                fileName.endsWith('.aac')
              ) {
                foundFiles.push(item);
              }
            } else if (item.isDirectory() && depth < 3) {
              // Skip các thư mục hệ thống
              const skipDirs = ['Android', '.', 'DCIM', 'Pictures', 'Movies'];
              const shouldSkip = skipDirs.some(skip =>
                item.name.includes(skip),
              );
              if (!shouldSkip) {
                await scanDirectory(item.path, depth + 1);
              }
            }
          }
        } catch (error) {
          console.log(`Error scanning ${dirPath}:`, error);
        }
      };

      // Scan tất cả các paths
      for (const path of musicPaths) {
        await scanDirectory(path);
      }

      if (foundFiles.length === 0) {
        Alert.alert(
          'No Music Found',
          'No music files found. Please ensure you have MP3, M4A, WAV, FLAC, or AAC files on your device.\n\nScanned paths:\n- Music\n- Download/Downloads\n- Root storage',
        );
        setIsScanning(false);
        return;
      }

      console.log(`Found ${foundFiles.length} music files`);

      // Insert songs into database
      let insertedCount = 0;
      for (const file of foundFiles) {
        try {
          const title = file.name.replace(/\.(mp3|m4a|wav|flac|aac)$/i, '');
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
      Alert.alert(
        'Scan Complete',
        `Found ${foundFiles.length} files.\nSuccessfully added ${insertedCount} songs.`,
      );
    } catch (error) {
      console.error('Scan error:', error);
      Alert.alert('Scan Error', `An error occurred: ${error.message}`);
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
        onPress: () => handleAddToPlaylist(song),
      },
      {
        text: 'Add to Genre',
        onPress: () => handleAddToGenre(song),
      },
      {
        text: 'Edit Song Info',
        onPress: () => handleEditSong(song),
      },
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

  const handleAddToPlaylist = song => {
    const playlists = getAllPlaylists();

    if (playlists.length === 0) {
      Alert.alert('No Playlists', 'Please create a playlist first.');
      return;
    }

    const playlistNames = playlists.map(p => p.name);

    Alert.alert('Add to Playlist', 'Choose a playlist:', [
      ...playlists.map(playlist => ({
        text: playlist.name,
        onPress: () => {
          const success = addSongToPlaylist(song.id, playlist.id);
          if (success) {
            Alert.alert('Success', `Added to "${playlist.name}"`);
          } else {
            Alert.alert('Error', 'Failed to add song to playlist.');
          }
        },
      })),
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleAddToGenre = song => {
    const genres = getAllGenres();

    if (genres.length === 0) {
      Alert.alert('No Genres', 'Please create a genre first.');
      return;
    }

    Alert.alert('Add to Genre', 'Choose a genre:', [
      ...genres.map(genre => ({
        text: genre.name,
        onPress: () => {
          const success = linkSongGenre(song.id, genre.id);
          if (success) {
            Alert.alert('Success', `Added to genre "${genre.name}"`);
          } else {
            Alert.alert('Info', 'Song may already be in this genre.');
          }
        },
      })),
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleEditSong = song => {
    Alert.prompt(
      'Edit Song Info',
      'Enter new song title',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: text => {
            if (text && text.trim()) {
              const success = updateSong(song.id, { title: text.trim() });
              if (success) {
                Alert.alert('Success', 'Song title updated!');
                loadSongs();
              } else {
                Alert.alert('Error', 'Failed to update song.');
              }
            }
          },
        },
      ],
      'plain-text',
      song.title,
    );
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
