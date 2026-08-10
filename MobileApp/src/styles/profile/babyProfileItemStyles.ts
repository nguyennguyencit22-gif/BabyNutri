import { StyleSheet } from 'react-native';
import type { AppColors } from '../../theme/colors';

const createStyles = (colors: AppColors) => StyleSheet.create({
    container: {
        minHeight: 84,
        flexDirection: 'row',
        alignItems: 'center',

        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: colors.borderDashedPrimary,
        borderRadius: 16,

        marginVertical: 4,
        marginHorizontal: 4,
        paddingHorizontal: 16,
        backgroundColor: colors.surfaceAlt,
    },

    avatar: {
        width: 46,
        height: 46,
        borderRadius: 23,

        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: colors.borderDashedPrimary,

        alignItems: 'center',
        justifyContent: 'center',
    },

    avatarText: {
        color: colors.primary,
        fontSize: 24,
        fontWeight: '600',
    },

    info: {
        flex: 1,
        marginLeft: 14,
    },

    name: {
        color: colors.text,
        fontSize: 17,
        fontWeight: '600',
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
        borderRadius: 14,
    },

    deleteText: {
        marginTop: 4,
        color: colors.onPrimary,
        fontSize: 13,
        fontWeight: '700',
    },
});

export default createStyles;
