import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import Icon from './AppIcon';
import { useAlertStore } from '../../stores/useAlertStore';
import type { AppAlertIcon } from '../../stores/useAlertStore';
import { useAppTheme } from '../../theme/useAppTheme';
import type { AppColors } from '../../theme/colors';

const ICON_CONFIG: Record<AppAlertIcon, { source: string; color: string; bg: string }> = {
    success: { source: 'check-circle-outline', color: '#16A34A', bg: '#DCFCE7' },
    error: { source: 'alert-circle-outline', color: '#EF4444', bg: '#FEE2E2' },
    warning: { source: 'alert-circle-outline', color: '#D97706', bg: '#FEF3C7' },
    info: { source: 'help-circle-outline', color: '#0284C7', bg: '#E0F2FE' },
    heart: { source: 'heart', color: '#FF5F70', bg: '#FFE2E6' },
    star: { source: 'star', color: '#F59E0B', bg: '#FEF3C7' },
    baby: { source: 'sparkles', color: '#FF5F70', bg: '#FFE2E6' },
};

// Themed replacement for the OS Alert dialog — mount once at the app root
// (see App.tsx). Fed imperatively via src/utils/appAlert.ts, so any screen
// can call appAlert.show(...) instead of Alert.alert(...) to get this look.
const AppAlert: React.FC = () => {
    const { colors, isDark } = useAppTheme();
    const styles = React.useMemo(() => createStyles(colors), [colors]);
    const { visible, title, message, buttons, icon, hide } = useAlertStore();

    const scaleAnim = useRef(new Animated.Value(0.85)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            scaleAnim.setValue(0.85);
            opacityAnim.setValue(0);
            Animated.parallel([
                Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 22, bounciness: 8 }),
                Animated.timing(opacityAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
            ]).start();
        }
    }, [visible, scaleAnim, opacityAnim]);

    const handlePress = (onPress?: () => void) => {
        hide();
        onPress?.();
    };

    const iconConfig = icon ? ICON_CONFIG[icon] : null;

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={hide}>
            <View style={styles.overlay}>
                <Animated.View
                    style={[
                        styles.card,
                        { opacity: opacityAnim, transform: [{ scale: scaleAnim }] },
                    ]}>

                    {iconConfig && (
                        <View style={[styles.iconCircle, { backgroundColor: isDark ? `${iconConfig.color}33` : iconConfig.bg }]}>
                            <Icon source={iconConfig.source} size={28} color={iconConfig.color} />
                        </View>
                    )}

                    <Text style={styles.title}>{title}</Text>

                    {!!message && (
                        <Text style={styles.message}>{message}</Text>
                    )}

                    <View style={[styles.buttonRow, buttons.length > 2 && styles.buttonColumn]}>
                        {buttons.map((btn, index) => {
                            const isCancel = btn.style === 'cancel';
                            const isDestructive = btn.style === 'destructive';
                            const isPrimary = !isCancel && !isDestructive;

                            return (
                                <Pressable
                                    key={`${btn.text}-${index}`}
                                    onPress={() => handlePress(btn.onPress)}
                                    style={({ pressed }) => [
                                        styles.button,
                                        isPrimary && styles.buttonPrimary,
                                        isCancel && styles.buttonCancel,
                                        isDestructive && styles.buttonDestructive,
                                        pressed && styles.buttonPressed,
                                    ]}>
                                    <Text
                                        style={[
                                            styles.buttonText,
                                            isPrimary && styles.buttonTextPrimary,
                                            isCancel && styles.buttonTextCancel,
                                            isDestructive && styles.buttonTextDestructive,
                                        ]}>
                                        {btn.text}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

const createStyles = (colors: AppColors) => StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: colors.overlayStrong,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 28,
    },
    card: {
        width: '100%',
        maxWidth: 340,
        backgroundColor: colors.surface,
        borderRadius: 24,
        paddingTop: 24,
        paddingBottom: 18,
        paddingHorizontal: 22,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 8 },
        elevation: 10,
    },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 14,
    },
    title: {
        fontSize: 18,
        fontWeight: '800',
        color: colors.text,
        textAlign: 'center',
    },
    message: {
        fontSize: 14,
        color: colors.textSoft,
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        marginTop: 22,
        width: '100%',
    },
    buttonColumn: {
        flexDirection: 'column',
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surfaceAlt,
    },
    buttonPrimary: {
        backgroundColor: colors.primary,
    },
    buttonCancel: {
        backgroundColor: colors.surfaceAlt,
    },
    buttonDestructive: {
        backgroundColor: colors.dangerSoft,
    },
    buttonPressed: {
        opacity: 0.8,
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.text,
    },
    buttonTextPrimary: {
        color: colors.onPrimary,
    },
    buttonTextCancel: {
        color: colors.textSoft,
    },
    buttonTextDestructive: {
        color: colors.danger,
    },
});

export default AppAlert;
