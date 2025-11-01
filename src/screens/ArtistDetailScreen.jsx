import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Image,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import SongItem from '../components/SongItem';
import MiniPlayer from '../components/MiniPlayer';
import {
    getSongsByArtist,
    getAllPlaylists,
    addSongToPlaylist,
} from '../database/db';

const ArtistDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { artist } = route.params;
    const { colors, layout, playSong, playShuffled } = useApp();
    const [songs, setSongs] = useState([]);

    useEffect(() => {
        loadSongs();
    }, []);

    const loadSongs = () => {
        const artistSongs = getSongsByArtist(artist.id);
        setSongs(artistSongs);
    };

    const handlePlayAll = () => {
        if (songs.length > 0) {
            playSong(songs[0], songs);
        }
    };

    const handleShuffle = () => {
        if (songs.length > 0) {
            playShuffled(songs);
        }
    };

    const handleSongPress = song => {
        playSong(song, songs);
    };

    const handleLongPress = song => {
        Alert.alert(song.title, 'Choose an action', [
            {
                text: 'Add to Playlist',
                onPress: () => console.log('Add to playlist'),
            },
            { text: 'Edit Song Info', onPress: () => console.log('Edit song') },
            { text: 'Cancel', style: 'cancel' },
        ]);
    };

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
                    Artist
                </Text>
                <View style={styles.placeholder} />
            </View>

            <FlatList
                data={songs}
                keyExtractor={item => String(item.id)}
                ListHeaderComponent={
                    <View style={styles.headerContent}>
                        {artist.cover_image_path ? (
                            <Image
                                source={{ uri: artist.cover_image_path }}
                                style={styles.avatar}
                            />
                        ) : (
                            <View
                                style={[
                                    styles.avatarPlaceholder,
                                    { backgroundColor: colors.surface },
                                ]}
                            >
                                <Icon name="person" size={100} color={colors.iconInactive} />
                            </View>
                        )}

                        <Text style={[styles.artistName, { color: colors.textPrimary }]}>
                            {artist.name}
                        </Text>

                        <Text style={[styles.songCount, { color: colors.textSecondary }]}>
                            {songs.length} {songs.length === 1 ? 'song' : 'songs'}
                        </Text>

                        {songs.length > 0 && (
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={[
                                        styles.actionButton,
                                        { backgroundColor: colors.primary },
                                    ]}
                                    onPress={handlePlayAll}
                                >
                                    <Icon name="play" size={20} color="#FFFFFF" />
                                    <Text style={styles.actionButtonText}>Play</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.actionButton,
                                        { backgroundColor: colors.primary },
                                    ]}
                                    onPress={handleShuffle}
                                >
                                    <Icon name="shuffle" size={20} color="#FFFFFF" />
                                    <Text style={styles.actionButtonText}>Shuffle</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                }
                renderItem={({ item }) => (
                    <SongItem
                        song={item}
                        layout={layout}
                        onPress={() => handleSongPress(item)}
                        onLongPress={() => handleLongPress(item)}
                    />
                )}
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
        alignItems: 'center',
        paddingVertical: 24,
        paddingHorizontal: 16,
    },
    avatar: {
        width: 200,
        height: 200,
        borderRadius: 100,
        marginBottom: 16,
    },
    avatarPlaceholder: {
        width: 200,
        height: 200,
        borderRadius: 100,
        marginBottom: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    artistName: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    songCount: {
        fontSize: 16,
        marginBottom: 24,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
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
    },
});

export default ArtistDetailScreen;
