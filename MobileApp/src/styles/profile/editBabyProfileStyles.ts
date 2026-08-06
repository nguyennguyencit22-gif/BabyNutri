import { StyleSheet } from "react-native";
import type { AppColors } from '../../theme/colors';

const createStyles = (colors: AppColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },

    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 42,
    },

    deleteButton: {
        position: 'absolute',
        top: 60,
        right: 18,
        zIndex: 10,
    },

    updateButton: {
        width: 150,
        alignSelf: 'center',
        marginTop: 28,
        borderRadius: 30,
        backgroundColor: colors.primary,
    },

    buttonContent: {
        height: 52,
    },

    buttonText: {
        color: colors.onPrimary,
        fontSize: 17,
        fontWeight: '700',
    },
});

export default createStyles;
