import { StyleSheet } from "react-native";
import type { AppColors } from '../../theme/colors';

const createStyles = (colors: AppColors) => StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },

    content: {
        paddingTop: 18,
    },

    optionRow: {
        minHeight: 80,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: colors.borderDashed,
        borderRadius: 16,
        marginHorizontal: 16,
        marginVertical: 6,
        backgroundColor: colors.surface,
    },

    optionPressed: {
        opacity: 0.7,
    },

    radio: {
        width: 30,
        height: 30,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: colors.borderDashedPrimary,
        borderRadius: 15,
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
        fontSize: 20,
        fontWeight: '700',
    },
});

export default createStyles;
