import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useApp } from '../context/AppContext';

const SearchBar = ({ placeholder = 'Search...', value, onChangeText, onSearch }) => {
    const { colors } = useApp();
    const [localValue, setLocalValue] = useState(value || '');
    const [debounceTimer, setDebounceTimer] = useState(null);

    useEffect(() => {
        setLocalValue(value || '');
    }, [value]);

    const handleChange = (text) => {
        setLocalValue(text);

        // Clear existing timer
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        // Set new debounce timer (300ms)
        const timer = setTimeout(() => {
            onChangeText(text);
            if (onSearch) {
                onSearch(text);
            }
        }, 300);

        setDebounceTimer(timer);
    };

    const handleClear = () => {
        setLocalValue('');
        onChangeText('');
        if (onSearch) {
            onSearch('');
        }
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
            <Icon name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                placeholder={placeholder}
                placeholderTextColor={colors.textSecondary}
                value={localValue}
                onChangeText={handleChange}
            />
            {localValue.length > 0 && (
                <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
                    <Icon name="close-circle" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 44,
        marginHorizontal: 16,
        marginVertical: 8,
    },
    searchIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 16,
    },
    clearButton: {
        padding: 4,
    },
});

export default SearchBar;
