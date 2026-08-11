import { StyleSheet } from 'react-native';
import type { AppColors } from '../../theme/colors';

const createStyles = (colors: AppColors) => StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },

    backdrop: {
        ...StyleSheet.absoluteFill,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
    },

    sheet: {
        marginHorizontal: 14,
        marginBottom: 20,
        paddingHorizontal: 14,
        paddingTop: 10,
        paddingBottom: 14,

        borderRadius: 24,
        overflow: 'hidden',

        backgroundColor: '#FFFFFF',

        elevation: 8,
        shadowColor: '#FF5F70',
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        borderWidth: 1,
        borderColor: '#FFEFEA',
    },

    dragHandle: {
        width: 36,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#CBD5E1',
        alignSelf: 'center',
        marginBottom: 12,
    },

    actionRow: {
        minHeight: 52,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        marginVertical: 4,
        paddingHorizontal: 14,
        paddingVertical: 10,

        borderWidth: 1,
        borderColor: '#F8FAFC',
        backgroundColor: '#FFFFFF',

        elevation: 1,
        shadowColor: '#FF5F70',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.04,
        shadowRadius: 4,
    },

    actionRowPressed: {
        backgroundColor: '#FFF0F2',
        borderColor: '#FFE4E6',
        elevation: 4,
        shadowOpacity: 0.15,
        shadowRadius: 8,
        transform: [{ scale: 0.988 }],
    },

    iconContainer: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#FFF0F2',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },

    actionText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1E293B',
    },

    actionTextGroup: {
        flex: 1,
    },

    actionSubtitle: {
        marginTop: 2,
        fontSize: 12,
        fontWeight: '500',
        color: '#64748B',
    },
});

export default createStyles;
