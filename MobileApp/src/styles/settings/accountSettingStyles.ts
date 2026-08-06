import { StyleSheet } from "react-native";
import type { AppColors } from '../../theme/colors';

const createStyles = (colors: AppColors) => StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },

    profileCard: {
        minHeight: 250,
        flexDirection: 'row',
        alignItems: 'center',

        marginTop: 10,
        paddingHorizontal: 28,

        backgroundColor: colors.surface,
    },

    avatarWrapper: {
        position: 'relative',
    },

    avatar: {
        width: 88,
        height: 88,
        borderRadius: 44,
    },

    avatarFallback: {
        width: 88,
        height: 88,
        borderRadius: 44,

        alignItems: 'center',
        justifyContent: 'center',

        backgroundColor: colors.surfaceAlt,
    },

    avatarLetter: {
        color: colors.onPrimary,
        fontSize: 32,
        fontWeight: '700',
    },

    cameraButton: {
        position: 'absolute',
        right: -8,
        top: -6,

        width: 42,
        height: 42,
        borderRadius: 21,

        alignItems: 'center',
        justifyContent: 'center',

        borderWidth: 3,
        borderColor: colors.surface,
        backgroundColor: colors.surfaceAlt,
    },

    email: {
        flex: 1,
        marginLeft: 26,

        color: colors.text,
        fontSize: 20,
    },

    actionRow: {
        minHeight: 105,
        justifyContent: 'center',

        marginTop: 4,
        paddingHorizontal: 28,

        backgroundColor: colors.surface,
    },

    actionRowPressed: {
        backgroundColor: colors.surfaceAlt,
    },

    actionText: {
        color: colors.text,
        fontSize: 22,
        fontWeight: '700',
    },
});

export default createStyles;
