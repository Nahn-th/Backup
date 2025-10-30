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
        Alert.prompt(
            'Create Genre',
            'Enter genre name',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Create',
                    onPress: text => {
                        if (text && text.trim()) {
                            const id = createGenre(text.trim());
                            if (id) {
                                loadGenres();
                            } else {
                                Alert.alert(
                                    'Error',
                                    'Genre already exists or failed to create.',
                                );
                            }
                        }
                    },
                },
            ],
            'plain-text',
        );
    };

    const handleGenrePress = genre => {
        navigation.navigate('GenreDetail', { genre });
    };

    const handleLongPress = genre => {
        Alert.alert(genre.name, 'Choose an action', [
            {
                text: 'Edit',
                onPress: () => {
                    Alert.prompt(
                        'Edit Genre',
                        'Enter new name',
                        [
                            { text: 'Cancel', style: 'cancel' },
                            {
                                text: 'Save',
                                onPress: text => {
                                    if (text && text.trim()) {
                                        updateGenre(genre.id, text.trim(), genre.cover_image_path);
                                        loadGenres();
                                    }
                                },
                            },
                        ],
                        'plain-text',
                        genre.name,
                    );
                },
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
    // List Layout
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
    // Grid Layout
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
