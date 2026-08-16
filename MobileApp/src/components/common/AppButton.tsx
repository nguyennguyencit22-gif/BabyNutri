import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

type AppButtonProps = {
    title: string;
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
};

function AppButton({ title, onPress, loading = false, disabled = false }: AppButtonProps) {
    const isDisabled = disabled || loading;
    return (
        <Pressable
            disabled={isDisabled}
            onPress={onPress}
            style={({ pressed }) => [
                styles.button,
                pressed && !isDisabled ? styles.pressed : undefined,
                isDisabled ? styles.disabled : undefined,
            ]}>
            {loading ? (
                <ActivityIndicator color="#FFFFFF" />
            ) : (
                <Text style={styles.title}>{title}</Text>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        width: '100%',
        minHeight: 50,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        backgroundColor: "#2E7D32",
    },
    pressed: {
        opacity: 0.85,
    },
    disabled: {
        opacity: 0.55,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});

export default AppButton;
