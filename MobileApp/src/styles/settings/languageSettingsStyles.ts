import { StyleSheet } from 'react-native';
import type { AppColors } from '../../theme/colors';

const createStyles = (colors: AppColors) => StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },

    content: {
        paddingTop: 8,
        paddingBottom: 40,
    },

    optionRow: {
        minHeight: 60,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 28,
    },

    optionPressed: {
        opacity: 0.7,
    },

    radio: {
        width: 22,
        height: 22,
        borderWidth: 2,
        borderColor: colors.border,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
    },

    radioSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primary,
    },

    optionText: {
        marginLeft: 20,
        color: colors.text,
        fontSize: 16,
        fontWeight: '600',
    },

    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.25)',
    },

    loadingCard: {
        paddingHorizontal: 24,
        paddingVertical: 20,
        borderRadius: 16,
        backgroundColor: colors.surface,
        alignItems: 'center',
        gap: 12,
    },

    loadingText: {
        color: colors.text,
        fontSize: 14,
        fontWeight: '600',
    },
});

export default createStyles;
