import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Image,
    Alert,
    ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import Slider from '@react-native-community/slider';
import { useApp } from '../context/AppContext';
import {
    getGenresBySong,
    getAllPlaylists,
    addSongToPlaylist,
} from '../database/db';

const NowPlayingScreen = () => {
    const navigation = useNavigation();
    const {
        colors,
        currentTrack,
        isPlaying,
        togglePlayPause,
        skipToNext,
        skipToPrevious,
        seekTo,
        shuffleMode,
        toggleShuffle,
        repeatMode,
        cycleRepeatMode,
        progress,
    } = useApp();
    const [genres, setGenres] = useState([]);

    useEffect(() => {
        if (currentTrack) {
            loadGenres();
        }
    }, [currentTrack]);

    const loadGenres = () => {
        const songGenres = getGenresBySong(currentTrack.id);
        setGenres(songGenres);
    };

    const formatTime = seconds => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSliderChange = value => {
        seekTo(value);
    };

    const handleGenresPress = () => {
        if (genres.length === 0) {
            Alert.alert('No Genres', 'This song has no genres assigned.');
            return;
        }
        const genreNames = genres.map(g => g.name).join(', ');
        Alert.alert('Genres', genreNames);
    };

    const handleAddToPlaylist = () => {
        Alert.alert('Add to Playlist', 'This feature will be implemented soon.');
    };

    const getRepeatIcon = () => {
        if (repeatMode === 'off') return 'repeat-outline';
        if (repeatMode === 'all') return 'repeat';
        if (repeatMode === 'one') return 'repeat-outline';
    };

    if (!currentTrack) {
        return (
            <SafeAreaView
                style={[styles.container, { backgroundColor: colors.background }]}
            >
                <View style={styles.emptyContainer}>
                    <Icon
                        name="musical-notes-outline"
                        size={80}
                        color={colors.iconInactive}
                    />
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                        No song playing
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView
            style={[styles.container, { backgroundColor: colors.background }]}
        >
            <ScrollView
                contentContainerStyle={{
                    flexGrow: 1,
                    justifyContent: 'center',
                    paddingBottom: 80, // chừa chỗ cho thanh tab hoặc điều hướng
                }}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Icon name="chevron-down" size={32} color={colors.textPrimary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    {currentTrack.cover_image_path ? (
                        <Image
                            source={{ uri: currentTrack.cover_image_path }}
                            style={styles.albumArt}
                        />
                    ) : (
                        <View
                            style={[
                                styles.albumArtPlaceholder,
                                { backgroundColor: colors.surface },
                            ]}
                        >
                            <Icon
                                name="musical-note"
                                size={120}
                                color={colors.iconInactive}
                            />
                        </View>
                    )}

                    <View style={styles.infoContainer}>
                        <Text
                            style={[styles.title, { color: colors.textPrimary }]}
                            numberOfLines={2}
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

                    <View style={styles.progressContainer}>
                        <Slider
                            style={styles.slider}
                            value={progress.position}
                            minimumValue={0}
                            maximumValue={progress.duration || 1}
                            minimumTrackTintColor={colors.primary}
                            maximumTrackTintColor={colors.border}
                            thumbTintColor={colors.primary}
                            onSlidingComplete={handleSliderChange}
                        />
                        <View style={styles.timeContainer}>
                            <Text style={[styles.timeText, { color: colors.textSecondary }]}>
                                {formatTime(progress.position)}
                            </Text>
                            <Text style={[styles.timeText, { color: colors.textSecondary }]}>
                                {formatTime(progress.duration)}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.mainControls}>
                        <TouchableOpacity
                            onPress={skipToPrevious}
                            style={styles.mainControlButton}
                        >
                            <Icon
                                name="play-skip-back"
                                size={36}
                                color={colors.textPrimary}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={togglePlayPause}
                            style={styles.playButton}
                        >
                            <Icon
                                name={isPlaying ? 'pause' : 'play'}
                                size={48}
                                color="#FFFFFF"
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={skipToNext}
                            style={styles.mainControlButton}
                        >
                            <Icon
                                name="play-skip-forward"
                                size={36}
                                color={colors.textPrimary}
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.bottomControls}>
                        <TouchableOpacity
                            onPress={handleGenresPress}
                            style={styles.bottomButton}
                        >
                            <Icon name="pricetag" size={24} color={colors.textPrimary} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={toggleShuffle}
                            style={styles.bottomButton}
                        >
                            <Icon
                                name="shuffle"
                                size={24}
                                color={shuffleMode ? colors.primary : colors.textPrimary}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={cycleRepeatMode}
                            style={styles.bottomButton}
                        >
                            <Icon
                                name={getRepeatIcon()}
                                size={24}
                                color={
                                    repeatMode !== 'off' ? colors.primary : colors.textPrimary
                                }
                            />
                            {repeatMode === 'one' && (
                                <Text style={[styles.repeatOneText, { color: colors.primary }]}>
                                    1
                                </Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleAddToPlaylist}
                            style={styles.bottomButton}
                        >
                            <Icon
                                name="add-circle-outline"
                                size={24}
                                color={colors.textPrimary}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    backButton: {
        padding: 8,
        alignSelf: 'flex-start',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
    },
    albumArt: {
        width: 300,
        height: 300,
        borderRadius: 12,
        alignSelf: 'center',
        marginBottom: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 12,
    },
    albumArtPlaceholder: {
        width: 300,
        height: 300,
        borderRadius: 12,
        alignSelf: 'center',
        marginBottom: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoContainer: {
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    artist: {
        fontSize: 18,
        textAlign: 'center',
    },
    progressContainer: {
        marginBottom: 32,
    },
    slider: {
        width: '100%',
        height: 40,
    },
    timeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 4,
    },
    timeText: {
        fontSize: 14,
    },
    mainControls: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
        gap: 32,
    },
    mainControlButton: {
        padding: 12,
    },
    playButton: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#FF0000',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#FF0000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
    },
    bottomControls: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    bottomButton: {
        padding: 12,
        position: 'relative',
    },
    repeatOneText: {
        position: 'absolute',
        top: 8,
        right: 8,
        fontSize: 10,
        fontWeight: 'bold',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 18,
        marginTop: 16,
    },
});

export default NowPlayingScreen;
