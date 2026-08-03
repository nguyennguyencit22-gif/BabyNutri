import { StyleSheet } from "react-native";
import type { AppColors } from '../../theme/colors';

const createStyles = (colors: AppColors) => StyleSheet.create({
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 120,
    },
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },

    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },

    title: {
        color: colors.text,
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
    },

    profileCard: {
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 20,
        padding: 20,
        backgroundColor: colors.surfaceAlt,
    },

    avatar: {
        width: 78,
        height: 78,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 39,
        backgroundColor: colors.primary,
    },

    avatarText: {
        color: colors.onPrimary,
        fontSize: 30,
        fontWeight: '700',
    },

    userInfo: {
        marginLeft: 16,
        flex: 1,
    },

    name: {
        color: colors.text,
        fontSize: 22,
        fontWeight: '700',
    },

    email: {
        marginTop: 6,
        color: colors.textSoft,
        fontSize: 15,
    },

    testText: {
        marginTop: 30,
        color: colors.textSoft,
        fontSize: 16,
        textAlign: 'center',
    },

    sectionLabel: {
        marginTop: 24,
        marginBottom: 8,
        marginLeft: 8,

        color: colors.textMuted,
        fontSize: 13,
        fontWeight: '500',
    },

    otherSettingLabel: {
        marginTop: 28,
        marginBottom: 8,
        marginLeft: 8,

        color: colors.textMuted,
        fontSize: 12,
        fontWeight: '500',
    },
    deactiveAccount: {
        marginBottom: 10
    }
});

export default createStyles;
