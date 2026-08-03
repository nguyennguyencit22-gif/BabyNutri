import { StyleSheet } from "react-native";
import type { AppColors } from '../../theme/colors';

const createStyles = (colors: AppColors) => StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },

    keyboardView: {
        flex: 1,
    },

    introContent: {
        flexGrow: 1,
        paddingHorizontal: 28,
        paddingBottom: 30,
    },

    illustration: {
        width: '100%',
        height: 300,
        marginTop: 10,
    },

    description: {
        marginTop: 20,
        color: colors.text,
        fontSize: 19,
        lineHeight: 28,
    },

    tipRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: 26,
    },

    tipIcon: {
        marginRight: 14,
        fontSize: 28,
    },

    tipText: {
        flex: 1,
        color: colors.text,
        fontSize: 18,
        lineHeight: 27,
    },

    divider: {
        height: 1,
        marginHorizontal: -28,
        marginTop: 34,
        backgroundColor: colors.border,
    },

    secondaryDescription: {
        marginTop: 30,
        color: colors.text,
        fontSize: 18,
        lineHeight: 28,
    },

    primaryButton: {
        alignSelf: 'center',
        width: 160,
        marginTop: 'auto',
        borderRadius: 30,
        backgroundColor: colors.primary,
    },

    buttonContent: {
        height: 56,
    },

    buttonLabel: {
        color: colors.onPrimary,
        fontSize: 18,
        fontWeight: '700',
    },

    codeContent: {
        flex: 1,
        paddingHorizontal: 24,
        paddingBottom: 34,
    },

    instruction: {
        marginTop: 40,
        color: colors.text,
        fontSize: 19,
        lineHeight: 28,
    },

    codeInput: {
        marginTop: 32,
        backgroundColor: colors.surface,
    },

    inputOutline: {
        borderRadius: 28,
    },

    inputContent: {
        minHeight: 60,
        paddingHorizontal: 18,
        fontSize: 16,
        fontWeight: '600',
    },

    errorText: {
        marginTop: 8,
        marginLeft: 16,
        color: colors.danger,
        fontSize: 13,
    },
    activateButton: {
        width: 180,
        alignSelf: 'center',
        marginTop: 'auto',
        borderRadius: 30,
        backgroundColor: colors.primary,
    },

    activateButtonDisabled: {
        backgroundColor: colors.primarySoft,
    },
});

export default createStyles;
