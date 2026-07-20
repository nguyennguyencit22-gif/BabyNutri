import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, } from 'react-native';

//ActivityIndicator = vòng tròn loading
// Pressable = nút bấm

// Kiểu dữ liệu của AppButtonProps
type AppButtonProps = {
    title: string;
    onPress: () => void; // thay thế cho hàm chạy khi bấm
    loading?: boolean;
    disabled?: boolean; // Khóa nút
};

function AppButton(
    { title, onPress, loading = false, disabled = false }: AppButtonProps) {
    const isDesabled = disabled || loading; // Người dùng bấm laoding thì khóa lại hk cho bấm liên tục
    return (
        // đây là nút disabled
        <Pressable
            disabled={isDesabled}
            onPress={onPress}
            style={({ pressed }) => [
                styles.button,
                pressed && !isDesabled ? styles.pressed : undefined,
                isDesabled ? styles.disabled : undefined,
            ]}>
            {loading ? (
                <ActivityIndicator color="#FFFFF" />
            ) : (
                <Text style={styles.title}>{title}</Text>
            )}

        </Pressable>
    );
}
const styles = StyleSheet.create(
    {
        button: {
            width: '100%',
            minHeight: 50,
            alignItems: 'center', // Canh giữa ngang
            justifyContent: 'center', // Canh giữa dọc
            borderRadius: 10,
            backgroundColor: "#2E7D32",
        },
        pressed: {
            opacity: 0.85, //Khi bấm mờ đi
        },
        disabled: {
            opacity: 0.55, //Nếu disable mờ hơn -> user biết hk bấm
        },
        title: {
            fontSize: 16,
            fontWeight: '700',
            color: '#FFFFF'
        },
    }
);

export default AppButton;
