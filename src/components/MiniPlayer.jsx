import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';

const MiniPlayer = () => {
  const navigation = useNavigation();
  const {
    colors,
    currentTrack,
    isPlaying,
    togglePlayPause,
    skipToNext,
    skipToPrevious,
    progress,
  } = useApp();

  if (!currentTrack) return null;

  const progressPercentage =
    progress.duration > 0 ? (progress.position / progress.duration) * 100 : 0;

  const handlePlayerPress = () => {
    navigation.navigate('NowPlaying');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Thin progress bar at top */}
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            {
              backgroundColor: colors.primary,
              width: `${progressPercentage}%`,
            },
          ]}
        />
      </View>

      {/* Main content */}
      <TouchableOpacity
        style={styles.content}
        onPress={handlePlayerPress}
        activeOpacity={0.9}
      >
        <View style={styles.leftSection}>
          {currentTrack.cover_image_path ? (
            <Image
              source={{ uri: currentTrack.cover_image_path }}
              style={styles.albumArt}
            />
          ) : (
            <View
              style={[
                styles.albumArtPlaceholder,
                { backgroundColor: colors.border },
              ]}
            >
              <Icon name="musical-note" size={24} color={colors.iconInactive} />
            </View>
          )}

          <View style={styles.textContainer}>
            <Text
              style={[styles.title, { color: colors.textPrimary }]}
              numberOfLines={1}
            >
              {currentTrack.title}
            </Text>
            <Text
              style={[styles.artist, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {currentTrack.artist_name_string || 'Unknown Artist'}
            </Text>
          </View>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            onPress={e => {
              e.stopPropagation();
              skipToPrevious();
            }}
            style={styles.controlButton}
          >
            <Icon name="play-skip-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={e => {
              e.stopPropagation();
              togglePlayPause();
            }}
            style={styles.controlButton}
          >
            <Icon
              name={isPlaying ? 'pause' : 'play'}
              size={28}
              color={colors.textPrimary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={e => {
              e.stopPropagation();
              skipToNext();
            }}
            style={styles.controlButton}
          >
            <Icon
              name="play-skip-forward"
              size={24}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  progressBarContainer: {
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    width: '100%',
  },
  progressBar: {
    height: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  albumArt: {
    width: 48,
    height: 48,
    borderRadius: 4,
  },
  albumArtPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  artist: {
    fontSize: 14,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    padding: 8,
    marginHorizontal: 4,
  },
});

export default MiniPlayer;
