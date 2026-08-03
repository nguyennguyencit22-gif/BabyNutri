import { StyleSheet } from 'react-native';
import type { AppColors } from '../../theme/colors';

const createStyles = (colors: AppColors) => StyleSheet.create({
    container: {
        minHeight: 70,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',

        marginTop: 24,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,

        paddingHorizontal: 8,
    },

    pressed: {
        opacity: 0.65,
    },

    label: {
        color: colors.text,
        fontSize: 17,
        fontWeight: '400',
    },

    date: {
        color: colors.text,
        fontSize: 17,
        fontWeight: '700',
    },
});

export default createStyles;
