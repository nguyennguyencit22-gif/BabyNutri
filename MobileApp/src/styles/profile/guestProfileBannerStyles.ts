import {
    StyleSheet,
} from 'react-native';
import type { AppColors } from '../../theme/colors';

const createStyles = (colors: AppColors) => StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginTop: 12,
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderRadius: 18,
        alignItems: 'center',
        backgroundColor: colors.primarySoft,
    },

    title: {
        color: colors.text,
        fontSize: 17,
        fontWeight: '700',
    },

    description: {
        marginTop: 8,
        color: colors.textSoft,
        fontSize: 14,
        lineHeight: 21,
        textAlign: 'center',
    },

    loginButton: {
        marginTop: 12,
        minWidth: 96,
        paddingHorizontal: 20,
        paddingVertical: 9,
        borderRadius: 22,
        alignItems: 'center',
        backgroundColor: colors.surface,
    },

    loginButtonPressed: {
        opacity: 0.75,
    },

    loginButtonText: {
        color: colors.text,
        fontSize: 14,
        fontWeight: '700',
    },
});

export default createStyles;
