import { StyleSheet } from 'react-native';
import type { AppColors } from '../../theme/colors';

const createStyles = (colors: AppColors) => StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },

    content: {
        paddingBottom: 40,
    },

    metricRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 28,
        paddingVertical: 20,
        backgroundColor: colors.surfaceAlt,
    },

    metricRowText: {
        color: colors.text,
        fontSize: 16,
        fontWeight: '600',
    },

    section: {
        marginTop: 24,
        paddingHorizontal: 28,
    },

    sectionTitle: {
        color: colors.textMuted,
        fontSize: 13,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
    },

    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },

    optionPressed: {
        opacity: 0.7,
    },

    radio: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderColor: colors.border,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },

    radioSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primary,
    },

    optionText: {
        marginLeft: 16,
        color: colors.text,
        fontSize: 16,
        fontWeight: '600',
    },

    divider: {
        marginTop: 20,
        height: 1,
        backgroundColor: colors.border,
    },
});

export default createStyles;
