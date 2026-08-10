import { StyleSheet } from 'react-native';
import type { AppColors } from '../../theme/colors';

const createStyles = (colors: AppColors) => StyleSheet.create({
    container: {
        minHeight: 66,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',

        borderBottomWidth: 1,
        borderBottomColor: colors.border,

        paddingHorizontal: 8,
    },

    pressed: {
        opacity: 0.65,
    },

    textContent: {
        flex: 1,
    },

    label: {
        color: colors.text,
        fontSize: 17,
    },

    summary: {
        marginTop: 4,
        color: colors.textSoft,
        fontSize: 13,
    },
});

export default createStyles;
