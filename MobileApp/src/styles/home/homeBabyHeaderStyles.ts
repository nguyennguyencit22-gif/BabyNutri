import { StyleSheet } from 'react-native';
import type { AppColors } from '../../theme/colors';

const createStyles = (colors: AppColors) => StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',

        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: colors.borderDashedPrimary,
        borderRadius: 20,

        marginHorizontal: 16,
        marginTop: 12,
        marginBottom: 8,
        paddingHorizontal: 18,
        paddingVertical: 14,
        backgroundColor: colors.surface,
    },

    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },

    avatar: {
        elevation: 4,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: colors.borderDashedPrimary,
        borderRadius: 25,
    },

    textContainer: {
        marginLeft: 14,
    },

    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    babyName: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.primary,
    },

    arrow: {
        marginLeft: 8,
        fontSize: 15,
        color: colors.textSoft,
    },

    babyAge: {
        marginTop: 4,
        fontSize: 15,
        color: colors.textSoft,
    },

    rightActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    profileDot: {
        width: 44,
        height: 44,
        borderRadius: 22,
        marginLeft: 10,
        backgroundColor: colors.primarySoft,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: colors.borderDashedPrimary,
    },
});

export default createStyles;
