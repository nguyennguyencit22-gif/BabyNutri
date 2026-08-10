import { StyleSheet } from 'react-native';
import type { AppColors } from '../../theme/colors';

const createStyles = (colors: AppColors) => StyleSheet.create({
    sectionLabel: {
        marginTop: 24,
        marginBottom: 12,
        color: colors.text,
        fontSize: 20,
        fontWeight: '700',
    },

    unitRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },

    unitOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },

    unitRadio: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },

    unitRadioSelected: {
        backgroundColor: colors.primary,
    },

    unitLabel: {
        color: colors.text,
        fontSize: 16,
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
});

export default createStyles;
