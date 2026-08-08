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
        minHeight: 92,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 32,
    },

    optionPressed: {
        opacity: 0.7,
    },

    radio: {
        width: 30,
        height: 30,
        borderWidth: 3,
        borderColor: colors.border,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },

    radioSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primary,
    },

    optionText: {
        marginLeft: 24,
        color: colors.text,
        fontSize: 24,
        fontWeight: '700',
    },
});

export default createStyles;
