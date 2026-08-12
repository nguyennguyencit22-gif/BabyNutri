import { StyleSheet } from 'react-native';
import type { AppColors } from '../../theme/colors';

const createStyles = (colors: AppColors) => StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },

    backdrop: {
        ...StyleSheet.absoluteFill,
        backgroundColor: colors.overlay,
    },

    sheet: {
        marginHorizontal: 16,
        marginBottom: 18,

        borderRadius: 24,
        overflow: 'hidden',

        backgroundColor: colors.surface,

        elevation: 10,
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.18,
        shadowRadius: 10,
    },

    actionRow: {
        minHeight: 58,
        flexDirection: 'row',
        alignItems: 'center',

        borderBottomWidth: 1,
        borderBottomColor: colors.border,

        paddingHorizontal: 18,
        backgroundColor: colors.surface,
    },

    actionRowPressed: {
        backgroundColor: colors.surfaceAlt,
    },

    actionText: {
        marginLeft: 18,
        color: colors.text,
        fontSize: 16,
    },

    actionTextGroup: {
        marginLeft: 18,
    },

    actionSubtitle: {
        marginTop: 2,
        color: colors.textSoft,
        fontSize: 13,
    },
});

export default createStyles;
