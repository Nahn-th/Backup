import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';

const SettingsIcon = () => {
    const navigation = useNavigation();
    const { colors } = useApp();

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => navigation.navigate('Settings')}
        >
            <Icon name="settings-outline" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 8,
        marginRight: 8,
    },
});

export default SettingsIcon;
