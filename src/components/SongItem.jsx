import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useApp } from '../context/AppContext';

const SongItem = ({ song, onPress, onLongPress, layout = 'list' }) => {
  const { colors } = useApp();

  const formatDuration = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (layout === 'grid') {
    return (
      <TouchableOpacity
        style={[styles.gridContainer, { backgroundColor: colors.surface }]}
        onPress={onPress}
        onLongPress={onLongPress}
      >
        {song.cover_image_path ? (
          <Image
            source={{ uri: song.cover_image_path }}
            style={styles.gridImage}
          />
        ) : (
          <View
            style={[
              styles.gridImagePlaceholder,
              { backgroundColor: colors.border },
            ]}
          >
            <Icon name="musical-note" size={40} color={colors.iconInactive} />
          </View>
        )}
        <Text
          style={[styles.gridTitle, { color: colors.textPrimary }]}
          numberOfLines={2}
        >
          {song.title}
        </Text>
        <Text
          style={[styles.gridArtist, { color: colors.textSecondary }]}
          numberOfLines={1}
        >
          {song.artist_name_string || 'Unknown Artist'}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.listContainer, { borderBottomColor: colors.border }]}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      {song.cover_image_path ? (
        <Image
          source={{ uri: song.cover_image_path }}
          style={styles.listImage}
        />
      ) : (
        <View
          style={[
            styles.listImagePlaceholder,
            { backgroundColor: colors.surface },
          ]}
        >
          <Icon name="musical-note" size={24} color={colors.iconInactive} />
        </View>
      )}
      <View style={styles.listInfo}>
        <Text
          style={[styles.listTitle, { color: colors.textPrimary }]}
          numberOfLines={1}
        >
          {song.title}
        </Text>
        <Text
          style={[styles.listArtist, { color: colors.textSecondary }]}
          numberOfLines={1}
        >
          {song.artist_name_string || 'Unknown Artist'}
        </Text>
      </View>
      <TouchableOpacity style={styles.menuButton} onPress={onLongPress}>
        <Icon name="ellipsis-vertical" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // List Layout
  listContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  listImage: {
    width: 48,
    height: 48,
    borderRadius: 4,
  },
  listImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listInfo: {
    flex: 1,
    marginLeft: 12,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  listArtist: {
    fontSize: 14,
  },
  menuButton: {
    padding: 8,
  },

  // Grid Layout
  gridContainer: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 8,
    padding: 12,
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
  gridTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  gridArtist: {
    fontSize: 12,
  },
});

export default SongItem;
