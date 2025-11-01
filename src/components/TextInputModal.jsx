import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useApp } from '../context/AppContext';

const TextInputModal = ({
    visible,
    title,
    placeholder,
    defaultValue = '',
    onSubmit,
    onCancel,
}) => {
    const { colors } = useApp();
    const [text, setText] = useState(defaultValue);

    useEffect(() => {
        if (visible) {
            setText(defaultValue);
        }
    }, [visible, defaultValue]);

    const handleSubmit = () => {
        if (text.trim()) {
            onSubmit(text.trim());
            setText('');
        }
    };

    const handleCancel = () => {
        onCancel();
        setText('');
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleCancel}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.overlay}
            >
                <View style={[styles.container, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.title, { color: colors.textPrimary }]}>
                        {title}
                    </Text>

                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor: colors.background,
                                color: colors.textPrimary,
                                borderColor: colors.border,
                            },
                        ]}
                        placeholder={placeholder}
                        placeholderTextColor={colors.textSecondary}
                        value={text}
                        onChangeText={setText}
                        autoFocus
                        onSubmitEditing={handleSubmit}
                    />

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: colors.border }]}
                            onPress={handleCancel}
                        >
                            <Text style={[styles.buttonText, { color: colors.textPrimary }]}>
                                Cancel
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: colors.primary }]}
                            onPress={handleSubmit}
                        >
                            <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: '85%',
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        marginBottom: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    button: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

export default TextInputModal;
