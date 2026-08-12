import { StyleSheet } from 'react-native';
import type { AppColors } from '../../theme/colors';

const createStyles = (colors: AppColors) => StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-start',
    },

    backdrop: {
        ...StyleSheet.absoluteFill,
        backgroundColor: colors.overlay,
    },

    modalCard: {
        maxHeight: 360,

        marginTop: 92,
        marginHorizontal: 20,

        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: colors.borderDashedPrimary,

        borderRadius: 24,
        paddingHorizontal: 16,
        paddingTop: 18,
        paddingBottom: 10,

        backgroundColor: colors.surface,

        elevation: 12,
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.18,
        shadowRadius: 12,
    },

    title: {
        marginBottom: 10,
        color: colors.text,
        fontSize: 19,
        fontWeight: '700',
    },

    babyRow: {
        minHeight: 72,
        flexDirection: 'row',
        alignItems: 'center',

        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: colors.borderDashed,

        paddingHorizontal: 12,
        marginVertical: 4,
        borderRadius: 16,
        backgroundColor: colors.surface,
    },

    babyRowSelected: {
        backgroundColor: colors.surfaceAlt,
        borderColor: colors.borderDashedPrimary,
    },

    babyRowPressed: {
        opacity: 0.75,
    },

    avatar: {
        elevation: 3,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: colors.borderDashedPrimary,
        borderRadius: 22,
    },

    avatarLabel: {
        color: colors.onPrimary,
        fontSize: 24,
        fontWeight: '700',
    },

    babyInfo: {
        flex: 1,
        marginLeft: 14,
    },

    babyName: {
        color: colors.text,
        fontSize: 18,
        fontWeight: '600',
    },

    babyNameSelected: {
        color: colors.primary,
    },

    babyAge: {
        marginTop: 4,
        color: colors.textSoft,
        fontSize: 14,
    },
});

export default createStyles;
