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
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import SearchBar from '../components/SearchBar';
import SettingsIcon from '../components/SettingsIcon';
import MiniPlayer from '../components/MiniPlayer';
import TextInputModal from '../components/TextInputModal';
import {
  getAllGenres,
  searchGenres,
  createGenre,
  deleteGenre,
  updateGenre,
} from '../database/db';

const GenresScreen = () => {
  const navigation = useNavigation();
  const { colors, layout } = useApp();
  const [genres, setGenres] = useState([]);
  const [filteredGenres, setFilteredGenres] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGenre, setEditingGenre] = useState(null);

  useEffect(() => {
    loadGenres();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredGenres(genres);
    } else {
      const results = searchGenres(searchQuery);
      setFilteredGenres(results);
    }
  }, [searchQuery, genres]);

  const loadGenres = () => {
    const allGenres = getAllGenres();
    setGenres(allGenres);
    setFilteredGenres(allGenres);
  };

  const handleCreateGenre = () => {
    setShowCreateModal(true);
  };

  const handleCreateSubmit = text => {
    const id = createGenre(text);
    if (id) {
      Alert.alert('Success', `Genre "${text}" created!`);
      loadGenres();
    } else {
      Alert.alert('Error', 'Genre already exists or failed to create.');
    }
    setShowCreateModal(false);
  };

  const handleGenrePress = genre => {
    navigation.navigate('GenreDetail', { genre });
  };

  const handleEditPress = genre => {
    setEditingGenre(genre);
    setShowEditModal(true);
  };

  const handleEditSubmit = text => {
    if (editingGenre) {
      updateGenre(editingGenre.id, text, editingGenre.cover_image_path);
      Alert.alert('Success', 'Genre renamed!');
      loadGenres();
    }
    setShowEditModal(false);
    setEditingGenre(null);
  };

  const handleLongPress = genre => {
    Alert.alert(genre.name, 'Choose an action', [
      {
        text: 'Edit',
        onPress: () => handleEditPress(genre),
      },
      {
        text: 'Delete',
        onPress: () => {
          Alert.alert(
            'Delete Genre',
            `Are you sure you want to delete "${genre.name}"?`,
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: () => {
                  deleteGenre(genre.id);
                  loadGenres();
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

  const renderGenreItem = ({ item }) => {
    if (layout === 'grid') {
      return (
        <TouchableOpacity
          style={[styles.gridItem, { backgroundColor: colors.surface }]}
          onPress={() => handleGenrePress(item)}
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
              <Icon
                name="musical-notes"
                size={40}
                color={colors.iconInactive}
              />
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
        onPress={() => handleGenrePress(item)}
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
            <Icon name="musical-notes" size={24} color={colors.iconInactive} />
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
          Genres
        </Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleCreateGenre}
          >
            <Icon name="add" size={28} color={colors.textPrimary} />
          </TouchableOpacity>
          <SettingsIcon />
        </View>
      </View>

      <SearchBar
        placeholder="Find in genres"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <FlatList
        data={filteredGenres}
        keyExtractor={item => String(item.id)}
        renderItem={renderGenreItem}
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
        title="Create Genre"
        placeholder="Enter genre name"
        onSubmit={handleCreateSubmit}
        onCancel={() => setShowCreateModal(false)}
      />

      <TextInputModal
        visible={showEditModal}
        title="Edit Genre"
        placeholder="Enter new name"
        defaultValue={editingGenre?.name || ''}
        onSubmit={handleEditSubmit}
        onCancel={() => {
          setShowEditModal(false);
          setEditingGenre(null);
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

export default GenresScreen;
