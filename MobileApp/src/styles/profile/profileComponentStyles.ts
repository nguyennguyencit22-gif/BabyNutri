import { StyleSheet } from 'react-native';
import type { AppColors } from '../../theme/colors';

const createStyles = (colors: AppColors) => StyleSheet.create({
    //Header
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',

        paddingTop: 12,
        paddingBottom: 0,
    },

    backButton: {
        position: 'absolute',
        left: 0,
    },

    title: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.text,
    },
    //Header

    //Profile Card
    card: {
        marginHorizontal: 10,
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 18,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: colors.borderDashedPrimary,
        borderRadius: 18,
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: colors.surfaceAlt,
    },

    avatarWrapper: {
        position: 'relative',
    },

    avatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: colors.surfaceAlt,
    },

    avatarFallback: {
        width: 90,
        height: 90,
        borderRadius: 45,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: colors.borderDashedPrimary,
    },

    avatarText: {
        color: colors.onPrimary,
        fontSize: 34,
        fontWeight: '700',
    },

    cameraButton: {
        position: 'absolute',
        right: -2,
        bottom: -2,
        width: 38,
        height: 38,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: colors.borderDashedPrimary,
        borderRadius: 19,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.secondary,
    },

    cameraButtonPressed: {
        opacity: 0.8,
        transform: [
            {
                scale: 0.95,
            },
        ],
    },

    userInfo: {
        flex: 1,
        marginLeft: 18,
    },

    name: {
        color: colors.text,
        fontSize: 22,
        fontWeight: '700',
    },

    email: {
        marginTop: 6,
        color: colors.textSoft,
        fontSize: 15,
    },
    //Profile Card

    // Menu Item
    containerMenu: {
        minHeight: 64,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',

        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: colors.borderDashed,
        borderRadius: 14,
        marginVertical: 4,
        marginHorizontal: 4,

        paddingHorizontal: 14,
        backgroundColor: colors.surface,
    },

    pressed: {
        opacity: 0.65,
    },

    leftContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },

    iconCircle: {
        width: 42,
        height: 42,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: colors.borderDashedPrimary,
        borderRadius: 21,

        alignItems: 'center',
        justifyContent: 'center',

        marginRight: 14,
        backgroundColor: colors.surfaceAlt,

        elevation: 2,
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.08,
        shadowRadius: 3,
    },

    titleMenu: {
        flexShrink: 1,
        color: colors.text,
        fontSize: 16,
        fontWeight: '500',
    },

    dangerTitle: {
        color: colors.danger,
    },
    //Menu Item
});

export default createStyles;
