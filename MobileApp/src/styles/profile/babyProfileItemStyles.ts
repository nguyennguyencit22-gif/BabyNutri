import { StyleSheet } from 'react-native';
import type { AppColors } from '../../theme/colors';

const createStyles = (colors: AppColors) => StyleSheet.create({
    container: {
        minHeight: 84,
        flexDirection: 'row',
        alignItems: 'center',

        borderBottomWidth: 1,
        borderBottomColor: colors.border,

        paddingHorizontal: 16,
        backgroundColor: colors.background,
    },

    avatar: {
        width: 42,
        height: 42,
        borderRadius: 21,

        alignItems: 'center',
        justifyContent: 'center',
    },

    avatarText: {
        color: colors.primary,
        fontSize: 24,
        fontWeight: '500',
    },

    info: {
        flex: 1,
        marginLeft: 14,
    },

    name: {
        color: colors.text,
        fontSize: 17,
        fontWeight: '500',
    },

    age: {
        marginTop: 4,
        color: colors.textSoft,
        fontSize: 14,
    },
    deleteAction: {
        width: 96,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.danger,
    },

    deleteText: {
        marginTop: 4,
        color: colors.onPrimary,
        fontSize: 13,
        fontWeight: '700',
    },
});

export default createStyles;
