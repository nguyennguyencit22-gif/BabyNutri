import { StyleSheet } from "react-native";
import type { AppColors } from '../../theme/colors';

const createStyles = (colors: AppColors) => StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    container: {
        flex: 1,
        padding: 24,
    },
    progressBackground: {
        height: 8,
        borderRadius: 8,
        backgroundColor: colors.border,
        overflow: 'hidden',
    },
    progressValue: {
        height: '100%',
        borderRadius: 8,
        backgroundColor: colors.primary,
    },
    stepText: {
        marginTop: 12,
        color: colors.textSoft,
        fontSize: 14,
    },
    questionContainer: {
        flex: 1,
    },
    questionContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingVertical: 16,
    },
    question: {
        marginBottom: 28,
        color: colors.text,
        fontSize: 28,
        fontWeight: '700',
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        backgroundColor: colors.surface,
        color: colors.text,
    },
    optionButton: {
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 14,
        padding: 16,
        backgroundColor: colors.surface,
    },
    optionButtonSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primarySoft,
    },
    optionText: {
        color: colors.text,
        fontSize: 16,
    },
    optionTextSelected: {
        color: colors.primary,
        fontWeight: '700',
    },
    footer: {
        flexDirection: 'row',
        gap: 12,
    },
    backButton: {
        flex: 1,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.primary,
        borderRadius: 14,
        paddingVertical: 15,
    },
    backButtonText: {
        color: colors.primary,
        fontSize: 16,
        fontWeight: '600',
    },
    nextButton: {
        flex: 2,
        alignItems: 'center',
        borderRadius: 14,
        paddingVertical: 15,
        backgroundColor: colors.primary,
    },
    nextButtonText: {
        color: colors.onPrimary,
        fontSize: 16,
        fontWeight: '700',
    },
    dateDescription: {
        marginTop: 110,
        marginBottom: 36,
        paddingHorizontal: 24,
        color: colors.textSoft,
        fontSize: 13,
        lineHeight: 18,
        textAlign: 'center',
    },

    datePickerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },

    datePickerBox: {
        flex: 1,
        height: 52,
        justifyContent: 'center',
        overflow: 'hidden',
        borderWidth: 1.3,
        borderColor: colors.border,
        borderRadius: 8,
        backgroundColor: colors.background,
    },

    datePicker: {
        width: '100%',
        height: 52,
        color: colors.text,
    },

    agePreview: {
        marginTop: 22,
        color: colors.primary,
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
});
export default createStyles;
