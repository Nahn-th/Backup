import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import SearchBar from '../components/SearchBar';
import SettingsIcon from '../components/SettingsIcon';
import MiniPlayer from '../components/MiniPlayer';
import { getAllArtists, searchArtists } from '../database/db';

const ArtistsScreen = () => {
  const navigation = useNavigation();
  const { colors, layout } = useApp();
  const [artists, setArtists] = useState([]);
  const [filteredArtists, setFilteredArtists] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadArtists();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredArtists(artists);
    } else {
      const results = searchArtists(searchQuery);
      setFilteredArtists(results);
    }
  }, [searchQuery, artists]);

  const loadArtists = () => {
    const allArtists = getAllArtists();
    setArtists(allArtists);
    setFilteredArtists(allArtists);
  };

  const handleArtistPress = artist => {
    navigation.navigate('ArtistDetail', { artist });
  };

  const renderArtistItem = ({ item }) => {
    if (layout === 'grid') {
      return (
        <TouchableOpacity
          style={[styles.gridItem, { backgroundColor: colors.surface }]}
          onPress={() => handleArtistPress(item)}
        >
          {item.cover_image_path ? (
            <Image
              source={{ uri: item.cover_image_path }}
              style={styles.gridAvatar}
            />
          ) : (
            <View
              style={[
                styles.gridAvatarPlaceholder,
                { backgroundColor: colors.border },
              ]}
            >
              <Icon name="person" size={40} color={colors.iconInactive} />
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
        onPress={() => handleArtistPress(item)}
      >
        {item.cover_image_path ? (
          <Image
            source={{ uri: item.cover_image_path }}
            style={styles.listAvatar}
          />
        ) : (
          <View
            style={[
              styles.listAvatarPlaceholder,
              { backgroundColor: colors.surface },
            ]}
          >
            <Icon name="person" size={28} color={colors.iconInactive} />
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
          Artists
        </Text>
        <SettingsIcon />
      </View>

      <SearchBar
        placeholder="Find in artists"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <FlatList
        data={filteredArtists}
        keyExtractor={item => String(item.id)}
        renderItem={renderArtistItem}
        contentContainerStyle={[
          styles.listContent,
          layout === 'grid' && styles.gridContent,
        ]}
        numColumns={layout === 'grid' ? 2 : 1}
        key={layout}
      />

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
  listContent: {
    paddingBottom: 140,
  },
  gridContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  // List Layout
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  listAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  listAvatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
  },
  // Grid Layout
  gridItem: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: '1%',
    alignItems: 'center',
  },
  gridAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
  },
  gridAvatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
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

export default ArtistsScreen;
