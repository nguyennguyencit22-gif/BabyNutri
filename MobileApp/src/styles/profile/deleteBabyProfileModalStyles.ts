import { StyleSheet } from 'react-native';
import type { AppColors } from '../../theme/colors';

const createStyles = (colors: AppColors) => StyleSheet.create({
    overlay: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },

    backdrop: {
        ...StyleSheet.absoluteFill,
        backgroundColor: colors.overlayStrong,
    },

    modalCard: {
        width: '100%',
        maxWidth: 420,

        paddingHorizontal: 28,
        paddingTop: 30,
        paddingBottom: 24,

        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: colors.borderDashedPrimary,

        borderRadius: 28,
        backgroundColor: colors.surface,

        elevation: 12,
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.2,
        shadowRadius: 16,
    },

    warningTitle: {
        color: colors.primary,
        fontSize: 25,
        fontWeight: '700',
        textAlign: 'center',
    },

    mainMessage: {
        marginTop: 24,
        color: colors.text,
        fontSize: 24,
        lineHeight: 31,
        fontWeight: '700',
        textAlign: 'center',
    },

    recordText: {
        marginTop: 22,
        color: colors.text,
        fontSize: 19,
        textAlign: 'center',
    },

    description: {
        marginTop: 22,
        color: colors.text,
        fontSize: 18,
        lineHeight: 26,
        fontWeight: '600',
        textAlign: 'center',
    },

    confirmRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 30,
    },

    checkbox: {
        width: 30,
        height: 30,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: colors.borderDashedPrimary,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surface,
    },

    checkboxSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primary,
    },

    confirmText: {
        marginLeft: 18,
        color: colors.text,
        fontSize: 20,
        fontWeight: '700',
    },

    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 34,
    },

    actionButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 46,
        borderRadius: 14,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: colors.borderDashed,
        marginHorizontal: 4,
    },

    cancelText: {
        color: colors.text,
        fontSize: 20,
        fontWeight: '700',
    },

    deleteText: {
        color: colors.primary,
        fontSize: 20,
        fontWeight: '700',
    },

    deleteTextDisabled: {
        color: colors.textMuted,
    },
});

export default createStyles;
