import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import SearchBar from '../components/SearchBar';
import SettingsIcon from '../components/SettingsIcon';
import MiniPlayer from '../components/MiniPlayer';
import TextInputModal from '../components/TextInputModal';
import {
  getAllPlaylists,
  searchPlaylists,
  createPlaylist,
  deletePlaylist,
  updatePlaylist,
} from '../database/db';

const PlaylistsScreen = () => {
  const navigation = useNavigation();
  const { colors, layout } = useApp();
  const [playlists, setPlaylists] = useState([]);
  const [filteredPlaylists, setFilteredPlaylists] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      loadPlaylists();
    }, []),
  );

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPlaylists(playlists);
    } else {
      const results = searchPlaylists(searchQuery);
      setFilteredPlaylists(results);
    }
  }, [searchQuery, playlists]);

  const loadPlaylists = () => {
    const allPlaylists = getAllPlaylists();
    setPlaylists(allPlaylists);
    setFilteredPlaylists(allPlaylists);
  };

  const handleCreatePlaylist = () => {
    setShowCreateModal(true);
  };

  const handleCreateSubmit = text => {
    const id = createPlaylist(text);
    if (id) {
      Alert.alert('Success', `Playlist "${text}" created!`);
      loadPlaylists();
    } else {
      Alert.alert('Error', 'Failed to create playlist.');
    }
    setShowCreateModal(false);
  };

  const handlePlaylistPress = playlist => {
    navigation.navigate('PlaylistDetail', { playlist });
  };

  const handleEditPress = playlist => {
    setEditingPlaylist(playlist);
    setShowEditModal(true);
  };

  const handleEditSubmit = text => {
    if (editingPlaylist) {
      updatePlaylist(
        editingPlaylist.id,
        text,
        editingPlaylist.cover_image_path,
      );
      Alert.alert('Success', 'Playlist renamed!');
      loadPlaylists();
    }
    setShowEditModal(false);
    setEditingPlaylist(null);
  };

  const handleLongPress = playlist => {
    Alert.alert(playlist.name, 'Choose an action', [
      {
        text: 'Edit',
        onPress: () => handleEditPress(playlist),
      },
      {
        text: 'Delete',
        onPress: () => {
          Alert.alert(
            'Delete Playlist',
            `Are you sure you want to delete "${playlist.name}"?`,
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: () => {
                  deletePlaylist(playlist.id);
                  loadPlaylists();
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

  const renderPlaylistItem = ({ item }) => {
    if (layout === 'grid') {
      return (
        <TouchableOpacity
          style={[styles.gridItem, { backgroundColor: colors.surface }]}
          onPress={() => handlePlaylistPress(item)}
          onLongPress={() => handleLongPress(item)}
        >
          {item.cover_image_path ? (
            <Image
              source={{ uri: item.cover_image_path }}
              style={styles.gridImage}
            />
          ) : (
            <View
              style={[
                styles.gridImagePlaceholder,
                { backgroundColor: colors.border },
              ]}
            >
              <Icon name="folder" size={40} color={colors.iconInactive} />
            </View>
          )}
          <Text
            style={[styles.gridText, { color: colors.textPrimary }]}
            numberOfLines={2}
          >
            {item.name}
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={[styles.listItem, { borderBottomColor: colors.border }]}
        onPress={() => handlePlaylistPress(item)}
        onLongPress={() => handleLongPress(item)}
      >
        {item.cover_image_path ? (
          <Image
            source={{ uri: item.cover_image_path }}
            style={styles.listImage}
          />
        ) : (
          <View
            style={[
              styles.listImagePlaceholder,
              { backgroundColor: colors.surface },
            ]}
          >
            <Icon name="folder" size={24} color={colors.iconInactive} />
          </View>
        )}
        <Text style={[styles.listText, { color: colors.textPrimary }]}>
          {item.name}
        </Text>
        <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Playlists
        </Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleCreatePlaylist}
          >
            <Icon name="add" size={28} color={colors.textPrimary} />
          </TouchableOpacity>
          <SettingsIcon />
        </View>
      </View>

      <SearchBar
        placeholder="Find in playlists"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <FlatList
        data={filteredPlaylists}
        keyExtractor={item => String(item.id)}
        renderItem={renderPlaylistItem}
        contentContainerStyle={[
          styles.listContent,
          layout === 'grid' && styles.gridContent,
        ]}
        numColumns={layout === 'grid' ? 2 : 1}
        key={layout}
      />

      <MiniPlayer />

      <TextInputModal
        visible={showCreateModal}
        title="Create Playlist"
        placeholder="Enter playlist name"
        onSubmit={handleCreateSubmit}
        onCancel={() => setShowCreateModal(false)}
      />

      <TextInputModal
        visible={showEditModal}
        title="Edit Playlist"
        placeholder="Enter new name"
        defaultValue={editingPlaylist?.name || ''}
        onSubmit={handleEditSubmit}
        onCancel={() => {
          setShowEditModal(false);
          setEditingPlaylist(null);
        }}
      />
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    padding: 8,
    marginRight: 8,
  },
  listContent: {
    paddingBottom: 140,
  },
  gridContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  listImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  listImagePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
  },
  gridItem: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: '1%',
  },
  gridImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  gridImagePlaceholder: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default PlaylistsScreen;
